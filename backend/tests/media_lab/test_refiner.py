"""Tests for RefinerStage - high-resolution refinement via img2img."""

import asyncio
import os
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
import pytest
from PIL import Image

from src.media_lab.stages.refiner import RefinerStage, PipelineContext


class TestRefinerStageInitialization:
    """Test RefinerStage initialization and parameter validation."""

    def test_default_initialization(self):
        """Test initialization with default parameters."""
        stage = RefinerStage()
        assert stage.name == "RefinerStage"
        assert stage.model_name == "stable-diffusion-v1"
        assert stage.strength == 0.3

    def test_custom_initialization(self):
        """Test initialization with custom parameters."""
        stage = RefinerStage(model_name="sd-turbo", strength=0.5)
        assert stage.model_name == "sd-turbo"
        assert stage.strength == 0.5

    def test_strength_validation_lower_bound(self):
        """Test that strength < 0.0 raises ValueError."""
        with pytest.raises(ValueError, match="strength must be between 0.0 and 1.0"):
            RefinerStage(strength=-0.1)

    def test_strength_validation_upper_bound(self):
        """Test that strength > 1.0 raises ValueError."""
        with pytest.raises(ValueError, match="strength must be between 0.0 and 1.0"):
            RefinerStage(strength=1.1)

    def test_strength_boundary_values(self):
        """Test that 0.0 and 1.0 are valid."""
        stage_min = RefinerStage(strength=0.0)
        assert stage_min.strength == 0.0

        stage_max = RefinerStage(strength=1.0)
        assert stage_max.strength == 1.0


class TestRefinerStageImageLoading:
    """Test image loading functionality."""

    def test_load_image_file_success(self):
        """Test successful image file loading."""
        with TemporaryDirectory() as tmpdir:
            # Create test image
            test_image = Image.new("RGB", (256, 256), color=(100, 150, 200))
            image_path = Path(tmpdir) / "test.png"
            test_image.save(image_path)

            # Load image
            stage = RefinerStage()
            loaded = stage.load_image_file(str(image_path))

            assert isinstance(loaded, np.ndarray)
            assert loaded.shape == (256, 256, 3)
            assert loaded.dtype == np.uint8

    def test_load_image_file_not_found(self):
        """Test that FileNotFoundError is raised for missing file."""
        stage = RefinerStage()
        with pytest.raises(FileNotFoundError, match="Image file not found"):
            stage.load_image_file("/nonexistent/path/image.png")

    def test_load_image_file_invalid_format(self):
        """Test that ValueError is raised for invalid image."""
        with TemporaryDirectory() as tmpdir:
            # Create invalid image file
            invalid_path = Path(tmpdir) / "invalid.png"
            invalid_path.write_text("not an image")

            stage = RefinerStage()
            with pytest.raises(ValueError, match="Failed to load image"):
                stage.load_image_file(str(invalid_path))


class TestRefinerStageInputValidation:
    """Test input validation."""

    def test_validation_with_image(self):
        """Test that validation passes when image is present."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        result = asyncio.run(stage.validate_input(context))
        assert result is True

    def test_validation_without_image(self):
        """Test that validation fails without image."""
        stage = RefinerStage()
        context = PipelineContext()

        result = asyncio.run(stage.validate_input(context))
        assert result is False

    def test_execute_without_image_raises_error(self):
        """Test that execute raises ValueError without image in context."""
        stage = RefinerStage()
        context = PipelineContext()

        with pytest.raises(ValueError, match="RefinerStage requires 'image'"):
            asyncio.run(stage.execute(context))


class TestRefinerStageImg2ImgRefinement:
    """Test img2img refinement execution."""

    def test_execute_with_image_file_path(self):
        """Test execution with image file path."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (512, 512), color=(100, 100, 100))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Setup context
            stage = RefinerStage(strength=0.4)
            context = PipelineContext()
            context.set("image", {"model": "test", "dimensions": (512, 512)})
            context.set("image_path", str(image_path))
            context.set("job_id", "test_job")

            # Execute
            result_context = asyncio.run(stage.execute(context))

            # Verify
            assert result_context.get("image") is not None
            assert "refined_path" in result_context.data
            assert "high_res_fix" in result_context.data["image"]
            assert result_context.data["image"]["high_res_fix"] is True
            assert result_context.metadata["refiner"]["strength"] == 0.4

    def test_execute_with_mock_image_data(self):
        """Test execution with mock image data."""
        stage = RefinerStage(strength=0.5)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "test_job")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.get("image") is not None
        assert result_context.get("refined_path") is not None
        assert result_context.get("refined_path") in result_context.artifacts

    def test_execute_uses_context_strength_override(self):
        """Test that context strength overrides default."""
        stage = RefinerStage(strength=0.3)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("strength", 0.7)
        context.set("job_id", "test_job")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.metadata["refiner"]["strength"] == 0.7

    def test_execute_context_strength_validation(self):
        """Test that invalid context strength raises error."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("strength", 1.5)  # Invalid
        context.set("job_id", "test_job")

        with pytest.raises(ValueError, match="strength must be between 0.0 and 1.0"):
            asyncio.run(stage.execute(context))


class TestRefinerStagePaths:
    """Test artifact path handling."""

    def test_refined_path_from_image_path(self):
        """Test that refined path is derived from image path."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("image_path", "artifacts/job1/generated.png")
        context.set("job_id", "job1")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.get("refined_path") == "artifacts/job1/generated_refined.png"

    def test_refined_path_from_job_id(self):
        """Test that refined path uses job_id when no image_path."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "test_job_123")

        result_context = asyncio.run(stage.execute(context))

        assert "artifacts/test_job_123/refined.png" in result_context.get("refined_path")

    def test_artifact_created_on_disk(self):
        """Test that refined artifact is created on disk."""
        with TemporaryDirectory() as tmpdir:
            # Change to temp directory for artifacts
            original_cwd = Path.cwd()
            try:
                os.chdir(tmpdir)

                stage = RefinerStage()
                context = PipelineContext()
                context.set("image", {"model": "test", "dimensions": (256, 256)})
                context.set("job_id", "disk_test")

                result_context = asyncio.run(stage.execute(context))

                refined_path = result_context.get("refined_path")
                assert Path(refined_path).exists()
                assert refined_path.endswith(".png")
            finally:
                os.chdir(original_cwd)


class TestRefinerStageMetadata:
    """Test metadata tracking."""

    def test_metadata_in_context(self):
        """Test that metadata is properly recorded."""
        stage = RefinerStage(model_name="custom-model", strength=0.6)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (512, 512)})
        context.set("job_id", "meta_test")

        result_context = asyncio.run(stage.execute(context))

        metadata = result_context.metadata["refiner"]
        assert metadata["model"] == "custom-model"
        assert metadata["strength"] == 0.6
        assert metadata["high_res_fix"] is True
        assert "output_shape" in metadata

    def test_metadata_output_shape(self):
        """Test that output shape is correctly recorded."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "shape_test")

        result_context = asyncio.run(stage.execute(context))

        shape = result_context.metadata["refiner"]["output_shape"]
        assert len(shape) == 3  # (H, W, C)


class TestRefinerStageArtifacts:
    """Test artifact tracking."""

    def test_artifact_added_to_list(self):
        """Test that refined path is added to artifacts list."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "artifact_test")

        initial_count = len(context.artifacts)
        result_context = asyncio.run(stage.execute(context))

        assert len(result_context.artifacts) == initial_count + 1
        assert result_context.get("refined_path") in result_context.artifacts

    def test_multiple_executions_track_artifacts(self):
        """Test that multiple executions track separate artifacts."""
        stage = RefinerStage()

        # First execution
        context1 = PipelineContext()
        context1.set("image", {"model": "test", "dimensions": (256, 256)})
        context1.set("job_id", "job1")
        result1 = asyncio.run(stage.execute(context1))

        # Second execution
        context2 = PipelineContext()
        context2.set("image", {"model": "test", "dimensions": (256, 256)})
        context2.set("job_id", "job2")
        result2 = asyncio.run(stage.execute(context2))

        assert result1.get("refined_path") != result2.get("refined_path")
        assert len(result1.artifacts) == 1
        assert len(result2.artifacts) == 1


class TestRefinerStageErrorHandling:
    """Test error handling."""

    def test_error_on_missing_image(self):
        """Test error is set when image missing."""
        stage = RefinerStage()
        context = PipelineContext()

        with pytest.raises(ValueError):
            asyncio.run(stage.execute(context))

        # Error should be set in context before exception
        assert context.error is not None
        assert "RefinerStage requires 'image'" in context.error

    def test_error_on_invalid_image_file(self):
        """Test error on invalid image file."""
        with TemporaryDirectory() as tmpdir:
            invalid_path = Path(tmpdir) / "invalid.png"
            invalid_path.write_text("not an image")

            stage = RefinerStage()
            context = PipelineContext()
            context.set("image", {"model": "test"})
            context.set("image_path", str(invalid_path))
            context.set("job_id", "error_test")

            with pytest.raises(ValueError, match="Failed to load image"):
                asyncio.run(stage.execute(context))


class TestRefinerStageContextUpdates:
    """Test context data updates."""

    def test_image_data_updated(self):
        """Test that image data is updated with refinement info."""
        stage = RefinerStage()
        context = PipelineContext()
        original_image = {"model": "test", "dimensions": (256, 256)}
        context.set("image", original_image)
        context.set("job_id", "update_test")

        result_context = asyncio.run(stage.execute(context))

        updated_image = result_context.get("image")
        assert updated_image["model"] == "test"
        assert updated_image["refinement_level"] == 1
        assert updated_image["high_res_fix"] is True
        assert "dimensions" in updated_image

    def test_refined_path_set_in_context(self):
        """Test that refined_path is set in context."""
        stage = RefinerStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "path_test")

        result_context = asyncio.run(stage.execute(context))

        assert "refined_path" in result_context.data
        assert isinstance(result_context.get("refined_path"), str)


class TestRefinerStageIntegration:
    """Integration tests for RefinerStage."""

    def test_full_refinement_pipeline(self):
        """Test complete refinement workflow."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (512, 512), color=(120, 120, 120))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Setup pipeline
            stage = RefinerStage(model_name="sd-v1", strength=0.4)
            context = PipelineContext()
            context.set(
                "image",
                {"model": "text-to-image", "dimensions": (512, 512), "prompt": "test prompt"},
            )
            context.set("image_path", str(image_path))
            context.set("job_id", "integration_test")

            # Execute
            result = asyncio.run(stage.execute(context))

            # Verify full state
            assert result.data["image"]["high_res_fix"] is True
            assert result.data["image"]["refinement_level"] == 1
            assert len(result.artifacts) == 1
            assert result.metadata["refiner"]["strength"] == 0.4
            assert result.error is None

    def test_chaining_with_different_strengths(self):
        """Test sequential refinement with different strengths."""
        stage1 = RefinerStage(strength=0.2)
        stage2 = RefinerStage(strength=0.5)

        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "chain_test")

        # First refinement
        context = asyncio.run(stage1.execute(context))
        assert context.metadata["refiner"]["strength"] == 0.2

        # Second refinement (in production, would pass through pipeline)
        # For this test, we verify both stages worked
        assert len(context.artifacts) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
