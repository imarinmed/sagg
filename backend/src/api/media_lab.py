from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query

from ..media_lab.executor import JobExecutor
from ..media_lab.registry import ModelRegistry
from ..media_lab.workbench import Workbench
from ..models import (
    ArtifactData,
    ArtifactListResponse,
    CancelJobRequest,
    EnhanceRequest,
    GenerateRequest,
    MediaJobListResponse,
    MediaJobResponse,
    MediaJobSubmitRequest,
    ModelsListResponse,
    PipelineExecutionResponse,
    RetryJobRequest,
)

router = APIRouter(prefix="/api/media-lab", tags=["media-lab"])

# In-memory storage for demo (would be DB in production)
_jobs_store = {}
_artifacts_store = {}

# Executor instance for deterministic job processing
_executor = JobExecutor()

# Model registry singleton
_model_registry = ModelRegistry()


def _get_job_or_404(job_id: str) -> dict:
    """Helper to fetch job or raise 404"""
    if job_id not in _jobs_store:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return _jobs_store[job_id]


def _build_job_response(job_id: str) -> MediaJobResponse:
    """Build response DTO from stored job"""
    job = _get_job_or_404(job_id)
    artifacts = [ArtifactData(**artifact) for artifact in _artifacts_store.get(job_id, [])]
    return MediaJobResponse(
        id=job_id,
        character_id=job["character_id"],
        workflow_type=job["workflow_type"],
        status=job["status"],
        progress=job["progress"],
        error_message=job.get("error_message"),
        artifacts=artifacts,
        created_at=job["created_at"],
        updated_at=job["updated_at"],
    )


def _execute_interpolate_job(job_id: str) -> None:
    """Execute interpolation job immediately and persist results."""
    job = _jobs_store[job_id]
    try:
        job["status"] = "RUNNING"
        result = _executor.execute_interpolation(job_id, job["parameters"])
        job["status"] = "SUCCEEDED"
        job["progress"] = 100
        job["updated_at"] = datetime.now(UTC).replace(tzinfo=None)

        artifact = {
            "id": str(uuid4()),
            "artifact_type": "interpolated_video",
            "file_path": result["artifact_path"],
            "file_size_bytes": None,
            "metadata_json": result["metadata"],
        }
        _artifacts_store[job_id] = [artifact]
    except ValueError as e:
        job["status"] = "FAILED"
        job["progress"] = 0
        job["error_message"] = str(e)
        job["updated_at"] = datetime.now(UTC).replace(tzinfo=None)


def _execute_enhance_job(job_id: str) -> None:
    """Execute enhancement job immediately and persist results."""
    job = _jobs_store[job_id]
    try:
        job["status"] = "RUNNING"
        result = _executor.execute_enhance(job_id, job["parameters"])
        job["status"] = "SUCCEEDED"
        job["progress"] = 100
        job["updated_at"] = datetime.now(UTC).replace(tzinfo=None)

        artifact = {
            "id": str(uuid4()),
            "artifact_type": "enhanced_image",
            "file_path": result["artifact_path"],
            "file_size_bytes": None,
            "metadata_json": result["metadata"],
        }
        _artifacts_store[job_id] = [artifact]
    except ValueError as e:
        job["status"] = "FAILED"
        job["progress"] = 0
        job["error_message"] = str(e)
        job["updated_at"] = datetime.now(UTC).replace(tzinfo=None)


@router.post("/jobs", response_model=MediaJobResponse)
async def submit_job(request: MediaJobSubmitRequest):
    """Submit a new media job

    For enhance and interpolate workflows, executes immediately with validation.
    Returns job with SUCCEEDED status and progress=100 on success, or FAILED with
    error_message on validation error. Other workflow types are QUEUED.
    """
    job_id = str(uuid4())
    now = datetime.now(UTC).replace(tzinfo=None)

    _jobs_store[job_id] = {
        "character_id": request.character_id,
        "workflow_type": request.workflow_type,
        "status": "QUEUED",
        "progress": 0,
        "error_message": None,
        "parameters": request.parameters,
        "created_at": now,
        "updated_at": now,
    }
    _artifacts_store[job_id] = []

    # Execute enhance and interpolate workflows immediately
    if request.workflow_type == "interpolate":
        _execute_interpolate_job(job_id)
    elif request.workflow_type == "enhance":
        _execute_enhance_job(job_id)

    return _build_job_response(job_id)


@router.get("/jobs", response_model=MediaJobListResponse)
async def list_jobs(
    status: str | None = Query(None, description="Filter by status"),
    workflow_type: str | None = Query(None, description="Filter by workflow type"),
    character_id: str | None = Query(None, description="Filter by character"),
):
    """List all media jobs with optional filters"""
    jobs = []

    for job_id, job in _jobs_store.items():
        if status and job["status"] != status:
            continue
        if workflow_type and job["workflow_type"] != workflow_type:
            continue
        if character_id and job["character_id"] != character_id:
            continue

        jobs.append(_build_job_response(job_id))

    # Sort by created_at descending
    jobs.sort(key=lambda j: j.created_at, reverse=True)

    return MediaJobListResponse(
        total=len(jobs),
        jobs=jobs,
    )


@router.get("/jobs/{job_id}", response_model=MediaJobResponse)
async def get_job(job_id: str):
    """Get job details by ID

    Returns current job status, progress, error message (if any), and artifacts.
    """
    return _build_job_response(job_id)


@router.post("/jobs/{job_id}/cancel", response_model=MediaJobResponse)
async def cancel_job(job_id: str, request: CancelJobRequest | None = None):
    """Cancel a queued or running job

    Only cancels jobs in QUEUED or RUNNING state.
    Sets status to CANCELLED.
    """
    job = _get_job_or_404(job_id)

    # Only allow cancellation if in cancellable state
    if job["status"] not in ("QUEUED", "RUNNING"):
        raise HTTPException(status_code=409, detail=f"Cannot cancel job in {job['status']} state")

    job["status"] = "CANCELLED"
    job["updated_at"] = datetime.now(UTC).replace(tzinfo=None)

    return _build_job_response(job_id)


@router.post("/jobs/{job_id}/retry", response_model=MediaJobResponse)
async def retry_job(job_id: str, request: RetryJobRequest | None = None):
    """Retry a failed job

    Resets status to QUEUED and progress to 0.
    Only allows retry from FAILED state.
    """
    job = _get_job_or_404(job_id)

    # Only allow retry from FAILED state
    if job["status"] != "FAILED":
        raise HTTPException(
            status_code=409, detail=f"Can only retry FAILED jobs, current status: {job['status']}"
        )

    job["status"] = "QUEUED"
    job["progress"] = 0
    job["error_message"] = None
    job["updated_at"] = datetime.now(UTC).replace(tzinfo=None)

    return _build_job_response(job_id)


@router.get("/jobs/{job_id}/artifacts", response_model=ArtifactListResponse)
async def get_job_artifacts(job_id: str):
    """Get all artifacts for a job

    Returns list of artifact metadata (file paths, types, sizes).
    """
    # Verify job exists
    _get_job_or_404(job_id)

    artifacts = [ArtifactData(**artifact) for artifact in _artifacts_store.get(job_id, [])]

    return ArtifactListResponse(
        job_id=job_id,
        total_artifacts=len(artifacts),
        artifacts=artifacts,
    )


# Pipeline-based endpoints
@router.post("/generate", response_model=PipelineExecutionResponse)
async def generate(request: GenerateRequest):
    """Generate media using pipeline.

    Accepts a PipelineConfig and input_data (prompt, seed, etc.).
    Initializes Workbench, executes pipeline, returns results with artifacts.

    Returns:
        PipelineExecutionResponse with success status, data, artifacts, and optional error.
    """
    job_id = str(uuid4())

    try:
        # Initialize workbench with pipeline config
        workbench = Workbench(request.pipeline_config)

        # Execute pipeline
        result = await workbench.execute(request.input_data, job_id=job_id)

        # Return pipeline result as response
        return PipelineExecutionResponse(
            job_id=job_id,
            success=result.get("success", False),
            data=result.get("data", {}),
            artifacts=result.get("artifacts", []),
            metadata=result.get("metadata", {}),
            error=result.get("error"),
        )
    except Exception as e:
        return PipelineExecutionResponse(
            job_id=job_id,
            success=False,
            data={},
            artifacts=[],
            metadata={},
            error=str(e),
        )


@router.post("/enhance", response_model=PipelineExecutionResponse)
async def enhance(request: EnhanceRequest):
    """Enhance media using pipeline.

    Accepts a PipelineConfig and input_data (image path, enhancement level, etc.).
    Initializes Workbench, executes pipeline, returns results with artifacts.

    Returns:
        PipelineExecutionResponse with success status, data, artifacts, and optional error.
    """
    job_id = str(uuid4())

    try:
        # Initialize workbench with pipeline config
        workbench = Workbench(request.pipeline_config)

        # Execute pipeline
        result = await workbench.execute(request.input_data, job_id=job_id)

        # Return pipeline result as response
        return PipelineExecutionResponse(
            job_id=job_id,
            success=result.get("success", False),
            data=result.get("data", {}),
            artifacts=result.get("artifacts", []),
            metadata=result.get("metadata", {}),
            error=result.get("error"),
        )
    except Exception as e:
        return PipelineExecutionResponse(
            job_id=job_id,
            success=False,
            data={},
            artifacts=[],
            metadata={},
            error=str(e),
        )


@router.get("/models", response_model=ModelsListResponse)
async def list_models(model_type: str | None = Query(None, description="Filter by model type")):
    """List available models from registry.

    Optionally filters by model type: checkpoint, lora, embedding.

    Returns:
        ModelsListResponse with total count and list of ModelInfo objects.
    """
    # Convert string model type to enum if provided
    from ..models import ModelType

    try:
        filtered_type = ModelType(model_type) if model_type else None
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid model type: {model_type}")

    # Query registry
    models = _model_registry.list_models(filtered_type)

    return ModelsListResponse(
        total=len(models),
        models=models,
    )
