"""Hidden state extraction from LLMs."""
import torch
import torch.nn as nn
from typing import Dict, List, Optional, Tuple
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging

logger = logging.getLogger(__name__)


class HiddenStateExtractor:
    """Extracts hidden states from LLM forward passes."""

    def __init__(
        self,
        model_name: str,
        target_layers: List[int],
        use_quantization: bool = True,
        quantization_bits: int = 4,
        device: str = "cuda",
    ):
        """
        Initialize the hidden state extractor.

        Args:
            model_name: HuggingFace model identifier
            target_layers: Layer indices to extract from
            use_quantization: Whether to use quantization
            quantization_bits: Number of bits for quantization
            device: Device to load model on
        """
        self.model_name = model_name
        self.target_layers = target_layers
        self.device = device
        self.hidden_states: Dict[int, torch.Tensor] = {}
        self.hooks = []

        # Load model
        logger.info(f"Loading model: {model_name}")
        
        if use_quantization:
            from transformers import BitsAndBytesConfig
            
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True if quantization_bits == 4 else False,
                load_in_8bit=True if quantization_bits == 8 else False,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.bfloat16,
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=bnb_config,
                device_map="auto",
                trust_remote_code=True,
            )
        else:
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                device_map=device,
                trust_remote_code=True,
            )

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model.eval()

        # Register hooks for target layers
        self._register_hooks()

    def _register_hooks(self):
        """Register forward hooks to capture hidden states."""
        def create_hook(layer_idx):
            def hook(module, input, output):
                # Handle different output formats
                if isinstance(output, tuple):
                    hidden_state = output[0]
                else:
                    hidden_state = output
                self.hidden_states[layer_idx] = hidden_state.detach()
            return hook

        # Get the model's transformer layers
        if hasattr(self.model, "model"):  # Mistral, Llama, etc.
            layers = self.model.model.layers
        elif hasattr(self.model, "transformer"):  # GPT-2, etc.
            layers = self.model.transformer.h
        else:
            raise ValueError(f"Unknown model architecture for {self.model_name}")

        for layer_idx in self.target_layers:
            if layer_idx < len(layers):
                hook = layers[layer_idx].register_forward_hook(create_hook(layer_idx))
                self.hooks.append(hook)
                logger.info(f"Registered hook for layer {layer_idx}")

    def extract(self, prompt: str, answer: str) -> Dict[int, torch.Tensor]:
        """
        Extract hidden states for prompt + answer.

        Args:
            prompt: Input prompt
            answer: Model's answer/response

        Returns:
            Dictionary mapping layer index to hidden state tensor
        """
        self.hidden_states.clear()
        
        # Tokenize combined input
        combined_text = f"{prompt} {answer}"
        inputs = self.tokenizer(
            combined_text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512,
        ).to(self.device)

        with torch.no_grad():
            _ = self.model(**inputs)

        return self.hidden_states

    def pool_hidden_states(
        self,
        hidden_states: Dict[int, torch.Tensor],
        pooling: str = "mean",
    ) -> Dict[int, torch.Tensor]:
        """
        Pool hidden states over sequence dimension.

        Args:
            hidden_states: Dictionary of hidden states
            pooling: Pooling strategy ('mean', 'max', 'last')

        Returns:
            Dictionary of pooled hidden states (batch_size, hidden_dim)
        """
        pooled = {}
        for layer_idx, hidden_state in hidden_states.items():
            # hidden_state shape: (batch_size, seq_len, hidden_dim)
            if pooling == "mean":
                pooled[layer_idx] = hidden_state.mean(dim=1)
            elif pooling == "max":
                pooled[layer_idx] = hidden_state.max(dim=1)[0]
            elif pooling == "last":
                pooled[layer_idx] = hidden_state[:, -1, :]
            else:
                raise ValueError(f"Unknown pooling strategy: {pooling}")
        
        return pooled

    def cleanup(self):
        """Remove all hooks."""
        for hook in self.hooks:
            hook.remove()
        self.hooks.clear()

    def __del__(self):
        """Cleanup hooks on deletion."""
        self.cleanup()
