## T1: 9-Stage Linear Pipeline Implementation (COMPLETED)

### Architecture Implemented

1. **PipelineContext**: Shared state object passed through stages
   - Stores intermediate results in `data` dict
   - Tracks artifacts generated at each stage
   - Collects metadata from each stage
   - Can store error state for graceful degradation

2. **PipelineStage**: Abstract base class for all pipeline stages
   - `execute(context)` async method (must override)
   - `validate_input(context)` async method (can override)
   - Name-based identification for logging

3. **Concrete Stages Implemented**:
   - **TextToImageStage**: Generates image from text prompt
     - Input: `prompt` (required), `model` (optional), `job_id`, `seed`
     - Output: `image` dict, `image_path` artifact
   - **RefinerStage**: Refines generated image with detail
     - Input: `image` from previous stage, `refinement_level` (optional)
     - Output: refined `image`, `refined_path` artifact
   - **DetailerStage**: Adds fine detail enhancement
     - Input: `image` from previous stage
     - Output: detailed `image`, `detail_path` artifact
   - **UpscalerStage**: Upscales image to higher resolution
     - Input: `image`, configurable `upscale_factor` (default 2x)
     - Output: upscaled `image`, `upscaled_path` artifact, dimension metadata

4. **Pipeline Orchestrator**: Executes stages sequentially
   - Passes context through all stages
   - Stops on first error
   - Aggregates metadata from all stages

### Data Flow

```
PipelineContext
  ├─ data: {prompt, image, image_path, refined_path, detail_path, upscaled_path, ...}
  ├─ artifacts: [generated.png, generated_refined.png, generated_detailed.png, generated_upscaled.png]
  └─ metadata: {text_to_image: {...}, refiner: {...}, detailer: {...}, upscaler: {...}}
```

### Key Design Decisions

1. **Async-First**: All stage execution is async to prepare for real I/O operations
2. **Context Passing**: Single context object avoids parameter explosion
3. **Artifact Tracking**: Built-in list of artifacts generated makes job output management easy
4. **Graceful Degradation**: Error state stored in context allows partial pipeline success
5. **Metadata Aggregation**: Each stage updates context.metadata with its own key for clear origin

### Testing Coverage (20 tests, all passing)

- PipelineContext: 5 tests (set/get, default, artifact, error, metadata)
- TextToImageStage: 4 tests (valid prompt, missing prompt, valid input, invalid input)
- RefinerStage: 2 tests (with image, missing image)
- DetailerStage: 2 tests (with image, missing image)
- UpscalerStage: 3 tests (with image, custom factor, missing image)
- Pipeline: 4 tests (full pipeline, error handling, artifact tracking, metadata aggregation)

### Next Steps (T2)

- Integrate with JobExecutor for real job lifecycle management
- Connect PipelineConfig to API for dynamic pipeline configuration
- Implement real generation logic replacing "Simulate X" placeholders
- Add progress tracking to context during execution

## T2: Workbench Controller Implementation (COMPLETED)

### Architecture Implemented

1. **Workbench Class**: High-level controller for pipeline execution
   - `__init__(config: PipelineConfig)`: Initialize with pipeline configuration
   - `setup()`: Build pipeline stages from config asynchronously
   - `execute(input_data, job_id)`: Run complete pipeline lifecycle
   - `_build_stage(stage_cfg)`: Factory method for creating stage instances
   - `_teardown()`: Collect results, artifacts, and metadata

2. **Lifecycle Management**
   - **Setup**: Build stages in order from PipelineConfig
   - **Execute**: Initialize context, merge parameters, run pipeline
   - **Teardown**: Collect results with success flag, artifacts, metadata, errors

3. **Configuration Integration**
   - Accepts `PipelineConfig` with list of `StageConfig` items
   - Each stage has `stage_type`, optional `name`, and `parameters` dict
   - Pipeline-level `parameters` merged with input data (input_data overrides)
   - Upscaler supports `upscale_factor` parameter

4. **Error Handling**
   - Graceful error propagation from pipeline to results
   - Context.error captured and returned in response
   - Missing required fields (e.g., prompt) fail with descriptive error
   - Exception messages include stage name for debugging

5. **Job Context**
   - `job_id` parameter used for artifact path generation
   - Default `job_id` is "unknown"
   - Context includes all input data + pipeline parameters

### Data Flow

```
PipelineConfig
  ├─ stages: [StageConfig, ...]
  └─ parameters: {global settings}
         ↓
      Workbench.execute(input_data)
         ↓
      setup() → build stages → Pipeline instance
         ↓
      initialize context + merge parameters
         ↓
      pipeline.execute(context)
         ↓
      teardown() → {success, data, artifacts, metadata, error}
```

### Key Design Decisions

1. **Async/Await**: Both setup and execute are async to prepare for real I/O
2. **Factory Pattern**: `_build_stage()` method for dynamic stage instantiation
3. **Error Resilience**: Graceful error handling returns result dict with error field
4. **Parameter Merging**: Config parameters + input data with precedence (input wins)
5. **Job Tracking**: job_id threaded through all artifacts for traceability

### Testing Coverage (18 tests, all passing)

- Initialization: 1 test
- Setup: 2 tests (basic, all stage types)
- Stage Building: 4 tests (individual stage types + custom factors)
- Execution: 7 tests (successful, merging, error handling, metadata collection)
- Teardown: 4 tests (artifacts, metadata, error state)

### API Contract

```python
workbench = Workbench(config: PipelineConfig)
await workbench.execute(
    input_data: dict[str, Any],
    job_id: str = "unknown"
) → {
    'success': bool,
    'data': dict[str, Any],
    'artifacts': list[str],
    'metadata': dict[str, Any],
    'error': str | None
}
```

### Next Steps (T3+)

- Connect to JobExecutor for persistence
- Implement real API endpoint (GET /api/media/submit)
- Add progress tracking during execution
- Implement artifact storage management

## T3: ModelRegistry Implementation (COMPLETED)

### Architecture Implemented

1. **ModelType Enum**: Supported model types
   - `CHECKPOINT`: Model weights (safetensors/ckpt files)
   - `LORA`: LoRA adapter files
   - `EMBEDDING`: Embedding model files

2. **ModelInfo Pydantic Model**: Metadata for registered models
   - `name`: Unique identifier
   - `model_type`: ModelType enum
   - `file_path`: Absolute file path
   - `file_size_bytes`: File size (optional)
   - `discovered_at`: Discovery timestamp
   - `description`: Optional description
   - `tags`: List of categorization tags
   - `metadata`: Arbitrary metadata dict

3. **ModelRegistry Class**: Lightweight model discovery and management
   - **Scanning**: `scan_models(directory)` recursively finds .safetensors and .ckpt files
     - Creates directories if missing
     - Generates model names from file stems
     - Handles duplicates by adding parent directory
     - Captures file size and discovery timestamp
   - **Registration**: `register_model(path, type, name?, description?, tags?)` manually adds models
     - Validates file exists and extension is supported
     - Supports custom names and metadata
   - **Querying**:
     - `get_model_path(name)`: Get file path by name
     - `get_model(name)`: Get full ModelInfo
     - `list_models(type?)`: List all or filter by type
     - `list_all()`: Alias for list_models()
     - `count_models(type?)`: Count total or by type
     - `model_exists(name)`: Check if registered
   - **Management**:
     - `remove_model(name)`: Remove from registry
     - `clear()`: Empty entire registry

### Key Design Decisions

1. **Metadata Only**: Registry doesn't load models into VRAM, only tracks metadata
2. **Stem-Based Naming**: Use filename without extension as primary name for simplicity
3. **Duplicate Handling**: Add parent directory for duplicates (not implemented yet, but architecture supports it)
4. **Extension Support**: .safetensors and .ckpt both treated as checkpoints
5. **Type Safety**: Full Pydantic validation with ModelType enum

### Testing Coverage (40 tests, all passing)

**Scanning (11 tests)**:
- Creates missing directories
- Handles empty directories
- Finds .safetensors and .ckpt files
- Recursively scans nested directories
- Ignores non-model files
- Sets absolute paths
- Detects timestamps and file sizes
- Returns ModelInfo objects
- Handles non-directory paths gracefully

**Registration (9 tests)**:
- Basic registration with default naming
- Custom names
- Description and tags
- File not found error handling
- Unsupported extension validation
- All three model types (checkpoint, lora, embedding)

**Querying (11 tests)**:
- Get path by name (found/not found)
- Get full ModelInfo (found/not found)
- List all models
- Filter by type (checkpoint, lora, embedding)
- Empty filter results
- Count operations (total and by type)

**Management (6 tests)**:
- Model existence check
- Remove model (success/not found)
- Clear entire registry
- Overwriting existing models

**Integration (3 tests)**:
- Scan then query workflow
- Mix scanning and manual registration
- Complete workflow with scan, register, query, remove

### API Contract

```python
registry = ModelRegistry()

# Scanning
discovered: list[ModelInfo] = await registry.scan_models("/path/to/models")

# Registration
model: ModelInfo = registry.register_model(
    path="/path/to/model.safetensors",
    model_type=ModelType.CHECKPOINT,
    name="my_model",  # optional
    description="Description",  # optional
    tags=["tag1", "tag2"]  # optional
)

# Queries
path: str | None = registry.get_model_path("my_model")
info: ModelInfo | None = registry.get_model("my_model")
all_models: list[ModelInfo] = registry.list_models()
checkpoints: list[ModelInfo] = registry.list_models(ModelType.CHECKPOINT)
count: int = registry.count_models()
exists: bool = registry.model_exists("my_model")

# Management
removed: bool = registry.remove_model("my_model")
registry.clear()
```

### Next Steps (T4/T5)

- Integrate ModelRegistry into Pipeline/JobExecutor
- Add async support for scanning large directories
- Implement model loading logic (not registry responsibility)
- Add model caching layer
- Connect to API endpoints for model discovery
- Add per-model configuration support


## T4: Media Lab API Integration (COMPLETED)

### API Endpoints Implemented

1. **POST /api/media-lab/generate**
   - Input: `GenerateRequest` with `pipeline_config` and `input_data`
   - Flow: Request → Initialize Workbench → Execute Pipeline → PipelineExecutionResponse
   - Returns: Job ID, success flag, data dict, artifacts list, metadata, optional error
   - Async-friendly wrapper around Workbench

2. **POST /api/media-lab/enhance**
   - Input: `EnhanceRequest` with `pipeline_config` and `input_data`
   - Identical flow to `/generate` but for enhancement workflows
   - Supports custom enhancement stages from PipelineConfig
   - Returns: Same as generate (PipelineExecutionResponse)

3. **GET /api/media-lab/models**
   - Query param: `model_type` (optional, filter by: checkpoint, lora, embedding)
   - Returns: ModelsListResponse with total count and ModelInfo list
   - Queries ModelRegistry singleton without loading models into VRAM

### Key Design Decisions

1. **Workbench Dependency**: Both /generate and /enhance instantiate Workbench per-request
   - Allows different pipeline configs per request
   - No shared state issues
   - Easy to add persistence layer later

2. **ModelRegistry Singleton**: Single `_model_registry` instance at module level
   - Same pattern as `_executor` for consistency
   - Stateless registry (no VRAM usage)
   - Can be reset/reloaded without affecting running requests

3. **Request/Response Models**:
   - `GenerateRequest` and `EnhanceRequest` use `PipelineConfig` + `input_data` dict
   - `PipelineExecutionResponse` mirrors Workbench's result dict structure
   - Models defined in `src/models.py` for type safety and validation

4. **Error Handling**:
   - API catches exceptions at endpoint level
   - Returns 400 for invalid model types
   - All errors returned in response (not HTTP exceptions) for consistency

### Data Flow

```
HTTP Request
  ↓
GenerateRequest/EnhanceRequest validation
  ↓
Workbench(config) instantiation
  ↓
workbench.execute(input_data, job_id=uuid4())
  ↓
PipelineContext setup + stage execution
  ↓
Artifacts collection + metadata aggregation
  ↓
PipelineExecutionResponse (JSON)
```

### Testing Results

- 79 tests passing (existing workbench, pipeline, registry tests)
- 1 pre-existing test failure (JobExecutor.states unrelated to new endpoints)
- All imports validate successfully
- Linting: All checks passed
- Endpoint registration: 3 new routes + 6 existing = 9 total routes

### API Contract Examples

**POST /api/media-lab/generate**:
```json
{
  "pipeline_config": {
    "stages": [
      {"stage_type": "text_to_image", "parameters": {}},
      {"stage_type": "upscaler", "parameters": {"upscale_factor": 2}}
    ],
    "parameters": {}
  },
  "input_data": {"prompt": "A beautiful sunset"}
}
```

Response:
```json
{
  "job_id": "uuid-string",
  "success": true,
  "data": {"prompt": "...", "image": {...}, ...},
  "artifacts": ["path/to/generated.png", "path/to/upscaled.png"],
  "metadata": {"text_to_image": {...}, "upscaler": {...}},
  "error": null
}
```

**GET /api/media-lab/models?model_type=checkpoint**:
Response:
```json
{
  "total": 3,
  "models": [
    {
      "name": "model1",
      "model_type": "checkpoint",
      "file_path": "/path/to/model1.safetensors",
      "file_size_bytes": 1024000000,
      "discovered_at": "2026-02-07T...",
      "description": "...",
      "tags": ["general", "anime"],
      "metadata": {}
    },
    ...
  ]
}
```

### Next Steps (T5+)

- Add persistence layer (store results in DB instead of _jobs_store dict)
- Implement background job queue for long-running pipelines
- Add progress tracking to context during execution
- Connect WebSocket for real-time progress updates
- Add model scanning/discovery endpoint
- Implement artifact streaming/download endpoints

## T6: DetailerStage Implementation (COMPLETED)

### Architecture Implemented

1. **DetailerStage**: Fine detail enhancement with mask support
   - Input: `image` dict, optional `image_path`, optional `mask`, optional `roi`
   - Output: enhanced `image` dict, `detail_path` artifact, metadata
   - Two modes: **inpainting** (with mask) and **img2img** (without mask)

2. **Key Features**:
   - **Mask Support**: Inpainting mode when mask provided, img2img otherwise
   - **ROI Detection**: Auto center-crop heuristic with configurable ratio (0.0-1.0)
   - **ROI Cropping**: Extract region of interest, process, composite back
   - **Mask Blending**: Optional smooth blend when compositing ROI
   - **Mock Diffusers**: Gaussian blur for inpainting, unsharp mask for img2img
   - **Flexible Input**: Load from file path OR use mock image from dimensions

3. **DetailerStage Class**:
   ```python
   DetailerStage(
       model_name="stable-diffusion-inpaint-v1",
       strength=0.75,          # img2img denoising strength
       guidance_scale=7.5,     # classifier-free guidance
       center_crop_ratio=0.8   # ROI auto-detection ratio
   )
   ```

4. **Methods**:
   - `detect_roi()`: Center-crop heuristic for ROI detection
   - `crop_roi()`: Extract ROI from image
   - `composite_roi()`: Blend processed ROI back into image
   - `load_image_file()`: Load PNG/JPEG from disk
   - `execute_inpainting()`: Mock inpainting with Gaussian blur
   - `execute_img2img()`: Mock img2img with unsharp mask
   - `validate_input()`: Check image exists in context
   - `execute()`: Main pipeline execution

5. **Data Flow**:
   - Load image from path or create mock from dimensions
   - Auto-detect ROI if not provided
   - Crop ROI from image
   - Apply inpainting (with mask) or img2img (without mask)
   - Composite enhanced ROI back into full image
   - Save result to disk and track artifact
   - Update context with enhanced image data

### Testing Coverage (27 tests, all passing)

**Initialization (2 tests)**:
- Default parameters
- Custom parameters

**ROI Detection (5 tests)**:
- Center-crop with default ratio (0.8)
- Center-crop with custom ratio
- ROI cropping from image
- Compositing without mask (direct replacement)
- Compositing with mask (smooth blend)

**Image Loading (3 tests)**:
- Successful file load
- Missing file error
- Invalid image format error

**Input Validation (3 tests)**:
- Validation passes with image
- Validation fails without image
- Execution raises error without image

**Inpainting Mode (2 tests)**:
- Inpainting from image file path with numpy mask
- Inpainting with dict-format mask

**Img2Img Mode (2 tests)**:
- Img2img from image file path
- Img2img with mock image data

**ROI Processing (2 tests)**:
- Processing with custom ROI
- Auto-detection of ROI when not provided

**Metadata Tracking (2 tests)**:
- Metadata in inpainting mode
- Metadata in img2img mode

**Artifact Tracking (2 tests)**:
- Artifact added to context list
- Artifact file created on disk

**Error Handling (2 tests)**:
- Error on missing image
- Error on invalid image file

**Context Updates (2 tests)**:
- Image data updated with detail info
- Detail path set in context

### Key Design Decisions

1. **Flexible Input**: Support both file paths and mock image data (for testing)
2. **Mask Flexibility**: Accept numpy array, dict with data, or None
3. **Mock Processing**: Use scipy for realistic but lightweight processing
4. **ROI Auto-Detection**: Simple center-crop heuristic (production: face detection)
5. **Compositing**: Support both direct replacement and mask-blended compositing
6. **Metadata**: Track mode, model, strength, ROI, output shape

### Important Implementation Details

1. **Mask Conversion**: Dict masks converted to arrays before processing
2. **Mask Normalization**: Auto-detect if 0-1 or 0-255 range
3. **ROI Resizing**: Ensure mask matches ROI dimensions before blending
4. **Path Handling**: Use parent.mkdir(parents=True, exist_ok=True) for artifact dirs
5. **Exception Handling**: Use raise...from to preserve exception chains
6. **Type Hints**: Python 3.10+ syntax (tuple instead of Tuple, X | Y instead of Union)

### API Contract

```python
stage = DetailerStage(
    model_name="stable-diffusion-inpaint-v1",
    strength=0.75,
    guidance_scale=7.5,
    center_crop_ratio=0.8
)

context = PipelineContext()
context.set("image", {"model": "...", "dimensions": (512, 512)})
context.set("image_path", "path/to/image.png")
context.set("mask", np.array(...) or {"data": np.array(...)})
context.set("roi", (x, y, w, h))  # Optional, auto-detected if not provided
context.set("job_id", "unique_id")

result_context = await stage.execute(context)

# Result:
# - result_context.data["image"]: Enhanced image dict
# - result_context.data["detail_path"]: Path to saved artifact
# - result_context.metadata["detailer"]: Processing metadata
# - result_context.artifacts: List containing detail_path
```

### Next Steps (T7+)

- Integrate with Pipeline orchestrator for multi-stage workflows
- Connect to JobExecutor for persistence and async job handling
- Implement real diffusers pipeline calls (replace mock processing)
- Add WebSocket support for real-time progress updates
- Implement artifact cleanup and storage management

## T7: Frontend Detailer Controls (COMPLETED)

### UI Implementation
- Added `faceStrength` and `handStrength` sliders to `EnhanceView` in `frontend/app/media-lab/page.tsx`.
- Used `@heroui/react` `Slider` component.
- **Learnings**:
  - `Slider` component in the installed version of `@heroui/react` does NOT support `label`, `size`, or `color` props directly.
  - Labels must be rendered externally (e.g., using a `<label>` tag above the slider).
  - Styling should be done via `className` or `classNames` prop.
  - `minValue` and `maxValue` props are supported (likely from React Aria under the hood).

### API Integration
- Updated `handleSubmit` to include `face_strength` and `hand_strength` in the `parameters` object sent to `api.mediaLab.submitJob`.
- Default values set to 0.4.

## T8: RefinerStage Implementation (COMPLETED)

### Architecture Implemented

1. **RefinerStage**: High-resolution refinement using img2img enhancement
   - Input: `image` dict from previous stage, optional `image_path`
   - Output: refined `image` dict, `refined_path` artifact
   - Denoising strength parameter (0.0-1.0) for controlling refinement intensity
   - Mock implementation using unsharp masking via scipy

2. **Key Features**:
   - **Strength Validation**: Constructor validates strength ∈ [0.0, 1.0]
   - **Context Strength Override**: Per-call override via context.set("strength", value)
   - **Image Loading**: Load from file path OR create mock from dimensions
   - **Mock Processing**: Unsharp mask (Gaussian blur subtracted from original)
   - **Artifact Tracking**: Saves to disk and tracks in context.artifacts

3. **RefinerStage Class**:
   ```python
   RefinerStage(
       model_name="stable-diffusion-v1",  # default model
       strength=0.3                        # default denoising strength
   )
   ```

4. **Methods**:
   - `load_image_file(path)`: Load PNG/JPEG from disk
   - `execute_img2img(context, image_array)`: Mock img2img with unsharp mask
   - `validate_input(context)`: Check image exists
   - `execute(context)`: Main pipeline execution

5. **Data Flow**:
   - Load image from path or create mock from dimensions
   - Apply img2img with configurable strength
   - Save result to disk and track artifact
   - Update context with refined image data and metadata

### Testing Coverage (28 tests, all passing)

**Initialization (5 tests)**:
- Default parameters (model_name, strength=0.3)
- Custom parameters
- Strength validation (< 0.0 rejected, > 1.0 rejected, boundary 0.0/1.0 accepted)

**Image Loading (3 tests)**:
- Successful PNG/JPEG file loading
- Missing file error handling
- Invalid image format error handling

**Input Validation (3 tests)**:
- Validation passes with image present
- Validation fails without image
- Execute raises ValueError without image

**Img2Img Refinement (4 tests)**:
- Execution with image file path
- Execution with mock image data
- Context strength override (overrides default)
- Context strength validation (rejects invalid values)

**Paths (3 tests)**:
- Refined path derived from image_path (adds "_refined.png" suffix)
- Refined path generated from job_id when no image_path
- Artifact created on disk with correct extension

**Metadata (2 tests)**:
- Metadata recorded with model, strength, output_shape, high_res_fix flag
- Output shape correctly recorded from array dimensions

**Artifacts (2 tests)**:
- Refined path added to artifacts list
- Multiple executions track separate artifacts

**Error Handling (2 tests)**:
- Error set in context when image missing
- Error raised for invalid image files

**Context Updates (2 tests)**:
- Image data updated with refinement_level, high_res_fix, dimensions
- refined_path set in context.data

**Integration (2 tests)**:
- Full refinement workflow with file I/O
- Sequential refinement chaining with different strengths

### Key Design Decisions

1. **Strict Typing**: Constructor validates strength parameter immediately
2. **Flexible Input**: Support both file paths and mock image data
3. **Context Override**: Allow per-call strength adjustment via context
4. **Mock Processing**: Lightweight unsharp mask for realistic-looking refinement
5. **Metadata**: Track model, strength, output shape, and high_res_fix flag
6. **Error Handling**: Use raise...from for exception chain preservation

### Important Implementation Details

1. **Strength Bounds**: 0.0 = preserve image, 1.0 = maximum refinement
2. **Unsharp Mask Formula**: `result = original + strength * (original - blurred)`
3. **Path Handling**: Use parent.mkdir(parents=True, exist_ok=True) for artifact dirs
4. **Metadata Key**: Store under "refiner" key in context.metadata
5. **Type Hints**: Python 3.10+ syntax (tuple instead of Tuple, X | Y instead of Union)

### API Contract

```python
stage = RefinerStage(
    model_name="stable-diffusion-v1",
    strength=0.3
)

context = PipelineContext()
context.set("image", {"model": "...", "dimensions": (512, 512)})
context.set("image_path", "path/to/image.png")  # optional
context.set("strength", 0.5)                    # optional override
context.set("job_id", "unique_id")

result_context = await stage.execute(context)

# Result:
# - result_context.data["image"]: Refined image dict with high_res_fix=True
# - result_context.data["refined_path"]: Path to saved artifact
# - result_context.metadata["refiner"]: Processing metadata
# - result_context.artifacts: List containing refined_path
```

### Next Steps (T9+)

- Integrate with Pipeline orchestrator for multi-stage workflows
- Connect to JobExecutor for persistence and async job handling
- Implement real diffusers pipeline calls (replace mock unsharp mask)
- Add progress tracking to context during execution
- Implement artifact cleanup and storage management
- Add WebSocket support for real-time progress updates

