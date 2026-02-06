## 2026-02-06 Task: init-notepad
- V1 includes generation, blending, enhancement/upscaling, interpolation.
- Access model: internal/admin only.
- Compute model: hybrid local GPU + managed burst.
- Test strategy: tests-after with mandatory agent-executed QA evidence.

## 2026-02-06: Media Lab Architecture and Contracts
- **Lifecycle States**: Adopted exactly `QUEUED|RUNNING|SUCCEEDED|FAILED|CANCELLED` to simplify state management and worker logic.
- **Character Scoping**: All V1 operations are strictly scoped to a single `character_id`. This prevents cross-character data leakage and simplifies the initial implementation.
- **Provenance Separation**: Decided to separate `MediaArtifact` (the result) from `MediaProvenance` (the history). This allows for cleaner artifact management while retaining full auditability of how an artifact was created.
- **Strict Transitions**: Defined a formal transition table to be enforced by the orchestration layer. Terminal states are locked to prevent data corruption.
- **Schema Alignment**: Request/Response schemas are designed to be directly translatable to both Pydantic models and TypeScript interfaces.
