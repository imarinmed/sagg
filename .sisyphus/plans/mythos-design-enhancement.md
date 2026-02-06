# Mythos Premium Redesign (List + Detail)

## TL;DR

> **Quick Summary**: Redesign both `/mythos` and `/mythos/[id]` into a premium, deeply immersive encyclopedia system that blends wiki-grade structure with narrative lore expansion, fully powered by static KB data.
>
> **Deliverables**:
> - Premium information architecture and visual system for mythos list and detail pages
> - Encyclopedia-first modules (taxonomy navigation, canonical indexing, guided lore pathways, stronger defaults)
> - Accessibility and responsive parity with landing/characters quality bar
> - Agent-executed QA suite (visual + IA/discoverability baselines)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: encyclopedia IA blueprint -> list architecture redesign -> detail lore-tool modules -> polish + QA

---

## Context

### Original Request
Improve `/mythos` because it now loads but feels underwhelming versus the premium quality of landing and character pages. Provide a thorough enhancement plan.

### Interview Summary
**Key Decisions**:
- Scope includes **both** list and detail (`/mythos`, `/mythos/[id]`).
- Release 1 priority: **visual premium polish first**.
- Rollout strategy: **big-bang** (ship polish and IA/discoverability together).
- Verification depth: **Visual QA + IA/discoverability baseline checks**.

**Known Technical State**:
- Mythos routes already use static KB loader from `frontend/lib/kb.ts`.
- KB build generates static payloads under `frontend/public/kb/meta/`.
- Typecheck/build were previously passing for mythos routes.

### Metis Review
Metis invocation returned no textual output in this run, so the plan explicitly adds guardrails and anti-creep controls:
- Keep data layer unchanged unless required by UI acceptance criteria.
- Avoid touching unrelated sections (characters, landing) except shared visual tokens/components.
- Require measurable discoverability outcomes, not polish-only subjective checks.

---

## Work Objectives

### Core Objective
Deliver a premium mythos encyclopedia experience with clear hierarchy, deep lore immersion, and strong discovery/navigation, matching or exceeding landing/characters perceived quality.

### Concrete Deliverables
- Redesigned mythos list page as an immersive encyclopedia index (taxonomy + pathways + curated entries).
- Redesigned mythos detail page as a hybrid wiki + narrative expansion tool (facts + lore arcs + connections).
- Enhanced filtering/sorting/discovery controls and default states.
- Visual system alignment (typography, spacing, elevation, motion, token usage).
- Accessibility and responsive behavior verification artifacts.

### Definition of Done
- [x] `/mythos` first viewport communicates value within 3 seconds (encyclopedia index + taxonomy + active paths visible).
- [x] `/mythos/[id]` presents a premium narrative arc with clear hierarchy and dense-but-readable structure.
- [x] All key modules are discoverable without hidden tab hunting.
- [x] `bun run typecheck` passes.
- [x] `bun run build` passes.
- [x] QA evidence captured under `.sisyphus/evidence/mythos-redesign/`.

### Must Have
- Premium visual hierarchy comparable to landing/characters.
- Strong defaults (useful first state, no sparse/empty-feeling initial render).
- IA/discoverability measurable checks in release 1.
- Full mobile + desktop quality parity.

### Must NOT Have (Guardrails)
- No backend/API dependency for mythos rendering; use static KB loaders only (`frontend/lib/kb.ts` + generated JSON assets).
- No unrelated cross-section redesign scope creep.
- No placeholder/fake data.
- No inaccessible interactions (keyboard traps, low contrast text, non-semantic controls).

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> All verification must be agent-executed (Playwright/Bash). No manual tester steps allowed.

### Test Decision
- **Infrastructure exists**: YES (frontend typecheck/build toolchain available)
- **Automated tests**: Tests-after (focus on agent-executed visual + IA checks)
- **Framework**: Playwright scenarios + CLI build/type checks

### Agent-Executed QA Scenarios (MANDATORY)

Scenario: Mythos list premium encyclopedia first impression
  Tool: Playwright
  Preconditions: Frontend dev server running, KB assets generated
  Steps:
    1. Navigate to `http://localhost:6699/mythos`
    2. Wait for encyclopedia shell selector `[data-testid="mythos-encyclopedia-shell"]` (timeout 10s)
    3. Assert taxonomy/index module selector `[data-testid="mythos-taxonomy-index"]` is visible above fold
    4. Assert at least 2 discovery controls are visible (`search`, `category filter`, or `sort`) with selectors
    5. Capture screenshot `.sisyphus/evidence/mythos-redesign/list-first-impression.png`
  Expected Result: Non-sparse premium layout with clear hierarchy in initial viewport
  Failure Indicators: Blank/sparse content region, hidden discovery controls, weak encyclopedia hierarchy
  Evidence: `.sisyphus/evidence/mythos-redesign/list-first-impression.png`

Scenario: Mythos list discoverability baseline
  Tool: Playwright
  Preconditions: Same as above
  Steps:
    1. On `/mythos`, type `blood` into `[data-testid="mythos-search"]`
    2. Select category via `[data-testid="mythos-category-filter"] button[data-category="biology"]`
    3. Assert result count text in `[data-testid="mythos-result-count"]` updates
    4. Click first card `[data-testid^="mythos-card-"]`
    5. Assert navigation to `/mythos/{id}` and detail header visible
  Expected Result: User reaches relevant detail in <= 3 interactions after query entry
  Failure Indicators: No count feedback, unclear filtering effect, dead navigation
  Evidence: Playwright trace + screenshot `.sisyphus/evidence/mythos-redesign/list-discoverability.png`

Scenario: Mythos detail wiki+narrative hybrid hierarchy
  Tool: Playwright
  Preconditions: Detail page reachable from list
  Steps:
    1. Navigate to a valid detail page
    2. Assert title, category badge, and key summary block are visible in top section
    3. Assert at least 4 structured sections are visible (core facts + mechanics + narrative implications + related links)
    4. Assert lore expansion module exists (`related entries`, `connections`, `narrative pathways`, or `next read`)
    5. Capture screenshot `.sisyphus/evidence/mythos-redesign/detail-hierarchy.png`
  Expected Result: High-information readable structure combining reference wiki and narrative expansion
  Failure Indicators: Flat wall-of-text, missing section anchors, no lore expansion path
  Evidence: `.sisyphus/evidence/mythos-redesign/detail-hierarchy.png`

Scenario: Responsive + accessibility baseline
  Tool: Playwright
  Preconditions: Same pages available
  Steps:
    1. Set viewport to mobile (390x844), open `/mythos`
    2. Assert no horizontal overflow via JS (`document.documentElement.scrollWidth <= innerWidth`)
    3. Keyboard-tab through top controls; assert visible focus ring on each control
    4. Open detail page and verify section headings remain ordered and readable
    5. Capture screenshots mobile list/detail
  Expected Result: Responsive layout intact with keyboard-visible controls
  Failure Indicators: Overflow, hidden controls, missing focus indication
  Evidence: `.sisyphus/evidence/mythos-redesign/mobile-list.png`, `.sisyphus/evidence/mythos-redesign/mobile-detail.png`

Scenario: Build integrity after redesign
  Tool: Bash
  Preconditions: Dependencies installed
  Steps:
    1. Run `python3 scripts/build_kb.py`
    2. Run `bun run typecheck` in `frontend/`
    3. Run `bun run build` in `frontend/`
  Expected Result: All commands succeed with zero type errors
  Failure Indicators: Build/type failures or missing KB output artifacts
  Evidence: Command logs captured in CI/terminal output

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Foundations)
- Task 1: UX audit and IA map for list/detail
- Task 2: Define premium visual token alignment for mythos pages

Wave 2 (List Experience, Visual Editorial Layer)
- Task 3: Redesign `/mythos` as encyclopedia shell with high-impact editorial composition (taxonomy index, pathways, curated panel, character-forward hooks)
- Task 4: Upgrade filters/sort/search UX and empty/loading states with cinematic interaction cues and strong affordance clarity
- Task 5: Improve card system and section rhythm with striking visual hierarchy and tasteful sensual atmosphere (without explicit content)

Wave 3 (Detail Experience)
- Task 6: Redesign `/mythos/[id]` top hierarchy + key reference composition
- Task 7: Expand to wiki+narrative hybrid sections + connection/discovery modules
- Task 8: Add cross-navigation pathways (related entries/next reads)

Wave 4 (Polish + Validation)
- Task 9: Motion, micro-interaction, and responsive tuning
- Task 10: Accessibility, discoverability benchmark checks, final QA evidence

Critical Path: 1 -> 3 -> 6 -> 10

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3, 6 | 2 |
| 2 | None | 3, 6, 9 | 1 |
| 3 | 1, 2 | 4, 5, 10 | 6 (partial) |
| 4 | 3 | 10 | 5 |
| 5 | 3 | 10 | 4 |
| 6 | 1, 2 | 7, 8, 10 | 3 (partial) |
| 7 | 6 | 10 | 8 |
| 8 | 6 | 10 | 7 |
| 9 | 2, 3, 6 | 10 | None |
| 10 | 4, 5, 7, 8, 9 | None | None |

---

## TODOs

- [x] 1. Audit current mythos UX and establish target IA blueprint
  - What to do: Map current list/detail information flow, identify sparse states, define premium narrative hierarchy for both routes.
  - Must NOT do: Change backend contracts.
  - Recommended Agent Profile: Category `unspecified-high`; Skills `frontend-ui-ux`, `feature-research`.
  - Parallelization: Can run with Task 2.
  - References:
    - `frontend/app/mythos/page.tsx` - current list IA implementation
    - `frontend/app/mythos/[id]/page.tsx` - current detail IA implementation
    - `frontend/app/page.tsx` and `frontend/app/characters/page.tsx` - quality/style benchmark
  - Acceptance Criteria:
    - IA blueprint documented with explicit above-fold composition for list and detail.
    - Discovery path map includes search -> filter -> detail flow.

- [x] 2. Define mythos premium visual language parity package
  - What to do: Establish typography scale, spacing rhythm, elevation/glass usage, and color emphasis patterns matching premium pages.
  - Must NOT do: Introduce random one-off styles.
  - Recommended Agent Profile: Category `visual-engineering`; Skills `frontend-ui-ux`.
  - Parallelization: Can run with Task 1.
  - References:
    - `frontend/app/globals.css`
    - `frontend/components/*` premium sections from landing/characters
  - Acceptance Criteria:
    - Token map for mythos pages defined and applied consistently.

- [x] 3. Redesign `/mythos` encyclopedia shell and first-screen composition
  - What to do: Build immersive encyclopedia index with taxonomy navigation, curated entries, immediate discovery controls, and an editorial visual layer that foregrounds character/lore tension (e.g., Kiara + companions as mythology anchors).
  - Must NOT do: Leave empty first viewport after stats.
  - Recommended Agent Profile: Category `visual-engineering`; Skills `frontend-ui-ux`, `vercel-react-best-practices`.
  - Parallelization: Blocked by 1,2.
  - References:
    - `frontend/app/mythos/page.tsx`
    - `frontend/components/MythosCard.tsx`
  - Acceptance Criteria:
    - `[data-testid="mythos-encyclopedia-shell"]` and `[data-testid="mythos-taxonomy-index"]` visible above fold.
    - Character-forward editorial strip (Kiara + key companions as lore entry anchors) is visible without overwhelming encyclopedia utility.

- [x] 4. Upgrade discovery controls UX on list page
  - What to do: Improve search/filter/sort affordances, feedback, and empty/loading states, with premium cinematic visual language and clear progression cues.
  - Must NOT do: Silent filter effects without count/state feedback.
  - Recommended Agent Profile: Category `quick`; Skills `frontend-ui-ux`.
  - Parallelization: After 3; with 5.
  - References:
    - `frontend/app/mythos/page.tsx`
    - `frontend/lib/kb.ts`
  - Acceptance Criteria:
    - Result count and active filter state always visible.
    - Controls feel immediately legible and attractive at first glance (no low-contrast or weak affordance zones).

- [x] 5. Recompose mythos card grid and section rhythm
  - What to do: Improve content density, card hierarchy, and rhythm between sections; introduce tasteful sensual atmosphere via color, typography, imagery framing, and motion cadence.
  - Must NOT do: Overcrowd with unreadable cards.
  - Recommended Agent Profile: Category `visual-engineering`; Skills `frontend-ui-ux`.
  - Parallelization: After 3; with 4.
  - References:
    - `frontend/components/MythosCard.tsx`
    - `frontend/app/mythos/page.tsx`
  - Acceptance Criteria:
    - Grid readability preserved on mobile and desktop.
    - At least one top-row module creates immediate emotional pull while remaining lore-informative.

- [x] 6. Redesign `/mythos/[id]` top hierarchy and reference block
  - What to do: Introduce strong detail header composition with key summary, taxonomy context, source framing, and quick jump anchors.
  - Must NOT do: Flat wall-of-text start.
  - Recommended Agent Profile: Category `visual-engineering`; Skills `frontend-ui-ux`, `vercel-react-best-practices`.
  - Parallelization: Blocked by 1,2.
  - References:
    - `frontend/app/mythos/[id]/page.tsx`
    - `frontend/components/MythosDetailView.tsx`
  - Acceptance Criteria:
    - Top section exposes key facts and clear next sections.

- [x] 7. Expand detail into wiki+narrative hybrid modules
  - What to do: Add and order reference modules (core facts/mechanics/rules) plus narrative expansion modules (implications, pathways, thematic links).
  - Must NOT do: Random section ordering.
  - Recommended Agent Profile: Category `visual-engineering`; Skills `frontend-ui-ux`.
  - Parallelization: After 6; with 8.
  - References:
    - `frontend/app/mythos/[id]/page.tsx`
  - Acceptance Criteria:
    - Minimum 4 clearly separated sections including both wiki-reference and narrative-expansion blocks.

- [x] 8. Add discoverability pathways from detail pages
  - What to do: Related entries, connection highlights, and next-read recommendations.
  - Must NOT do: Dead-end detail pages.
  - Recommended Agent Profile: Category `unspecified-low`; Skills `frontend-ui-ux`.
  - Parallelization: After 6; with 7.
  - References:
    - `frontend/lib/kb.ts` (`getMythosElementConnections`)
    - `frontend/components/LoreConnectionGraph.tsx`
  - Acceptance Criteria:
    - At least one actionable onward path always visible.

- [x] 9. Apply motion polish and responsive tuning
  - What to do: Add purposeful transitions and responsive micro-layout tuning.
  - Must NOT do: Gratuitous animation that hurts readability/perf.
  - Recommended Agent Profile: Category `visual-engineering`; Skills `frontend-ui-ux`.
  - Parallelization: After 2,3,6.
  - References:
    - `frontend/app/mythos/page.tsx`
    - `frontend/app/mythos/[id]/page.tsx`
  - Acceptance Criteria:
    - Motion supports hierarchy; no layout jank.

- [x] 10. Execute release-1 verification suite and evidence capture
  - What to do: Run all Playwright/Bash scenarios and archive evidence.
  - Must NOT do: Ship without IA/discoverability baseline proof.
  - Recommended Agent Profile: Category `quick`; Skills `playwright`.
  - Parallelization: Final gate.
  - References:
    - `.sisyphus/evidence/mythos-redesign/` (output folder)
    - `scripts/build_kb.py`
  - Acceptance Criteria:
    - All scenarios pass; evidence files created and named per scenario.

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1-2 | `plan(mythos): define premium IA and visual language` | docs/draft notes + target files | n/a |
| 3-5 | `feat(mythos): redesign list page hierarchy and discovery` | mythos list + card/filter components | typecheck + visual scenarios |
| 6-9 | `feat(mythos): redesign detail page hierarchy and pathways` | mythos detail + related modules | typecheck + visual scenarios |
| 10 | `test(mythos): add release evidence and validation` | evidence refs + QA docs | build + scenario suite |

---

## Success Criteria

### Verification Commands
```bash
python3 scripts/build_kb.py
# Expected: writes index + frontend/public/kb/meta/*.json

bun run typecheck
# Expected: 0 type errors

bun run build
# Expected: successful Next.js production build including mythos routes
```

### Final Checklist
- [x] Premium visual quality on list/detail matches landing/characters standard.
- [x] Discoverability baseline verified with scenario evidence.
- [x] Responsive and accessibility baseline checks pass.
- [x] Static KB pipeline remains intact and build-clean.
