"""Quick Reference Guide."""

# HalluProbe Quick Reference

## 🚀 Getting Started (5 minutes)

```bash
# Setup
git clone <repo>
cd halluprobe
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run
python run_server.py      # API: http://localhost:8000
python run_demo.py        # Demo: http://localhost:7860
```

## 📱 Key Commands

```bash
# Training
python train.py --epochs 5 --batch-size 32 --learning-rate 1e-4

# Inference
curl -X POST http://localhost:8000/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Q","answer":"A","threshold":0.5}'

# Testing
pytest tests/ -v

# Docker
docker build -f docker/Dockerfile -t halluprobe:latest .
docker run -p 8000:8000 halluprobe:latest
```

## 🔑 Core Files

| File                   | Purpose                  |
| ---------------------- | ------------------------ |
| `core/model.py`        | Domain-adversarial probe |
| `core/extractor.py`    | Hidden state extraction  |
| `core/pipeline.py`     | End-to-end inference     |
| `training/train.py`    | Training loop            |
| `training/evaluate.py` | Evaluation framework     |
| `api/routes.py`        | REST API endpoints       |
| `config.yaml`          | Configuration            |

## 📊 Model Architecture

```
Input
  ↓ Frozen LLM (Mistral-7B / GPT-2-Medium)
  ↓ Extract Hidden States (Layers [8,16,24,32])
  ↓ Pool over Sequence (Mean pooling)
  ↓ Encoder (512→256)
  ↓
┌─ Hallucination Head → [0,1] Score
├─ Domain Head (Reversed Gradient) → Domain Classification
└─ Contrastive Loss → Representation Clustering
  ↓
Output: Hallucination Probability
```

## 🎯 Training Configuration

```yaml
# Quick Training (GPT-2-Medium)
model.base_model: "gpt2-medium"
training.batch_size: 16
training.num_epochs: 3

# Production (Mistral-7B)
model.base_model: "mistralai/Mistral-7B"
training.batch_size: 32
model.use_quantization: true
```

## 🧪 Test Inference

```python
from core.config import Config
from core.pipeline import HalluProbePipeline

config = Config.from_yaml("config.yaml")
pipeline = HalluProbePipeline(config)

result = pipeline.detect_hallucination(
    prompt="What is 2+2?",
    answer="2+2 equals 5",
    threshold=0.5
)

print(result["hallucination_score"])    # 0.92 (likely hallucination)
print(result["is_hallucination"])       # True
print(result["confidence"])              # 0.92
```

## 📈 Expected Metrics

```
Domain-Invariant Probe Performance:
- In-domain F1: 79.4%
- Medical OOD: 72.1%
- Legal OOD: 70.8%
- Average OOD: 71.5% (vs. SAPLMA: 48.4%)
```

## 🔗 API Endpoints

| Method | Endpoint               | Purpose          |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/v1/health`       | Check API status |
| GET    | `/api/v1/config`       | Get model config |
| POST   | `/api/v1/detect`       | Single detection |
| POST   | `/api/v1/detect-batch` | Batch detection  |

## 💻 System Requirements

| Component | Minimum | Recommended |
| --------- | ------- | ----------- |
| GPU VRAM  | 4GB     | 8GB+        |
| RAM       | 8GB     | 16GB+       |
| Storage   | 50GB    | 100GB+      |
| Python    | 3.9     | 3.9-3.11    |

## 📦 Key Dependencies

```
torch>=2.1.2
transformers>=4.36.2
fastapi>=0.104.1
gradio>=4.26.0
wandb>=0.16.0
datasets>=2.14.5
```

## 🐛 Troubleshooting

| Issue             | Solution                               |
| ----------------- | -------------------------------------- |
| Out of Memory     | Reduce batch_size, enable quantization |
| Slow inference    | Increase batch_size, use fp16          |
| Model not loading | Check GPU memory, verify model name    |
| API errors        | Check config.yaml, verify dependencies |

## 📝 Project Timeline

```
Week 1: Data Pipeline + Baseline
  Days 1-3: Data setup
  Days 4-5: SAPLMA reproduction

Week 2: Core Model
  Days 6-9: Adversarial + contrastive probe
  Days 10-12: OOD evaluation
  Days 13-15: Ablation studies

Week 3: Analysis + Release
  Days 16-17: Analysis & visualization
  Day 18: Demo & Colab notebook
  Days 19-20: Paper & preprint
  Day 21: Polish & release
```

## 🎓 Key Papers

1. **Azaria & Mitchell (2023)** - Internal states encode hallucination signals
2. **Ganin & Lempitsky (2015)** - Domain-adversarial neural networks
3. **Khosla et al. (2020)** - Supervised contrastive learning
4. **PARALLAX (2026)** - Artifact-free hallucination benchmarks

## 📚 Documentation Map

```
README.md        → Overview, quick start, examples
INSTALL.md       → Installation, troubleshooting
CONFIG.md        → Configuration reference
API.md           → API documentation
BUILD_SUMMARY.md → This project build summary
```

## 💡 Tips

1. **GPU Memory**: Use `nvidia-smi` to monitor VRAM
2. **Experiments**: Always save checkpoints
3. **Tracking**: Enable W&B for experiment comparison
4. **Batch Size**: Start with 16, increase if memory allows
5. **Learning Rate**: Reduce if loss diverges, increase if training stalls

## 🔐 Security

```python
# Production: Add rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

# Add authentication
from fastapi.security import APIKeyHeader
api_key = APIKeyHeader(name="X-API-Key")
```

## 📊 Monitoring

```bash
# GPU monitoring
watch -n 1 nvidia-smi

# API logs
tail -f logs/api.log

# Training progress
# (via W&B dashboard)
```

## 🚀 Deployment Checklist

- [ ] Data downloaded and validated
- [ ] Config.yaml customized for your setup
- [ ] Tests passing locally
- [ ] Docker image built
- [ ] API endpoints working
- [ ] Demo running
- [ ] CI/CD pipeline configured
- [ ] Model checkpoints saved
- [ ] Documentation updated

## 📞 Quick Help

```bash
# List all available options
python run_server.py --help
python train.py --help

# View API documentation
curl http://localhost:8000/docs

# Check model info
curl http://localhost:8000/api/v1/config | jq
```

## 🎯 Next Action

1. Install dependencies: `pip install -r requirements.txt`
2. Start API: `python run_server.py`
3. Test endpoint: `curl http://localhost:8000/api/v1/health`
4. Open Gradio: `http://localhost:7860`
5. Start training: `python train.py`

---

**For detailed info**, see:

- [README.md](README.md) - Full documentation
- [INSTALL.md](INSTALL.md) - Installation guide
- [CONFIG.md](CONFIG.md) - Configuration options
- [API.md](API.md) - API reference
