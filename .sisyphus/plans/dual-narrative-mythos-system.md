# Dual-Narrative Mythos System: BST vs SST
## 🌟 THE SHADOW LORE FORGE 🌟
*A Creative Companion for Dark Adaptation*

## TL;DR

> **Quick Summary**: Build an **extraordinary creative companion system** that transforms the vampire wiki into a **Shadow Lore Forge**—a living knowledge base where BST canonical material becomes the seed for SST dark adaptation. This isn't just comparison; it's **creative catalysis**.
> 
> **Core Philosophy**: *"Remember how it is in the original so you can grow it towards the new SST story"*
> 
> **Deliverables**:
> - **Extended YAML schemas** with `versions: { bst, sst }` + JSON Schema validation
> - **Tag Library** as the backbone (motifs, beats, power dynamics, atmosphere)
> - **Creative Companion Panel** with Mutation Cards, Ripple Previews, Prompt Decks
> - **Narrative DNA extraction** (tag signatures, pattern recognition)
> - **Inspiration Graph** with bidirectional linking and serendipitous discovery
> - **Shadow Sandbox** for what-if scenarios (isolated from canon)
> - **Knowledge extraction pipeline** from transcripts + video analysis
> - **Backend API** for creative exploration and causality queries
> - **Frontend UI** with Forge panel, graph visualization, temporal navigation
> 
> **Estimated Effort**: Large (7-10 days) - Extraordinary features require extraordinary depth
> **Parallel Execution**: YES - 5 waves with 18 tasks
> **Critical Path**: Tag Library → Schema Design → Extraction Pipeline → Creative Engine → UI Integration

---

## Context

### Original Request
The user wants to completely improve the mythos of the series and create a system that can:
1. Observe and manage both the ORIGINAL "Blod svett tårar" (BST) and the ADAPTATION "Sagg, Svet, Tarar" (SST)
2. Compare differences between narratives
3. Determine narrative mechanisms and causality
4. Expand lore beautifully while maintaining dual-read capability
5. Build knowledge base from transcripts and official information

**Enhanced Vision**: The user wants this to be **extraordinary**—not just functional, but a **super-compelling and advanced knowledge base** that serves as a **creative companion**. The comparison drawer should be reframed: *"remember how it is in the original so you can grow it towards the new SST story."*

### Interview Summary
**Key Requirements** (from user request):
- Must handle dual narratives: BST (original) and SST (dark adaptation)
- Must enable comparison between the two
- Must track narrative mechanisms and causality
- Must allow beautiful lore expansion
- Must maintain ability to read dual sides and go back and forth
- Must analyze current lore through transcripts and accessible information
- **Must be extraordinary**—above and beyond typical wiki functionality

**Research Findings**:
- Current mythos already has `adaptation_expansion` fields in YAML structure
- 7 episodes of transcripts (7,855 lines)
- 1,698 video analysis moments with clean character IDs
- 10 character profiles with canonical/adaptation sections
- File-based data system (YAML/JSON), NOT database

**Oracle Architectural Guidance** (Enhanced):
- **Keep YAML** for authored content (better for writers than JSONC)
- Add **JSON Schema validation** for YAML to get IDE support without format switch
- Create **Tag Library** as backbone for all extraordinary features
- Build **Creative Companion** with precomputed Mutation Cards, Ripple Previews, Prompt Decks
- Use **Shadow Sandbox** for what-if scenarios (isolated from canon)
- Implement **Inspiration Graph** with bidirectional linking
- v1: Tag-driven analytics; v2: Advanced DNA/causality visualizers
- **Extraordinary comes from structure + UX**, not just format

**Librarian Research: Creative Companion Patterns**:
- **Non-Judgmental Creative Partner**: Tools like Sudowrite position as collaborators, not replacements
- **Context-Aware Suggestion Engine**: Suggestions based on current view context
- **Lorebook Architecture**: Activation keys, dynamic context injection, cascading activation
- **Bidirectional Linking**: Roam Research model—every link is two-way
- **Serendipitous Discovery**: "You might also be interested in..." with surprising connections
- **Combinatorial Creativity**: New ideas from combining existing elements
- **Constraint-Based Prompts**: Artificial constraints enhance creativity
- **What-If Scenario Generator**: Small changes early have massive downstream effects

**Data Format Decision**:
- **YAML for canonical content** (human-authored, comments supported, already in use)
- **JSON for derived/overlays** (fast, stable, deterministic)
- **JSON Schema for YAML validation** (IDE support without format switch)
- **NO JSONC** (adds parser complexity without significant benefit)

---

## Work Objectives

### Core Objective
Create a dual-narrative mythos management system that seamlessly tracks, compares, and expands both the canonical BST narrative and the darker SST adaptation, with full causality tracking and beautiful lore presentation.

### Concrete Deliverables

#### Phase 1: Foundation (The Forge Infrastructure)
1. **Tag Library**: Controlled vocabulary (motifs, beats, power dynamics, atmosphere, consent)
2. **Extended Data Schemas**: YAML with `versions: { bst, sst }` + JSON Schema validation
3. **JSON Overlay Files**: `alignment.json`, `causality_edges.json`, `claims.json`, `signatures.json`
4. **Extraction Pipeline**: BST canonical knowledge base + tag extraction from transcripts/video

#### Phase 2: Creative Engine (The Shadow Companion)
5. **Mutation Card System**: Precomputed SST directions from BST elements
6. **Ripple Preview Engine**: Show downstream effects of changes
7. **Prompt Deck Generator**: Combinatorial creative prompts
8. **Inspiration Graph**: Bidirectional linking with activation keys

#### Phase 3: Exploration Tools (The Discovery Layer)
9. **Shadow Sandbox**: What-if scenario workspace (isolated from canon)
10. **Narrative DNA Visualizer**: Tag signatures and pattern recognition
11. **Serendipity Engine**: Unexpected connection suggestions
12. **Temporal Navigator**: Episode/scene/moment hierarchy with branching

#### Phase 4: Integration (The Living Wiki)
13. **Creative Companion Panel**: Integrated Forge UI on all pages
14. **Graph Visualization**: Force-directed relationship exploration
15. **Backend API**: Creative exploration and causality endpoints
16. **Consistency Tools**: Validation + tag drift detection

### Definition of Done

#### Foundation (Must Have)
- [ ] All 7 mythos elements have BST/SST version fields populated
- [ ] All 10 characters have BST/SST version fields populated
- [ ] Tag Library exists with 30+ controlled vocabulary terms
- [ ] Causality edges exist for at least 50 key moments
- [ ] Claims database contains 200+ atomic statements with evidence
- [ ] API supports `?narrative=bst|sst|both` query parameter

#### Creative Engine (Extraordinary)
- [ ] Mutation Cards generate for all mythos elements (3-7 cards each)
- [ ] Ripple Preview shows downstream effects (top 5 ripples)
- [ ] Prompt Deck contains 100+ combinatorial prompts
- [ ] Inspiration Graph has bidirectional linking active

#### Exploration Tools (The Magic)
- [ ] Shadow Sandbox allows what-if scenarios with status tracking
- [ ] Narrative DNA shows tag signatures for episodes/characters
- [ ] Serendipity Engine suggests unexpected connections
- [ ] Temporal Navigator displays episode/scene/moment hierarchy

#### Integration (The Experience)
- [ ] Creative Companion Panel appears on all entity pages
- [ ] Graph Visualization shows relationship networks
- [ ] Frontend has narrative mode toggle (BST/SST/Both)
- [ ] Comparison view shows divergences with evidence links
- [ ] Consistency validation passes with zero errors

### Must Have (Foundation)
- BST canonical knowledge base fully extracted and queryable
- SST adaptation structure ready for content (can be empty initially)
- **Tag Library** as backbone for all creative features
- Causality tracking for key narrative moments
- Dual-narrative comparison UI
- Consistency validation for data integrity

### Extraordinary Features (v1)
- **Creative Companion Panel** with Mutation Cards, Ripple Previews, Prompt Decks
- **Inspiration Graph** with bidirectional linking and activation keys
- **Shadow Sandbox** for what-if scenarios (isolated from canon)
- **Narrative DNA** (tag signatures and pattern recognition)
- **Serendipity Engine** for unexpected connections
- **Temporal Navigator** with episode/scene/moment hierarchy

### Must NOT Have (Guardrails from Oracle)
- Automated SBERT/Smith-Waterman alignment (manual/hypothesis only in v1)
- Automated causal inference across all moments (curated edges only)
- Full consistency solver beyond basic validation
- Collaborative editing / CRDT / Git-like merge semantics
- Graph database / Neo4j / embeddings infrastructure
- Auto-generation of SST content from BST
- **v2 Features**: DNA helix visualization, causality cascade explorer, atmosphere waveform comparisons (deferred to v2)

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.

### Test Decision
- **Infrastructure exists**: YES (pytest configured in backend/pyproject.toml)
- **Automated tests**: YES (Tests after implementation)
- **Framework**: pytest with Pydantic model validation

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Backend/Models** | Bash (pytest) | Run tests, validate Pydantic models |
| **Data/JSON** | Bash (python) | Load and validate JSON structure |
| **API** | Bash (curl) | Send requests, parse responses |
| **Frontend/UI** | Playwright | Navigate, interact, assert DOM |
| **Pipeline** | Bash | Run extraction, check output files |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Days 1-3):
├── Task 1: Create Tag Library (The Backbone)
├── Task 2: Design Extended Schemas with JSON Schema
├── Task 3: Create Narrative Version Enum & ID System
├── Task 4: Extend Mythos YAML Files with Versions
└── Task 5: Extend Character YAML Files with Versions

Wave 2 (Knowledge Extraction - Days 3-5):
├── Task 6: Create BST Beats Segmentation
├── Task 7: Extract Tag Signatures from Content
├── Task 8: Create Causality Edges System
├── Task 9: Create Claims Database with Evidence
└── Task 10: Build Unified Extraction Pipeline

Wave 3 (Creative Engine - Days 5-7):
├── Task 11: Build Mutation Card Generator
├── Task 12: Create Ripple Preview Engine
├── Task 13: Build Prompt Deck Generator
└── Task 14: Create Inspiration Graph System

Wave 4 (Exploration Tools - Days 7-8):
├── Task 15: Create Shadow Sandbox System
├── Task 16: Build Narrative DNA Visualizer
├── Task 17: Create Serendipity Engine
└── Task 18: Build Temporal Navigator

Wave 5 (Integration - Days 8-10):
├── Task 19: Implement Creative Companion Panel
├── Task 20: Create Graph Visualization
├── Task 21: Implement Dual-Narrative API
├── Task 22: Add Consistency Validation
└── Task 23: Final Integration & Polish

Critical Path: Tasks 1 → 6 → 10 → 11 → 19
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix (Updated with Extraordinary Features)

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5 | 2, 1b |
| 1b | None | 7, 11, 12, 13, 14, 16 | 1, 2 |
| 2 | None | 6, 8, 9 | 1, 1b |
| 3 | 1 | 21 | 4, 5 |
| 4 | 1 | 21 | 3, 5 |
| 5 | 2 | 10 | 6, 8, 9 |
| 6 | 2 | 10 | 5, 8, 9 |
| 7 | 1b, 6 | 16 | 8, 9 |
| 8 | 2 | 21 | 5, 6, 9 |
| 9 | 5 | 10 | 6, 8 |
| 10 | 5, 6, 8, 9 | 21 | None |
| 11 | 1b, 4, 5 | 19 | None |
| 12 | 8, 11 | 15, 19 | 13, 14 |
| 13 | 1b, 6 | 19 | 12, 14 |
| 14 | 1b, 3, 4, 9 | 15, 17, 20 | 12, 13 |
| 15 | 12, 14 | 19 | 16, 17, 18 |
| 16 | 1b, 6, 7 | 19 | 15, 17, 18 |
| 17 | 14, 16 | 19 | 15, 16, 18 |
| 18 | 6, 7 | 19 | 15, 16, 17 |
| 19 | 11-18 | None | None |
| 20 | 14, 17 | None | 21 |
| 21 | 3, 4, 8, 10 | 19 | 20 |
| 22 | 2 | None | 21 |
| 23 | 19, 20, 21, 22 | None | None |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

---

### Task 1: Design Extended Schemas

**What to do**:
Design the extended data schemas for dual-narrative support:
1. Extend `MythosElement` model with `versions` field (bst/sst)
2. Add `Divergence` model for tracking differences
3. Create `NarrativeVersion` enum (bst, sst, both)
4. Design `Beat` model for narrative segmentation
5. Design `Alignment` model for BST↔SST mapping
6. Design `CausalEdge` model for causality tracking
7. Design `Claim` model for knowledge base statements

**Must NOT do**:
- Do NOT implement yet - this is design only
- Do NOT change existing model behavior (backward compatibility)
- Do NOT add database migrations (file-based system)

**Recommended Agent Profile**:
- **Category**: `ultrabrain` (complex data modeling requiring deep reasoning)
- **Skills**: None required (pure design task)
- **Reasoning**: Schema design requires careful consideration of relationships, versioning, and future extensibility

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 2)
- **Blocks**: Tasks 3, 4
- **Blocked By**: None

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/models.py` lines 86-122 - Current MythosElement and MythosConnection models
- `/Users/wolfy/Developer/2026.Y/bats/data/mythos/vampire_physiology.yaml` - Current YAML structure with adaptation_expansion
- `/Users/wolfy/Developer/2026.Y/bats/data/characters/kiara_natt_och_dag.yaml` - Character YAML with canonical/adaptation sections

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Schema design document exists and is complete
  Tool: Bash
  Preconditions: None
  Steps:
    1. Check file exists: .sisyphus/drafts/dual-narrative-schemas.md
    2. Verify document contains: MythosElement extension, Divergence model, 
       NarrativeVersion enum, Beat model, Alignment model, CausalEdge model, Claim model
    3. Verify each model has: fields list, types, validation rules
    4. Verify backward compatibility notes present
  Expected Result: Complete schema design document with 7+ models defined
  Evidence: Document content captured in output
```

**Commit**: NO (design phase)

---

### Task 1b: Create Tag Library (The Backbone) [NEW EXTRAORDINARY TASK]

**What to do**:
Create the controlled vocabulary tag library that powers all creative features:
1. Define tag categories: motifs, beats, power_dynamics, atmosphere, consent, intensity
2. Create tag definitions with descriptions and examples
3. Define tag relationships (hierarchy, mutual_exclusion, co_occurrence)
4. Create JSON Schema for tag validation
5. Export to `data/tags/library.json`
6. Create tag extraction utilities

**Tag Categories to Define**:
- **Motifs**: blood_as_ritual, inheritance_as_cage, eternal_youth, forbidden_desire
- **Beats**: temptation, humiliation, rescue, revelation, seduction, confrontation
- **Power Dynamics**: dominance, dependence, coercion, consent, manipulation
- **Atmosphere**: luxury_dread, erotic_menace, gothic_romance, teen_angst
- **Consent**: enthusiastic, negotiated, dubious, compelled, violated
- **Intensity**: 1-5 scale for erotic/horror/drama intensity

**Must NOT do**:
- Do NOT create an open taxonomy (keep it controlled)
- Do NOT allow synonyms (maintain strict vocabulary)
- Do NOT auto-assign tags without validation

**Recommended Agent Profile**:
- **Category**: `deep` (requires understanding narrative patterns)
- **Skills**: None required
- **Reasoning**: Tag library is the foundation for all creative features; requires careful curation

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 1)
- **Blocks**: Tasks 7, 11, 12, 13, 14, 16
- **Blocked By**: None

**References**:
- Research: Tag-first DNA approach from Oracle
- `/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_v2.json` - Content types for tag mapping
- `/Users/wolfy/Developer/2026.Y/bats/data/character_evolution.json` - Evolution patterns for beat detection

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Tag library exists with all categories
  Tool: Bash (python)
  Preconditions: None
  Steps:
    1. Check file exists: data/tags/library.json
    2. Load and validate structure
    3. Assert: Library has categories: motifs, beats, power_dynamics, 
               atmosphere, consent, intensity
    4. Assert: Each category has 5-15 tags
    5. Assert: Each tag has: id, name, description, examples[]
    6. Count: Total tags >= 30
  Expected Result: Tag library with 30+ defined tags
  Evidence: Tag library structure validation

Scenario: Tag validation works correctly
  Tool: Bash (python)
  Steps:
    1. Import tag validation utilities
    2. Test valid tag: validate_tag("blood_as_ritual") → True
    3. Test invalid tag: validate_tag("invalid_tag") → False
    4. Test tag hierarchy: get_parent_tag("dubious_consent") → "consent"
    5. Test co-occurrence: get_cooccurring_tags("seduction") → [...]
  Expected Result: Validation and relationship queries work
  Evidence: Validation test output
```

**Commit**: YES
- Message: `feat(tags): create controlled vocabulary tag library`
- Files: `data/tags/library.json`, `backend/src/tags/__init__.py`, `backend/src/tags/validation.py`
- Pre-commit: `cd backend && ruff check .`

---

### Task 2: Create Narrative Version Enum & Stable IDs

**What to do**:
1. Create `NarrativeVersion` enum in backend (bst, sst, both)
2. Define ID generation strategy for beats, claims, causal edges
3. Create ID validation utilities
4. Document ID format conventions
5. Add ID generation helpers to backend utils

**Must NOT do**:
- Do NOT generate all IDs upfront (on-demand generation)
- Do NOT change existing IDs (backward compatibility)
- Do NOT use UUIDs (human-readable IDs preferred)

**Recommended Agent Profile**:
- **Category**: `quick` (straightforward implementation)
- **Skills**: None required
- **Reasoning**: Simple enum and utility creation

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 1)
- **Blocks**: Tasks 5, 6, 7, 8
- **Blocked By**: None

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/models.py` - Pattern for enums and constants
- `/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_v2.json` - Existing moment ID patterns

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: NarrativeVersion enum exists and is valid
  Tool: Bash (python)
  Preconditions: Backend environment set up
  Steps:
    1. Import: from backend.src.models import NarrativeVersion
    2. Assert: NarrativeVersion.BST exists
    3. Assert: NarrativeVersion.SST exists
    4. Assert: NarrativeVersion.BOTH exists
    5. Assert: NarrativeVersion.BST.value == "bst"
  Expected Result: All enum values accessible and correct
  Evidence: Python output showing successful import and assertions

Scenario: ID generation utilities work correctly
  Tool: Bash (python)
  Preconditions: Backend utils module exists
  Steps:
    1. Import ID generation functions
    2. Generate beat_id: generate_beat_id("s01e01", 1) → "beat-s01e01-001"
    3. Generate claim_id: generate_claim_id() → "claim-xxx" format
    4. Generate edge_id: generate_edge_id() → "edge-xxx" format
    5. Validate all IDs match expected patterns
  Expected Result: All ID formats follow conventions
  Evidence: Generated IDs displayed in output
```

**Commit**: YES
- Message: `feat(mythos): add NarrativeVersion enum and ID utilities`
- Files: `backend/src/models.py`, `backend/src/utils/id_generator.py`
- Pre-commit: `cd backend && ruff check .`

---

### Task 3: Extend Mythos YAML Files

**What to do**:
1. Extend all 7 mythos YAML files with `versions` structure
2. Move existing `canonical` content to `versions.bst`
3. Move existing `adaptation_expansion` to `versions.sst`
4. Add `divergences` list for each mythos element
5. Ensure backward compatibility (old fields still work)
6. Update data loader to handle new structure

**Must NOT do**:
- Do NOT delete old fields (deprecate gradually)
- Do NOT add SST content yet (structure only)
- Do NOT break existing API responses

**Recommended Agent Profile**:
- **Category**: `unspecified-medium` (data migration task)
- **Skills**: None required
- **Reasoning**: YAML structure updates require careful handling

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 4)
- **Blocks**: Task 10
- **Blocked By**: Task 1

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/data/mythos/*.yaml` (7 files) - Current mythos data
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/data.py` lines 211-270 - Mythos loader
- Schema design from Task 1

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: All mythos YAML files have versions structure
  Tool: Bash (python)
  Preconditions: Task 1 complete
  Steps:
    1. Load each YAML file from data/mythos/
    2. Assert: 'versions' key exists
    3. Assert: 'versions.bst' exists with content
    4. Assert: 'versions.sst' exists (can be null/empty)
    5. Assert: 'divergences' key exists (can be empty list)
    6. Count: All 7 files pass validation
  Expected Result: 7/7 mythos files have new structure
  Evidence: Validation output with file list

Scenario: Data loader handles new structure correctly
  Tool: Bash (python)
  Preconditions: Backend running
  Steps:
    1. Import: from backend.src.data import load_mythos_from_yaml
    2. Load mythos data
    3. Assert: mythos_db loads without errors
    4. Assert: vampire_physiology element has versions.bst.description
    5. Assert: API endpoint GET /api/mythos returns 200
  Expected Result: Loader works, API responds correctly
  Evidence: API response showing mythos elements with versions
```

**Commit**: YES
- Message: `feat(mythos): extend YAML with dual-narrative versions structure`
- Files: `data/mythos/*.yaml`, `backend/src/data.py`
- Pre-commit: `cd backend && ruff check . && python -c "from src.data import load_mythos_from_yaml; load_mythos_from_yaml()"`

---

### Task 4: Extend Character YAML Files

**What to do**:
1. Extend all 10 character YAML files with `versions` structure
2. Move existing `canonical` content to `versions.bst`
3. Move existing `adaptation` content to `versions.sst`
4. Add `divergences` list for each character
5. Ensure backward compatibility
6. Update character data loader

**Must NOT do**:
- Do NOT delete old fields
- Do NOT lose existing kink_profile data
- Do NOT break existing character API

**Recommended Agent Profile**:
- **Category**: `unspecified-medium` (data migration)
- **Skills**: None required
- **Reasoning**: Similar to Task 3 but for characters

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 3)
- **Blocks**: Task 10
- **Blocked By**: Task 1

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/data/characters/*.yaml` (10 files) - Current character data
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/data.py` - Character loader

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: All character YAML files have versions structure
  Tool: Bash (python)
  Steps:
    1. Load each YAML from data/characters/
    2. Assert: 'versions' key exists
    3. Assert: 'versions.bst' exists with traits, backstory
    4. Assert: 'versions.sst' exists (can be null)
    5. Assert: 'divergences' key exists
    6. Count: All 10 files pass validation
  Expected Result: 10/10 character files have new structure
  Evidence: Validation output with character names

Scenario: Character API still works with new structure
  Tool: Bash (curl)
  Steps:
    1. GET http://localhost:8000/api/characters
    2. Assert: Response status 200
    3. Assert: Response contains characters array
    4. GET http://localhost:8000/api/characters/kiara-natt-och-dag
    5. Assert: Response contains character with versions
  Expected Result: API returns characters with versions field
  Evidence: curl response output
```

**Commit**: YES
- Message: `feat(characters): extend YAML with dual-narrative versions structure`
- Files: `data/characters/*.yaml`, `backend/src/data.py`
- Pre-commit: `cd backend && ruff check .`

---

### Task 5: Create BST Beats Segmentation

**What to do**:
1. Parse transcripts to identify narrative beats (scene-level segments)
2. Cross-reference with video analysis moments
3. Create beat records with stable IDs
4. Link beats to moments, characters, locations
5. Export to `data/narratives/bst/beats.json`
6. Create beat index by episode

**Must NOT do**:
- Do NOT create SST beats yet (BST only for v1)
- Do NOT over-segment (aim for 10-20 beats per episode)
- Do NOT lose moment-to-beat relationships

**Recommended Agent Profile**:
- **Category**: `deep` (complex NLP and data processing)
- **Skills**: None required
- **Reasoning**: Requires parsing transcripts, identifying scene boundaries, cross-referencing video analysis

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
- **Blocks**: Task 9
- **Blocked By**: Task 2

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/data/transcripts/s01e01.txt` through `s01e07.txt` - Source transcripts
- `/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_v2.json` - Moments to link
- `/Users/wolfy/Developer/2026.Y/bats/data/parsed/s01e*.json` - Scene structure reference

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Beats file created with valid structure
  Tool: Bash (python)
  Steps:
    1. Check file exists: data/narratives/bst/beats.json
    2. Load JSON and count beats
    3. Assert: Total beats >= 70 (10 per episode minimum)
    4. Assert: Each beat has: id, episode_id, start_time, end_time, 
               characters[], moments[], summary
    5. Assert: All beat IDs follow format: "beat-s01e01-001"
    6. Verify: Beats cover all 7 episodes
  Expected Result: beats.json exists with 70+ valid beat records
  Evidence: JSON structure validation output

Scenario: Beats link to existing moments
  Tool: Bash (python)
  Steps:
    1. Load beats.json and video_analysis_v2.json
    2. Sample 10 random beats
    3. Assert: Each sampled beat has moments array
    4. Assert: All moment_ids in beats exist in video_analysis
    5. Assert: Timestamps align (beat time range contains moment time)
  Expected Result: All beats have valid moment references
  Evidence: Cross-reference validation report
```

**Commit**: YES
- Message: `feat(narrative): create BST beats segmentation from transcripts`
- Files: `data/narratives/bst/beats.json`, `scripts/extract_beats.py`
- Pre-commit: `cd backend && python ../scripts/extract_beats.py --validate`

---

### Task 6: Create Alignment Registry

**What to do**:
1. Create alignment data structure for BST↔SST mapping
2. Initialize with "unmapped" status for all BST beats
3. Support alignment types: direct, condensed, expanded, reordered, omitted, added
4. Create placeholder records for anticipated SST beats
5. Export to `data/narratives/alignment.json`
6. Add alignment status tracking

**Must NOT do**:
- Do NOT create false alignments (keep SST side null for v1)
- Do NOT implement automated alignment algorithms
- Do NOT require SST content to exist

**Recommended Agent Profile**:
- **Category**: `unspecified-medium` (data structure creation)
- **Skills**: None required
- **Reasoning**: Creating registry structure with placeholder support

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
- **Blocks**: Task 10
- **Blocked By**: Task 2

**References**:
- Task 5 output: `data/narratives/bst/beats.json`
- Research: Narrative alignment patterns from Star Wars Holocron

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Alignment registry created with correct structure
  Tool: Bash (python)
  Steps:
    1. Check file exists: data/narratives/alignment.json
    2. Load and count alignment records
    3. Assert: One record per BST beat (70+ records)
    4. Assert: Each record has: bst_beat_id, sst_beat_id (null), 
               status ("unmapped"), alignment_type (null), notes
    5. Verify: All bst_beat_ids reference valid beats
  Expected Result: alignment.json with 70+ unmapped records
  Evidence: Registry validation output

Scenario: Alignment API endpoints work
  Tool: Bash (curl)
  Preconditions: Task 10 complete
  Steps:
    1. GET /api/narratives/alignment
    2. Assert: Returns alignment records
    3. GET /api/narratives/alignment?status=unmapped
    4. Assert: Returns only unmapped records
    5. GET /api/narratives/alignment/bst/beat-s01e01-001
    6. Assert: Returns specific alignment record
  Expected Result: API returns alignment data correctly
  Evidence: curl responses
```

**Commit**: YES
- Message: `feat(narrative): create alignment registry for BST-SST mapping`
- Files: `data/narratives/alignment.json`, `backend/src/models.py` (Alignment model)
- Pre-commit: `cd backend && ruff check .`

---

### Task 7: Create Causality Edges System

**What to do**:
1. Design causality edge schema (STAC-inspired)
2. Create edges for key narrative moments (50+ edges)
3. Support edge types: motivates, enables, forces, reveals, foreshadows
4. Link edges to moments, beats, mythos elements
5. Export to `data/causality/edges.json`
6. Create moment-to-edge index

**Must NOT do**:
- Do NOT create edges for all 1,698 moments (curated selection only)
- Do NOT implement automated causal inference
- Do NOT allow self-referential edges

**Recommended Agent Profile**:
- **Category**: `deep` (complex relationship modeling)
- **Skills**: None required
- **Reasoning**: Requires understanding narrative causality and creating meaningful relationships

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
- **Blocks**: Task 10
- **Blocked By**: Task 2

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_v2.json` - Moments to link
- `/Users/wolfy/Developer/2026.Y/bats/data/character_evolution.json` - Evolution milestones for causality
- Research: STAC (Situation-Task-Action-Consequence) pattern

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Causality edges file created with valid structure
  Tool: Bash (python)
  Steps:
    1. Check file exists: data/causality/edges.json
    2. Load and count edges
    3. Assert: Total edges >= 50
    4. Assert: Each edge has: edge_id, version, from_moment_id, 
               to_moment_id, type, stac {}, mechanism_refs, confidence
    5. Assert: No self-referential edges (from != to)
    6. Verify: All moment_ids reference valid moments
  Expected Result: edges.json with 50+ valid causal edges
  Evidence: Edge validation report

Scenario: Causality graph is traversable
  Tool: Bash (python)
  Steps:
    1. Load edges.json
    2. Build adjacency list
    3. Pick a starting moment (e.g., Kiara's arrival)
    4. Traverse forward: find all effects
    5. Traverse backward: find all causes
    6. Assert: Graph is connected (no orphaned components)
  Expected Result: Traversable causality graph
  Evidence: Traversal output showing connected components
```

**Commit**: YES
- Message: `feat(causality): create causality edges system for narrative tracking`
- Files: `data/causality/edges.json`, `backend/src/models.py` (CausalEdge model)
- Pre-commit: `cd backend && ruff check .`

---

### Task 8: Create Claims Database

**What to do**:
1. Design claim schema (Wikibase-inspired)
2. Extract atomic claims from transcripts and video analysis
3. Support claim types: fact, rule, relationship, event
4. Attach evidence references (episode, timestamp, moment, screenshot)
5. Export to `data/knowledge/claims.json`
6. Create claim indices by entity and episode

**Must NOT do**:
- Do NOT extract claims for all moments (focus on lore-relevant)
- Do NOT duplicate existing mythos content
- Do NOT create claims without evidence

**Recommended Agent Profile**:
- **Category**: `deep` (knowledge extraction and NLP)
- **Skills**: None required
- **Reasoning**: Requires extracting structured knowledge from unstructured text

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
- **Blocks**: Task 10
- **Blocked By**: Task 2

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/data/transcripts/*.txt` - Source for claim extraction
- `/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_v2.json` - Evidence linking
- `/Users/wolfy/Developer/2026.Y/bats/data/mythos/*.yaml` - Existing lore to avoid duplication
- Research: Wikibase Statements pattern

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Claims database created with valid structure
  Tool: Bash (python)
  Steps:
    1. Check file exists: data/knowledge/claims.json
    2. Load and count claims
    3. Assert: Total claims >= 200
    4. Assert: Each claim has: claim_id, type, subject, predicate, 
               object, canon_layer, evidence[], confidence
    5. Assert: All evidence has: source_type, source_id, timestamp
    6. Verify: Claims cover multiple types (fact, rule, relationship, event)
  Expected Result: claims.json with 200+ valid claims
  Evidence: Claims validation report

Scenario: Claims link to valid evidence
  Tool: Bash (python)
  Steps:
    1. Load claims.json and video_analysis_v2.json
    2. Sample 20 random claims
    3. For each claim, verify all evidence references:
       - episode_id exists in episodes.json
       - moment_id exists in video_analysis (if provided)
       - timestamp is valid format
    4. Assert: All sampled claims have valid evidence
  Expected Result: All claims have verifiable evidence
  Evidence: Evidence validation report
```

**Commit**: YES
- Message: `feat(knowledge): create claims database from narrative sources`
- Files: `data/knowledge/claims.json`, `scripts/extract_claims.py`
- Pre-commit: `cd backend && python ../scripts/extract_claims.py --validate`

---

### Task 9: Build Knowledge Extraction Pipeline

**What to do**:
1. Create unified pipeline script that orchestrates extraction
2. Process transcripts → beats → claims
3. Process video analysis → moments → causality edges
4. Cross-reference and validate all extractions
5. Generate consistency reports
6. Export to structured JSON files

**Must NOT do**:
- Do NOT run ML/NLP models (use deterministic heuristics for v1)
- Do NOT modify source files (read-only extraction)
- Do NOT create circular references

**Recommended Agent Profile**:
- **Category**: `ultrabrain` (complex pipeline orchestration)
- **Skills**: None required
- **Reasoning**: Requires coordinating multiple extraction processes and ensuring data integrity

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 5-8)
- **Parallel Group**: Sequential
- **Blocks**: Task 10
- **Blocked By**: Task 5

**References**:
- Tasks 5-8 outputs
- `/Users/wolfy/Developer/2026.Y/bats/scripts/extract_evolution.py` - Pattern for extraction scripts
- `/Users/wolfy/Developer/2026.Y/bats/scripts/extract_relationships.py` - Pattern for relationship extraction

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Pipeline runs successfully end-to-end
  Tool: Bash
  Steps:
    1. Run: python scripts/run_extraction_pipeline.py
    2. Assert: Exit code 0
    3. Assert: Output files exist:
       - data/narratives/bst/beats.json
       - data/narratives/alignment.json
       - data/causality/edges.json
       - data/knowledge/claims.json
    4. Assert: Consistency report generated
    5. Assert: No validation errors in report
  Expected Result: Pipeline completes with all outputs
  Evidence: Pipeline execution log

Scenario: Pipeline produces valid data counts
  Tool: Bash (python)
  Steps:
    1. Load all generated JSON files
    2. Assert: beats >= 70
    3. Assert: alignment records == beats count
    4. Assert: causality edges >= 50
    5. Assert: claims >= 200
    6. Assert: All files pass schema validation
  Expected Result: All data meets minimum thresholds
  Evidence: Data validation summary
```

**Commit**: YES
- Message: `feat(pipeline): build unified knowledge extraction pipeline`
- Files: `scripts/run_extraction_pipeline.py`, `scripts/validate_extractions.py`
- Pre-commit: `cd backend && ruff check ../scripts/`

---

### Task 10: Implement Dual-Narrative API

**What to do**:
1. Add `narrative` query parameter to existing endpoints (`?narrative=bst|sst|both`)
2. Create new endpoints for dual-narrative operations:
   - GET /api/narratives/compare/{entity_type}/{entity_id}
   - GET /api/narratives/alignment
   - GET /api/causality/graph
   - GET /api/knowledge/claims
3. Implement narrative filtering logic
4. Add comparison response models
5. Update API documentation

**Must NOT do**:
- Do NOT break existing API contracts (backward compatibility)
- Do NOT duplicate large amounts of data in responses
- Do NOT implement complex graph queries (keep it simple)

**Recommended Agent Profile**:
- **Category**: `unspecified-high` (complex API development)
- **Skills**: None required
- **Reasoning**: Requires extending existing API with new functionality while maintaining compatibility

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 3, 4, 6, 7, 8, 9)
- **Parallel Group**: Sequential
- **Blocks**: Task 12
- **Blocked By**: Tasks 3, 4, 6, 7, 8, 9

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/api/mythos.py` - Existing mythos API patterns
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/api/characters.py` - Character API patterns
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/models.py` - Response models

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Narrative query parameter works on mythos endpoint
  Tool: Bash (curl)
  Preconditions: Backend running on port 8000
  Steps:
    1. GET /api/mythos?vampire_physiology&narrative=bst
    2. Assert: Returns only BST version of vampire_physiology
    3. GET /api/mythos?vampire_physiology&narrative=sst
    4. Assert: Returns SST version (may be null)
    5. GET /api/mythos?vampire_physiology&narrative=both
    6. Assert: Returns both versions with comparison data
  Expected Result: All narrative filters work correctly
  Evidence: curl responses showing filtered data

Scenario: Comparison endpoint returns divergence data
  Tool: Bash (curl)
  Steps:
    1. GET /api/narratives/compare/mythos/vampire_physiology
    2. Assert: Response status 200
    3. Assert: Response contains: bst_version, sst_version, divergences[]
    4. Assert: divergences array has objects with kind, bst, sst fields
    5. Verify: All divergence fields are populated
  Expected Result: Comparison data includes divergences
  Evidence: Comparison API response

Scenario: Causality graph endpoint works
  Tool: Bash (curl)
  Steps:
    1. GET /api/causality/graph?character=kiara-natt-och-dag
    2. Assert: Response status 200
    3. Assert: Response contains nodes[] and edges[]
    4. Assert: Nodes include moments related to Kiara
    5. Assert: Edges show causal relationships
  Expected Result: Causality graph returns structured data
  Evidence: Graph API response

Scenario: Claims endpoint supports filtering
  Tool: Bash (curl)
  Steps:
    1. GET /api/knowledge/claims
    2. Assert: Returns claims array
    3. GET /api/knowledge/claims?entity=vampire_physiology
    4. Assert: Returns only claims about vampire_physiology
    5. GET /api/knowledge/claims?episode=s01e01
    6. Assert: Returns only claims from s01e01
  Expected Result: Claims API supports entity and episode filtering
  Evidence: Filtered claims responses
```

**Commit**: YES
- Message: `feat(api): implement dual-narrative endpoints with comparison support`
- Files: `backend/src/api/narratives.py` (new), `backend/src/api/causality.py` (new), `backend/src/api/knowledge.py` (new), updates to existing API files
- Pre-commit: `cd backend && ruff check . && pytest -v`

---

### Task 11: Build Mutation Card Generator [NEW EXTRAORDINARY TASK]

**What to do**:
Create the Mutation Card system that generates SST creative directions from BST elements:
1. Design Mutation Card schema (title, hook, constraints, possibilities)
2. Create mutation templates for different element types (mythos, character, scene)
3. Generate 3-7 mutation cards per mythos element (7 elements × 5 cards = 35 cards)
4. Generate 3-5 mutation cards per character (10 characters × 4 cards = 40 cards)
5. Link cards to tag signatures (what BST patterns to intensify/transform)
6. Export to `data/creative/mutation_cards.json`

**Mutation Card Types**:
- **Intensify**: "What if this were more extreme?"
- **Transform**: "What if this became its opposite?"
- **Complicate**: "What if this had darker implications?"
- **Expose**: "What if this were made explicit?"
- **Merge**: "What if this combined with [other element]?"

**Example Mutation Card**:
```json
{
  "card_id": "mut-blood_bond-001",
  "title": "The Blood Oath",
  "hook": "What if the blood bond became a ritual of submission?",
  "source_element": "blood_bond",
  "mutation_type": "intensify",
  "bst_signature": ["blood_as_ritual", "family_hierarchy", "consent_implied"],
  "constraints": ["Must maintain vampire physiology rules", "Kiara must remain protagonist"],
  "possibilities": [
    "The bond creates a master-servant dynamic",
    "Feeding becomes a sacred, almost religious act",
    "Breaking the bond has severe consequences"
  ],
  "intensity_increase": 3,
  "taboo_potential": ["power_imbalance", "ritualized_submission"]
}
```

**Must NOT do**:
- Do NOT auto-generate cards using LLM (curated templates only in v1)
- Do NOT create cards without BST source material
- Do NOT suggest mutations that violate established lore

**Recommended Agent Profile**:
- **Category**: `artistry` (creative content generation)
- **Skills**: None required
- **Reasoning**: Requires creative writing sensibility to craft compelling mutation prompts

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 1b, 4, 5)
- **Parallel Group**: Wave 3
- **Blocks**: Task 19
- **Blocked By**: Tasks 1b (Tag Library), 4, 5

**References**:
- Task 1b: Tag Library
- `/Users/wolfy/Developer/2026.Y/bats/data/mythos/*.yaml` - Source mythos elements
- `/Users/wolfy/Developer/2026.Y/bats/data/characters/*.yaml` - Source characters
- Research: Combinatorial creativity patterns, constraint-based prompts

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Mutation cards generated for all elements
  Tool: Bash (python)
  Steps:
    1. Load data/creative/mutation_cards.json
    2. Count total cards
    3. Assert: Cards >= 75 (35 mythos + 40 character minimum)
    4. Group by source_element
    5. Assert: All 7 mythos elements have 3-7 cards each
    6. Assert: All 10 characters have 3-5 cards each
  Expected Result: 75+ mutation cards covering all elements
  Evidence: Card distribution report

Scenario: Mutation cards have valid structure
  Tool: Bash (python)
  Steps:
    1. Sample 20 random cards
    2. Assert: Each has: card_id, title, hook, source_element, mutation_type
    3. Assert: Each has: constraints[], possibilities[] (3-5 items)
    4. Assert: bst_signature[] references valid tags from Tag Library
    5. Assert: intensity_increase is 1-5
  Expected Result: All cards have complete, valid structure
  Evidence: Card validation output

Scenario: Cards link to valid source elements
  Tool: Bash (python)
  Steps:
    1. Load mutation cards and mythos/character data
    2. For each card, verify source_element exists
    3. Assert: All mythos cards reference valid mythos IDs
    4. Assert: All character cards reference valid character IDs
  Expected Result: All cards reference existing elements
  Evidence: Cross-reference validation
```

**Commit**: YES
- Message: `feat(creative): build mutation card generator for SST adaptation`
- Files: `data/creative/mutation_cards.json`, `scripts/generate_mutation_cards.py`, `backend/src/creative/mutations.py`
- Pre-commit: `cd backend && ruff check . && python -c "from scripts.generate_mutation_cards import validate_cards; validate_cards()"`

---

### Task 12: Create Ripple Preview Engine [NEW EXTRAORDINARY TASK]

**What to do**:
Build the Ripple Preview system that shows downstream effects of changes:
1. Design Ripple Preview schema (change description, affected elements, magnitude)
2. Create ripple calculation algorithm using causality graph
3. For each mutation card, precompute top 5 ripples
4. Show: immediate effects → short-term consequences → long-term transformations
5. Export to `data/creative/ripple_previews.json`
6. Create API endpoint for dynamic ripple calculation

**Ripple Types**:
- **Character Arc**: How does this change affect character development?
- **Relationship Web**: Which relationships are impacted?
- **Mythos Evolution**: How do lore rules adapt?
- **Atmosphere Shift**: How does the tone change?
- **Plot Divergence**: Where does the story branch?

**Example Ripple Preview**:
```json
{
  "ripple_id": "ripple-mut-001",
  "source_card": "mut-blood_bond-001",
  "change_summary": "Blood bond becomes ritual of submission",
  "ripples": [
    {
      "order": 1,
      "type": "character_arc",
      "target": "kiara-natt-och-dag",
      "effect": "Kiara's rebellion becomes more about power dynamics",
      "magnitude": "significant"
    },
    {
      "order": 2,
      "type": "relationship_web",
      "target": "kiara-alfred",
      "effect": "Their bond takes on dominant/submissive undertones",
      "magnitude": "moderate"
    },
    {
      "order": 3,
      "type": "mythos_evolution",
      "target": "family_hierarchy",
      "effect": "Hierarchy becomes more explicitly about power exchange",
      "magnitude": "significant"
    }
  ]
}
```

**Must NOT do**:
- Do NOT calculate ripples for all possible changes (focus on mutation cards)
- Do NOT predict beyond 3rd-order effects (keep it tractable)
- Do NOT auto-apply ripples (preview only)

**Recommended Agent Profile**:
- **Category**: `deep` (graph traversal and impact analysis)
- **Skills**: None required
- **Reasoning**: Requires traversing causality graph and predicting narrative consequences

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Task 8 and 11)
- **Parallel Group**: Wave 3
- **Blocks**: Task 19
- **Blocked By**: Tasks 8 (Causality Edges), 11 (Mutation Cards)

**References**:
- Task 8: Causality Edges
- Task 11: Mutation Cards
- `/Users/wolfy/Developer/2026.Y/bats/data/character_relationships.json` - Relationship graph
- Research: What-if scenario generators, causality chains

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Ripple previews exist for mutation cards
  Tool: Bash (python)
  Steps:
    1. Load data/creative/ripple_previews.json
    2. Count ripple records
    3. Assert: One ripple preview per mutation card
    4. Assert: Each has 3-5 ripple effects
    5. Verify: All source_card references are valid
  Expected Result: Ripple preview for every mutation card
  Evidence: Ripple coverage report

Scenario: Ripple calculation traverses causality graph
  Tool: Bash (python)
  Steps:
    1. Pick a mutation card affecting Kiara
    2. Load its ripple preview
    3. Assert: Ripples include character_arc for Kiara
    4. Assert: Ripples include relationship_web for Kiara's relationships
    5. Assert: Ripples show increasing order (1, 2, 3...)
  Expected Result: Ripples follow causality chains
  Evidence: Ripple traversal validation

Scenario: API returns dynamic ripple calculation
  Tool: Bash (curl)
  Steps:
    1. POST /api/creative/ripples/calculate
       Body: { "element_id": "blood_bond", "mutation": "intensify_ritual" }
    2. Assert: Response status 200
    3. Assert: Response contains ripples[] array
    4. Assert: Each ripple has type, target, effect, magnitude
    5. Assert: Ripples ordered by causality distance
  Expected Result: API calculates ripples dynamically
  Evidence: API response showing calculated ripples
```

**Commit**: YES
- Message: `feat(creative): create ripple preview engine for downstream effects`
- Files: `data/creative/ripple_previews.json`, `backend/src/creative/ripples.py`, `backend/src/api/creative.py`
- Pre-commit: `cd backend && ruff check . && pytest tests/test_ripples.py -v`

---

### Task 13: Build Prompt Deck Generator [NEW EXTRAORDINARY TASK]

**What to do**:
Create the Prompt Deck system for combinatorial creative prompts:
1. Design Prompt Card schema (title, prompt, constraints, variations)
2. Build combinatorial engine that combines: element + tag + situation
3. Generate 100+ prompt cards covering:
   - Character development prompts
   - Scene reimagining prompts
   - Relationship evolution prompts
   - Mythos expansion prompts
   - Thematic exploration prompts
4. Support constraint-based generation ("7-word technique", perspective shifts)
5. Export to `data/creative/prompt_deck.json`
6. Create API for dynamic prompt generation

**Prompt Types**:
- **"Yes, and..."**: Extend canonical material
- **"What if..."**: Explore alternatives
- **"Tell from..."**: Perspective shifts
- **"Without..."**: Constraint-based
- **"Combine..."**: Mashup prompts

**Example Prompt Cards**:
```json
{
  "prompt_id": "prompt-001",
  "type": "what_if",
  "title": "The Delayed Bite",
  "prompt": "What if Kiara's first feeding happened 10 minutes later?",
  "source_elements": ["kiara-natt-och-dag", "s01e03", "first_feeding"],
  "tags": ["temptation", "blood_as_ritual", "coming_of_age"],
  "constraints": ["Must maintain vampire physiology", "Cannot change episode outcome"],
  "variations": [
    { "twist": "From victim's perspective", "focus": "sensory_experience" },
    { "twist": "No dialogue allowed", "focus": "physicality" },
    { "twist": "In a public setting", "focus": "risk_exposure" }
  ],
  "difficulty": "medium",
  "creative_potential": 4
}
```

**Must NOT do**:
- Do NOT use LLM for prompt generation (combinatorial only in v1)
- Do NOT create prompts without canonical anchors
- Do NOT suggest prompts that violate established character voices

**Recommended Agent Profile**:
- **Category**: `artistry` (creative writing and prompt engineering)
- **Skills**: None required
- **Reasoning**: Requires understanding of creative writing prompts and constraint-based creativity

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 1b, 6)
- **Parallel Group**: Wave 3
- **Blocks**: Task 19
- **Blocked By**: Tasks 1b (Tag Library), 6 (Beats)

**References**:
- Task 1b: Tag Library
- Task 6: Beats
- `/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_v2.json` - Moments for prompt anchors
- Research: Constraint-based creativity, 7-word technique, combinatorial prompts

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Prompt deck contains 100+ cards
  Tool: Bash (python)
  Steps:
    1. Load data/creative/prompt_deck.json
    2. Count total prompts
    3. Assert: Total >= 100
    4. Group by type
    5. Assert: All 5 prompt types represented
    6. Assert: Each prompt has 2-4 variations
  Expected Result: 100+ prompt cards with variations
  Evidence: Prompt deck statistics

Scenario: Prompts link to valid source elements
  Tool: Bash (python)
  Steps:
    1. Sample 30 random prompts
    2. For each, verify source_elements exist
    3. Assert: Characters reference valid character IDs
    4. Assert: Episodes reference valid episode IDs
    5. Assert: Tags reference valid tag IDs
  Expected Result: All prompts anchor to valid content
  Evidence: Source validation report

Scenario: Combinatorial generation works
  Tool: Bash (curl)
  Steps:
    1. POST /api/creative/prompts/generate
       Body: { "element": "blood_bond", "tag": "seduction", "type": "what_if" }
    2. Assert: Response status 200
    3. Assert: Returns generated prompt
    4. Assert: Prompt incorporates element, tag, and type
    5. Verify: Generated prompt follows template patterns
  Expected Result: API generates valid combinatorial prompts
  Evidence: Generated prompt examples
```

**Commit**: YES
- Message: `feat(creative): build prompt deck generator with combinatorial engine`
- Files: `data/creative/prompt_deck.json`, `backend/src/creative/prompts.py`, `scripts/generate_prompt_deck.py`
- Pre-commit: `cd backend && ruff check . && python scripts/generate_prompt_deck.py --validate`

---

### Task 14: Create Inspiration Graph System [NEW EXTRAORDINARY TASK]

**What to do**:
Build the bidirectional Inspiration Graph with activation keys (NovelAI Lorebook pattern):
1. Design Inspiration Node schema (canonical + creative extensions)
2. Implement bidirectional linking (if A links to B, B knows about A)
3. Create activation key system (nodes trigger when viewing related content)
4. Build cascading activation (one node triggers related nodes)
5. Generate inspiration suggestions from tag co-occurrence
6. Export to `data/creative/inspiration_graph.json`
7. Create API for dynamic inspiration queries

**Inspiration Node Types**:
- **Canonical**: Direct from BST material
- **Extension**: SST elaborations
- **What_If**: Alternate scenarios
- **Prompt**: Creative writing prompts
- **Connection**: Discovered relationships

**Example Inspiration Node**:
```json
{
  "node_id": "insp-blood_bond-001",
  "type": "canonical",
  "title": "The Blood Bond Ritual",
  "content": "Vampires form supernatural connections through blood exchange...",
  "source": { "type": "mythos", "id": "blood_bond" },
  "activation_keys": ["blood", "bond", "ritual", "feeding", "connection"],
  "links_to": [
    { "node_id": "insp-family_hierarchy-001", "context": "Bonds reinforce hierarchy" },
    { "node_id": "insp-kiara-001", "context": "Kiara's first bond experience" }
  ],
  "linked_from": [], // Auto-populated
  "cascade_triggers": ["insp-feeding-001", "insp-vampire_physiology-001"],
  "creative_potential": 5,
  "is_discovered": true
}
```

**Must NOT do**:
- Do NOT create orphaned nodes (all must link to canon)
- Do NOT allow circular activation loops
- Do NOT auto-discover without validation

**Recommended Agent Profile**:
- **Category**: `deep` (graph database patterns without the database)
- **Skills**: None required
- **Reasoning**: Requires implementing graph structures and traversal algorithms

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 1b, 3, 4, 9)
- **Parallel Group**: Wave 3
- **Blocks**: Task 19
- **Blocked By**: Tasks 1b (Tag Library), 3, 4 (Extended YAMLs), 9 (Claims)

**References**:
- Task 1b: Tag Library
- Tasks 3, 4: Extended YAMLs
- Task 9: Claims
- Research: NovelAI Lorebook, Roam Research bidirectional linking, graph visualization

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Inspiration graph has bidirectional links
  Tool: Bash (python)
  Steps:
    1. Load data/creative/inspiration_graph.json
    2. Pick a node with links_to entries
    3. For each target in links_to:
       - Load target node
       - Assert: target.linked_from contains source node
    4. Verify: All explicit links are reciprocated
  Expected Result: Bidirectional linking works correctly
  Evidence: Link reciprocity validation

Scenario: Activation keys trigger relevant nodes
  Tool: Bash (python)
  Steps:
    1. Query graph with activation key "blood"
    2. Assert: Returns nodes with "blood" in activation_keys
    3. Assert: Includes blood_bond, feeding, vampire_physiology nodes
    4. Assert: Results sorted by relevance (key match + link depth)
  Expected Result: Activation system finds relevant nodes
  Evidence: Activation query results

Scenario: Cascading activation works
  Tool: Bash (python)
  Steps:
    1. Activate node A with cascade_triggers
    2. Assert: All cascade_triggers nodes are activated
    3. Assert: Those nodes' cascades also activate
    4. Count total activated nodes
    5. Assert: Cascade depth <= 3 (prevent runaway)
  Expected Result: Cascading activation within limits
  Evidence: Cascade activation report

Scenario: API returns inspiration suggestions
  Tool: Bash (curl)
  Steps:
    1. GET /api/creative/inspiration?context=blood_bond&limit=5
    2. Assert: Response status 200
    3. Assert: Returns 5 inspiration nodes
    4. Assert: All nodes related to blood_bond via activation or links
    5. Assert: Results include mix of canonical and creative nodes
  Expected Result: API provides contextual inspiration
  Evidence: Inspiration API response
```

**Commit**: YES
- Message: `feat(creative): create inspiration graph with bidirectional linking`
- Files: `data/creative/inspiration_graph.json`, `backend/src/creative/inspiration.py`, `backend/src/api/inspiration.py`
- Pre-commit: `cd backend && ruff check . && pytest tests/test_inspiration.py -v`

---

### Task 15: Create Shadow Sandbox System [NEW EXTRAORDINARY TASK]

**What to do**:
Build the Shadow Sandbox for what-if scenario exploration (isolated from canon):
1. Design Sandbox Scenario schema (divergence point, changes, ripples, status)
2. Create sandbox workspace separate from canonical data
3. Support scenario types: character_arc, relationship_shift, mythos_change, plot_branch
4. Track scenario status: draft, explore, rejected, canonized
5. Allow "forking" scenarios (create variants)
6. Export to `data/sandbox/scenarios.json`
7. Create UI for sandbox exploration

**Sandbox Scenario Structure**:
```json
{
  "scenario_id": "sandbox-001",
  "title": "Kiara's Darker Awakening",
  "description": "What if Kiara embraced her vampire nature immediately?",
  "based_on": { "episode": "s01e01", "scene": "arrival" },
  "changes": [
    {
      "type": "character_trait",
      "target": "kiara-natt-och-dag",
      "from": "reluctant",
      "to": "embracing",
      "magnitude": "dramatic"
    }
  ],
  "predicted_ripples": [
    { "order": 1, "effect": "Kiara seduces Alfred instead of hesitating" },
    { "order": 2, "effect": "Family reacts with fear rather than patience" },
    { "order": 3, "effect": "Power dynamics shift toward Kiara earlier" }
  ],
  "status": "explore",
  "created_at": "2026-02-05T10:00:00Z",
  "forked_from": null,
  "forks": ["sandbox-001-variant-a"],
  "notes": "This creates a more dominant Kiara arc..."
}
```

**Must NOT do**:
- Do NOT allow sandbox content to leak into canonical API responses
- Do NOT auto-promote to canon (canonization is deliberate)
- Do NOT delete scenarios (archive with status instead)

**Recommended Agent Profile**:
- **Category**: `unspecified-high` (complex data modeling + isolation)
- **Skills**: None required
- **Reasoning**: Requires careful isolation of non-canon content and workflow management

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 12, 14)
- **Parallel Group**: Wave 4
- **Blocks**: Task 19
- **Blocked By**: Tasks 12 (Ripple Preview), 14 (Inspiration Graph)

**References**:
- Task 12: Ripple Preview
- Task 14: Inspiration Graph
- Research: Interactive fiction branching, what-if scenario tools, Twine/Inkle patterns

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Sandbox scenarios isolated from canon
  Tool: Bash (curl)
  Steps:
    1. GET /api/mythos (canonical endpoint)
    2. Assert: Response does NOT contain sandbox content
    3. GET /api/sandbox/scenarios
    4. Assert: Response contains only sandbox scenarios
    5. Verify: No scenario IDs overlap with canonical IDs
  Expected Result: Complete isolation between sandbox and canon
  Evidence: API isolation test

Scenario: Scenarios track status workflow
  Tool: Bash (curl)
  Steps:
    1. POST /api/sandbox/scenarios
       Body: { "title": "Test", "changes": [...] }
    2. Assert: Created with status "draft"
    3. PATCH /api/sandbox/scenarios/{id}
       Body: { "status": "explore" }
    4. Assert: Status updated to "explore"
    5. Verify: Cannot set invalid status values
  Expected Result: Status workflow enforced
  Evidence: Status transition test

Scenario: Forking scenarios creates variants
  Tool: Bash (curl)
  Steps:
    1. Create parent scenario
    2. POST /api/sandbox/scenarios/{id}/fork
    3. Assert: New scenario created
    4. Assert: New scenario has forked_from pointing to parent
    5. Assert: Parent scenario has fork referencing child
    6. Verify: Forked scenario copies parent changes
  Expected Result: Forking creates linked variants
  Evidence: Fork relationship validation
```

**Commit**: YES
- Message: `feat(sandbox): create shadow sandbox for what-if scenarios`
- Files: `data/sandbox/scenarios.json`, `backend/src/sandbox/__init__.py`, `backend/src/api/sandbox.py`
- Pre-commit: `cd backend && ruff check . && pytest tests/test_sandbox.py -v`

---

### Task 16: Build Narrative DNA Visualizer [NEW EXTRAORDINARY TASK]

**What to do**:
Create the Narrative DNA system for tag signature visualization:
1. Design DNA Signature schema (tag frequencies, co-occurrence patterns, evolution)
2. Calculate signatures for: episodes, characters, relationships, mythos elements
3. Show signature comparison: BST vs SST (where SST exists)
4. Create "mutation" view: how signatures transform between versions
5. Export to `data/derived/signatures.json`
6. Build visualization components (radar charts, heatmaps)

**DNA Signature Structure**:
```json
{
  "signature_id": "sig-kiara-bst",
  "entity_type": "character",
  "entity_id": "kiara-natt-och-dag",
  "version": "bst",
  "tag_signature": {
    "motifs": { "blood_as_ritual": 0.3, "inheritance_as_cage": 0.7, "forbidden_desire": 0.5 },
    "beats": { "temptation": 0.6, "revelation": 0.4, "rescue": 0.2 },
    "power_dynamics": { "dependence": 0.7, "rebellion": 0.8, "submission": 0.1 },
    "atmosphere": { "teen_angst": 0.8, "gothic_romance": 0.5 }
  },
  "co_occurrence_patterns": [
    { "tags": ["temptation", "forbidden_desire"], "strength": 0.85 },
    { "tags": ["rebellion", "inheritance_as_cage"], "strength": 0.72 }
  ],
  "evolution_curve": [
    { "episode": "s01e01", "intensity": 0.3 },
    { "episode": "s01e02", "intensity": 0.5 },
    { "episode": "s01e03", "intensity": 0.8 }
  ]
}
```

**Must NOT do**:
- Do NOT use ML for pattern detection (tag aggregation only in v1)
- Do NOT show signatures for elements without tags
- Do NOT auto-interpret patterns (present data, let users interpret)

**Recommended Agent Profile**:
- **Category**: `deep` (data aggregation and visualization)
- **Skills**: None required
- **Reasoning**: Requires statistical aggregation and chart generation

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 1b, 6, 7)
- **Parallel Group**: Wave 4
- **Blocks**: Task 19
- **Blocked By**: Tasks 1b (Tag Library), 6 (Beats), 7 (Tag Extraction)

**References**:
- Task 1b: Tag Library
- Task 6: Beats
- Task 7: Tag Extraction
- Research: Cultural analytics sentiment trajectory, character arc extraction

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: DNA signatures calculated for all entities
  Tool: Bash (python)
  Steps:
    1. Load data/derived/signatures.json
    2. Count signatures by type
    3. Assert: 7 mythos signatures
    4. Assert: 10 character signatures
    5. Assert: 7 episode signatures
    6. Assert: All signatures have tag_signature with frequencies
  Expected Result: Signatures for all major entities
  Evidence: Signature coverage report

Scenario: Tag frequencies sum appropriately
  Tool: Bash (python)
  Steps:
    1. Sample 5 random signatures
    2. For each tag category:
       - Sum all tag frequencies
       - Assert: Sum <= 1.0 (normalized)
    3. Verify: No negative frequencies
    4. Verify: All tags exist in Tag Library
  Expected Result: Valid normalized signatures
  Evidence: Frequency validation output

Scenario: API returns signature comparison
  Tool: Bash (curl)
  Steps:
    1. GET /api/dna/compare?entity=kiara-natt-och-dag
    2. Assert: Response has bst_signature and sst_signature
    3. Assert: Response has mutation_analysis
    4. Assert: Can compare any two versions
    5. Verify: Response includes evolution_curve
  Expected Result: API provides signature comparison
  Evidence: DNA comparison API response
```

**Commit**: YES
- Message: `feat(dna): build narrative DNA visualizer with tag signatures`
- Files: `data/derived/signatures.json`, `backend/src/dna/signatures.py`, `backend/src/api/dna.py`
- Pre-commit: `cd backend && ruff check . && python -c "from backend.src.dna.signatures import validate_signatures; validate_signatures()"`

---

### Task 17: Create Serendipity Engine [NEW EXTRAORDINARY TASK]

**What to do**:
Build the Serendipity Engine for unexpected connection discovery:
1. Design Serendipity Suggestion schema (connection type, reason, strength, surprise)
2. Calculate connection types:
   - Direct link (explicitly connected)
   - Shared connection (both connect to same third node)
   - Semantic similarity (similar tag signatures)
   - Temporal proximity (events around same time)
   - Thematic resonance (similar themes)
3. Rank by "surprise factor" (unexpected = higher delight)
4. Generate "You might also be interested in..." suggestions
5. Export to `data/derived/serendipity_index.json`
6. Create API for dynamic suggestions

**Serendipity Suggestion Structure**:
```json
{
  "suggestion_id": "serendip-001",
  "from_entity": "kiara-natt-och-dag",
  "to_entity": "family_hierarchy",
  "type": "thematic_resonance",
  "reason": "Both explore themes of inheritance and rebellion",
  "strength": 0.78,
  "is_surprising": true,
  "explanation": "Kiara's personal rebellion mirrors the family's struggle with hierarchy",
  "discovery_path": ["kiara-natt-och-dag", "blood_bond", "family_hierarchy"]
}
```

**Must NOT do**:
- Do NOT suggest obvious connections (filter by surprise factor)
- Do NOT use embeddings/ML for similarity (tag-based only in v1)
- Do NOT overwhelm with suggestions (max 5-7 per view)

**Recommended Agent Profile**:
- **Category**: `artistry` (creative pattern matching)
- **Skills**: None required
- **Reasoning**: Requires identifying non-obvious but meaningful connections

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 14, 16)
- **Parallel Group**: Wave 4
- **Blocks**: Task 19
- **Blocked By**: Tasks 14 (Inspiration Graph), 16 (DNA Signatures)

**References**:
- Task 14: Inspiration Graph
- Task 16: DNA Signatures
- Research: Obsidian/Roam discovery features, "connected thought" patterns

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Serendipity suggestions exist for major entities
  Tool: Bash (python)
  Steps:
    1. Load data/derived/serendipity_index.json
    2. Count suggestions per entity
    3. Assert: Each major entity has 3-10 suggestions
    4. Verify: All suggestion types represented
    5. Assert: Average surprise factor > 0.5
  Expected Result: Rich serendipity coverage
  Evidence: Serendipity distribution report

Scenario: Suggestions filter by surprise
  Tool: Bash (python)
  Steps:
    1. Query suggestions for entity X
    2. Filter by is_surprising = true
    3. Assert: Returns only surprising connections
    4. Verify: Surprising connections are non-obvious
    5. Assert: Obvious connections filtered out
  Expected Result: Quality over quantity
  Evidence: Surprise filtering test

Scenario: API returns contextual suggestions
  Tool: Bash (curl)
  Steps:
    1. GET /api/serendipity?entity=kiara-natt-och-dag&limit=5
    2. Assert: Response status 200
    3. Assert: Returns 5 suggestions
    4. Assert: Each has type, reason, strength, is_surprising
    5. Assert: Suggestions ordered by strength × surprise
  Expected Result: API provides ranked suggestions
  Evidence: Serendipity API response
```

**Commit**: YES
- Message: `feat(serendipity): create engine for unexpected connection discovery`
- Files: `data/derived/serendipity_index.json`, `backend/src/serendipity/engine.py`, `backend/src/api/serendipity.py`
- Pre-commit: `cd backend && ruff check . && pytest tests/test_serendipity.py -v`

---

### Task 18: Build Temporal Navigator [NEW EXTRAORDINARY TASK] ✅

**What to do**:
Create the Temporal Navigator for episode/scene/moment hierarchy with branching:
1. Design temporal hierarchy: Season → Episode → Scene → Moment
2. Create zoomable timeline visualization
3. Show character presence as lanes (like GitHub contribution graph)
4. Display intensity curves (erotic/horror/drama over time)
5. Show branch indicators where alternates exist
6. Support filtering by character, tag, intensity
7. Export hierarchy to `data/derived/temporal_index.json`
8. Build interactive timeline component

**Temporal Index Structure**:
```json
{
  "seasons": [
    {
      "season_id": "s01",
      "episodes": [
        {
          "episode_id": "s01e01",
          "scenes": [
            {
              "scene_id": "s01e01-sc001",
              "start_time": "00:00:00",
              "end_time": "00:02:30",
              "moments": ["m-0001", "m-0002"],
              "characters_present": ["kiara-natt-och-dag", "alfred"],
              "intensity": { "erotic": 0.2, "horror": 0.1, "drama": 0.4 },
              "tags": ["introduction", "first_meeting"],
              "has_branches": false
            }
          ],
          "cumulative_intensity": { "erotic": 0.3, "horror": 0.2, "drama": 0.6 }
        }
      ]
    }
  ]
}
```

**Must NOT do**:
- Do NOT show SST branches until SST content exists
- Do NOT auto-scroll (user controls navigation)
- Do NOT lose context when zooming (show breadcrumbs)

**Recommended Agent Profile**:
- **Category**: `visual-engineering` (complex UI component)
- **Skills**: `frontend-ui-ux`
- **Reasoning**: Requires sophisticated timeline visualization with D3 or similar

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 6, 7)
- **Parallel Group**: Wave 4
- **Blocks**: Task 19
- **Blocked By**: Tasks 6 (Beats), 7 (Tag Extraction)

**References**:
- Task 6: Beats
- Task 7: Tag Extraction
- `/Users/wolfy/Developer/2026.Y/bats/data/character_presence.json` - Character presence data
- Research: Notion timeline view, GitHub contribution graphs, interactive fiction timelines

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Temporal index covers all content
  Tool: Bash (python)
  Steps:
    1. Load data/derived/temporal_index.json
    2. Count episodes, scenes, moments
    3. Assert: 7 episodes
    4. Assert: 70+ scenes
    5. Assert: All 1698 moments linked
    6. Verify: All timestamps are valid and sequential
  Expected Result: Complete temporal coverage
  Evidence: Temporal coverage report

Scenario: Character presence data accurate
  Tool: Bash (python)
  Steps:
    1. Sample 10 random scenes
    2. For each, verify characters_present against video_analysis
    3. Assert: All characters in scene were present in moments
    4. Assert: No characters missing from scene data
  Expected Result: Accurate character presence
  Evidence: Presence validation report

Scenario: Timeline component renders correctly
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /timeline
    2. Assert: Timeline component visible
    3. Assert: Shows all 7 episodes
    4. Click: Episode 1
    5. Assert: Zooms to show scenes
    6. Assert: Character lanes visible
    7. Screenshot: .sisyphus/evidence/task-18-timeline.png
  Expected Result: Interactive timeline works
  Evidence: Timeline screenshot

Scenario: Filtering works on timeline
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /timeline
    2. Select filter: character = "kiara-natt-och-dag"
    3. Assert: Timeline highlights Kiara's presence
    4. Select filter: tag = "seduction"
    5. Assert: Timeline shows only moments with seduction tag
    6. Clear filters
    7. Assert: Full timeline restored
  Expected Result: Filtering functional
  Evidence: Filtered timeline screenshot
```

**Commit**: YES
- Message: `feat(temporal): build temporal navigator with hierarchy and branching`
- Files: `data/derived/temporal_index.json`, `frontend/components/TemporalNavigator.tsx`, `frontend/lib/temporalHierarchy.ts`
- Pre-commit: `cd frontend && bun run lint && bun run typecheck`

---

### Task 19: Implement Creative Companion Panel [NEW EXTRAORDINARY TASK]

**What to do**:
Create the integrated Creative Companion Panel that appears on all entity pages:
1. Design panel layout: Mutation Cards | Ripple Preview | Prompt Deck | Inspiration
2. Implement tabbed interface within panel
3. Show contextual content based on current entity
4. Add "Forge" button to open panel from any page
5. Implement glassmorphic dark theme styling
6. Ensure responsive design (collapsible on mobile)
7. Add animation for panel open/close
8. Persist panel state (open/closed, active tab)

**Panel Sections**:
- **Mutations**: 3-7 cards for current entity
- **Ripples**: Top 5 downstream effects
- **Prompts**: 5-10 relevant writing prompts
- **Inspiration**: Activated nodes from Inspiration Graph
- **Serendipity**: 3-5 surprising connections

**Must NOT do**:
- Do NOT block main content (panel is sidebar/drawer)
- Do NOT auto-open on every page (respect user preference)
- Do NOT show empty sections (hide if no content)

**Recommended Agent Profile**:
- **Category**: `visual-engineering` (complex integrated UI)
- **Skills**: `frontend-ui-ux`, `heroui`
- **Reasoning**: Requires sophisticated React component with multiple sub-components

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 11-18)
- **Parallel Group**: Wave 5
- **Blocks**: None
- **Blocked By**: Tasks 11-18 (All Creative Features)

**References**:
- Tasks 11-18: All creative features
- `/Users/wolfy/Developer/2026.Y/bats/frontend/components/MythosVisualEncyclopedia.tsx` - Integration point
- `/Users/wolfy/Developer/2026.Y/bats/frontend/app/globals.css` - Styling patterns
- Research: NovelAI Lorebook UI, Sudowrite interface patterns

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Creative Companion panel appears on entity pages
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /mythos/vampire_physiology
    2. Assert: "Forge" button visible
    3. Click: Forge button
    4. Assert: Creative Companion panel opens
    5. Assert: Panel shows Mutation Cards tab by default
    6. Assert: Cards relevant to vampire_physiology displayed
    7. Screenshot: .sisyphus/evidence/task-19-panel.png
  Expected Result: Panel opens with contextual content
  Evidence: Panel screenshot

Scenario: Panel tabs switch correctly
  Tool: Playwright (playwright skill)
  Steps:
    1. Open Creative Companion panel
    2. Click: Ripples tab
    3. Assert: Shows ripple preview for current entity
    4. Click: Prompts tab
    5. Assert: Shows relevant writing prompts
    6. Click: Inspiration tab
    7. Assert: Shows activated inspiration nodes
    8. Screenshot: .sisyphus/evidence/task-19-tabs.png
  Expected Result: All tabs functional
  Evidence: Tab switching screenshot

Scenario: Panel content contextual to current entity
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /characters/kiara-natt-och-dag
    2. Open Creative Companion
    3. Assert: Mutation cards about Kiara
    4. Navigate to /episodes/s01e01
    5. Open Creative Companion
    6. Assert: Content relevant to episode 1
    7. Assert: No Kiara-specific cards shown
  Expected Result: Content changes with entity
  Evidence: Contextual content screenshots

Scenario: Panel state persists
  Tool: Playwright (playwright skill)
  Steps:
    1. Open panel, switch to Prompts tab
    2. Navigate to different page
    3. Return to original page
    4. Assert: Panel still open
    5. Assert: Still on Prompts tab
    6. Refresh page
    7. Assert: Panel state restored from localStorage
  Expected Result: State persistence works
  Evidence: State persistence test
```

**Commit**: YES
- Message: `feat(ui): implement creative companion panel with forge integration`
- Files: `frontend/components/CreativeCompanionPanel.tsx`, `frontend/components/ForgeButton.tsx`, `frontend/lib/creativeContext.tsx`, `frontend/styles/creative-panel.css`
- Pre-commit: `cd frontend && bun run lint && bun run typecheck && playwright test tests/creative-panel.spec.ts`

---

### Task 20: Create Graph Visualization [NEW EXTRAORDINARY TASK]

**What to do**:
Build the force-directed graph visualization for relationship exploration:
1. Extend existing LoreConnectionGraph with new features
2. Add node types: characters, mythos, episodes, beats, inspiration nodes
3. Color-code by type and narrative version (BST=blue, SST=red, Both=purple)
4. Add edge types: causal, inspirational, temporal, thematic
5. Implement filtering by type, tag, intensity
6. Add "focus mode": click node to see local neighborhood
7. Show node details on hover/click
8. Support zoom, pan, reset view
9. Add "discover" button for serendipitous navigation

**Graph Features**:
- **Physics**: Force-directed with adjustable gravity
- **Clustering**: Auto-detect and highlight communities
- **Animation**: Smooth transitions when filtering
- **Export**: Save current view as image
- **Share**: Generate link to current graph state

**Must NOT do**:
- Do NOT show all 1698 moments at once (aggregate or filter)
- Do NOT block UI during graph layout (use web worker)
- Do NOT lose user position on data updates

**Recommended Agent Profile**:
- **Category**: `visual-engineering` (D3.js graph visualization)
- **Skills**: `frontend-ui-ux`
- **Reasoning**: Requires advanced D3.js force simulation and interaction design

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Tasks 14, 17)
- **Parallel Group**: Wave 5
- **Blocks**: None
- **Blocked By**: Tasks 14 (Inspiration Graph), 17 (Serendipity Engine)

**References**:
- Task 14: Inspiration Graph
- Task 17: Serendipity Engine
- `/Users/wolfy/Developer/2026.Y/bats/frontend/components/LoreConnectionGraph.tsx` - Base component
- `/Users/wolfy/Developer/2026.Y/bats/frontend/lib/orthogonalConnector.ts` - Connection patterns
- Research: Obsidian graph view, D3.js force simulation best practices

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Graph renders with all node types
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /graph
    2. Assert: Graph canvas visible
    3. Assert: Nodes rendered for characters, mythos, episodes
    4. Assert: Different colors for different node types
    5. Assert: Edges show relationships between nodes
    6. Screenshot: .sisyphus/evidence/task-20-graph.png
  Expected Result: Full graph visualization
  Evidence: Graph screenshot

Scenario: Graph filtering works
  Tool: Playwright (playwright skill)
  Steps:
    1. Open graph view
    2. Click: Filter by type = "characters only"
    3. Assert: Only character nodes visible
    4. Click: Filter by tag = "blood_as_ritual"
    5. Assert: Only nodes with that tag visible
    6. Clear filters
    7. Assert: Full graph restored
  Expected Result: Filtering functional
  Evidence: Filtered graph screenshot

Scenario: Focus mode shows local neighborhood
  Tool: Playwright (playwright skill)
  Steps:
    1. Open graph view
    2. Click: Node "kiara-natt-och-dag"
    3. Assert: Focus mode activated
    4. Assert: Kiara node highlighted
    5. Assert: Connected nodes visible
    6. Assert: Unconnected nodes dimmed/hidden
    7. Click: Reset view
    8. Assert: Full graph restored
  Expected Result: Focus mode works
  Evidence: Focus mode screenshot

Scenario: Serendipity discovery from graph
  Tool: Playwright (playwright skill)
  Steps:
    1. Open graph view
    2. Click: "Discover" button
    3. Assert: Graph animates to surprising connection
    4. Assert: Shows path from current view to discovery
    5. Assert: Displays explanation of connection
  Expected Result: Serendipitous discovery works
  Evidence: Discovery animation screenshot
```

**Commit**: YES
- Message: `feat(ui): create enhanced graph visualization with discovery features`
- Files: `frontend/components/EnhancedGraphView.tsx`, `frontend/lib/graphEngine.ts`, `frontend/lib/graphFilters.ts`
- Pre-commit: `cd frontend && bun run lint && bun run typecheck`

---

### Task 11: Add Consistency Validation

**What to do**:
1. Create consistency validation rules:
   - ID existence checks
   - Timestamp format validation
   - No dangling references
   - No self-causal loops
   - Temporal consistency (causes before effects)
2. Implement validation runner
3. Generate validation reports
4. Add validation to build/startup process
5. Create fix suggestions for common issues

**Must NOT do**:
- Do NOT implement full consistency solver (keep it lightweight)
- Do NOT auto-fix without user confirmation
- Do NOT block startup on validation warnings (only errors)

**Recommended Agent Profile**:
- **Category**: `unspecified-medium` (validation logic)
- **Skills**: None required
- **Reasoning**: Straightforward validation rules implementation

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 9, 10)
- **Blocks**: None
- **Blocked By**: Task 2

**References**:
- All data files from Tasks 3-8
- `/Users/wolfy/Developer/2026.Y/bats/backend/src/data.py` - Data loading patterns

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Validation catches missing references
  Tool: Bash (python)
  Steps:
    1. Create test data with dangling reference
    2. Run validation
    3. Assert: Validation reports error for dangling reference
    4. Assert: Error includes specific ID and location
    5. Fix the reference
    6. Assert: Validation passes
  Expected Result: Validation detects and reports dangling references
  Evidence: Validation output showing error detection

Scenario: Validation catches self-referential edges
  Tool: Bash (python)
  Steps:
    1. Create test causality edge with from==to
    2. Run validation
    3. Assert: Validation reports self-reference error
    4. Remove self-reference
    5. Assert: Validation passes
  Expected Result: Validation prevents self-referential edges
  Evidence: Validation output

Scenario: Validation checks temporal consistency
  Tool: Bash (python)
  Steps:
    1. Create causality edge where effect timestamp < cause timestamp
    2. Run validation
    3. Assert: Validation reports temporal inconsistency
    4. Assert: Error message explains the issue
  Expected Result: Validation enforces causes before effects
  Evidence: Temporal validation output
```

**Commit**: YES
- Message: `feat(validation): add consistency validation for narrative data`
- Files: `backend/src/validation/consistency.py`, `scripts/validate_data.py`
- Pre-commit: `cd backend && ruff check . && python -m pytest tests/test_validation.py -v`

---

### Task 12: Implement Narrative Mode UI

**What to do**:
1. Create NarrativeMode context/provider for React
2. Implement global narrative mode toggle (BST/SST/Both)
3. Update existing components to respect narrative mode:
   - MythosVisualEncyclopedia
   - Character pages
   - Episode pages
4. Add narrative mode indicator in UI
5. Persist mode preference in localStorage
6. Handle mode switching gracefully

**Must NOT do**:
- Do NOT force page reload on mode switch (use React state)
- Do NOT show SST content if empty (show placeholder)
- Do NOT break existing UI functionality

**Recommended Agent Profile**:
- **Category**: `visual-engineering` (React UI development)
- **Skills**: `frontend-ui-ux`, `heroui`
- **Reasoning**: Requires React context, state management, and HeroUI component integration

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Task 10)
- **Parallel Group**: Sequential
- **Blocks**: Task 13
- **Blocked By**: Task 10

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/frontend/lib/theme.ts` - Context pattern example
- `/Users/wolfy/Developer/2026.Y/bats/frontend/components/MythosVisualEncyclopedia.tsx` - Component to update
- `/Users/wolfy/Developer/2026.Y/bats/frontend/lib/api.ts` - API client

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Narrative mode toggle exists and works
  Tool: Playwright (playwright skill)
  Preconditions: Frontend running on port 6699
  Steps:
    1. Navigate to http://localhost:6699/mythos
    2. Assert: Narrative mode toggle is visible
    3. Click: BST mode option
    4. Assert: Content updates to show BST version
    5. Click: SST mode option
    6. Assert: Content updates (or shows placeholder if empty)
    7. Click: Both mode option
    8. Assert: Content shows comparison view
    9. Screenshot: .sisyphus/evidence/task-12-toggle.png
  Expected Result: Toggle switches between modes correctly
  Evidence: Screenshot of toggle in action

Scenario: Narrative mode persists across pages
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /mythos
    2. Set mode to SST
    3. Navigate to /characters
    4. Assert: Mode is still SST (indicator shows SST)
    5. Navigate to /episodes
    6. Assert: Mode is still SST
    7. Refresh page
    8. Assert: Mode persists (from localStorage)
  Expected Result: Mode persists across navigation and refresh
  Evidence: Screenshot showing persistent mode indicator

Scenario: Components filter content by narrative mode
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /mythos/vampire_physiology
    2. Set mode to BST
    3. Assert: Shows BST description
    4. Assert: Does not show SST dark_variant
    5. Set mode to SST
    6. Assert: Shows SST content (or placeholder)
    7. Set mode to Both
    8. Assert: Shows both versions with comparison
    9. Screenshot: .sisyphus/evidence/task-12-filtering.png
  Expected Result: Content filters correctly by mode
  Evidence: Screenshots of different modes
```

**Commit**: YES
- Message: `feat(ui): implement narrative mode toggle and context`
- Files: `frontend/lib/narrativeMode.tsx`, `frontend/components/NarrativeModeToggle.tsx`, updates to existing components
- Pre-commit: `cd frontend && bun run lint && bun run typecheck`

---

### Task 13: Create Comparison Views

**What to do**:
1. Create ComparisonDrawer component for side-by-side viewing
2. Implement divergence highlighting
3. Add evidence links in comparison view
4. Create ComparisonCard for compact display
5. Add comparison view to detail pages (mythos, characters)
6. Implement "Compare" button that opens drawer
7. Add diff visualization for text differences

**Must NOT do**:
- Do NOT show comparison by default (user must request it)
- Do NOT clutter UI with comparison elements
- Do NOT implement complex diff algorithms (simple text diff is fine)

**Recommended Agent Profile**:
- **Category**: `visual-engineering` (complex UI components)
- **Skills**: `frontend-ui-ux`, `heroui`
- **Reasoning**: Requires sophisticated UI components with drawer, highlighting, and diff visualization

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Task 12)
- **Parallel Group**: Sequential
- **Blocks**: None (final task)
- **Blocked By**: Task 12

**References**:
- `/Users/wolfy/Developer/2026.Y/bats/frontend/components/MythosVisualEncyclopedia.tsx` - Component patterns
- `/Users/wolfy/Developer/2026.Y/bats/frontend/app/globals.css` - Styling patterns
- Research: NovelAI Lorebook UI patterns for comparison

**Acceptance Criteria**:

**Agent-Executed QA Scenarios:**

```
Scenario: Comparison drawer opens and shows divergences
  Tool: Playwright (playwright skill)
  Preconditions: Task 12 complete
  Steps:
    1. Navigate to /mythos/vampire_physiology
    2. Click: "Compare" button
    3. Assert: Comparison drawer opens
    4. Assert: Drawer shows BST version on left
    5. Assert: Drawer shows SST version on right (or placeholder)
    6. Assert: Divergences section lists differences
    7. Assert: Each divergence has kind, bst, sst fields
    8. Screenshot: .sisyphus/evidence/task-13-drawer.png
  Expected Result: Comparison drawer displays divergences
  Evidence: Screenshot of comparison drawer

Scenario: Evidence links work in comparison view
  Tool: Playwright (playwright skill)
  Steps:
    1. Open comparison drawer for a mythos element
    2. Find a divergence with evidence links
    3. Click: Evidence link
    4. Assert: Navigates to episode/moment reference
    5. Assert: Shows evidence context (quote, screenshot)
  Expected Result: Evidence links navigate correctly
  Evidence: Screenshot showing evidence view

Scenario: Comparison card shows compact diff
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to /mythos (encyclopedia view)
    2. Set mode to "Both"
    3. Assert: Cards show comparison indicators
    4. Hover over comparison indicator
    5. Assert: Tooltip shows key differences
    6. Click: Card to open detail
    7. Assert: Detail page has "Compare" button
    8. Screenshot: .sisyphus/evidence/task-13-card.png
  Expected Result: Comparison indicators visible in encyclopedia
  Evidence: Screenshot of comparison card
```

**Commit**: YES
- Message: `feat(ui): create comparison views with divergence highlighting`
- Files: `frontend/components/ComparisonDrawer.tsx`, `frontend/components/ComparisonCard.tsx`, `frontend/components/DivergenceList.tsx`
- Pre-commit: `cd frontend && bun run lint && bun run typecheck`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `feat(mythos): add NarrativeVersion enum and ID utilities` | `backend/src/models.py`, `backend/src/utils/id_generator.py` | `ruff check .` |
| 3 | `feat(mythos): extend YAML with dual-narrative versions structure` | `data/mythos/*.yaml`, `backend/src/data.py` | Loader test |
| 4 | `feat(characters): extend YAML with dual-narrative versions structure` | `data/characters/*.yaml`, `backend/src/data.py` | API test |
| 5 | `feat(narrative): create BST beats segmentation from transcripts` | `data/narratives/bst/beats.json`, `scripts/extract_beats.py` | Validation script |
| 6 | `feat(narrative): create alignment registry for BST-SST mapping` | `data/narratives/alignment.json`, `backend/src/models.py` | Schema validation |
| 7 | `feat(causality): create causality edges system for narrative tracking` | `data/causality/edges.json`, `backend/src/models.py` | Edge validation |
| 8 | `feat(knowledge): create claims database from narrative sources` | `data/knowledge/claims.json`, `scripts/extract_claims.py` | Claims validation |
| 9 | `feat(pipeline): build unified knowledge extraction pipeline` | `scripts/run_extraction_pipeline.py`, `scripts/validate_extractions.py` | Pipeline execution |
| 10 | `feat(api): implement dual-narrative endpoints with comparison support` | `backend/src/api/narratives.py`, `backend/src/api/causality.py`, `backend/src/api/knowledge.py` | `pytest -v` |
| 11 | `feat(validation): add consistency validation for narrative data` | `backend/src/validation/consistency.py`, `scripts/validate_data.py` | Validation tests |
| 12 | `feat(ui): implement narrative mode toggle and context` | `frontend/lib/narrativeMode.tsx`, `frontend/components/NarrativeModeToggle.tsx` | `bun run typecheck` |
| 13 | `feat(ui): create comparison views with divergence highlighting` | `frontend/components/ComparisonDrawer.tsx`, `frontend/components/ComparisonCard.tsx` | Playwright tests |

---

## Success Criteria

### Verification Commands

```bash
# Backend validation
cd backend && pytest -v

# Data validation
python scripts/validate_data.py

# API health check
curl http://localhost:8000/api/mythos?narrative=both | jq '. | length'

# Frontend build
cd frontend && bun run build

# Full pipeline test
python scripts/run_extraction_pipeline.py --validate
```

### Final Checklist

- [ ] All 7 mythos YAML files have versions.bst and versions.sst fields
- [ ] All 10 character YAML files have versions.bst and versions.sst fields
- [ ] Beats file exists with 70+ beat records
- [ ] Alignment registry exists with 70+ unmapped records
- [ ] Causality edges file exists with 50+ edges
- [ ] Claims database exists with 200+ claims
- [ ] API supports `?narrative=bst|sst|both` query parameter
- [ ] Comparison endpoint returns divergence data
- [ ] Causality graph endpoint returns nodes and edges
- [ ] Frontend has working narrative mode toggle
- [ ] Comparison drawer shows divergences with evidence
- [ ] All validation checks pass
- [ ] No breaking changes to existing API
- [ ] All tests pass (pytest)

### Out of Scope (v1) - DO NOT IMPLEMENT

- [ ] Automated SBERT/Smith-Waterman alignment
- [ ] Automated causal inference engine
- [ ] Full consistency solver with rule engine
- [ ] Collaborative editing / CRDT
- [ ] Graph database (Neo4j)
- [ ] Embeddings infrastructure
- [ ] Auto-generation of SST content from BST
- [ ] Side-by-side comparison on all pages (drawer only for v1)
- [ ] Branching timeline visualization
- [ ] Real-time collaboration

---

## Appendix: Data Schema Reference

### Extended MythosElement YAML Structure

```yaml
id: vampire_physiology
category: biology
versions:
  bst:
    description: "Canonical vampire biology..."
    traits: ["immortal", "blood-dependent"]
    abilities: ["enhanced strength", "heightened senses"]
    weaknesses: ["sunlight", "stake through heart"]
    evidence:
      - { episode_id: "s01e03", timestamp: "00:12:34", moment_id: "m-0123" }
  sst:
    description: null  # To be authored
    traits: []
    abilities: []
    weaknesses: []
divergences:
  - kind: "tone"
    bst: "subtle coercion implied"
    sst: null
    status: "hypothesis"
    notes: "SST will explore explicit compulsion mechanics"
```

### Beat Structure

```json
{
  "beat_id": "beat-s01e01-001",
  "episode_id": "s01e01",
  "start_time": "00:00:00",
  "end_time": "00:02:30",
  "characters": ["kiara-natt-och-dag", "alfred"],
  "moments": ["m-0001", "m-0002"],
  "summary": "Kiara arrives at school and meets Alfred",
  "location": "school",
  "tags": ["introduction", "first_meeting"]
}
```

### Causal Edge Structure

```json
{
  "edge_id": "edge-0001",
  "version": "bst",
  "from_moment_id": "m-0045",
  "to_moment_id": "m-0060",
  "type": "motivates",
  "stac": {
    "situation": "Kiara feels isolated at school",
    "task": "Find acceptance",
    "action": "Kiara joins the Batgirls",
    "consequence": "Kiara gains social standing but risks exposure"
  },
  "mechanism_refs": ["vampire_physiology", "social_hierarchy"],
  "confidence": 0.85,
  "evidence": [
    { "episode_id": "s01e01", "timestamp": "00:15:20" }
  ]
}
```

### Claim Structure

```json
{
  "claim_id": "claim-0001",
  "type": "rule",
  "subject": "vampire_physiology",
  "predicate": "requires",
  "object": "blood consumption",
  "canon_layer": "bst",
  "confidence": 0.95,
  "evidence": [
    {
      "source_type": "episode",
      "source_id": "s01e03",
      "timestamp": "00:12:34",
      "moment_id": "m-0123",
      "quote": "I need blood. It's not optional.",
      "screenshot_path": "screenshots/s01e03_moment_123_00:12:34.jpg"
    }
  ],
  "derived_from": []
}
```

---

*Plan generated by Prometheus with guidance from Metis, Oracle, and research agents.*
*Architecture validated against file-based system constraints and scalability requirements.*
