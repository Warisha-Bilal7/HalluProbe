"""Evaluation framework for hallucination detection."""
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from typing import Dict, List, Tuple
import logging
from sklearn.metrics import (
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)
import numpy as np

logger = logging.getLogger(__name__)


class EvaluationMetrics:
    """Compute evaluation metrics."""

    @staticmethod
    def compute_metrics(
        predictions: np.ndarray,
        labels: np.ndarray,
        threshold: float = 0.5,
        return_report: bool = False,
    ) -> Dict[str, float]:
        """
        Compute metrics.

        Args:
            predictions: Predicted probabilities [0, 1]
            labels: Ground truth labels {0, 1}
            threshold: Classification threshold
            return_report: Whether to return classification report

        Returns:
            Dictionary of metrics
        """
        binary_preds = (predictions >= threshold).astype(int)
        
        metrics = {
            "f1": f1_score(labels, binary_preds, zero_division=0),
            "precision": precision_score(labels, binary_preds, zero_division=0),
            "recall": recall_score(labels, binary_preds, zero_division=0),
            "auc_roc": roc_auc_score(labels, predictions),
            "accuracy": (binary_preds == labels).mean(),
        }
        
        # Add confusion matrix
        tn, fp, fn, tp = confusion_matrix(labels, binary_preds).ravel()
        metrics["tn"] = int(tn)
        metrics["fp"] = int(fp)
        metrics["fn"] = int(fn)
        metrics["tp"] = int(tp)
        
        # Compute calibration metrics
        metrics.update(EvaluationMetrics.compute_calibration(predictions, labels))
        
        if return_report:
            metrics["report"] = classification_report(labels, binary_preds)
        
        return metrics

    @staticmethod
    def compute_calibration(
        predictions: np.ndarray,
        labels: np.ndarray,
        num_bins: int = 10,
    ) -> Dict[str, float]:
        """
        Compute calibration metrics.

        Args:
            predictions: Predicted probabilities [0, 1]
            labels: Ground truth labels {0, 1}
            num_bins: Number of bins for calibration

        Returns:
            Calibration metrics
        """
        bin_edges = np.linspace(0, 1, num_bins + 1)
        bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2
        
        bin_sums = np.zeros(num_bins)
        bin_true = np.zeros(num_bins)
        bin_total = np.zeros(num_bins)
        
        for i in range(num_bins):
            mask = (predictions >= bin_edges[i]) & (predictions < bin_edges[i + 1])
            bin_total[i] = mask.sum()
            if bin_total[i] > 0:
                bin_true[i] = labels[mask].sum()
                bin_sums[i] = predictions[mask].sum()
        
        # Expected calibration error
        valid_bins = bin_total > 0
        if valid_bins.sum() > 0:
            ece = np.abs(
                (bin_sums[valid_bins] / bin_total[valid_bins]) -
                (bin_true[valid_bins] / bin_total[valid_bins])
            ).mean()
        else:
            ece = 0.0
        
        return {"ece": float(ece)}

    @staticmethod
    def cross_domain_evaluation(
        all_predictions: Dict[str, Tuple[np.ndarray, np.ndarray]],
        threshold: float = 0.5,
    ) -> Dict[str, Dict[str, float]]:
        """
        Evaluate across multiple domains.

        Args:
            all_predictions: Dict mapping domain name to (predictions, labels)
            threshold: Classification threshold

        Returns:
            Dictionary mapping domain to metrics
        """
        results = {}
        
        for domain, (preds, labels) in all_predictions.items():
            metrics = EvaluationMetrics.compute_metrics(
                preds, labels, threshold, return_report=True
            )
            results[domain] = metrics
            
            logger.info(f"\n{domain.upper()} Results:")
            logger.info(f"  F1: {metrics['f1']:.4f}")
            logger.info(f"  Precision: {metrics['precision']:.4f}")
            logger.info(f"  Recall: {metrics['recall']:.4f}")
            logger.info(f"  AUC-ROC: {metrics['auc_roc']:.4f}")
            logger.info(f"  ECE: {metrics['ece']:.4f}")
        
        # Compute average metrics
        avg_metrics = {}
        for metric_name in results[list(results.keys())[0]].keys():
            if metric_name != "report":
                values = [results[d][metric_name] for d in results]
                avg_metrics[metric_name] = np.mean(values)
        
        results["average"] = avg_metrics
        
        return results


class Evaluator:
    """Evaluator for the hallucination probe."""

    def __init__(self, model, device: str = "cuda"):
        """
        Initialize evaluator.

        Args:
            model: Model to evaluate
            device: Device to use
        """
        self.model = model.to(device)
        self.device = device

    def evaluate_on_loader(
        self,
        data_loader: DataLoader,
        hidden_state_extractor,
        threshold: float = 0.5,
        domain_name: str = "unlabeled",
    ) -> Tuple[np.ndarray, np.ndarray, Dict[str, float]]:
        """
        Evaluate on a data loader.

        Args:
            data_loader: DataLoader with (prompt, answer, label) tuples
            hidden_state_extractor: Extractor for hidden states
            threshold: Classification threshold
            domain_name: Name of domain (for logging)

        Returns:
            Tuple of (predictions, labels, metrics)
        """
        self.model.eval()
        
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for batch in data_loader:
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
                probs = output["hallucination_probs"].squeeze(-1).cpu().numpy()
                
                all_preds.extend(probs)
                all_labels.extend(labels.cpu().numpy())
        
        all_preds = np.array(all_preds)
        all_labels = np.array(all_labels)
        
        metrics = EvaluationMetrics.compute_metrics(
            all_preds, all_labels, threshold, return_report=True
        )
        
        logger.info(f"\nEvaluation on {domain_name}:")
        logger.info(f"  Samples: {len(all_labels)}")
        logger.info(f"  F1: {metrics['f1']:.4f}")
        logger.info(f"  Precision: {metrics['precision']:.4f}")
        logger.info(f"  Recall: {metrics['recall']:.4f}")
        logger.info(f"  AUC-ROC: {metrics['auc_roc']:.4f}")
        
        return all_preds, all_labels, metrics

    def evaluate_artifact_free(
        self,
        in_domain_loader: DataLoader,
        ood_loaders: Dict[str, DataLoader],
        hidden_state_extractor,
        threshold: float = 0.5,
    ) -> Dict[str, Dict[str, float]]:
        """
        Artifact-free evaluation (controls for dataset artifacts).

        Args:
            in_domain_loader: In-domain validation set
            ood_loaders: Dict of OOD datasets
            hidden_state_extractor: Extractor for hidden states
            threshold: Classification threshold

        Returns:
            Results across domains
        """
        all_results = {}
        
        # Evaluate in-domain
        in_preds, in_labels, in_metrics = self.evaluate_on_loader(
            in_domain_loader,
            hidden_state_extractor,
            threshold,
            "in-domain",
        )
        all_results["in-domain"] = (in_preds, in_labels)
        
        # Evaluate OOD domains
        for domain_name, loader in ood_loaders.items():
            ood_preds, ood_labels, ood_metrics = self.evaluate_on_loader(
                loader,
                hidden_state_extractor,
                threshold,
                f"OOD-{domain_name}",
            )
            all_results[f"ood_{domain_name}"] = (ood_preds, ood_labels)
        
        # Cross-domain evaluation
        cross_domain_results = EvaluationMetrics.cross_domain_evaluation(
            all_results, threshold
        )
        
        return cross_domain_results
