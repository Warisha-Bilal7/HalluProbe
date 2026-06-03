# 🚀 HalluProbe Complete Setup Guide

Complete step-by-step guide for setting up and running HalluProbe with separate backend and frontend.

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Installation Options](#installation-options)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

## 📁 Project Structure

```
HalluProbe/
├── backend/              # Python/FastAPI backend (Port 8000)
│   ├── api/             # FastAPI server
│   ├── core/            # ML model
│   ├── training/        # Training system
│   ├── tests/           # Tests
│   ├── config.yaml      # Configuration
│   ├── requirements.txt # Python deps
│   ├── run_server.py    # API launcher
│   └── README.md        # Backend docs
│
├── frontend/             # React/Next.js frontend (Port 3000)
│   ├── app/             # Next.js app
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # API client
│   ├── types/           # TypeScript types
│   ├── package.json     # npm dependencies
│   └── FRONTEND.md      # Frontend docs
│
├── docker/              # Docker configuration
├── docs/                # Documentation
├── README-NEW.md        # New project README
└── setup-*.sh/bat       # Setup scripts
```

## ✅ Prerequisites

### Windows

- Python 3.9+ ([Download](https://www.python.org/downloads/))
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- PowerShell or Command Prompt

### macOS/Linux

- Python 3.9+: `brew install python3`
- Node.js 18+: `brew install node`
- Git: `brew install git`
- Bash/Zsh terminal

### Optional

- Docker & Docker Compose (for containerized setup)
- CUDA 11.8+ (for GPU support)
- Git LFS (for large files)

## 🛠️ Installation Options

### Option 1: Automated Setup (Recommended)

#### Windows

```batch
# Open Command Prompt or PowerShell and run:
setup-backend.bat
setup-frontend.bat
```

#### macOS/Linux

```bash
chmod +x setup-backend.sh setup-frontend.sh
./setup-backend.sh
./setup-frontend.sh
```

### Option 2: Manual Setup - Backend

**Step 1: Create Python Virtual Environment**

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Step 2: Install Dependencies**

```bash
pip install -r requirements.txt
```

**Step 3: Create Directories**

```bash
mkdir data checkpoints outputs logs
```

**Step 4: Start API Server**

```bash
python run_server.py
```

Expected output:

```
INFO:     Started server process
INFO:     Waiting for application startup
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Option 3: Manual Setup - Frontend

**Step 1: Install Dependencies**

```bash
cd frontend
npm install
```

**Step 2: Create Environment File**

```bash
cp .env.example .env.local
```

Edit `.env.local` if needed (default is correct for local development):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 3: Start Development Server**

```bash
npm run dev
```

Expected output:

```
> halluprobe-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000

 ✓ Ready in 5.2s
```

### Option 4: Docker Compose (Full Stack)

**Prerequisites**: Docker & Docker Compose installed

```bash
# Full stack (API + Frontend + Demo)
docker-compose -f docker/docker-compose-stack.yml up

# Backend only (API + Demo)
docker-compose -f docker/docker-compose-backend.yml up
```

Access:

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Demo: http://localhost:7860

## ✨ Verification

### Check Backend

**Test 1: Health Check**

```bash
# Using curl
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"healthy",...}
```

**Test 2: API Documentation**

```
Open in browser: http://localhost:8000/docs
```

**Test 3: Single Detection**

```bash
curl -X POST http://localhost:8000/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2?",
    "answer": "2+2 equals 5",
    "threshold": 0.5
  }'

# Expected response includes: hallucination_score, is_hallucination
```

### Check Frontend

**Test 1: Page Load**

```
Open: http://localhost:3000
```

Expected: Page loads without errors

**Test 2: API Connection**

- Check StatusPanel (top-right)
- Should show: ✅ Connected
- Should display: Model name, hidden dimensions, layers

**Test 3: Single Detection**

1. Click "Single Detection" tab
2. Enter prompt: "What is 2+2?"
3. Enter answer: "2+2 equals 5"
4. Click "Detect Hallucination"
5. See color-coded score result

**Test 4: Batch Processing**

1. Click "Batch Processing" tab
2. Add items or upload CSV
3. Click "Process Batch"
4. View and download results

## 🌐 URLs

| Service  | URL                        | Purpose            |
| -------- | -------------------------- | ------------------ |
| Frontend | http://localhost:3000      | Main web interface |
| API      | http://localhost:8000      | REST API           |
| API Docs | http://localhost:8000/docs | Swagger UI         |
| Demo     | http://localhost:7860      | Gradio interface   |

## 🔧 Common Commands

### Backend

```bash
cd backend

# Start API
python run_server.py

# Start Gradio demo
python run_demo.py

# Train model
python train.py

# Run tests
pytest

# Type checking
mypy core/ api/ training/

# Linting
flake8 core/ api/ training/
```

### Frontend

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format
```

## 📦 Project Statistics

### Backend

- **Files**: 35+
- **Code**: ~3,500 lines Python
- **Frameworks**: PyTorch, FastAPI, Gradio
- **Python Version**: 3.9+
- **Key Dependencies**: torch, transformers, peft

### Frontend

- **Files**: 20+
- **Code**: ~2,000 lines TypeScript/React
- **Framework**: Next.js 14
- **Node Version**: 18+
- **Key Dependencies**: next, react, tailwindcss

### Documentation

- **Files**: 8+ markdown files
- **Lines**: ~5,000+ documentation lines
- **Coverage**: Installation, API, Config, Deployment

## 🐛 Troubleshooting

### Backend Issues

**Problem: "ModuleNotFoundError" when running API**

```
Solution:
1. Activate virtual environment
2. pip install -r requirements.txt
3. Ensure you're in backend/ directory
```

**Problem: "CUDA not available" (warning)**

```
Solution: This is OK if you don't have GPU.
The API will run on CPU (slower but works).
```

**Problem: "Address already in use" (Port 8000)**

```
Solution:
1. Find process: lsof -i :8000  (macOS/Linux)
2. Kill process: kill -9 <PID>
3. Or use different port: python run_server.py --port 8001
```

**Problem: Out of memory errors**

```
Solution:
1. Edit backend/config.yaml:
   use_quantization: true
   quantization_bits: 4
2. Use smaller model: base_model: "gpt2-medium"
```

### Frontend Issues

**Problem: "Module not found" errors**

```
Solution:
1. Delete node_modules: rm -rf node_modules
2. Reinstall: npm install
3. Clear cache: npm cache clean --force
```

**Problem: "Cannot find module 'next'"**

```
Solution:
1. Ensure you're in frontend/ directory
2. Run npm install
3. Check package.json exists
```

**Problem: API connection error (StatusPanel shows red)**

```
Solution:
1. Verify backend is running on port 8000
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Check browser console (F12) for CORS errors
4. Restart both frontend and backend
```

**Problem: TypeScript errors in build**

```
Solution:
1. Run npm run type-check to see errors
2. Fix reported type issues
3. Clear .next: rm -rf .next
4. Rebuild: npm run build
```

### Docker Issues

**Problem: Container won't start**

```
Solution:
1. Check logs: docker-compose logs service-name
2. Verify Docker is running
3. Check port conflicts: docker ps
4. Rebuild: docker-compose build --no-cache
```

**Problem: "Cannot connect to backend from frontend"**

```
Solution:
1. Use service name: http://halluprobe-api:8000
2. In docker-compose, set: NEXT_PUBLIC_API_URL=http://halluprobe-api:8000
3. Ensure services are on same network
```

## 📚 Documentation

- **[README-NEW.md](./README-NEW.md)** - Project overview
- **[backend/README.md](./backend/README.md)** - Backend documentation
- **[frontend/FRONTEND.md](./frontend/FRONTEND.md)** - Frontend documentation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Detailed architecture

## 🎯 Next Steps

1. **Run Setup**

   ```bash
   # Windows
   setup-backend.bat && setup-frontend.bat

   # macOS/Linux
   ./setup-backend.sh && ./setup-frontend.sh
   ```

2. **Start Services**
   - Terminal 1: `cd backend && python run_server.py`
   - Terminal 2: `cd frontend && npm run dev`

3. **Verify Installation**
   - Check http://localhost:3000
   - StatusPanel should show "Connected"

4. **Test Features**
   - Try single detection
   - Try batch processing
   - Check API docs at http://localhost:8000/docs

## 💡 Tips

- **Keep terminals open**: You need both backend and frontend running
- **Port conflicts**: If ports are in use, change them in config files
- **GPU support**: Install CUDA and pytorch with GPU support for faster inference
- **Large models**: Use quantization or smaller models to reduce memory usage
- **Development**: Frontend hot-reloads on changes, backend requires restart

## 🆘 Getting Help

1. Check the troubleshooting section above
2. Review documentation files
3. Check error messages in browser console (F12)
4. Check backend logs in `backend/logs/`
5. Verify all prerequisites are installed

## ✅ Success Criteria

Your setup is complete and working when:

- [ ] Backend API responds to health check
- [ ] Frontend loads at http://localhost:3000
- [ ] StatusPanel shows "Connected" (green)
- [ ] Single detection works and returns scores
- [ ] Batch processing works
- [ ] CSV import/export functions
- [ ] No errors in browser console
- [ ] API docs work at http://localhost:8000/docs

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Complete Setup Guide Ready
