# Work Plan: Blod, Svett, Tårar Dark Adaptation Knowledge Base

## TL;DR

> **Quick Summary**: Build a comprehensive living wiki and narrative bible for adapting the Swedish YA vampire series *Blod svett tårar* into a dark, explicit, boundary-pushing narrative. The system will track canonical source material alongside dark adaptations using HeroUI v3 frontend and Python/FastAPI backend.
> 
> **Deliverables**:
> - HeroUI v3 wiki interface with cross-reference visualization
> - Python/FastAPI backend with graph database for relationships
> - Structured data import system for transcripts and mythos
> - Comparison matrices (Original vs. Adaptation)
> - Dark tone adaptation guidelines and frameworks
> 
> **Estimated Effort**: Large (multi-phase, 2-3 weeks)
> **Parallel Execution**: YES - Frontend, Backend, and Data Processing can run in parallel after foundation
> **Critical Path**: Data Structure Design → Transcript Import → Backend API → Frontend Wiki

---

## Context

### Original Request
User wants to create a thorough knowledge base for adapting *Blod svett tårar* (Swedish YA vampire TV series, 2026) into a dark, highly erotic novel. The adaptation has explicit creative freedom including taboo elements (incest, extreme power dynamics) while maintaining YA accessibility. Target market is mid-to-upper YA under Sweden editorial standards allowing X-rated content.

### Interview Summary
**Key Discussions**:
- **Content Scope**: 7/8 episodes available (8th pending), complete creative freedom with "Stephen King × del Toro × GRRM writing unrestricted YA" mandate
- **Explicit Content**: X-rated allowed and expected, including incest, extreme power dynamics, body horror
- **Technical Requirements**: HeroUI v3 (latest beta), Bun package manager, Python with uv if used
- **Deliverable Format**: Living document/wiki with cross-references, narrative bible structure
- **Visual Assets**: Screenshots, character refs, branding materials to be provided for accurate design replication

**Research Findings**:
- *Blod svett tårar* (2026): Swedish YA vampire drama, 8 episodes, 7.0/10 IMDb
- Premise: Kiara Natt och Dag, raised in strict vampire family, wants normal teen life
- Cast: Filippa Kavalic (Kiara), Aaron Holgersson (Alfred), Elsa Östlind (Elise), Olle Sarri (Henry/father)
- HeroUI v3: 50 compound components, Tailwind v4, no Provider needed, React Aria based

---

## Work Objectives

### Core Objective
Create a comprehensive knowledge base system that can ingest episode transcripts, catalog canonical mythos/characters/lore, and track adaptations into darker, explicit territory while maintaining narrative coherence and providing cross-reference capabilities.

### Concrete Deliverables
1. **Frontend Wiki Application** (Next.js + HeroUI v3)
   - Episode browser with scene breakdowns
   - Character profile pages (dual canonical/adaptation view)
   - Mythos/lore encyclopedia with expansion tracking
   - Cross-reference graph visualization
   - Comparison matrices (Original vs. Adaptation)
   - Search and filter systems

2. **Backend API** (Python/FastAPI + uv)
   - RESTful endpoints for all entities
   - Graph database for relationships
   - Full-text search for transcripts
   - Data validation and versioning
   - Import pipelines for transcripts

3. **Data Architecture**
   - Structured YAML/JSON schemas for all entities
   - Transcript parsing and scene extraction
   - Relationship mapping system
   - Version control integration

4. **Documentation**
   - Dark tone adaptation guidelines
   - Erotic content integration framework
   - Taboo element handling guidelines
   - YA accessibility maintenance rules

### Definition of Done
- [ ] All 7 episodes imported and browseable
- [ ] Character profiles created for all main cast
- [ ] Cross-reference system functional (graph visualization)
- [ ] Comparison views working (Original vs. Adaptation)
- [ ] Search returns relevant results across all content
- [ ] Wiki is visually consistent with series branding (fonts, colors)
- [ ] Backend API serves all data correctly
- [ ] Documentation complete for adaptation guidelines

### Must Have
- Episode-by-episode transcript breakdown
- Character dual-tracking (canonical + adaptation)
- Vampire mythos expansion documentation
- Cross-reference graph with relationship types
- Search functionality across all content
- Dark/light mode theming
- Mobile-responsive design

### Must NOT Have (Guardrails)
- NO actual explicit content generation (this is a planning/reference tool)
- NO AI-generated creative writing (user is the author)
- NO public deployment without content warnings
- NO automatic adaptation generation (manual curation only)
- NO copyright infringement (user has IP permission)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (greenfield project)
- **Automated tests**: Tests-after (not TDD due to exploratory nature)
- **Framework**: bun test (frontend), pytest (backend)

### Agent-Executed QA Scenarios (MANDATORY)

**Scenario 1: Wiki Homepage Loads**
Tool: Playwright (playwright skill)
Preconditions: Frontend dev server running on localhost:3000
Steps:
  1. Navigate to: http://localhost:3000
  2. Wait for: main content visible (timeout: 5s)
  3. Assert: Page title contains "Blod, Svett, Tårar"
  4. Assert: Navigation menu visible with "Episodes", "Characters", "Mythos"
  5. Assert: Dark mode toggle present
  6. Screenshot: .sisyphus/evidence/wiki-homepage.png
Expected Result: Wiki homepage loads with navigation and theming
Evidence: .sisyphus/evidence/wiki-homepage.png

**Scenario 2: Episode Browser Functionality**
Tool: Playwright (playwright skill)
Preconditions: Episodes imported, dev server running
Steps:
  1. Navigate to: http://localhost:3000/episodes
  2. Wait for: episode list visible (timeout: 5s)
  3. Assert: At least 7 episodes displayed
  4. Click: First episode card
  5. Wait for: episode detail page (timeout: 3s)
  6. Assert: Scene breakdown visible
  7. Assert: Character list for episode visible
  8. Screenshot: .sisyphus/evidence/episode-detail.png
Expected Result: Episode list and detail views functional
Evidence: .sisyphus/evidence/episode-detail.png

**Scenario 3: Character Profile Dual View**
Tool: Playwright (playwright skill)
Preconditions: Character data imported
Steps:
  1. Navigate to: http://localhost:3000/characters/kiara
  2. Wait for: character profile visible (timeout: 5s)
  3. Assert: "Canonical" tab content visible
  4. Click: "Adaptation" tab
  5. Wait for: adaptation content (timeout: 2s)
  6. Assert: Dark adaptation notes visible
  7. Assert: Cross-references section visible
  8. Screenshot: .sisyphus/evidence/character-dual-view.png
Expected Result: Character dual-view (canonical/adaptation) functional
Evidence: .sisyphus/evidence/character-dual-view.png

**Scenario 4: Cross-Reference Graph**
Tool: Playwright (playwright skill)
Preconditions: Relationship data imported
Steps:
  1. Navigate to: http://localhost:3000/graph
  2. Wait for: graph visualization (timeout: 10s)
  3. Assert: Nodes visible (characters, locations, episodes)
  4. Assert: Edges visible (relationships)
  5. Click: A character node
  6. Assert: Node details panel opens
  7. Assert: Related entities listed
  8. Screenshot: .sisyphus/evidence/cross-reference-graph.png
Expected Result: Interactive graph visualization functional
Evidence: .sisyphus/evidence/cross-reference-graph.png

**Scenario 5: Search Functionality**
Tool: Playwright (playwright skill)
Preconditions: Search index built
Steps:
  1. Navigate to: http://localhost:3000
  2. Click: Search input
  3. Type: "Kiara"
  4. Wait for: search results (timeout: 3s)
  5. Assert: Results contain character "Kiara"
  6. Assert: Results contain episodes mentioning Kiara
  7. Click: First result
  8. Assert: Navigated to correct page
  9. Screenshot: .sisyphus/evidence/search-results.png
Expected Result: Full-text search returns relevant results
Evidence: .sisyphus/evidence/search-results.png

**Scenario 6: Backend API Health**
Tool: Bash (curl)
Preconditions: Backend server running on localhost:8000
Steps:
  1. curl -s http://localhost:8000/health
  2. Assert: HTTP status 200
  3. Assert: Response contains "status": "healthy"
  4. curl -s http://localhost:8000/api/episodes
  5. Assert: HTTP status 200
  6. Assert: Response is valid JSON array
  7. Assert: Array length >= 7
Expected Result: Backend API serves data correctly
Evidence: Terminal output captured

**Scenario 7: Dark Mode Toggle**
Tool: Playwright (playwright skill)
Preconditions: Frontend running
Steps:
  1. Navigate to: http://localhost:3000
  2. Wait for: page load (timeout: 3s)
  3. Assert: Light mode default (or system preference)
  4. Click: Dark mode toggle button
  5. Wait for: theme transition (timeout: 1s)
  6. Assert: HTML element has class "dark"
  7. Assert: Background color is dark
  8. Screenshot: .sisyphus/evidence/dark-mode.png
Expected Result: Dark mode toggle works correctly
Evidence: .sisyphus/evidence/dark-mode.png

---

## Execution Strategy

### Phase 1: Foundation (Sequential)
**Wave 1**:
- Task 1: Project structure setup
- Task 2: Data schema design
- Task 3: Backend API foundation

### Phase 2: Data Import (Sequential)
**Wave 2** (After Wave 1):
- Task 4: Transcript parsing system
- Task 5: Character profile creation
- Task 6: Mythos cataloging

### Phase 3: Frontend Development (Parallel with Wave 2)
**Wave 3**:
- Task 7: HeroUI v3 setup and theming
- Task 8: Wiki page components
- Task 9: Graph visualization

### Phase 4: Integration & Polish (Sequential)
**Wave 4** (After Waves 2 & 3):
- Task 10: Frontend-Backend integration
- Task 11: Search implementation
- Task 12: Documentation and guidelines

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 4, 5, 6 | 3 |
| 3 | 1 | 10 | 2 |
| 4 | 2 | None | 5, 6, 7 |
| 5 | 2 | None | 4, 6, 7 |
| 6 | 2 | None | 4, 5, 7 |
| 7 | 1 | 8, 9 | 4, 5, 6 |
| 8 | 7 | 10 | 9 |
| 9 | 7 | 10 | 8 |
| 10 | 3, 8, 9 | 11 | None |
| 11 | 10 | 12 | None |
| 12 | 11 | None | None |

---

## TODOs

### Task 1: Project Structure Setup

**What to do**:
- Create directory structure (frontend/, backend/, data/, docs/, scripts/)
- Initialize Git repository with .gitignore
- Set up frontend: Next.js 15 with Bun
- Set up backend: FastAPI with uv
- Configure Tailwind CSS v4 and HeroUI v3
- Create initial configuration files

**Must NOT do**:
- Do not commit transcripts until clearance confirmed
- Do not install unnecessary dependencies

**Recommended Agent Profile**:
- **Category**: `visual-engineering` (for frontend setup) + `quick` (for structure)
- **Skills**: `frontend-ui-ux`, `git-master`
- **Skills Evaluated but Omitted**: `playwright` (not needed for setup)

**Parallelization**:
- **Can Run In Parallel**: NO (foundation task)
- **Parallel Group**: Sequential
- **Blocks**: Tasks 2, 3
- **Blocked By**: None

**Acceptance Criteria**:
- [ ] Directory structure created
- [ ] Frontend: `bun dev` starts Next.js on localhost:3000
- [ ] Backend: `uv run uvicorn` starts FastAPI on localhost:8000
- [ ] HeroUI v3 components render correctly
- [ ] Git initialized with proper .gitignore

**Agent-Executed QA Scenario**:
Scenario: Project structure validation
  Tool: Bash
  Steps:
    1. ls -la /Users/wolfy/Developer/2026.Y/bats/ → Assert: frontend/, backend/, data/, docs/, scripts/ exist
    2. cd frontend && bun --version → Assert: bun version displayed
    3. cd backend && uv --version → Assert: uv version displayed
    4. cd frontend && test -f package.json → Assert: package.json exists
    5. cd backend && test -f pyproject.toml → Assert: pyproject.toml exists
  Expected Result: All directories and config files present

**Commit**: YES
- Message: `chore: initialize project structure with Next.js, FastAPI, HeroUI v3`
- Files: All initial config files

---

### Task 2: Data Schema Design

**What to do**:
- Design YAML/JSON schemas for:
  - Episodes (scenes, timestamps, characters, lore reveals)
  - Characters (canonical + adaptation tracking)
  - Locations (canonical + dark atmosphere)
  - Mythos elements (vampire lore with expansion fields)
  - Relationships (graph structure)
- Create Pydantic models for validation
- Design database schema (SQLite/PostgreSQL)
- Create example data files

**Must NOT do**:
- Do not create final data until transcripts received
- Do not over-engineer schema (start simple, expand as needed)

**Recommended Agent Profile**:
- **Category**: `deep` (schema design requires careful thought)
- **Skills**: None specific (pure design task)
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 3)
- **Parallel Group**: Wave 1
- **Blocks**: Tasks 4, 5, 6
- **Blocked By**: Task 1

**Acceptance Criteria**:
- [ ] YAML schemas defined for all entity types
- [ ] Pydantic models created and validated
- [ ] Example data files pass validation
- [ ] Schema documentation written

**Agent-Executed QA Scenario**:
Scenario: Schema validation
  Tool: Bash (Python)
  Steps:
    1. cd backend && uv run python -c "from models import Episode, Character; print('OK')"
    2. uv run python scripts/validate_schema.py data/examples/episode_example.yaml
    3. Assert: Validation passes with no errors
    4. uv run python scripts/validate_schema.py data/examples/character_example.yaml
    5. Assert: Validation passes with no errors
  Expected Result: All schemas validate correctly

**Commit**: YES
- Message: `feat: design data schemas for episodes, characters, mythos`
- Files: backend/src/models/, data/schemas/

---

### Task 3: Backend API Foundation

**What to do**:
- Set up FastAPI application structure
- Create database connection (SQLModel/SQLAlchemy)
- Implement CRUD endpoints:
  - GET /api/episodes
  - GET /api/episodes/{id}
  - GET /api/characters
  - GET /api/characters/{id}
  - GET /api/mythos
  - GET /api/mythos/{id}
  - GET /api/graph (relationship data)
- Add health check endpoint
- Set up CORS for frontend

**Must NOT do**:
- Do not implement authentication (not needed for local wiki)
- Do not optimize prematurely (keep it simple)

**Recommended Agent Profile**:
- **Category**: `quick` (standard API implementation)
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 2)
- **Parallel Group**: Wave 1
- **Blocks**: Task 10
- **Blocked By**: Task 1

**Acceptance Criteria**:
- [ ] FastAPI app starts successfully
- [ ] All CRUD endpoints return correct data
- [ ] Health check endpoint returns 200
- [ ] API documentation available at /docs (Swagger UI)

**Agent-Executed QA Scenario**:
Scenario: Backend API endpoints
  Tool: Bash (curl)
  Steps:
    1. curl -s http://localhost:8000/health | jq '.status' → Assert: "healthy"
    2. curl -s http://localhost:8000/api/episodes | jq 'length' → Assert: >= 0
    3. curl -s http://localhost:8000/api/characters | jq 'length' → Assert: >= 0
    4. curl -s http://localhost:8000/api/mythos | jq 'length' → Assert: >= 0
    5. curl -s http://localhost:8000/docs → Assert: Contains "Swagger UI"
  Expected Result: All endpoints functional

**Commit**: YES
- Message: `feat: implement FastAPI backend with CRUD endpoints`
- Files: backend/src/api/, backend/src/main.py

---

### Task 4: Transcript Parsing System

**What to do**:
- Create transcript import pipeline
- Parse transcript format (likely Markdown or text)
- Extract:
  - Scenes with timestamps
  - Dialogue with speaker attribution
  - Location indicators
  - Character appearances
- Store parsed data in database
- Link scenes to episodes

**Must NOT do**:
- Do not process transcripts until user provides them
- Do not commit raw transcripts to Git

**Recommended Agent Profile**:
- **Category**: `quick` (parsing logic)
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 5, 6, 7)
- **Parallel Group**: Wave 2
- **Blocks**: None
- **Blocked By**: Task 2

**Acceptance Criteria**:
- [ ] Parser handles transcript format correctly
- [ ] Scenes extracted with timestamps
- [ ] Dialogue attributed to speakers
- [ ] Data imports into database successfully

**Agent-Executed QA Scenario**:
Scenario: Transcript parsing
  Tool: Bash (Python)
  Steps:
    1. Create test transcript file
    2. uv run python scripts/parse_transcript.py test_transcript.md
    3. Assert: Output shows parsed scenes
    4. Assert: Characters extracted correctly
    5. Assert: Database updated with episode data
  Expected Result: Transcript parsing works end-to-end

**Commit**: YES (without actual transcripts)
- Message: `feat: implement transcript parsing pipeline`
- Files: scripts/parse_transcript.py, tests/

---

### Task 5: Character Profile Creation

**What to do**:
- Create character profiles from series research
- Include all main cast from IMDb:
  - Kiara Natt och Dag (Filippa Kavalic)
  - Alfred (Aaron Holgersson)
  - Elise (Elsa Östlind)
  - Chloe (Laura Maik)
  - Henry Natt och Dag (Olle Sarri)
  - Jacques Natt och Dag (Åke Bremer Wold)
  - Desirée Natt och Dag (Katarina Macli)
  - Eric (Pontus Bennemyr)
  - Felicia (Jolina Bergmer)
  - Didde (Nils Nyström)
- Structure: canonical traits + adaptation expansion fields

**Must NOT do**:
- Do not invent canon not supported by transcripts
- Do not write adaptation content (user does this)

**Recommended Agent Profile**:
- **Category**: `writing` (content creation)
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 4, 6, 7)
- **Parallel Group**: Wave 2
- **Blocks**: None
- **Blocked By**: Task 2

**Acceptance Criteria**:
- [ ] All main characters have profile files
- [ ] Profiles follow schema from Task 2
- [ ] Canonical information accurate to series
- [ ] Adaptation fields present but empty (for user to fill)

**Agent-Executed QA Scenario**:
Scenario: Character profiles validation
  Tool: Bash (Python)
  Steps:
    1. ls data/characters/ | wc -l → Assert: >= 10 character files
    2. uv run python scripts/validate_schema.py data/characters/kiara.yaml
    3. Assert: Validation passes
    4. uv run python -c "import yaml; d=yaml.safe_load(open('data/characters/kiara.yaml')); print(d['canonical']['name'])"
    5. Assert: Output shows "Kiara Natt och Dag"
  Expected Result: All character profiles valid and present

**Commit**: YES
- Message: `content: create character profile templates for main cast`
- Files: data/characters/

---

### Task 6: Mythos Cataloging

**What to do**:
- Identify vampire lore elements from series
- Create mythos entries for:
  - Vampire physiology
  - Blood bonds/feeding
  - Family hierarchies
  - Vampire-human relations
  - Weaknesses/limitations
  - Transformation/creation
- Structure: canonical description + expansion fields

**Must NOT do**:
- Do not expand mythos beyond what transcripts support (yet)
- Do not write dark adaptations (user does this)

**Recommended Agent Profile**:
- **Category**: `writing` (content creation)
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 4, 5, 7)
- **Parallel Group**: Wave 2
- **Blocks**: None
- **Blocked By**: Task 2

**Acceptance Criteria**:
- [ ] Mythos categories defined
- [ ] Entries created for established lore
- [ ] Expansion fields ready for dark adaptation
- [ ] Cross-references to episodes established

**Agent-Executed QA Scenario**:
Scenario: Mythos catalog validation
  Tool: Bash
  Steps:
    1. ls data/mythos/ | wc -l → Assert: >= 5 mythos files
    2. uv run python scripts/validate_schema.py data/mythos/vampire_physiology.yaml
    3. Assert: Validation passes
    4. cat data/mythos/vampire_physiology.yaml | grep -q "canonical:"
    5. Assert: Canonical section present
  Expected Result: Mythos catalog structured correctly

**Commit**: YES
- Message: `content: catalog vampire mythos elements`
- Files: data/mythos/

---

### Task 7: HeroUI v3 Setup and Theming

**What to do**:
- Install HeroUI v3 beta packages (@heroui/react@beta, @heroui/styles@beta)
- Configure Tailwind CSS v4
- Set up dark mode system
- Create theme variables based on series branding (awaiting screenshots)
- Build layout components (navigation, sidebar, content areas)
- Implement responsive design

**Must NOT do**:
- Do not use HeroUI v2 patterns (no Provider, use compound components)
- Do not finalize colors until branding assets received

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
- **Skills**: `frontend-ui-ux`, `heroui`
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 4, 5, 6)
- **Parallel Group**: Wave 2
- **Blocks**: Tasks 8, 9
- **Blocked By**: Task 1

**Acceptance Criteria**:
- [ ] HeroUI v3 components render correctly
- [ ] Dark mode toggle works
- [ ] Theme variables defined (placeholder colors)
- [ ] Layout components created
- [ ] Responsive design functional

**Agent-Executed QA Scenario**:
Scenario: HeroUI v3 theming
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to: http://localhost:3000
    2. Wait for: page load (timeout: 5s)
    3. Assert: HeroUI Button component renders
    4. Click: Dark mode toggle
    5. Assert: Theme switches to dark
    6. Resize: viewport to 375px width
    7. Assert: Layout adapts (mobile responsive)
    8. Screenshot: .sisyphus/evidence/heroui-theming.png
  Expected Result: HeroUI v3 theming and responsive design work
  Evidence: .sisyphus/evidence/heroui-theming.png

**Commit**: YES
- Message: `feat: setup HeroUI v3 with Tailwind v4 and dark mode`
- Files: frontend/app/, frontend/components/ui/, frontend/styles/

---

### Task 8: Wiki Page Components

**What to do**:
- Build page components:
  - Episode list page (grid of episodes)
  - Episode detail page (scenes, transcript, characters)
  - Character list page
  - Character detail page (dual canonical/adaptation view)
  - Mythos encyclopedia page
  - Location pages
- Implement navigation between pages
- Create content cards and layouts

**Must NOT do**:
- Do not implement search yet (Task 11)
- Do not implement graph yet (Task 9)

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
- **Skills**: `frontend-ui-ux`, `heroui`
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 9)
- **Parallel Group**: Wave 3
- **Blocks**: Task 10
- **Blocked By**: Task 7

**Acceptance Criteria**:
- [ ] All page components created
- [ ] Navigation works between pages
- [ ] Data displays correctly from API
- [ ] Character dual-view toggle works
- [ ] Episode scene breakdowns visible

**Agent-Executed QA Scenario**:
Scenario: Wiki page navigation
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to: http://localhost:3000/episodes
    2. Click: First episode
    3. Wait for: episode detail (timeout: 3s)
    4. Click: Character link in episode
    5. Wait for: character detail (timeout: 3s)
    6. Assert: Character profile visible
    7. Click: "Adaptation" tab
    8. Assert: Adaptation view visible
    9. Screenshot: .sisyphus/evidence/wiki-pages.png
  Expected Result: Page navigation and dual-view functional
  Evidence: .sisyphus/evidence/wiki-pages.png

**Commit**: YES
- Message: `feat: implement wiki page components with navigation`
- Files: frontend/app/, frontend/components/

---

### Task 9: Graph Visualization

**What to do**:
- Choose graph library (D3.js, Cytoscape.js, or React Flow)
- Implement cross-reference graph visualization
- Show nodes: characters, episodes, locations, mythos
- Show edges: relationships, appearances, references
- Add interactivity (click to focus, zoom, pan)
- Create node detail panels

**Must NOT do**:
- Do not over-complicate graph (start simple)
- Do not implement real-time updates (not needed)

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
- **Skills**: `frontend-ui-ux`
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 8)
- **Parallel Group**: Wave 3
- **Blocks**: Task 10
- **Blocked By**: Task 7

**Acceptance Criteria**:
- [ ] Graph renders with nodes and edges
- [ ] Interactive features work (zoom, pan, click)
- [ ] Node details panel shows on click
- [ ] Different node types have distinct styling

**Agent-Executed QA Scenario**:
Scenario: Graph visualization
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to: http://localhost:3000/graph
    2. Wait for: graph render (timeout: 10s)
    3. Assert: Nodes visible on canvas
    4. Assert: Edges connecting nodes visible
    5. Click: A character node
    6. Assert: Detail panel opens
    7. Assert: Related entities listed
    8. Screenshot: .sisyphus/evidence/graph-viz.png
  Expected Result: Interactive graph visualization works
  Evidence: .sisyphus/evidence/graph-viz.png

**Commit**: YES
- Message: `feat: implement cross-reference graph visualization`
- Files: frontend/components/graph/, frontend/app/graph/

---

### Task 10: Frontend-Backend Integration

**What to do**:
- Connect frontend to backend API
- Implement data fetching (SWR or React Query)
- Handle loading states
- Handle errors gracefully
- Ensure type safety between frontend and backend

**Must NOT do**:
- Do not implement caching yet (can add later)
- Do not optimize prematurely

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: NO (requires both frontend and backend)
- **Parallel Group**: Wave 4
- **Blocks**: Task 11
- **Blocked By**: Tasks 3, 8, 9

**Acceptance Criteria**:
- [ ] Frontend fetches data from backend
- [ ] All pages display real data
- [ ] Loading states work
- [ ] Error handling works
- [ ] Type safety maintained

**Agent-Executed QA Scenario**:
Scenario: API integration
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to: http://localhost:3000/episodes
    2. Wait for: data load (timeout: 5s)
    3. Assert: Episode data from API displayed
    4. Click: An episode
    5. Assert: Episode details from API displayed
    6. Navigate to: /characters
    7. Assert: Character data from API displayed
    8. Screenshot: .sisyphus/evidence/api-integration.png
  Expected Result: Frontend displays backend data correctly
  Evidence: .sisyphus/evidence/api-integration.png

**Commit**: YES
- Message: `feat: integrate frontend with backend API`
- Files: frontend/lib/api/, frontend/hooks/

---

### Task 11: Search Implementation

**What to do**:
- Implement full-text search backend endpoint
- Index: transcripts, character descriptions, mythos entries
- Create search UI component
- Show search results with context
- Filter by entity type (episodes, characters, mythos)

**Must NOT do**:
- Do not use external search service (keep it local)
- Do not implement advanced search syntax (basic search is fine)

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: NO (depends on Task 10)
- **Parallel Group**: Wave 4
- **Blocks**: Task 12
- **Blocked By**: Task 10

**Acceptance Criteria**:
- [ ] Search endpoint returns relevant results
- [ ] Search UI component works
- [ ] Results show with context snippets
- [ ] Filters work (entity type)

**Agent-Executed QA Scenario**:
Scenario: Search functionality
  Tool: Playwright (playwright skill)
  Steps:
    1. Navigate to: http://localhost:3000
    2. Click: Search input
    3. Type: "Kiara"
    4. Wait for: results (timeout: 3s)
    5. Assert: Results contain character "Kiara"
    6. Assert: Results contain episodes mentioning Kiara
    7. Click: Filter "Characters only"
    8. Assert: Only character results shown
    9. Screenshot: .sisyphus/evidence/search.png
  Expected Result: Search works with filters
  Evidence: .sisyphus/evidence/search.png

**Commit**: YES
- Message: `feat: implement full-text search across all content`
- Files: backend/src/api/search.py, frontend/components/search/

---

### Task 12: Documentation and Guidelines

**What to do**:
- Write adaptation guide (dark tone transformation rules)
- Write erotic framework (explicit content guidelines)
- Write character arc documentation
- Write world-building expansion guidelines
- Create user guide for wiki
- Document schema and API

**Must NOT do**:
- Do not write actual creative content (user is author)
- Do not include explicit examples (keep it professional)

**Recommended Agent Profile**:
- **Category**: `writing`
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: NO (final task)
- **Parallel Group**: Wave 4
- **Blocks**: None
- **Blocked By**: Task 11

**Acceptance Criteria**:
- [ ] docs/adaptation-guide.md complete
- [ ] docs/erotic-framework.md complete
- [ ] docs/character-arcs.md complete
- [ ] docs/world-building.md complete
- [ ] README.md updated with usage instructions

**Agent-Executed QA Scenario**:
Scenario: Documentation completeness
  Tool: Bash
  Steps:
    1. test -f docs/adaptation-guide.md → Assert: File exists
    2. test -f docs/erotic-framework.md → Assert: File exists
    3. test -f docs/character-arcs.md → Assert: File exists
    4. wc -l docs/*.md | tail -1 → Assert: Total lines > 500
    5. cat docs/adaptation-guide.md | grep -q "Darkness Spectrum"
    6. Assert: Key section present
  Expected Result: All documentation files present and substantial

**Commit**: YES
- Message: `docs: add adaptation guidelines and framework documentation`
- Files: docs/

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: initialize project structure` | All config | bun dev, uvicorn run |
| 2 | `feat: design data schemas` | backend/src/models/ | Schema validation passes |
| 3 | `feat: implement FastAPI backend` | backend/src/api/ | curl endpoints |
| 4 | `feat: transcript parsing pipeline` | scripts/ | Parser test passes |
| 5 | `content: character profiles` | data/characters/ | Validation passes |
| 6 | `content: mythos catalog` | data/mythos/ | Validation passes |
| 7 | `feat: HeroUI v3 setup` | frontend/ | Visual QA |
| 8 | `feat: wiki page components` | frontend/app/ | Navigation QA |
| 9 | `feat: graph visualization` | frontend/components/graph/ | Graph QA |
| 10 | `feat: frontend-backend integration` | frontend/lib/api/ | Integration QA |
| 11 | `feat: search implementation` | backend/src/api/search.py | Search QA |
| 12 | `docs: adaptation guidelines` | docs/ | Doc completeness |

---

## Success Criteria

### Verification Commands
```bash
# Frontend running
cd frontend && bun dev
# Expected: Server on localhost:3000

# Backend running
cd backend && uv run uvicorn src.main:app --reload
# Expected: Server on localhost:8000

# All tests pass
cd frontend && bun test
cd backend && uv run pytest
# Expected: All tests pass

# Wiki accessible
curl http://localhost:3000
# Expected: HTML response

# API accessible
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### Final Checklist
- [ ] All 12 tasks complete
- [ ] 7 episodes can be imported (when provided)
- [ ] All main characters have profiles
- [ ] Cross-reference graph functional
- [ ] Search works across all content
- [ ] Wiki matches series branding (when assets provided)
- [ ] Documentation complete
- [ ] All QA scenarios pass

---

## Notes for User

### What You Need to Provide
1. **7 episode transcripts** (Markdown or text format)
2. **Screenshots** of series (characters, locations, key scenes)
3. **Branding assets** (fonts, color palettes, logos if available)
4. **Episode 8** when available

### What This Plan Delivers
- A fully functional wiki system for tracking canonical material
- Structured data schemas for all entities
- Comparison framework (Original vs. Adaptation)
- Cross-reference visualization
- Search and discovery tools
- Documentation for adaptation guidelines

### What You Will Do
- Fill in adaptation fields for characters and mythos
- Write the actual dark adaptation content
- Make creative decisions about tone and explicit content
- Use the wiki as your reference and planning tool

### Next Steps After Plan Execution
1. Import your transcripts
2. Review and expand character profiles
3. Document your adaptation decisions
4. Use the wiki to maintain consistency
5. Export data for your novel writing workflow

---

*Plan Generated*: 2026-02-03  
*Status*: Ready for Execution  
*Execute with*: `/start-work`
