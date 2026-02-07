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

- [ ] T1. Implement `LoRAManager` backend

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

- [ ] T2. Add LoRA selection UI

  **What to do**:
  - Update `frontend/app/media-lab/page.tsx` (Sidebar).
  - Add LoRA selector (dropdown + weight slider).
  - Support multiple LoRAs (list of {id, weight}).

  **Acceptance Criteria**:
  - [ ] UI allows selecting LoRAs.
  - [ ] Can adjust weight.

- [ ] T3. Support per-stage LoRAs (Detailer specific)

  **What to do**:
  - Update `DetailerStage` to accept `loras` config.
  - Update `RefinerStage` to accept `loras` config.
  - Ensure LoRAs are swapped during execution.

  **Acceptance Criteria**:
  - [ ] Pipeline supports stage-specific LoRAs.
  - [ ] LoRAs are applied/unapplied correctly.

- [ ] T4. LoRA caching and hash verification

  **What to do**:
  - Update `LoRAManager` to cache loaded tensors in RAM/VRAM.
  - Calculate SHA256 of LoRA files on load.

  **Acceptance Criteria**:
  - [ ] LoRAs are cached.
  - [ ] Duplicate loads use cache.
