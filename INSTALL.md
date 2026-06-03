"""Installation and setup guide."""

# HalluProbe Installation Guide

## System Requirements

- Python 3.9 or higher
- CUDA 12.1+ (for GPU acceleration)
- 8GB RAM minimum (16GB+ recommended)
- 50GB free disk space (for datasets and models)

## Installation Methods

### Method 1: Local Installation (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/yourusername/halluprobe.git
cd halluprobe

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import torch; print(f'PyTorch version: {torch.__version__}')"
python -c "import transformers; print(f'Transformers version: {transformers.__version__}')"
```

### Method 2: Docker (Recommended for Deployment)

```bash
# Build Docker image
docker build -f docker/Dockerfile -t halluprobe:latest .

# Run container
docker run --gpus all -p 8000:8000 -p 7860:7860 halluprobe:latest

# With volume mounts
docker run --gpus all \
  -p 8000:8000 -p 7860:7860 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/outputs:/app/outputs \
  halluprobe:latest
```

### Method 3: Google Colab

```python
# In Colab cell
!git clone https://github.com/yourusername/halluprobe.git
%cd halluprobe
!pip install -q -r requirements.txt

# Import and use
from core.config import Config
from core.pipeline import HalluProbePipeline

config = Config()
pipeline = HalluProbePipeline(config)
```

## Troubleshooting

### CUDA Out of Memory

If you encounter OOM errors:

1. Reduce batch size in `config.yaml`:

   ```yaml
   training:
     batch_size: 16 # reduced from 32
   ```

2. Use quantization:

   ```yaml
   model:
     use_quantization: true
     quantization_bits: 4
   ```

3. Use smaller model:
   ```yaml
   model:
     base_model: "gpt2-medium"
   ```

### Missing Dependencies

```bash
# Reinstall from scratch
pip install --force-reinstall -r requirements.txt

# Or install specific packages
pip install torch transformers peft bitsandbytes
```

### CUDA Not Found

```bash
# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"

# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

## Verification

After installation, run:

```bash
# Run unit tests
python -m pytest tests/unit/ -v

# Test model loading
python -c "from core.config import Config; from core.model import DomainAdversarialProbe; m = DomainAdversarialProbe(4096, 4); print('✓ Model loads successfully')"

# Test API
python run_server.py &
sleep 5
curl http://localhost:8000/api/v1/health
```

## Hardware Recommendations

| Component | Minimum  | Recommended |
| --------- | -------- | ----------- |
| GPU       | 4GB VRAM | 8GB+ VRAM   |
| CPU       | 4 cores  | 8+ cores    |
| RAM       | 8GB      | 16GB+       |
| Storage   | 50GB     | 100GB+      |
| Network   | 100 Mbps | 1 Gbps      |

## Next Steps

1. Read the [README.md](README.md) for project overview
2. Check [USAGE.md](USAGE.md) for usage examples
3. Review [CONFIG.md](CONFIG.md) for configuration options
4. Explore [notebooks/](notebooks/) for example notebooks
