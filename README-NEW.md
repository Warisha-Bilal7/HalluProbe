# 🔍 HalluProbe: Domain-Invariant Hallucination Detection

A complete ML research system for detecting hallucinations in large language model outputs, featuring a professional backend API and modern React frontend.

## 📁 Project Structure

```
HalluProbe/
├── backend/                 # Python/FastAPI backend
│   ├── core/               # ML core components
│   ├── api/                # FastAPI server
│   ├── training/           # Training system
│   ├── tests/              # Test suite
│   ├── run_server.py       # API launcher
│   ├── run_demo.py         # Gradio demo
│   ├── config.yaml         # Configuration
│   ├── requirements.txt    # Python deps
│   └── README.md           # Backend docs
│
├── frontend/                # React/Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # API client & utils
│   ├── types/              # TypeScript types
│   ├── package.json        # Frontend deps
│   ├── tsconfig.json       # TypeScript config
│   ├── next.config.js      # Next.js config
│   ├── Dockerfile          # Frontend Docker
│   └── README.md           # Frontend docs
│
├── docker/                  # Docker configuration
│   ├── docker-compose.yml           # Backend + Demo
│   └── docker-compose-full.yml      # Full stack
│
├── docs/                    # Documentation
│   ├── README.md           # Project overview
│   ├── INSTALL.md          # Installation
│   ├── API.md              # API docs
│   ├── CONFIG.md           # Config guide
│   └── QUICKSTART.md       # Quick start
│
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline
│
├── README.md               # This file
├── DEPLOYMENT_GUIDE.md     # Deployment guide
├── PROJECT_OVERVIEW.md     # Detailed overview
└── LICENSE
```

## 🚀 Quick Start

### Option 1: Local Development

**Terminal 1 - Backend:**

```bash
cd backend
pip install -r requirements.txt
python run_server.py
# API available at http://localhost:8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
# Frontend available at http://localhost:3000
```

**Terminal 3 (Optional) - Gradio Demo:**

```bash
cd backend
python run_demo.py
# Demo available at http://localhost:7860
```

### Option 2: Docker Compose (Backend + Demo)

```bash
docker-compose -f docker/docker-compose.yml up
# API: http://localhost:8000
# Demo: http://localhost:7860
```

Then start frontend separately:

```bash
cd frontend
npm install
npm run dev
```

### Option 3: Full Stack Docker Compose

```bash
docker-compose -f docker/docker-compose-full.yml up
# Frontend: http://localhost:3000
# API: http://localhost:8000
# Demo: http://localhost:7860
```

## 🎯 Features

### Backend

- ✅ Domain-adversarial hallucination probe
- ✅ Supervised contrastive learning
- ✅ Multi-layer hidden state extraction
- ✅ FastAPI REST API with 5 endpoints
- ✅ Gradio interactive demo
- ✅ 4-bit model quantization
- ✅ Cross-domain evaluation

### Frontend

- ✅ Single detection with adjustable threshold
- ✅ Batch processing with CSV import/export
- ✅ Real-time API health monitoring
- ✅ Color-coded hallucination scoring
- ✅ Responsive design
- ✅ Full TypeScript type safety
- ✅ Professional UI/UX

## 📚 Documentation

### Getting Started

- **[Backend README](./backend/README.md)** - Backend setup and usage
- **[Frontend README](./frontend/README.md)** - Frontend setup and usage
- **[Quick Start Guide](./docs/QUICKSTART.md)** - 5-minute setup

### Detailed Docs

- **[Installation Guide](./docs/INSTALL.md)** - Detailed installation
- **[Configuration Guide](./docs/CONFIG.md)** - Configuration options
- **[API Documentation](./docs/API.md)** - API reference with examples
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Complete architecture

## 🔌 API Endpoints

All endpoints at `http://localhost:8000/api/v1/`

| Method | Endpoint        | Purpose             |
| ------ | --------------- | ------------------- |
| GET    | `/health`       | Health check        |
| GET    | `/config`       | Model configuration |
| POST   | `/detect`       | Single detection    |
| POST   | `/detect-batch` | Batch detection     |
| GET    | `/metrics`      | Model metrics       |

**Example:**

```bash
curl -X POST http://localhost:8000/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2?",
    "answer": "2+2 equals 5",
    "threshold": 0.5
  }'
```

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  React Frontend │────→│   FastAPI Server │
│  (Port 3000)    │     │   (Port 8000)    │
└─────────────────┘     └──────────────────┘
                                │
                        ┌───────▼────────┐
                        │   ML Model     │
                        │  (PyTorch)     │
                        └────────────────┘
```

## 🧪 Testing

### Backend

```bash
cd backend
pytest                    # Run all tests
pytest tests/unit/        # Unit tests
pytest tests/integration/ # Integration tests
```

### Frontend

```bash
cd frontend
npm run lint             # Linting
npm run type-check      # Type checking
```

## 🐳 Docker

### Build Images

```bash
# Backend
docker build -f backend/Dockerfile -t halluprobe-api:latest .

# Frontend
docker build -f frontend/Dockerfile -t halluprobe-frontend:latest .
```

### Run Containers

```bash
# Backend only
docker run -p 8000:8000 halluprobe-api:latest

# Frontend only
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api:8000 \
  halluprobe-frontend:latest

# Full stack
docker-compose -f docker/docker-compose-full.yml up
```

## 🚀 Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel deploy
vercel env add NEXT_PUBLIC_API_URL https://api.example.com
```

### Cloud Run (Backend)

```bash
cd backend
gcloud run deploy halluprobe-api \
  --source . \
  --platform managed
```

### Self-Hosted

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Performance

| Metric           | Value   | Notes        |
| ---------------- | ------- | ------------ |
| API Response     | < 500ms | CPU mode     |
| API Response     | < 100ms | GPU mode     |
| Model Inference  | ~50ms   | Per sample   |
| Batch Processing | < 5s    | 100+ samples |
| Frontend Build   | ~2min   | Production   |

## ⚙️ Configuration

### Backend (`backend/config.yaml`)

```yaml
model:
  base_model: "mistralai/Mistral-7B"
  use_quantization: true
  quantization_bits: 4

training:
  batch_size: 32
  num_epochs: 5
  learning_rate: 1e-4

loss:
  lambda_domain: 0.1
  gamma_contrastive: 0.05
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
```

## 🔐 Security

- ✅ Input validation with Pydantic
- ✅ CORS properly configured
- ✅ Error handling with safe messages
- ✅ Type checking with TypeScript
- ✅ No hardcoded secrets

## 📈 CI/CD

GitHub Actions pipeline automatically:

1. Runs tests (pytest)
2. Lints code (flake8, ESLint)
3. Type checks (mypy, TypeScript)
4. Builds Docker images
5. Runs security scans

See `.github/workflows/ci.yml` for details.

## 🤝 Contributing

1. Create a feature branch
2. Make changes and test locally
3. Push to GitHub
4. Create a pull request

## 📝 License

MIT License - See [LICENSE](./LICENSE)

## 📞 Support

### Troubleshooting

**Backend won't start:**

- Check Python version: `python --version` (need 3.9+)
- Verify dependencies: `pip install -r backend/requirements.txt`
- Check logs: Look in `backend/logs/`

**Frontend shows connection error:**

- Verify API is running: `curl http://localhost:8000/api/v1/health`
- Check `frontend/.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

**Out of memory errors:**

- Enable quantization in `backend/config.yaml`
- Use smaller model size
- Increase Docker memory allocation

### Resources

- **API Documentation**: http://localhost:8000/docs (when running)
- **Gradio Demo**: http://localhost:7860 (when running)
- **TypeScript Docs**: `frontend/README.md`
- **ML Docs**: `backend/README.md`

## 🎓 Learning

This project demonstrates:

- Domain-adversarial training for cross-domain generalization
- Gradient reversal layers for adversarial objectives
- Supervised contrastive learning for better representations
- Production-ready FastAPI REST architecture
- Modern React/TypeScript frontend patterns
- Complete ML project structure

## 📊 Project Stats

- **Backend**: ~3,500 lines Python
- **Frontend**: ~2,000 lines TypeScript/React
- **Documentation**: ~5,000 lines
- **Tests**: 20+ test files
- **Languages**: Python, TypeScript, JavaScript

---

**Version**: 1.0.0  
**Status**: 🟢 Production Ready  
**Last Updated**: June 2026  
**Team**: Advanced ML Course 2026

**Next Steps:**

1. Install dependencies: `pip install -r backend/requirements.txt && cd frontend && npm install`
2. Start backend: `cd backend && python run_server.py`
3. Start frontend: `cd frontend && npm run dev`
4. Open http://localhost:3000
