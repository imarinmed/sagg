"""
LoRA Manager - Handles loading, fusing, and unloading LoRA adapters.

This module provides the LoRAManager class for managing Low-Rank Adaptation (LoRA)
adapters with diffusers models. It supports loading, fusing, unfusing, and applying
multiple LoRAs with configurable weights.
"""

from pathlib import Path
from typing import Any, Optional
import logging
from threading import RLock

logger = logging.getLogger(__name__)


class LoRAConfig:
    """Configuration for a single LoRA adapter."""

    def __init__(
        self,
        lora_path: str | Path,
        adapter_name: Optional[str] = None,
        weight: float = 1.0,
    ):
        """
        Initialize LoRA configuration.

        Args:
            lora_path: Path to LoRA weights file (.safetensors or .bin)
            adapter_name: Optional name for the adapter (defaults to filename stem)
            weight: Weight/scale factor for this LoRA (default 1.0)
        """
        self.lora_path = Path(lora_path)
        self.adapter_name = adapter_name or self.lora_path.stem
        self.weight = float(weight)

    def __repr__(self) -> str:
        return (
            f"LoRAConfig(path={self.lora_path}, adapter={self.adapter_name}, weight={self.weight})"
        )


class LoRAManager:
    """
    Manager for LoRA adapters with diffusers models.

    Supports loading, fusing, unfusing, and applying multiple LoRA adapters
    to diffusers-compatible models. Implements thread-safe operations and
    tracks loaded adapters.
    """

    def __init__(self):
        """Initialize LoRA manager."""
        self._loaded_loras: dict[str, dict[str, Any]] = {}
        self._lock = RLock()

    def load_lora(
        self,
        model: Any,
        lora_path: str | Path,
        adapter_name: Optional[str] = None,
        weight: float = 1.0,
    ) -> None:
        """
        Load a LoRA adapter into a model.

        Loads LoRA weights from a file using the model's load_lora_weights method.
        If the model supports LoRA loading, the adapter is loaded and tracked.

        Args:
            model: The diffusers model (e.g., StableDiffusionPipeline)
            lora_path: Path to LoRA weights file (.safetensors or .bin)
            adapter_name: Optional name for the adapter (defaults to filename)
            weight: Weight/scale factor for this LoRA (default 1.0)

        Raises:
            FileNotFoundError: If LoRA file doesn't exist
            ValueError: If model doesn't support LoRA loading
            RuntimeError: If loading fails
        """
        lora_path = Path(lora_path)
        adapter_name = adapter_name or lora_path.stem

        if not lora_path.exists():
            raise FileNotFoundError(f"LoRA file not found: {lora_path}")

        with self._lock:
            # Check if model has load_lora_weights method (diffusers LoraLoaderMixin)
            if not hasattr(model, "load_lora_weights"):
                raise ValueError(
                    f"Model does not support LoRA loading. "
                    f"Expected load_lora_weights method."
                )

            try:
                # Load LoRA weights into model
                model.load_lora_weights(str(lora_path), adapter_name=adapter_name)

                # Track loaded LoRA
                self._loaded_loras[adapter_name] = {
                    "path": str(lora_path),
                    "weight": weight,
                    "fused": False,
                }

                logger.info(
                    f"Loaded LoRA '{adapter_name}' from {lora_path} "
                    f"with weight {weight}"
                )

            except (FileNotFoundError, ValueError):
                # Re-raise these exceptions as-is
                raise
            except Exception as e:
                logger.error(f"Failed to load LoRA from {lora_path}: {e}")
                raise RuntimeError(
                    f"Failed to load LoRA adapter: {str(e)}"
                ) from e

    def unload_loras(self, model: Any) -> None:
        """
        Unload and remove all LoRA adapters from a model.

        Unfuses and removes all loaded LoRA adapters from the model.
        Clears the internal tracking of loaded adapters.

        Args:
            model: The diffusers model with loaded LoRAs

        Raises:
            ValueError: If model doesn't support LoRA operations
            RuntimeError: If unfusing fails
        """
        with self._lock:
            try:
                # Check if model has unfuse_lora method
                if hasattr(model, "unfuse_lora"):
                    model.unfuse_lora()
                    logger.info("Unfused all LoRAs from model")

                # Check if model has unload_lora_weights method
                if hasattr(model, "unload_lora_weights"):
                    model.unload_lora_weights()
                    logger.info("Unloaded all LoRA weights from model")

                # Clear tracking
                self._loaded_loras.clear()
                logger.info("Cleared LoRA tracking")

            except Exception as e:
                logger.error(f"Failed to unload LoRAs: {e}")
                raise RuntimeError(f"Failed to unload LoRAs: {str(e)}") from e

    def apply_loras(
        self,
        model: Any,
        lora_configs: list[LoRAConfig],
        fuse: bool = False,
    ) -> None:
        """
        Apply multiple LoRA adapters to a model.

        Loads multiple LoRA adapters and optionally fuses them into the model.
        Supports weighted combinations of multiple LoRAs.

        Args:
            model: The diffusers model
            lora_configs: List of LoRAConfig objects
            fuse: Whether to fuse LoRAs into model weights (default False)

        Raises:
            ValueError: If lora_configs is empty or invalid
            FileNotFoundError: If any LoRA file doesn't exist
            RuntimeError: If applying fails
        """
        if not lora_configs:
            raise ValueError("lora_configs cannot be empty")

        # First unload any existing LoRAs
        try:
            self.unload_loras(model)
        except (ValueError, RuntimeError):
            # Model might not have any loaded LoRAs yet
            pass

        # Load each LoRA config
        for config in lora_configs:
            self.load_lora(
                model,
                config.lora_path,
                adapter_name=config.adapter_name,
                weight=config.weight,
            )

        # Set weights if model supports it
        if len(lora_configs) > 0 and hasattr(model, "set_adapters"):
            adapter_names = [cfg.adapter_name for cfg in lora_configs]
            adapter_weights = [cfg.weight for cfg in lora_configs]
            try:
                model.set_adapters(adapter_names, adapter_weights=adapter_weights)
                logger.info(f"Set adapter weights: {dict(zip(adapter_names, adapter_weights))}")
            except Exception as e:
                logger.warning(f"Could not set adapter weights: {e}")

        # Optionally fuse LoRAs into model weights
        if fuse and hasattr(model, "fuse_lora"):
            try:
                model.fuse_lora()
                for name in self._loaded_loras:
                    self._loaded_loras[name]["fused"] = True
                logger.info("Fused LoRAs into model weights")
            except Exception as e:
                logger.warning(f"Failed to fuse LoRAs: {e}")

    def get_loaded_loras(self) -> dict[str, dict[str, Any]]:
        """
        Get information about currently loaded LoRAs.

        Returns:
            Dictionary mapping adapter names to their metadata
        """
        with self._lock:
            return dict(self._loaded_loras)

    def has_lora(self, adapter_name: str) -> bool:
        """
        Check if a LoRA adapter is currently loaded.

        Args:
            adapter_name: Name of the adapter

        Returns:
            True if adapter is loaded, False otherwise
        """
        with self._lock:
            return adapter_name in self._loaded_loras

    def clear(self) -> None:
        """Clear all tracked LoRA information."""
        with self._lock:
            self._loaded_loras.clear()
            logger.info("Cleared all LoRA tracking")
