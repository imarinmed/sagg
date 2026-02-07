"""9-stage linear pipeline for media generation and enhancement.

Provides abstract base class and concrete implementations for:
- TextToImageStage: Generate image from text prompt
- RefinerStage: Refine generated image with additional details
- DetailerStage: Add fine detail enhancement
- UpscalerStage: Upscale image to higher resolution
"""

from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Optional


class PipelineContext:
    """Context object passed through pipeline stages.

    Stores intermediate results, metadata, and artifacts from each stage.
    """

    def __init__(self):
        """Initialize empty pipeline context."""
        self.data: dict[str, Any] = {}
        self.artifacts: list[str] = []
        self.metadata: dict[str, Any] = {}
        self.error: Optional[str] = None

    def set(self, key: str, value: Any) -> None:
        """Store value in context.

        Args:
            key: Context key.
            value: Value to store.
        """
        self.data[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieve value from context.

        Args:
            key: Context key.
            default: Default value if key not found.

        Returns:
            Value or default.
        """
        return self.data.get(key, default)

    def add_artifact(self, artifact_path: str) -> None:
        """Add artifact path to list.

        Args:
            artifact_path: Path to generated artifact.
        """
        self.artifacts.append(artifact_path)

    def set_error(self, error: str) -> None:
        """Mark context as failed with error message.

        Args:
            error: Error description.
        """
        self.error = error


class PipelineStage(ABC):
    """Abstract base class for pipeline stages.

    Each stage processes context and produces output for next stage.
    All stages must implement execute() method asynchronously.
    """

    def __init__(self, name: str):
        """Initialize pipeline stage.

        Args:
            name: Stage name for logging and identification.
        """
        self.name = name

    @abstractmethod
    async def execute(self, context: PipelineContext) -> PipelineContext:
        """Execute stage processing.

        Takes input context from previous stage, performs processing,
        updates context with results, and returns for next stage.

        Args:
            context: PipelineContext from previous stage.

        Returns:
            Updated PipelineContext for next stage.

        Raises:
            ValueError: If stage validation fails.
        """
        pass

    async def validate_input(self, context: PipelineContext) -> bool:
        """Validate stage input requirements.

        Override in subclass for custom validation.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if valid, False otherwise.
        """
        return True


class TextToImageStage(PipelineStage):
    """Generate image from text prompt.

    Input context requirements:
        - 'prompt': str, required text prompt
        - 'model': str, optional model name (default: 'stable-diffusion-3')

    Output context updates:
        - 'image': generated image data
        - 'image_path': path to saved image
    """

    def __init__(self):
        """Initialize TextToImage stage."""
        super().__init__("TextToImageStage")

    async def validate_input(self, context: PipelineContext) -> bool:
        """Validate required prompt exists.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if prompt exists, False otherwise.
        """
        prompt = context.get("prompt")
        return isinstance(prompt, str) and len(prompt) > 0

    async def execute(self, context: PipelineContext) -> PipelineContext:
        """Generate image from text prompt.

        Args:
            context: Must contain 'prompt' key.

        Returns:
            Updated context with image data.

        Raises:
            ValueError: If prompt is missing or invalid.
        """
        if not await self.validate_input(context):
            error = "TextToImageStage requires 'prompt' in context"
            context.set_error(error)
            raise ValueError(error)

        prompt = context.get("prompt")
        model = context.get("model", "stable-diffusion-3")

        # Simulate image generation
        image_data = {
            "model": model,
            "prompt": prompt,
            "dimensions": (1024, 1024),
            "seed": context.get("seed", 42),
        }

        image_path = f"artifacts/{context.get('job_id', 'unknown')}/generated.png"

        context.set("image", image_data)
        context.set("image_path", image_path)
        context.add_artifact(image_path)
        context.metadata["text_to_image"] = {
            "model": model,
            "prompt_length": len(prompt),
        }

        return context


class RefinerStage(PipelineStage):
    """Refine generated image with additional detail.

    Input context requirements:
        - 'image': image data from previous stage
        - 'image_path': path to image

    Output context updates:
        - 'image': refined image data
        - 'refined_path': path to refined image
    """

    def __init__(self):
        """Initialize Refiner stage."""
        super().__init__("RefinerStage")

    async def validate_input(self, context: PipelineContext) -> bool:
        """Validate image exists from previous stage.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if image exists, False otherwise.
        """
        return context.get("image") is not None

    async def execute(self, context: PipelineContext) -> PipelineContext:
        """Refine image with additional details.

        Args:
            context: Must contain 'image' from TextToImageStage.

        Returns:
            Updated context with refined image.

        Raises:
            ValueError: If image is missing.
        """
        if not await self.validate_input(context):
            error = "RefinerStage requires 'image' from previous stage"
            context.set_error(error)
            raise ValueError(error)

        image_data = context.get("image")
        original_path = context.get("image_path")

        # Simulate refinement
        refined_data = {
            **image_data,
            "refinement_level": context.get("refinement_level", 2),
            "detail_enhancement": True,
        }

        refined_path = original_path.replace(".png", "_refined.png")

        context.set("image", refined_data)
        context.set("refined_path", refined_path)
        context.add_artifact(refined_path)
        context.metadata["refiner"] = {
            "refinement_level": context.get("refinement_level", 2),
        }

        return context


class DetailerStage(PipelineStage):
    """Add fine detail enhancement to image.

    Input context requirements:
        - 'image': refined image data

    Output context updates:
        - 'image': detailed image data
        - 'detail_path': path to detailed image
    """

    def __init__(self):
        """Initialize Detailer stage."""
        super().__init__("DetailerStage")

    async def validate_input(self, context: PipelineContext) -> bool:
        """Validate refined image exists.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if image exists, False otherwise.
        """
        return context.get("image") is not None

    async def execute(self, context: PipelineContext) -> PipelineContext:
        """Add fine detail to image.

        Args:
            context: Must contain 'image' from RefinerStage.

        Returns:
            Updated context with detailed image.

        Raises:
            ValueError: If image is missing.
        """
        if not await self.validate_input(context):
            error = "DetailerStage requires 'image' from previous stage"
            context.set_error(error)
            raise ValueError(error)

        image_data = context.get("image")
        refined_path = context.get("refined_path", context.get("image_path"))

        # Simulate detail enhancement
        detailed_data = {
            **image_data,
            "detail_pass": 1,
            "edge_enhancement": True,
            "texture_detail": True,
        }

        detail_path = refined_path.replace("_refined.png", "_detailed.png")

        context.set("image", detailed_data)
        context.set("detail_path", detail_path)
        context.add_artifact(detail_path)
        context.metadata["detailer"] = {
            "detail_pass": 1,
            "edge_enhancement": True,
        }

        return context


class UpscalerStage(PipelineStage):
    """Upscale image to higher resolution.

    Input context requirements:
        - 'image': detailed image data

    Output context updates:
        - 'image': upscaled image data
        - 'upscaled_path': path to upscaled image
        - 'upscale_factor': upscaling multiplier used
    """

    def __init__(self, upscale_factor: int = 2):
        """Initialize Upscaler stage.

        Args:
            upscale_factor: Upscaling multiplier (default: 2x).
        """
        super().__init__("UpscalerStage")
        self.upscale_factor = upscale_factor

    async def validate_input(self, context: PipelineContext) -> bool:
        """Validate detailed image exists.

        Args:
            context: PipelineContext to validate.

        Returns:
            True if image exists, False otherwise.
        """
        return context.get("image") is not None

    async def execute(self, context: PipelineContext) -> PipelineContext:
        """Upscale image to higher resolution.

        Args:
            context: Must contain 'image' from DetailerStage.

        Returns:
            Updated context with upscaled image.

        Raises:
            ValueError: If image is missing.
        """
        if not await self.validate_input(context):
            error = "UpscalerStage requires 'image' from previous stage"
            context.set_error(error)
            raise ValueError(error)

        image_data = context.get("image")
        detail_path = context.get("detail_path", context.get("image_path"))

        # Simulate upscaling
        upscale_factor = context.get("upscale_factor", self.upscale_factor)

        original_dims = image_data.get("dimensions", (1024, 1024))
        upscaled_dims = (
            original_dims[0] * upscale_factor,
            original_dims[1] * upscale_factor,
        )

        upscaled_data = {
            **image_data,
            "upscale_factor": upscale_factor,
            "dimensions": upscaled_dims,
        }

        upscaled_path = detail_path.replace("_detailed.png", "_upscaled.png")

        context.set("image", upscaled_data)
        context.set("upscaled_path", upscaled_path)
        context.add_artifact(upscaled_path)
        context.metadata["upscaler"] = {
            "upscale_factor": upscale_factor,
            "original_dimensions": original_dims,
            "upscaled_dimensions": upscaled_dims,
        }

        return context


class Pipeline:
    """Orchestrates execution of linear stage pipeline.

    Maintains ordered list of stages and executes them sequentially,
    passing context through each stage.
    """

    def __init__(self, stages: list[PipelineStage]):
        """Initialize pipeline with stages.

        Args:
            stages: Ordered list of PipelineStage instances.
        """
        self.stages = stages

    async def execute(self, context: PipelineContext) -> PipelineContext:
        """Execute all stages in order.

        Args:
            context: Initial context for pipeline.

        Returns:
            Final context after all stages.

        Raises:
            ValueError: If any stage fails.
        """
        for stage in self.stages:
            if context.error:
                break
            try:
                context = await stage.execute(context)
            except Exception as e:
                context.set_error(f"{stage.name} failed: {str(e)}")
                raise

        return context
