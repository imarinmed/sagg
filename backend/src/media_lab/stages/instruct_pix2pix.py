"""InstructPix2PixStage for instruction-based image editing in pipeline.

Provides InstructPix2PixStage for editing images based on text instructions
using instruction-guided diffusion (mock implementation for testing).
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


class InstructPix2PixStage(PipelineStage):
    """Instruction-based image editing with configurable guidance.

    Performs instruction-guided image editing to modify images based on text
    instructions like "make it red" or "add sunglasses".

    Input context requirements:
        - 'source_image_path': path to source image file (from config or context)
        - 'instruction': text instruction for editing (from config or context)
        - 'image': optional dict with image data (fallback if no path)

    Output context updates:
        - 'image': edited image data
        - 'instruct_pix2pix_path': path to output image
        - 'instruct_pix2pix_metadata': processing metadata
    """

    def __init__(
        self,
        model_name: str = "instruct-pix2pix-v1",
        guidance_scale: float = 7.5,
        image_guidance_scale: float = 1.5,
    ):
        """Initialize InstructPix2PixStage.

        Args:
            model_name: Model to use for instruction-based editing (default: instruct-pix2pix-v1).
            guidance_scale: Text guidance scale for instruction (default: 7.5).
            image_guidance_scale: Image guidance scale to preserve source (default: 1.5).

        Raises:
            ValueError: If guidance scales are not positive.
        """
        super().__init__("InstructPix2PixStage")
        if guidance_scale <= 0:
            raise ValueError(f"guidance_scale must be positive, got {guidance_scale}")
        if image_guidance_scale <= 0:
            raise ValueError(f"image_guidance_scale must be positive, got {image_guidance_scale}")
        self.model_name = model_name
        self.guidance_scale = guidance_scale
        self.image_guidance_scale = image_guidance_scale

    async def validate_input(self, context: "PipelineContext") -> bool:
        """Validate source image and instruction are available.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if source image path/data and instruction exist, False otherwise.
        """
        source_path = context.get("source_image_path")
        image_data = context.get("image")
        instruction = context.get("instruction")

        has_image = source_path is not None or image_data is not None
        has_instruction = isinstance(instruction, str) and len(instruction) > 0

        return has_image and has_instruction

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

    async def execute_instruct_pix2pix(
        self, context: "PipelineContext", image_array: np.ndarray, instruction: str
    ) -> np.ndarray:
        """Execute instruction-based image editing.

        In production, this would call diffusers InstructPix2PixPipeline.
        Currently provides mock implementation using color adjustments based on instruction.

        Args:
            context: Pipeline context.
            image_array: Image array to edit.
            instruction: Text instruction for editing.

        Returns:
            Edited image array.
        """
        logger.info(
            "InstructPix2PixStage: Executing instruction-based editing with model=%s, guidance=%.2f, instruction='%s'",
            self.model_name,
            self.guidance_scale,
            instruction[:50],  # Log first 50 chars of instruction
        )

        # Mock instruction-based editing: apply subtle color shift based on instruction keywords
        edited = image_array.astype(np.float32).copy()

        # Parse instruction for common keywords
        instruction_lower = instruction.lower()

        # Apply mock edits based on instruction keywords
        if "red" in instruction_lower or "rouge" in instruction_lower:
            # Enhance red channel
            edited[:, :, 0] = np.clip(edited[:, :, 0] * 1.2, 0, 255)

        if "blue" in instruction_lower or "bleu" in instruction_lower:
            # Enhance blue channel
            edited[:, :, 2] = np.clip(edited[:, :, 2] * 1.2, 0, 255)

        if "green" in instruction_lower or "vert" in instruction_lower:
            # Enhance green channel
            edited[:, :, 1] = np.clip(edited[:, :, 1] * 1.2, 0, 255)

        if "bright" in instruction_lower or "clair" in instruction_lower:
            # Increase brightness
            edited = np.clip(edited * 1.15, 0, 255)

        if "dark" in instruction_lower or "sombre" in instruction_lower:
            # Decrease brightness
            edited = np.clip(edited * 0.85, 0, 255)

        if "saturate" in instruction_lower or "vibrant" in instruction_lower:
            # Increase saturation (mock)
            mean = edited.mean(axis=2, keepdims=True)
            edited = np.clip(mean + (edited - mean) * 1.3, 0, 255)

        # Default: apply subtle guidance-based adjustment
        if len(instruction) > 0:
            # Apply guidance-based enhancement (mock: slightly enhance detail)
            from scipy.ndimage import gaussian_filter

            base = gaussian_filter(edited, sigma=1.0)
            guidance_factor = min(self.guidance_scale / 10.0, 1.0)  # Normalize to 0-1
            edited = np.clip(edited + guidance_factor * (edited - base) * 0.5, 0, 255)

        return np.clip(edited, 0, 255).astype(np.uint8)

    async def execute(self, context: "PipelineContext") -> "PipelineContext":
        """Execute instruction-based image editing.

        Args:
            context: Must contain 'source_image_path' or 'image' data and 'instruction'.

        Returns:
            Updated context with edited image.

        Raises:
            ValueError: If source image or instruction is missing or invalid.
        """
        if not await self.validate_input(context):
            error = (
                "InstructPix2PixStage requires 'source_image_path' or 'image' "
                "and 'instruction' in context"
            )
            context.set_error(error)
            raise ValueError(error)

        try:
            # Get instruction from context
            instruction = context.get("instruction")

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
                error = "InstructPix2PixStage: Cannot load source image"
                context.set_error(error)
                raise ValueError(error)

            # Execute instruction-based editing
            edited_array = await self.execute_instruct_pix2pix(context, image_array, instruction)

            # Prepare output path
            if source_image_path:
                instruct_pix2pix_path = str(source_image_path).replace(
                    ".png", "_instruct_pix2pix.png"
                )
            else:
                job_id = context.get("job_id", "unknown")
                instruct_pix2pix_path = f"artifacts/{job_id}/instruct_pix2pix.png"

            # Save result
            edited_pil = Image.fromarray(edited_array)
            Path(instruct_pix2pix_path).parent.mkdir(parents=True, exist_ok=True)
            edited_pil.save(instruct_pix2pix_path)

            # Update context
            edited_data = {
                **(image_data or {}),
                "instruct_pix2pix_applied": True,
                "instruction": instruction,
                "dimensions": edited_array.shape[:2][::-1],  # (W, H)
            }

            context.set("image", edited_data)
            context.set("instruct_pix2pix_path", instruct_pix2pix_path)
            context.add_artifact(instruct_pix2pix_path)

            # Metadata
            context.metadata["instruct_pix2pix"] = {
                "model": self.model_name,
                "instruction": instruction,
                "guidance_scale": self.guidance_scale,
                "image_guidance_scale": self.image_guidance_scale,
                "output_shape": edited_array.shape,
                "source_path": source_image_path or "unknown",
            }

            logger.info(
                "InstructPix2PixStage: Completed instruction-based editing, saved to %s",
                instruct_pix2pix_path,
            )

            return context

        except (FileNotFoundError, ValueError):
            raise


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
