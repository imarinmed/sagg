"""
Model Registry - Manages discovery and tracking of available models.

This module provides a lightweight registry for tracking safetensors and checkpoint
files without loading them into memory. It supports scanning directories, registering
models, and querying available models by type.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional

from src.models import ModelInfo, ModelType


class ModelRegistry:
    """
    Registry for discovering and managing available models.

    Supports recursive scanning of directories for safetensors and checkpoint files.
    Models are tracked by name and type without being loaded into VRAM.
    """

    SUPPORTED_EXTENSIONS = {".safetensors", ".ckpt"}

    def __init__(self):
        """Initialize empty model registry."""
        self._models: dict[str, ModelInfo] = {}

    def scan_models(self, directory: str | Path) -> list[ModelInfo]:
        """
        Recursively scan directory for model files.

        Args:
            directory: Path to directory to scan (creates if missing)

        Returns:
            List of discovered ModelInfo objects
        """
        dir_path = Path(directory)

        # Create directory if it doesn't exist
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            return []

        discovered = []

        if not dir_path.is_dir():
            return []

        # Recursively scan for supported extensions
        for file_path in dir_path.rglob("*"):
            if not file_path.is_file():
                continue

            if file_path.suffix.lower() not in self.SUPPORTED_EXTENSIONS:
                continue

            # Determine model type from extension
            if file_path.suffix.lower() == ".safetensors":
                model_type = ModelType.CHECKPOINT
            else:  # .ckpt
                model_type = ModelType.CHECKPOINT

            # Generate unique name from relative path and filename
            try:
                rel_path = file_path.relative_to(dir_path)
                # Use stem (filename without extension) as primary name
                model_name = file_path.stem
                # If duplicate, add parent dir for uniqueness
                if model_name in self._models:
                    parent_stem = rel_path.parent.name if rel_path.parent.name else file_path.stem
                    model_name = f"{parent_stem}_{file_path.stem}"
            except ValueError:
                # Fallback if relative_to fails
                model_name = file_path.stem

            # Get file size
            try:
                file_size = file_path.stat().st_size
            except OSError:
                file_size = None

            # Create ModelInfo
            model_info = ModelInfo(
                name=model_name,
                model_type=model_type,
                file_path=str(file_path.absolute()),
                file_size_bytes=file_size,
                discovered_at=datetime.now(),
            )

            self._models[model_name] = model_info
            discovered.append(model_info)

        return discovered

    def register_model(
        self,
        path: str | Path,
        model_type: ModelType,
        name: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[list[str]] = None,
    ) -> ModelInfo:
        """
        Manually register a model.

        Args:
            path: Path to model file
            model_type: Type of model (checkpoint, lora, embedding)
            name: Optional custom name (defaults to filename)
            description: Optional model description
            tags: Optional tags for categorization

        Returns:
            Registered ModelInfo

        Raises:
            FileNotFoundError: If model file doesn't exist
            ValueError: If file extension is not supported
        """
        file_path = Path(path)

        if not file_path.exists():
            raise FileNotFoundError(f"Model file not found: {file_path}")

        if file_path.suffix.lower() not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file extension '{file_path.suffix}'. "
                f"Supported: {self.SUPPORTED_EXTENSIONS}"
            )

        # Use provided name or generate from filename
        model_name = name or file_path.stem

        # Get file size
        try:
            file_size = file_path.stat().st_size
        except OSError:
            file_size = None

        # Create ModelInfo
        model_info = ModelInfo(
            name=model_name,
            model_type=model_type,
            file_path=str(file_path.absolute()),
            file_size_bytes=file_size,
            discovered_at=datetime.now(),
            description=description,
            tags=tags or [],
        )

        self._models[model_name] = model_info
        return model_info

    def get_model_path(self, name: str) -> Optional[str]:
        """
        Resolve model path by name.

        Args:
            name: Name of model to retrieve

        Returns:
            Absolute path to model file, or None if not found
        """
        if name in self._models:
            return self._models[name].file_path
        return None

    def get_model(self, name: str) -> Optional[ModelInfo]:
        """
        Get full model info by name.

        Args:
            name: Name of model

        Returns:
            ModelInfo object, or None if not found
        """
        return self._models.get(name)

    def list_models(self, model_type: Optional[ModelType] = None) -> list[ModelInfo]:
        """
        List available models, optionally filtered by type.

        Args:
            model_type: Optional filter by model type

        Returns:
            List of ModelInfo objects
        """
        if model_type is None:
            return list(self._models.values())

        return [m for m in self._models.values() if m.model_type == model_type]

    def list_all(self) -> list[ModelInfo]:
        """
        List all registered models.

        Returns:
            List of all ModelInfo objects
        """
        return list(self._models.values())

    def clear(self) -> None:
        """Clear all registered models."""
        self._models.clear()

    def remove_model(self, name: str) -> bool:
        """
        Remove a model from registry.

        Args:
            name: Name of model to remove

        Returns:
            True if model was removed, False if not found
        """
        if name in self._models:
            del self._models[name]
            return True
        return False

    def model_exists(self, name: str) -> bool:
        """
        Check if a model is registered.

        Args:
            name: Name of model

        Returns:
            True if model exists, False otherwise
        """
        return name in self._models

    def count_models(self, model_type: Optional[ModelType] = None) -> int:
        """
        Count registered models.

        Args:
            model_type: Optional filter by type

        Returns:
            Number of models (optionally filtered)
        """
        if model_type is None:
            return len(self._models)
        return sum(1 for m in self._models.values() if m.model_type == model_type)
