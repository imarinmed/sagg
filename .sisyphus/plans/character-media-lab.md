# Character Media Lab - Full-Stack V1 Plan

## TL;DR

> **Quick Summary**: Build an internal, admin-only "Character Media Lab" inside the existing Blod Wiki platform with four workflow families in one release: generation from references, enhancement/upscaling, frame interpolation, and character blending, using a job-based backend orchestration model plus GPU worker execution.
>
> **Deliverables**:
> - New top-level frontend section and route-level workspace for Media Lab
> - New backend media-lab API (jobs, assets, presets, status, cancellation)
> - Worker pipeline for upscaling/interpolation/generation/blending with DAGGR-assisted pipeline definitions
> - Artifact storage + metadata/audit persistence + admin access controls
> - End-to-end agent-executed QA coverage for all workflows
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 -> Task 3 -> Task 6 -> Task 9 -> Task 11

---

## Context

### Original Request
Create a major new section to engineer new character pictures/content, including DAGGR-based workflow integration, screenshot-based generation (and possible LoRA), enhancement/upscaling, 60fps->120fps interpolation, and inspiration blending to synthesize new character visuals.

### Interview Summary
**Key Discussions**:
- Scope is **full-stack from day one** (all workflow families included in v1 plan).
- Launch visibility is **internal/admin only**.
- Compute strategy is **hybrid** (local GPU primary + managed burst capacity).
- Test strategy is **tests-after**, with mandatory agent-executed QA for every task.
- Compliance gating in-product should stay minimal for this plan; compliance/legal review handled in other departments.

**Research Findings**:
- Platform already has screenshot/video-analysis foundations and screenshot UI components.
- Frontend extension points identified in navigation, app router pages, and typed API client.
- Backend extension points identified in router conventions and app router registration.
- DAGGR is suitable as a visual pipeline workbench/prototyping layer; not as sole production orchestrator.

### Metis Review
**Identified Gaps** (addressed):
- Metis returned no additional blocking gaps in session output.
- Plan includes explicit anti-scope-creep guardrails, job lifecycle criteria, and detailed QA scenarios to reduce ambiguity.

---

## Work Objectives

### Core Objective
Introduce an internal Character Media Lab that safely orchestrates heavy media workflows through a durable job system and exposes production-ready outputs inside the platform.

### Concrete Deliverables
- `frontend/app/media-lab/page.tsx` (main workspace)
- `frontend/app/media-lab/jobs/[id]/page.tsx` (job detail/progress)
- `frontend/components/Navigation.tsx` update with Media Lab entry
- `frontend/lib/api.ts` mediaLab API namespace and typed contracts
- `backend/src/api/media_lab.py` (new router)
- `backend/src/models.py` additions for media-job request/response models
- `backend/src/main.py` router registration and static/artifact exposure strategy
- Worker package (new backend-adjacent module) for GPU pipeline execution
- DB migration(s) for jobs/artifacts/audit tables
- Pipeline adapters for upscaling/interpolation/generation/blending presets

### Definition of Done
- [ ] Admin can submit each workflow type and see live status/progress in UI.
- [ ] Jobs persist state transitions and artifact metadata in DB.
- [ ] Completed artifacts are retrievable and visible in Media Lab gallery/details.
- [ ] Cancellation, retry-safe failure handling, and error surfacing work end-to-end.
- [ ] Agent-executed QA scenarios pass for happy path and negative cases for each workflow family.

### Must Have
- Internal/admin-only section gate
- Async job orchestration (no long GPU execution in request thread)
- End-to-end traceability: who ran what, with which inputs/presets/models
- Full workflow family coverage in one v1 plan (generation, enhancement, interpolation, blending)

### Must NOT Have (Guardrails)
- No GPU-heavy inference directly in FastAPI request handlers
- No public exposure of Media Lab routes in v1
- No ad-hoc file sprawl (all artifacts must be indexed in metadata)
- No uncontrolled free-form presets without versioned definitions
- No unrelated redesign of existing sections (episodes/characters/mythos/graph)

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> Every acceptance criterion below is agent-executable via Playwright, Bash, and/or tmux-based terminal interaction.

### Test Decision
- **Infrastructure exists**: Backend YES, Frontend PARTIAL
- **Automated tests**: Tests-after
- **Framework**: Backend `pytest`; frontend test tooling to be normalized as part of plan tasks

### Agent-Executed QA Scenarios
- UI verification: Playwright browser flows, selector-level assertions, screenshots under `.sisyphus/evidence/`
- API verification: `curl` command assertions for status/body fields
- Worker verification: command/log assertions for lifecycle transitions and artifact outputs
- Negative verification: invalid inputs, queue failure paths, cancellation path

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Foundation)
- Task 1: Architecture skeleton + contracts
- Task 2: Data model/migrations for jobs/artifacts
- Task 4: Frontend IA shell and route scaffolding

Wave 2 (Core plumbing)
- Task 3: Backend media-lab router + job API
- Task 5: Worker runtime + queue integration
- Task 7: API client + typed frontend integration

Wave 3 (Workflow capability)
- Task 6: Enhancement/upscaling workflow
- Task 8: Frame interpolation workflow
- Task 9: Generation + blending workflow

Wave 4 (Control plane + hardening)
- Task 10: Admin access gating + policy surfaces
- Task 11: DAGGR workbench integration path
- Task 12: End-to-end QA matrix and release guardrails

Critical Path: 1 -> 3 -> 6 -> 9 -> 11

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3, 5, 7 | 2, 4 |
| 2 | None | 3, 5, 10 | 1, 4 |
| 3 | 1, 2 | 6, 8, 9 | 5, 7 |
| 4 | 1 | 7, 12 | 2 |
| 5 | 1, 2 | 6, 8, 9 | 3, 7 |
| 6 | 3, 5 | 12 | 8 |
| 7 | 3, 4 | 12 | 5 |
| 8 | 3, 5 | 12 | 6 |
| 9 | 3, 5 | 11, 12 | None |
| 10 | 2, 3 | 12 | 11 |
| 11 | 9 | 12 | 10 |
| 12 | 4, 6, 7, 8, 9, 10, 11 | None | None |

---

## TODOs

> **Per-task QA rule (mandatory):** For each task below, executor must attach at least one happy-path and one negative-path Agent-Executed QA Scenario to task completion evidence under `.sisyphus/evidence/`, even when acceptance criteria are command-based.

- [x] 1. Define Media Lab contracts and architecture skeleton
  - **What to do**: finalize request/response contracts, job state enum, artifact model boundaries, workflow preset schema.
  - **Must NOT do**: implement model-specific prompt engineering details here.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high` (cross-cutting architecture)
    - Skills: `vercel-react-best-practices`, `frontend-ui-ux`
  - **Parallelization**: YES, Wave 1, Blocks 3/5/7, Blocked By None
  - **References**:
    - `backend/src/models.py` - API model conventions and validation style
    - `backend/src/api/episodes.py` - router and response model pattern
    - `frontend/lib/api.ts` - typed API client pattern and fetch fallback behavior
    - `frontend/components/Navigation.tsx` - top-level route exposure conventions
  - **Acceptance Criteria**:
    - [x] Contract doc in plan-linked markdown includes all workflow request schemas and state transitions.
    - [x] Job lifecycle explicitly defines `QUEUED|RUNNING|SUCCEEDED|FAILED|CANCELLED` and transition rules.

- [x] 2. Add DB schema for media jobs, artifacts, and audit events
  - **What to do**: create migration(s) for job records, artifact metadata, workflow type, status/progress/error fields, submitter identity, timestamps.
  - **Must NOT do**: store raw image binary in relational tables.
  - **Recommended Agent Profile**:
    - Category: `quick`
    - Skills: `git-master`
  - **Parallelization**: YES, Wave 1, Blocks 3/5/10, Blocked By None
  - **References**:
    - `backend/alembic/` - migration structure
    - `backend/alembic.ini` - migration config conventions
    - `data/blod.db` usage context from `AGENTS.md`
  - **Acceptance Criteria**:
    - [x] Migration applies cleanly with `alembic upgrade head`.
    - [x] New tables include indexes for status and created_at.
    - [x] Rollback one step via `alembic downgrade -1` succeeds in dev.

- [x] 3. Implement backend Media Lab router and job orchestration endpoints
  - **What to do**: add routes for submit/list/get/cancel/retry job and artifact listing; wire router in app.
  - **Must NOT do**: run long inference in route handlers.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `git-master`
  - **Parallelization**: YES, Wave 2, Blocks 6/8/9, Blocked By 1/2
  - **References**:
    - `backend/src/main.py` - include_router and CORS/static patterns
    - `backend/src/api/episodes.py` - route style, error handling, response typing
    - `backend/src/models.py` - pydantic model definitions
  - **Acceptance Criteria**:
    - [x] `POST /api/media-lab/jobs` returns job id and initial status.
    - [x] `GET /api/media-lab/jobs/{id}` returns progress and artifact refs.
    - [x] `POST /api/media-lab/jobs/{id}/cancel` sets cancellable states correctly.
    - [x] Invalid workflow payload returns 422 with validation details.

- [x] 4. Build frontend Media Lab shell, navigation, and route scaffolding
  - **What to do**: add new app route(s), entry in global navigation, core page layout and module tabs (Generate, Enhance, Interpolate, Blend, Jobs).
  - **Must NOT do**: ship hidden unreachable routes.
  - **Recommended Agent Profile**:
    - Category: `visual-engineering`
    - Skills: `frontend-ui-ux`, `heroui`
  - **Parallelization**: YES, Wave 1, Blocks 7/12, Blocked By 1
  - **References**:
    - `frontend/components/Navigation.tsx` - nav item architecture
    - `frontend/app/layout.tsx` - global wrapper/theme behavior
    - `frontend/app/episodes/page.tsx` - section-page pattern
    - `frontend/app/globals.css` - styling tokens and shared classes
  - **Acceptance Criteria**:
    - [x] Media Lab appears in desktop nav and routes to `/media-lab`.
    - [x] Page has module navigation for all four workflow families plus Jobs.
    - [x] Mobile and desktop layout remain usable without overflow.

- [x] 5. Build worker runtime and queue processing for media jobs
  - **What to do**: implement worker process consuming queued jobs, step execution hooks, progress update callbacks, retry/cancel semantics.
  - **Must NOT do**: hide failures without error code persistence.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `git-master`
  - **Parallelization**: YES, Wave 2, Blocks 6/8/9, Blocked By 1/2
  - **References**:
    - `backend/src/main.py` - process/runtime context
    - `backend/src/api/` patterns - expected API-consumer behavior
    - DAGGR article concepts (node/step execution and reruns)
  - **Acceptance Criteria**:
    - [x] Worker picks queued job and transitions states correctly.
    - [x] Failed transient step retries according to policy.
    - [x] Cancel request interrupts long-running execution at safe checkpoint.

- [ ] 6. Deliver enhancement/upscaling workflow pipeline
  - **What to do**: implement end-to-end path from image input to enhanced output artifact with selectable quality preset.
  - **Must NOT do**: overwrite source files.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `frontend-ui-ux`
  - **Parallelization**: YES, Wave 3, Blocks 12, Blocked By 3/5
  - **References**:
    - `frontend/components/ScreenshotGallery.tsx` - source image handling context
    - `frontend/app/api/screenshots/[...path]/route.ts` - asset route pattern
    - Oracle recommendation: practical speed-first baseline with optional high-quality mode
  - **Acceptance Criteria**:
    - [ ] Upscale job produces output artifact path and metadata.
    - [ ] UI displays before/after compare for completed job.
    - [ ] Unsupported file format returns explicit error message.

- [x] 7. Add frontend typed Media Lab API client and job views
  - **What to do**: extend `frontend/lib/api.ts` with `mediaLab` namespace; integrate submission/status polling/cancel/retry UI.
  - **Must NOT do**: duplicate fetch logic outside shared client.
  - **Recommended Agent Profile**:
    - Category: `quick`
    - Skills: `vercel-react-best-practices`
  - **Parallelization**: YES, Wave 2, Blocks 12, Blocked By 3/4
  - **References**:
    - `frontend/lib/api.ts` - client conventions
    - `frontend/app/episodes/[id]/page.tsx` - data loading and rendering style
  - **Acceptance Criteria**:
    - [x] Jobs list reflects live status transitions without page refresh.
    - [x] Cancel/retry actions call backend and update UI state.
    - [x] API errors are shown with actionable message text.

- [x] 8. Deliver frame interpolation workflow (60fps->120fps)
  - **What to do**: add interpolation job type, pipeline preset(s), output artifact packaging.
  - **Must NOT do**: block entire queue with one long video task.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `git-master`
  - **Parallelization**: YES, Wave 3, Blocks 12, Blocked By 3/5
  - **References**:
    - `data/video_analysis/` - existing frame/screenshot context
    - `backend/src/api/episodes.py` - episode/video-linked data shape context
    - interpolation model selection note from research (speed-first baseline)
  - **Acceptance Criteria**:
    - [x] Interpolation job accepts source video reference and target fps.
    - [x] Completed job stores new artifact with fps metadata.
    - [x] Invalid fps combinations return validation error.

- [ ] 9. Deliver generation + blending workflows with reference sets
  - **What to do**: implement generation workflow from references and blending workflow from inspiration sets; include parameter presets and artifact lineage.
  - **Must NOT do**: accept unbounded parameter inputs without defaults.
  - **Recommended Agent Profile**:
    - Category: `artistry`
    - Skills: `frontend-ui-ux`, `heroui`
  - **Parallelization**: NO (critical quality-sensitive integration), Blocked By 3/5
  - **References**:
    - `data/creative/inspiration_graph.json` - inspiration source context
    - `frontend/components/CreativeCompanionPanel.tsx` - existing inspiration interaction patterns
    - DAGGR integration guidance - use as internal chain-design layer, not system-of-record
  - **Acceptance Criteria**:
    - [ ] Generation job stores input refs/preset id and output lineage.
    - [ ] Blending job records source inspirations and blend parameters.
    - [ ] Missing required reference assets fail with deterministic error.

- [ ] 10. Enforce internal admin access, quotas, and audit visibility
  - **What to do**: add backend guard checks and frontend visibility gating; enforce per-role access and basic usage limits.
  - **Must NOT do**: expose route/actions to non-admin users.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `git-master`
  - **Parallelization**: YES, Wave 4, Blocks 12, Blocked By 2/3
  - **References**:
    - `backend/src/main.py` - middleware/router integration context
    - existing auth/session strategy in project (to be discovered and reused by executor)
  - **Acceptance Criteria**:
    - [ ] Non-admin request to Media Lab APIs returns forbidden/unauthorized.
    - [ ] Admin can access all Media Lab routes and actions.
    - [ ] Audit fields include actor id and timestamp for submit/cancel/retry.

- [ ] 11. Integrate DAGGR workbench mode for pipeline experimentation
  - **What to do**: expose an internal workbench integration path for DAGGR chain experimentation linked to workflow presets.
  - **Must NOT do**: make DAGGR runtime a hard dependency for all production job execution.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `find-skills`
  - **Parallelization**: YES, Wave 4, Blocks 12, Blocked By 9
  - **References**:
    - `https://huggingface.co/blog/daggr` - DAGGR feature/limitations
    - backend worker architecture from tasks 3/5
  - **Acceptance Criteria**:
    - [ ] Workbench mode can run at least one generation chain and capture intermediates.
    - [ ] Preset export from workbench can be consumed by production job submit API.
    - [ ] Workbench failure does not break production job API path.

- [ ] 12. Run full QA matrix and release hardening for internal launch
  - **What to do**: execute integrated test/QA matrix for all modules, failure paths, and performance smoke checks; define launch checklist.
  - **Must NOT do**: sign off without negative-path evidence.
  - **Recommended Agent Profile**:
    - Category: `unspecified-high`
    - Skills: `playwright`, `git-master`
  - **Parallelization**: FINAL, Blocked By 4/6/7/8/9/10/11
  - **References**:
    - `frontend/app/media-lab/*` and `backend/src/api/media_lab.py` deliverables
    - project run commands in `AGENTS.md`
  - **Acceptance Criteria**:
    - [ ] End-to-end happy-path scenarios pass for each workflow family.
    - [ ] End-to-end failure scenarios pass for invalid input, queue failure, cancellation.
    - [ ] Evidence files captured under `.sisyphus/evidence/` for each scenario.

---

## Agent-Executed QA Scenarios (Cross-Workflow Minimum Set)

```text
Scenario: Submit and complete image enhancement job
  Tool: Playwright + Bash(curl)
  Preconditions: Backend and frontend dev servers running; admin session active
  Steps:
    1. Navigate to http://localhost:6699/media-lab
    2. Click tab button[data-tab="enhance"]
    3. Upload file input[name="sourceImage"] with test asset
    4. Select preset select[name="qualityPreset"] value "balanced"
    5. Click button[data-action="submit-job"]
    6. Assert toast text contains "Job queued"
    7. Poll GET /api/media-lab/jobs/{jobId} until status == "SUCCEEDED"
    8. Assert result preview img[data-role="output-preview"] exists
    9. Screenshot .sisyphus/evidence/task-enhance-success.png
  Expected Result: Completed job with accessible output artifact and visible preview
  Evidence: .sisyphus/evidence/task-enhance-success.png

Scenario: Interpolation rejects invalid fps request
  Tool: Bash(curl)
  Preconditions: API running
  Steps:
    1. POST /api/media-lab/jobs with workflowType="interpolate" and targetFps=95
    2. Assert HTTP status is 422
    3. Assert response contains validation detail for target fps
  Expected Result: Validation error with explicit message
  Evidence: response body captured in .sisyphus/evidence/task-interpolate-invalid.json

Scenario: Generation+blend job cancellation path
  Tool: Playwright + Bash(curl)
  Preconditions: Long-running generation/blend preset available
  Steps:
    1. Create generation/blend job from Media Lab UI with reference set
    2. Wait for status badge text "RUNNING"
    3. Click button[data-action="cancel-job"]
    4. Assert status becomes "CANCELLED"
    5. Assert no final publishable artifact is marked active
    6. Screenshot .sisyphus/evidence/task-generate-cancelled.png
  Expected Result: Job cancels safely and UI/API states remain consistent
  Evidence: .sisyphus/evidence/task-generate-cancelled.png

Scenario: Non-admin is denied media-lab endpoints
  Tool: Bash(curl)
  Preconditions: Non-admin auth token available
  Steps:
    1. GET /api/media-lab/jobs with non-admin token
    2. Assert status is 403 or 401 per auth policy
    3. Assert response error includes authorization reason
  Expected Result: Access blocked for non-admin users
  Evidence: .sisyphus/evidence/task-authz-denied.json
```

---

## Commit Strategy

| After Task Group | Message | Verification |
|------------------|---------|--------------|
| 1-3 | `feat(media-lab): add backend job contracts and orchestration api` | backend pytest + API smoke curl |
| 4-7 | `feat(media-lab-ui): add workspace routes and typed client integration` | frontend lint/typecheck + Playwright nav/job smoke |
| 8-9 | `feat(media-pipelines): add interpolation generation and blending workflows` | workflow API + worker execution checks |
| 10-12 | `chore(media-lab): enforce access controls and finalize qa matrix` | full e2e matrix and evidence capture |

---

## Success Criteria

### Verification Commands
```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && bun run lint && bun run typecheck

# API smoke (examples)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/media-lab/jobs
```

### Final Checklist
- [ ] All four workflow families are submit-able and observable in UI
- [ ] Job lifecycle persistence and cancellation behavior are reliable
- [ ] Artifact metadata and lineage are queryable by job id
- [ ] Admin-only access is enforced
- [ ] QA evidence exists for happy and negative paths
- [ ] No unrelated regressions in existing wiki sections
