## 2026-02-07 Task: bootstrap
- Plan approved for true AI enhancer with DAGGR + z-image-turbo.
- User hard requirement: no PIL fallback for enhancement output.

## 2026-02-07 Task: first core implementation
- `execute_enhance` now hard-validates `workflow_stack` to `daggr` + `z-image-turbo` and returns explicit failure when unavailable.
- Active enhancement path no longer performs local Pillow processing; artifact success only occurs after DAGGR inference returns usable bytes/path payload.
- Enhancement metadata now consistently includes `workflow_stack`, `quality_prompt`, `orchestrator_evidence`, and `model_evidence` for AI provenance.
- Artifacts remain under `data/media_lab/artifacts/<job_id>/enhanced.<ext>` with unchanged relative path semantics (`artifacts/...`).

## 2026-02-07 Task: frontend preflight check
- Added `MediaCapabilitiesResponse` interface to `frontend/lib/api.ts`.
- Added `getCapabilities` method to `frontend/lib/api.ts`.
- Updated `frontend/app/media-lab/page.tsx` to fetch capabilities on mount.
- Added check in `handleSubmit` to block submission if enhancement is not supported.
- Added UI warning and disabled state for submit button when enhancement is unavailable.
- Verified with `bun run typecheck`.
