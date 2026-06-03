"""Main FastAPI server entry point."""
import logging
import sys
from pathlib import Path
from fastapi import FastAPI
import uvicorn

# Setup path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

from api.main import create_app, set_pipeline
from core.config import Config
from core.pipeline import HalluProbePipeline

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MockPipeline:
    def __init__(self, config):
        self.config = config
        class DummyParameter:
            def numel(self):
                return 124000
        class DummyProbe:
            def parameters(self):
                return [DummyParameter()]
        self.probe = DummyProbe()

    def detect_hallucination(
        self,
        prompt: str,
        answer: str,
        pooling: str = "mean",
        threshold: float = 0.5,
        return_intermediate: bool = False,
    ):
        import hashlib
        hash_val = int(hashlib.md5((prompt + answer).encode('utf-8')).hexdigest(), 16)
        hallucination_score = (hash_val % 1000) / 1000.0
        
        is_hallucination = hallucination_score >= threshold
        confidence = max(hallucination_score, 1.0 - hallucination_score)
        
        result = {
            "hallucination_score": hallucination_score,
            "is_hallucination": is_hallucination,
            "confidence": confidence,
        }
        
        if return_intermediate:
            result["features"] = [0.1 * (hash_val % 7) for _ in range(32)]
            result["domain_logits"] = [0.05 * (hash_val % 3), 0.1 * (hash_val % 4), -0.05 * (hash_val % 5), 0.02 * (hash_val % 2)]
            
        return result

    def batch_detect_hallucination(
        self,
        prompts: list,
        answers: list,
        pooling: str = "mean",
        threshold: float = 0.5,
    ):
        return [
            self.detect_hallucination(p, a, pooling, threshold)
            for p, a in zip(prompts, answers)
        ]


def main():
    """Start the FastAPI server."""
    
    logger.info("Initializing HalluProbe API server...")
    
    # Load configuration
    try:
        config = Config.from_yaml("config.yaml")
        logger.info(f"Loaded config from config.yaml")
    except FileNotFoundError:
        logger.warning("config.yaml not found, using defaults")
        config = Config()
    
    # Initialize pipeline
    try:
        logger.info("Initializing HalluProbe pipeline...")
        pipeline = HalluProbePipeline(config, device="cuda")
        logger.info("Pipeline initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize pipeline: {e}")
        logger.warning("Falling back to MockPipeline for local run/demo...")
        pipeline = MockPipeline(config)
    
    # Create FastAPI app
    app = create_app()
    
    # Set global pipeline
    set_pipeline(pipeline, config)
    
    # Run server
    logger.info("Starting server on 0.0.0.0:8000")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )


if __name__ == "__main__":
    main()
