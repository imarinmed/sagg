"""Tests for Media Lab API endpoints."""

import pytest

from src.api.media_lab import router, _model_registry
from src.models import (
    EnhanceRequest,
    GenerateRequest,
    ModelType,
    PipelineConfig,
    PipelineExecutionResponse,
    StageConfig,
)


@pytest.fixture
def basic_pipeline_config():
    """Create a basic pipeline configuration."""
    return PipelineConfig(
        stages=[
            StageConfig(stage_type="text_to_image"),
            StageConfig(stage_type="refiner"),
        ],
        parameters={},
    )


@pytest.fixture
def enhancement_pipeline_config():
    """Create an enhancement pipeline configuration."""
    return PipelineConfig(
        stages=[
            StageConfig(stage_type="detailer"),
            StageConfig(stage_type="upscaler", parameters={"upscale_factor": 2}),
        ],
        parameters={},
    )


class TestGenerateEndpoint:
    """Tests for generate endpoint logic."""

    def test_generate_request_model_valid(self, basic_pipeline_config):
        """Test GenerateRequest model creation."""
        request = GenerateRequest(
            pipeline_config=basic_pipeline_config,
            input_data={"prompt": "A beautiful sunset"},
        )

        assert request.pipeline_config == basic_pipeline_config
        assert request.input_data["prompt"] == "A beautiful sunset"

    def test_generate_request_model_default_input_data(self, basic_pipeline_config):
        """Test GenerateRequest with default empty input_data."""
        request = GenerateRequest(pipeline_config=basic_pipeline_config)

        assert request.pipeline_config == basic_pipeline_config
        assert request.input_data == {}

    def test_generate_request_custom_parameters(self, basic_pipeline_config):
        """Test GenerateRequest with custom parameters."""
        request = GenerateRequest(
            pipeline_config=basic_pipeline_config,
            input_data={
                "prompt": "A sunset over mountains",
                "seed": 42,
                "model": "custom_model",
            },
        )

        assert request.input_data["seed"] == 42
        assert request.input_data["model"] == "custom_model"

    def test_generate_request_with_upscaler(self):
        """Test GenerateRequest with upscaler stage."""
        config = PipelineConfig(
            stages=[
                StageConfig(stage_type="text_to_image"),
                StageConfig(
                    stage_type="upscaler",
                    parameters={"upscale_factor": 4},
                ),
            ],
            parameters={},
        )

        request = GenerateRequest(
            pipeline_config=config,
            input_data={"prompt": "High quality art"},
        )

        assert len(request.pipeline_config.stages) == 2
        assert request.pipeline_config.stages[1].stage_type == "upscaler"


class TestEnhanceEndpoint:
    """Tests for enhance endpoint logic."""

    def test_enhance_request_model_valid(self, enhancement_pipeline_config):
        """Test EnhanceRequest model creation."""
        request = EnhanceRequest(
            pipeline_config=enhancement_pipeline_config,
            input_data={"image": "path/to/image.png"},
        )

        assert request.pipeline_config == enhancement_pipeline_config
        assert request.input_data["image"] == "path/to/image.png"

    def test_enhance_request_model_default_input_data(
        self, enhancement_pipeline_config
    ):
        """Test EnhanceRequest with default empty input_data."""
        request = EnhanceRequest(pipeline_config=enhancement_pipeline_config)

        assert request.pipeline_config == enhancement_pipeline_config
        assert request.input_data == {}

    def test_enhance_request_with_multiple_stages(self):
        """Test EnhanceRequest with multiple stages."""
        config = PipelineConfig(
            stages=[
                StageConfig(stage_type="detailer"),
                StageConfig(stage_type="refiner"),
                StageConfig(
                    stage_type="upscaler",
                    parameters={"upscale_factor": 2},
                ),
            ],
            parameters={},
        )

        request = EnhanceRequest(
            pipeline_config=config,
            input_data={"image": "input.png"},
        )

        assert len(request.pipeline_config.stages) == 3


class TestModelsEndpoint:
    """Tests for models endpoint logic."""

    def test_model_registry_initialized(self):
        """Test model registry is initialized."""
        assert _model_registry is not None

    def test_model_registry_empty_initially(self):
        """Test model registry is empty initially."""
        assert _model_registry.count_models() == 0

    def test_model_registry_list_models(self):
        """Test listing models from registry."""
        models = _model_registry.list_models()
        assert isinstance(models, list)
        assert len(models) == 0

    def test_model_registry_list_by_checkpoint_type(self):
        """Test filtering by checkpoint type."""
        models = _model_registry.list_models(ModelType.CHECKPOINT)
        assert isinstance(models, list)
        assert len(models) == 0

    def test_model_registry_list_by_lora_type(self):
        """Test filtering by lora type."""
        models = _model_registry.list_models(ModelType.LORA)
        assert isinstance(models, list)
        assert len(models) == 0

    def test_model_registry_list_by_embedding_type(self):
        """Test filtering by embedding type."""
        models = _model_registry.list_models(ModelType.EMBEDDING)
        assert isinstance(models, list)
        assert len(models) == 0


class TestPipelineExecutionResponse:
    """Tests for PipelineExecutionResponse model."""

    def test_pipeline_execution_response_success(self):
        """Test PipelineExecutionResponse with success."""
        response = PipelineExecutionResponse(
            job_id="test-uuid",
            success=True,
            data={"prompt": "test"},
            artifacts=["artifact1.png"],
            metadata={"stage": "data"},
            error=None,
        )

        assert response.job_id == "test-uuid"
        assert response.success is True
        assert response.error is None

    def test_pipeline_execution_response_failure(self):
        """Test PipelineExecutionResponse with failure."""
        response = PipelineExecutionResponse(
            job_id="test-uuid",
            success=False,
            data={},
            artifacts=[],
            metadata={},
            error="Missing prompt field",
        )

        assert response.job_id == "test-uuid"
        assert response.success is False
        assert response.error == "Missing prompt field"

    def test_pipeline_execution_response_default_values(self):
        """Test PipelineExecutionResponse with default values."""
        response = PipelineExecutionResponse(
            job_id="test-uuid",
            success=True,
        )

        assert response.job_id == "test-uuid"
        assert response.data == {}
        assert response.artifacts == []
        assert response.metadata == {}
        assert response.error is None


class TestRouterRegistration:
    """Tests for API router registration."""

    def test_router_has_generate_endpoint(self):
        """Test /generate endpoint is registered."""
        routes = [route.path for route in router.routes]
        assert "/api/media-lab/generate" in routes

    def test_router_has_enhance_endpoint(self):
        """Test /enhance endpoint is registered."""
        routes = [route.path for route in router.routes]
        assert "/api/media-lab/enhance" in routes

    def test_router_has_models_endpoint(self):
        """Test /models endpoint is registered."""
        routes = [route.path for route in router.routes]
        assert "/api/media-lab/models" in routes

    def test_generate_endpoint_is_post(self):
        """Test /generate is a POST endpoint."""
        for route in router.routes:
            if route.path == "/api/media-lab/generate":
                assert "POST" in route.methods
                break
        else:
            pytest.fail("/generate endpoint not found")

    def test_enhance_endpoint_is_post(self):
        """Test /enhance is a POST endpoint."""
        for route in router.routes:
            if route.path == "/api/media-lab/enhance":
                assert "POST" in route.methods
                break
        else:
            pytest.fail("/enhance endpoint not found")

    def test_models_endpoint_is_get(self):
        """Test /models is a GET endpoint."""
        for route in router.routes:
            if route.path == "/api/media-lab/models":
                assert "GET" in route.methods
                break
        else:
            pytest.fail("/models endpoint not found")

    def test_router_has_legacy_endpoints(self):
        """Test legacy endpoints still exist."""
        routes = [route.path for route in router.routes]
        assert "/api/media-lab/jobs" in routes
        assert "/api/media-lab/jobs/{job_id}" in routes
        assert "/api/media-lab/jobs/{job_id}/artifacts" in routes

    def test_router_has_nine_endpoints_total(self):
        """Test router has all expected endpoints."""
        routes = [route.path for route in router.routes]
        # 6 legacy + 3 new = 9 total
        assert len(routes) == 9
