# KB Expansion Plan — Blod Svett Tårar Lorebase

## TL;DR

> **Quick Summary**: Expand `data/kb/` with transcript‑grounded lore for BST Season 1, keeping strict BST/SST dual-layer separation, and update the KB registry.
>
> **Deliverables**:
> - New KB entries (characters, locations, world rules, episode guides, social groups)
> - Updated mythos entries with transcript evidence
> - Corrected existing entry errors (e.g., Alfred in `character-arcs.mdx`)
> - Updated `data/kb/meta/index.json` with new categories and entries
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Transcript analysis → KB content updates → index registry update

---

## Context

### Original Request
“We need to expand the current lorebase at `data/kb/` with a thorough analysis of all transcripts and external information over *Blod svett och tårar*… Remember to keep both original mythos (BST) and the ones we will be creating and expanding over time (SST).”

### Interview Summary
**Key Discussions**:
- Existing KB uses MDX files with BST/SST dual-layer frontmatter and a registry at `data/kb/meta/index.json`.
- Transcripts exist for s01e01–s01e07 (SRT English) in project. **Episode 8 transcript now available** at `/Users/wolfy/Downloads/Blod Svet Tararr/Subtitles/s01e08.txt`.
- **User requested**: Store all transcripts in KB (`data/kb/transcripts/`) for analysis and future reference.
- External sources confirmed: SVT Play episode synopses and IMDB cast data.
- KB currently has 11 entries (7 mythos + 4 foundations). No character entries exist.
- Known data gaps: missing character **MDX** entries (kevin, jari, rektorn, livia).
- Known error: `data/kb/foundations/character-arcs.mdx` incorrectly describes Alfred as popular/athletic.

### Research Findings
- SVT Play confirms 8 episodes; Episode 8 is “Maskeradbal” and features the finale dance battle and Chloe’s secret reveal.
- IMDB lists full cast, rating 7.1/10, production company Pilsnerfilm.
- Transcripts are in SRT format; parsed JSON dialogue exists but speaker attribution is messy.

### Metis Review
Metis returned an empty response. Proceeded with internal gap analysis and safeguards.

---

## Work Objectives

### Core Objective
Create a comprehensive, transcript‑grounded knowledge base expansion for BST Season 1 while preserving the BST/SST dual-layer structure and avoiding fabrication.

### Concrete Deliverables
- **All transcripts stored in KB** (`data/kb/transcripts/` directory with all 8 episode transcripts)
- New MDX files under `data/kb/` for characters, locations, world rules, episode guides, and social groups
- "Extraordinary lore" enhancements (see section below): cross-links, timelines, evidence trails, relationship matrices, and lore graph metadata
- Updated mythos entries with added BST evidence and SST expansions
- Corrected `data/kb/foundations/character-arcs.mdx` for Alfred's characterization
- Updated `data/kb/meta/index.json` with new categories and entries

### Definition of Done
- **All 8 episode transcripts** (s01e01–s01e08) copied to `data/kb/transcripts/` for KB storage
- All transcripts s01e01–s01e08 analyzed and cited in KB entries
- New KB entries follow existing MDX frontmatter format
- `index.json` lists all new entries with correct categories and paths
- No BST/SST conflation; BST content only cites transcript evidence

### Must Have
- Dual-layer BST/SST sections in every new KB MDX entry
- Source episode references for BST sections
- Updated index registry with accurate counts and categories

### Must NOT Have (Guardrails)
- No fabrication of BST canon beyond transcript + external sources
- No overwriting existing KB entries without explicit updates
- No conflation between BST canon and SST expansion

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action. All verification is executed by the agent using tools (Bash, Playwright, etc.).

### Test Decision
- **Infrastructure exists**: NO (no KB test framework)
- **Automated tests**: None (use agent-executed QA scenarios)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

Each task below includes concrete QA scenarios using Bash or file checks. Evidence is captured in `.sisyphus/evidence/` as text outputs or screenshots when applicable.

---

## Execution Strategy

### Parallel Execution Waves

**Wave 1 (Start Immediately):**
- Task 0: Copy all transcripts to KB storage (s01e01–s01e08)
- Task 1: Transcript analysis (s01e01–s01e08)
- Task 2: External source extraction (SVT Play + IMDB)

**Wave 2 (After Wave 1):**
- Task 3: Create new KB entries (characters, locations, social groups, episode guides, rules)
- Task 4: Update mythos entries with transcript evidence

**Wave 3 (After Wave 2):**
- Task 5: Fix existing errors + update index registry
- Task 6: Lorebase “extraordinary” enhancements (cross-links, timeline, graph metadata)

**Critical Path**: Task 0 → Task 1 → Task 3 → Task 5

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 0 | None | 1 | 2 |
| 1 | 0 | 3, 4 | 2 |
| 2 | None | 3, 4 | 0, 1 |
| 3 | 1, 2 | 5 | 4 |
| 4 | 1 | 5 | 3 |
| 5 | 3, 4 | 6 | None |
| 6 | 5 | None | None |

---

## TODOs

> Implementation + verification are bundled per task. Every task has a recommended agent profile and QA scenarios.

- [x] 0. Copy all transcripts to KB storage

  **What to do**:
  - Create `data/kb/transcripts/` directory
  - Copy s01e01.txt through s01e07.txt from `data/transcripts/` to `data/kb/transcripts/`
  - Copy s01e08.txt from `/Users/wolfy/Downloads/Blod Svet Tararr/Subtitles/` to `data/kb/transcripts/`
  - Verify all 8 transcript files are present in KB storage

  **Must NOT do**:
  - Do not modify transcript content
  - Do not remove originals from `data/transcripts/`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file copy operation
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - All skills: Simple bash commands sufficient

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 1
  - **Blocked By**: None

  **References**:
  - `data/transcripts/` – Existing project transcript directory (s01e01–s01e07)
  - `/Users/wolfy/Downloads/Blod Svet Tararr/Subtitles/s01e08.txt` – Episode 8 transcript location

  **Acceptance Criteria**:
  - [ ] Directory `data/kb/transcripts/` exists
  - [ ] All 8 transcript files (s01e01.txt–s01e08.txt) present in `data/kb/transcripts/`
  - [ ] Original files remain in `data/transcripts/`

  **Agent-Executed QA Scenarios**:

  Scenario: Transcript storage verification
    Tool: Bash
    Preconditions: Copy operations complete
    Steps:
      1. `ls data/kb/transcripts/` → capture output
      2. `wc -l data/kb/transcripts/*.txt` → count lines per file
      3. Assert: 8 files present (s01e01.txt through s01e08.txt)
      4. Assert: Each file has >100 lines (valid SRT content)
    Expected Result: 8 transcript files in KB storage with valid content
    Evidence: `.sisyphus/evidence/task-0-kb-transcripts.txt`

- [x] 1. Analyze all transcripts (s01e01–s01e08) and extract lore evidence

  **What to do**:
  - Read each transcript in `data/kb/transcripts/s01e01.txt` through `s01e08.txt`
  - Extract lore facts, character behaviors, rules, social structures, locations, and episode events
  - Produce a structured evidence log for use in KB entries (BST citations by episode)

  **Must NOT do**:
  - Do not fabricate missing content

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Extensive reading/synthesis work
  - **Skills**: `explore`
    - `explore`: For systematic extraction and file traversal
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed (no browser interaction required)

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 0 completes)
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3, Task 4
  - **Blocked By**: Task 0

  **References**:
  - `data/kb/transcripts/s01e01.txt` – SRT transcript format and baseline lore
  - `data/kb/transcripts/s01e02.txt` … `s01e08.txt` – remaining episode evidence
  - `data/parsed/episodes.json` – cross-check episode IDs/titles

  **Acceptance Criteria**:
  - [ ] Evidence log includes all 8 episodes with cited episode IDs
  - [ ] Evidence log saved to `.sisyphus/evidence/episode-evidence.md`

  **Agent-Executed QA Scenarios**:

  Scenario: Transcript coverage audit
    Tool: Bash
    Preconditions: repository available
    Steps:
      1. `ls data/kb/transcripts/` → capture output
      2. Assert: s01e01.txt–s01e08.txt all present
    Expected Result: 8 transcript files listed
    Evidence: `.sisyphus/evidence/task-1-transcripts-list.txt`

- [x] 2. Extract external source summaries (SVT Play + IMDB)

  **What to do**:
  - Summarize episode synopses from SVT Play (for Episode 8 context only, not canonical detail)
  - Extract cast list and metadata from IMDB
  - Produce a short reference note for KB citations

  **Must NOT do**:
  - Do not treat external synopsis as canonical transcript detail

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `playwright` or `dev-browser`
    - For direct web access and capture
  - **Skills Evaluated but Omitted**:
    - `explore`: Not needed for external web sources

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - https://www.svtplay.se/blod-svett-tarar
  - https://www.imdb.com/title/tt39374931/

  **Acceptance Criteria**:
  - [ ] SVT Play synopsis summary recorded
  - [ ] IMDB cast + rating recorded

  **Agent-Executed QA Scenarios**:

  Scenario: External reference capture
    Tool: Playwright (playwright skill)
    Preconditions: Network access
    Steps:
      1. Navigate to SVT Play link
      2. Capture episode list + Episode 8 synopsis
      3. Navigate to IMDB link
      4. Capture cast list and rating
      5. Save screenshots
    Expected Result: Evidence captures for both sources
    Evidence: `.sisyphus/evidence/task-2-svt.png`, `.sisyphus/evidence/task-2-imdb.png`

- [x] 3. Create new KB entries (characters, locations, social groups, episode guides, world rules)

  **What to do**:
  - Add new MDX files under `data/kb/` following existing frontmatter format
  - Create categories: `characters`, `locations`, `world-rules`, `episodes`, `social-groups`
  - Ensure every new entry includes BST evidence (source_episodes) and SST expansions
  - Add missing character **MDX** entries under `data/kb/characters/` (kevin, jari, rektorn, livia)

  **Must NOT do**:
  - No BST claims without transcript evidence
  - No conflation of BST/SST sections

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `explore`, `frontend-ui-ux`
    - `explore`: for reading transcript evidence
    - `frontend-ui-ux`: for consistent MDX structure and presentation
  - **Skills Evaluated but Omitted**:
    - `playwright`: not needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `data/kb/mythos/feeding.mdx` – MDX frontmatter structure with BST/SST versions
  - `data/kb/foundations/adaptation-guide.mdx` – style and tone for foundational entries
  - `data/kb/foundations/character-arcs.mdx` – existing character tone and terminology

  **Acceptance Criteria**:
  - [ ] New MDX files exist for each category with BST/SST sections
  - [ ] Missing character MDX entries added
  - [ ] Each BST entry includes `source_episodes`

  **Agent-Executed QA Scenarios**:

  Scenario: KB entry presence and frontmatter audit
    Tool: Bash
    Preconditions: New files written
    Steps:
      1. `ls data/kb/characters/` → capture output
      2. `ls data/kb/locations/` → capture output
      3. `python - <<'PY'` to parse frontmatter keys (id, slug, versions.bst, versions.sst)
    Expected Result: All new files present and frontmatter complete
    Evidence: `.sisyphus/evidence/task-3-kb-audit.txt`

- [x] 4. Update existing mythos entries with transcript evidence

  **What to do**:
  - Update all 7 mythos MDX files with evidence from transcripts
  - Ensure BST sections are strictly grounded in transcript references
  - Update SST sections for expansion where appropriate

  **Must NOT do**:
  - No new BST claims without transcript evidence

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `explore`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - `data/kb/mythos/*.mdx` – existing mythos entries
  - `data/mythos/*.yaml` – source data for consistency

  **Acceptance Criteria**:
  - [ ] All 7 mythos files updated with new BST evidence
  - [ ] `source_episodes` updated where applicable

  **Agent-Executed QA Scenarios**:

  Scenario: Mythos update audit
    Tool: Bash
    Preconditions: mythos updates complete
    Steps:
      1. `ls data/kb/mythos/` → capture output
      2. `python - <<'PY'` check that each mythos file includes `versions.bst.source_episodes`
    Expected Result: All mythos entries include episode references
    Evidence: `.sisyphus/evidence/task-4-mythos-audit.txt`

- [x] 5. Fix known errors and update `index.json`

  **What to do**:
  - Correct Alfred’s description in `data/kb/foundations/character-arcs.mdx`
  - Update `data/kb/meta/index.json` with new categories and entries
  - Recompute counts for categories and totals

  **Must NOT do**:
  - Do not remove existing entries
  - Do not introduce invalid paths

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `explore`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 6
  - **Blocked By**: Task 3, Task 4

  **References**:
  - `data/kb/foundations/character-arcs.mdx` – Alfred error location
  - `data/kb/meta/index.json` – registry schema and counts

  **Acceptance Criteria**:
  - [ ] Alfred’s description corrected
  - [ ] index.json updated with new entries and category counts

  **Agent-Executed QA Scenarios**:

  Scenario: Registry validation
    Tool: Bash
    Preconditions: index.json updated
    Steps:
      1. `python - <<'PY'` to load `data/kb/meta/index.json` and validate counts
      2. Assert: `total == sum(categories)`
    Expected Result: Registry counts consistent
    Evidence: `.sisyphus/evidence/task-5-index-validation.txt`

- [x] 6. Lorebase “extraordinary” enhancements (cross-links, timeline, graph metadata)

  **What to do**:
  - Add **cross‑link sections** in MDX (Related Characters / Related Mythos / Related Episodes)
  - Create a **timeline index** (episode‑ordered lore beats with BST/SST deltas)
  - Add **relationship matrices** for key social groups (Batgirls, Natt och Dag family)
  - Add **lore graph metadata** in `index.json` (nodes/edges counts + tags)
  - Add **evidence trails** (explicit transcript citations per key claim)

  **Must NOT do**:
  - Do not invent BST facts beyond transcript evidence

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `explore`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 5)
  - **Blocks**: None (final)
  - **Blocked By**: Task 5

  **References**:
  - `data/kb/meta/index.json` – registry structure (to extend with lore-graph metadata)
  - `data/kb/mythos/*.mdx` – consistent MDX structure and related_ids patterns
  - `data/kb/foundations/adaptation-guide.mdx` – narrative framing style

  **Acceptance Criteria**:
  - [ ] Each new MDX entry has a Related section with valid IDs
  - [ ] Timeline index exists and links to episode guides
  - [ ] index.json includes lore-graph metadata fields

  **Agent-Executed QA Scenarios**:

  Scenario: Cross-link and metadata audit
    Tool: Bash
    Preconditions: enhancements complete
    Steps:
      1. `python - <<'PY'` parse MDX to ensure related IDs resolve in index.json
      2. Assert: no dangling references
    Expected Result: All cross-links valid
    Evidence: `.sisyphus/evidence/task-6-crosslink-audit.txt`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3+4+5+6 | `feat(kb): expand BST/SST lorebase` | KB MDX + index.json | QA scenarios pass |

---

## Success Criteria

### Verification Commands
```bash
python - <<'PY'
import json
with open('data/kb/meta/index.json') as f:
    idx = json.load(f)
assert idx['counts']['total'] == sum(idx['categories'].values())
print('index.json counts OK')
PY
```

### Final Checklist
- [x] All new KB entries exist and include BST/SST sections
- [x] All BST sections cite transcript episodes
- [x] No Episode 8 content fabricated
- [x] index.json registry counts correct
