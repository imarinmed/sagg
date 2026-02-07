"""High-level controller for media generation pipelines.

Workbench manages the complete lifecycle of a generation request:
- Setup: Initialize pipeline stages from config
- Execute: Run pipeline with input data
- Teardown: Collect results and artifacts
"""

import logging
from typing import Any

from src.media_lab.pipeline import (
    DetailerStage,
    Pipeline,
    PipelineContext,
    RefinerStage,
    TextToImageStage,
    UpscalerStage,
)
from src.models import PipelineConfig, StageConfig

logger = logging.getLogger(__name__)


class Workbench:
    """High-level controller for pipeline execution.

    Manages lifecycle of generation requests:
    1. Setup: Build pipeline from PipelineConfig
    2. Execute: Run pipeline with input data
    3. Teardown: Return results and artifacts
    """

    def __init__(self, config: PipelineConfig):
        """Initialize workbench with pipeline configuration.

        Args:
            config: PipelineConfig defining stages and parameters.
        """
        self.config = config
        self.pipeline: Pipeline | None = None
        self.context: PipelineContext | None = None
        logger.info("Workbench initialized with %d stages", len(config.stages))

    async def setup(self) -> None:
        """Setup pipeline from configuration.

        Builds pipeline stages in order based on config.

        Raises:
            ValueError: If stage type is unknown or config is invalid.
        """
        logger.info("Setting up pipeline with %d stages", len(self.config.stages))
        stages = []

        for stage_cfg in self.config.stages:
            stage = self._build_stage(stage_cfg)
            stages.append(stage)
            logger.debug("Added stage: %s", stage.name)

        self.pipeline = Pipeline(stages)
        logger.info("Pipeline setup complete with %d stages", len(stages))

    def _build_stage(self, stage_cfg: StageConfig) -> Any:
        """Build a single pipeline stage from configuration.

        Args:
            stage_cfg: StageConfig for the stage.

        Returns:
            Instantiated PipelineStage subclass.

        Raises:
            ValueError: If stage_type is unknown.
        """
        stage_type = stage_cfg.stage_type

        if stage_type == "text_to_image":
            return TextToImageStage()
        elif stage_type == "refiner":
            return RefinerStage()
        elif stage_type == "detailer":
            return DetailerStage()
        elif stage_type == "upscaler":
            upscale_factor = stage_cfg.parameters.get("upscale_factor", 2)
            return UpscalerStage(upscale_factor=upscale_factor)
        else:
            raise ValueError(f"Unknown stage type: {stage_type}")

    async def execute(self, input_data: dict[str, Any], job_id: str = "unknown") -> dict[str, Any]:
        """Execute complete pipeline with input data.

        Lifecycle:
        1. Setup pipeline from config
        2. Initialize context with input data
        3. Run pipeline stages sequentially
        4. Return results and artifacts

        Args:
            input_data: Input data for pipeline (e.g., prompt, seed, model).
            job_id: Job identifier for artifact paths.

        Returns:
            Dictionary with:
                - 'success': bool, whether execution succeeded
                - 'data': final context.data
                - 'artifacts': list of artifact paths
                - 'metadata': stage metadata
                - 'error': error message if failed

        Raises:
            ValueError: If pipeline setup fails or execution encounters error.
        """
        logger.info("Starting execution for job_id=%s", job_id)

        try:
            # Setup
            await self.setup()

            # Initialize context
            self.context = PipelineContext()
            self.context.set("job_id", job_id)

            # Merge input data and pipeline parameters
            merged_data = {**self.config.parameters, **input_data}
            for key, value in merged_data.items():
                self.context.set(key, value)

            logger.debug("Context initialized with keys: %s", list(self.context.data.keys()))

            # Execute pipeline
            if self.pipeline is None:
                raise ValueError("Pipeline not initialized")

            logger.info("Executing pipeline for job_id=%s", job_id)
            self.context = await self.pipeline.execute(self.context)
            logger.info("Pipeline execution completed for job_id=%s", job_id)

            # Teardown and collect results
            return self._teardown()

        except Exception as e:
            logger.error("Execution failed for job_id=%s: %s", job_id, str(e))
            return {
                "success": False,
                "data": {},
                "artifacts": [],
                "metadata": {},
                "error": str(e),
            }

    def _teardown(self) -> dict[str, Any]:
        """Collect results from execution context.

        Returns:
            Dictionary with execution results, artifacts, and metadata.
        """
        if self.context is None:
            return {
                "success": False,
                "data": {},
                "artifacts": [],
                "metadata": {},
                "error": "Context not initialized",
            }

        logger.info("Teardown: collecting %d artifacts", len(self.context.artifacts))

        success = self.context.error is None
        return {
            "success": success,
            "data": self.context.data,
            "artifacts": self.context.artifacts,
            "metadata": self.context.metadata,
            "error": self.context.error,
        }
