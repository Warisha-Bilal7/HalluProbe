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
        logger.warning("Continuing without pipeline - API will be in limited mode")
        pipeline = None
    
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
