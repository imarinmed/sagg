# Work Plan: Complete Wiki Platform Features

## TL;DR

> **Quick Summary**: Complete the three remaining high-value features for the Blod svett tårar Dark Adaptation Wiki: episode detail pages with scene breakdowns, full-text search across transcripts, and interactive graph visualization for character relationships.
> 
> **Deliverables**:
> - Episode detail page with scene-by-scene breakdown and dialogue viewer
> - Full-text search endpoint and UI component
> - Interactive D3.js graph visualization
> - All features integrated with existing backend API
> 
> **Estimated Effort**: Medium (2-3 days)
> **Parallel Execution**: YES - Frontend and Backend tasks can run in parallel
> **Critical Path**: Backend Search API → Frontend Search UI → Graph Visualization

---

## Context

### Current State
The wiki platform has a solid foundation:
- ✅ All 7 episodes parsed from SRT transcripts
- ✅ 10 character profiles with kink taxonomy
- ✅ Backend API with episodes, characters, mythos endpoints
- ✅ Frontend with HeroUI v3, navigation, list pages
- ✅ Character detail pages with kink profile visualization

### What's Missing
1. **Episode Detail Pages** - List view exists but no individual episode view with scene breakdowns
2. **Search Functionality** - No way to search across transcripts, characters, or mythos
3. **Graph Visualization** - Backend has graph data but frontend only has a placeholder

### Why These Matter for Novel Writing
- **Episode Details**: Essential for reviewing specific scenes and dialogue while writing adaptations
- **Search**: Critical for finding specific moments, character interactions, or lore references quickly
- **Graph**: Helps visualize complex character relationships and plan relationship arcs

---

## Work Objectives

### Core Objective
Transform the wiki from a browsing tool into a comprehensive research and reference platform for novel adaptation writing.

### Concrete Deliverables

1. **Episode Detail System**
   - Individual episode pages at `/episodes/[id]`
   - Scene-by-scene breakdown with timestamps
   - Dialogue viewer with speaker attribution
   - Character appearance tracking per scene
   - Scene tagging interface (integrate with existing kink taxonomy)

2. **Full-Text Search**
   - Backend search endpoint indexing transcripts, characters, mythos
   - Frontend search UI with real-time results
   - Filter by entity type (episodes, characters, scenes, mythos)
   - Context snippets in search results
   - Click-to-navigate from results

3. **Interactive Graph Visualization**
   - D3.js or Cytoscape.js graph rendering
   - Nodes: characters, episodes, mythos elements
   - Edges: relationships, appearances, references
   - Interactive features: zoom, pan, click for details
   - Filter by relationship type
   - Highlight connections on hover

### Definition of Done
- [ ] Episode detail page displays all scenes with dialogue
- [ ] Search returns relevant results with context snippets
- [ ] Graph visualization shows interactive relationship network
- [ ] All features work on both desktop and mobile
- [ ] Dark mode styling consistent across all new features
- [ ] All features integrated with existing API

### Must Have
- Scene-level detail view with dialogue
- Search across all transcript text
- Interactive graph with node/edge inspection
- Mobile-responsive design
- Consistent HeroUI v3 styling

### Must NOT Have (Guardrails)
- NO real-time collaboration features
- NO user authentication (single-user wiki)
- NO external search services (keep local)
- NO 3D graph visualization (2D is sufficient)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (backend and frontend running)
- **Automated tests**: Tests-after (manual QA sufficient for UI features)
- **Framework**: bun test (frontend), pytest (backend)

### Agent-Executed QA Scenarios

**Scenario 1: Episode Detail Page**
Tool: Playwright (playwright skill)
Preconditions: Backend and frontend running
Steps:
  1. Navigate to: http://localhost:3000/episodes
  2. Click: First episode card
  3. Wait for: episode detail page (timeout: 5s)
  4. Assert: Episode title visible
  5. Assert: Scene list visible with timestamps
  6. Click: First scene
  7. Assert: Dialogue visible with speaker attribution
  8. Assert: Characters in scene listed
  9. Screenshot: .sisyphus/evidence/episode-detail.png
Expected Result: Episode detail shows scenes and dialogue
Evidence: .sisyphus/evidence/episode-detail.png

**Scenario 2: Search Functionality**
Tool: Playwright (playwright skill)
Preconditions: Search index built
Steps:
  1. Navigate to: http://localhost:3000
  2. Click: Search input in header
  3. Type: "Kiara"
  4. Wait for: search results dropdown (timeout: 3s)
  5. Assert: Results contain character "Kiara"
  6. Assert: Results contain episodes mentioning Kiara
  7. Assert: Context snippets visible
  8. Click: First result
  9. Assert: Navigated to correct page
  10. Screenshot: .sisyphus/evidence/search.png
Expected Result: Search finds and navigates to relevant content
Evidence: .sisyphus/evidence/search.png

**Scenario 3: Graph Visualization**
Tool: Playwright (playwright skill)
Preconditions: Graph data loaded
Steps:
  1. Navigate to: http://localhost:3000/graph
  2. Wait for: graph canvas (timeout: 10s)
  3. Assert: Nodes visible (characters as circles)
  4. Assert: Edges visible (lines connecting nodes)
  5. Click: A character node
  6. Assert: Node details panel opens
  7. Assert: Related entities listed
  8. Drag: Canvas to pan
  9. Assert: Graph pans
  10. Screenshot: .sisyphus/evidence/graph.png
Expected Result: Interactive graph with node inspection
Evidence: .sisyphus/evidence/graph.png

**Scenario 4: Backend Search API**
Tool: Bash (curl)
Preconditions: Backend running
Steps:
  1. curl -s "http://localhost:8000/api/search?q=Kiara"
  2. Assert: HTTP status 200
  3. Assert: Response contains results array
  4. Assert: Results include character type
  5. Assert: Results include episode type
  6. curl -s "http://localhost:8000/api/search?q=blood&type=character"
  7. Assert: Filtered results only show characters
Expected Result: Search API returns relevant results
Evidence: Terminal output captured

---

## Execution Strategy

### Wave 1: Backend Enhancements (Can run first)
**Tasks**: 1, 4
- Task 1: Update data loading to use parsed JSON
- Task 4: Implement search API endpoint

### Wave 2: Episode Detail (Parallel with Wave 1)
**Tasks**: 2
- Task 2: Create episode detail page with scene viewer

### Wave 3: Graph Visualization (After Waves 1 & 2)
**Tasks**: 3
- Task 3: Implement D3.js graph with interactivity

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | 4 |
| 2 | 1 | None | 4 |
| 3 | 1, 2 | None | None |
| 4 | None | 3 | 1, 2 |

---

## TODOs

### Task 1: Update Backend Data Loading

**What to do**:
- Modify `backend/src/data.py` to load from parsed JSON files
- Load episodes from `data/parsed/episodes.json`
- Load scenes from individual episode JSON files (s01e01.json, etc.)
- Load characters from YAML files in `data/characters/`
- Load mythos from YAML files in `data/mythos/`
- Build relationships from character relationship data
- Update Pydantic models if needed for new fields

**Must NOT do**:
- Do not break existing API endpoints
- Do not remove placeholder data until new data loads successfully

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1
- **Blocks**: Task 2
- **Blocked By**: None

**Acceptance Criteria**:
- [ ] Backend loads all 7 episodes from parsed JSON
- [ ] Backend loads all scenes with dialogue
- [ ] Backend loads all 10 characters from YAML
- [ ] Backend loads all mythos elements
- [ ] API endpoints return real data, not placeholders
- [ ] No errors during data loading

**Agent-Executed QA Scenario**:
Scenario: Data loading verification
  Tool: Bash (curl)
  Steps:
    1. curl -s http://localhost:8000/api/episodes | jq 'length' → Assert: 7
    2. curl -s http://localhost:8000/api/episodes/s01e01 | jq '.title' → Assert: "Kallblodig skolstart"
    3. curl -s http://localhost:8000/api/episodes/s01e01/scenes | jq 'length' → Assert: > 0
    4. curl -s http://localhost:8000/api/characters | jq 'length' → Assert: 10
    5. curl -s http://localhost:8000/api/mythos | jq 'length' → Assert: > 0
  Expected Result: All endpoints return real parsed data

**Commit**: YES
- Message: `feat: load real data from parsed transcripts and YAML files`
- Files: backend/src/data.py, backend/src/models.py

---

### Task 2: Episode Detail Page

**What to do**:
- Create `frontend/app/episodes/[id]/page.tsx`
- Display episode metadata (title, episode number, synopsis)
- Show scene list with:
  - Scene number and timestamps
  - Location (if available)
  - Characters present
  - Expandable dialogue view
- Add character chips linking to character pages
- Style with HeroUI v3 components
- Handle loading and error states
- Make responsive for mobile

**Must NOT do**:
- Do not implement scene editing (read-only for now)
- Do not add kink tagging UI yet (can add later)

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
- **Skills**: `frontend-ui-ux`, `heroui`
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 4)
- **Parallel Group**: Wave 2
- **Blocks**: None
- **Blocked By**: Task 1

**Acceptance Criteria**:
- [ ] Episode detail page accessible at `/episodes/[id]`
- [ ] Episode metadata displays correctly
- [ ] Scene list shows all scenes with timestamps
- [ ] Dialogue visible when expanding scene
- [ ] Character chips link to character pages
- [ ] Loading and error states handled
- [ ] Responsive design works on mobile

**Agent-Executed QA Scenario**:
Scenario: Episode detail page
  Tool: Playwright (playwright skill)
  Preconditions: Backend running with real data
  Steps:
    1. Navigate to: http://localhost:3000/episodes/s01e01
    2. Wait for: page load (timeout: 5s)
    3. Assert: Episode title "Kallblodig skolstart" visible
    4. Assert: Scene list visible
    5. Click: First scene expand button
    6. Assert: Dialogue visible
    7. Assert: Speaker names shown
    8. Click: Character chip
    9. Assert: Navigated to character page
    10. Screenshot: .sisyphus/evidence/episode-detail.png
  Expected Result: Episode detail page shows scenes and dialogue
  Evidence: .sisyphus/evidence/episode-detail.png

**Commit**: YES
- Message: `feat: add episode detail page with scene breakdown and dialogue viewer`
- Files: frontend/app/episodes/[id]/page.tsx

---

### Task 3: Graph Visualization

**What to do**:
- Install D3.js or Cytoscape.js (`npm install d3` or `npm install cytoscape`)
- Create `frontend/app/graph/page.tsx`
- Create `frontend/components/GraphVisualization.tsx`
- Fetch graph data from `/api/graph`
- Render nodes for:
  - Characters (different color/shape)
  - Episodes (different color/shape)
  - Mythos elements (different color/shape)
- Render edges for relationships
- Add interactivity:
  - Zoom with mouse wheel
  - Pan by dragging
  - Click node to show details panel
  - Hover to highlight connections
- Style with dark mode support
- Make responsive

**Must NOT do**:
- Do not use 3D visualization (2D force-directed is sufficient)
- Do not implement real-time updates

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
- **Skills**: `frontend-ui-ux`
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 3
- **Blocks**: None
- **Blocked By**: Tasks 1, 2, 4

**Acceptance Criteria**:
- [ ] Graph page accessible at `/graph`
- [ ] Nodes render for all entity types
- [ ] Edges show relationships
- [ ] Zoom and pan work
- [ ] Clicking node shows details panel
- [ ] Dark mode styling applied
- [ ] Responsive layout

**Agent-Executed QA Scenario**:
Scenario: Graph visualization
  Tool: Playwright (playwright skill)
  Preconditions: Backend running
  Steps:
    1. Navigate to: http://localhost:3000/graph
    2. Wait for: graph render (timeout: 10s)
    3. Assert: Canvas visible with nodes
    4. Assert: Multiple node types visible
    5. Click: Character node
    6. Assert: Details panel opens with node info
    7. Scroll: Mouse wheel
    8. Assert: Graph zooms
    9. Drag: Canvas
    10. Assert: Graph pans
    11. Screenshot: .sisyphus/evidence/graph.png
  Expected Result: Interactive graph visualization
  Evidence: .sisyphus/evidence/graph.png

**Commit**: YES
- Message: `feat: implement interactive graph visualization with D3.js`
- Files: frontend/app/graph/page.tsx, frontend/components/GraphVisualization.tsx

---

### Task 4: Search Implementation

**What to do**:
- Backend:
  - Create `backend/src/api/search.py` router
  - Implement `/api/search?q={query}&type={type}` endpoint
  - Index content:
    - Episode titles and synopses
    - Scene dialogue text
    - Character names and descriptions
    - Mythos names and descriptions
  - Return results with:
    - Entity type
    - Title/name
    - Context snippet (50 chars around match)
    - URL path for navigation
  - Support type filter (all, episode, character, scene, mythos)
- Frontend:
  - Create `frontend/components/SearchBox.tsx`
  - Add search to header/navigation
  - Show dropdown with results
  - Display context snippets
  - Click result to navigate
  - Debounce input (300ms)
  - Show loading state

**Must NOT do**:
- Do not use external search service (Elasticsearch, etc.)
- Do not implement advanced search syntax

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: None specific
- **Skills Evaluated but Omitted**: N/A

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 1, 2)
- **Parallel Group**: Wave 1/2
- **Blocks**: None
- **Blocked By**: None

**Acceptance Criteria**:
- [ ] Search endpoint returns results for queries
- [ ] Results include context snippets
- [ ] Type filter works
- [ ] Frontend search box shows dropdown results
- [ ] Clicking result navigates to correct page
- [ ] Debounce prevents excessive requests
- [ ] Empty state handled gracefully

**Agent-Executed QA Scenario**:
Scenario: Search functionality
  Tool: Playwright (playwright skill)
  Preconditions: Backend running
  Steps:
    1. Navigate to: http://localhost:3000
    2. Click: Search input
    3. Type: "Kiara"
    4. Wait for: results (timeout: 3s)
    5. Assert: Dropdown with results visible
    6. Assert: Character result for Kiara shown
    7. Assert: Episode results shown
    8. Assert: Context snippets visible
    9. Click: Kiara character result
    10. Assert: Navigated to /characters/kiara
    11. Screenshot: .sisyphus/evidence/search.png
  Expected Result: Search finds and navigates to content
  Evidence: .sisyphus/evidence/search.png

**Commit**: YES
- Message: `feat: implement full-text search across all content`
- Files: backend/src/api/search.py, frontend/components/SearchBox.tsx

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat: load real data from parsed transcripts` | backend/src/data.py | API returns real data |
| 2 | `feat: add episode detail page` | frontend/app/episodes/[id]/ | Episode detail QA |
| 3 | `feat: implement graph visualization` | frontend/app/graph/, components/ | Graph QA |
| 4 | `feat: implement full-text search` | backend/src/api/search.py, frontend/components/ | Search QA |

---

## Success Criteria

### Verification Commands
```bash
# Backend data loading
curl http://localhost:8000/api/episodes | jq 'length'
# Expected: 7

# Search API
curl "http://localhost:8000/api/search?q=Kiara"
# Expected: JSON with results

# Frontend episode detail
curl http://localhost:3000/episodes/s01e01
# Expected: HTML with episode content
```

### Final Checklist
- [ ] All 4 tasks complete
- [ ] Episode detail shows scenes and dialogue
- [ ] Search works across all content types
- [ ] Graph visualization interactive
- [ ] All QA scenarios pass
- [ ] Dark mode consistent
- [ ] Mobile responsive

---

## Notes

### Technical Decisions
- **Graph Library**: D3.js recommended for flexibility, but Cytoscape.js is simpler for network graphs
- **Search**: Simple in-memory text search sufficient (no need for Elasticsearch)
- **Data Loading**: Load from parsed JSON at startup (no database needed for wiki)

### Performance Considerations
- Search results should return in <500ms
- Graph should handle ~50 nodes smoothly
- Episode detail should lazy-load dialogue for large scenes

---

*Plan Generated*: 2026-02-03  
*Status*: Ready for Execution  
*Execute with*: `/start-work`
