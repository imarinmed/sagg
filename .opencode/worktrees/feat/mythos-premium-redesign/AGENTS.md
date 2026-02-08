# AGENTS.md - Blod Wiki Project

> Guide for AI agents working in this repository. Document what you discover about commands, patterns, and conventions.

## Repository Remote

- Canonical HTTPS: `https://github.com/imarinmed/sagg.git`
- Canonical SSH: `git@github.com:imarinmed/sagg.git`
- Verify current remotes: `git remote -v`
- Set origin (new clone without origin): `git remote add origin https://github.com/imarinmed/sagg.git`
- Set origin (existing origin): `git remote set-url origin https://github.com/imarinmed/sagg.git`
- Push branch: `git push -u origin <branch>`

## Project Overview

**Blod Wiki** - A dark adaptation wiki for "Blod svett tårar" (Blood, Sweat, Tears). A full-stack web application with a FastAPI backend and Next.js frontend.

- **Backend**: Python 3.12+ with FastAPI, SQLModel, SQLite, Alembic migrations
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + HeroUI v3
- **Data**: YAML character files, JSON episode data, SQLite database

## Project Structure

```
/Users/wolfy/Developer/2026.Y/bats/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── models.py       # Pydantic models for API
│   │   ├── data.py         # Data loading from JSON/YAML
│   │   ├── api/            # API route handlers
│   │   │   ├── characters.py
│   │   │   ├── episodes.py
│   │   │   ├── mythos.py
│   │   │   ├── graph.py
│   │   │   └── search.py
│   │   └── db/             # Database models (SQLModel)
│   ├── alembic/            # Database migrations
│   ├── pyproject.toml      # Python dependencies
│   └── alembic.ini         # Migration config
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout with theme
│   │   ├── page.tsx        # Home page
│   │   ├── globals.css     # Theme system + Tailwind
│   │   ├── characters/     # Character pages
│   │   ├── episodes/       # Episode pages
│   │   ├── mythos/         # Mythos encyclopedia
│   │   └── graph/          # Relationship graph
│   ├── components/         # React components
│   ├── lib/                # Utilities, API client, theme
│   ├── styles/             # Additional CSS
│   └── package.json
├── data/                   # Project data
│   ├── characters/         # YAML character definitions
│   ├── mythos/             # YAML mythos elements
│   ├── parsed/             # JSON episode data
│   ├── video_analysis/     # Video analysis + screenshots
│   └── *.json              # Character relationships, presence, evolution
├── scripts/                # Python utility scripts
└── docs/                   # Documentation
```

## Essential Commands

### Backend (from `backend/` directory)

```bash
# Setup (uses uv for package management)
uv sync                      # Install dependencies
source .venv/bin/activate    # Activate virtual environment

# Development
uv run uvicorn src.main:app --reload --port 8000    # Start dev server
python -m uvicorn src.main:app --reload --port 8000 # Alternative

# Database
alembic revision --autogenerate -m "description"    # Create migration
alembic upgrade head                                  # Run migrations
alembic downgrade -1                                  # Rollback one

# Code Quality
ruff check .                 # Lint code
ruff check --fix .           # Auto-fix lint issues
ruff format .                # Format code

# Testing
pytest                       # Run tests
pytest -v                    # Verbose output
```

### Frontend (from `frontend/` directory)

```bash
# Setup (uses bun)
bun install                  # Install dependencies

# Development
bun run dev                  # Start dev server on port 6699

# Build & Production
bun run build                # Build for production
bun run start                # Start production server

# Code Quality
bun run lint                 # ESLint
bun run typecheck            # TypeScript check
```

### Full Stack Development

```bash
# Terminal 1 - Backend
cd backend && uv run uvicorn src.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && bun run dev

# Access:
# - Frontend: http://localhost:6699
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## Code Patterns & Conventions

### Backend Patterns

**Pydantic Models** (`backend/src/models.py`):
- All API request/response models use Pydantic v2
- Use `Field(ge=1, le=5)` for validated numeric ranges
- Pattern validation with regex: `pattern="^(prerequisite|related|...)$"`
- Custom validation in `model_post_init()`

**API Routes** (`backend/src/api/*.py`):
- Use `APIRouter` with prefix and tags
- Standard HTTP exceptions: `HTTPException(status_code=404, detail="...")`
- Response models specified on route decorators
- Query params use `Query(..., ge=1, le=5)` for validation

**Data Loading** (`backend/src/data.py`):
- Data files loaded from `DATA_DIR = Path(__file__).parent.parent.parent / "data"`
- JSON files in `data/parsed/` for episodes/scenes
- YAML files in `data/characters/` and `data/mythos/`
- In-memory dictionaries for fast lookups

### Frontend Patterns

**Theme System** (`frontend/lib/theme.ts`, `frontend/app/globals.css`):
- Three themes: `gothic` (default), `luxury`, `nordic`
- Theme stored in localStorage key `blod-theme`
- CSS custom properties for all theme values
- Script injection in `<head>` prevents flash of wrong theme
- Access theme colors via CSS vars: `var(--color-bg-primary)`

**Component Patterns**:
- React functional components with TypeScript
- Props interfaces defined inline or in `lib/api.ts`
- HeroUI components imported from `@heroui/react`
- Tailwind classes use theme CSS variables

**API Client** (`frontend/lib/api.ts`):
- Centralized API client with typed methods
- Base URL from `NEXT_PUBLIC_API_URL` or `http://localhost:8000`
- Automatic fallback to relative paths on failure
- All types exported for component use

**Styling Conventions**:
- Tailwind CSS v4 with `@import "tailwindcss"`
- HeroUI v3 styles: `@import "@heroui/styles"`
- Glassmorphism: `.glass`, `.glass-nav` utility classes
- Typography: `var(--font-heading)`, `var(--font-body)`
- Responsive fluid typography with `clamp()`

### File Naming

- **Backend**: snake_case for Python files
- **Frontend**: PascalCase for components, camelCase for utilities
- **Routes**: Next.js App Router uses `page.tsx`, `layout.tsx`
- **Data**: kebab-case for YAML/JSON files

## Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/pyproject.toml` | Python deps, ruff config, pytest config |
| `backend/alembic.ini` | Database migration settings (SQLite at `../data/blod.db`) |
| `frontend/package.json` | Node deps, scripts |
| `frontend/next.config.js` | Next.js config (port 6699, unoptimized images) |
| `frontend/tsconfig.json` | TypeScript paths: `@/*` → root |

## Data Model Reference

### Core Entities

**Character** (`data/characters/*.yaml`):
```yaml
id: string
name: string
role: protagonist|antagonist|supporting
family: string | null
canonical_traits: string[]
adaptation_traits: string[]
adaptation_notes: string
kink_profile:
  preferences: [{descriptor, intensity (1-5), context}]
  limits: [{descriptor, type, note}]
```

**Episode** (`data/parsed/episodes.json`):
- `id`, `title`, `episode_number`, `season`, `air_date`, `synopsis`

**Mythos Element** (`data/mythos/*.yaml`):
- `id`, `name`, `category`, `description`, `traits`, `abilities`, `weaknesses`
- Special fields: `dark_variant`, `erotic_implications`, `taboo_potential`

**Relationship** (`data/character_relationships.json`):
- `from_character_id`, `to_character_id`, `relationship_type`, `description`
- Types: romantic, family, friend, enemy, servant, master, ally, rival

**Beat** (`data/narratives/bst/beats.json`):
- `beat_id`, `episode_id`, `start_time`, `end_time`, `start_seconds`, `end_seconds`
- `characters`, `moments`, narrative beat data

**Causality Edge** (`data/causality/edges.json`):
- `edge_id`, `from_beat_id`, `to_beat_id`, `type`, causality relationship between beats
- Types: causes, enables, motivates, constrains, etc.

**Knowledge Claim** (`data/knowledge/claims.json`):
- `claim_id`, `subject`, `type`, `content`, factual claims about the narrative world
- Types: rule, fact, inference, speculation

## Consistency Validation

The project includes a comprehensive validation system at `backend/src/validation/consistency.py` that checks data integrity:

### Validation Rules

1. **Beat ID Existence** - Ensures all beat IDs referenced in causality edges exist in the beats database
2. **No Dangling References** - Warns about potentially orphaned entity references in claims (warnings only, since claims can reference abstract concepts)
3. **No Self-Loops** - Prevents beats from causally linking to themselves
4. **Temporal Consistency** - Ensures cause beats occur before effect beats:
   - Within same episode: compares timestamps
   - Cross-episode: compares episode IDs

### Running Validation

```bash
# Via API endpoint
curl http://localhost:8000/api/validation

# Via Python
from src.validation.consistency import run_validation
report = run_validation()
print(report.summary())
```

### Validation Response

```json
{
  "valid": true,
  "total_errors": 0,
  "total_warnings": 11,
  "passed_rules": 3,
  "errors": [],
  "warnings": [...]
}
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/episodes` | List all episodes |
| `GET /api/episodes/{id}` | Episode details |
| `GET /api/episodes/{id}/scenes` | Episode scenes |
| `GET /api/characters` | List all characters |
| `GET /api/characters/{id}` | Character details |
| `GET /api/characters/{id}/relationships/graph` | D3.js graph data |
| `GET /api/characters/{id}/evolution` | Character evolution timeline |
| `GET /api/mythos` | List mythos elements |
| `GET /api/mythos/graph` | Full mythos graph |
| `GET /api/graph` | Combined relationship graph |
| `GET /api/search?q={query}` | Search all content |
| `GET /api/validation` | Run consistency validation checks |
| `GET /api/narratives/alignment` | Narrative alignment data |
| `GET /api/causality/graph` | Causality graph |
| `GET /api/knowledge/claims` | Knowledge claims |

## Important Gotchas

### Backend

1. **CORS**: Frontend must be on `localhost:3000` or `localhost:6699`
2. **Static Files**: Screenshots served from `/static/screenshots/` (mounted from `data/video_analysis/screenshots/`)
3. **Database**: SQLite file at `data/blod.db`, managed via Alembic
4. **Data Loading**: All data loaded at startup into memory dictionaries

### Frontend

1. **Port**: Dev server runs on port 6699 (not 3000)
2. **Images**: `unoptimized: true` in next.config.js for static export compatibility
3. **Theme Flash**: THEME_SCRIPT injected in `<head>` prevents flash
4. **HeroUI v3**: Uses `@heroui/styles` import, not `@heroui/theme`
5. **Tailwind v4**: New import syntax `@import "tailwindcss"`

### Data

1. **Git Ignores**: `data/transcripts/`, `data/screenshots/`, `data/branding/` contents ignored (keep `.gitkeep`)
2. **Character IDs**: Use kebab-case (e.g., `kiara-natt-och-dag`)
3. **Episode IDs**: Format `s01e01`, `s01e02`, etc.
4. **Screenshots**: Referenced by path relative to `data/video_analysis/screenshots/`

## Development Workflow

1. **Start backend first** (port 8000)
2. **Start frontend** (port 6699)
3. **Test API** at `http://localhost:8000/docs`
4. **Test frontend** at `http://localhost:6699`

## Testing

- Backend: `pytest` in `backend/` directory
- Frontend: No test runner configured (add if needed)

## Deployment Notes

- Backend: Uvicorn with `--host 0.0.0.0 --port 8000`
- Frontend: `next build` exports static files to `.next/`
- Database: SQLite file must be persisted between deployments
