"""Hallucination detection pipeline."""
import torch
import torch.nn as nn
from typing import Dict, Tuple, Optional, List
import logging
from pathlib import Path

from .extractor import HiddenStateExtractor
from .model import DomainAdversarialProbe
from .config import Config

logger = logging.getLogger(__name__)


class HalluProbePipeline:
    """End-to-end hallucination detection pipeline."""

    def __init__(
        self,
        config: Config,
        device: str = "cuda",
    ):
        """
        Initialize the pipeline.

        Args:
            config: Configuration object
            device: Device to use
        """
        self.config = config
        self.device = device

        # Initialize hidden state extractor
        logger.info("Initializing hidden state extractor...")
        self.extractor = HiddenStateExtractor(
            model_name=config.model.base_model,
            target_layers=config.model.hidden_layers,
            use_quantization=config.model.use_quantization,
            quantization_bits=config.model.quantization_bits,
            device=device,
        )

        # Initialize probe model
        logger.info("Initializing domain-adversarial probe...")
        self.probe = DomainAdversarialProbe(
            input_dim=config.model.hidden_dim,
            num_domains=config.probe.num_domains,
            encoder_hidden_dims=config.probe.encoder_hidden_dims,
            hallucination_head_dims=config.probe.hallucination_head_dims,
            domain_head_dims=config.probe.domain_head_dims,
            dropout_rate=config.probe.dropout_rate,
            gradient_reversal_alpha=1.0,
        ).to(device)

        self.device = device

    def extract_hidden_states(
        self,
        prompt: str,
        answer: str,
        pooling: str = "mean",
    ) -> Dict[int, torch.Tensor]:
        """
        Extract and pool hidden states.

        Args:
            prompt: Input prompt
            answer: Model's answer
            pooling: Pooling strategy

        Returns:
            Dictionary of pooled hidden states
        """
        hidden_states = self.extractor.extract(prompt, answer)
        pooled = self.extractor.pool_hidden_states(hidden_states, pooling)
        return pooled

    def detect_hallucination(
        self,
        prompt: str,
        answer: str,
        pooling: str = "mean",
        threshold: float = 0.5,
        return_intermediate: bool = False,
    ) -> Dict[str, float]:
        """
        Detect hallucination in a given prompt-answer pair.

        Args:
            prompt: Input prompt
            answer: Model's answer
            pooling: Pooling strategy
            threshold: Hallucination probability threshold
            return_intermediate: Whether to return intermediate scores

        Returns:
            Dictionary with:
                - hallucination_score: Probability [0, 1]
                - is_hallucination: Boolean classification
                - confidence: How confident in the classification
        """
        # Extract hidden states
        pooled_states = self.extract_hidden_states(prompt, answer, pooling)
        
        # Aggregate hidden states from multiple layers
        # Simple approach: mean pooling across layers
        hidden_state_list = list(pooled_states.values())
        if not hidden_state_list:
            raise ValueError("No hidden states extracted!")
        
        # Stack and mean pool
        stacked = torch.stack(hidden_state_list, dim=0)  # (num_layers, batch_size, hidden_dim)
        aggregated = stacked.mean(dim=0)  # (batch_size, hidden_dim)
        
        # Forward through probe
        with torch.no_grad():
            self.probe.eval()
            output = self.probe(aggregated, return_features=return_intermediate)
        
        hallucination_score = output["hallucination_probs"].item()
        is_hallucination = hallucination_score >= threshold
        confidence = max(hallucination_score, 1 - hallucination_score)
        
        result = {
            "hallucination_score": hallucination_score,
            "is_hallucination": is_hallucination,
            "confidence": confidence,
        }
        
        if return_intermediate:
            result["features"] = output.get("features")
            result["domain_logits"] = output.get("domain_logits")
        
        return result

    def batch_detect_hallucination(
        self,
        prompts: List[str],
        answers: List[str],
        pooling: str = "mean",
        threshold: float = 0.5,
    ) -> List[Dict[str, float]]:
        """
        Detect hallucinations in batch.

        Args:
            prompts: List of prompts
            answers: List of answers
            pooling: Pooling strategy
            threshold: Hallucination probability threshold

        Returns:
            List of detection results
        """
        results = []
        for prompt, answer in zip(prompts, answers):
            result = self.detect_hallucination(
                prompt, answer, pooling, threshold
            )
            results.append(result)
        return results

    def save_probe(self, checkpoint_path: str):
        """Save probe model checkpoint."""
        Path(checkpoint_path).parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.probe.state_dict(), checkpoint_path)
        logger.info(f"Saved probe checkpoint to {checkpoint_path}")

    def load_probe(self, checkpoint_path: str):
        """Load probe model checkpoint."""
        self.probe.load_state_dict(torch.load(checkpoint_path, map_location=self.device))
        logger.info(f"Loaded probe checkpoint from {checkpoint_path}")

    def cleanup(self):
        """Cleanup resources."""
        if hasattr(self, 'extractor'):
            self.extractor.cleanup()
