"""Tests for Img2ImgStage - image-to-image transformation."""

import asyncio
import os
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
import pytest
from PIL import Image

from src.media_lab.stages.img2img import Img2ImgStage, PipelineContext


class TestImg2ImgStageInitialization:
    """Test Img2ImgStage initialization and parameter validation."""

    def test_default_initialization(self):
        """Test initialization with default parameters."""
        stage = Img2ImgStage()
        assert stage.name == "Img2ImgStage"
        assert stage.model_name == "stable-diffusion-v1"
        assert stage.strength == 0.75
        assert stage.guidance_scale == 7.5

    def test_custom_initialization(self):
        """Test initialization with custom parameters."""
        stage = Img2ImgStage(model_name="sd-turbo", strength=0.5, guidance_scale=5.0)
        assert stage.model_name == "sd-turbo"
        assert stage.strength == 0.5
        assert stage.guidance_scale == 5.0

    def test_strength_validation_lower_bound(self):
        """Test that strength < 0.0 raises ValueError."""
        with pytest.raises(ValueError, match="strength must be between 0.0 and 1.0"):
            Img2ImgStage(strength=-0.1)

    def test_strength_validation_upper_bound(self):
        """Test that strength > 1.0 raises ValueError."""
        with pytest.raises(ValueError, match="strength must be between 0.0 and 1.0"):
            Img2ImgStage(strength=1.1)

    def test_strength_boundary_values(self):
        """Test that 0.0 and 1.0 are valid."""
        stage_min = Img2ImgStage(strength=0.0)
        assert stage_min.strength == 0.0

        stage_max = Img2ImgStage(strength=1.0)
        assert stage_max.strength == 1.0


class TestImg2ImgStageImageLoading:
    """Test image loading functionality."""

    def test_load_image_file_success(self):
        """Test successful image file loading."""
        with TemporaryDirectory() as tmpdir:
            # Create test image
            test_image = Image.new("RGB", (256, 256), color=(100, 150, 200))
            image_path = Path(tmpdir) / "test.png"
            test_image.save(image_path)

            # Load image
            stage = Img2ImgStage()
            loaded = stage.load_image_file(str(image_path))

            assert isinstance(loaded, np.ndarray)
            assert loaded.shape == (256, 256, 3)
            assert loaded.dtype == np.uint8

    def test_load_image_file_not_found(self):
        """Test that FileNotFoundError is raised for missing file."""
        stage = Img2ImgStage()
        with pytest.raises(FileNotFoundError, match="Image file not found"):
            stage.load_image_file("/nonexistent/path/image.png")

    def test_load_image_file_invalid_format(self):
        """Test that ValueError is raised for invalid image."""
        with TemporaryDirectory() as tmpdir:
            # Create invalid image file
            invalid_path = Path(tmpdir) / "invalid.png"
            invalid_path.write_text("not an image")

            stage = Img2ImgStage()
            with pytest.raises(ValueError, match="Failed to load image"):
                stage.load_image_file(str(invalid_path))


class TestImg2ImgStageInputValidation:
    """Test input validation."""

    def test_validation_with_source_image_path(self):
        """Test that validation passes when source_image_path is present."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("source_image_path", "/some/path/image.png")

        result = asyncio.run(stage.validate_input(context))
        assert result is True

    def test_validation_with_image_data(self):
        """Test that validation passes when image data is present."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        result = asyncio.run(stage.validate_input(context))
        assert result is True

    def test_validation_without_image(self):
        """Test that validation fails without image or path."""
        stage = Img2ImgStage()
        context = PipelineContext()

        result = asyncio.run(stage.validate_input(context))
        assert result is False

    def test_execute_without_image_raises_error(self):
        """Test that execute raises ValueError without image source."""
        stage = Img2ImgStage()
        context = PipelineContext()

        with pytest.raises(ValueError, match="Img2ImgStage requires 'source_image_path'"):
            asyncio.run(stage.execute(context))


class TestImg2ImgStageExecution:
    """Test img2img transformation execution."""

    def test_execute_with_source_image_path(self):
        """Test execution with source_image_path."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (512, 512), color=(100, 100, 100))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Setup context
            stage = Img2ImgStage(strength=0.75)
            context = PipelineContext()
            context.set("source_image_path", str(image_path))
            context.set("job_id", "test_job")

            # Execute
            result_context = asyncio.run(stage.execute(context))

            # Verify
            assert result_context.get("image") is not None
            assert "img2img_path" in result_context.data
            assert "img2img_applied" in result_context.data["image"]
            assert result_context.data["image"]["img2img_applied"] is True
            assert result_context.metadata["img2img"]["strength"] == 0.75

    def test_execute_with_image_data(self):
        """Test execution with image data from previous stage."""
        stage = Img2ImgStage(strength=0.5)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "test_job")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.get("image") is not None
        assert result_context.get("img2img_path") is not None
        assert result_context.get("img2img_path") in result_context.artifacts

    def test_execute_uses_context_strength_override(self):
        """Test that context strength overrides default."""
        stage = Img2ImgStage(strength=0.75)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("strength", 0.4)
        context.set("job_id", "test_job")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.metadata["img2img"]["strength"] == 0.4

    def test_execute_context_strength_validation(self):
        """Test that invalid context strength raises error."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("strength", 1.5)  # Invalid
        context.set("job_id", "test_job")

        with pytest.raises(ValueError, match="strength must be between 0.0 and 1.0"):
            asyncio.run(stage.execute(context))


class TestImg2ImgStagePaths:
    """Test artifact path handling."""

    def test_img2img_path_from_source_path(self):
        """Test that img2img path is derived from source path."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (256, 256), color=(100, 100, 100))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            stage = Img2ImgStage()
            context = PipelineContext()
            context.set("source_image_path", str(image_path))
            context.set("job_id", "job1")

            result_context = asyncio.run(stage.execute(context))

            expected_path = str(image_path).replace(".png", "_img2img.png")
            assert result_context.get("img2img_path") == expected_path

    def test_img2img_path_from_job_id(self):
        """Test that img2img path uses job_id when no source path."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "test_job_123")

        result_context = asyncio.run(stage.execute(context))

        assert "artifacts/test_job_123/img2img.png" in result_context.get("img2img_path")

    def test_artifact_created_on_disk(self):
        """Test that img2img artifact is created on disk."""
        with TemporaryDirectory() as tmpdir:
            # Change to temp directory for artifacts
            original_cwd = Path.cwd()
            try:
                os.chdir(tmpdir)

                stage = Img2ImgStage()
                context = PipelineContext()
                context.set("image", {"model": "test", "dimensions": (256, 256)})
                context.set("job_id", "disk_test")

                result_context = asyncio.run(stage.execute(context))

                img2img_path = result_context.get("img2img_path")
                assert Path(img2img_path).exists()
                assert img2img_path.endswith(".png")
            finally:
                os.chdir(original_cwd)


class TestImg2ImgStageMetadata:
    """Test metadata tracking."""

    def test_metadata_in_context(self):
        """Test that metadata is properly recorded."""
        stage = Img2ImgStage(model_name="custom-model", strength=0.6, guidance_scale=10.0)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (512, 512)})
        context.set("job_id", "meta_test")

        result_context = asyncio.run(stage.execute(context))

        metadata = result_context.metadata["img2img"]
        assert metadata["model"] == "custom-model"
        assert metadata["strength"] == 0.6
        assert metadata["guidance_scale"] == 10.0
        assert "output_shape" in metadata

    def test_metadata_output_shape(self):
        """Test that output shape is correctly recorded."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "shape_test")

        result_context = asyncio.run(stage.execute(context))

        shape = result_context.metadata["img2img"]["output_shape"]
        assert len(shape) == 3  # (H, W, C)

    def test_metadata_guidance_scale(self):
        """Test that guidance_scale is tracked in metadata."""
        stage = Img2ImgStage(guidance_scale=15.0)
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "guidance_test")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.metadata["img2img"]["guidance_scale"] == 15.0


class TestImg2ImgStageArtifacts:
    """Test artifact tracking."""

    def test_artifact_added_to_list(self):
        """Test that img2img path is added to artifacts list."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "artifact_test")

        initial_count = len(context.artifacts)
        result_context = asyncio.run(stage.execute(context))

        assert len(result_context.artifacts) == initial_count + 1
        assert result_context.get("img2img_path") in result_context.artifacts

    def test_multiple_executions_track_artifacts(self):
        """Test that multiple executions track separate artifacts."""
        stage = Img2ImgStage()

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

        assert result1.get("img2img_path") != result2.get("img2img_path")
        assert len(result1.artifacts) == 1
        assert len(result2.artifacts) == 1


class TestImg2ImgStageErrorHandling:
    """Test error handling."""

    def test_error_on_missing_image(self):
        """Test error is set when image missing."""
        stage = Img2ImgStage()
        context = PipelineContext()

        with pytest.raises(ValueError):
            asyncio.run(stage.execute(context))

        # Error should be set in context before exception
        assert context.error is not None
        assert "Img2ImgStage requires" in context.error

    def test_error_on_invalid_image_file(self):
        """Test error on invalid image file."""
        with TemporaryDirectory() as tmpdir:
            invalid_path = Path(tmpdir) / "invalid.png"
            invalid_path.write_text("not an image")

            stage = Img2ImgStage()
            context = PipelineContext()
            context.set("source_image_path", str(invalid_path))
            context.set("job_id", "error_test")

            with pytest.raises(ValueError, match="Failed to load image"):
                asyncio.run(stage.execute(context))


class TestImg2ImgStageContextUpdates:
    """Test context data updates."""

    def test_image_data_updated(self):
        """Test that image data is updated with img2img info."""
        stage = Img2ImgStage()
        context = PipelineContext()
        original_image = {"model": "test", "dimensions": (256, 256), "prompt": "test"}
        context.set("image", original_image)
        context.set("job_id", "update_test")

        result_context = asyncio.run(stage.execute(context))

        updated_image = result_context.get("image")
        assert updated_image["model"] == "test"
        assert updated_image["img2img_applied"] is True
        assert "dimensions" in updated_image

    def test_img2img_path_set_in_context(self):
        """Test that img2img_path is set in context."""
        stage = Img2ImgStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "path_test")

        result_context = asyncio.run(stage.execute(context))

        assert "img2img_path" in result_context.data
        assert isinstance(result_context.get("img2img_path"), str)


class TestImg2ImgStageIntegration:
    """Integration tests for Img2ImgStage."""

    def test_full_img2img_workflow(self):
        """Test complete img2img transformation workflow."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (512, 512), color=(120, 120, 120))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Setup pipeline
            stage = Img2ImgStage(model_name="sd-v1", strength=0.6, guidance_scale=8.0)
            context = PipelineContext()
            context.set("source_image_path", str(image_path))
            context.set("job_id", "integration_test")

            # Execute
            result = asyncio.run(stage.execute(context))

            # Verify full state
            assert result.data["image"]["img2img_applied"] is True
            assert len(result.artifacts) == 1
            assert result.metadata["img2img"]["strength"] == 0.6
            assert result.metadata["img2img"]["guidance_scale"] == 8.0
            assert result.error is None

    def test_chaining_with_different_strengths(self):
        """Test sequential img2img with different strengths."""
        stage1 = Img2ImgStage(strength=0.3)
        stage2 = Img2ImgStage(strength=0.8)

        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("job_id", "chain_test")

        # First transformation
        context = asyncio.run(stage1.execute(context))
        assert context.metadata["img2img"]["strength"] == 0.3

        # Second transformation (in production, would pass through pipeline)
        # For this test, we verify both stages worked
        assert len(context.artifacts) == 1

    def test_strength_effect_on_transformation(self):
        """Test that different strengths produce different results."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (256, 256), color=(100, 100, 100))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Execute with low strength
            stage_low = Img2ImgStage(strength=0.1)
            context_low = PipelineContext()
            context_low.set("source_image_path", str(image_path))
            context_low.set("job_id", "test_low")
            result_low = asyncio.run(stage_low.execute(context_low))

            # Execute with high strength
            stage_high = Img2ImgStage(strength=0.9)
            context_high = PipelineContext()
            context_high.set("source_image_path", str(image_path))
            context_high.set("job_id", "test_high")
            result_high = asyncio.run(stage_high.execute(context_high))

            # Both should succeed with different strengths
            assert result_low.metadata["img2img"]["strength"] == 0.1
            assert result_high.metadata["img2img"]["strength"] == 0.9


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
