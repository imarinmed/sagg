# Character Media Lab - Implementation Contracts

This document defines the technical contracts, schemas, and architectural constraints for the Character Media Lab. These specifications are implementation-ready and must be followed by both the backend orchestration layer and the worker execution layer.

## 1. Job Lifecycle

All media processing tasks are managed as asynchronous jobs.

### 1.1. States
The lifecycle includes exactly the following states:
- `QUEUED`: Job has been created and is waiting for a worker.
- `RUNNING`: Job is currently being processed by a worker.
- `SUCCEEDED`: Job completed successfully; artifacts are available.
- `FAILED`: Job failed due to an error; error details are recorded.
- `CANCELLED`: Job was manually terminated before completion.

### 1.2. Transition Table

| From \ To | QUEUED | RUNNING | SUCCEEDED | FAILED | CANCELLED |
|-----------|:------:|:-------:|:---------:|:------:|:---------:|
| **QUEUED**| - | Allowed | Forbidden | Forbidden | Allowed |
| **RUNNING**| Forbidden | - | Allowed | Allowed | Allowed |
| **SUCCEEDED**| Forbidden | Forbidden | - | Forbidden | Forbidden |
| **FAILED**| Forbidden | Forbidden | Forbidden | - | Forbidden |
| **CANCELLED**| Forbidden | Forbidden | Forbidden | Forbidden | - |

*Note: Terminal states are SUCCEEDED, FAILED, and CANCELLED.*

## 2. Request/Response Schemas

Following the patterns in `backend/src/models.py`.

### 2.1. Common Models

```python
class MediaJobStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class MediaJobBase(BaseModel):
    job_id: str
    character_id: str
    status: MediaJobStatus
    created_at: datetime
    updated_at: datetime
    error_detail: str | None = None
```

### 2.2. Operation: Enhance
Upscale, denoise, or improve quality of an existing artifact.

**Request Schema:**
```python
class EnhanceRequest(BaseModel):
    artifact_id: str
    upscale_factor: float = Field(default=2.0, ge=1.0, le=4.0)
    denoise_strength: float = Field(default=0.5, ge=0.0, le=1.0)
    model_preset: str = "balanced"
```

**Response Schema:**
```python
class EnhanceResponse(MediaJobBase):
    input_artifact_id: str
    output_artifact_id: str | None = None
```

### 2.3. Operation: Interpolate
Generate intermediate frames or states between two artifacts.

**Request Schema:**
```python
class InterpolateRequest(BaseModel):
    start_artifact_id: str
    end_artifact_id: str
    frame_count: int = Field(default=8, ge=2, le=60)
    smoothness: float = Field(default=0.5, ge=0.0, le=1.0)
```

**Response Schema:**
```python
class InterpolateResponse(MediaJobBase):
    start_artifact_id: str
    end_artifact_id: str
    output_artifact_id: str | None = None
```

### 2.4. Operation: Generate
Create a new artifact from a prompt or seed.

**Request Schema:**
```python
class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    seed: int | None = None
    aspect_ratio: str = Field(default="1:1", pattern="^\d+:\d+$")
    steps: int = Field(default=30, ge=10, le=100)
```

**Response Schema:**
```python
class GenerateResponse(MediaJobBase):
    prompt: str
    output_artifact_id: str | None = None
```

### 2.5. Operation: Blend
Combine two or more artifacts into a new one.

**Request Schema:**
```python
class BlendRequest(BaseModel):
    artifact_ids: list[str] = Field(..., min_length=2, max_length=5)
    blend_mode: str = Field(default="weighted", pattern="^(weighted|overlay|morph)$")
    weights: list[float] | None = None # Must match artifact_ids length if provided
```

**Response Schema:**
```python
class BlendResponse(MediaJobBase):
    input_artifact_ids: list[str]
    output_artifact_id: str | None = None
```

## 3. Artifact & Provenance Model

### 3.1. Artifact Model
```python
class MediaArtifact(BaseModel):
    id: str
    character_id: str
    type: str = Field(..., pattern="^(image|video|latent)$")
    storage_path: str
    mime_type: str
    file_size_bytes: int
    metadata: dict = {}
    created_at: datetime
```

### 3.2. Provenance Model
Tracks the history and generation parameters of an artifact.
```python
class MediaProvenance(BaseModel):
    artifact_id: str
    source_job_id: str
    parent_artifact_ids: list[str] = []
    operation_type: str = Field(..., pattern="^(enhance|interpolate|generate|blend)$")
    parameters: dict # The original request parameters
    worker_id: str
    compute_time_seconds: float
```

## 4. Validation Constraints

1. **Character Context**: All operations must be scoped to a `character_id`. Cross-character blending is forbidden in V1.
2. **Artifact Existence**: Input `artifact_id`s must exist and be accessible to the user.
3. **Weight Consistency**: In `BlendRequest`, if `weights` are provided, `len(weights)` must equal `len(artifact_ids)`.
4. **Terminal Integrity**: Once a job reaches a terminal state (`SUCCEEDED`, `FAILED`, `CANCELLED`), no further transitions are allowed.

## 5. Architectural Skeleton

- **FastAPI (Orchestrator)**:
    - Receives requests, validates schemas.
    - Persists Job and Provenance metadata to SQLite.
    - Dispatches tasks to the Worker via a message queue (e.g., Redis/TaskIQ).
- **DAGGR (Internal Workbench)**:
    - Used as an internal workbench for testing and manual orchestration.
    - Not the sole production orchestrator; production flow goes through FastAPI.
- **Worker (Executor)**:
    - Pulls tasks from the queue.
    - Updates Job status to `RUNNING`.
    - Executes heavy compute (local GPU or managed burst).
    - Uploads artifacts to storage.
    - Updates Job status to `SUCCEEDED` or `FAILED`.
- **Storage**:
    - Artifacts stored in `data/media_lab/artifacts/`.
    - Metadata stored in `data/blod.db`.

## 6. Self-Consistency Checklist

- [ ] Lifecycle states match exactly `QUEUED|RUNNING|SUCCEEDED|FAILED|CANCELLED`.
- [ ] All four operations (`enhance`, `interpolate`, `generate`, `blend`) have request/response schemas.
- [ ] Transition table covers all possible state pairs.
- [ ] Artifact model includes `storage_path` and `character_id`.
- [ ] Provenance model links `artifact_id` to `source_job_id`.
- [ ] Validation constraints include weight consistency and terminal state locks.
- [ ] Schemas follow `pydantic` patterns from `backend/src/models.py`.
