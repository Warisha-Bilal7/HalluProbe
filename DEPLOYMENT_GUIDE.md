"""Final Deployment & Verification Guide."""

# HalluProbe - Final Verification & Deployment Guide

## ✅ Pre-Deployment Checklist

### Backend ✅

- [x] Core ML components implemented (`core/`)
- [x] Training system complete (`training/`)
- [x] FastAPI server ready (`api/`, `run_server.py`)
- [x] Gradio demo ready (`run_demo.py`)
- [x] Docker image ready (`docker/Dockerfile`)
- [x] Tests implemented (`tests/`)
- [x] Configuration system (`config.yaml`)
- [x] Documentation complete (`*.md` files)

### Frontend ✅

- [x] TypeScript types defined (`frontend/types/api.ts`)
- [x] API client implemented (`frontend/lib/api.ts`)
- [x] Utilities created (`frontend/lib/utils.ts`)
- [x] Custom hooks built (`frontend/hooks/useApi.ts`)
- [x] UI components created (`frontend/components/ui/`)
- [x] Feature components built (`frontend/components/`)
- [x] Main app page ready (`frontend/app/page.tsx`)
- [x] Configuration files complete
- [x] Docker image ready (`frontend/Dockerfile`)
- [x] Documentation complete

### Integration ✅

- [x] API-Frontend communication configured
- [x] Environment variables set up
- [x] Docker Compose files created
- [x] CI/CD pipeline configured
- [x] Project documentation complete

---

## 🚀 Deployment Methods

### Method 1: Local Development (Recommended for Testing)

```bash
# Terminal 1: Backend
python run_server.py
# API available at: http://localhost:8000
# API health check: curl http://localhost:8000/api/v1/health

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Frontend available at: http://localhost:3000

# Terminal 3 (Optional): Gradio Demo
python run_demo.py
# Demo available at: http://localhost:7860
```

**Verification Steps**:

1. Open http://localhost:3000 in browser
2. Check StatusPanel - should show "Connected"
3. Try single detection
4. Test batch detection
5. Verify health check shows green indicator

### Method 2: Docker Compose (Development)

```bash
# Build and run API + Demo only
docker-compose -f docker/docker-compose.yml up

# In new terminal: Frontend (if not in compose)
cd frontend
npm install
npm run dev
```

### Method 3: Docker Compose Full Stack (Production-like)

```bash
# Build and run entire stack
docker-compose -f docker/docker-compose-full.yml up

# Services available at:
# - Frontend: http://localhost:3000
# - API: http://localhost:8000
# - Demo: http://localhost:7860
```

### Method 4: Production Deployment

#### Option A: Cloud Run (Google Cloud)

```bash
# Build and push API
cd docker
docker build -f Dockerfile -t gcr.io/[PROJECT-ID]/halluprobe-api:latest .
docker push gcr.io/[PROJECT-ID]/halluprobe-api:latest

# Deploy to Cloud Run
gcloud run deploy halluprobe-api \
  --image gcr.io/[PROJECT-ID]/halluprobe-api:latest \
  --platform managed \
  --region us-central1 \
  --memory 8Gi \
  --timeout 3600

# Deploy Frontend to Vercel
cd frontend
vercel deploy
vercel env add NEXT_PUBLIC_API_URL https://halluprobe-api-xxx.run.app
```

#### Option B: AWS Lambda + Vercel

```bash
# Package API for Lambda
sam build
sam deploy

# Deploy Frontend to Vercel
cd frontend
vercel deploy
vercel env add NEXT_PUBLIC_API_URL https://[lambda-url]
```

#### Option C: Self-Hosted (Docker)

```bash
# On your server
docker-compose -f docker/docker-compose-full.yml up -d

# Set up reverse proxy (nginx)
# Configure SSL with Let's Encrypt
# Set up monitoring and logging
```

---

## 🧪 Testing the Deployment

### Test 1: Health Check

```bash
# Backend health
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

### Test 2: Get Configuration

```bash
curl http://localhost:8000/api/v1/config

# Expected response contains model name, config details
```

### Test 3: Single Detection

```bash
curl -X POST http://localhost:8000/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2?",
    "answer": "2+2 equals 5",
    "threshold": 0.5
  }'

# Expected response:
# {"hallucination_score": 0.95, "is_hallucination": true, ...}
```

### Test 4: Frontend Connection

1. Open http://localhost:3000
2. Verify StatusPanel shows:
   - ✅ Connected status
   - Model name and configuration
   - Version number
3. Test form submission:
   - Enter a prompt and answer
   - Adjust threshold
   - Click "Detect Hallucination"
   - See colored score result
4. Test batch processing:
   - Click "Batch Processing" tab
   - Add items or upload CSV
   - Process batch
   - Download results

---

## 📊 Performance Verification

### Backend Performance

Expected metrics on standard hardware:

- API response time: 200-500ms (CPU)
- API response time: 50-100ms (GPU)
- Batch processing (100 items): 5-10 seconds

```bash
# Test with Apache Bench
ab -n 100 -c 1 http://localhost:8000/api/v1/health
```

### Frontend Performance

Expected metrics:

- Page load time: < 2 seconds
- Component render time: < 100ms
- API call time: < 500ms

Use browser DevTools to verify:

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check timing for all requests

---

## 🔐 Security Verification

### Backend

- [x] CORS properly configured
- [x] Input validation with Pydantic
- [x] No sensitive data in logs
- [x] Error messages don't leak information
- [x] Rate limiting ready (add with middleware)

Test CORS:

```bash
curl -H "Origin: http://localhost:3000" \
  http://localhost:8000/api/v1/health
```

### Frontend

- [x] No sensitive data in client-side code
- [x] API key never exposed
- [x] Input sanitization in place
- [x] Type safety prevents injection attacks

Verify in DevTools:

1. Open Network tab
2. Check request headers - no auth tokens
3. Verify API URL in Environment variables

---

## 📝 Environment Configuration

### Backend Environment

Create `.env` file in project root:

```
# Model
MODEL_NAME=meta-llama/Llama-2-7b-hf
USE_QUANTIZATION=true
QUANT_BITS=4

# Training
BATCH_SIZE=32
LEARNING_RATE=0.001
EPOCHS=5

# API
API_PORT=8000
LOG_LEVEL=info

# Compute
DEVICE=cuda
```

### Frontend Environment

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
```

---

## 🚨 Troubleshooting

### Issue: API Connection Error

**Symptom**: StatusPanel shows "Connection Failed"

**Solutions**:

1. Verify API is running:
   ```bash
   ps aux | grep run_server.py
   ```
2. Check API port:
   ```bash
   lsof -i :8000
   ```
3. Verify CORS:
   ```bash
   curl -v http://localhost:8000/api/v1/health
   ```
4. Check frontend environment:
   ```bash
   cat frontend/.env.local
   ```

### Issue: TypeScript Errors

**Symptom**: Build fails with TypeScript errors

**Solutions**:

```bash
# Type check locally
npm run type-check

# Fix issues reported
# Common: Missing types for API responses

# Build again
npm run build
```

### Issue: Out of Memory

**Symptom**: API crashes with OOM error

**Solutions**:

1. Enable quantization in `config.yaml`:
   ```yaml
   use_quantization: true
   quant_bits: 4
   ```
2. Use smaller model
3. Increase container memory:
   ```yaml
   # docker-compose.yml
   services:
     api:
       deploy:
         resources:
           limits:
             memory: 16G
   ```

### Issue: Slow API Response

**Symptom**: API takes 10+ seconds to respond

**Solutions**:

1. Use GPU (if available):
   ```yaml
   device: "cuda"
   ```
2. Use quantization
3. Profile with cProfile:
   ```bash
   python -m cProfile -s cumtime run_server.py
   ```

---

## 📚 Post-Deployment Checklist

### Monitoring

- [ ] Set up logging (application logs)
- [ ] Set up error tracking (Sentry, CloudWatch)
- [ ] Set up metrics (Prometheus, CloudWatch)
- [ ] Set up alerting for errors/performance

### Maintenance

- [ ] Set up regular backups
- [ ] Plan for updates/patches
- [ ] Document deployment procedures
- [ ] Train team on operations

### Scaling

- [ ] Set up load balancing if needed
- [ ] Configure auto-scaling
- [ ] Set up caching layer if needed
- [ ] Plan for data growth

### Documentation

- [ ] Document deployment procedure
- [ ] Document configuration options
- [ ] Document troubleshooting
- [ ] Maintain architecture diagrams

---

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ Backend API responds to health check
2. ✅ Frontend loads at http://localhost:3000
3. ✅ StatusPanel shows "Connected"
4. ✅ Single detection works and returns scores
5. ✅ Batch processing works
6. ✅ CSV import/export functions work
7. ✅ All UI components render correctly
8. ✅ Error handling works (try invalid input)
9. ✅ Performance meets expectations (< 500ms API calls)
10. ✅ No console errors in browser DevTools

---

## 📞 Quick Reference

### Important URLs

| Service  | URL                        | Port |
| -------- | -------------------------- | ---- |
| Frontend | http://localhost:3000      | 3000 |
| API      | http://localhost:8000      | 8000 |
| API Docs | http://localhost:8000/docs | 8000 |
| Demo     | http://localhost:7860      | 7860 |

### Important Files

| File                      | Purpose                |
| ------------------------- | ---------------------- |
| `config.yaml`             | Backend configuration  |
| `frontend/.env.local`     | Frontend configuration |
| `docker-compose-full.yml` | Full stack deployment  |
| `requirements.txt`        | Python dependencies    |
| `frontend/package.json`   | Frontend dependencies  |

### Common Commands

```bash
# Backend
python run_server.py          # Start API
python run_demo.py            # Start Demo
python train.py               # Train model

# Frontend
npm run dev                    # Dev server
npm run build                  # Production build
npm run lint                   # Linting
npm run type-check            # Type checking

# Docker
docker-compose -f docker/docker-compose.yml up
docker-compose -f docker/docker-compose-full.yml up
```

---

## 🎓 Additional Resources

- [Backend README](./README.md)
- [Frontend README](./frontend/README.md)
- [Frontend Setup Guide](./FRONTEND_SETUP.md)
- [API Documentation](./API.md)
- [Configuration Guide](./CONFIG.md)
- [Installation Guide](./INSTALL.md)
- [Project Overview](./PROJECT_OVERVIEW.md)

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Production Ready
