## 2026-02-06 Task: Phase A verification
- /characters page renders CharactersPhoneView directly; no view toggle in page file.
- Phase A tasks 1-2 verified complete (toggle removed, phone view default).

## 2026-02-06 Task: Phase A layout
- CharactersPhoneView updated to 3-column layout with dominant center phone and right lifeline placeholder.
- Phone scale increased (~1.25) and left list tightened (smaller padding/avatar).

## Layout Patterns
- **3-Column Grid for Desktop**: Used `lg:grid lg:grid-cols-[280px_1fr_280px]` to create a dominant center stage for the phone interface while keeping side panels (list and future timeline) accessible but unobtrusive.
- **Scaling Transforms**: Used `scale-125` in Framer Motion animation to significantly increase the visual weight of the phone component without altering its internal layout logic.
- **Glassmorphism Placeholders**: Created a placeholder for the "Lifeline" column using consistent glassmorphism styles (`bg-black/40 backdrop-blur-xl`) to maintain visual consistency even for empty states.

## 2026-02-06 Task: Frame tones
- IPhoneMockup now supports frameTone variants (titanium, silver, graphite, obsidian, gold, rose-gold) with dynamic frame/btn styling.

## 2026-02-06 Task: Device logic
- CharactersPhoneView now chooses ChainHolster for females (gold or rose-gold) and IPhoneMockup for males (silver or obsidian) based on character variant.

## 2026-02-06 Task: Lifeline timeline
- CharactersPhoneView right panel now renders a vertical timeline (E1–E10) with clickable nodes and current episode highlight; local state `viewEpisode` syncs with `currentEpisode`.

## 2026-02-06 Task: Interactivity
- PhotoGallery already wires TouchGestureZone with swipe left/right, swipe up, and long-press plus AnimatePresence transitions.

## 2026-02-06 Task: Filters
- CharactersPhoneView now includes Species/Role/Family dropdown filters under search using glassmorphism styling and applied to filteredCharacters.

## 2026-02-06 Task: Phase C Timeline
- Implemented vertical timeline in CharactersPhoneView.tsx replacing the placeholder.
- Used Array(10) to generate 10 episode nodes.
- Used framer-motion layout and layoutId for smooth state transitions.
- Local state viewEpisode allows independent navigation within the phone view.

## 2026-02-06 Task: Sorting
- Added sort functionality (Name, Role, Episode) to CharactersPhoneView.
- Used `localeCompare` for string sorting and kept original order for "Episode" (proxy).
- Implemented UI with native select styled with glassmorphism and `appearance-none` for consistency.

## 2026-02-06 Task: Active tags
- Added active filter/sort chips with per-chip clear (X) and conditional CLEAR ALL action when 2+ criteria are active.

## 2026-02-06 Task: Autocomplete
- Search input now renders top 5 suggestions (name/role match), click-selects a character, updates query, and closes dropdown.

## 2026-02-06 Task: Active Filter Tags
- Implemented active filter tags in `CharactersPhoneView.tsx` using `framer-motion` for smooth entrance/exit animations.
- Used a derived `activeFilters` array to unify handling of different filter types (species, role, family) and sort order.
- Applied glassmorphism styles (`bg-[#D4AF37]/10`, `backdrop-blur`) to match the existing aesthetic.
- Added "Clear All" functionality when multiple filters are active for better UX.

## Search Autocomplete Implementation
- Implemented search autocomplete in `CharactersPhoneView.tsx` using local state and `useMemo`.
- Used `z-50` and removed `overflow-hidden` from the parent container to ensure the dropdown floats correctly over the list.
- Used `onBlur` with a timeout to handle closing the dropdown while allowing clicks to register.

## 2026-02-06 Task: Mythos page KB migration
- Migrated `frontend/app/mythos/page.tsx` from `api.mythos.list()` and `api.mythos.categories()` to `listMythos()` and `listMythosCategories()` from `@/lib/kb`.
- Migrated `frontend/app/mythos/[id]/page.tsx` from `api.mythos.get()`, `api.mythos.list()`, and `api.mythos.elementConnections()` to `getMythos()`, `listMythos()`, and `getMythosElementConnections()` from `@/lib/kb`.
- Fixed `kb.ts` `getMythosElementConnections()` to include required `id` field on MythosConnection objects (format: `{from_element_id}-{to_element_id}-{index}`).
- Both pages now load mythos data from static `/kb/meta/mythos.json` instead of dynamic API endpoints.
- `bun run typecheck` passes with no errors.

## 2026-02-06 Task: Finalize static-KB mythos rewiring
- Removed remaining API coupling from mythos routes (final cleanup).
- `frontend/app/mythos/page.tsx`: Removed `api` import and `characters` state; removed `api.characters.list()` from Promise.all; removed `characters` prop from MythosGraph component.
- `frontend/app/mythos/[id]/page.tsx`: Removed `api` import, kept only type imports (MythosElement, MythosConnection, MythosGraphData).
- Both files now load mythos data exclusively from `@/lib/kb` (listMythos, getMythos, listMythosCategories, getMythosElementConnections).
- No `api.*` symbol usage remains in either file.
- `bun run typecheck` passes with zero errors.
