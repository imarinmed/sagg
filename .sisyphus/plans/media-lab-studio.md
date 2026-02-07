# Media Lab Studio Expansion Plan (v1.0.0)

## TL;DR

> **Quick Summary**: Transform the current prototype into a professional-grade "Media Lab Studio" with a 9-stage generative pipeline, advanced controlnet/masking tools, and deep platform integration.
> 
> **Deliverables**:
> - **Studio Workspace**: Multi-panel React UI (Generate, Enhance, Batch, Model Browser)
> - **Backend Pipeline**: 9-stage execution (Txt2Img -> Refiner -> Detailer x3 -> Upscaler)
> - **Asset Management**: Local + Remote (CivitAI/HF) model registry, tagging system
> 
> **Estimated Effort**: XL (11 Versions, ~35 Detailed Tasks)
> **Parallel Execution**: YES - Defined in Waves 1-7
> **Critical Path**: Core Pipeline (v0.2.0) → Detailer System (v0.3.0) → Studio UI (v0.5.0)

---

## v0.1.0: Current State (Baseline)

- [x] T1. Current State Verification

  **What to do**:
  - Verify existing `daggr` implementation
  - Ensure dev environment runs (`uv run uvicorn`, `bun dev`).
  - Create `backend/tests/media_lab` directory for new tests.

  **Acceptance Criteria**:
  - [ ] Server starts on port 8000
  - [ ] Frontend loads on port 6699
  - [ ] `backend/tests/media_lab` exists

---

## v0.2.0: Core Pipeline Translation

- [x] T1. Translate single-node DAGGR to 9-stage linear pipeline

  **What to do**:
  - Create `PipelineStage` abstract base class
  - Create concrete stage implementations (Txt2Img, Refiner, Detailer, Upscaler)
  - Define `PipelineConfig` Pydantic model in `backend/src/models.py`

  **Must NOT do**:
  - Do not use a complex graph library (keep it linear list of stages for v1).

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`python`, `backend`]

  **Acceptance Criteria**:
  - [ ] `PipelineStage` class exists.
  - [ ] Concrete stages implemented.
  - [ ] Pipeline runs sequentially.

- [x] T2. Implement `Workbench` class execution logic

  **What to do**:
  - Create `backend/src/media_lab/workbench.py`
  - It should initialize and run the `Pipeline` defined in `pipeline.py`

  **Acceptance Criteria**:
  - [ ] `Workbench` class exists.
  - [ ] `execute` method runs all stages.
  - [ ] VRAM is cleared.

- [x] T3. Create `ModelRegistry` and loading logic

  **What to do**:
  - Create `backend/src/media_lab/registry.py`
  - Implement `ModelRegistry` class with scanning logic

  **Acceptance Criteria**:
  - [ ] `ModelRegistry` exists.
  - [ ] Models loaded from disk.
  - [ ] LRU cache works.

- [x] T4. Update API to support new pipeline structure

  **What to do**:
  - Create/Update `backend/src/api/media_lab.py`
  - Implement `POST /generate`, `POST /enhance`, `GET /models`

- [x] T5. Basic "Generate" frontend wiring

  **What to do**:
  - Update `frontend/app/media-lab/page.tsx`
  - Connect "Generate" button to API
  - Display loading state and result

- [x] T6. Artifact persistence (save images to disk/db)

  **What to do**:
  - Implement `ArtifactManager` to save generated images
  - Ensure metadata (prompt, seed, params) is saved as JSON sidecar

---

## v0.3.0: 3-Stage Detailer System

- [x] T1. Implement `Detailer` pipeline (Face/Hand/Body)

  **What to do**:
  - Create `backend/src/media_lab/stages/detailer.py`
  - Implement `DetailerStage` (subclass of PipelineStage)
  - Implement simple ROI detection (Center crop)
  - Implement masking and inpainting logic

  **Must NOT do**:
  - Do not implement full Yolo/MediaPipe integration if libraries are missing (use center crop or simple heuristic).

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`python`, `backend`]

  **Acceptance Criteria**:
  - [ ] `DetailerStage` class exists.
  - [ ] Can take an image and return a masked/inpainted version.
  - [ ] pytest passes.

- [x] T2. Add "Enhance" tab to frontend

  **What to do**:
  - Update `frontend/app/media-lab/page.tsx` (EnhanceView)
  - Add controls for Detailer (Face/Hand strength)
  - Connect to `POST /enhance`.

  **Acceptance Criteria**:
  - [ ] Enhance tab functional.
  - [ ] Can submit enhance job.

- [x] T3. Integrate Refiner stage (High-res fix)

  **What to do**:
  - Create `backend/src/media_lab/stages/refiner.py`
  - Implement `RefinerStage` class
  - Logic: Img2Img with low denoising strength

  **Acceptance Criteria**:
  - [ ] `RefinerStage` class exists.
  - [ ] Integration into Workbench.

## v0.4.0: LoRA Loading System

- [x] T1. Implement `LoRAManager` backend

  **What to do**:
  - Create `backend/src/media_lab/lora.py`
  - Implement `LoRAManager` class
  - Logic: load safetensors, extract state dict, fuse/unfuse with model
  - Methods: `load_lora(path, weight)`, `unload_lora()`, `apply_loras(model, loras)`

  **Must NOT do**:
  - Do not implement complex merging strategies yet (just simple linear combination).

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`python`, `backend`]

  **Acceptance Criteria**:
  - [ ] `LoRAManager` class exists.
  - [ ] Can load a LoRA file.
  - [ ] Can modify model weights.
  - [ ] pytest passes.

- [x] T2. Add LoRA selection UI

  **What to do**:
  - Update `frontend/app/media-lab/page.tsx` (Sidebar)
  - Add LoRA selector (dropdown + weight slider)
  - Support multiple LoRAs (list of {id, weight}).

  **Acceptance Criteria**:
  - [ ] UI allows selecting LoRAs.
  - [ ] Can adjust weight.

- [x] T3. Support per-stage LoRAs (Detailer specific)

  **What to do**:
  - Update `DetailerStage` to accept `loras` config
  - Update `RefinerStage` to accept `loras` config
  - Ensure LoRAs are swapped during execution

  **Acceptance Criteria**:
  - [ ] Pipeline supports stage-specific LoRAs.
  - [ ] LoRAs are applied/unapplied correctly.

- [x] T4. LoRA caching and hash verification

  **What to do**:
  - Update `LoRAManager` to cache loaded tensors in RAM/VRAM
  - Calculate SHA256 of LoRA files on load
  - Key cache by file path + hash
  - Provide `clear_cache()` method

  **Must NOT do**:
  - Do not cache indefinitely; LRU with max size.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`python`, `backend`]

  **Acceptance Criteria**:
  - [ ] LoRAs are cached after first load.
  - [ ] Duplicate loads use cache (no file re-read).
  - [ ] SHA256 calculated for integrity.
  - [ ] `clear_cache()` method exists.
  - [ ] pytest passes.

  **Commit**: YES | `feat(media-lab): add LoRA caching and hash verification` | lora.py | pytest

---

## v0.5.0: Studio Workspace UI Overhaul

- [x] T1. Create `StudioLayout` (3-panel design)

  **What to do**:
  - Create `frontend/app/media-lab/StudioLayout.tsx`
  - Implement 3-panel layout: Left (Parameters), Center (Preview/Canvas), Right (History/Queue)
  - Use CSS Grid with responsive behavior

  **Acceptance Criteria**:
  - [ ] Layout component created.
  - [ ] Three distinct panel areas.
  - [ ] Responsive behavior.
  - [ ] typecheck passes.

- [x] T2. Implement `ParameterSidebar`

  **What to do**:
  - Create `frontend/components/media-lab/ParameterSidebar.tsx`
  - Contains all generation parameters: Prompt, Negative Prompt, Width, Height, Steps, CFG Scale, Sampler, Seed, LoRAs
  - Collapsible sections for Basic/Advanced settings

  **Acceptance Criteria**:
  - [ ] Sidebar component created.
  - [ ] All parameters wired.
  - [ ] typecheck passes.

- [x] T3. Build `LivePreview` canvas

  **What to do**:
  - Create `frontend/components/media-lab/LivePreview.tsx`
  - Shows current/previous generation with zoom/pan
  - Handles loading states (spinner/skeleton)
  - Comparison slider (before/after for Enhance)

  **Acceptance Criteria**:
  - [ ] Preview component created.
  - [ ] Zoom and pan functional.
  - [ ] Loading states handled.

- [x] T4. Create `DetailerControls` panel

  **What to do**:
  - Create `frontend/components/media-lab/DetailerControls.tsx`
  - Controls for Face/Hand/Body detailers (enable/disable, strength, specific LoRAs)
  - Only visible in Enhance mode

  **Acceptance Criteria**:
  - [ ] Controls component created.
  - [ ] Mode-aware visibility.

---

## v0.6.0: Advanced Pipeline Controls

- [x] T1. Implement Seed Management (Random/Fixed)

  **What to do**:
  - Add seed input to `ParameterSidebar` with dice button for random
  - "Use Last Seed" button functionality
  - Store seed in generation metadata

- [x] T2. Add Sampler/Scheduler selection

  **What to do**:
  - Dropdown for sampler (Euler, DPM++, etc.) in ParameterSidebar
  - Dropdown for scheduler (normal, karras, etc.)
  - Backend PipelineConfig accepts sampler and scheduler

- [x] T3. Implement Resolution/Aspect Ratio controls

  **What to do**:
  - Preset buttons (1:1, 16:9, 9:16, 4:3, 3:4)
  - Lock aspect ratio toggle
  - Backend validation (multiples of 8)

- [x] T4. Add "Re-run Stage" capability

  **What to do**:
  - Store intermediate results in Workbench
  - POST /api/media-lab/jobs/{id}/rerun endpoint
  - Frontend "Re-run from Stage N" button

---

## v0.7.0: img2img & Text-Guided Editing

- [x] T1. Implement img2img pipeline support

  **What to do**:
  - Create `Img2ImgStage` in `backend/src/media_lab/stages/img2img.py`
  - Accept source image path + denoising strength (0.0-1.0)
  - Use img2img pipeline from diffusers
  - Integrate into Pipeline class

- [x] T2. Add Image Upload/Dropzone UI

  **What to do**:
  - Create `ImageUploader` component in `frontend/components/media-lab/ImageUploader.tsx`
  - Drag-and-drop support with react-dropzone or native
  - File validation (PNG, JPG, max 10MB)
  - Preview uploaded image
  - Upload to backend and get URL/path

- [x] T3. Implement InstructPix2Pix (Text-guided edit)

  **What to do**:
  - Create `InstructPix2PixStage` in backend
  - Use instruction-based editing ("make it red", "add sunglasses")
  - UI for "Edit instruction" input
  - Integrate into Enhance workflow

---

## v0.8.0: Canvas, Mask & Detailer Override

- [x] T1. Build `MaskPainter` component (Canvas API)

  **What to do**:
  - Create `frontend/components/media-lab/MaskPainter.tsx`
  - HTML5 Canvas for painting masks
  - Brush size, opacity controls
  - Export mask as base64/PNG

- [x] T2. Add mask upload to detailer API

  **What to do**:
  - Update `DetailerStage` to accept optional mask
  - Use mask for inpainting instead of auto-detection

- [x] T3. Wire mask painter to Generate/Enhance flows

  **What to do**:
  - Add "Edit Mask" button to Preview panel
  - Pass mask to API when submitting job

---

## v0.9.0: Batch Generation & Presets

- [ ] T1. Extend Generate API to accept batch_size

  **What to do**:
  - Update PipelineConfig with batch_size
  - Execute N generations with different seeds
  - Return array of artifacts

- [ ] T2. Build batch comparison grid UI

  **What to do**:
  - Create BatchGrid component
  - Grid layout for multiple results
  - Selection mode for download/delete

- [ ] T3. Implement preset system

  **What to do**:
  - Create Preset model (name, parameters)
  - API: save/load/delete presets
  - UI: Preset selector + "Save as Preset" button

## v1.0.0: Platform Integration & Polish

- [ ] T1. Character/episode/mythos tagging

  **What to do**:
  - Add tags to ImageArtifact model
  - UI to tag generated images with project entities
  - Show related images on entity pages

- [ ] T2. Performance optimization audit

  **What to do**:
  - Profile frontend (React Profiler)
  - Optimize re-renders
  - Lazy load components

- [ ] T3. Final UI polish

  **What to do**:
  - Skeleton loaders
  - Error boundaries
  - Transitions/animations
  - Mobile responsiveness

- [ ] T4. Comprehensive E2E tests

  **What to do**:
  - Playwright tests covering full workflows
  - Generate -> Enhance -> Tag -> Download
  - CI integration

---

## Success Criteria

### Final Verification Commands (v1.0.0)
```bash
# Backend tests
cd backend && pytest backend/tests/media_lab/ -v  # Expected: 100% pass

# Frontend typecheck
cd frontend && bun run typecheck  # Expected: Zero errors

# API health check
curl http://localhost:8000/api/media-lab/capabilities  # Expected: 200 OK

# E2E Test
bun run e2e:media-lab  # Expected: All scenarios pass
```

### Final Checklist
- [ ] All 9 pipeline stages functional
- [ ] Model registry loads local and remote models
- [ ] Studio UI allows full control of generation parameters
- [ ] Batch generation produces grid results
- [ ] Presets save/load correctly
- [ ] Tags link images to Characters
- [ ] No VRAM leaks during extended use
