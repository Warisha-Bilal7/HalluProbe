"""Configuration management for HalluProbe."""
import yaml
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional


@dataclass
class ModelConfig:
    """Model configuration."""
    base_model: str = "gpt2-medium"
    use_quantization: bool = False
    quantization_bits: int = 4
    hidden_layers: List[int] = field(default_factory=lambda: [4, 8, 12, 16])
    hidden_dim: int = 1024


@dataclass
class TrainingConfig:
    """Training configuration."""
    batch_size: int = 32
    eval_batch_size: int = 64
    num_epochs: int = 5
    learning_rate: float = 1e-4
    weight_decay: float = 0.01
    warmup_steps: int = 500
    gradient_accumulation_steps: int = 2
    max_grad_norm: float = 1.0


@dataclass
class LossConfig:
    """Loss configuration."""
    lambda_domain: float = 0.1
    gamma_contrastive: float = 0.05
    temperature: float = 0.07


@dataclass
class ProbeConfig:
    """Probe architecture configuration."""
    encoder_hidden_dims: List[int] = field(default_factory=lambda: [512, 256])
    dropout_rate: float = 0.1
    num_domains: int = 4
    hallucination_head_dims: List[int] = field(default_factory=lambda: [128, 64])
    domain_head_dims: List[int] = field(default_factory=lambda: [128, 64])


@dataclass
class Config:
    """Main configuration class."""
    model: ModelConfig = field(default_factory=ModelConfig)
    training: TrainingConfig = field(default_factory=TrainingConfig)
    loss: LossConfig = field(default_factory=LossConfig)
    probe: ProbeConfig = field(default_factory=ProbeConfig)
    device: str = "cuda"
    mixed_precision: str = "fp16"
    num_workers: int = 4
    pin_memory: bool = True
    data_dir: str = "./data"
    output_dir: str = "./outputs"
    checkpoint_dir: str = "./checkpoints"
    log_dir: str = "./logs"
    use_wandb: bool = True
    use_mlflow: bool = True
    project_name: str = "halluprobe"
    run_name: str = "domain-invariant-probe-v1"

    @classmethod
    def from_yaml(cls, path: str) -> "Config":
        """Load configuration from YAML file."""
        with open(path, "r") as f:
            config_dict = yaml.safe_load(f)
        
        # Reconstruct nested configs
        if "model" in config_dict:
            config_dict["model"] = ModelConfig(**config_dict["model"])
        if "training" in config_dict:
            config_dict["training"] = TrainingConfig(**config_dict["training"])
        if "loss" in config_dict:
            config_dict["loss"] = LossConfig(**config_dict["loss"])
        if "probe" in config_dict:
            config_dict["probe"] = ProbeConfig(**config_dict["probe"])
        
        return cls(**config_dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return asdict(self)
