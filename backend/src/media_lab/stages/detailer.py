"""DetailerStage for fine detail enhancement with mask support and ROI cropping.

Provides DetailerStage for inpainting with mask or img2img enhancement
using diffusers pipelines (with mock/stub support for non-GPU environments).
"""

import contextlib
import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from ..lora import LoRAConfig, LoRAManager

logger = logging.getLogger(__name__)


class PipelineStage(ABC):
    """Abstract base class for pipeline stages."""

    def __init__(self, name: str):
        """Initialize pipeline stage.

        Args:
            name: Stage name for logging and identification.
        """
        self.name = name

    @abstractmethod
    async def execute(self, context: "PipelineContext") -> "PipelineContext":
        """Execute stage processing.

        Args:
            context: PipelineContext from previous stage.

        Returns:
            Updated PipelineContext for next stage.

        Raises:
            ValueError: If stage validation fails.
        """
        pass

    async def validate_input(self, context: "PipelineContext") -> bool:
        """Validate stage input requirements.

        Override in subclass for custom validation.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if valid, False otherwise.
        """
        return True


class DetailerStage(PipelineStage):
    """Add fine detail enhancement to image with optional mask.

    Supports two modes:
    1. Inpainting: If mask provided, use inpainting to refine masked regions
    2. Img2Img: If no mask, apply full image enhancement via img2img

    Input context requirements:
        - 'image': dict with image data (may contain image_path key)
        - 'image_path': optional path to source image file
        - 'mask': optional mask array/dict for inpainting
        - 'roi': optional Region of Interest (x, y, w, h) for cropping

    Output context updates:
        - 'image': enhanced image data
        - 'detail_path': path to enhanced image
        - 'detailer_metadata': processing metadata
    """

    def __init__(
        self,
        model_name: str = "stable-diffusion-inpaint-v1",
        strength: float = 0.75,
        guidance_scale: float = 7.5,
        center_crop_ratio: float = 0.8,
        loras: list[LoRAConfig] | None = None,
    ):
        """Initialize DetailerStage.

        Args:
            model_name: Model to use for enhancement (default: stable-diffusion-inpaint-v1).
            strength: Denoising strength for img2img (0.0-1.0, default: 0.75).
            guidance_scale: Classifier-free guidance scale (default: 7.5).
            center_crop_ratio: For no-mask mode, crop ratio (0.0-1.0, default: 0.8).
            loras: Optional list of LoRAConfig objects to apply before execution.
        """
        super().__init__("DetailerStage")
        self.model_name = model_name
        self.strength = strength
        self.guidance_scale = guidance_scale
        self.center_crop_ratio = center_crop_ratio
        self.loras = loras or []
        self.lora_manager = LoRAManager()

    async def validate_input(self, context: "PipelineContext") -> bool:
        """Validate image exists from previous stage.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if image exists, False otherwise.
        """
        return context.get("image") is not None

    def detect_roi(self, image: np.ndarray) -> tuple[int, int, int, int]:
        """Simple ROI detection using center-crop heuristic.

        In production, this would use face detection or semantic segmentation.
        Currently implements simple center-crop with configurable ratio.

        Args:
            image: Image array (H, W) or (H, W, C).

        Returns:
            Tuple of (x, y, width, height) for ROI bounding box.
        """
        h, w = image.shape[:2]
        crop_w = int(w * self.center_crop_ratio)
        crop_h = int(h * self.center_crop_ratio)
        x = (w - crop_w) // 2
        y = (h - crop_h) // 2
        return (x, y, crop_w, crop_h)

    def crop_roi(self, image: np.ndarray, roi: tuple[int, int, int, int]) -> np.ndarray:
        """Crop region of interest from image.

        Args:
            image: Image array (H, W, C).
            roi: Tuple of (x, y, width, height).

        Returns:
            Cropped image array.
        """
        x, y, w, h = roi
        return image[y : y + h, x : x + w]

    def composite_roi(
        self,
        base_image: np.ndarray,
        roi_image: np.ndarray,
        roi: tuple[int, int, int, int],
        mask: np.ndarray | None = None,
    ) -> np.ndarray:
        """Composite ROI back into base image with optional mask blending.

        Args:
            base_image: Base image array (H, W, C).
            roi_image: Processed ROI image array.
            roi: Tuple of (x, y, width, height).
            mask: Optional blend mask (0-1 values).

        Returns:
            Composited image array.
        """
        x, y, w, h = roi
        result = base_image.copy()

        if mask is not None:
            # Blend with mask
            mask_array = np.array(mask) if isinstance(mask, list | tuple) else mask
            mask_normalized_raw = mask_array.astype(np.float32)
            if mask_array.max() > 1:
                mask_normalized = mask_normalized_raw / 255.0
            else:
                mask_normalized = mask_normalized_raw

            # Ensure 3-channel mask for color blending
            if len(mask_normalized.shape) == 2:
                mask_normalized = np.stack([mask_normalized] * 3, axis=-1)

            result[y : y + h, x : x + w] = (
                roi_image.astype(np.float32) * mask_normalized
                + result[y : y + h, x : x + w].astype(np.float32) * (1 - mask_normalized)
            ).astype(np.uint8)
        else:
            # Direct replacement
            result[y : y + h, x : x + w] = roi_image

        return result

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
            raise ValueError(
                f"Failed to load image from {image_path}: {str(e)}"
            ) from e

    async def execute_inpainting(
        self,
        context: "PipelineContext",
        image_array: np.ndarray,
        mask_array: np.ndarray,
    ) -> np.ndarray:
        """Execute inpainting with mask.

        In production, this would call diffusers StableDiffusionInpaintPipeline.
        Currently provides mock implementation with noise injection.

        Args:
            context: Pipeline context.
            image_array: Image array to inpaint.
            mask_array: Mask array (0=preserve, 1=inpaint).

        Returns:
            Inpainted image array.
        """
        logger.info(
            "DetailerStage: Executing inpainting with model=%s, strength=%.2f",
            self.model_name,
            self.strength,
        )

        # Mock inpainting: apply Gaussian blur to masked regions to simulate refinement
        from scipy.ndimage import gaussian_filter

        # Normalize mask to 0-1
        mask_normalized = mask_array.astype(np.float32)
        if mask_normalized.max() > 1:
            mask_normalized = mask_normalized / 255.0

        # Ensure 3-channel mask
        if len(mask_normalized.shape) == 2:
            mask_normalized = np.stack([mask_normalized] * 3, axis=-1)

        # Apply Gaussian blur to masked regions (simulating detail enhancement)
        blurred = gaussian_filter(image_array.astype(np.float32), sigma=1.5)
        result = (
            image_array.astype(np.float32) * (1 - mask_normalized) + blurred * mask_normalized
        ).astype(np.uint8)

        return result

    async def execute_img2img(
        self, context: "PipelineContext", image_array: np.ndarray
    ) -> np.ndarray:
        """Execute img2img enhancement without mask.

        In production, this would call diffusers StableDiffusionImg2ImgPipeline.
        Currently provides mock implementation with detail enhancement.

        Args:
            context: Pipeline context.
            image_array: Image array to enhance.

        Returns:
            Enhanced image array.
        """
        logger.info(
            "DetailerStage: Executing img2img with model=%s, strength=%.2f, guidance=%.2f",
            self.model_name,
            self.strength,
            self.guidance_scale,
        )

        # Mock img2img: apply unsharp mask to simulate detail enhancement
        from scipy.ndimage import gaussian_filter

        # Apply unsharp masking for detail enhancement
        base = gaussian_filter(image_array.astype(np.float32), sigma=2.0)
        enhanced = image_array.astype(np.float32) + self.strength * (
            image_array.astype(np.float32) - base
        )

        return np.clip(enhanced, 0, 255).astype(np.uint8)

    async def execute(self, context: "PipelineContext") -> "PipelineContext":
        """Execute detail enhancement with optional mask support.

        Args:
            context: Must contain 'image' from previous stage.

        Returns:
            Updated context with detailed image.

        Raises:
            ValueError: If image is missing or invalid.
        """
        if not await self.validate_input(context):
            error = "DetailerStage requires 'image' from previous stage"
            context.set_error(error)
            raise ValueError(error)

        # Get model from context (for real diffusers integration)
        # For now, this is a placeholder for mock implementation
        model = context.get("model")

        try:
            # Apply LoRAs if configured
            if self.loras and model is not None:
                logger.info(f"DetailerStage: Applying {len(self.loras)} LoRA(s)")
                self.lora_manager.apply_loras(model, self.loras)

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
                error = "DetailerStage: Cannot load source image"
                context.set_error(error)
                raise ValueError(error)

            # Check for ROI in context
            roi = context.get("roi")
            if roi is None:
                # Auto-detect ROI using center-crop heuristic
                roi = self.detect_roi(image_array)
                logger.info("DetailerStage: Auto-detected ROI: %s", roi)

            # Crop to ROI
            roi_image = self.crop_roi(image_array, roi)

            # Process based on mask availability
            mask = context.get("mask")
            if mask is not None:
                # Inpainting mode
                if isinstance(mask, dict):
                    mask_array = np.array(mask.get("data", np.ones_like(roi_image[:, :, 0])))
                else:
                    mask_array = np.array(mask)

                # Ensure mask matches ROI size
                if mask_array.shape[:2] != roi_image.shape[:2]:
                    mask_pil = Image.fromarray(
                        (mask_array * 255).astype(np.uint8)
                        if mask_array.max() <= 1
                        else mask_array.astype(np.uint8)
                    )
                    x, y, w, h = roi
                    mask_pil = mask_pil.resize((w, h), Image.BILINEAR)
                    mask_array = np.array(mask_pil)

                enhanced_roi = await self.execute_inpainting(context, roi_image, mask_array)
                context.set("detailer_mode", "inpainting")
            else:
                # Img2img mode (no mask)
                enhanced_roi = await self.execute_img2img(context, roi_image)
                context.set("detailer_mode", "img2img")
                mask_array = None

            # Composite back into full image
            result_image = self.composite_roi(image_array, enhanced_roi, roi, mask_array)

            # Prepare output paths
            if image_path:
                detail_path = str(image_path).replace(".png", "_detailed.png")
            else:
                job_id = context.get("job_id", "unknown")
                detail_path = f"artifacts/{job_id}/detailed.png"

            # Save result
            result_pil = Image.fromarray(result_image)
            Path(detail_path).parent.mkdir(parents=True, exist_ok=True)
            result_pil.save(detail_path)

            # Update context
            detailed_data = {
                **image_data,
                "detail_pass": 1,
                "edge_enhancement": True,
                "texture_detail": True,
                "dimensions": result_image.shape[:2][::-1],  # (W, H)
            }

            context.set("image", detailed_data)
            context.set("detail_path", detail_path)
            context.add_artifact(detail_path)

            # Metadata
            context.metadata["detailer"] = {
                "model": self.model_name,
                "mode": context.get("detailer_mode", "unknown"),
                "roi": list(roi),
                "strength": self.strength,
                "guidance_scale": self.guidance_scale,
                "output_shape": result_image.shape,
            }

            logger.info("DetailerStage: Completed detail enhancement, saved to %s", detail_path)

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
