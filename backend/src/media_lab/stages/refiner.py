"""RefinerStage for high-resolution refinement via img2img.

Provides RefinerStage for refining generated images using img2img enhancement
with configurable denoising strength (diffusers pipeline with mock support).
"""

import logging
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

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


class RefinerStage(PipelineStage):
    """Refine image with high-resolution detail enhancement via img2img.

    Performs image-to-image refinement to enhance details and quality.
    Used for "High-Res Fix" workflow to improve generated images.

    Input context requirements:
        - 'image': dict with image data (may contain image_path key)
        - 'image_path': optional path to source image file

    Output context updates:
        - 'image': refined image data
        - 'refined_path': path to refined image
        - 'refiner_metadata': processing metadata
    """

    def __init__(self, model_name: str = "stable-diffusion-v1", strength: float = 0.3):
        """Initialize RefinerStage.

        Args:
            model_name: Model to use for refinement (default: stable-diffusion-v1).
            strength: Denoising strength for img2img (0.0-1.0, default: 0.3).
                     Lower values preserve original image, higher values allow more changes.

        Raises:
            ValueError: If strength is not in valid range [0.0, 1.0].
        """
        super().__init__("RefinerStage")
        if not (0.0 <= strength <= 1.0):
            raise ValueError(f"strength must be between 0.0 and 1.0, got {strength}")
        self.model_name = model_name
        self.strength = strength

    async def validate_input(self, context: "PipelineContext") -> bool:
        """Validate image exists from previous stage.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if image exists, False otherwise.
        """
        return context.get("image") is not None

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
        """Execute img2img refinement.

        In production, this would call diffusers StableDiffusionImg2ImgPipeline.
        Currently provides mock implementation using unsharp mask for detail enhancement.

        Args:
            context: Pipeline context.
            image_array: Image array to refine.

        Returns:
            Refined image array.
        """
        logger.info(
            "RefinerStage: Executing img2img with model=%s, strength=%.2f",
            self.model_name,
            self.strength,
        )

        # Mock img2img: apply unsharp masking for detail enhancement
        from scipy.ndimage import gaussian_filter

        # Apply unsharp masking for high-resolution detail enhancement
        # Lower blur sigma for subtler refinement
        base = gaussian_filter(image_array.astype(np.float32), sigma=1.0)
        enhanced = image_array.astype(np.float32) + self.strength * (
            image_array.astype(np.float32) - base
        )

        return np.clip(enhanced, 0, 255).astype(np.uint8)

    async def execute(self, context: "PipelineContext") -> "PipelineContext":
        """Execute high-resolution refinement via img2img.

        Args:
            context: Must contain 'image' from previous stage.

        Returns:
            Updated context with refined image.

        Raises:
            ValueError: If image is missing or invalid.
        """
        if not await self.validate_input(context):
            error = "RefinerStage requires 'image' from previous stage"
            context.set_error(error)
            raise ValueError(error)

        image_data = context.get("image")
        image_path = context.get("image_path")

        # Load image from file if path available, otherwise use image_data
        if isinstance(image_data, dict) and "image_path" in image_data:
            image_path = image_data["image_path"]

        if image_path and Path(image_path).exists():
            image_array = self.load_image_file(image_path)
        elif isinstance(image_data, dict):
            # Create mock image from data
            dims = image_data.get("dimensions", (512, 512))
            image_array = np.random.randint(50, 200, (*dims, 3), dtype=np.uint8)
        else:
            error = "RefinerStage: Cannot load source image"
            context.set_error(error)
            raise ValueError(error)

        # Get strength from context (allows per-call override) or use default
        strength = context.get("strength", self.strength)

        # Validate strength parameter
        if not (0.0 <= strength <= 1.0):
            error = f"RefinerStage: strength must be between 0.0 and 1.0, got {strength}"
            context.set_error(error)
            raise ValueError(error)

        # Execute img2img refinement
        refined_array = await self.execute_img2img(context, image_array)

        # Prepare output path
        if image_path:
            refined_path = str(image_path).replace(".png", "_refined.png")
        else:
            job_id = context.get("job_id", "unknown")
            refined_path = f"artifacts/{job_id}/refined.png"

        # Save result
        refined_pil = Image.fromarray(refined_array)
        Path(refined_path).parent.mkdir(parents=True, exist_ok=True)
        refined_pil.save(refined_path)

        # Update context
        refined_data = {
            **image_data,
            "refinement_level": 1,
            "high_res_fix": True,
            "dimensions": refined_array.shape[:2][::-1],  # (W, H)
        }

        context.set("image", refined_data)
        context.set("refined_path", refined_path)
        context.add_artifact(refined_path)

        # Metadata
        context.metadata["refiner"] = {
            "model": self.model_name,
            "strength": strength,
            "output_shape": refined_array.shape,
            "high_res_fix": True,
        }

        logger.info(
            "RefinerStage: Completed high-resolution refinement, saved to %s",
            refined_path,
        )

        return context


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
