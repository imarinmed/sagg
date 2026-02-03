# Blod Wiki API Reference

## Quick Start

```bash
cd /Users/wolfy/Developer/2026.Y/bats/backend
uv run uvicorn src.main:app --host 127.0.0.1 --port 8000
```

API available at: http://localhost:8000
Swagger UI: http://localhost:8000/docs
OpenAPI Schema: http://localhost:8000/openapi.json

## Endpoints

### Episodes
- `GET /api/episodes` - List all episodes
- `GET /api/episodes/{episode_id}` - Get episode by ID
- `GET /api/episodes/{episode_id}/scenes` - Get scenes in episode

Example:
```bash
curl http://localhost:8000/api/episodes
curl http://localhost:8000/api/episodes/ep1
curl http://localhost:8000/api/episodes/ep1/scenes
```

### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/{character_id}` - Get character by ID
- `GET /api/characters/{character_id}/relationships` - Get character relationships

Example:
```bash
curl http://localhost:8000/api/characters
curl http://localhost:8000/api/characters/char1
curl http://localhost:8000/api/characters/char1/relationships
```

### Mythos Elements
- `GET /api/mythos` - List all mythos elements
- `GET /api/mythos/{mythos_id}` - Get mythos element by ID

Example:
```bash
curl http://localhost:8000/api/mythos
curl http://localhost:8000/api/mythos/myth1
```

### Graph Data (for visualization)
- `GET /api/graph` - Get full graph (nodes + edges)
- `GET /api/graph/related/{entity_id}` - Get subgraph of related entities

Example:
```bash
curl http://localhost:8000/api/graph
curl http://localhost:8000/api/graph/related/char1
```

### Utility
- `GET /health` - Health check
- `GET /` - Root endpoint
- `GET /docs` - Swagger UI

## Sample Data

### Episodes
- `ep1`: "Väntan" (Season 1, Episode 1)
- `ep2`: "Möte" (Season 1, Episode 2)

### Characters
- `char1`: Fiona (Lund, Protagonist)
- `char2`: Sebastian (Falk, Love Interest)
- `char3`: Isabelle (Friend)

### Mythos
- `myth1`: Vampirism (Supernatural)
- `myth2`: The Bloodline (Family)

## Response Format

All responses are JSON with proper HTTP status codes:
- 200: Success
- 404: Resource not found
- 500: Server error

Example response:
```json
{
  "id": "ep1",
  "title": "Väntan",
  "episode_number": 1,
  "season": 1,
  "air_date": "2025-02-01",
  "description": "The beginning of a dark journey",
  "synopsis": "Introduction to the world of Blod svett tårar"
}
```

## Development Notes

### Architecture
- **Framework**: FastAPI (async Python web framework)
- **Storage**: In-memory dictionaries (ready for database swap)
- **Validation**: Pydantic models for type safety
- **Documentation**: Auto-generated OpenAPI schema

### Module Structure
```
src/
├── main.py           - FastAPI app, router registration, CORS
├── models.py         - Pydantic models for all entities
├── data.py           - In-memory storage with sample data
└── api/
    ├── episodes.py   - Episode endpoints
    ├── characters.py - Character endpoints
    ├── mythos.py     - Mythos endpoints
    └── graph.py      - Graph endpoints
```

### Adding a New Endpoint

1. Add model to `models.py`
2. Add data to `data.py`
3. Create router in `api/new_entity.py`
4. Import and register in `main.py`

### Switching to Database

Replace `data.py` with SQLAlchemy queries. All function signatures stay the same.

### CORS Configuration

Frontend CORS enabled for: `http://localhost:3000`

To change:
```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Change this
    ...
)
```

## Testing

```bash
# Test all endpoints
curl -s http://localhost:8000/health | python3 -m json.tool
curl -s http://localhost:8000/api/episodes | python3 -m json.tool
curl -s http://localhost:8000/api/characters | python3 -m json.tool
curl -s http://localhost:8000/api/mythos | python3 -m json.tool
curl -s http://localhost:8000/api/graph | python3 -m json.tool
```

## Next Steps

1. **Database Integration** - Connect to PostgreSQL
2. **Write Endpoints** - Implement POST/PUT/DELETE
3. **Authentication** - Add JWT/OAuth2
4. **Search** - Add full-text search endpoints
5. **Pagination** - Add limit/offset to list endpoints
