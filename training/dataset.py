"""Dataset loading and processing."""
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from typing import List, Dict, Tuple, Optional
import logging
from datasets import load_dataset
import pandas as pd

logger = logging.getLogger(__name__)


class HallucinationDataset(Dataset):
    """Dataset for hallucination detection."""

    def __init__(
        self,
        prompts: List[str],
        answers: List[str],
        labels: List[int],
        domain_ids: List[int],
        max_length: int = 512,
    ):
        """
        Initialize dataset.

        Args:
            prompts: List of prompts
            answers: List of answers
            labels: List of hallucination labels (0 or 1)
            domain_ids: List of domain IDs
            max_length: Maximum sequence length
        """
        self.prompts = prompts
        self.answers = answers
        self.labels = torch.tensor(labels, dtype=torch.float32)
        self.domain_ids = torch.tensor(domain_ids, dtype=torch.long)
        self.max_length = max_length

        assert len(prompts) == len(answers) == len(labels) == len(domain_ids)
        self.length = len(prompts)

    def __len__(self) -> int:
        return self.length

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        return {
            "prompt": self.prompts[idx],
            "answer": self.answers[idx],
            "label": self.labels[idx],
            "domain_id": self.domain_ids[idx],
        }


class DatasetBuilder:
    """Build datasets for training and evaluation."""

    DOMAIN_MAP = {
        "general": 0,
        "medical": 1,
        "legal": 2,
        "biography": 3,
    }

    @classmethod
    def build_from_hf(
        cls,
        dataset_name: str,
        split: str = "train",
        domain: str = "general",
    ) -> Tuple[List[str], List[str], List[int], List[int]]:
        """
        Build dataset from HuggingFace.

        Args:
            dataset_name: Dataset name on HF hub
            split: Dataset split
            domain: Domain name

        Returns:
            Tuple of (prompts, answers, labels, domain_ids)
        """
        logger.info(f"Loading {dataset_name} from HuggingFace...")
        
        try:
            dataset = load_dataset(dataset_name, split=split)
        except Exception as e:
            logger.warning(f"Failed to load {dataset_name}: {e}")
            return [], [], [], []

        prompts = []
        answers = []
        labels = []
        domain_ids = []
        domain_id = cls.DOMAIN_MAP.get(domain, 0)

        # Handle different dataset formats
        for example in dataset:
            if dataset_name == "truthfulqa":
                prompts.append(example.get("question", ""))
                answers.append(example.get("best_answer", ""))
                labels.append(1 if "hallucin" in str(example).lower() else 0)
            elif dataset_name == "halueval":
                prompts.append(example.get("prompt", ""))
                answers.append(example.get("answer", ""))
                labels.append(int(example.get("hallucination", 0)))
            else:
                # Generic format
                prompts.append(example.get("prompt", example.get("question", "")))
                answers.append(example.get("answer", example.get("response", "")))
                labels.append(int(example.get("label", 0)))
            
            domain_ids.append(domain_id)

        logger.info(f"Loaded {len(prompts)} examples from {dataset_name}")
        return prompts, answers, labels, domain_ids

    @classmethod
    def build_from_csv(
        cls,
        csv_path: str,
        domain: str = "general",
    ) -> Tuple[List[str], List[str], List[int], List[int]]:
        """
        Build dataset from CSV file.

        Args:
            csv_path: Path to CSV file
            domain: Domain name

        Returns:
            Tuple of (prompts, answers, labels, domain_ids)
        """
        logger.info(f"Loading dataset from {csv_path}...")
        
        df = pd.read_csv(csv_path)
        
        prompts = df["prompt"].tolist()
        answers = df["answer"].tolist()
        labels = df["label"].tolist()
        
        domain_id = cls.DOMAIN_MAP.get(domain, 0)
        domain_ids = [domain_id] * len(prompts)
        
        logger.info(f"Loaded {len(prompts)} examples from {csv_path}")
        return prompts, answers, labels, domain_ids

    @classmethod
    def create_dataloader(
        cls,
        prompts: List[str],
        answers: List[str],
        labels: List[int],
        domain_ids: List[int],
        batch_size: int = 32,
        shuffle: bool = True,
        num_workers: int = 0,
    ) -> DataLoader:
        """
        Create PyTorch DataLoader.

        Args:
            prompts: List of prompts
            answers: List of answers
            labels: List of labels
            domain_ids: List of domain IDs
            batch_size: Batch size
            shuffle: Whether to shuffle
            num_workers: Number of workers

        Returns:
            DataLoader
        """
        dataset = HallucinationDataset(prompts, answers, labels, domain_ids)
        return DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=shuffle,
            num_workers=num_workers,
        )

    @classmethod
    def split_dataset(
        cls,
        prompts: List[str],
        answers: List[str],
        labels: List[int],
        domain_ids: List[int],
        train_ratio: float = 0.8,
    ) -> Tuple[Tuple[List, List, List, List], Tuple[List, List, List, List]]:
        """
        Split dataset into train and test.

        Args:
            prompts: List of prompts
            answers: List of answers
            labels: List of labels
            domain_ids: List of domain IDs
            train_ratio: Ratio of training data

        Returns:
            Tuple of (train_data, test_data)
        """
        n = len(prompts)
        train_n = int(n * train_ratio)
        
        indices = torch.randperm(n).tolist()
        train_idx = indices[:train_n]
        test_idx = indices[train_n:]
        
        train_data = (
            [prompts[i] for i in train_idx],
            [answers[i] for i in train_idx],
            [labels[i] for i in train_idx],
            [domain_ids[i] for i in train_idx],
        )
        
        test_data = (
            [prompts[i] for i in test_idx],
            [answers[i] for i in test_idx],
            [labels[i] for i in test_idx],
            [domain_ids[i] for i in test_idx],
        )
        
        return train_data, test_data
