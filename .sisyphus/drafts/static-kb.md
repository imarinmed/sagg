# Draft: Static KB for Mythos

## Requirements (confirmed)
- Use static KB repository under `data/kb/`.
- Use **MDX + frontmatter** for mythos entries.
- Transcript assets exist under `data/transcripts/` (s01e01.txt through s01e07.txt).
- `/mythos` currently throws runtime errors for the user and needs stabilization.

## Technical Decisions
- Frontend is currently API-driven for mythos data via `frontend/lib/api.ts` (calls `/api/mythos`, `/api/mythos/graph`, etc.). We will need a static loader to replace or augment this.
- KB placement should follow the existing mythos approach but move content into `data/kb/` with MDX + frontmatter.
- Convert existing mythos YAML to MDX now; MDX becomes the source of truth.
- Mythos page should be static-only (no API fallback).
- Use **extended KB metadata** in MDX frontmatter (beyond the existing YAML fields).

## Research Findings
- Transcript assets are present as plain text episode files in `data/transcripts/`.
- `frontend/app/mythos/page.tsx` and `frontend/app/mythos/[id]/page.tsx` are wired to static KB loader functions from `frontend/lib/kb.ts` (`listMythos`, `listMythosCategories`, `getMythos`, `getMythosElementConnections`).
- `frontend/lib/kb.ts` fetches from `/kb/meta/mythos.json` with `cache: "force-cache"` and throws on non-OK responses.
- Static JSON artifacts exist and are readable:
  - `frontend/public/kb/meta/mythos.json`
  - `frontend/public/kb/meta/foundations.json`
  - `data/kb/meta/index.json`
- LSP diagnostics report no TypeScript errors in the two mythos route files.

## Open Questions
- What is the **frontmatter schema** for mythos entries (exact required fields, field names, types)?
- Do we need **Brainmatter-specific metadata** beyond standard frontmatter (e.g., embedding keys, tags, relationships)?
- What exact browser/server error is shown when opening `/mythos` (console stack, network status, or overlay message)?
- Does the failure happen only in `next dev` or also after production build/start?

## Scope Boundaries
- INCLUDE: Static KB repository setup for mythos, MDX schema, ingestion pipeline, and frontend integration.
- EXCLUDE: Unrelated API endpoint changes unless required for migration or fallback.
