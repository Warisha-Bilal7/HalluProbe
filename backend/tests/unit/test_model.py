"""Unit tests."""
import unittest
import torch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.model import DomainAdversarialProbe
from core.config import Config


class TestModel(unittest.TestCase):
    """Test domain-adversarial probe model."""

    def setUp(self):
        """Setup test fixtures."""
        self.config = Config()
        self.device = "cpu"

    def test_model_initialization(self):
        """Test model initialization."""
        model = DomainAdversarialProbe(
            input_dim=self.config.model.hidden_dim,
            num_domains=self.config.probe.num_domains,
        )
        self.assertIsNotNone(model)

    def test_model_forward(self):
        """Test model forward pass."""
        model = DomainAdversarialProbe(
            input_dim=self.config.model.hidden_dim,
            num_domains=self.config.probe.num_domains,
        ).to(self.device)
        
        batch_size = 8
        hidden_states = torch.randn(batch_size, self.config.model.hidden_dim).to(self.device)
        
        output = model(hidden_states)
        
        self.assertIn("hallucination_logits", output)
        self.assertIn("hallucination_probs", output)
        self.assertIn("domain_logits", output)
        
        self.assertEqual(output["hallucination_logits"].shape, (batch_size, 1))
        self.assertEqual(output["domain_logits"].shape, (batch_size, self.config.probe.num_domains))

    def test_hallucination_score(self):
        """Test hallucination score computation."""
        model = DomainAdversarialProbe(
            input_dim=self.config.model.hidden_dim,
            num_domains=self.config.probe.num_domains,
        ).to(self.device)
        
        batch_size = 8
        hidden_states = torch.randn(batch_size, self.config.model.hidden_dim).to(self.device)
        
        scores = model.get_hallucination_score(hidden_states)
        
        self.assertEqual(scores.shape, (batch_size,))
        self.assertTrue((scores >= 0).all() and (scores <= 1).all())


class TestConfig(unittest.TestCase):
    """Test configuration management."""

    def test_config_creation(self):
        """Test config creation."""
        config = Config()
        self.assertIsNotNone(config)
        self.assertEqual(config.device, "cuda")

    def test_config_to_dict(self):
        """Test config to dict conversion."""
        config = Config()
        config_dict = config.to_dict()
        self.assertIsInstance(config_dict, dict)
        self.assertIn("device", config_dict)


if __name__ == "__main__":
    unittest.main()
