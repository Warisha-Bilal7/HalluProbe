"""FastAPI routes for hallucination detection."""
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, List
import logging

from .schemas import (
    DetectionRequest,
    DetectionResult,
    BatchDetectionRequest,
    BatchDetectionResult,
    HealthResponse,
    ConfigResponse,
    ModelInfo,
    ErrorResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["detection"])


# Global state (will be set by main.py)
_pipeline = None
_config = None


def set_pipeline(pipeline, config):
    """Set the global pipeline instance."""
    global _pipeline, _config
    _pipeline = pipeline
    _config = config


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and model status."""
    return HealthResponse(
        status="healthy",
        model_loaded=_pipeline is not None,
        version="1.0.0",
    )


@router.get("/config", response_model=ConfigResponse)
async def get_config():
    """Get current model configuration."""
    if _pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    probe_params = sum(p.numel() for p in _pipeline.probe.parameters())
    
    model_info = ModelInfo(
        base_model=_config.model.base_model,
        target_layers=_config.model.hidden_layers,
        num_domains=_config.probe.num_domains,
        hidden_dim=_config.model.hidden_dim,
        probe_parameters=probe_params,
    )
    
    return ConfigResponse(
        model_info=model_info,
        timestamp=datetime.utcnow().isoformat(),
    )


@router.post("/detect", response_model=DetectionResult)
async def detect_hallucination(request: DetectionRequest):
    """
    Detect hallucination in a prompt-answer pair.
    
    Args:
        request: DetectionRequest with prompt and answer
        
    Returns:
        DetectionResult with hallucination score and classification
    """
    if _pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        start_time = time.time()
        
        result = _pipeline.detect_hallucination(
            prompt=request.prompt,
            answer=request.answer,
            threshold=request.threshold,
            return_intermediate=request.return_features,
        )
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        logger.info(f"Detection completed in {processing_time:.2f}ms")
        
        response_data = {
            "hallucination_score": result["hallucination_score"],
            "is_hallucination": result["is_hallucination"],
            "confidence": result["confidence"],
        }
        
        if request.return_features and "features" in result:
            response_data["features"] = result["features"].cpu().tolist() if hasattr(result["features"], "cpu") else result["features"].tolist()
        
        if request.return_features and "domain_logits" in result:
            response_data["domain_logits"] = result["domain_logits"].cpu().tolist() if hasattr(result["domain_logits"], "cpu") else result["domain_logits"].tolist()
        
        return DetectionResult(**response_data)
        
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-batch", response_model=BatchDetectionResult)
async def detect_batch(request: BatchDetectionRequest):
    """
    Detect hallucinations in batch.
    
    Args:
        request: BatchDetectionRequest with lists of prompts and answers
        
    Returns:
        BatchDetectionResult with list of results
    """
    if _pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(request.prompts) != len(request.answers):
        raise HTTPException(
            status_code=400,
            detail="Number of prompts must match number of answers"
        )
    
    if len(request.prompts) == 0:
        raise HTTPException(status_code=400, detail="Empty batch")
    
    if len(request.prompts) > 1000:
        raise HTTPException(status_code=400, detail="Batch size too large (max 1000)")
    
    try:
        start_time = time.time()
        
        results = _pipeline.batch_detect_hallucination(
            prompts=request.prompts,
            answers=request.answers,
            threshold=request.threshold,
        )
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        detection_results = [
            DetectionResult(
                hallucination_score=r["hallucination_score"],
                is_hallucination=r["is_hallucination"],
                confidence=r["confidence"],
            )
            for r in results
        ]
        
        return BatchDetectionResult(
            results=detection_results,
            processing_time_ms=processing_time,
        )
        
    except Exception as e:
        logger.error(f"Batch detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    """Get API metrics and statistics."""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "model_status": "ready" if _pipeline else "not_loaded",
    }
