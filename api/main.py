"""FastAPI application setup."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from .routes import router, set_pipeline
from .middleware import LoggingMiddleware, ErrorHandlingMiddleware

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create FastAPI application."""
    app = FastAPI(
        title="HalluProbe API",
        description="Domain-invariant hallucination detection for LLMs",
        version="1.0.0",
    )
    
    # Add middleware
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routes
    app.include_router(router)
    
    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "message": "HalluProbe API",
            "version": "1.0.0",
            "docs": "/docs",
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    return app


__all__ = ["create_app", "set_pipeline"]
