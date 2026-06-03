"""Pydantic schemas for API."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DetectionRequest(BaseModel):
    """Request for hallucination detection."""
    
    prompt: str = Field(..., description="Input prompt")
    answer: str = Field(..., description="Model's answer to evaluate")
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="Classification threshold")
    return_features: bool = Field(False, description="Whether to return intermediate features")


class BatchDetectionRequest(BaseModel):
    """Request for batch hallucination detection."""
    
    prompts: List[str] = Field(..., description="List of prompts")
    answers: List[str] = Field(..., description="List of answers")
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="Classification threshold")


class DetectionResult(BaseModel):
    """Result of hallucination detection."""
    
    hallucination_score: float = Field(..., description="Hallucination probability [0, 1]")
    is_hallucination: bool = Field(..., description="Classification result")
    confidence: float = Field(..., description="Confidence in classification")
    features: Optional[List[float]] = Field(None, description="Intermediate features")
    domain_logits: Optional[List[float]] = Field(None, description="Domain classification logits")


class BatchDetectionResult(BaseModel):
    """Result of batch detection."""
    
    results: List[DetectionResult]
    processing_time_ms: float


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str
    model_loaded: bool
    version: str


class ModelInfo(BaseModel):
    """Model information."""
    
    base_model: str
    target_layers: List[int]
    num_domains: int
    hidden_dim: int
    probe_parameters: int


class ConfigResponse(BaseModel):
    """Configuration response."""
    
    model_info: ModelInfo
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response."""
    
    error: str
    detail: Optional[str] = None
    timestamp: str
