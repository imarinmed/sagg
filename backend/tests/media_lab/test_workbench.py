"""Tests for Workbench controller."""

import asyncio

import pytest

from src.media_lab.workbench import Workbench
from src.models import PipelineConfig, StageConfig


def async_test(coro):
    """Helper to run async tests."""
    return asyncio.run(coro)


class TestWorkbench:
    """Tests for Workbench class."""

    @pytest.fixture
    def basic_config(self):
        """Create a basic pipeline config."""
        return PipelineConfig(
            stages=[
                StageConfig(stage_type="text_to_image"),
                StageConfig(stage_type="refiner"),
            ],
            parameters={},
        )

    @pytest.fixture
    def config_with_upscaler(self):
        """Create config with upscaler."""
        return PipelineConfig(
            stages=[
                StageConfig(stage_type="text_to_image"),
                StageConfig(stage_type="refiner"),
                StageConfig(stage_type="detailer"),
                StageConfig(
                    stage_type="upscaler",
                    parameters={"upscale_factor": 4},
                ),
            ],
            parameters={},
        )

    def test_workbench_initialization(self, basic_config):
        """Test Workbench initialization."""
        wb = Workbench(basic_config)
        assert wb.config == basic_config
        assert wb.pipeline is None
        assert wb.context is None

    def test_setup_creates_pipeline(self, basic_config):
        """Test setup creates pipeline with correct stages."""
        wb = Workbench(basic_config)
        async_test(wb.setup())

        assert wb.pipeline is not None
        assert len(wb.pipeline.stages) == 2
        assert wb.pipeline.stages[0].name == "TextToImageStage"
        assert wb.pipeline.stages[1].name == "RefinerStage"

    def test_setup_all_stage_types(self, config_with_upscaler):
        """Test setup with all stage types."""
        wb = Workbench(config_with_upscaler)
        async_test(wb.setup())

        assert len(wb.pipeline.stages) == 4
        stage_names = [stage.name for stage in wb.pipeline.stages]
        assert "TextToImageStage" in stage_names
        assert "RefinerStage" in stage_names
        assert "DetailerStage" in stage_names
        assert "UpscalerStage" in stage_names

    def test_build_stage_text_to_image(self, basic_config):
        """Test building text_to_image stage."""
        wb = Workbench(basic_config)
        stage_cfg = StageConfig(stage_type="text_to_image")
        stage = wb._build_stage(stage_cfg)
        assert stage.name == "TextToImageStage"

    def test_build_stage_refiner(self, basic_config):
        """Test building refiner stage."""
        wb = Workbench(basic_config)
        stage_cfg = StageConfig(stage_type="refiner")
        stage = wb._build_stage(stage_cfg)
        assert stage.name == "RefinerStage"

    def test_build_stage_detailer(self, basic_config):
        """Test building detailer stage."""
        wb = Workbench(basic_config)
        stage_cfg = StageConfig(stage_type="detailer")
        stage = wb._build_stage(stage_cfg)
        assert stage.name == "DetailerStage"

    def test_build_upscaler_with_custom_factor(self, basic_config):
        """Test building upscaler with custom factor."""
        wb = Workbench(basic_config)
        stage_cfg = StageConfig(
            stage_type="upscaler",
            parameters={"upscale_factor": 8},
        )

        stage = wb._build_stage(stage_cfg)
        assert stage.name == "UpscalerStage"
        assert stage.upscale_factor == 8

    def test_build_upscaler_default_factor(self, basic_config):
        """Test building upscaler with default factor."""
        wb = Workbench(basic_config)
        stage_cfg = StageConfig(stage_type="upscaler")

        stage = wb._build_stage(stage_cfg)
        assert stage.upscale_factor == 2

    def test_execute_successful_pipeline(self, basic_config):
        """Test successful pipeline execution."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "A beautiful landscape"}
        result = async_test(wb.execute(input_data, job_id="test_job_1"))

        assert result["success"] is True
        assert "image" in result["data"]
        assert "image_path" in result["data"]
        assert "refined_path" in result["data"]
        assert len(result["artifacts"]) == 2
        assert "generated.png" in result["artifacts"][0]
        assert "refined.png" in result["artifacts"][1]

    def test_execute_context_job_id(self, basic_config):
        """Test execution sets job_id in context."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test prompt"}
        result = async_test(wb.execute(input_data, job_id="custom_job_123"))

        assert result["data"]["job_id"] == "custom_job_123"
        assert "custom_job_123" in result["artifacts"][0]

    def test_execute_merges_parameters(self):
        """Test execution merges config and input parameters."""
        config = PipelineConfig(
            stages=[StageConfig(stage_type="text_to_image")],
            parameters={"model": "dalle-3", "seed": 100},
        )
        wb = Workbench(config)
        input_data = {"prompt": "Test prompt", "seed": 42}
        result = async_test(wb.execute(input_data, job_id="test"))

        # input_data should override config parameters
        assert result["data"]["model"] == "dalle-3"
        assert result["data"]["seed"] == 42
        assert result["data"]["prompt"] == "Test prompt"

    def test_execute_without_required_prompt(self, basic_config):
        """Test execution fails gracefully without required prompt."""
        wb = Workbench(basic_config)
        input_data = {}  # Missing required 'prompt'
        result = async_test(wb.execute(input_data, job_id="test"))

        assert result["success"] is False
        assert "error" in result
        assert result["error"] is not None
        assert "prompt" in result["error"].lower()

    def test_execute_full_pipeline_with_upscaler(self, config_with_upscaler):
        """Test full pipeline execution with all stages."""
        wb = Workbench(config_with_upscaler)
        input_data = {
            "prompt": "A mystical forest",
            "refinement_level": 3,
            "upscale_factor": 4,
        }
        result = async_test(wb.execute(input_data, job_id="full_test"))

        assert result["success"] is True
        assert len(result["artifacts"]) == 4
        assert "upscaled.png" in result["artifacts"][-1]
        assert result["metadata"]["upscaler"]["upscale_factor"] == 4

    def test_execute_with_default_job_id(self, basic_config):
        """Test execution with default job_id."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test"}
        result = async_test(wb.execute(input_data))

        assert result["data"]["job_id"] == "unknown"

    def test_teardown_collects_artifacts(self, basic_config):
        """Test teardown collects artifacts correctly."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test"}
        result = async_test(wb.execute(input_data, job_id="teardown_test"))

        assert "artifacts" in result
        assert isinstance(result["artifacts"], list)
        assert all(isinstance(a, str) for a in result["artifacts"])

    def test_teardown_collects_metadata(self, basic_config):
        """Test teardown collects metadata from stages."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test"}
        result = async_test(wb.execute(input_data))

        assert "metadata" in result
        assert "text_to_image" in result["metadata"]
        assert "refiner" in result["metadata"]

    def test_execute_error_handling(self, basic_config):
        """Test execute handles errors gracefully."""
        wb = Workbench(basic_config)
        input_data = {}  # Will cause error (no prompt)
        result = async_test(wb.execute(input_data))

        assert result["success"] is False
        assert result["error"] is not None
        assert isinstance(result["data"], dict)
        assert isinstance(result["artifacts"], list)

    def test_execute_sets_metadata(self, basic_config):
        """Test execute collects metadata from all stages."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test prompt"}
        result = async_test(wb.execute(input_data))

        metadata = result["metadata"]
        assert "text_to_image" in metadata
        assert "prompt_length" in metadata["text_to_image"]
        assert "refiner" in metadata
        assert "refinement_level" in metadata["refiner"]

    def test_checkpoint_storage(self, basic_config):
        """Test that checkpoints are stored after execution."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test prompt"}
        job_id = "checkpoint_test_1"
        result = async_test(wb.execute(input_data, job_id=job_id))

        assert result["success"] is True
        assert job_id in wb.checkpoint_artifacts
        assert len(wb.checkpoint_artifacts[job_id]) == 2  # Two stages

    def test_get_checkpoint_returns_artifact_path(self, basic_config):
        """Test get_checkpoint returns artifact path for a stage."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test prompt"}
        job_id = "checkpoint_test_2"
        result = async_test(wb.execute(input_data, job_id=job_id))

        checkpoint_0 = wb.get_checkpoint(job_id, 0)
        checkpoint_1 = wb.get_checkpoint(job_id, 1)

        assert checkpoint_0 is not None
        assert checkpoint_1 is not None
        assert "generated.png" in checkpoint_0
        assert "refined.png" in checkpoint_1

    def test_get_checkpoint_nonexistent_job(self, basic_config):
        """Test get_checkpoint returns None for nonexistent job."""
        wb = Workbench(basic_config)
        result = wb.get_checkpoint("nonexistent_job", 0)
        assert result is None

    def test_get_checkpoint_nonexistent_stage(self, basic_config):
        """Test get_checkpoint returns None for nonexistent stage index."""
        wb = Workbench(basic_config)
        input_data = {"prompt": "Test prompt"}
        job_id = "checkpoint_test_3"
        result = async_test(wb.execute(input_data, job_id=job_id))

        checkpoint = wb.get_checkpoint(job_id, 99)
        assert checkpoint is None

    def test_checkpoint_mapping_with_upscaler(self, config_with_upscaler):
        """Test checkpoint storage with full pipeline."""
        wb = Workbench(config_with_upscaler)
        input_data = {"prompt": "Test prompt", "upscale_factor": 2}
        job_id = "checkpoint_full_test"
        result = async_test(wb.execute(input_data, job_id=job_id))

        assert job_id in wb.checkpoint_artifacts
        # Should have 4 stages: text_to_image, refiner, detailer, upscaler
        assert len(wb.checkpoint_artifacts[job_id]) == 4

        # Verify each stage has a checkpoint
        for stage_idx in range(4):
            checkpoint = wb.get_checkpoint(job_id, stage_idx)
            assert checkpoint is not None
            assert isinstance(checkpoint, str)
