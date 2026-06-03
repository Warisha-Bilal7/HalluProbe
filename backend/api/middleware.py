"""FastAPI middleware for logging and error handling."""
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging."""

    async def dispatch(self, request: Request, call_next):
        request_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(f"Request failed: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "detail": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
        
        # Log response
        process_time = time.time() - request_time
        logger.info(
            f"Response: {response.status_code} "
            f"(took {process_time*1000:.2f}ms)"
        )
        
        response.headers["X-Process-Time"] = str(process_time)
        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for error handling."""

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
