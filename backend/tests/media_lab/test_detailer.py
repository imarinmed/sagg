"""Tests for DetailerStage pipeline stage."""

import asyncio
import tempfile
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from src.media_lab.stages.detailer import DetailerStage, PipelineContext


def async_test(coro):
    """Helper to run async tests."""
    return asyncio.run(coro)


@pytest.fixture
def temp_dir():
    """Create temporary directory for test artifacts."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def sample_image(temp_dir: Path) -> str:
    """Create a sample image file for testing."""
    img_array = np.random.randint(50, 200, (512, 512, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    img_path = temp_dir / "test_image.png"
    img.save(img_path)
    return str(img_path)


@pytest.fixture
def sample_mask(temp_dir: Path) -> str:
    """Create a sample mask file for testing."""
    mask_array = np.zeros((512, 512), dtype=np.uint8)
    mask_array[200:300, 200:300] = 255  # Center square
    mask = Image.fromarray(mask_array)
    mask_path = temp_dir / "test_mask.png"
    mask.save(mask_path)
    return str(mask_path)


class TestDetailerStageInitialization:
    """Tests for DetailerStage initialization."""

    def test_default_initialization(self):
        """Test DetailerStage with default parameters."""
        stage = DetailerStage()
        assert stage.name == "DetailerStage"
        assert stage.model_name == "stable-diffusion-inpaint-v1"
        assert stage.strength == 0.75
        assert stage.guidance_scale == 7.5
        assert stage.center_crop_ratio == 0.8

    def test_custom_initialization(self):
        """Test DetailerStage with custom parameters."""
        stage = DetailerStage(
            model_name="custom-model",
            strength=0.5,
            guidance_scale=10.0,
            center_crop_ratio=0.6,
        )
        assert stage.model_name == "custom-model"
        assert stage.strength == 0.5
        assert stage.guidance_scale == 10.0
        assert stage.center_crop_ratio == 0.6


class TestROIDetection:
    """Tests for ROI detection and cropping."""

    def test_detect_roi_default_ratio(self):
        """Test ROI detection with default center-crop ratio."""
        stage = DetailerStage(center_crop_ratio=0.8)
        image = np.zeros((512, 512, 3), dtype=np.uint8)
        roi = stage.detect_roi(image)

        x, y, w, h = roi
        assert x == 51  # (512 - 409.6) / 2
        assert y == 51
        assert w == 409  # 512 * 0.8 (int)
        assert h == 409

    def test_detect_roi_custom_ratio(self):
        """Test ROI detection with custom ratio."""
        stage = DetailerStage(center_crop_ratio=0.5)
        image = np.zeros((512, 512, 3), dtype=np.uint8)
        roi = stage.detect_roi(image)

        x, y, w, h = roi
        assert w == 256  # 512 * 0.5
        assert h == 256

    def test_crop_roi(self):
        """Test ROI cropping from image."""
        stage = DetailerStage()
        image = np.arange(27).reshape((3, 3, 3)).astype(np.uint8)
        roi = (1, 1, 2, 2)

        cropped = stage.crop_roi(image, roi)
        assert cropped.shape == (2, 2, 3)

    def test_composite_roi_without_mask(self):
        """Test ROI compositing back to image without mask."""
        stage = DetailerStage()
        base = np.zeros((10, 10, 3), dtype=np.uint8)
        roi_img = np.ones((5, 5, 3), dtype=np.uint8) * 255
        roi = (2, 2, 5, 5)

        result = stage.composite_roi(base, roi_img, roi)
        assert result.shape == (10, 10, 3)
        assert (result[2:7, 2:7] == 255).all()
        assert (result[0:2, :] == 0).all()

    def test_composite_roi_with_mask(self):
        """Test ROI compositing with blend mask."""
        stage = DetailerStage()
        base = np.zeros((10, 10, 3), dtype=np.uint8)
        roi_img = np.ones((5, 5, 3), dtype=np.uint8) * 255
        roi = (2, 2, 5, 5)
        mask = np.ones((5, 5), dtype=np.uint8) * 128  # 50% opacity

        result = stage.composite_roi(base, roi_img, roi, mask)
        assert result.shape == (10, 10, 3)
        # With 50% mask, result should be around 127-128
        assert (result[2:7, 2:7] > 100).all()
        assert (result[2:7, 2:7] < 200).all()


class TestImageLoading:
    """Tests for image file loading."""

    def test_load_image_file_success(self, sample_image: str):
        """Test successful image loading."""
        stage = DetailerStage()
        image = stage.load_image_file(sample_image)
        assert image.shape == (512, 512, 3)
        assert image.dtype == np.uint8

    def test_load_image_file_not_found(self):
        """Test error handling for missing image file."""
        stage = DetailerStage()
        with pytest.raises(FileNotFoundError):
            stage.load_image_file("/nonexistent/path/image.png")

    def test_load_image_file_invalid(self, temp_dir: Path):
        """Test error handling for invalid image file."""
        stage = DetailerStage()
        invalid_file = temp_dir / "invalid.png"
        invalid_file.write_text("not an image")

        with pytest.raises(ValueError):
            stage.load_image_file(str(invalid_file))


class TestInputValidation:
    """Tests for input validation."""

    def test_validate_input_with_image(self):
        """Test validation passes when image exists."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("image", {"data": "mock_image"})

        is_valid = async_test(stage.validate_input(context))
        assert is_valid is True

    def test_validate_input_without_image(self):
        """Test validation fails when image missing."""
        stage = DetailerStage()
        context = PipelineContext()

        is_valid = async_test(stage.validate_input(context))
        assert is_valid is False

    def test_execute_without_image(self):
        """Test execute raises error when image missing."""
        stage = DetailerStage()
        context = PipelineContext()

        with pytest.raises(ValueError, match="requires 'image'"):
            async_test(stage.execute(context))


class TestInpaintingMode:
    """Tests for inpainting execution with mask."""

    def test_execute_with_mask_from_image_path(self, sample_image: str, temp_dir: Path):
        """Test inpainting with mask from image file path."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set(
            "image",
            {
                "model": "test",
                "dimensions": (512, 512),
            },
        )

        # Create simple mask
        mask = np.ones((512, 512), dtype=np.uint8) * 200
        mask[256:, :] = 0  # Bottom half only
        context.set("mask", mask)

        result_context = async_test(stage.execute(context))
        assert result_context.error is None
        assert "detail_path" in result_context.data
        assert Path(result_context.data["detail_path"]).exists()
        assert result_context.metadata["detailer"]["mode"] == "inpainting"

    def test_execute_with_dict_mask(self, sample_image: str):
        """Test inpainting with mask as dictionary."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        # Mask as dictionary
        mask_data = np.ones((512, 512), dtype=np.uint8) * 200
        context.set("mask", {"data": mask_data})

        result_context = async_test(stage.execute(context))
        assert result_context.error is None
        assert result_context.metadata["detailer"]["mode"] == "inpainting"


class TestImg2ImgMode:
    """Tests for img2img execution without mask."""

    def test_execute_without_mask_from_image_path(self, sample_image: str):
        """Test img2img enhancement without mask."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set(
            "image",
            {
                "model": "test",
                "dimensions": (512, 512),
            },
        )

        result_context = async_test(stage.execute(context))
        assert result_context.error is None
        assert "detail_path" in result_context.data
        assert result_context.metadata["detailer"]["mode"] == "img2img"

    def test_execute_without_mask_from_image_data(self):
        """Test img2img with mock image data."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set(
            "image",
            {
                "model": "test",
                "dimensions": (256, 256),
            },
        )

        result_context = async_test(stage.execute(context))
        assert result_context.error is None
        assert result_context.metadata["detailer"]["mode"] == "img2img"


class TestROIProcessing:
    """Tests for ROI-based processing."""

    def test_execute_with_custom_roi(self, sample_image: str):
        """Test processing with custom ROI."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})
        context.set("roi", (100, 100, 200, 200))

        result_context = async_test(stage.execute(context))
        assert result_context.error is None
        roi_in_metadata = result_context.metadata["detailer"]["roi"]
        assert roi_in_metadata == [100, 100, 200, 200]

    def test_execute_auto_roi_detection(self, sample_image: str):
        """Test automatic ROI detection when not provided."""
        stage = DetailerStage(center_crop_ratio=0.8)
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        result_context = async_test(stage.execute(context))
        assert result_context.error is None
        roi = result_context.metadata["detailer"]["roi"]
        assert len(roi) == 4
        assert roi[2] == 409  # width at 0.8 ratio


class TestMetadataTracking:
    """Tests for metadata collection."""

    def test_metadata_in_inpainting_mode(self, sample_image: str):
        """Test metadata collected in inpainting mode."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})
        context.set("mask", np.ones((512, 512), dtype=np.uint8) * 200)

        result_context = async_test(stage.execute(context))

        detailer_meta = result_context.metadata["detailer"]
        assert detailer_meta["mode"] == "inpainting"
        assert detailer_meta["model"] == "stable-diffusion-inpaint-v1"
        assert detailer_meta["strength"] == 0.75
        assert detailer_meta["guidance_scale"] == 7.5
        assert "roi" in detailer_meta
        assert "output_shape" in detailer_meta

    def test_metadata_in_img2img_mode(self, sample_image: str):
        """Test metadata collected in img2img mode."""
        stage = DetailerStage(strength=0.6, guidance_scale=8.0)
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        result_context = async_test(stage.execute(context))

        detailer_meta = result_context.metadata["detailer"]
        assert detailer_meta["mode"] == "img2img"
        assert detailer_meta["strength"] == 0.6
        assert detailer_meta["guidance_scale"] == 8.0


class TestArtifactTracking:
    """Tests for artifact path tracking."""

    def test_artifact_added_to_context(self, sample_image: str):
        """Test that output artifact is added to context."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        result_context = async_test(stage.execute(context))

        assert len(result_context.artifacts) > 0
        assert result_context.data["detail_path"] in result_context.artifacts

    def test_artifact_file_created(self, sample_image: str):
        """Test that artifact file is created on disk."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"model": "test", "dimensions": (512, 512)})

        result_context = async_test(stage.execute(context))
        detail_path = result_context.data["detail_path"]

        assert Path(detail_path).exists()
        # Verify it's a valid image
        loaded_img = Image.open(detail_path)
        assert loaded_img.size == (512, 512)


class TestErrorHandling:
    """Tests for error handling."""

    def test_error_on_missing_image(self):
        """Test error handling when image is missing."""
        stage = DetailerStage()
        context = PipelineContext()

        with pytest.raises(ValueError, match="requires 'image'"):
            async_test(stage.execute(context))

        assert context.error is not None
        assert "image" in context.error

    def test_error_on_bad_image_path(self, temp_dir: Path):
        """Test error handling when image file can't be loaded."""
        stage = DetailerStage()
        context = PipelineContext()
        # Point to a file that exists but isn't an image
        invalid_image = temp_dir / "invalid.txt"
        invalid_image.write_text("not an image")
        context.set("image_path", str(invalid_image))
        context.set("image", {"dimensions": (512, 512)})

        with pytest.raises(ValueError):
            async_test(stage.execute(context))


class TestContextUpdates:
    """Tests for context data updates."""

    def test_image_data_updated(self, sample_image: str):
        """Test that image data is updated with detail info."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        original_data = {"model": "test", "dimensions": (512, 512)}
        context.set("image", original_data)

        result_context = async_test(stage.execute(context))
        updated_image = result_context.data["image"]

        assert "detail_pass" in updated_image
        assert updated_image["detail_pass"] == 1
        assert updated_image["edge_enhancement"] is True
        assert updated_image["texture_detail"] is True
        assert updated_image["model"] == "test"  # Original data preserved

    def test_detail_path_set(self, sample_image: str):
        """Test that detail_path is set in context."""
        stage = DetailerStage()
        context = PipelineContext()
        context.set("job_id", "test_job")
        context.set("image_path", sample_image)
        context.set("image", {"dimensions": (512, 512)})

        result_context = async_test(stage.execute(context))
        assert "detail_path" in result_context.data
        assert "_detailed.png" in result_context.data["detail_path"]
