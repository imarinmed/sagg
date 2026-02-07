"""Tests for pipeline infrastructure."""

import asyncio
from src.media_lab.pipeline import (
    Pipeline,
    PipelineContext,
    PipelineStage,
    TextToImageStage,
    RefinerStage,
    DetailerStage,
    UpscalerStage,
)


def async_test(coro):
    """Helper to run async tests."""
    return asyncio.run(coro)


class TestPipelineContext:
    """Tests for PipelineContext."""

    def test_context_set_and_get(self):
        """Test setting and retrieving values."""
        ctx = PipelineContext()
        ctx.set("key", "value")
        assert ctx.get("key") == "value"

    def test_context_get_default(self):
        """Test get with default value."""
        ctx = PipelineContext()
        assert ctx.get("nonexistent", "default") == "default"

    def test_context_add_artifact(self):
        """Test adding artifacts."""
        ctx = PipelineContext()
        ctx.add_artifact("path/to/artifact.png")
        assert "path/to/artifact.png" in ctx.artifacts

    def test_context_set_error(self):
        """Test error setting."""
        ctx = PipelineContext()
        ctx.set_error("Test error")
        assert ctx.error == "Test error"

    def test_context_metadata(self):
        """Test metadata storage."""
        ctx = PipelineContext()
        ctx.metadata["key"] = "value"
        assert ctx.metadata["key"] == "value"


class TestTextToImageStage:
    """Tests for TextToImageStage."""

    def test_execute_with_valid_prompt(self):
        """Test execution with valid prompt."""

        async def run():
            stage = TextToImageStage()
            ctx = PipelineContext()
            ctx.set("prompt", "A beautiful landscape")
            ctx.set("job_id", "test-job-1")

            result = await stage.execute(ctx)

            assert result.get("image") is not None
            assert result.get("image_path") is not None
            assert "generated.png" in result.get("image_path")

        async_test(run())

    def test_execute_missing_prompt(self):
        """Test execution fails without prompt."""

        async def run():
            stage = TextToImageStage()
            ctx = PipelineContext()

            try:
                await stage.execute(ctx)
                assert False, "Should have raised ValueError"
            except ValueError as e:
                assert "requires 'prompt'" in str(e)

        async_test(run())

    def test_validate_input_valid(self):
        """Test validation with valid prompt."""

        async def run():
            stage = TextToImageStage()
            ctx = PipelineContext()
            ctx.set("prompt", "Test prompt")

            assert await stage.validate_input(ctx) is True

        async_test(run())

    def test_validate_input_invalid(self):
        """Test validation with invalid prompt."""

        async def run():
            stage = TextToImageStage()
            ctx = PipelineContext()

            assert await stage.validate_input(ctx) is False

        async_test(run())


class TestRefinerStage:
    """Tests for RefinerStage."""

    def test_execute_with_image(self):
        """Test execution with image data."""

        async def run():
            stage = RefinerStage()
            ctx = PipelineContext()
            ctx.set("image", {"model": "test", "dimensions": (1024, 1024)})
            ctx.set("image_path", "artifacts/test-job-1/generated.png")

            result = await stage.execute(ctx)

            assert result.get("refined_path") is not None
            assert "_refined.png" in result.get("refined_path")

        async_test(run())

    def test_execute_missing_image(self):
        """Test execution fails without image."""

        async def run():
            stage = RefinerStage()
            ctx = PipelineContext()

            try:
                await stage.execute(ctx)
                assert False, "Should have raised ValueError"
            except ValueError as e:
                assert "requires 'image'" in str(e)

        async_test(run())


class TestDetailerStage:
    """Tests for DetailerStage."""

    def test_execute_with_image(self):
        """Test execution with image data."""

        async def run():
            stage = DetailerStage()
            ctx = PipelineContext()
            ctx.set("image", {"model": "test", "dimensions": (1024, 1024)})
            ctx.set("refined_path", "artifacts/test-job-1/generated_refined.png")

            result = await stage.execute(ctx)

            assert result.get("detail_path") is not None
            assert "_detailed.png" in result.get("detail_path")

        async_test(run())

    def test_execute_missing_image(self):
        """Test execution fails without image."""

        async def run():
            stage = DetailerStage()
            ctx = PipelineContext()

            try:
                await stage.execute(ctx)
                assert False, "Should have raised ValueError"
            except ValueError as e:
                assert "requires 'image'" in str(e)

        async_test(run())


class TestUpscalerStage:
    """Tests for UpscalerStage."""

    def test_execute_with_image(self):
        """Test execution with image data."""

        async def run():
            stage = UpscalerStage(upscale_factor=2)
            ctx = PipelineContext()
            ctx.set("image", {"model": "test", "dimensions": (1024, 1024)})
            ctx.set("detail_path", "artifacts/test-job-1/generated_detailed.png")

            result = await stage.execute(ctx)

            assert result.get("upscaled_path") is not None
            assert "_upscaled.png" in result.get("upscaled_path")
            assert result.get("image").get("upscale_factor") == 2

        async_test(run())

    def test_execute_custom_upscale_factor(self):
        """Test execution with custom upscale factor."""

        async def run():
            stage = UpscalerStage(upscale_factor=4)
            ctx = PipelineContext()
            ctx.set("image", {"model": "test", "dimensions": (1024, 1024)})
            ctx.set("detail_path", "artifacts/test-job-1/generated_detailed.png")

            result = await stage.execute(ctx)

            assert result.get("image").get("upscale_factor") == 4
            metadata = result.metadata["upscaler"]
            assert metadata["upscaled_dimensions"] == (4096, 4096)

        async_test(run())

    def test_execute_missing_image(self):
        """Test execution fails without image."""

        async def run():
            stage = UpscalerStage()
            ctx = PipelineContext()

            try:
                await stage.execute(ctx)
                assert False, "Should have raised ValueError"
            except ValueError as e:
                assert "requires 'image'" in str(e)

        async_test(run())


class TestPipeline:
    """Tests for Pipeline orchestration."""

    def test_execute_full_pipeline(self):
        """Test execution of complete pipeline."""

        async def run():
            stages = [
                TextToImageStage(),
                RefinerStage(),
                DetailerStage(),
                UpscalerStage(upscale_factor=2),
            ]
            pipeline = Pipeline(stages)

            ctx = PipelineContext()
            ctx.set("prompt", "A test image")
            ctx.set("job_id", "test-job-1")

            result = await pipeline.execute(ctx)

            assert result.error is None
            assert len(result.artifacts) == 4
            assert result.get("upscaled_path") is not None

        async_test(run())

    def test_pipeline_stops_on_error(self):
        """Test pipeline stops execution on error."""

        async def run():
            stages = [
                TextToImageStage(),
                RefinerStage(),
            ]
            pipeline = Pipeline(stages)

            ctx = PipelineContext()

            try:
                await pipeline.execute(ctx)
                assert False, "Should have raised ValueError"
            except ValueError:
                pass

        async_test(run())

    def test_pipeline_artifact_tracking(self):
        """Test artifact tracking through pipeline."""

        async def run():
            stages = [
                TextToImageStage(),
                RefinerStage(),
                DetailerStage(),
                UpscalerStage(),
            ]
            pipeline = Pipeline(stages)

            ctx = PipelineContext()
            ctx.set("prompt", "Test")
            ctx.set("job_id", "test-job-123")

            result = await pipeline.execute(ctx)

            assert len(result.artifacts) == 4
            assert all(isinstance(a, str) for a in result.artifacts)

        async_test(run())

    def test_pipeline_metadata_aggregation(self):
        """Test metadata aggregation across stages."""

        async def run():
            stages = [
                TextToImageStage(),
                RefinerStage(),
                DetailerStage(),
                UpscalerStage(upscale_factor=2),
            ]
            pipeline = Pipeline(stages)

            ctx = PipelineContext()
            ctx.set("prompt", "Test")
            ctx.set("job_id", "test-job-1")

            result = await pipeline.execute(ctx)

            assert "text_to_image" in result.metadata
            assert "refiner" in result.metadata
            assert "detailer" in result.metadata
            assert "upscaler" in result.metadata

        async_test(run())
