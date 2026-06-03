"""Training loop for the domain-adversarial probe."""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from typing import Dict, List, Optional, Tuple
import logging
from tqdm import tqdm
from pathlib import Path

try:
    import wandb
except ImportError:
    wandb = None

logger = logging.getLogger(__name__)


class SupConLoss(nn.Module):
    """Supervised Contrastive Learning Loss."""

    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.temperature = temperature

    def forward(
        self,
        features: torch.Tensor,
        labels: torch.Tensor,
    ) -> torch.Tensor:
        """
        Contrastive loss.

        Args:
            features: (batch_size, feature_dim)
            labels: (batch_size,)

        Returns:
            Loss value
        """
        batch_size = features.shape[0]
        
        # Normalize features
        features = F.normalize(features, dim=1)
        
        # Compute similarity matrix
        similarity_matrix = torch.mm(features, features.t())  # (batch_size, batch_size)
        
        # Create mask for same-label pairs
        mask = labels.unsqueeze(1) == labels.unsqueeze(0)
        
        # Remove self-similarity
        mask.fill_diagonal_(False)
        
        # Compute loss
        exp_similarity = torch.exp(similarity_matrix / self.temperature)
        
        # Sum of positives
        pos_sum = (exp_similarity * mask).sum(dim=1)
        
        # Sum of all
        all_sum = exp_similarity.sum(dim=1)
        
        # Contrastive loss
        loss = -torch.log((pos_sum / all_sum) + 1e-10).mean()
        
        return loss


class Trainer:
    """Trainer for the domain-adversarial hallucination probe."""

    def __init__(
        self,
        model: nn.Module,
        device: str = "cuda",
        learning_rate: float = 1e-4,
        weight_decay: float = 0.01,
        use_wandb: bool = False,
        project_name: str = "halluprobe",
        run_name: str = "training-run",
    ):
        """
        Initialize trainer.

        Args:
            model: Model to train
            device: Device to use
            learning_rate: Learning rate
            weight_decay: Weight decay
            use_wandb: Whether to use Weights & Biases
            project_name: W&B project name
            run_name: W&B run name
        """
        self.model = model.to(device)
        self.device = device
        self.learning_rate = learning_rate
        self.weight_decay = weight_decay
        
        # Optimizer
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=learning_rate,
            weight_decay=weight_decay,
        )
        
        # Loss functions
        self.hallucination_loss = nn.BCEWithLogitsLoss()
        self.domain_loss = nn.CrossEntropyLoss()
        self.contrastive_loss = SupConLoss(temperature=0.07)
        
        # W&B tracking
        self.use_wandb = use_wandb and wandb is not None
        if self.use_wandb:
            wandb.init(
                project=project_name,
                name=run_name,
                config={
                    "learning_rate": learning_rate,
                    "weight_decay": weight_decay,
                },
            )

    def compute_loss(
        self,
        hallucination_logits: torch.Tensor,
        domain_logits: torch.Tensor,
        features: torch.Tensor,
        labels: torch.Tensor,
        domain_ids: torch.Tensor,
        lambda_domain: float = 0.1,
        gamma_contrastive: float = 0.05,
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        """
        Compute compound loss.

        Args:
            hallucination_logits: (batch_size, 1)
            domain_logits: (batch_size, num_domains)
            features: (batch_size, feature_dim)
            labels: (batch_size,)
            domain_ids: (batch_size,)
            lambda_domain: Domain loss weight
            gamma_contrastive: Contrastive loss weight

        Returns:
            Total loss and loss dict
        """
        # Hallucination loss
        loss_halluc = self.hallucination_loss(
            hallucination_logits.squeeze(-1),
            labels.float(),
        )
        
        # Domain loss
        loss_domain = self.domain_loss(domain_logits, domain_ids)
        
        # Contrastive loss
        loss_contrastive = self.contrastive_loss(features, labels.long())
        
        # Compound loss
        total_loss = (
            loss_halluc
            + lambda_domain * loss_domain
            + gamma_contrastive * loss_contrastive
        )
        
        loss_dict = {
            "loss/hallucination": loss_halluc.item(),
            "loss/domain": loss_domain.item(),
            "loss/contrastive": loss_contrastive.item(),
            "loss/total": total_loss.item(),
        }
        
        return total_loss, loss_dict

    def train_epoch(
        self,
        train_loader: DataLoader,
        hidden_state_extractor,
        lambda_domain: float = 0.1,
        gamma_contrastive: float = 0.05,
    ) -> Dict[str, float]:
        """
        Train for one epoch.

        Args:
            train_loader: Training data loader
            hidden_state_extractor: Extractor for hidden states
            lambda_domain: Domain loss weight
            gamma_contrastive: Contrastive loss weight

        Returns:
            Average losses for the epoch
        """
        self.model.train()
        epoch_losses = {
            "loss/hallucination": 0,
            "loss/domain": 0,
            "loss/contrastive": 0,
            "loss/total": 0,
        }
        
        pbar = tqdm(train_loader, desc="Training")
        
        for batch_idx, batch in enumerate(pbar):
            prompts = batch["prompt"]
            answers = batch["answer"]
            labels = batch["label"].to(self.device)
            domain_ids = batch["domain_id"].to(self.device)
            
            # Extract hidden states
            hidden_states_list = []
            for prompt, answer in zip(prompts, answers):
                hs = hidden_state_extractor.extract(prompt, answer)
                pooled = hidden_state_extractor.pool_hidden_states(hs, "mean")
                hs_tensor = torch.stack(list(pooled.values())).mean(dim=0)
                hidden_states_list.append(hs_tensor)
            
            hidden_states = torch.stack(hidden_states_list).to(self.device)
            
            # Forward pass
            output = self.model(hidden_states, return_features=True)
            
            # Compute loss
            loss, loss_dict = self.compute_loss(
                output["hallucination_logits"],
                output["domain_logits"],
                output["features"],
                labels,
                domain_ids,
                lambda_domain,
                gamma_contrastive,
            )
            
            # Backward pass
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()
            
            # Update running losses
            for key in epoch_losses:
                epoch_losses[key] += loss_dict[key]
            
            pbar.set_postfix({k: v / (batch_idx + 1) for k, v in epoch_losses.items()})

        # Average losses
        for key in epoch_losses:
            epoch_losses[key] /= len(train_loader)
        
        return epoch_losses

    def evaluate(
        self,
        val_loader: DataLoader,
        hidden_state_extractor,
        threshold: float = 0.5,
    ) -> Dict[str, float]:
        """
        Evaluate on validation set.

        Args:
            val_loader: Validation data loader
            hidden_state_extractor: Extractor for hidden states
            threshold: Classification threshold

        Returns:
            Metrics dict
        """
        self.model.eval()
        
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc="Evaluating"):
                prompts = batch["prompt"]
                answers = batch["answer"]
                labels = batch["label"].to(self.device)
                
                # Extract hidden states
                hidden_states_list = []
                for prompt, answer in zip(prompts, answers):
                    hs = hidden_state_extractor.extract(prompt, answer)
                    pooled = hidden_state_extractor.pool_hidden_states(hs, "mean")
                    hs_tensor = torch.stack(list(pooled.values())).mean(dim=0)
                    hidden_states_list.append(hs_tensor)
                
                hidden_states = torch.stack(hidden_states_list).to(self.device)
                
                # Forward pass
                output = self.model(hidden_states)
                probs = output["hallucination_probs"].squeeze(-1)
                
                all_preds.extend((probs >= threshold).cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        # Compute metrics
        from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
        
        f1 = f1_score(all_labels, all_preds)
        precision = precision_score(all_labels, all_preds, zero_division=0)
        recall = recall_score(all_labels, all_preds, zero_division=0)
        auc = roc_auc_score(all_labels, all_preds)
        
        metrics = {
            "eval/f1": f1,
            "eval/precision": precision,
            "eval/recall": recall,
            "eval/auc": auc,
        }
        
        return metrics

    def save_checkpoint(self, checkpoint_path: str):
        """Save model checkpoint."""
        Path(checkpoint_path).parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.model.state_dict(), checkpoint_path)
        logger.info(f"Saved checkpoint to {checkpoint_path}")

    def load_checkpoint(self, checkpoint_path: str):
        """Load model checkpoint."""
        self.model.load_state_dict(torch.load(checkpoint_path, map_location=self.device))
        logger.info(f"Loaded checkpoint from {checkpoint_path}")

    def log_metrics(self, metrics: Dict[str, float], step: int = None):
        """Log metrics to W&B."""
        if self.use_wandb:
            wandb.log(metrics, step=step)
