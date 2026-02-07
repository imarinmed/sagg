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

- [ ] T4. Update API to support new pipeline structure

  **What to do**:
  - Update `backend/src/api/media_lab.py`.
  - Add `POST /generate` endpoint accepting `PipelineConfig`.
  - Connect endpoint to `Workbench.execute`.

  **Acceptance Criteria**:
  - [ ] API accepts new config.
  - [ ] Jobs triggers Workbench.

- [ ] T5. Basic "Generate" frontend wiring

  **What to do**:
  - Update `GenerateView` in `frontend/app/media-lab/page.tsx`.
  - Connect "Generate" button to `POST /generate`.
  - Display progress/result.

  **Acceptance Criteria**:
  - [ ] Button triggers API.
  - [ ] Result image shown.

- [ ] T6. Artifact persistence (save images to disk/db)

  **What to do**:
  - Update `JobExecutor` to save outputs to `data/artifacts/{job_id}/`.
  - Metadata JSON sidecar.

  **Acceptance Criteria**:
  - [ ] Images saved to disk.
  - [ ] Metadata saved.

---
(Further versions omitted for brevity, will expand as needed)
