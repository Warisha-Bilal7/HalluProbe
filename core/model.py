"""Domain-adversarial hallucination probe model."""
import torch
import torch.nn as nn
from typing import Dict, Tuple, Optional, List
import logging

logger = logging.getLogger(__name__)


class GradientReversalLayer(nn.Module):
    """Gradient reversal layer for domain adversarial training."""

    def __init__(self, alpha: float = 1.0):
        super().__init__()
        self.alpha = alpha

    def forward(self, x):
        return GradientReversal.apply(x, self.alpha)


class GradientReversal(torch.autograd.Function):
    """Gradient reversal function."""

    @staticmethod
    def forward(ctx, x, alpha):
        ctx.alpha = alpha
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_output):
        return -ctx.alpha * grad_output, None


class ProbeEncoder(nn.Module):
    """Encoder for hidden states."""

    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int],
        dropout_rate: float = 0.1,
    ):
        super().__init__()
        
        layers = []
        prev_dim = input_dim
        
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout_rate))
            prev_dim = hidden_dim
        
        self.network = nn.Sequential(*layers)
        self.output_dim = prev_dim

    def forward(self, x):
        return self.network(x)


class HallucinationHead(nn.Module):
    """Classification head for hallucination detection."""

    def __init__(self, input_dim: int, hidden_dims: List[int]):
        super().__init__()
        
        layers = []
        prev_dim = input_dim
        
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.ReLU())
            prev_dim = hidden_dim
        
        layers.append(nn.Linear(prev_dim, 1))
        layers.append(nn.Sigmoid())
        
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)


class DomainHead(nn.Module):
    """Classification head for domain prediction."""

    def __init__(self, input_dim: int, num_domains: int, hidden_dims: List[int]):
        super().__init__()
        
        layers = []
        prev_dim = input_dim
        
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.ReLU())
            prev_dim = hidden_dim
        
        layers.append(nn.Linear(prev_dim, num_domains))
        
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)


class DomainAdversarialProbe(nn.Module):
    """
    Domain-adversarial hallucination detection probe.
    
    Combines:
    1. Hallucination classification head
    2. Domain adversarial head (with gradient reversal)
    3. Contrastive learning objective
    """

    def __init__(
        self,
        input_dim: int,
        num_domains: int = 4,
        encoder_hidden_dims: List[int] = None,
        hallucination_head_dims: List[int] = None,
        domain_head_dims: List[int] = None,
        dropout_rate: float = 0.1,
        gradient_reversal_alpha: float = 1.0,
    ):
        super().__init__()
        
        encoder_hidden_dims = encoder_hidden_dims or [512, 256]
        hallucination_head_dims = hallucination_head_dims or [128, 64]
        domain_head_dims = domain_head_dims or [128, 64]
        
        # Encoder: shared representation
        self.encoder = ProbeEncoder(
            input_dim=input_dim,
            hidden_dims=encoder_hidden_dims,
            dropout_rate=dropout_rate,
        )
        
        # Hallucination head
        self.hallucination_head = HallucinationHead(
            input_dim=self.encoder.output_dim,
            hidden_dims=hallucination_head_dims,
        )
        
        # Domain head with gradient reversal
        self.gradient_reversal = GradientReversalLayer(gradient_reversal_alpha)
        self.domain_head = DomainHead(
            input_dim=self.encoder.output_dim,
            num_domains=num_domains,
            hidden_dims=domain_head_dims,
        )
        
        self.num_domains = num_domains

    def forward(
        self,
        hidden_states: torch.Tensor,
        return_features: bool = False,
    ) -> Dict[str, torch.Tensor]:
        """
        Forward pass.

        Args:
            hidden_states: Tensor of shape (batch_size, hidden_dim)
            return_features: Whether to return intermediate features

        Returns:
            Dictionary with:
                - hallucination_logits: (batch_size, 1)
                - hallucination_probs: (batch_size, 1)
                - domain_logits: (batch_size, num_domains)
                - features: (batch_size, encoder_dim) [optional]
        """
        # Shared encoder
        features = self.encoder(hidden_states)
        
        # Hallucination head
        hallucination_logits = self.hallucination_head(features)
        
        # Domain head with gradient reversal
        reversed_features = self.gradient_reversal(features)
        domain_logits = self.domain_head(reversed_features)
        
        output = {
            "hallucination_logits": hallucination_logits,
            "hallucination_probs": hallucination_logits,  # Already sigmoid
            "domain_logits": domain_logits,
        }
        
        if return_features:
            output["features"] = features
        
        return output

    def get_hallucination_score(self, hidden_states: torch.Tensor) -> torch.Tensor:
        """
        Get hallucination probability scores.

        Args:
            hidden_states: Tensor of shape (batch_size, hidden_dim)

        Returns:
            Tensor of shape (batch_size,) with hallucination scores [0, 1]
        """
        output = self.forward(hidden_states)
        return output["hallucination_probs"].squeeze(-1)
