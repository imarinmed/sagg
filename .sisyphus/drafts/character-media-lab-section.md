# Draft: Character Media Lab Section

## Requirements (confirmed)
- Build a new platform section dedicated to generating new character images/content.
- Evaluate and use Hugging Face DAGGR approach: https://huggingface.co/blog/daggr.
- Use screenshots/frames of actors to generate new images with varied outfits, hairstyles, and contexts.
- Support advanced generation workflows including potential LoRA training.
- Support enhancement workflows for existing media (upscaling and quality enhancement).
- Support frame/video workflows (example: convert 60fps source to 120fps interpolation).
- Support character blending workflows using inspiration references to synthesize new character visuals.
- This is a major initiative and should be deeply researched before planning execution.
- V1 scope decision: full stack from day one (generation + blending + LoRA track + enhancement/interpolation).
- Access model decision: internal/admin-only at launch.

## Technical Decisions
- Recommended default: hybrid execution model (local GPU first + managed burst provider).
- Decision pending: where generated assets and model artifacts are stored.
- Decision pending: policy boundaries around likeness, consent, and restricted content.
- Recommended architecture: keep FastAPI as orchestration API only; execute heavy media jobs in separate worker/GPU layer.
- Scope locked: include full workflow surface in v1, but still phase implementation internally under one delivery plan.
- Test strategy selected: Tests-after (not strict TDD).
- QA requirement locked: mandatory agent-executed QA scenarios for every task.
- Access control default: restricted to internal/admin roles for v1.
- Policy direction from stakeholder: maximize flexibility; compliance checks handled outside this engineering scope.

## Research Findings
- Initial direction provided by user: Hugging Face DAGGR blog as primary technical anchor.
- Existing platform has screenshot/media analysis foundations but no generative pipeline yet.
- Backend already serves screenshots from `/static/screenshots` and loads video analysis metadata from `data/video_analysis/`.
- Frontend already has screenshot API proxies/components and can host a new section using App Router conventions.
- Existing frontend sections/routes suggest clean extension path via new `frontend/app/<new-section>/page.tsx` + API handlers in `frontend/app/api/`.
- Frontend integration points:
  - `frontend/components/Navigation.tsx` defines top-level nav items and must be extended for discoverability.
  - `frontend/lib/api.ts` is the typed API client and should add a dedicated media-lab namespace for jobs/artifacts.
- Backend integration points:
  - `backend/src/api/` router-module convention should be followed for a new media-lab API.
  - `backend/src/main.py` is where the new router would be registered.
- DAGGR findings:
  - Best fit as an internal pipeline workbench/prototyping layer (visual chain debugging, intermediate reruns), not sole production orchestrator.
  - Keep platform-native job orchestration, governance, metadata lineage, and storage as core system of record.
- Strategic architecture guidance (Oracle):
  - Phase 1 should prioritize upscaling/interpolation on a robust job system before likeness generation/LoRA training.
  - Introduce explicit job lifecycle (`QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `CANCELLED`), retries, cancellation, and audit trail from day one.
  - Separate permissions for run/publish/export and enforce approved model registry + provenance tracking.
- Test infrastructure status (current):
  - Backend: `pytest` configured in `backend/pyproject.toml`.
  - Frontend: no active test script in `frontend/package.json`; at least one test file exists (`frontend/components/__tests__/IntensityIndicator.test.tsx`).

## Open Questions
- UX scope: internal admin studio only, or user-facing product feature as well?
- Compute budget and hosting constraints (GPU availability/cost targets).
- Security and governance requirements for generated media.
- Legal/ethics policy constraints for actor likeness and inspiration-image blending.
- Acceptance criteria and quality thresholds for generated and enhanced outputs.
- Test strategy selection (TDD / tests-after / none) and QA scenario requirements.
- Preferred interpolation/upscaling baseline for MVP (speed-first defaults vs quality-first defaults).

## Test Strategy Decision
- **Infrastructure exists**: Backend YES (pytest), Frontend PARTIAL (test file exists but no test script).
- **Automated tests**: YES (Tests-after).
- **Agent-Executed QA**: ALWAYS (Playwright/tmux/curl per task).

## Scope Boundaries
- INCLUDE: generation, enhancement, interpolation, and character-composition workflows as product capabilities.
- EXCLUDE (tentative): unrelated platform redesign not required by the new section.

## Governance Note (user-directed)
- Product direction for this plan: engineering should prioritize capability and speed, with minimal in-product compliance gating.
- Compliance/legal review is expected to be handled by separate organizational processes outside this implementation plan.
