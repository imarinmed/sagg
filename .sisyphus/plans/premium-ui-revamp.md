# Premium UI Revamp: Episodes, Characters, Mythos

## TL;DR

> **Quick Summary**: Transform basic list pages into premium, cinematic experiences with relationship visualizations, narrative arc displays, and sensual character profiles. Build backend data structures first, then create stunning UI components.
>
> **Deliverables**:
> - Backend: Relationship models, episode×character presence tracking, mythos connections
> - Episodes: Cinematic hero, narrative arc visualization, scene breakdown cards, character presence timeline
> - Characters: Hero portrait, relationship constellation (D3.js), evolution timeline, kink profile visualization
> - Mythos: Visual encyclopedia, interactive lore connections
>
> **Estimated Effort**: XL (25-30 tasks across 4 waves)
> **Parallel Execution**: YES - Backend Wave 1, then UI Waves 2-4
> **Critical Path**: Data Models → API Endpoints → UI Components → Integration

---

## Context

### Original Request
User wants to transform Episodes, Characters, and Mythos sections from "extremely subpar and disappointing" to "premium, visual, erotic, engaging, powerful" experiences for writers, readers, and editors.

### Interview Summary

**Key Decisions**:
- **Data Strategy**: Build data structures first (Option C) - most thorough approach
- **Hero Imagery**: Auto-extract from video screenshots (we have 100+ per episode)
- **Kink Profile Visualization**: All approaches combined (intensity meters + category tags + progressive disclosure)
- **Content Safety**: No age gates - just visual indicators for mature content

**Visual Direction**:
- Expand the existing "obsidian glass, gold and blood" landing page aesthetic
- High-end, premium, luxury notes
- Sensual without being explicit
- Cinematic presentation

### Research Findings

**Premium Patterns Identified**:
1. **Character Profiles**: Hero section with portrait, relationship constellation (D3.js), episode presence heatmap, evolution timeline
2. **Episode Guides**: Narrative arc visualization (Freytag's pyramid), scene breakdown cards, character presence timeline, intensity graphs
3. **Visual Storytelling**: Interactive relationship webs, narrative arc curves, multi-episode arc connections
4. **Sensual UI**: Content warning systems, progressive disclosure, sophisticated color psychology (burgundies, golds, midnight blues)

### Metis Review

**Guardrails Applied**:
- Build data structures before UI (user choice)
- Auto-extract imagery from existing screenshots
- Tasteful presentation of mature content
- No age gates (visual indicators only)

**AI Slop Patterns to Avoid**:
- Generic placeholder content
- Overly explicit imagery
- Cluttered information density
- Breaking existing theme consistency

---

## Work Objectives

### Core Objective
Transform three basic wiki sections into premium, cinematic experiences that serve writers with rich data visualization, engage readers with stunning presentation, and provide editors with powerful tools.

### Concrete Deliverables

**Backend (Wave 1)**:
1. Relationship data models (character → character edges with types)
2. Episode×Character presence tracking
3. Mythos connection graph data
4. Enhanced character profiles with evolution data

**Episodes Section (Wave 2-3)**:
1. Cinematic hero with auto-extracted screenshot
2. Narrative arc visualization (SVG-based)
3. Scene breakdown cards with thumbnails
4. Character presence timeline
5. Content intensity indicators
6. Interactive transcript with character highlighting

**Characters Section (Wave 2-3)**:
1. Hero portrait with dramatic gradient overlay
2. Relationship constellation (D3.js force-directed graph)
3. Character evolution timeline
4. Episode presence heatmap
5. Kink profile visualization (meters + tags + progressive disclosure)
6. Quote carousel

**Mythos Section (Wave 4)**:
1. Visual encyclopedia with category filtering
2. Interactive lore connection graph
3. Rich media integration
4. Timeline of lore evolution

### Definition of Done
- [ ] All backend data models implemented and populated
- [ ] API endpoints serve relationship, presence, and mythos data
- [ ] Episode pages have cinematic hero + narrative arc visualization
- [ ] Character pages have relationship constellation + evolution timeline
- [ ] Mythos pages have visual encyclopedia + connection graph
- [ ] All components match "obsidian glass" theme
- [ ] Build passes with no errors
- [ ] Lighthouse score >= 90

### Must Have
- Backend data structures for relationships and presence
- D3.js relationship constellation visualization
- Narrative arc visualization for episodes
- Auto-extracted hero imagery from screenshots
- Kink profile visualization (tasteful)
- Episode presence heatmap
- Interactive lore connections

### Must NOT Have (Guardrails)
- NO explicit/adult imagery (tasteful presentation only)
- NO age gates (user specified)
- NO manual image curation (auto-extract only)
- NO breaking existing landing page aesthetic
- NO performance degradation (lazy loading for heavy visualizations)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (existing test setup)
- **Automated tests**: YES (for data models and API)
- **Framework**: Existing test framework

### Agent-Executed QA Scenarios (MANDATORY)

**Every task includes direct verification via Playwright or curl.**

**Example Pattern:**
```
Scenario: Relationship constellation renders
  Tool: Playwright
  Preconditions: Backend API running, character data exists
  Steps:
    1. Navigate to /characters/kiara
    2. Wait for D3.js graph to initialize (timeout: 5s)
    3. Assert: SVG nodes visible (character circles)
    4. Assert: Connection lines between nodes
    5. Hover over Alfred node
    6. Assert: Tooltip shows "Romantic" relationship type
    7. Screenshot: .sisyphus/evidence/relationship-graph.png
  Expected Result: Interactive D3.js graph with nodes and edges
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1: Backend Data Foundation (Start Immediately)
├── Task 1: Create relationship data models
├── Task 2: Create episode×character presence tracking
├── Task 3: Create mythos connection models
├── Task 4: Populate relationship data from scene analysis
├── Task 5: Create API endpoints for new data
└── Task 6: Update character models with evolution data

Wave 2: Episode Section Premium UI (After Wave 1)
├── Task 7: Create CinematicHero component
├── Task 8: Create NarrativeArcVisualization component
├── Task 9: Create SceneBreakdownCards component
├── Task 10: Create CharacterPresenceTimeline component
├── Task 11: Create ContentIntensityIndicator component
└── Task 12: Redesign episode detail page

Wave 3: Character Section Premium UI (After Wave 1)
├── Task 13: Create CharacterHero component
├── Task 14: Create RelationshipConstellation (D3.js)
├── Task 15: Create CharacterEvolutionTimeline
├── Task 16: Create EpisodePresenceHeatmap
├── Task 17: Create KinkProfileVisualization
├── Task 18: Create QuoteCarousel
└── Task 19: Redesign character detail page

Wave 4: Mythos Section + Integration (After Waves 2-3)
├── Task 20: Create MythosVisualEncyclopedia
├── Task 21: Create LoreConnectionGraph
├── Task 22: Create MythosDetailPage
├── Task 23: Create MythosTimeline
├── Task 24: Redesign mythos list page
└── Task 25: Final integration and polish
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5 | 2, 3 |
| 2 | None | 5, 10, 16 | 1, 3 |
| 3 | None | 5, 21 | 1, 2 |
| 4 | 1 | 5 | None |
| 5 | 1, 2, 3, 4 | 14, 15, 16 | None |
| 6 | 1 | 15 | None |
| 7 | None | 12 | 8, 9, 10, 11 |
| 8 | None | 12 | 7, 9, 10, 11 |
| 9 | None | 12 | 7, 8, 10, 11 |
| 10 | 2 | 12 | 7, 8, 9, 11 |
| 11 | None | 12 | 7, 8, 9, 10 |
| 12 | 7-11 | None | None |
| 13 | None | 19 | 14, 15, 16, 17, 18 |
| 14 | 5 | 19 | 13, 15, 16, 17, 18 |
| 15 | 5, 6 | 19 | 13, 14, 16, 17, 18 |
| 16 | 2, 5 | 19 | 13, 14, 15, 17, 18 |
| 17 | None | 19 | 13-16, 18 |
| 18 | None | 19 | 13-17 |
| 19 | 13-18 | None | None |
| 20 | None | 24 | 21, 22, 23 |
| 21 | 3, 5 | 24 | 20, 22, 23 |
| 22 | None | 24 | 20, 21, 23 |
| 23 | None | 24 | 20-22 |
| 24 | 20-23 | 25 | None |
| 25 | 12, 19, 24 | None | None |

---

## TODOs

### Wave 1: Backend Data Foundation

- [ ] 1. Create Relationship Data Models

  **What to do**:
  - Create SQLAlchemy models in backend:
    ```python
    class CharacterRelationship(Base):
        id: str
        from_character_id: str (FK)
        to_character_id: str (FK)
        relationship_type: str  # romantic, familial, antagonistic, sire/progeny
        intensity: int  # 1-5
        start_episode: str (optional)
        end_episode: str (optional)
        description: str
    ```
  - Create Pydantic schemas for API
  - Create migration

  **Data Population Strategy**:
  - Extract from existing scene dialogue analysis
  - Parse character co-occurrence patterns
  - Manual curation for key relationships (Kiara-Alfred, etc.)

  **Must NOT do**:
  - Don't create circular relationships without validation
  - Don't allow duplicate edges in same direction

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` (data modeling)
  - **Skills**: None (Python/SQLAlchemy work)

  **Parallelization**: Can run with Tasks 2, 3

  **Acceptance Criteria**:
  - [ ] Migration creates relationship table
  - [ ] API can CRUD relationships
  - [ ] Validation prevents duplicates

- [ ] 2. Create Episode×Character Presence Tracking

  **What to do**:
  - Create model:
    ```python
    class EpisodeCharacterPresence(Base):
        id: str
        episode_id: str (FK)
        character_id: str (FK)
        scene_appearances: List[str]  # scene IDs
        total_screen_time: int  # seconds (estimated)
        importance_rating: int  # 1-5 (main, supporting, background)
        first_appearance_timestamp: str
        last_appearance_timestamp: str
    ```
  - Populate from video analysis data (we have character detection per moment)
  - Aggregate moments into presence records

  **Must NOT do**:
  - Don't duplicate existing scene character data
  - Don't calculate exact screen time (estimate from moments)

  **Acceptance Criteria**:
  - [ ] Presence data available for all episodes
  - [ ] API endpoint: GET /api/episodes/{id}/character-presence
  - [ ] Heatmap data format ready for frontend

- [ ] 3. Create Mythos Connection Models

  **What to do**:
  - Create model:
    ```python
    class MythosConnection(Base):
        id: str
        from_element_id: str (FK)
        to_element_id: str (FK)
        connection_type: str  # prerequisite, related, contradicts, evolves_to
        description: str
    ```
  - Create rich content model for mythos elements:
    ```python
    class MythosElement(Base):
        id: str
        name: str
        category: str
        description: str (markdown)
        related_episodes: List[str]
        related_characters: List[str]
        media_urls: List[str]  # images, diagrams
    ```

  **Acceptance Criteria**:
  - [ ] Mythos connections queryable
  - [ ] Graph data format for D3.js
  - [ ] Rich content fields populated

- [ ] 4. Populate Relationship Data from Scene Analysis

  **What to do**:
  - Write script to analyze existing scene data
  - Detect character co-occurrence patterns
  - Infer relationship types from dialogue context
  - Create initial relationship records
  - Flag for manual review

  **Algorithm**:
  ```python
  for episode in episodes:
      for scene in episode.scenes:
          characters_in_scene = scene.characters
          for char1 in characters_in_scene:
              for char2 in characters_in_scene:
                  if char1 != char2:
                      increment_cooccurrence(char1, char2)
                      if dialogue_shows_relationship(char1, char2):
                          create_relationship_record()
  ```

  **Acceptance Criteria**:
  - [ ] >50 relationship records created
  - [ ] Key relationships identified (Kiara-Alfred, etc.)
  - [ ] Data exportable for manual review

- [ ] 5. Create API Endpoints for New Data

  **What to do**:
  - `GET /api/characters/{id}/relationships` - all relationships for character
  - `GET /api/characters/{id}/relationships/graph` - graph format for D3.js
  - `GET /api/episodes/{id}/character-presence` - presence data
  - `GET /api/episodes/{id}/character-presence/heatmap` - heatmap format
  - `GET /api/mythos/{id}/connections` - connected elements
  - `GET /api/mythos/graph` - full mythos graph

  **Must NOT do**:
  - Don't break existing endpoints
  - Don't expose internal IDs unnecessarily

  **Acceptance Criteria**:
  - [ ] All endpoints return valid JSON
  - [ ] Graph endpoints return D3-compatible format
  - [ ] Tests pass

- [ ] 6. Update Character Models with Evolution Data

  **What to do**:
  - Add to Character model:
    ```python
    evolution_milestones: List[{
        episode_id: str,
        timestamp: str,
        milestone_type: str,  # first_appearance, relationship_change, power_awakening, etc.
        description: str
    }]
    ```
  - Populate from episode analysis
  - Track key moments per character

  **Acceptance Criteria**:
  - [ ] Evolution data queryable
  - [ ] Timeline format for frontend

### Wave 2: Episode Section Premium UI

- [ ] 7. Create CinematicHero Component

  **What to do**:
  - Full-width hero section with:
    - Auto-extracted screenshot as background (from video analysis)
    - Gradient overlay (obsidian glass theme)
    - Episode title with dramatic typography
    - Quick stats (duration, air date, intensity rating)
    - Navigation breadcrumbs
  - Responsive design
  - Parallax scroll effect

  **Props Interface**:
  ```typescript
  interface CinematicHeroProps {
    episode: Episode;
    screenshotUrl: string;
    intensityRating: number;
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`

  **Acceptance Criteria**:
  - [ ] Hero displays episode screenshot
  - [ ] Gradient overlay matches theme
  - [ ] Responsive on all breakpoints
  - [ ] Parallax effect smooth

- [ ] 8. Create NarrativeArcVisualization Component

  **What to do**:
  - SVG-based visualization showing:
    - Freytag's pyramid structure
    - Intensity curve (line chart)
    - Beat markers (inciting incident, rising action, climax, falling action, resolution)
    - Episode position indicator
  - Interactive tooltips on hover
  - Color-coded by content type

  **Implementation**:
  - Use D3.js or custom SVG
  - Data from narrative analysis (already have narrative_beats)
  - Smooth curves using bezier paths

  **Props Interface**:
  ```typescript
  interface NarrativeArcProps {
    beats: NarrativeBeats;
    moments: VideoMoment[];
    duration: number;
  }
  ```

  **Acceptance Criteria**:
  - [ ] SVG renders dramatic structure
  - [ ] Intensity curve visible
  - [ ] Interactive tooltips work
  - [ ] Responsive scaling

- [ ] 9. Create SceneBreakdownCards Component

  **What to do**:
  - Horizontal scrollable cards showing:
    - Scene thumbnail (from video analysis)
    - Timestamp
    - Characters present (chips)
    - Content type badge
    - Intensity indicator
    - Brief description
  - Click to expand full scene details
  - Smooth scroll with snap points

  **Props Interface**:
  ```typescript
  interface SceneBreakdownProps {
    scenes: Scene[];
    screenshots: Screenshot[];
    onSceneClick: (scene: Scene) => void;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Cards display scene data
  - [ ] Horizontal scroll smooth
  - [ ] Thumbnails load correctly
  - [ ] Click expansion works

- [ ] 10. Create CharacterPresenceTimeline Component

  **What to do**:
  - Visual timeline showing:
    - Episode duration as horizontal bar
    - Character presence as colored segments
    - Character avatars on left
    - Hover shows exact timestamps
    - Click filters to that character's moments
  - Similar to video editor timeline

  **Props Interface**:
  ```typescript
  interface CharacterPresenceProps {
    presenceData: EpisodeCharacterPresence[];
    characters: Character[];
    duration: number;
    onCharacterClick: (characterId: string) => void;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Timeline shows all characters
  - [ ] Presence segments accurate
  - [ ] Hover tooltips work
  - [ ] Click filtering works

- [ ] 11. Create ContentIntensityIndicator Component

  **What to do**:
  - Elegant visualization of mature content:
    - Intensity meter (1-5) with gradient
    - Content type icons (vampire feeding, intimacy, etc.)
    - Tasteful presentation (no explicit text)
    - Color-coded by intensity
    - Progressive disclosure (hover for details)

  **Design**:
  - Use existing IntensitySlider as base
  - Add content type icons
  - Gold/crimson gradient for high intensity
  - Soft blur for suggestive content

  **Props Interface**:
  ```typescript
  interface ContentIntensityProps {
    overallRating: number;
    contentTypes: Array<{
      type: string;
      intensity: number;
      timestamp?: string;
    }>;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Intensity clearly visible
  - [ ] Content types identifiable
  - [ ] Tasteful presentation
  - [ ] Progressive disclosure works

- [ ] 12. Redesign Episode Detail Page

  **What to do**:
  - Integrate all new components:
    - CinematicHero at top
    - NarrativeArcVisualization below
    - Tabs for: Overview, Scenes, Characters, Gallery
    - SceneBreakdownCards in Scenes tab
    - CharacterPresenceTimeline in Characters tab
    - ScreenshotGallery in Gallery tab
  - Maintain existing transcript functionality
  - Responsive layout

  **Must NOT do**:
  - Don't lose existing functionality
  - Don't break mobile layout

  **Acceptance Criteria**:
  - [ ] All components integrated
  - [ ] Tabs work correctly
  - [ ] Responsive design
  - [ ] Build passes

### Wave 3: Character Section Premium UI

- [ ] 13. Create CharacterHero Component

  **What to do**:
  - Dramatic hero section with:
    - Character portrait (auto-extracted from screenshots)
    - Gradient overlay with character color theme
    - Name with elegant typography
    - Quick stats (episodes appeared, relationships, etc.)
    - Quote carousel below
  - Parallax effect
  - Responsive

  **Props Interface**:
  ```typescript
  interface CharacterHeroProps {
    character: Character;
    portraitUrl: string;
    stats: {
      episodesAppeared: number;
      relationships: number;
      totalScreenTime: string;
    };
  }
  ```

  **Acceptance Criteria**:
  - [ ] Hero displays character data
  - [ ] Portrait loads correctly
  - [ ] Stats accurate
  - [ ] Responsive

- [ ] 14. Create RelationshipConstellation Component (D3.js)

  **What to do**:
  - Force-directed graph showing:
    - Character as central node
    - Connected characters as surrounding nodes
    - Edge thickness = relationship intensity
    - Edge color = relationship type
    - Node size = screen time/importance
    - Interactive: hover for details, click to navigate
  - Zoom and pan capabilities
  - Smooth animations

  **Implementation**:
  - Use D3.js force simulation
  - SVG rendering
  - Responsive sizing
  - Performance optimization (node limit if needed)

  **Props Interface**:
  ```typescript
  interface RelationshipConstellationProps {
    characterId: string;
    relationships: CharacterRelationship[];
    characters: Character[];
    onNodeClick: (characterId: string) => void;
  }
  ```

  **Acceptance Criteria**:
  - [ ] D3.js graph renders
  - [ ] Nodes and edges visible
  - [ ] Interactive hover/click works
  - [ ] Zoom/pan functional
  - [ ] Responsive

- [ ] 15. Create CharacterEvolutionTimeline Component

  **What to do**:
  - Vertical timeline showing:
    - Character's journey across episodes
    - Key milestones (first appearance, relationship changes, etc.)
    - Episode thumbnails
    - Descriptions of evolution
    - Interactive: click to jump to episode
  - Smooth scroll
  - Animation on scroll into view

  **Props Interface**:
  ```typescript
  interface CharacterEvolutionProps {
    characterId: string;
    milestones: EvolutionMilestone[];
    episodes: Episode[];
  }
  ```

  **Acceptance Criteria**:
  - [ ] Timeline renders milestones
  - [ ] Episode thumbnails load
  - [ ] Click navigation works
  - [ ] Animation smooth

- [ ] 16. Create EpisodePresenceHeatmap Component

  **What to do**:
  - Calendar-style grid showing:
    - Episodes as columns
    - Presence intensity as color intensity
    - Hover shows exact screen time
    - Click navigates to episode
  - Color gradient: transparent → gold → crimson
  - Compact but informative

  **Props Interface**:
  ```typescript
  interface EpisodePresenceHeatmapProps {
    characterId: string;
    presenceData: EpisodeCharacterPresence[];
    episodes: Episode[];
    onEpisodeClick: (episodeId: string) => void;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Heatmap renders correctly
  - [ ] Color intensity accurate
  - [ ] Hover tooltips work
  - [ ] Click navigation works

- [ ] 17. Create KinkProfileVisualization Component

  **What to do**:
  - Tasteful visualization combining:
    - **Intensity Meters**: Radial or bar meters for each preference/limit
    - **Category Tags**: Color-coded chips (power exchange, roles, etc.)
    - **Progressive Disclosure**: Cards that expand on hover
    - **Evolution Tracking**: How profile changes across episodes
  - Elegant, sensual design without explicit imagery
  - Privacy-conscious (expandable sections)

  **Design Elements**:
  - Radial intensity gauges (0-5)
  - Category color coding
  - Glassmorphic cards
  - Soft animations

  **Props Interface**:
  ```typescript
  interface KinkProfileProps {
    profile: KinkProfile;
    evolution: KinkEvolution[];
  }
  ```

  **Acceptance Criteria**:
  - [ ] Intensity meters render
  - [ ] Category tags color-coded
  - [ ] Progressive disclosure works
  - [ ] Tasteful presentation
  - [ ] Evolution tracking visible

- [ ] 18. Create QuoteCarousel Component

  **What to do**:
  - Rotating carousel of memorable quotes:
    - Quote text with elegant typography
    - Episode context
    - Character avatar
    - Navigation dots
    - Auto-rotate with pause on hover
  - Smooth transitions
  - Responsive

  **Props Interface**:
  ```typescript
  interface QuoteCarouselProps {
    quotes: Array<{
      text: string;
      episodeId: string;
      timestamp: string;
      context: string;
    }>;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Quotes display correctly
  - [ ] Auto-rotate works
  - [ ] Pause on hover works
  - [ ] Navigation functional

- [ ] 19. Redesign Character Detail Page

  **What to do**:
  - Integrate all new components:
    - CharacterHero at top
    - Tabs for: Overview, Relationships, Evolution, Gallery
    - RelationshipConstellation in Relationships tab
    - CharacterEvolutionTimeline in Evolution tab
    - EpisodePresenceHeatmap in Overview tab
    - KinkProfileVisualization in Overview tab
    - QuoteCarousel below hero
  - Maintain existing character info
  - Responsive layout

  **Acceptance Criteria**:
  - [ ] All components integrated
  - [ ] Tabs work correctly
  - [ ] Responsive design
  - [ ] Build passes

### Wave 4: Mythos Section + Integration

- [ ] 20. Create MythosVisualEncyclopedia Component

  **What to do**:
  - Grid-based encyclopedia with:
    - Category filtering (biology, society, supernatural)
    - Search functionality
    - Rich cards with:
      - Element image/icon
      - Name and category
      - Brief description
      - Related episode count
    - Hover effects
    - Click to detail view
  - Responsive grid

  **Props Interface**:
  ```typescript
  interface MythosEncyclopediaProps {
    elements: MythosElement[];
    categories: string[];
    onElementClick: (elementId: string) => void;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Grid renders all elements
  - [ ] Filtering works
  - [ ] Search functional
  - [ ] Cards interactive

- [ ] 21. Create LoreConnectionGraph Component

  **What to do**:
  - Interactive graph showing:
    - Mythos elements as nodes
    - Connections as edges
    - Connection types color-coded
    - Zoom and pan
    - Click to navigate
    - Filter by connection type
  - D3.js implementation
  - Force-directed layout

  **Props Interface**:
  ```typescript
  interface LoreConnectionGraphProps {
    elements: MythosElement[];
    connections: MythosConnection[];
    onNodeClick: (elementId: string) => void;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Graph renders
  - [ ] Nodes and edges visible
  - [ ] Interactive features work
  - [ ] Filtering functional

- [ ] 22. Create MythosDetailPage Component

  **What to do**:
  - Rich detail page for each mythos element:
    - Hero section with image
    - Full description (markdown)
    - Related episodes list
    - Related characters
    - Connected elements (mini graph)
    - Media gallery (images, diagrams)
  - Elegant typography
  - Responsive

  **Acceptance Criteria**:
  - [ ] Detail page renders
  - [ ] All content displays
  - [ ] Related items linked
  - [ ] Media gallery works

- [ ] 23. Create MythosTimeline Component

  **What to do**:
  - Timeline showing:
    - Evolution of vampire lore across episodes
    - When concepts are introduced
    - How understanding develops
    - Key revelations
  - Vertical layout
  - Episode thumbnails
  - Interactive

  **Acceptance Criteria**:
  - [ ] Timeline renders
  - [ ] Chronological order correct
  - [ ] Interactive elements work

- [ ] 24. Redesign Mythos List Page

  **What to do**:
  - Replace basic grid with:
    - MythosVisualEncyclopedia as main view
    - Toggle between grid and graph view
    - Category sidebar
    - Search bar
    - Featured elements section
  - Premium presentation
  - Responsive

  **Acceptance Criteria**:
  - [ ] Encyclopedia integrated
  - [ ] View toggle works
  - [ ] Search functional
  - [ ] Responsive

- [ ] 25. Final Integration and Polish

  **What to do**:
  - Ensure all pages work together:
    - Consistent navigation
    - Shared components reused
    - Theme consistency
    - Performance optimization
  - Add loading states
  - Error handling
  - Accessibility checks
  - Mobile optimization

  **Acceptance Criteria**:
  - [ ] All pages integrated
  - [ ] Navigation consistent
  - [ ] Performance good (Lighthouse >90)
  - [ ] Mobile optimized
  - [ ] Build passes

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1 | `feat(db): add relationship models` | backend models |
| 2 | `feat(db): add episode character presence tracking` | backend models |
| 3 | `feat(db): add mythos connection models` | backend models |
| 4 | `feat(data): populate relationships from scenes` | data script |
| 5 | `feat(api): add relationship and presence endpoints` | backend API |
| 6 | `feat(db): add character evolution data` | backend models |
| 7 | `feat(ui): add CinematicHero component` | frontend components |
| 8 | `feat(ui): add NarrativeArcVisualization` | frontend components |
| 9 | `feat(ui): add SceneBreakdownCards` | frontend components |
| 10 | `feat(ui): add CharacterPresenceTimeline` | frontend components |
| 11 | `feat(ui): add ContentIntensityIndicator` | frontend components |
| 12 | `feat(ui): redesign episode detail page` | frontend pages |
| 13 | `feat(ui): add CharacterHero component` | frontend components |
| 14 | `feat(ui): add RelationshipConstellation` | frontend components |
| 15 | `feat(ui): add CharacterEvolutionTimeline` | frontend components |
| 16 | `feat(ui): add EpisodePresenceHeatmap` | frontend components |
| 17 | `feat(ui): add KinkProfileVisualization` | frontend components |
| 18 | `feat(ui): add QuoteCarousel` | frontend components |
| 19 | `feat(ui): redesign character detail page` | frontend pages |
| 20 | `feat(ui): add MythosVisualEncyclopedia` | frontend components |
| 21 | `feat(ui): add LoreConnectionGraph` | frontend components |
| 22 | `feat(ui): add MythosDetailPage` | frontend pages |
| 23 | `feat(ui): add MythosTimeline` | frontend components |
| 24 | `feat(ui): redesign mythos list page` | frontend pages |
| 25 | `feat(ui): final integration and polish` | all files |

---

## Success Criteria

### Verification Commands
```bash
# Backend tests
cd backend && pytest

# Frontend build
cd frontend && bun run build

# Lighthouse audit
lighthouse http://localhost:3000/episodes/s01e01 --output=json
lighthouse http://localhost:3000/characters/kiara --output=json
lighthouse http://localhost:3000/mythos --output=json
```

### Final Checklist
- [ ] All 25 tasks complete
- [ ] Backend data models implemented
- [ ] API endpoints functional
- [ ] All UI components render correctly
- [ ] D3.js visualizations interactive
- [ ] Responsive on all breakpoints
- [ ] Theme consistency maintained
- [ ] Performance optimized (Lighthouse >90)
- [ ] Build passes
- [ ] No console errors

---

## Summary

This plan transforms three basic wiki sections into premium, cinematic experiences:

**Episodes**: From basic list to cinematic hero + narrative arc visualization + scene breakdown cards + character presence timeline

**Characters**: From simple profile to dramatic hero + relationship constellation + evolution timeline + kink profile visualization

**Mythos**: From static list to visual encyclopedia + interactive lore connections + timeline

**Timeline**: 4 waves over ~25-30 tasks, starting with backend data structures, then UI components, then integration.

Ready to begin execution?