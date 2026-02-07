"""High-level controller for media generation pipelines.

Workbench manages the complete lifecycle of a generation request:
- Setup: Initialize pipeline stages from config
- Execute: Run pipeline with input data
- Teardown: Collect results and artifacts
"""

import logging
import random
from typing import Any

from src.media_lab.pipeline import (
    DetailerStage,
    Pipeline,
    PipelineContext,
    RefinerStage,
    TextToImageStage,
    UpscalerStage,
)
from src.media_lab.stages.img2img import Img2ImgStage
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
        self.checkpoint_artifacts: dict[str, dict[int, str]] = {}
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
        elif stage_type == "img2img":
            model_name = stage_cfg.parameters.get("model_name", "stable-diffusion-v1")
            strength = stage_cfg.parameters.get("strength", 0.75)
            guidance_scale = stage_cfg.parameters.get("guidance_scale", 7.5)
            loras = stage_cfg.loras or []
            return Img2ImgStage(
                model_name=model_name,
                strength=strength,
                guidance_scale=guidance_scale,
                loras=loras,
            )
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
        3. Run pipeline stages sequentially (batch_size times if batch_size > 1)
        4. Return results and artifacts

        Args:
            input_data: Input data for pipeline (e.g., prompt, seed, model).
            job_id: Job identifier for artifact paths.

        Returns:
            Dictionary with:
                - 'success': bool, whether execution succeeded
                - 'data': final context.data
                - 'artifacts': list of artifact paths (multiple if batch_size > 1)
                - 'metadata': stage metadata
                - 'error': error message if failed

        Raises:
            ValueError: If pipeline setup fails or execution encounters error.
        """
        logger.info("Starting execution for job_id=%s, batch_size=%d", job_id, self.config.batch_size)

        try:
            # Setup
            await self.setup()

            # Initialize base context
            self.context = PipelineContext()
            self.context.set("job_id", job_id)

            # Handle seed: generate random if -1
            base_seed = self.config.seed
            if base_seed == -1:
                base_seed = random.randint(0, 2**32 - 1)

            # Set sampler and scheduler
            self.context.set("sampler", self.config.sampler)
            self.context.set("scheduler", self.config.scheduler)

            # Set img2img parameters if available
            if self.config.source_image_path:
                self.context.set("source_image_path", self.config.source_image_path)
            self.context.set("strength", self.config.strength)

            # Merge input data and pipeline parameters
            merged_data = {**self.config.parameters, **input_data}

            # Execute pipeline batch_size times
            batch_artifacts = []
            for batch_idx in range(self.config.batch_size):
                logger.info("Executing batch %d/%d for job_id=%s", batch_idx + 1, self.config.batch_size, job_id)

                # Create fresh context for each batch iteration
                self.context = PipelineContext()
                self.context.set("job_id", job_id)
                # Add batch index to job_id for unique artifact paths
                self.context.set("batch_idx", batch_idx)

                # Calculate seed for this iteration
                if self.config.seed == -1:
                    # If seed was random, generate new random seed each iteration
                    iteration_seed = random.randint(0, 2**32 - 1)
                else:
                    # If seed was fixed, increment it for each iteration
                    iteration_seed = base_seed + batch_idx

                self.context.set("seed", iteration_seed)
                self.context.set("sampler", self.config.sampler)
                self.context.set("scheduler", self.config.scheduler)

                if self.config.source_image_path:
                    self.context.set("source_image_path", self.config.source_image_path)
                self.context.set("strength", self.config.strength)

                for key, value in merged_data.items():
                    self.context.set(key, value)

                logger.debug("Context batch %d initialized with seed=%d", batch_idx, iteration_seed)

                # Execute pipeline
                if self.pipeline is None:
                    raise ValueError("Pipeline not initialized")

                logger.info("Executing pipeline for batch %d, job_id=%s", batch_idx, job_id)
                self.context = await self.pipeline.execute(self.context)

                if not self.context.error:
                    logger.info("Pipeline execution completed for batch %d", batch_idx)
                    # Collect artifacts from this batch iteration
                    batch_artifacts.extend(self.context.artifacts)
                else:
                    logger.error("Pipeline batch %d failed: %s", batch_idx, self.context.error)
                    # Continue with next iteration even if one fails (partial success)

                # Clear CUDA cache between iterations if available
                try:
                    import torch
                    torch.cuda.empty_cache()
                    logger.debug("CUDA cache cleared after batch %d", batch_idx)
                except Exception:
                    pass  # Not using CUDA or torch not available

            # Store checkpoints: map stage index to artifact paths
            if job_id and batch_artifacts:
                if job_id not in self.checkpoint_artifacts:
                    self.checkpoint_artifacts[job_id] = {}
                
                for stage_idx, artifact_path in enumerate(batch_artifacts):
                    self.checkpoint_artifacts[job_id][stage_idx] = artifact_path
                    logger.debug("Stored checkpoint for job_id=%s, artifact_index=%d: %s",
                               job_id, stage_idx, artifact_path)

            # Set final artifacts list
            self.context.artifacts = batch_artifacts

            # Teardown and collect results
            return self._teardown(used_seed=base_seed if self.config.seed != -1 else None)

        except Exception as e:
            logger.error("Execution failed for job_id=%s: %s", job_id, str(e))
            return {
                "success": False,
                "data": {},
                "artifacts": [],
                "metadata": {},
                "error": str(e),
            }

    def _teardown(self, used_seed: int | None = None) -> dict[str, Any]:
        """Collect results from execution context.

        Args:
            used_seed: The seed that was used in execution.

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
                "used_seed": used_seed,
            }

        logger.info("Teardown: collecting %d artifacts", len(self.context.artifacts))

        success = self.context.error is None
        return {
            "success": success,
            "data": self.context.data,
            "artifacts": self.context.artifacts,
            "metadata": self.context.metadata,
            "error": self.context.error,
            "used_seed": used_seed,
        }

    def get_checkpoint(self, job_id: str, stage_index: int) -> str | None:
        """Retrieve intermediate result artifact path for a stage checkpoint.

        Args:
            job_id: Job identifier.
            stage_index: Index of the stage (0-based).

        Returns:
            Artifact path for the stage if exists, None otherwise.
        """
        if job_id not in self.checkpoint_artifacts:
            return None
        return self.checkpoint_artifacts[job_id].get(stage_index)
