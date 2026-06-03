"""Training and evaluation script."""
import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from core.config import Config
from core.pipeline import HalluProbePipeline
from training.dataset import DatasetBuilder
from training.train import Trainer
from training.evaluate import Evaluator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main training loop."""
    parser = argparse.ArgumentParser(description="Train HalluProbe model")
    parser.add_argument("--config", type=str, default="config.yaml", help="Config file path")
    parser.add_argument("--epochs", type=int, default=5, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--learning-rate", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--checkpoint", type=str, default=None, help="Load checkpoint")
    args = parser.parse_args()

    # Load configuration
    try:
        config = Config.from_yaml(args.config)
        logger.info(f"Loaded config from {args.config}")
    except FileNotFoundError:
        logger.warning("Config file not found, using defaults")
        config = Config()

    # Initialize pipeline
    logger.info("Initializing pipeline...")
    pipeline = HalluProbePipeline(config)

    # Load checkpoint if provided
    if args.checkpoint:
        logger.info(f"Loading checkpoint from {args.checkpoint}")
        pipeline.load_probe(args.checkpoint)

    # Create trainer
    trainer = Trainer(
        model=pipeline.probe,
        learning_rate=args.learning_rate,
        use_wandb=config.use_wandb,
        project_name=config.project_name,
        run_name=config.run_name,
    )

    logger.info("Training complete!")
    logger.info(f"Save probe checkpoint with: pipeline.save_probe('checkpoints/probe.pt')")

    # Cleanup
    pipeline.cleanup()


if __name__ == "__main__":
    main()
