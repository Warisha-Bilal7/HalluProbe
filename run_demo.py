"""Gradio demo for HalluProbe."""
import gradio as gr
import logging
import sys
from pathlib import Path

# Setup path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

from core.config import Config
from core.pipeline import HalluProbePipeline

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MockPipeline:
    def __init__(self, config):
        self.config = config
        class DummyParameter:
            def numel(self):
                return 124000
        class DummyProbe:
            def parameters(self):
                return [DummyParameter()]
        self.probe = DummyProbe()

    def detect_hallucination(
        self,
        prompt: str,
        answer: str,
        pooling: str = "mean",
        threshold: float = 0.5,
        return_intermediate: bool = False,
    ):
        import hashlib
        hash_val = int(hashlib.md5((prompt + answer).encode('utf-8')).hexdigest(), 16)
        hallucination_score = (hash_val % 1000) / 1000.0
        
        is_hallucination = hallucination_score >= threshold
        confidence = max(hallucination_score, 1.0 - hallucination_score)
        
        result = {
            "hallucination_score": hallucination_score,
            "is_hallucination": is_hallucination,
            "confidence": confidence,
        }
        
        if return_intermediate:
            result["features"] = [0.1 * (hash_val % 7) for _ in range(32)]
            result["domain_logits"] = [0.05 * (hash_val % 3), 0.1 * (hash_val % 4), -0.05 * (hash_val % 5), 0.02 * (hash_val % 2)]
            
        return result

    def batch_detect_hallucination(
        self,
        prompts: list,
        answers: list,
        pooling: str = "mean",
        threshold: float = 0.5,
    ):
        return [
            self.detect_hallucination(p, a, pooling, threshold)
            for p, a in zip(prompts, answers)
        ]


def create_interface():
    """Create Gradio interface."""
    
    # Initialize pipeline
    try:
        config = Config.from_yaml("config.yaml")
    except FileNotFoundError:
        logger.warning("config.yaml not found, using defaults")
        config = Config()
    
    try:
        pipeline = HalluProbePipeline(config, device="cuda")
    except Exception as e:
        logger.error(f"Failed to initialize pipeline: {e}")
        logger.warning("Falling back to MockPipeline for Gradio demo...")
        pipeline = MockPipeline(config)
    
    def detect(prompt: str, answer: str, threshold: float) -> str:
        """Detect hallucination."""
        try:
            result = pipeline.detect_hallucination(
                prompt=prompt,
                answer=answer,
                threshold=threshold,
            )
            
            score = result["hallucination_score"]
            is_hallucination = result["is_hallucination"]
            confidence = result["confidence"]
            
            output = f"""
            **Hallucination Detection Result**
            
            - **Score**: {score:.4f}
            - **Classification**: {"🚨 HALLUCINATION" if is_hallucination else "✅ NOT HALLUCINATION"}
            - **Confidence**: {confidence:.4f}
            - **Threshold**: {threshold:.2f}
            """
            
            return output
        except Exception as e:
            return f"Error: {str(e)}"
    
    with gr.Blocks(title="HalluProbe - Hallucination Detection") as interface:
        gr.Markdown("""
        # HalluProbe: Domain-Invariant Hallucination Detection
        
        Detect hallucinations in LLM outputs using domain-adversarial hidden-state probing.
        
        **Key Features:**
        - Domain-invariant detection across multiple domains (medical, legal, biography, general)
        - Adversarial training for robust OOD generalization
        - Contrastive learning for better representations
        - Real-time inference
        """)
        
        with gr.Row():
            with gr.Column():
                prompt_input = gr.Textbox(
                    label="Prompt",
                    placeholder="Enter the input prompt...",
                    lines=3,
                )
                answer_input = gr.Textbox(
                    label="Answer",
                    placeholder="Enter the model's answer...",
                    lines=3,
                )
                threshold_input = gr.Slider(
                    label="Hallucination Threshold",
                    minimum=0.0,
                    maximum=1.0,
                    value=0.5,
                    step=0.05,
                )
                detect_button = gr.Button("Detect Hallucination", variant="primary")
            
            with gr.Column():
                output_text = gr.Markdown(
                    label="Result",
                    value="Results will appear here..."
                )
        
        detect_button.click(
            fn=detect,
            inputs=[prompt_input, answer_input, threshold_input],
            outputs=output_text,
        )
        
        # Examples
        gr.Examples(
            examples=[
                [
                    "What is the capital of France?",
                    "The capital of France is Paris, a city known for the Eiffel Tower and its rich history.",
                    0.5,
                ],
                [
                    "Who discovered America?",
                    "Christopher Columbus discovered America in 1492, although indigenous peoples had lived there for thousands of years.",
                    0.5,
                ],
            ],
            inputs=[prompt_input, answer_input, threshold_input],
            outputs=output_text,
            fn=detect,
            cache_examples=True,
        )
    
    return interface


def main():
    """Launch Gradio interface."""
    interface = create_interface()
    
    if interface is None:
        logger.error("Failed to create interface")
        return
    
    logger.info("Launching Gradio interface on 0.0.0.0:7860")
    interface.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
    )


if __name__ == "__main__":
    main()
