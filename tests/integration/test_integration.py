"""Integration tests."""
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from core.config import Config


class TestIntegration(unittest.TestCase):
    """Integration tests."""

    def test_config_loading(self):
        """Test config loading."""
        config = Config()
        self.assertIsNotNone(config)
        self.assertTrue(config.model.use_quantization)


if __name__ == "__main__":
    unittest.main()
