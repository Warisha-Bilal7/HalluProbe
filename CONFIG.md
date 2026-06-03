"""Configuration guide."""

# HalluProbe Configuration Guide

## Overview

Configuration in HalluProbe is managed through `config.yaml` and can be overridden programmatically.

## Configuration Sections

### Model Configuration

```yaml
model:
  base_model: "mistralai/Mistral-7B" # HuggingFace model identifier
  use_quantization: true # Enable 4-bit quantization
  quantization_bits: 4 # Quantization precision
  hidden_layers: [8, 16, 24, 32] # Layers to extract from
  hidden_dim: 4096 # Hidden dimension of base model
```

**Options:**

- `base_model`: "mistralai/Mistral-7B" or "gpt2-medium"
- `hidden_layers`: Should match model architecture (Mistral-7B has 32 layers)
- `hidden_dim`: Must match model's hidden dimension

### Training Configuration

```yaml
training:
  batch_size: 32 # Training batch size
  eval_batch_size: 64 # Evaluation batch size
  num_epochs: 5 # Number of epochs
  learning_rate: 1e-4 # Learning rate
  weight_decay: 0.01 # L2 regularization
  warmup_steps: 500 # Learning rate warmup
  gradient_accumulation_steps: 2 # Gradient accumulation
  max_grad_norm: 1.0 # Gradient clipping
```

**Tips:**

- Increase `batch_size` for faster training (if GPU memory allows)
- Decrease `learning_rate` if loss diverges
- Use `gradient_accumulation_steps` > 1 for effective larger batches

### Loss Configuration

```yaml
loss:
  lambda_domain: 0.1 # Weight for domain adversarial loss
  gamma_contrastive: 0.05 # Weight for contrastive loss
  temperature: 0.07 # Temperature for contrastive loss
```

**Effects:**

- Higher `lambda_domain`: Stronger domain invariance (better OOD performance)
- Higher `gamma_contrastive`: Stronger representation clustering (better generalization)
- Lower `temperature`: Sharperprobability distributions

### Probe Architecture

```yaml
probe:
  encoder_hidden_dims: [512, 256] # Encoder layer sizes
  dropout_rate: 0.1 # Dropout for regularization
  num_domains: 4 # Number of domain classes
  hallucination_head_dims: [128, 64] # Hallucination head sizes
  domain_head_dims: [128, 64] # Domain head sizes
```

### Optimization

```yaml
optimization:
  optimizer: "adamw" # Optimizer type (adamw, adam, sgd)
  scheduler: "cosine" # LR scheduler (cosine, linear, step)
  num_warmup_steps: 500 # Warmup steps
  gradient_clip_val: 1.0 # Gradient clipping value
```

### Data & Paths

```yaml
datasets:
  train:
    - name: "truthfulqa"
      split: "train"
      size: 817
    - name: "halueval"
      split: "train"
      size: 30000

paths:
  data_dir: "./data"
  output_dir: "./outputs"
  checkpoint_dir: "./checkpoints"
  log_dir: "./logs"
```

### Compute

```yaml
compute:
  device: "cuda" # Device (cuda, cpu, mps)
  mixed_precision: "fp16" # Precision (fp16, bf16, fp32)
  num_workers: 4 # DataLoader workers
  pin_memory: true # Pin memory for faster loading
```

### Experiment Tracking

```yaml
tracking:
  use_wandb: true # Enable Weights & Biases
  use_mlflow: true # Enable MLflow
  project_name: "halluprobe"
  run_name: "experiment-v1"
```

## Environment Variables

```bash
# Override model
export HALLUPROBE_MODEL="gpt2-medium"

# Override device
export HALLUPROBE_DEVICE="cpu"

# Override batch size
export HALLUPROBE_BATCH_SIZE=16

# Enable debug logging
export HALLUPROBE_LOG_LEVEL="DEBUG"
```

## Programmatic Configuration

```python
from core.config import Config, ModelConfig, TrainingConfig

# Create custom config
config = Config(
    model=ModelConfig(
        base_model="gpt2-medium",
        hidden_dim=768,
        hidden_layers=[6, 9, 12],
    ),
    training=TrainingConfig(
        batch_size=16,
        learning_rate=5e-5,
        num_epochs=3,
    ),
)

# Load from YAML
config = Config.from_yaml("custom_config.yaml")

# Save to dict
config_dict = config.to_dict()
```

## Performance Tuning

### For Faster Training

```yaml
training:
  batch_size: 64 # Increase batch size
  gradient_accumulation_steps: 1
  num_workers: 8 # More workers

compute:
  mixed_precision: "fp16" # Enable mixed precision
```

### For Better Generalization

```yaml
loss:
  lambda_domain: 0.2 # Stronger domain adversarial loss
  gamma_contrastive: 0.1 # Stronger contrastive loss

training:
  learning_rate: 5e-5 # Lower learning rate
  weight_decay: 0.05 # More regularization

probe:
  dropout_rate: 0.2 # More dropout
```

### For Memory Efficiency

```yaml
model:
  use_quantization: true # 4-bit quantization
  quantization_bits: 4

training:
  batch_size: 16 # Smaller batch size
  gradient_accumulation_steps: 2

compute:
  mixed_precision: "fp16"
```

## Dataset Configuration

```yaml
datasets:
  train:
    - name: "truthfulqa"
      domain: "general"
    - name: "halueval"
      domain: "multi"

  ood_test:
    - name: "medhalt"
      domain: "medical"
    - name: "legalbench"
      domain: "legal"
```

## Monitoring & Logging

```yaml
evaluation:
  metrics: ["f1", "precision", "recall", "auc_roc", "calibration"]
  threshold: 0.5
  save_predictions: true

tracking:
  use_wandb: true
  project_name: "halluprobe"
  run_name: "experiment-{timestamp}"
```

## Complete Example

```yaml
# High-performance configuration for multi-GPU training
model:
  base_model: "mistralai/Mistral-7B"
  use_quantization: false
  hidden_layers: [8, 16, 24, 32]
  hidden_dim: 4096

training:
  batch_size: 128
  num_epochs: 10
  learning_rate: 2e-4
  weight_decay: 0.01
  warmup_steps: 1000
  gradient_accumulation_steps: 1

loss:
  lambda_domain: 0.15
  gamma_contrastive: 0.08
  temperature: 0.05

probe:
  encoder_hidden_dims: [1024, 512]
  dropout_rate: 0.1
  num_domains: 4

optimization:
  optimizer: "adamw"
  scheduler: "cosine"

compute:
  device: "cuda"
  mixed_precision: "bf16"
  num_workers: 8

tracking:
  use_wandb: true
  project_name: "halluprobe-prod"
```

## Troubleshooting Configuration

| Issue               | Solution                                        |
| ------------------- | ----------------------------------------------- |
| Out of memory       | Reduce `batch_size`, enable `quantization`      |
| Loss diverging      | Reduce `learning_rate`, enable `gradient_clip`  |
| Slow training       | Increase `batch_size`, set `num_workers` higher |
| Poor generalization | Increase `lambda_domain`, `gamma_contrastive`   |
| Unstable training   | Reduce `learning_rate`, increase `weight_decay` |

## Next Steps

- See [USAGE.md](USAGE.md) for usage examples
- Check [README.md](README.md) for project overview
- Review [INSTALL.md](INSTALL.md) for installation guide
