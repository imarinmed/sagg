# Blod Dark Adaptation Knowledge Base - Learnings

## Task 1: Dependency Installation & Setup Verification

### Frontend Setup (Bun)
- **Status**: ✅ Complete
- **Packages Installed**: 187 total
  - Next.js: 15.5.11 (latest available: 16.1.6)
  - React: 19.2.4
  - HeroUI: 3.0.0-beta.5 (design system)
  - Tailwind CSS: 4.1.18
  - TypeScript: 5.9.3
- **Server**: Starts successfully on port 3001
- **Build**: Compiles to .next/ folder successfully
- **Warning**: @next/swc version mismatch (15.5.7 vs 15.5.11) — non-critical; doesn't affect build
- **Config Fix Applied**: Disabled `reactCompiler: true` experiment in next.config.js (plugin not in package.json)

### Backend Setup (UV)
- **Status**: ✅ Complete
- **Packages Installed**: 21 total
  - FastAPI: 0.128.0 (modern async framework)
  - SQLAlchemy: 2.0.46 (ORM)
  - SQLModel: 0.0.32 (Pydantic + SQL integration)
  - Uvicorn: 0.40.0 (ASGI server)
  - Python: 3.12.9
- **Server**: Starts successfully on http://127.0.0.1:8000
- **Auto-reload**: Enabled for development
- **API Response**: Confirmed working (version endpoint returns JSON)

### Project Structure Confirmed
```
/Users/wolfy/Developer/2026.Y/bats/
├── frontend/          (Next.js + HeroUI + Tailwind)
├── backend/           (FastAPI + SQLModel)
├── data/              (Raw content/JSON)
├── docs/              (Documentation)
├── scripts/           (Utilities)
├── .gitignore         (Configured)
└── .sisyphus/         (Task planning)
```

### Git Status
- Repository initialized on main branch (0 commits)
- Untracked files ready for initial commit: .gitignore, .sisyphus/, backend/, data/, frontend/
- No staged changes

## Notes for Next Task
- Frontend port 3000 was in use; dev server uses 3001
- Both dev servers verified with quick curl tests
- No TypeScript or build errors after config fix
- Production build completes successfully (output to .next/)

---

## Task 2: FastAPI Backend CRUD Implementation

### Status: ✅ COMPLETE

All read-only CRUD endpoints implemented for Episodes, Characters, Mythos, and Graph data.

### Architecture

**File Structure**:
```
backend/src/
├── main.py                    # FastAPI app with all routers (CORS, health, root)
├── models.py                  # Pydantic models for type safety
├── data.py                    # In-memory storage (sample data)
└── api/
    ├── __init__.py
    ├── episodes.py            # 3 GET endpoints
    ├── characters.py          # 3 GET endpoints
    ├── mythos.py              # 2 GET endpoints
    └── graph.py               # 2 GET endpoints for visualization
```

### Endpoints Delivered

**Episodes** (3 endpoints)
- `GET /api/episodes` → List all episodes (2 samples: Väntan, Möte)
- `GET /api/episodes/{episode_id}` → Single episode details
- `GET /api/episodes/{episode_id}/scenes` → Scenes for episode

**Characters** (3 endpoints)
- `GET /api/characters` → List all (3 samples: Fiona, Sebastian, Isabelle)
- `GET /api/characters/{character_id}` → Single character with traits
- `GET /api/characters/{character_id}/relationships` → Related characters

**Mythos** (2 endpoints)
- `GET /api/mythos` → List all (2 samples: Vampirism, The Bloodline)
- `GET /api/mythos/{mythos_id}` → Single element details

**Graph Visualization** (2 endpoints)
- `GET /api/graph` → Complete node-edge graph for visualization
- `GET /api/graph/related/{entity_id}` → Subgraph of related entities

**Utility** (3 endpoints)
- `GET /health` → {"status": "healthy"}
- `GET /` → API info
- `GET /docs` → Swagger UI (auto-generated from schemas)

### Key Patterns Applied

1. **Modular Routers**
   - Each entity type in separate file under `api/`
   - Imported in main.py with `app.include_router(router)`
   - Tags auto-organize in Swagger UI

2. **Relative Imports (CRITICAL)**
   - main.py: `from .api import episodes, characters...`
   - api modules: `from ..models import X` and `from ..data import X`
   - data.py: `from .models import X`
   - **Reason**: Python module discovery when running `uvicorn src.main:app`

3. **Type Safety with Pydantic**
   - Models defined in models.py for all entities
   - Automatic request/response validation
   - Self-documenting OpenAPI schema

4. **In-Memory Storage Pattern**
   - Dict-based storage in data.py (key → object mapping)
   - Easy to swap for database (import statement change only)
   - Sample data for testing all features

5. **Error Handling**
   - HTTPException(404) for missing resources
   - Consistent error response format

6. **Sample Data Coverage**
   - Episodes: 2 (Väntan ep1, Möte ep2)
   - Scenes: 2 for episode 1
   - Characters: 3 (Fiona/Lund, Sebastian/Falk, Isabelle)
   - Relationships: 2 (romance, friendship)
   - Mythos: 2 (Vampirism, The Bloodline)
   - Graph nodes: 7 (2 episodes, 3 characters, 2 mythos)
   - Graph edges: 4 (relationships + character-mythos links)

### Testing Verification

✅ All endpoints verified with curl:
- Health check returns {"status": "healthy"}
- Episodes list returns array of 2 episodes
- Single episode returns correct details
- Episode scenes returns array of 2 scenes
- Characters list returns array of 3 characters
- Single character returns with canonical/adaptation traits
- Character relationships returns array of relevant relationships
- Mythos list returns array of 2 elements
- Single mythos returns with related characters
- Full graph returns nodes array (7) and edges array (4)
- Related entities returns filtered subgraph
- Swagger UI available at /docs
- OpenAPI schema available at /openapi.json

### Running the Server

```bash
cd /Users/wolfy/Developer/2026.Y/bats/backend
uv run uvicorn src.main:app --host 127.0.0.1 --port 8000
```

**IMPORTANT**: Do NOT use `--reload` flag - causes hangs in current environment.

### Next Phase Prerequisites

When ready for database integration:
1. Replace dicts in data.py with SQLAlchemy session
2. Keep same function signatures (minimal changes)
3. Add POST/PUT/DELETE endpoints
4. Add authentication layer
5. Implement pagination for list endpoints
6. Add full-text search for episodes/characters


## Data Loading System - Real Data Integration

**Completed:** 2026-02-03

### Implementation Summary
Successfully replaced placeholder data in `backend/src/data.py` with real data loading from:
- **Episodes**: `data/parsed/episodes.json` - 7 episodes loaded
- **Scenes**: Individual `s01e*.json` files - 21 scenes with dialogue/timings
- **Characters**: `data/characters/*.yaml` - 10 characters with full profiles
- **Mythos**: `data/mythos/*.yaml` - 7 mythology elements
- **Relationships**: Extracted from character YAML relationship data - 27 relationships

### Key Technical Decisions
1. **Data Loading Approach**: Lazy-loaded on module initialization, stored in module-level dicts for performance
2. **Character Kink Profiles**: Preserved complex nested YAML structures (preferences, limits, evolution tracking)
3. **Error Handling**: Graceful degradation with console logging - won't crash if files missing
4. **Path Resolution**: Used `Path(__file__).parent.parent.parent / "data"` for cross-platform compatibility

### Data Structure Patterns
- Episodes: Basic metadata (title, season, episode_number, dates)
- Scenes: Store timecode info (start_time/end_time) in description field, character names from parsed dialogue
- Characters: Full dual-tracking (canonical vs. adaptation traits), kink profiles with intensity/evolution
- Mythos: Category-based organization, related character references
- Relationships: Extracted from canonical YAML, includes relationship type and dynamic description

### Testing Results
- ✓ All 7 episodes load from JSON
- ✓ All 21 scenes load with proper episode associations
- ✓ All 10 characters load with full kink profiles
- ✓ All 27 relationships extracted and validated
- ✓ All 7 mythos elements load
- ✓ No LSP errors in data.py
- ✓ API endpoints return real data, not placeholders

### API Endpoints Verified
- `GET /api/episodes` - returns 7 episodes
- `GET /api/episodes/{id}/scenes` - returns scenes for episode with dialogue info
- `GET /api/characters` - returns 10 characters with full profiles
- `GET /api/characters/{id}/relationships` - returns character relationships
- `GET /api/mythos` - returns 7 mythology elements


## Code Quality & Style Fixes Applied

**Ruff/Linting Cleanup:**
- Updated type hints: `Dict` → `dict`, `Tuple` → `tuple`, `Set` → `set`
- Removed unused imports (PreferredDynamic, Set)
- Sorted imports alphabetically using isort conventions
- Fixed ambiguous variable names (e.g., `l` → `lim`)
- Cleaned up f-string formatting
- Removed unnecessary mode='r' args in open() calls (default)
- Fixed line length issues (kept under 88 chars for Black compatibility)

**Result:** Zero error diagnostics, all warnings resolved

