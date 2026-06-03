"""API usage guide."""

# HalluProbe API Usage Guide

## Quick Start

### 1. Start the Server

```bash
python run_server.py
```

Server will start at `http://localhost:8000`

### 2. Access API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## API Endpoints

### Health Check

**GET** `/api/v1/health`

Check if the API and model are ready.

```bash
curl http://localhost:8000/api/v1/health
```

Response:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

### Configuration

**GET** `/api/v1/config`

Get current model configuration.

```bash
curl http://localhost:8000/api/v1/config
```

Response:

```json
{
  "model_info": {
    "base_model": "mistralai/Mistral-7B",
    "target_layers": [8, 16, 24, 32],
    "num_domains": 4,
    "hidden_dim": 4096,
    "probe_parameters": 1048576
  },
  "timestamp": "2026-06-03T12:00:00.000000"
}
```

### Detect Hallucination (Single)

**POST** `/api/v1/detect`

Detect hallucination in a single prompt-answer pair.

Request:

```json
{
  "prompt": "What is the capital of France?",
  "answer": "The capital of France is Paris, a beautiful city in northern France.",
  "threshold": 0.5,
  "return_features": false
}
```

Response:

```json
{
  "hallucination_score": 0.1234,
  "is_hallucination": false,
  "confidence": 0.8766
}
```

Python example:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/detect",
    json={
        "prompt": "What is 2+2?",
        "answer": "2+2 equals 5",
        "threshold": 0.5
    }
)

result = response.json()
print(f"Hallucination Score: {result['hallucination_score']}")
print(f"Is Hallucination: {result['is_hallucination']}")
```

### Detect Hallucination (Batch)

**POST** `/api/v1/detect-batch`

Detect hallucinations in multiple prompt-answer pairs.

Request:

```json
{
  "prompts": [
    "What is 2+2?",
    "What is the capital of France?",
    "How many fingers do humans have?"
  ],
  "answers": [
    "2+2 equals 5",
    "The capital of France is Paris",
    "Humans have 12 fingers"
  ],
  "threshold": 0.5
}
```

Response:

```json
{
  "results": [
    {
      "hallucination_score": 0.9234,
      "is_hallucination": true,
      "confidence": 0.9234
    },
    {
      "hallucination_score": 0.1234,
      "is_hallucination": false,
      "confidence": 0.8766
    },
    {
      "hallucination_score": 0.8567,
      "is_hallucination": true,
      "confidence": 0.8567
    }
  ],
  "processing_time_ms": 1234.5
}
```

Python example:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/detect-batch",
    json={
        "prompts": ["Q1", "Q2", "Q3"],
        "answers": ["A1", "A2", "A3"],
        "threshold": 0.5
    }
)

results = response.json()
for i, result in enumerate(results["results"]):
    print(f"Sample {i}: {result['hallucination_score']:.4f}")
print(f"Total processing time: {results['processing_time_ms']}ms")
```

### Metrics

**GET** `/api/v1/metrics`

Get API metrics and statistics.

```bash
curl http://localhost:8000/api/v1/metrics
```

## Advanced Usage

### Return Intermediate Features

Request:

```json
{
  "prompt": "What is the capital of France?",
  "answer": "The capital of France is Paris",
  "return_features": true
}
```

Response includes features:

```json
{
  "hallucination_score": 0.1234,
  "is_hallucination": false,
  "confidence": 0.8766,
  "features": [0.123, 0.456, ...],
  "domain_logits": [0.1, 0.2, 0.3, 0.4]
}
```

### Threshold Tuning

Adjust threshold based on your use case:

```python
# High precision (fewer false positives)
response = requests.post(
    "http://localhost:8000/api/v1/detect",
    json={
        "prompt": "...",
        "answer": "...",
        "threshold": 0.8
    }
)

# High recall (fewer false negatives)
response = requests.post(
    "http://localhost:8000/api/v1/detect",
    json={
        "prompt": "...",
        "answer": "...",
        "threshold": 0.3
    }
)
```

## Error Handling

### Common Errors

**503 Service Unavailable** - Model not loaded

```json
{
  "error": "Internal server error",
  "detail": "Model not loaded",
  "timestamp": "2026-06-03T12:00:00.000000"
}
```

**400 Bad Request** - Invalid input

```json
{
  "error": "Internal server error",
  "detail": "Number of prompts must match number of answers",
  "timestamp": "2026-06-03T12:00:00.000000"
}
```

**400 Bad Request** - Batch too large

```json
{
  "error": "Internal server error",
  "detail": "Batch size too large (max 1000)",
  "timestamp": "2026-06-03T12:00:00.000000"
}
```

Python error handling:

```python
import requests
from requests.exceptions import RequestException

try:
    response = requests.post(
        "http://localhost:8000/api/v1/detect",
        json={"prompt": "...", "answer": "..."}
    )
    response.raise_for_status()  # Raise for HTTP errors
    result = response.json()
except RequestException as e:
    print(f"Request error: {e}")
```

## Performance Tips

1. **Batch Processing**: Use batch endpoint for multiple detections

   ```python
   # Instead of N requests, send one batch request
   requests.post(".../detect-batch", json={"prompts": [...], "answers": [...]})
   ```

2. **Connection Pooling**: Reuse connections

   ```python
   session = requests.Session()
   for prompt, answer in data:
       session.post(".../detect", json={"prompt": prompt, "answer": answer})
   ```

3. **Async Requests**: For high throughput

   ```python
   import asyncio
   import aiohttp

   async def detect(session, prompt, answer):
       async with session.post(url, json={...}) as resp:
           return await resp.json()
   ```

## Deployment

### Docker Compose

```bash
cd docker
docker-compose up
```

This starts:

- API server on `http://localhost:8000`
- Gradio demo on `http://localhost:7860`

### Kubernetes

See [DEPLOYMENT.md](DEPLOYMENT.md) for Kubernetes deployment guide.

### Load Balancing

For high-traffic deployments, run multiple instances:

```bash
# Terminal 1
PORT=8000 python run_server.py

# Terminal 2
PORT=8001 python run_server.py

# Terminal 3 - Nginx load balancer
nginx -c /path/to/nginx.conf
```

## Authentication (Optional)

For production, add authentication:

```python
from fastapi import Security, HTTPException, Depends
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != "your-secret-key":
        raise HTTPException(status_code=403)
    return api_key
```

## Rate Limiting

Add rate limiting for production:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/v1/detect")
@limiter.limit("100/minute")
async def detect(request, threshold=0.5):
    ...
```

## Monitoring

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram

detection_counter = Counter('hallucination_detections', 'Total detections')
detection_latency = Histogram('detection_latency_ms', 'Detection latency')

@app.post("/api/v1/detect")
async def detect(...):
    detection_counter.inc()
    # ...
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

logger.info(f"Detection result: {result}")
logger.error(f"Detection failed: {error}")
```

## Next Steps

- See [README.md](README.md) for project overview
- Check [CONFIG.md](CONFIG.md) for configuration
- Review [INSTALL.md](INSTALL.md) for installation
