from datetime import UTC, datetime
from uuid import uuid4
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..media_lab.executor import JobExecutor
from ..media_lab.presets import get_preset_manager
from ..media_lab.registry import ModelRegistry
from ..media_lab.workbench import Workbench
from ..media_lab.civitai import get_civitai_client
from ..media_lab.huggingface import get_huggingface_client
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
    PresetRequest,
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


# Preset endpoints
@router.get("/presets")
async def list_presets():
    """List all saved presets.
    
    Returns:
        List of all presets with metadata (id, name, description, created_at, updated_at)
    """
    manager = get_preset_manager()
    presets = manager.list_presets()
    return {
        "total": len(presets),
        "presets": [p.to_dict() for p in presets],
    }


@router.post("/presets")
async def save_preset(request: PresetRequest):
    """Create and save a new preset.
    
    Args:
        request: PresetRequest with name, description, and config
        
    Returns:
        Created Preset with generated id and timestamps
    """
    try:
        manager = get_preset_manager()
        preset = manager.save_preset(request.name, request.description, request.config)
        return preset.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save preset: {str(e)}")


@router.get("/presets/{preset_id}")
async def get_preset(preset_id: str):
    """Get a specific preset by ID.
    
    Args:
        preset_id: ID of preset to retrieve
        
    Returns:
        Preset object with configuration
    """
    try:
        manager = get_preset_manager()
        preset = manager.load_preset(preset_id)
        return preset.to_dict()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Preset {preset_id} not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load preset: {str(e)}")


@router.delete("/presets/{preset_id}")
async def delete_preset(preset_id: str):
    """Delete a preset.
    
    Args:
        preset_id: ID of preset to delete
        
    Returns:
        Success message
    """
    try:
        manager = get_preset_manager()
        deleted = manager.delete_preset(preset_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Preset {preset_id} not found")
        return {"message": f"Preset {preset_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete preset: {str(e)}")


# Artifact Tagging Endpoints

class ArtifactTagsRequest(BaseModel):
    """Request for updating artifact tags"""
    tags: dict[str, list[str]] = Field(
        default_factory=dict,
        description="Tags mapping entity types to IDs: {character: [id1, id2], episode: [id1], mythos: [id1]}"
    )


@router.get("/artifacts/{artifact_id}/tags")
async def get_artifact_tags(artifact_id: str):
    """Get tags for an artifact.
    
    Args:
        artifact_id: ID of artifact to retrieve tags for
        
    Returns:
        Dict with artifact_id and tags
    """
    # TODO: Load artifact from storage and return tags
    # For now, return empty tags
    return {"artifact_id": artifact_id, "tags": {}}


@router.put("/artifacts/{artifact_id}/tags")
async def update_artifact_tags(artifact_id: str, request: ArtifactTagsRequest):
    """Update tags for an artifact.
    
    Args:
        artifact_id: ID of artifact to update tags for
        request: Tags to set
        
    Returns:
        Updated artifact with tags
    """
    # TODO: Load artifact, update tags, save back to storage
    # For now, return success message
    return {
        "artifact_id": artifact_id,
        "tags": request.tags,
        "message": "Tags updated successfully"
    }


# Related Images Endpoints

@router.get("/characters/{character_id}/related-images")
async def get_character_related_images(character_id: str):
    """Get all artifacts tagged with a character.
    
    Args:
        character_id: ID of character to find related images for
        
    Returns:
        List of artifacts tagged with this character
    """
    related = []
    for job_id, artifacts in _artifacts_store.items():
        for artifact_dict in artifacts:
            artifact = ArtifactData(**artifact_dict)
            if artifact.tags and "character" in artifact.tags:
                if character_id in artifact.tags["character"]:
                    related.append(artifact)
    return {"character_id": character_id, "artifacts": related, "count": len(related)}


@router.get("/episodes/{episode_id}/related-images")
async def get_episode_related_images(episode_id: str):
    """Get all artifacts tagged with an episode.
    
    Args:
        episode_id: ID of episode to find related images for
        
    Returns:
        List of artifacts tagged with this episode
    """
    related = []
    for job_id, artifacts in _artifacts_store.items():
        for artifact_dict in artifacts:
            artifact = ArtifactData(**artifact_dict)
            if artifact.tags and "episode" in artifact.tags:
                if episode_id in artifact.tags["episode"]:
                    related.append(artifact)
    return {"episode_id": episode_id, "artifacts": related, "count": len(related)}


@router.get("/mythos/{mythos_id}/related-images")
async def get_mythos_related_images(mythos_id: str):
    """Get all artifacts tagged with a mythos element.
    
    Args:
        mythos_id: ID of mythos element to find related images for
        
    Returns:
        List of artifacts tagged with this mythos element
    """
    related = []
    for job_id, artifacts in _artifacts_store.items():
        for artifact_dict in artifacts:
            artifact = ArtifactData(**artifact_dict)
            if artifact.tags and "mythos" in artifact.tags:
                if mythos_id in artifact.tags["mythos"]:
                    related.append(artifact)
    return {"mythos_id": mythos_id, "artifacts": related, "count": len(related)}

# CivitAI Model Remote Endpoints

@router.get("/models/remote/civitai")
async def search_civitai_models(
    query: str = Query(..., description="Search query for models"),
    model_type: str = Query("LORA", description="Model type (LORA, Checkpoint, etc.)"),
    nsfw: bool = Query(False, description="Include NSFW models"),
    limit: int = Query(10, ge=1, le=100, description="Max results to return")
):
    """Search CivitAI for models matching query.
    
    Args:
        query: Search query string
        model_type: Type of model to search for
        nsfw: Whether to include NSFW models
        limit: Maximum results (1-100)
        
    Returns:
        List of model metadata from CivitAI
    """
    try:
        client = get_civitai_client()
        results = client.search_models(query, model_type=model_type, nsfw=nsfw, limit=limit)
        return {
            "query": query,
            "type": model_type,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CivitAI search failed: {str(e)}")


@router.get("/models/remote/civitai/{version_id}")
async def get_civitai_model_version(version_id: str):
    """Get details for a specific CivitAI model version.
    
    Args:
        version_id: CivitAI model version ID
        
    Returns:
        Model version details including download URL
    """
    try:
        client = get_civitai_client()
        version = client.get_model_version(version_id)
        return version
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model version: {str(e)}")


class CivitAIDownloadRequest(BaseModel):
    """Request to download a CivitAI model."""
    download_url: str = Field(..., description="Direct download URL for the model")
    filename: str = Field(..., description="Filename to save as (e.g., model.safetensors)")


@router.post("/models/remote/civitai/download")
async def download_civitai_model(request: CivitAIDownloadRequest):
    """Download a model from CivitAI.
    
    Args:
        request: Download request with URL and filename
        
    Returns:
        Download status with file path
    """
    try:
        # Save to data/models/civitai directory
        save_path = Path(__file__).parent.parent.parent.parent / "data" / "models" / "civitai" / request.filename
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        client = get_civitai_client()
        final_path = client.download_model(request.download_url, save_path)
        
        return {
            "status": "success",
            "filename": request.filename,
            "path": str(final_path),
            "size": final_path.stat().st_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


# HuggingFace Hub Model Remote Endpoints

@router.get("/models/remote/huggingface")
async def search_huggingface_models(
    query: str = Query(..., description="Search query for models"),
    filter: str = Query("sdxl", description="Model filter (sdxl, checkpoint, etc.)"),
    limit: int = Query(10, ge=1, le=100, description="Max results to return")
):
    """Search HuggingFace Hub for models matching query.
    
    Args:
        query: Search query string
        filter: Model filter type (default: sdxl)
        limit: Maximum results (1-100)
        
    Returns:
        List of model metadata from HuggingFace Hub
    """
    try:
        client = get_huggingface_client()
        results = client.search_models(query, filter=filter, limit=limit)
        return {
            "query": query,
            "filter": filter,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HuggingFace search failed: {str(e)}")


@router.get("/models/remote/huggingface/{repo_id}")
async def get_huggingface_model_info(repo_id: str):
    """Get details for a specific HuggingFace model.
    
    Args:
        repo_id: HuggingFace model repository ID (e.g., runwayml/stable-diffusion-v1-5)
        
    Returns:
        Model metadata including description, likes, downloads, files
    """
    try:
        client = get_huggingface_client()
        info = client.get_model_info(repo_id)
        if not info:
            raise HTTPException(status_code=404, detail=f"Model {repo_id} not found on HuggingFace Hub")
        return info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


class HuggingFaceDownloadRequest(BaseModel):
    """Request to download a HuggingFace model."""
    repo_id: str = Field(..., description="HuggingFace repo ID (e.g., runwayml/stable-diffusion-v1-5)")
    filename: str = Field(..., description="Filename to download (e.g., model.safetensors)")


@router.post("/models/remote/huggingface/download")
async def download_huggingface_model(request: HuggingFaceDownloadRequest):
    """Download a model file from HuggingFace Hub.
    
    Args:
        request: Download request with repo_id and filename
        
    Returns:
        Download status with file path and size
    """
    try:
        # Save to data/models/huggingface directory
        save_path = Path(__file__).parent.parent.parent.parent / "data" / "models" / "huggingface" / request.filename
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        client = get_huggingface_client()
        final_path = client.download_model(request.repo_id, request.filename, save_path)
        
        return {
            "status": "success",
            "repo_id": request.repo_id,
            "filename": request.filename,
            "path": str(final_path),
            "size": final_path.stat().st_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
