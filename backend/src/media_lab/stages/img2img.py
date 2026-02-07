"""Img2ImgStage for image-to-image pipeline support.

Provides Img2ImgStage for img2img refinement using configurable denoising strength
(diffusers pipeline with mock support for testing).
"""

import contextlib
import logging
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from ..lora import LoRAConfig, LoRAManager

logger = logging.getLogger(__name__)


class PipelineStage:
    """Abstract base class for pipeline stages."""

    def __init__(self, name: str):
        """Initialize pipeline stage.

        Args:
            name: Stage name for logging and identification.
        """
        self.name = name

    async def execute(self, context: "PipelineContext") -> "PipelineContext":
        """Execute stage processing.

        Args:
            context: PipelineContext from previous stage.

        Returns:
            Updated PipelineContext for next stage.

        Raises:
            ValueError: If stage validation fails.
        """
        raise NotImplementedError

    async def validate_input(self, context: "PipelineContext") -> bool:
        """Validate stage input requirements.

        Override in subclass for custom validation.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if valid, False otherwise.
        """
        return True


class Img2ImgStage(PipelineStage):
    """Image-to-image refinement with configurable denoising strength.

    Performs image-to-image transformation to enhance, modify, or transform images.
    Controls transformation strength to balance preservation and change.

    Input context requirements:
        - 'source_image_path': path to source image file (from config or context)
        - 'image': optional dict with image data (fallback if no path)

    Output context updates:
        - 'image': transformed image data
        - 'img2img_path': path to output image
        - 'img2img_metadata': processing metadata
    """

    def __init__(
        self,
        model_name: str = "stable-diffusion-v1",
        strength: float = 0.75,
        guidance_scale: float = 7.5,
        loras: list[LoRAConfig] | None = None,
    ):
        """Initialize Img2ImgStage.

        Args:
            model_name: Model to use for transformation (default: stable-diffusion-v1).
            strength: Denoising strength for img2img (0.0-1.0, default: 0.75).
                     1.0 = complete change, 0.0 = no change.
            guidance_scale: Classifier-free guidance scale (default: 7.5).
            loras: Optional list of LoRAConfig objects to apply before execution.

        Raises:
            ValueError: If strength is not in valid range [0.0, 1.0].
        """
        super().__init__("Img2ImgStage")
        if not (0.0 <= strength <= 1.0):
            raise ValueError(f"strength must be between 0.0 and 1.0, got {strength}")
        self.model_name = model_name
        self.strength = strength
        self.guidance_scale = guidance_scale
        self.loras = loras or []
        self.lora_manager = LoRAManager()

    async def validate_input(self, context: "PipelineContext") -> bool:
        """Validate source image is available.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if source image path or image data exists, False otherwise.
        """
        source_path = context.get("source_image_path")
        image_data = context.get("image")
        return source_path is not None or image_data is not None

    def load_image_file(self, image_path: str) -> np.ndarray:
        """Load image from file path.

        Args:
            image_path: Path to image file.

        Returns:
            Image as numpy array (H, W, C) with uint8 dtype.

        Raises:
            FileNotFoundError: If image file not found.
            ValueError: If image cannot be loaded.
        """
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")

        try:
            img = Image.open(path).convert("RGB")
            return np.array(img)
        except Exception as e:
            raise ValueError(f"Failed to load image from {image_path}: {str(e)}") from e

    async def execute_img2img(
        self, context: "PipelineContext", image_array: np.ndarray
    ) -> np.ndarray:
        """Execute img2img transformation.

        In production, this would call diffusers StableDiffusionImg2ImgPipeline.
        Currently provides mock implementation using unsharp mask for detail enhancement.

        Args:
            context: Pipeline context.
            image_array: Image array to transform.

        Returns:
            Transformed image array.
        """
        logger.info(
            "Img2ImgStage: Executing img2img with model=%s, strength=%.2f, guidance=%.2f",
            self.model_name,
            self.strength,
            self.guidance_scale,
        )

        # Mock img2img: apply unsharp masking for detail enhancement
        from scipy.ndimage import gaussian_filter

        # Apply unsharp masking for transformation
        base = gaussian_filter(image_array.astype(np.float32), sigma=2.0)
        enhanced = image_array.astype(np.float32) + self.strength * (
            image_array.astype(np.float32) - base
        )

        return np.clip(enhanced, 0, 255).astype(np.uint8)

    async def execute(self, context: "PipelineContext") -> "PipelineContext":
        """Execute image-to-image transformation.

        Args:
            context: Must contain 'source_image_path' or 'image' data.

        Returns:
            Updated context with transformed image.

        Raises:
            ValueError: If source image is missing or invalid.
        """
        if not await self.validate_input(context):
            error = (
                "Img2ImgStage requires 'source_image_path' in config or 'image' from previous stage"
            )
            context.set_error(error)
            raise ValueError(error)

        # Get model from context (for real diffusers integration)
        # For now, this is a placeholder for mock implementation
        model = context.get("model")

        try:
            # Apply LoRAs if configured
            if self.loras and model is not None:
                logger.info(f"Img2ImgStage: Applying {len(self.loras)} LoRA(s)")
                self.lora_manager.apply_loras(model, self.loras)

            # Get source image
            source_image_path = context.get("source_image_path")
            image_data = context.get("image")

            # Load image from file if path available
            if source_image_path and Path(source_image_path).exists():
                image_array = self.load_image_file(source_image_path)
            elif isinstance(image_data, dict) and "image_path" in image_data:
                image_array = self.load_image_file(image_data["image_path"])
            elif isinstance(image_data, dict):
                # Create mock image from data
                dims = image_data.get("dimensions", (512, 512))
                image_array = np.random.randint(50, 200, (*dims, 3), dtype=np.uint8)
            else:
                error = "Img2ImgStage: Cannot load source image"
                context.set_error(error)
                raise ValueError(error)

            # Get strength from context (allows per-call override) or use default
            strength = context.get("strength", self.strength)

            # Validate strength parameter
            if not (0.0 <= strength <= 1.0):
                error = f"Img2ImgStage: strength must be between 0.0 and 1.0, got {strength}"
                context.set_error(error)
                raise ValueError(error)

            # Execute img2img transformation
            transformed_array = await self.execute_img2img(context, image_array)

            # Prepare output path
            if source_image_path:
                img2img_path = str(source_image_path).replace(".png", "_img2img.png")
            else:
                job_id = context.get("job_id", "unknown")
                img2img_path = f"artifacts/{job_id}/img2img.png"

            # Save result
            transformed_pil = Image.fromarray(transformed_array)
            Path(img2img_path).parent.mkdir(parents=True, exist_ok=True)
            transformed_pil.save(img2img_path)

            # Update context
            transformed_data = {
                **(image_data or {}),
                "img2img_applied": True,
                "dimensions": transformed_array.shape[:2][::-1],  # (W, H)
            }

            context.set("image", transformed_data)
            context.set("img2img_path", img2img_path)
            context.add_artifact(img2img_path)

            # Metadata
            context.metadata["img2img"] = {
                "model": self.model_name,
                "strength": strength,
                "guidance_scale": self.guidance_scale,
                "output_shape": transformed_array.shape,
                "source_path": source_image_path or "unknown",
            }

            logger.info(
                "Img2ImgStage: Completed img2img transformation, saved to %s",
                img2img_path,
            )

            return context
        finally:
            # Cleanup: remove any temporary LoRAs applied
            if self.loras and model is not None:
                with contextlib.suppress(ValueError, RuntimeError):
                    self.lora_manager.unload_loras(model)


# Stub PipelineContext class for compatibility when imported independently
class PipelineContext:
    """Context object passed through pipeline stages."""

    def __init__(self):
        """Initialize empty pipeline context."""
        self.data: dict[str, Any] = {}
        self.artifacts: list[str] = []
        self.metadata: dict[str, Any] = {}
        self.error: str | None = None

    def set(self, key: str, value: Any) -> None:
        """Store value in context."""
        self.data[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieve value from context."""
        return self.data.get(key, default)

    def add_artifact(self, artifact_path: str) -> None:
        """Add artifact path to list."""
        self.artifacts.append(artifact_path)

    def set_error(self, error: str) -> None:
        """Mark context as failed with error message."""
        self.error = error
