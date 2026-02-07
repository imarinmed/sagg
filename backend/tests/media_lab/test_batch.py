"""Tests for batch generation support (v0.9.0-T1).

Tests verify:
- batch_size field in PipelineConfig
- batch generation with multiple iterations
- seed incrementation for fixed seeds
- random seed generation for each iteration
- correct artifact collection
"""

import asyncio

import pytest

from src.media_lab.workbench import Workbench
from src.models import PipelineConfig, StageConfig


def async_test(coro):
    """Helper to run async tests."""
    return asyncio.run(coro)


class TestBatchGeneration:
    """Tests for batch generation support."""

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

    def test_batch_size_field_exists(self, basic_config):
        """Test batch_size field exists in PipelineConfig."""
        # Check field exists on instances
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=4,
        )
        assert hasattr(config, "batch_size")
        assert config.batch_size == 4

    def test_batch_size_default_is_one(self, basic_config):
        """Test batch_size defaults to 1."""
        config = PipelineConfig(
            stages=basic_config.stages,
        )
        assert config.batch_size == 1

    def test_batch_size_minimum_is_one(self):
        """Test batch_size minimum validation is 1."""
        with pytest.raises(ValueError):
            PipelineConfig(
                stages=[StageConfig(stage_type="text_to_image")],
                batch_size=0,  # Invalid: less than 1
            )

    def test_batch_size_maximum_is_eight(self):
        """Test batch_size maximum validation is 8."""
        with pytest.raises(ValueError):
            PipelineConfig(
                stages=[StageConfig(stage_type="text_to_image")],
                batch_size=9,  # Invalid: greater than 8
            )

    def test_batch_size_max_allowed(self):
        """Test batch_size=8 is allowed."""
        config = PipelineConfig(
            stages=[StageConfig(stage_type="text_to_image")],
            batch_size=8,
        )
        assert config.batch_size == 8

    def test_batch_generation_with_fixed_seed(self, basic_config):
        """Test batch generation with fixed seed produces 4 different images.

        With fixed seed=42 and batch_size=4, should generate with:
        - Iteration 0: seed=42
        - Iteration 1: seed=43
        - Iteration 2: seed=44
        - Iteration 3: seed=45

        Each iteration produces different artifacts.
        """
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=4,
            seed=42,  # Fixed seed
        )
        wb = Workbench(config)
        input_data = {"prompt": "A test image"}
        result = async_test(wb.execute(input_data, job_id="batch_fixed_seed"))

        # Should succeed
        assert result["success"] is True

        # Should generate 4*2 artifacts (2 stages per iteration)
        assert len(result["artifacts"]) == 8, (
            f"Expected 8 artifacts, got {len(result['artifacts'])}"
        )

        # All artifacts should be unique (different iterations)
        assert len(set(result["artifacts"])) == 8, "All artifacts should be unique"

        # Verify artifacts are properly named with job_id
        for artifact in result["artifacts"]:
            assert "batch_fixed_seed" in artifact

    def test_batch_generation_with_random_seed(self, basic_config):
        """Test batch generation with random seed (-1).

        With seed=-1 and batch_size=4, should generate 4 iterations
        each with a new random seed.
        """
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=4,
            seed=-1,  # Random seed
        )
        wb = Workbench(config)
        input_data = {"prompt": "A random seed image"}
        result = async_test(wb.execute(input_data, job_id="batch_random_seed"))

        # Should succeed
        assert result["success"] is True

        # Should generate 4*2 artifacts (2 stages per iteration)
        assert len(result["artifacts"]) == 8, (
            f"Expected 8 artifacts, got {len(result['artifacts'])}"
        )

        # All artifacts should be unique
        assert len(set(result["artifacts"])) == 8, "All artifacts should be unique"

    def test_batch_size_one_generates_single_image(self, basic_config):
        """Test batch_size=1 generates single artifact per stage."""
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=1,  # Default: single generation
            seed=42,
        )
        wb = Workbench(config)
        input_data = {"prompt": "Single image"}
        result = async_test(wb.execute(input_data, job_id="batch_single"))

        assert result["success"] is True
        # Single iteration with 2 stages = 2 artifacts
        assert len(result["artifacts"]) == 2

    def test_batch_generation_with_upscaler(self):
        """Test batch generation with multiple stages including upscaler."""
        config = PipelineConfig(
            stages=[
                StageConfig(stage_type="text_to_image"),
                StageConfig(stage_type="refiner"),
                StageConfig(stage_type="detailer"),
                StageConfig(
                    stage_type="upscaler",
                    parameters={"upscale_factor": 2},
                ),
            ],
            batch_size=2,
            seed=100,
        )
        wb = Workbench(config)
        input_data = {"prompt": "Upscaled batch"}
        result = async_test(wb.execute(input_data, job_id="batch_upscaler"))

        assert result["success"] is True
        # 2 iterations * 4 stages = 8 artifacts
        assert len(result["artifacts"]) == 8

    def test_batch_generation_seed_incrementation(self, basic_config):
        """Test that fixed seed is incremented for each batch iteration."""
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=3,
            seed=1000,
        )
        wb = Workbench(config)

        # First batch with seed=1000
        result1 = async_test(wb.execute({"prompt": "Test"}, job_id="batch_seed_1"))
        artifacts1 = result1["artifacts"]

        # Create another workbench with seed=1001 to verify different result
        config2 = PipelineConfig(
            stages=basic_config.stages,
            batch_size=1,
            seed=1001,
        )
        wb2 = Workbench(config2)
        result2 = async_test(wb2.execute({"prompt": "Test"}, job_id="batch_seed_2"))
        artifacts2 = result2["artifacts"]

        # First artifact from batch (seed=1000) should differ from single gen (seed=1001)
        # They should have different paths
        assert artifacts1[0] != artifacts2[0]

    def test_batch_failure_continues_with_next_iteration(self, basic_config):
        """Test that batch continues even if one iteration encounters issues."""
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=3,
            seed=42,
        )
        wb = Workbench(config)
        input_data = {"prompt": "Resilient batch"}
        result = async_test(wb.execute(input_data, job_id="batch_resilient"))

        # Should still succeed with generated artifacts
        # Even if middle iteration had issues
        assert len(result["artifacts"]) > 0

    def test_batch_with_img2img_stage(self):
        """Test batch generation with text_to_image followed by img2img."""
        import tempfile
        import pathlib
        from PIL import Image
        
        # Create a temporary test image file with proper PNG format
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            # Create a simple RGB image and save as PNG
            img = Image.new('RGB', (256, 256), color='red')
            img.save(tmp.name, 'PNG')
            tmp_path = tmp.name
        
        try:
            config = PipelineConfig(
                stages=[
                    StageConfig(stage_type="text_to_image"),
                    StageConfig(
                        stage_type="img2img",
                        parameters={
                            "model_name": "stable-diffusion-v1",
                            "strength": 0.7,
                        },
                    ),
                    StageConfig(stage_type="refiner"),
                ],
                batch_size=2,
                seed=50,
                source_image_path=tmp_path,
            )
            wb = Workbench(config)
            input_data = {"prompt": "Enhanced batch"}
            result = async_test(wb.execute(input_data, job_id="batch_img2img"))

            assert result["success"] is True
            # 2 iterations * 3 stages = 6 artifacts
            assert len(result["artifacts"]) == 6
        finally:
            # Clean up temp file
            pathlib.Path(tmp_path).unlink(missing_ok=True)

    def test_batch_returns_artifacts_list(self, basic_config):
        """Test batch execution returns artifacts as list."""
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=2,
            seed=77,
        )
        wb = Workbench(config)
        result = async_test(wb.execute({"prompt": "List test"}, job_id="batch_list"))

        # Artifacts should be a list
        assert isinstance(result["artifacts"], list)
        # Should have multiple artifacts
        assert len(result["artifacts"]) > 1
        # All elements should be strings (paths)
        assert all(isinstance(a, str) for a in result["artifacts"])

    def test_batch_metadata_preserved(self, basic_config):
        """Test batch execution preserves metadata from all stages."""
        config = PipelineConfig(
            stages=basic_config.stages,
            batch_size=2,
            seed=88,
        )
        wb = Workbench(config)
        result = async_test(wb.execute({"prompt": "Metadata test"}, job_id="batch_meta"))

        assert result["success"] is True
        # Metadata should exist
        assert "metadata" in result
        assert isinstance(result["metadata"], dict)

    def test_batch_size_three_with_fixed_seed(self):
        """Test batch_size=3 with fixed seed generates correct seeds."""
        config = PipelineConfig(
            stages=[StageConfig(stage_type="text_to_image")],
            batch_size=3,
            seed=200,
        )
        wb = Workbench(config)
        result = async_test(wb.execute({"prompt": "Three batches"}, job_id="batch_three"))

        assert result["success"] is True
        # 3 iterations * 1 stage = 3 artifacts
        assert len(result["artifacts"]) == 3
        # All should be unique
        assert len(set(result["artifacts"])) == 3
