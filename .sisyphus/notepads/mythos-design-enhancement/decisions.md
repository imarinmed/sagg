## 2026-02-06 18:43:49 CET - Task 1 IA Decisions
- Confirmed IA direction remains encyclopedia-first for `/mythos`: discovery controls and taxonomy are promoted to primary above-fold structure, not hidden as optional tab internals.
- Confirmed `/mythos/[id]` remains wiki+narrative hybrid: reference modules are ordered before narrative modules to preserve factual grounding while still delivering lore immersion.
- Locked static-KB-only source strategy: all IA plans assume `frontend/lib/kb.ts` and `/kb/meta/mythos.json` as sole content source; no backend coupling introduced.
- Chosen discoverability contract for downstream tasks: explicit visible state progression from query -> filter -> result count -> detail selection, with onward navigation paths always present.
- Chosen mobile contract: compact persistent search/filter context and deterministic module order to prevent hidden content and section hunting.

## 2026-02-06 18:45:00 CET - Task 2 Visual Token Definition
- **Created**: `visual-token-package.md` defining the "Premium Parity" standard.
- **Key Decision**: Enforced "Anti-Purple" rule. Purple is restricted to semantic "Training/Magic" contexts only. General UI chrome must use Nordic Gold (`#D4AF37`) or Blood Crimson (`#8B0000`) to match the "Gothic/Nordic" aesthetic of the landing page.
- **Typography Strategy**: Shifted Mythos from "Dashboard" (Inter-heavy) to "Editorial" (Cormorant-heavy) to match the cinematic feel of the landing page.
- **Elevation**: Mandated usage of `.glass-premium` and `.hover-lift` for interactive cards to match the 3D feel of the landing page posters.
