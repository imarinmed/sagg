"""Tests for InstructPix2PixStage - instruction-based image editing."""

import asyncio
import os
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
import pytest
from PIL import Image

from src.media_lab.stages.instruct_pix2pix import InstructPix2PixStage, PipelineContext


class TestInstructPix2PixStageInitialization:
    """Test InstructPix2PixStage initialization and parameter validation."""

    def test_default_initialization(self):
        """Test initialization with default parameters."""
        stage = InstructPix2PixStage()
        assert stage.name == "InstructPix2PixStage"
        assert stage.model_name == "instruct-pix2pix-v1"
        assert stage.guidance_scale == 7.5
        assert stage.image_guidance_scale == 1.5

    def test_custom_initialization(self):
        """Test initialization with custom parameters."""
        stage = InstructPix2PixStage(
            model_name="custom-model", guidance_scale=10.0, image_guidance_scale=2.0
        )
        assert stage.model_name == "custom-model"
        assert stage.guidance_scale == 10.0
        assert stage.image_guidance_scale == 2.0

    def test_guidance_scale_validation_negative(self):
        """Test that negative guidance_scale raises ValueError."""
        with pytest.raises(ValueError, match="guidance_scale must be positive"):
            InstructPix2PixStage(guidance_scale=-1.0)

    def test_guidance_scale_validation_zero(self):
        """Test that zero guidance_scale raises ValueError."""
        with pytest.raises(ValueError, match="guidance_scale must be positive"):
            InstructPix2PixStage(guidance_scale=0.0)

    def test_image_guidance_scale_validation_negative(self):
        """Test that negative image_guidance_scale raises ValueError."""
        with pytest.raises(ValueError, match="image_guidance_scale must be positive"):
            InstructPix2PixStage(image_guidance_scale=-0.5)

    def test_guidance_scale_positive_values(self):
        """Test that positive guidance scales work."""
        stage = InstructPix2PixStage(guidance_scale=5.0, image_guidance_scale=1.0)
        assert stage.guidance_scale == 5.0
        assert stage.image_guidance_scale == 1.0


class TestInstructPix2PixStageImageLoading:
    """Test image loading functionality."""

    def test_load_image_file_success(self):
        """Test successful image file loading."""
        with TemporaryDirectory() as tmpdir:
            # Create test image
            test_image = Image.new("RGB", (256, 256), color=(100, 150, 200))
            image_path = Path(tmpdir) / "test.png"
            test_image.save(image_path)

            # Load image
            stage = InstructPix2PixStage()
            loaded = stage.load_image_file(str(image_path))

            assert isinstance(loaded, np.ndarray)
            assert loaded.shape == (256, 256, 3)
            assert loaded.dtype == np.uint8

    def test_load_image_file_not_found(self):
        """Test that FileNotFoundError is raised for missing file."""
        stage = InstructPix2PixStage()
        with pytest.raises(FileNotFoundError, match="Image file not found"):
            stage.load_image_file("/nonexistent/path/image.png")

    def test_load_image_file_invalid_format(self):
        """Test that ValueError is raised for invalid image."""
        with TemporaryDirectory() as tmpdir:
            # Create invalid image file
            invalid_path = Path(tmpdir) / "invalid.png"
            invalid_path.write_text("not an image")

            stage = InstructPix2PixStage()
            with pytest.raises(ValueError, match="Failed to load image"):
                stage.load_image_file(str(invalid_path))


class TestInstructPix2PixStageInputValidation:
    """Test input validation."""

    def test_validation_with_source_image_path_and_instruction(self):
        """Test that validation passes with source_image_path and instruction."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("source_image_path", "/some/path/image.png")
        context.set("instruction", "make it red")

        result = asyncio.run(stage.validate_input(context))
        assert result is True

    def test_validation_with_image_data_and_instruction(self):
        """Test that validation passes with image data and instruction."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (512, 512)})
        context.set("instruction", "add sunglasses")

        result = asyncio.run(stage.validate_input(context))
        assert result is True

    def test_validation_without_image(self):
        """Test that validation fails without image or path."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("instruction", "make it red")

        result = asyncio.run(stage.validate_input(context))
        assert result is False

    def test_validation_without_instruction(self):
        """Test that validation fails without instruction."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("source_image_path", "/some/path/image.png")

        result = asyncio.run(stage.validate_input(context))
        assert result is False

    def test_validation_with_empty_instruction(self):
        """Test that validation fails with empty instruction."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("source_image_path", "/some/path/image.png")
        context.set("instruction", "")

        result = asyncio.run(stage.validate_input(context))
        assert result is False

    def test_execute_without_image_raises_error(self):
        """Test that execute raises ValueError without image source."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("instruction", "make it red")

        with pytest.raises(ValueError, match="InstructPix2PixStage requires"):
            asyncio.run(stage.execute(context))

    def test_execute_without_instruction_raises_error(self):
        """Test that execute raises ValueError without instruction."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("source_image_path", "/some/path/image.png")

        with pytest.raises(ValueError, match="InstructPix2PixStage requires"):
            asyncio.run(stage.execute(context))


class TestInstructPix2PixStageExecution:
    """Test instruction-based image editing execution."""

    def test_execute_with_source_image_path(self):
        """Test execution with source_image_path."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (512, 512), color=(100, 100, 100))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Setup context
            stage = InstructPix2PixStage()
            context = PipelineContext()
            context.set("source_image_path", str(image_path))
            context.set("instruction", "make it red")
            context.set("job_id", "test_job")

            # Execute
            result_context = asyncio.run(stage.execute(context))

            # Verify
            assert result_context.get("image") is not None
            assert "instruct_pix2pix_path" in result_context.data
            assert "instruct_pix2pix_applied" in result_context.data["image"]
            assert result_context.data["image"]["instruct_pix2pix_applied"] is True
            assert result_context.data["image"]["instruction"] == "make it red"

    def test_execute_with_image_data(self):
        """Test execution with image data from previous stage."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "add sunglasses")
        context.set("job_id", "test_job")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.get("image") is not None
        assert result_context.get("instruct_pix2pix_path") is not None
        assert result_context.get("instruct_pix2pix_path") in result_context.artifacts

    def test_execute_stores_instruction_in_context(self):
        """Test that instruction is stored in image data."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "brighten the image")
        context.set("job_id", "test_job")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.data["image"]["instruction"] == "brighten the image"

    def test_execute_with_different_instructions(self):
        """Test execution with different instructions."""
        instructions = ["make it red", "add blue", "brighten", "make it dark"]

        for instruction in instructions:
            stage = InstructPix2PixStage()
            context = PipelineContext()
            context.set("image", {"model": "test", "dimensions": (256, 256)})
            context.set("instruction", instruction)
            context.set("job_id", f"test_{instruction.replace(' ', '_')}")

            result_context = asyncio.run(stage.execute(context))

            assert result_context.data["image"]["instruction"] == instruction
            assert result_context.metadata["instruct_pix2pix"]["instruction"] == instruction


class TestInstructPix2PixStagePaths:
    """Test artifact path handling."""

    def test_instruct_pix2pix_path_from_source_path(self):
        """Test that instruct_pix2pix path is derived from source path."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (256, 256), color=(100, 100, 100))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            stage = InstructPix2PixStage()
            context = PipelineContext()
            context.set("source_image_path", str(image_path))
            context.set("instruction", "edit it")
            context.set("job_id", "job1")

            result_context = asyncio.run(stage.execute(context))

            expected_path = str(image_path).replace(".png", "_instruct_pix2pix.png")
            assert result_context.get("instruct_pix2pix_path") == expected_path

    def test_instruct_pix2pix_path_from_job_id(self):
        """Test that instruct_pix2pix path uses job_id when no source path."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "make changes")
        context.set("job_id", "test_job_123")

        result_context = asyncio.run(stage.execute(context))

        assert "artifacts/test_job_123/instruct_pix2pix.png" in result_context.get(
            "instruct_pix2pix_path"
        )

    def test_artifact_created_on_disk(self):
        """Test that instruct_pix2pix artifact is created on disk."""
        with TemporaryDirectory() as tmpdir:
            # Change to temp directory for artifacts
            original_cwd = Path.cwd()
            try:
                os.chdir(tmpdir)

                stage = InstructPix2PixStage()
                context = PipelineContext()
                context.set("image", {"model": "test", "dimensions": (256, 256)})
                context.set("instruction", "edit the image")
                context.set("job_id", "disk_test")

                result_context = asyncio.run(stage.execute(context))

                instruct_pix2pix_path = result_context.get("instruct_pix2pix_path")
                assert Path(instruct_pix2pix_path).exists()
                assert instruct_pix2pix_path.endswith(".png")
            finally:
                os.chdir(original_cwd)


class TestInstructPix2PixStageMetadata:
    """Test metadata tracking."""

    def test_metadata_in_context(self):
        """Test that metadata is properly recorded."""
        stage = InstructPix2PixStage(
            model_name="custom-model", guidance_scale=10.0, image_guidance_scale=2.0
        )
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (512, 512)})
        context.set("instruction", "make it red")
        context.set("job_id", "meta_test")

        result_context = asyncio.run(stage.execute(context))

        metadata = result_context.metadata["instruct_pix2pix"]
        assert metadata["model"] == "custom-model"
        assert metadata["guidance_scale"] == 10.0
        assert metadata["image_guidance_scale"] == 2.0
        assert metadata["instruction"] == "make it red"
        assert "output_shape" in metadata

    def test_metadata_output_shape(self):
        """Test that output shape is correctly recorded."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "edit it")
        context.set("job_id", "shape_test")

        result_context = asyncio.run(stage.execute(context))

        shape = result_context.metadata["instruct_pix2pix"]["output_shape"]
        assert len(shape) == 3  # (H, W, C)


class TestInstructPix2PixStageArtifacts:
    """Test artifact tracking."""

    def test_artifact_added_to_list(self):
        """Test that instruct_pix2pix path is added to artifacts list."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "make changes")
        context.set("job_id", "artifact_test")

        initial_count = len(context.artifacts)
        result_context = asyncio.run(stage.execute(context))

        assert len(result_context.artifacts) == initial_count + 1
        assert result_context.get("instruct_pix2pix_path") in result_context.artifacts

    def test_multiple_executions_track_artifacts(self):
        """Test that multiple executions track separate artifacts."""
        stage = InstructPix2PixStage()

        # First execution
        context1 = PipelineContext()
        context1.set("image", {"model": "test", "dimensions": (256, 256)})
        context1.set("instruction", "edit 1")
        context1.set("job_id", "job1")
        result1 = asyncio.run(stage.execute(context1))

        # Second execution
        context2 = PipelineContext()
        context2.set("image", {"model": "test", "dimensions": (256, 256)})
        context2.set("instruction", "edit 2")
        context2.set("job_id", "job2")
        result2 = asyncio.run(stage.execute(context2))

        assert result1.get("instruct_pix2pix_path") != result2.get("instruct_pix2pix_path")
        assert len(result1.artifacts) == 1
        assert len(result2.artifacts) == 1


class TestInstructPix2PixStageErrorHandling:
    """Test error handling."""

    def test_error_on_missing_image(self):
        """Test error is set when image missing."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("instruction", "edit it")

        with pytest.raises(ValueError):
            asyncio.run(stage.execute(context))

        # Error should be set in context before exception
        assert context.error is not None
        assert "InstructPix2PixStage requires" in context.error

    def test_error_on_missing_instruction(self):
        """Test error when instruction is missing."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})

        with pytest.raises(ValueError):
            asyncio.run(stage.execute(context))

        assert context.error is not None

    def test_error_on_invalid_image_file(self):
        """Test error on invalid image file."""
        with TemporaryDirectory() as tmpdir:
            invalid_path = Path(tmpdir) / "invalid.png"
            invalid_path.write_text("not an image")

            stage = InstructPix2PixStage()
            context = PipelineContext()
            context.set("source_image_path", str(invalid_path))
            context.set("instruction", "edit it")
            context.set("job_id", "error_test")

            with pytest.raises(ValueError, match="Failed to load image"):
                asyncio.run(stage.execute(context))


class TestInstructPix2PixStageContextUpdates:
    """Test context data updates."""

    def test_image_data_updated(self):
        """Test that image data is updated with instruct_pix2pix info."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        original_image = {"model": "test", "dimensions": (256, 256), "prompt": "test"}
        context.set("image", original_image)
        context.set("instruction", "make it red")
        context.set("job_id", "update_test")

        result_context = asyncio.run(stage.execute(context))

        updated_image = result_context.get("image")
        assert updated_image["model"] == "test"
        assert updated_image["instruct_pix2pix_applied"] is True
        assert updated_image["instruction"] == "make it red"
        assert "dimensions" in updated_image

    def test_instruct_pix2pix_path_set_in_context(self):
        """Test that instruct_pix2pix_path is set in context."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "edit it")
        context.set("job_id", "path_test")

        result_context = asyncio.run(stage.execute(context))

        assert "instruct_pix2pix_path" in result_context.data
        assert isinstance(result_context.get("instruct_pix2pix_path"), str)


class TestInstructPix2PixStageIntegration:
    """Integration tests for InstructPix2PixStage."""

    def test_full_instruct_pix2pix_workflow(self):
        """Test complete instruction-based editing workflow."""
        with TemporaryDirectory() as tmpdir:
            # Create source image
            source_image = Image.new("RGB", (512, 512), color=(120, 120, 120))
            image_path = Path(tmpdir) / "source.png"
            source_image.save(image_path)

            # Setup pipeline
            stage = InstructPix2PixStage(
                model_name="instruct-v1", guidance_scale=8.0, image_guidance_scale=1.5
            )
            context = PipelineContext()
            context.set("source_image_path", str(image_path))
            context.set("instruction", "make the image brighter")
            context.set("job_id", "integration_test")

            # Execute
            result = asyncio.run(stage.execute(context))

            # Verify full state
            assert result.data["image"]["instruct_pix2pix_applied"] is True
            assert len(result.artifacts) == 1
            assert result.metadata["instruct_pix2pix"]["guidance_scale"] == 8.0
            assert result.error is None

    def test_instruction_parsing_red(self):
        """Test that 'red' instruction is recognized."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "make it red")
        context.set("job_id", "test_red")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.data["image"]["instruction"] == "make it red"
        assert result_context.metadata["instruct_pix2pix"]["instruction"] == "make it red"

    def test_instruction_parsing_blue(self):
        """Test that 'blue' instruction is recognized."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "add blue tones")
        context.set("job_id", "test_blue")

        result_context = asyncio.run(stage.execute(context))

        assert result_context.data["image"]["instruction"] == "add blue tones"

    def test_instruction_parsing_brightness(self):
        """Test that brightness instructions are recognized."""
        stage = InstructPix2PixStage()
        context = PipelineContext()
        context.set("image", {"model": "test", "dimensions": (256, 256)})
        context.set("instruction", "brighten this image")
        context.set("job_id", "test_bright")

        result_context = asyncio.run(stage.execute(context))

        assert "bright" in result_context.data["image"]["instruction"].lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
