"""Training and evaluation script for the domain-adversarial hallucination probe.

Pipeline:
  1. Load TruthfulQA  (correct answers -> truthful=0, incorrect answers -> hallucinated=1)
  2. Group its 38 categories into 4 coarse domains; hold out some categories as
     out-of-domain (OOD) test set to measure cross-domain generalization.
  3. Extract pooled hidden-state features from the *frozen* LLM once and cache them
     to disk (this is the slow part; reruns are instant).
  4. Train only the small probe (encoder + hallucination head + adversarial domain
     head) with the compound loss: BCE + lambda*domain + gamma*contrastive.
  5. Evaluate on an in-domain held-out split and on the OOD categories.
  6. Save the probe checkpoint and a metrics report.
"""
import argparse
import json
import logging
import sys
import time
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset

sys.path.insert(0, str(Path(__file__).parent))

from core.config import Config
from core.extractor import HiddenStateExtractor
from core.model import DomainAdversarialProbe
from training.train import SupConLoss
from training.evaluate import EvaluationMetrics

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

NUM_DOMAINS = 4


def build_examples(max_per_question: int = 1):
    """Build labeled examples from TruthfulQA.

    Returns lists: prompts, answers, labels (0/1), categories (str).
    """
    from datasets import load_dataset

    logger.info("Loading TruthfulQA (truthfulqa/truthful_qa, generation)...")
    ds = load_dataset("truthfulqa/truthful_qa", "generation", split="validation")

    prompts, answers, labels, categories = [], [], [], []
    for ex in ds:
        q = ex["question"]
        cat = ex["category"]
        # Truthful (label 0)
        for ans in ex["correct_answers"][:max_per_question]:
            if ans and ans.strip():
                prompts.append(q); answers.append(ans); labels.append(0); categories.append(cat)
        # Hallucinated (label 1)
        for ans in ex["incorrect_answers"][:max_per_question]:
            if ans and ans.strip():
                prompts.append(q); answers.append(ans); labels.append(1); categories.append(cat)

    logger.info(f"Built {len(prompts)} examples across {len(set(categories))} categories")
    return prompts, answers, labels, categories


def assign_domains_and_split(categories, ood_every: int = 5):
    """Map 38 categories -> 4 domain ids, and mark some categories as OOD.

    Every `ood_every`-th category (sorted) is held out as out-of-domain.
    Returns: domain_ids (list[int]), is_ood (list[bool]).
    """
    unique = sorted(set(categories))
    domain_of = {c: i % NUM_DOMAINS for i, c in enumerate(unique)}
    ood_cats = {c for i, c in enumerate(unique) if i % ood_every == 0}
    domain_ids = [domain_of[c] for c in categories]
    is_ood = [c in ood_cats for c in categories]
    logger.info(f"Held out {len(ood_cats)}/{len(unique)} categories as OOD: {sorted(ood_cats)}")
    return domain_ids, is_ood


def extract_features(prompts, answers, config, cache_path: Path):
    """Extract pooled hidden-state vectors from the frozen LLM, with disk cache."""
    if cache_path.exists():
        logger.info(f"Loading cached features from {cache_path}")
        return torch.load(cache_path)

    logger.info("Extracting hidden-state features from frozen LLM (one-time, cached)...")
    extractor = HiddenStateExtractor(
        model_name=config.model.base_model,
        target_layers=config.model.hidden_layers,
        use_quantization=config.model.use_quantization,
        quantization_bits=config.model.quantization_bits,
        device=config.device,
    )
    feats = []
    t0 = time.time()
    for i, (p, a) in enumerate(zip(prompts, answers)):
        hs = extractor.extract(p, a)
        pooled = extractor.pool_hidden_states(hs, "mean")
        vec = torch.stack(list(pooled.values())).mean(dim=0).squeeze(0)  # (hidden_dim,)
        feats.append(vec.cpu())
        if (i + 1) % 100 == 0:
            rate = (time.time() - t0) / (i + 1)
            eta = rate * (len(prompts) - i - 1) / 60
            logger.info(f"  {i+1}/{len(prompts)} extracted  (ETA {eta:.1f} min)")
    extractor.cleanup()
    features = torch.stack(feats)  # (N, hidden_dim)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(features, cache_path)
    logger.info(f"Cached features {tuple(features.shape)} to {cache_path}")
    return features


def evaluate(model, features, labels, device, name):
    model.eval()
    with torch.no_grad():
        out = model(features.to(device))
        probs = out["hallucination_probs"].squeeze(-1).cpu().numpy()
    metrics = EvaluationMetrics.compute_metrics(probs, labels.numpy(), 0.5, return_report=True)
    logger.info(
        f"[{name}] n={len(labels)}  F1={metrics['f1']:.4f}  "
        f"Acc={metrics['accuracy']:.4f}  AUC={metrics['auc_roc']:.4f}  "
        f"P={metrics['precision']:.4f}  R={metrics['recall']:.4f}"
    )
    return metrics


def main():
    parser = argparse.ArgumentParser(description="Train HalluProbe")
    parser.add_argument("--config", type=str, default="config.yaml")
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--dropout", type=float, default=None, help="Override probe dropout")
    parser.add_argument("--weight-decay", type=float, default=None, help="Override AdamW weight decay")
    parser.add_argument("--checkpoint", type=str, default="checkpoints/probe.pt")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    try:
        config = Config.from_yaml(args.config)
    except FileNotFoundError:
        logger.warning("Config not found, using defaults")
        config = Config()
    config.device = "cpu" if not torch.cuda.is_available() else config.device
    device = config.device
    if args.dropout is not None:
        config.probe.dropout_rate = args.dropout
    if args.weight_decay is not None:
        config.training.weight_decay = args.weight_decay

    # 1-2. Data + domains + OOD split
    prompts, answers, labels, categories = build_examples(max_per_question=1)
    domain_ids, is_ood = assign_domains_and_split(categories, ood_every=5)

    # 3. Features (cached)
    features = extract_features(prompts, answers, config, Path("outputs/truthfulqa_features.pt"))

    labels_t = torch.tensor(labels, dtype=torch.float32)
    domains_t = torch.tensor(domain_ids, dtype=torch.long)
    is_ood = np.array(is_ood)

    # Split: OOD categories -> test; remaining -> train/val (80/20)
    id_idx = np.where(~is_ood)[0]
    ood_idx = np.where(is_ood)[0]
    rng = np.random.default_rng(args.seed)
    rng.shuffle(id_idx)
    n_val = max(1, int(0.2 * len(id_idx)))
    val_idx, train_idx = id_idx[:n_val], id_idx[n_val:]
    logger.info(f"Splits: train={len(train_idx)}  in-domain-val={len(val_idx)}  OOD-test={len(ood_idx)}")

    f_train, y_train, d_train = features[train_idx], labels_t[train_idx], domains_t[train_idx]
    f_val, y_val = features[val_idx], labels_t[val_idx]
    f_ood, y_ood = features[ood_idx], labels_t[ood_idx]

    # 4. Probe
    model = DomainAdversarialProbe(
        input_dim=config.model.hidden_dim,
        num_domains=NUM_DOMAINS,
        encoder_hidden_dims=config.probe.encoder_hidden_dims,
        hallucination_head_dims=config.probe.hallucination_head_dims,
        domain_head_dims=config.probe.domain_head_dims,
        dropout_rate=config.probe.dropout_rate,
        gradient_reversal_alpha=1.0,
    ).to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate, weight_decay=config.training.weight_decay)
    bce = torch.nn.BCELoss()
    ce = torch.nn.CrossEntropyLoss()
    supcon = SupConLoss(temperature=config.loss.temperature)

    train_ds = TensorDataset(f_train, y_train, d_train)
    loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)

    logger.info("Training probe...")
    for epoch in range(args.epochs):
        model.train()
        tot = 0.0
        for fb, yb, db in loader:
            fb, yb, db = fb.to(device), yb.to(device), db.to(device)
            out = model(fb, return_features=True)
            loss_h = bce(out["hallucination_probs"].squeeze(-1), yb)
            loss_d = ce(out["domain_logits"], db)
            loss_c = supcon(out["features"], yb.long())
            loss = loss_h + config.loss.lambda_domain * loss_d + config.loss.gamma_contrastive * loss_c
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), config.training.max_grad_norm)
            optimizer.step()
            tot += loss.item()
        if (epoch + 1) % 10 == 0 or epoch == 0:
            logger.info(f"Epoch {epoch+1}/{args.epochs}  loss={tot/len(loader):.4f}")

    # 5. Evaluate
    logger.info("=" * 60)
    m_train = evaluate(model, f_train, y_train, device, "train")
    m_val = evaluate(model, f_val, y_val, device, "in-domain-val")
    m_ood = evaluate(model, f_ood, y_ood, device, "OOD-test")
    logger.info("=" * 60)

    # 6. Save checkpoint + metrics
    ckpt = Path(args.checkpoint)
    ckpt.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), ckpt)
    logger.info(f"Saved probe checkpoint to {ckpt}")

    report = {
        "dataset": "truthfulqa/truthful_qa (generation)",
        "base_model": config.model.base_model,
        "n_train": len(train_idx), "n_val": len(val_idx), "n_ood": len(ood_idx),
        "epochs": args.epochs,
        "metrics": {
            k: {mk: mv for mk, mv in m.items() if mk != "report"}
            for k, m in {"train": m_train, "in_domain_val": m_val, "ood_test": m_ood}.items()
        },
    }
    out_path = Path("outputs/metrics.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2))
    logger.info(f"Wrote metrics to {out_path}")


if __name__ == "__main__":
    main()
