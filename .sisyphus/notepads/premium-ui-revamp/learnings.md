# Premium UI Revamp - Learnings

## Task 2: Episode×Character Presence Tracking

### Architecture Discovery
- Project uses pure Pydantic models + JSON files, NOT SQLAlchemy/Alembic
- Data loaded into in-memory dictionaries at module init
- No database migrations needed - data loading functions serve that purpose

### Implementation Approach
1. Created `EpisodeCharacterPresence` and `KeyMomentSummary` Pydantic models
2. Added `load_character_presence_from_video_analysis()` function to aggregate character appearances from video analysis moments
3. Screen time estimated from moment count × 3 seconds (average interval)
4. Importance rating derived from moment frequency: 1-2=low, 3-4=medium, 5+=high

### Key Data Sources
- `video_analysis_v2.json` has `characters_present` array in each moment
- Character IDs like `alfred`, `kiara_natt_och_dag`, `eric`, `chloe`, etc.
- Episodes have 5-40+ characters with varied appearances

### API Endpoint
- `GET /api/episodes/{id}/character-presence` returns `EpisodeCharacterPresenceResponse`
- Sorted by importance_rating DESC, moment_count DESC
- Includes first/last appearance timestamps, key moments, avg intensity

### Reusable Patterns
- Aggregating data from moments: collect by character_id, then compute metrics
- Importance rating calculation: moment count → 5-level scale
- Scene linking: cross-reference scenes_db by episode_id and character presence

## Task 3: Mythos Connection Models

### Architecture Confirmation
- Consistent with Task 2: file-based data system (YAML/JSON), no SQLAlchemy/Alembic
- Data loaded at module initialization in `backend/src/data.py`
- Models are Pydantic BaseModel classes for serialization, not ORM models

### Implementation Approach
1. Enhanced MythosElement model with new fields:
   - `short_description` for cards/previews
   - `related_episodes`, `related_characters` as lists
   - `media_urls` for images
   - `traits`, `abilities`, `weaknesses` arrays
   - Dark adaptation fields: `dark_variant`, `erotic_implications`, `horror_elements`, `taboo_potential`
   - Timestamps: `created_at`, `updated_at`

2. Created MythosConnection model:
   - Directed connections between elements
   - Connection types: prerequisite, related, contradicts, evolves_to, explains
   - Strength rating 1-5
   - Validation against self-referential connections (model_post_init)
   - Regex pattern validation for connection_type

3. Data storage pattern:
   - Individual YAML files for each mythos element in `data/mythos/`
   - Connections stored in `data/mythos/connections.json`
   - Loader validates no duplicate connections using set tracking

### API Endpoints Added
- `GET /api/mythos` - List with optional category filter
- `GET /api/mythos/categories` - List all unique categories
- `GET /api/mythos/connections` - List with type/element filters
- `GET /api/mythos/connections/types` - List valid connection types
- `GET /api/mythos/{id}` - Single element with all enhanced fields
- `GET /api/mythos/{id}/connections` - Connections for specific element (both directions)

### Seed Data Statistics
- 7 enhanced mythos elements with rich markdown content
- 10 connections establishing relationships between elements
- Categories distribution: biology (4), society (2), supernatural (1)

### Validation
- QA scenario passes: 7 elements returned from API
- All 10 connections properly loaded and queryable
- Enhanced fields populated from YAML structure (dark_variant, horror_elements, etc.)

### Reusable Patterns
- Connection validation: seen_pairs set to prevent duplicates
- Bidirectional connection queries: filter by from_element_id OR to_element_id
- Category filtering with Pydantic Query parameters

## Task 4: Populate Relationship Data from Scene Analysis

### Implementation Approach
1. Created `scripts/extract_relationships.py` to analyze video_analysis_v2.json
2. Extracts character co-occurrences from moments where multiple characters are present
3. Infers relationship types from content_type distribution and description keywords
4. Outputs to `data/character_relationships.json`

### Relationship Type Inference Logic
- `familial`: Characters sharing `_natt_och_dag` surname suffix
- `romantic`: high `physical_intimacy`/`romance` content or romantic keywords
- `antagonistic`: high `confrontation` content or conflict keywords
- `professional`: one character has `teacher` or `principal` in ID
- `social`: high `party`/`dance` content (>50% of co-occurrences)
- `friendship`: frequent co-appearances (>10) or friendship keywords
- `supernatural`: vampire-related events present
- `acquaintance`: default fallback

### Data Merge Strategy
- YAML relationships from character files have semantic precedence
- Extracted relationships fill gaps for character pairs not defined in YAML
- Duplicate detection checks both directions (A-B and B-A)
- Total: 121 relationships (27 YAML + 94 extracted)

### QA Results
- 103 relationships extracted from video analysis (exceeds 50 target)
- Kiara-Alfred relationship exists with correct `love_interest` type from YAML
- Relationship types breakdown: social (62), professional (17), antagonistic (10), etc.

### Key Learnings
- Video analysis content_types (`party`, `dance`, `dialogue`) are broad - not enough for romantic/familial inference
- YAML character files have richer semantic relationships (love_interest, best_friend, daughter, etc.)
- Direction determined by character importance: protagonists → supporting → minor

### API Endpoints (existing, now with more data)
- `GET /characters/{id}/relationships` - relationships involving a character
- `GET /characters/{id}/relationships/graph` - D3.js graph visualization data

## Task 5: Create API Endpoints for New Data

### Implementation Overview
Created comprehensive API endpoints for character relationships, episode presence, and mythos graphs with D3.js-compatible output formats.

### New Pydantic Models Added (models.py)
1. **D3.js Graph Models**:
   - `D3GraphNode`: id, name, group (for coloring), radius (for size), color, metadata
   - `D3GraphLink`: source, target, type, value (for weight/thickness), color
   - `D3GraphData`: nodes[] + links[] base class

2. **Response Models**:
   - `RelationshipGraphResponse`: D3GraphData + center_character_id, totals
   - `EpisodePresenceEntry`: episode_id, intensity, screen_time, moment_count
   - `CharacterHeatmapData`: character_id, name, episodes[], totals
   - `EpisodeHeatmapResponse`: episode_id, title, characters[]
   - `CharacterEpisodePresenceResponse`: character across all episodes
   - `MythosGraphResponse`: full mythos graph + categories list

### Character Relationship Endpoints (characters.py)
- `GET /{id}/relationships` - existing, returns List[Relationship]
- `GET /{id}/relationships/graph` - **NEW**: D3.js format with depth traversal
- `POST /relationships` - **NEW**: create new relationship
- `PUT /relationships/{id}` - **NEW**: update relationship
- `DELETE /relationships/{id}` - **NEW**: delete relationship
- `GET /{id}/episode-presence` - **NEW**: character's presence across episodes

### Episode Presence Endpoints (episodes.py)
- `GET /{id}/character-presence` - existing, returns EpisodeCharacterPresenceResponse
- `GET /{id}/character-presence/heatmap` - **NEW**: heatmap format for D3.js

### Mythos Graph Endpoints (mythos.py)
- `GET /graph` - **NEW**: full mythos graph in D3.js format
- `GET /{id}/connections` - existing, returns connections for element

### D3.js Graph Format Patterns
1. **Node grouping by type**: Uses lookup tables (CATEGORY_GROUPS, RELATIONSHIP_TYPE_GROUPS)
2. **Node/link coloring**: Category-based colors (biology=red, society=purple, supernatural=blue)
3. **Center node emphasis**: Larger radius (30 vs 20), gold color (#c9a227)
4. **Link strength/value**: Based on relationship type importance

### Graph Traversal Pattern
```python
current_layer = {center_character_id}
for _ in range(depth):
    next_layer = set()
    for rel in relationships_db.values():
        if rel.from_character_id in current_layer or rel.to_character_id in current_layer:
            # Add to next_layer, track relationships
    current_layer = next_layer
```

### Heatmap Data Pattern
Single episode: returns all characters with their presence metrics
Single character: returns all episodes with their presence metrics

### QA Results
- Character relationships graph: 8 nodes, 13 links for Kiara
- Episode heatmap: 16 characters for s01e01
- Mythos graph: 7 nodes, 10 links, 3 categories
- All CRUD operations working (POST 201, PUT 200, DELETE 204)

### API Design Principles Applied
1. Consistent response format across D3 endpoints
2. Metadata includes relevant context (role, family, category)
3. Totals/counts in response for frontend convenience
4. Optional depth parameter for graph traversal control

## Task 6: Character Evolution Tracking

### Implementation Overview
Added character evolution milestone tracking to follow how characters change across episodes, with extraction from video analysis and rich API endpoints.

### Models Added (models.py)
1. **CharacterEvolutionMilestone**: Core model for tracking evolution moments
   - id, character_id, episode_id, timestamp (HH:MM:SS format)
   - milestone_type: validated via regex pattern (first_appearance, relationship_change, power_awakening, character_growth, trauma, triumph, revelation)
   - importance (1-5), intensity (1-5), description, quote
   - related_characters[], screenshot_path, content_type

2. **CharacterEvolutionResponse**: Full evolution data for a character
   - character_id, character_name, first_appearance_episode
   - character_arc_summary (from YAML adaptation.arc_dark)
   - milestones[] + timeline[] (frontend-optimized format)

3. **CharacterEvolutionSummary**: Compact summary for listings
   - milestone_count, latest_milestone_type, arc_completion_percentage

### Extraction Script (scripts/extract_evolution.py)
1. **First Appearance Detection**: Track first moment each character appears
2. **Milestone Extraction**: Moments with intensity >= 4 become milestones
3. **Type Inference Algorithm**:
   - Checks content_type (vampire_feeding → power_awakening/revelation)
   - Keyword analysis in description
   - Character vampire status from YAML
4. **Importance Calculation**:
   - First appearances = 5
   - Screenshot presence = +1
   - High-intensity content types = +1

### Data Storage Pattern
- `data/character_evolution.json`: Array of milestone objects
- `data/character_evolution_metadata.json`: first_appearances map + arc_summaries
- Loader in data.py: `load_character_evolution_from_json()`

### API Endpoints Added (characters.py)
- `GET /evolution/types` - List valid milestone types (7 types)
- `GET /evolution/summary` - All characters' evolution summaries, sorted by milestone_count
- `GET /{id}/evolution` - Full evolution for character with timeline format
  - Query params: milestone_type, min_importance (filters)

### Timeline Format (Frontend-Optimized)
```json
{
  "id": "evo_kiara_s01e03_0020",
  "episode_id": "s01e03",
  "episode_title": "Lunch hos Natt och Dag",
  "timestamp": "0:09:30",
  "type": "first_appearance",
  "description": "...",
  "importance": 5,
  "intensity": 4,
  "related_characters": ["eric", "elise"],
  "screenshot_path": "..."
}
```

### QA Results
- 98 milestones extracted for 18 characters
- Kiara has 9 milestones (first_appearance in s01e03)
- Top characters by milestones: Eric (20), Elise (13), Alfred (10)
- Milestone type distribution: character_growth (77), first_appearance (18), revelation (2), relationship_change (1)
- All API endpoints return correct data

### Arc Completion Calculation
- Based on episodes with milestones / total episodes (7)
- Eric/Elise: 85.7% (6/7 episodes), Alfred: 71.4% (5/7 episodes)

### Reusable Patterns
- Metadata separation: Core milestones in one file, derived data in metadata file
- Type inference from multiple signals (content_type + description + character data)
- Dual response format: raw milestones for processing, timeline for display
