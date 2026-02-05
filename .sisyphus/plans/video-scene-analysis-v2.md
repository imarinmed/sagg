# Video Scene Analysis v2 + Episode UI Redesign

## TL;DR

> **Quick Summary**: Transform the current basic video analysis (20 screenshots/episode, limited character detection) into a comprehensive scene intelligence system with intensity-based screenshot extraction, expanded character detection, and a premium episode UI featuring visual timelines, screenshot galleries, and content type indicators.
>
> **Deliverables**:
> - Enhanced video analyzer with intensity-based screenshot extraction (100+ screenshots/episode)
> - Expanded character detection (15+ new secondary characters)
> - Scene grouping algorithm for "all characters in scene" detection
> - New Episode UI with: Visual Timeline, Screenshot Gallery, Content Type Badges, Intensity Heatmap, Character Presence Tracker
> - Integration of video_analysis.json into episode detail pages
>
> **Estimated Effort**: Large (15-20 tasks)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Video Analyzer v2 → Scene Grouping → API Integration → Episode UI Components

---

## Context

### Original Request
User wants to:
1. Review current video analysis for gaps
2. Add more secondary characters to detection
3. **INCREASE screenshot extraction** AND make it **intensity-based** (more screenshots for high-intensity/sexual/physical scenes like cheerleader practice)
4. Integrate analysis outputs into the episode UI (currently "extremely subpar")
5. Implement second pass for "all characters in scene" detection
6. Identify additional improvements

### Research Findings

**Current State Analysis**:
- 7 episodes analyzed (S01E01-S01E07)
- Only **20 screenshots per episode** (first ~45-60 seconds only)
- ~90% of episode content has NO visual documentation
- 16 characters detected but many scenes have empty `characters_present: []`
- Content types: dialogue (70%), vampire_feeding (15%), dance (10%), party (3%), physical_intimacy (1%)
- Intensity ratings 1-5 exist but aren't visualized

**Episode UI Current State ("Extremely Subpar" Confirmed)**:
- Basic accordion list of scenes
- Shows: scene number, location, characters (plain chips), dialogue (scrollable)
- **NO visual timeline**
- **NO intensity indicators**
- **NO screenshot gallery** (142 screenshots exist but aren't displayed)
- **NO content type filtering**
- **NO character involvement tracking over time**
- video_analysis.json is **completely unused** in current UI

**Technical Stack**:
- Frontend: Next.js 15 + HeroUI v3 + Bun + Tailwind CSS v4
- Backend: Python/FastAPI
- Visual Theme: "Obsidian glass, gold and blood" - three themes (Classic Gothic, Modern Luxury, Nordic Noir)

### Metis Review

**Identified Gaps** (addressed in plan):
- Screenshot extraction limited to first 20 moments (fixed: intensity-based algorithm)
- Character detection relies only on name mentions (fixed: speaker label extraction, alias resolution)
- No scene grouping for multi-character detection (fixed: temporal clustering algorithm)
- Episode UI lacks visual hierarchy (fixed: timeline + gallery + heatmap components)
- Missing content type granularity (fixed: refined taxonomy with subtypes)

**Guardrails Applied**:
- NO ML/NLP dependencies (user requirement: lightweight, offline-friendly)
- NO cloud APIs (heuristic-based character extraction only)
- MUST preserve existing visual theme system
- MUST integrate with existing FastAPI backend

---

## Work Objectives

### Core Objective
Transform the video analysis pipeline and episode UI to create a rich, visual episode browsing experience that surfaces the dramatic intensity, character dynamics, and key visual moments of each episode.

### Concrete Deliverables
1. **Enhanced Video Analyzer** (`scripts/analyze_videos_v2.py`)
   - Intensity-based screenshot extraction (100+ per episode)
   - 15+ additional secondary characters
   - Scene grouping algorithm
   - Refined content type taxonomy
   - **Location metadata extraction** (school, castle, party venues)
   - **Relationship tracking** (character interaction detection)
   - **Narrative structure tagging** (plot points, act breaks)

2. **Scene Grouping Algorithm**
   - Temporal clustering of moments into scenes
   - "All characters in scene" detection
   - Scene boundary detection
   - **Scene-level relationship mapping**

3. **Backend API Updates**
   - New endpoints for video analysis data
   - Integration with existing episode/scene routes
   - **Relationship evolution endpoints**
   - **Location-based scene queries**

4. **Episode UI Components**
   - VisualTimeline component
   - ScreenshotGallery component
   - ContentTypeBadge component
   - IntensityIndicator component
   - CharacterPresenceTracker component
   - **RelationshipTracker component** (character dynamics visualization)
   - **LocationTag component** (scene location badges)

5. **Episode Detail Page Redesign**
   - Tabbed navigation (Overview, Timeline, Gallery, Scenes)
   - Integrated video analysis data
   - Responsive design matching existing theme
   - **Relationship dynamics panel**
   - **Location-based scene filtering**

### Definition of Done
- [ ] Video analyzer v2 generates 100+ screenshots per episode with intensity weighting
- [ ] All 7 episodes have complete visual documentation
- [ ] Episode UI displays visual timeline with content type badges
- [ ] Screenshot gallery is browsable with filtering by content type
- [ ] Character presence is visualized over episode duration
- [ ] Intensity heatmap shows dramatic peaks
- [ ] All components match existing "obsidian glass" visual theme
- [ ] Build passes with no errors

### Must Have
- Intensity-based screenshot extraction (more screenshots for high-intensity scenes)
- Visual timeline component with content type indicators
- Screenshot gallery with filtering
- Character presence visualization
- Integration with existing theme system
- No ML/NLP dependencies (heuristic-only character extraction)
- **Location metadata extraction and display**
- **Relationship tracking between characters**
- **Narrative structure tagging (plot points, act breaks)**

### Must NOT Have (Guardrails)
- NO external ML APIs or heavy NLP models
- NO changes to existing character YAML schema
- NO breaking changes to existing API endpoints
- NO new dependencies that conflict with HeroUI v3
- NO manual screenshot curation (must be automated)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no test framework currently)
- **Automated tests**: NO (tests-after not needed for this data pipeline)
- **Framework**: None (verification via direct execution)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

Every task includes direct verification scenarios using bash commands and file checks. No human intervention required.

**Example Verification Pattern:**
```
Scenario: Video analyzer generates expected output
  Tool: Bash
  Preconditions: Video files exist at /Users/wolfy/Downloads/Blod Svet Tararr/
  Steps:
    1. Run: python scripts/analyze_videos_v2.py
    2. Assert: data/video_analysis/video_analysis_v2.json exists
    3. Assert: data/video_analysis/screenshots_v2/ contains >100 files per episode
    4. Assert: JSON has scenes array with grouped moments
  Expected Result: Analysis complete with enhanced data structure
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Independent):
├── Task 1: Enhance video analyzer with intensity-based extraction
├── Task 2: Expand character detection patterns (15+ new characters)
└── Task 3: Design Episode UI component architecture

Wave 2 (After Wave 1):
├── Task 4: Implement scene grouping algorithm
├── Task 5: Create VisualTimeline component
└── Task 6: Create ScreenshotGallery component

Wave 3 (After Wave 2):
├── Task 7: Create ContentTypeBadge component
├── Task 8: Create IntensityIndicator component
├── Task 9: Create CharacterPresenceTracker component
└── Task 10: Update backend API for video analysis

Wave 4 (After Wave 3):
├── Task 11: Redesign Episode Detail page with tabs
├── Task 12: Integrate all components into episode UI
└── Task 13: Final integration and theme matching
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5, 6, 10 | 2, 3 |
| 2 | None | 4, 9 | 1, 3 |
| 3 | None | 5, 6, 7, 8, 9 | 1, 2 |
| 4 | 1, 2 | 10 | None |
| 5 | 1, 3 | 11 | 6, 7, 8, 9 |
| 6 | 1, 3 | 11 | 5, 7, 8, 9 |
| 7 | 3 | 11 | 5, 6, 8, 9 |
| 8 | 3 | 11 | 5, 6, 7, 9 |
| 9 | 2, 3 | 11 | 5, 6, 7, 8 |
| 10 | 1, 2, 4 | 11 | None |
| 11 | 5, 6, 7, 8, 9, 10 | 12, 14, 15 | None |
| 12 | 11 | 13 | None |
| 13 | 12 | None | None |
| 14 | 11 | 15 | None |
| 15 | 11, 14 | 16 | None |
| 16 | 15 | None | None |

---

## TODOs

### Wave 1: Foundation

- [ ] 1. Enhance Video Analyzer with Intensity-Based Screenshot Extraction

  **What to do**:
  - Modify `scripts/analyze_videos.py` or create `scripts/analyze_videos_v2.py`
  - Replace fixed "first 20 moments" with intensity-weighted extraction
  - Algorithm: Calculate target screenshots per episode (100-150)
  - Weight moments by intensity score (intensity 4-5 gets 3x weight)
  - Ensure temporal distribution (don't cluster all screenshots in one area)
  - Extract screenshots at weighted-moment timestamps

  **Must NOT do**:
  - Don't just increase to 100 sequential moments (must be distributed)
  - Don't skip low-intensity moments entirely (narrative continuity)
  - Don't use external ML for intensity detection (use existing subtitle-based scoring)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` (complex algorithmic work)
  - **Skills**: None required (Python standard library + ffmpeg)
  - **Justification**: This is pure Python algorithm work with subprocess calls to ffmpeg. No UI or special domain knowledge needed.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 4, 5, 6, 10
  - **Blocked By**: None

  **References**:
  - Current analyzer: `scripts/analyze_videos.py:500-510` (screenshot extraction loop)
  - Intensity scoring: `scripts/analyze_videos.py:437-461` (content type detection)
  - Screenshot function: `scripts/analyze_videos.py:311-333` (extract_screenshot)

  **Acceptance Criteria**:
  - [ ] Script runs successfully: `python scripts/analyze_videos_v2.py`
  - [ ] Generates `data/video_analysis/video_analysis_v2.json`
  - [ ] Each episode has 100-150 screenshots in `data/video_analysis/screenshots_v2/`
  - [ ] High-intensity moments (4-5) have proportionally more screenshots
  - [ ] Screenshots are distributed across full episode duration (not just beginning)

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Intensity-based screenshot extraction works
    Tool: Bash
    Preconditions: Video files exist at /Users/wolfy/Downloads/Blod Svet Tararr/
    Steps:
      1. Run: python scripts/analyze_videos_v2.py
      2. Count screenshots: ls data/video_analysis/screenshots_v2/s01e01*.jpg | wc -l
      3. Assert: Count >= 100
      4. Check temporal distribution: ls data/video_analysis/screenshots_v2/s01e01*.jpg | tail -20 | head -1
      5. Assert: Latest screenshot timestamp > 15:00 (not all at beginning)
      6. Check JSON structure: jq '.episodes[0].key_moments | length' data/video_analysis/video_analysis_v2.json
      7. Assert: Moment count >= 100
    Expected Result: 100+ screenshots per episode with temporal distribution
    Evidence: Screenshot directory listing, JSON moment count
  ```

  **Commit**: YES
  - Message: `feat(video): implement intensity-based screenshot extraction`
  - Files: `scripts/analyze_videos_v2.py`

- [ ] 2. Expand Character Detection Patterns (15+ New Secondary Characters)

  **What to do**:
  - Add 15+ new secondary characters to detection patterns
  - Review all character YAML files for names/aliases
  - Add common Swedish name variations and nicknames
  - Implement speaker label extraction from subtitle format ("Name: dialogue")
  - Add alias resolution (e.g., "Affe" → "Alfred", "Jack" → "Jacques")
  - Add title-cased token extraction heuristic for unnamed characters

  **New Characters to Add**:
  - Teachers: `teacher_math`, `teacher_english`, `substitute_teacher`
  - Batgirls: `batgirl_1`, `batgirl_2`, `batgirl_3` (unnamed dancers)
  - Party students: `party_student_1`, `party_student_2`
  - Family: `father`, `mother` (generic family references)
  - Staff: `janitor`, `lunch_lady`, `coach`
  - Additional named characters from YAML: check all `data/characters/*.yaml`

  **Must NOT do**:
  - Don't use external NER libraries (spaCy, NLTK, etc.)
  - Don't add characters not mentioned in YAML files or subtitles
  - Don't create false positives with common words

  **Recommended Agent Profile**:
  - **Category**: `quick` (pattern matching work)
  - **Skills**: None required
  - **Justification**: Simple regex and string matching work.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 4, 9
  - **Blocked By**: None

  **References**:
  - Current character loading: `scripts/analyze_videos.py:240-275` (_load_characters_from_yaml)
  - Character patterns: `scripts/analyze_videos.py:61-110` (characters dict)
  - Speaker extraction: `scripts/analyze_videos.py:362-393` (_extract_speaker_characters)
  - Character YAMLs: `data/characters/*.yaml`

  **Acceptance Criteria**:
  - [ ] All character YAML files are parsed for names/aliases
  - [ ] Speaker labels ("Name: dialogue") are extracted
  - [ ] Aliases resolve to canonical names
  - [ ] 15+ new secondary characters detected in analysis output
  - [ ] Fewer empty `characters_present` arrays in output

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Character detection expanded
    Tool: Bash
    Preconditions: Character YAMLs exist in data/characters/
    Steps:
      1. Run: python scripts/analyze_videos_v2.py
      2. Check character detection: jq '.episodes[0].key_moments[].characters_present | select(length > 0)' data/video_analysis/video_analysis_v2.json | wc -l
      3. Assert: >50% of moments have characters detected (vs current ~30%)
      4. Check unique characters: jq '[.episodes[].key_moments[].characters_present[]] | unique | length' data/video_analysis/video_analysis_v2.json
      5. Assert: Unique character count >= 25 (current is ~16)
    Expected Result: Significantly improved character detection coverage
    Evidence: JSON character statistics
  ```

  **Commit**: YES
  - Message: `feat(video): expand character detection with 15+ secondary characters`
  - Files: `scripts/analyze_videos_v2.py`

- [ ] 3. Design Episode UI Component Architecture

  **What to do**:
  - Create component structure for new Episode UI
  - Design props interfaces for each component
  - Plan data flow from video_analysis.json to components
  - Ensure compatibility with existing HeroUI v3 components
  - Match existing "obsidian glass" visual theme

  **Components to Design**:
  1. `VisualTimeline` - horizontal timeline with content type badges
  2. `ScreenshotGallery` - grid of screenshots with filtering
  3. `ContentTypeBadge` - badge showing content type with color coding
  4. `IntensityIndicator` - visual indicator of intensity (1-5)
  5. `CharacterPresenceTracker` - show when characters appear

  **Must NOT do**:
  - Don't create components that conflict with existing HeroUI patterns
  - Don't break existing GlassCard component API
  - Don't use CSS-in-JS (use Tailwind + CSS variables)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: Component architecture design requires UI/UX expertise for consistency with existing design system.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 6, 7, 8, 9
  - **Blocked By**: None

  **References**:
  - Existing GlassCard: `frontend/components/GlassCard.tsx`
  - Existing theme: `frontend/lib/theme.ts`, `frontend/app/globals.css`
  - HeroUI components: Tabs, Chip, ScrollShadow, Accordion (already in use)

  **Acceptance Criteria**:
  - [ ] Component interface definitions created (TypeScript interfaces)
  - [ ] Props designed for each component
  - [ ] Data flow diagram created
  - [ ] Visual design matches existing theme

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Component architecture designed
    Tool: Bash
    Steps:
      1. Check design doc exists: ls .sisyphus/drafts/episode-ui-architecture.md
      2. Assert: File exists
      3. Verify interfaces: grep -q "interface VisualTimelineProps" .sisyphus/drafts/episode-ui-architecture.md
      4. Verify all components: grep -c "interface.*Props" .sisyphus/drafts/episode-ui-architecture.md
      5. Assert: Count >= 5
    Expected Result: Component architecture documented
    Evidence: Architecture document exists with all component interfaces
  ```

  **Commit**: NO (design document, not code)

### Wave 2: Scene Processing & Core Components

- [ ] 4. Implement Scene Grouping Algorithm

  **What to do**:
  - Create algorithm to group moments into scenes
  - Use temporal clustering (moments within 30-60 seconds = same scene)
  - Merge characters from all moments in scene
  - Determine scene boundaries (start/end timestamps)
  - Calculate scene-level intensity (max of moment intensities)
  - Determine primary content type for scene

  **Algorithm Approach**:
  ```python
  # Cluster moments by time proximity
  scenes = []
  current_scene = [moments[0]]
  
  for moment in moments[1:]:
      if moment.timestamp - current_scene[-1].timestamp < 45:
          current_scene.append(moment)
      else:
          scenes.append(create_scene_from_moments(current_scene))
          current_scene = [moment]
  ```

  **Must NOT do**:
  - Don't use ML for scene detection (heuristic only)
  - Don't create scenes with only 1 moment (merge small scenes)
  - Don't lose moment-level data (keep moments within scenes)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` (algorithmic work)
  - **Skills**: None
  - **Justification**: Pure algorithm implementation in Python.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 1, 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 1, 2

  **References**:
  - Moment structure: `scripts/analyze_videos.py:17-26` (SceneMoment dataclass)
  - Episode structure: `scripts/analyze_videos.py:28-38` (EpisodeAnalysis dataclass)

  **Acceptance Criteria**:
  - [ ] Algorithm groups moments into scenes
  - [ ] Each scene has start_time, end_time, characters (merged), intensity (max)
  - [ ] Scenes array added to episode analysis output
  - [ ] Scene count is reasonable (5-15 scenes per 20-min episode)

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Scene grouping works
    Tool: Bash
    Steps:
      1. Run: python scripts/analyze_videos_v2.py
      2. Check scenes exist: jq '.episodes[0].scenes | length' data/video_analysis/video_analysis_v2.json
      3. Assert: Scene count between 5 and 20
      4. Check scene structure: jq '.episodes[0].scenes[0] | keys' data/video_analysis/video_analysis_v2.json
      5. Assert: Contains start_time, end_time, characters, intensity, content_type
    Expected Result: Scenes properly grouped with complete metadata
    Evidence: JSON structure validation
  ```

  **Commit**: YES
  - Message: `feat(video): implement scene grouping algorithm`
  - Files: `scripts/analyze_videos_v2.py`

- [ ] 5. Create VisualTimeline Component

  **What to do**:
  - Create `frontend/components/VisualTimeline.tsx`
  - Horizontal timeline showing episode duration
  - Markers for each key moment
  - Color-coded by content type (vampire_feeding=crimson, dance=gold, etc.)
  - Size indicates intensity (larger = more intense)
  - Hover shows moment details (timestamp, description, screenshot thumbnail)
  - Click navigates to moment

  **Props Interface**:
  ```typescript
  interface VisualTimelineProps {
    moments: KeyMoment[];
    duration: number; // seconds
    onMomentClick?: (moment: KeyMoment) => void;
  }
  ```

  **Must NOT do**:
  - Don't use external charting libraries (D3, Chart.js) - use CSS/Tailwind
  - Don't make timeline height excessive (keep compact)
  - Don't show all text on timeline (use tooltips)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`
  - **Justification**: Complex UI component requiring HeroUI integration and visual design expertise.

  **Parallelization**:
  - **Can Run In Parallel**: YES (depends on Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 1, 3

  **References**:
  - HeroUI Tooltip: https://v3.heroui.com/docs/components/tooltip
  - Existing theme colors: `frontend/lib/theme.ts`
  - GlassCard pattern: `frontend/components/GlassCard.tsx`

  **Acceptance Criteria**:
  - [ ] Component renders horizontal timeline
  - [ ] Moments displayed as markers positioned by timestamp
  - [ ] Markers color-coded by content_type
  - [ ] Marker size reflects intensity
  - [ ] Hover shows tooltip with details
  - [ ] Responsive design (scales to container width)

  **Agent-Executed QA Scenario**:
  ```
  Scenario: VisualTimeline component renders
    Tool: Bash + Playwright (verify in browser)
    Steps:
      1. Build: cd frontend && bun run build
      2. Assert: Build succeeds
      3. Start dev: bun run dev &
      4. Navigate to episode: playwright navigate to /episodes/s01e01
      5. Assert: VisualTimeline component visible
      6. Screenshot: .sisyphus/evidence/timeline-component.png
    Expected Result: Timeline displays with markers
    Evidence: Screenshot, build output
  ```

  **Commit**: YES
  - Message: `feat(ui): add VisualTimeline component`
  - Files: `frontend/components/VisualTimeline.tsx`

- [ ] 6. Create ScreenshotGallery Component

  **What to do**:
  - Create `frontend/components/ScreenshotGallery.tsx`
  - Grid layout of screenshot thumbnails
  - Filter by content type (tabs or dropdown)
  - Sort by timestamp or intensity
  - Lazy loading for performance
  - Click to enlarge (lightbox/modal)
  - Show timestamp and content type overlay

  **Props Interface**:
  ```typescript
  interface ScreenshotGalleryProps {
    moments: KeyMoment[];
    screenshotsBasePath: string;
  }
  ```

  **Must NOT do**:
  - Don't load all full-resolution images at once (use thumbnails)
  - Don't break layout with varying image sizes (use consistent aspect ratio)
  - Don't forget keyboard navigation for accessibility

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`
  - **Justification**: Gallery component with filtering and modal requires UI expertise.

  **Parallelization**:
  - **Can Run In Parallel**: YES (depends on Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 1, 3

  **References**:
  - HeroUI Modal: https://v3.heroui.com/docs/components/modal
  - HeroUI Tabs: https://v3.heroui.com/docs/components/tabs
  - Lazy loading: Next.js Image component

  **Acceptance Criteria**:
  - [ ] Grid layout renders screenshots
  - [ ] Filter by content_type works
  - [ ] Sort options work (timestamp, intensity)
  - [ ] Click opens lightbox with full image
  - [ ] Lazy loading implemented

  **Agent-Executed QA Scenario**:
  ```
  Scenario: ScreenshotGallery works
    Tool: Playwright
    Steps:
      1. Navigate to episode with gallery
      2. Assert: Gallery grid visible with thumbnails
      3. Click filter: "vampire_feeding"
      4. Assert: Only vampire_feeding screenshots shown
      5. Click first screenshot
      6. Assert: Lightbox/modal opens with full image
      7. Screenshot: .sisyphus/evidence/gallery-lightbox.png
    Expected Result: Gallery with filtering and lightbox functional
    Evidence: Screenshots
  ```

  **Commit**: YES
  - Message: `feat(ui): add ScreenshotGallery component`
  - Files: `frontend/components/ScreenshotGallery.tsx`

### Wave 3: Supporting Components & Backend

- [ ] 7. Create ContentTypeBadge Component

  **What to do**:
  - Create `frontend/components/ContentTypeBadge.tsx`
  - Badge/chip showing content type
  - Color-coded by type:
    - vampire_feeding: crimson/red
    - dance: gold/amber
    - physical_intimacy: rose/pink
    - confrontation: orange
    - party: purple
    - dialogue: gray (default)
  - Icon for each type (Lucide icons)
  - Small and large variants

  **Props Interface**:
  ```typescript
  interface ContentTypeBadgeProps {
    contentType: string;
    size?: 'sm' | 'md';
    showIcon?: boolean;
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `heroui`
  - **Justification**: Simple badge component using HeroUI Chip.

  **Parallelization**:
  - **Can Run In Parallel**: YES (depends on Task 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 11
  - **Blocked By**: Task 3

  **References**:
  - HeroUI Chip: https://v3.heroui.com/docs/components/chip
  - Lucide icons: https://lucide.dev/icons/

  **Acceptance Criteria**:
  - [ ] Badge displays content type text
  - [ ] Color matches content type
  - [ ] Icon displayed (when enabled)
  - [ ] Size variants work

  **Commit**: YES
  - Message: `feat(ui): add ContentTypeBadge component`
  - Files: `frontend/components/ContentTypeBadge.tsx`

- [ ] 8. Create IntensityIndicator Component

  **What to do**:
  - Create `frontend/components/IntensityIndicator.tsx`
  - Visual indicator of intensity 1-5
  - Options: progress bar, flame icons, or heat gradient
  - Show numeric value
  - Color gradient: cool (blue) → warm (yellow) → hot (red)

  **Props Interface**:
  ```typescript
  interface IntensityIndicatorProps {
    intensity: number; // 1-5
    variant?: 'bar' | 'flames' | 'heatmap';
    showValue?: boolean;
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `heroui`
  - **Justification**: Simple indicator component.

  **Parallelization**:
  - **Can Run In Parallel**: YES (depends on Task 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 11
  - **Blocked By**: Task 3

  **References**:
  - HeroUI Progress: https://v3.heroui.com/docs/components/progress

  **Acceptance Criteria**:
  - [ ] Indicator shows intensity visually
  - [ ] Color gradient appropriate
  - [ ] Numeric value displayed (when enabled)

  **Commit**: YES
  - Message: `feat(ui): add IntensityIndicator component`
  - Files: `frontend/components/IntensityIndicator.tsx`

- [ ] 9. Create CharacterPresenceTracker Component

  **What to do**:
  - Create `frontend/components/CharacterPresenceTracker.tsx`
  - Show which characters appear in which scenes/moments
  - Matrix/grid view: characters × timeline
  - Or list view with presence bars
  - Click character to highlight their moments

  **Props Interface**:
  ```typescript
  interface CharacterPresenceTrackerProps {
    characters: string[];
    moments: KeyMoment[];
    onCharacterClick?: (character: string) => void;
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`
  - **Justification**: Complex data visualization component.

  **Parallelization**:
  - **Can Run In Parallel**: YES (depends on Tasks 2, 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 2, 3

  **Acceptance Criteria**:
  - [ ] Character list displayed
  - [ ] Presence visualization shows when each character appears
  - [ ] Click to filter works

  **Commit**: YES
  - Message: `feat(ui): add CharacterPresenceTracker component`
  - Files: `frontend/components/CharacterPresenceTracker.tsx`

- [ ] 10. Update Backend API for Video Analysis

  **What to do**:
  - Add endpoints to `backend/src/api/episodes.py`:
    - `GET /api/episodes/{id}/video-analysis` - full video analysis
    - `GET /api/episodes/{id}/video-analysis/moments` - key moments list
    - `GET /api/episodes/{id}/video-analysis/scenes` - grouped scenes from video analysis
  - Load video_analysis.json in data layer
  - Serve screenshots as static files
  - Update Pydantic models if needed

  **Must NOT do**:
  - Don't break existing episode endpoints
  - Don't duplicate data (reference existing episode data)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: None
  - **Justification**: FastAPI route implementation.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 1, 2, 4)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 1, 2, 4

  **References**:
  - Existing episode routes: `backend/src/api/episodes.py`
  - Data loading: `backend/src/data.py`
  - Models: `backend/src/models.py`

  **Acceptance Criteria**:
  - [ ] New endpoints return video analysis data
  - [ ] Existing endpoints still work
  - [ ] Screenshots served correctly

  **Agent-Executed QA Scenario**:
  ```
  Scenario: API endpoints work
    Tool: Bash (curl)
    Steps:
      1. Start backend: cd backend && uvicorn src.main:app --port 8000 &
      2. Test endpoint: curl -s http://localhost:8000/api/episodes/s01e01/video-analysis | jq '.episodes[0].id'
      3. Assert: Returns "s01e01"
      4. Test moments: curl -s http://localhost:8000/api/episodes/s01e01/video-analysis/moments | jq 'length'
      5. Assert: Returns >0
      6. Test scenes: curl -s http://localhost:8000/api/episodes/s01e01/video-analysis/scenes | jq 'length'
      7. Assert: Returns >0
      8. Verify no collision: curl -s http://localhost:8000/api/episodes/s01e01/scenes | jq '.[0].scene_number'
      9. Assert: Returns scene number from existing scenes endpoint (different from video-analysis/scenes)
    Expected Result: All new endpoints return valid data without breaking existing /scenes endpoint
    Evidence: curl response output
  ```

  **Commit**: YES
  - Message: `feat(api): add video analysis endpoints`
  - Files: `backend/src/api/episodes.py`, `backend/src/models.py`

### Wave 4: Integration

- [ ] 11. Redesign Episode Detail Page with Tabs

  **What to do**:
  - Redesign `frontend/app/episodes/[id]/page.tsx`
  - Add tabbed navigation:
    - **Overview**: Synopsis, basic info, intensity summary
    - **Timeline**: VisualTimeline + CharacterPresenceTracker
    - **Gallery**: ScreenshotGallery with filtering
    - **Scenes**: Existing accordion (improved with new components)
  - Integrate all new components
  - Fetch video analysis data from new API endpoints

  **Must NOT do**:
  - Don't remove existing scene data (keep backward compatibility)
  - Don't break mobile layout
  - Don't lose existing functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`
  - **Justification**: Complex page integration requiring HeroUI Tabs and all new components.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 5-10)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 5, 6, 7, 8, 9, 10

  **References**:
  - Current episode page: `frontend/app/episodes/[id]/page.tsx`
  - HeroUI Tabs: https://v3.heroui.com/docs/components/tabs
  - All new components from Tasks 5-9

  **Acceptance Criteria**:
  - [ ] Tab navigation works
  - [ ] Overview tab shows episode info
  - [ ] Timeline tab shows VisualTimeline
  - [ ] Gallery tab shows ScreenshotGallery
  - [ ] Scenes tab shows improved scene list
  - [ ] All tabs match visual theme

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Episode detail page works
    Tool: Playwright
    Steps:
      1. Navigate to: /episodes/s01e01
      2. Assert: Page loads with tab navigation
      3. Click: "Timeline" tab
      4. Assert: VisualTimeline visible
      5. Click: "Gallery" tab
      6. Assert: ScreenshotGallery visible
      7. Click: "Scenes" tab
      8. Assert: Scene accordion visible
      9. Screenshot: .sisyphus/evidence/episode-page-tabs.png
    Expected Result: All tabs functional with proper components
    Evidence: Screenshots
  ```

  **Commit**: YES
  - Message: `feat(ui): redesign episode detail with tabbed navigation`
  - Files: `frontend/app/episodes/[id]/page.tsx`

- [ ] 12. Integrate All Components into Episode UI

  **What to do**:
  - Wire up all components with real data
  - Add loading states
  - Add error handling
  - Ensure responsive behavior
  - Add animations (respect prefers-reduced-motion)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`
  - **Justification**: Integration work requiring attention to detail.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 11)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 13
  - **Blocked By**: Task 11

  **Acceptance Criteria**:
  - [ ] All components display real data
  - [ ] Loading states work
  - [ ] Error handling works
  - [ ] Responsive on mobile/desktop

  **Commit**: YES
  - Message: `feat(ui): integrate all components with data`
  - Files: `frontend/app/episodes/[id]/page.tsx`, related components

- [ ] 13. Final Integration and Theme Matching

  **What to do**:
  - Verify all components match "obsidian glass" theme
  - Check all three theme variants (Classic Gothic, Modern Luxury, Nordic Noir)
  - Verify build passes
  - Run Lighthouse audit
  - Fix any visual inconsistencies

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: Polish and theme consistency work.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 12)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 12

  **Acceptance Criteria**:
  - [ ] All components match theme
  - [ ] Build passes: `bun run build` succeeds
  - [ ] No console errors
  - [ ] Lighthouse score >= 90

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Final integration complete
    Tool: Bash
    Steps:
      1. Build: cd frontend && bun run build
      2. Assert: Exit code 0
      3. Check for errors: grep -i "error" build-output.log | wc -l
      4. Assert: 0 errors
      5. Run Lighthouse: lighthouse http://localhost:3000/episodes/s01e01 --output=json
      6. Assert: Performance >= 90
    Expected Result: Production build successful
    Evidence: Build output, Lighthouse report
  ```

  **Commit**: YES
  - Message: `feat(ui): final theme matching and polish`
  - Files: All modified frontend files

- [ ] 14. Add Location Metadata Extraction and LocationTag Component

  **What to do**:
  - Extract location metadata from subtitle context
  - Pattern matching for locations: "school", "castle", "classroom", "gym", "party", "Natt och Dag"
  - Add Swedish location keywords: "skola", "slott", "klassrum", "gym", "fest"
  - Create `frontend/components/LocationTag.tsx` component
  - Display location badges in scenes and timeline

  **Location Patterns to Detect**:
  - School: "school", "skola", "classroom", "klassrum", "hallway", "korridor"
  - Castle: "castle", "slott", "Natt och Dag", "cellar", "källare"
  - Gym: "gym", "training room", "dance studio", "övningslokal"
  - Party: "party", "fest", "masquerade", "bal", "dance floor"
  - Outdoors: "outside", "outdoors", "park", "woods", "skog"

  **Must NOT do**:
  - Don't create locations not mentioned in subtitles
  - Don't use ML for location detection (pattern matching only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Justification**: Pattern matching in Python + simple React component.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 11)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 15
  - **Blocked By**: Task 11

  **Acceptance Criteria**:
  - [ ] Location detection works for major locations
  - [ ] LocationTag component displays location with icon
  - [ ] Locations shown in scene cards and timeline

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Location metadata extracted
    Tool: Bash
    Steps:
      1. Check analysis output: jq '.episodes[0].scenes[].location' data/video_analysis/video_analysis_v2.json
      2. Assert: Non-null locations found
      3. Count unique locations: jq '[.episodes[].scenes[].location] | unique | length' data/video_analysis/video_analysis_v2.json
      4. Assert: >= 3 unique locations
    Expected Result: Locations detected and stored
    Evidence: JSON location data
  ```

  **Commit**: YES
  - Message: `feat(video): add location metadata extraction and LocationTag component`
  - Files: `scripts/analyze_videos_v2.py`, `frontend/components/LocationTag.tsx`

- [ ] 15. Add Relationship Tracking and RelationshipTracker Component

  **What to do**:
  - Track character interactions within scenes
  - Detect relationship dynamics from dialogue patterns
  - Create relationship graph data structure
  - Create `frontend/components/RelationshipTracker.tsx` component
  - Visualize character relationships and their evolution

  **Relationship Detection**:
  - Co-presence: Characters in same scene
  - Dialogue: Characters addressing each other
  - Conflict: Confrontation scenes with multiple characters
  - Romance: Physical intimacy scenes

  **Must NOT do**:
  - Don't infer relationships not supported by data
  - Don't use external relationship databases

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `heroui`
  - **Justification**: Complex data visualization component.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 11, 14)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 11, 14

  **Acceptance Criteria**:
  - [ ] Relationship data structure created
  - [ ] RelationshipTracker component visualizes connections
  - [ ] Relationships update as episode progresses

  **Agent-Executed QA Scenario**:
  ```
  Scenario: Relationship tracking works
    Tool: Bash + Playwright
    Steps:
      1. Check API: curl -s http://localhost:8000/api/episodes/s01e01/relationships | jq 'length'
      2. Assert: Returns >0 relationships
      3. Navigate to episode page
      4. Assert: RelationshipTracker visible
      5. Screenshot: .sisyphus/evidence/relationship-tracker.png
    Expected Result: Relationships visualized
    Evidence: Screenshot
  ```

  **Commit**: YES
  - Message: `feat(ui): add relationship tracking and RelationshipTracker component`
  - Files: `scripts/analyze_videos_v2.py`, `backend/src/api/episodes.py`, `frontend/components/RelationshipTracker.tsx`

- [ ] 16. Add Narrative Structure Tagging

  **What to do**:
  - Tag key narrative moments: inciting incident, rising action, climax, resolution
  - Use intensity patterns + content types to identify plot points
  - Add narrative beat markers to timeline
  - Display act structure in episode overview

  **Narrative Pattern Detection**:
  - Inciting incident: Early high-intensity moment
  - Rising action: Increasing intensity trend
  - Climax: Highest intensity point in episode
  - Resolution: Decreasing intensity at end

  **Must NOT do**:
  - Don't force narrative structure where it doesn't exist
  - Don't use ML for narrative analysis

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: None
  - **Justification**: Algorithmic pattern detection.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 15)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 15

  **Acceptance Criteria**:
  - [ ] Narrative beats detected
  - [ ] Act structure displayed in overview
  - [ ] Plot point markers on timeline

  **Commit**: YES
  - Message: `feat(video): add narrative structure tagging`
  - Files: `scripts/analyze_videos_v2.py`, `frontend/app/episodes/[id]/page.tsx`

---

## Commit Strategy (Updated)

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(video): intensity-based screenshot extraction` | analyze_videos_v2.py | Screenshot count >= 100 |
| 2 | `feat(video): expand character detection` | analyze_videos_v2.py | Character count >= 25 |
| 4 | `feat(video): scene grouping algorithm` | analyze_videos_v2.py | Scene structure valid |
| 5 | `feat(ui): VisualTimeline component` | VisualTimeline.tsx | Component renders |
| 6 | `feat(ui): ScreenshotGallery component` | ScreenshotGallery.tsx | Gallery + lightbox work |
| 7 | `feat(ui): ContentTypeBadge component` | ContentTypeBadge.tsx | Badges display correctly |
| 8 | `feat(ui): IntensityIndicator component` | IntensityIndicator.tsx | Indicators display correctly |
| 9 | `feat(ui): CharacterPresenceTracker component` | CharacterPresenceTracker.tsx | Tracker displays correctly |
| 10 | `feat(api): video analysis endpoints` | episodes.py, models.py | API tests pass |
| 11 | `feat(ui): episode detail tabs` | [id]/page.tsx | Tabs functional |
| 12 | `feat(ui): component integration` | [id]/page.tsx | Data flows correctly |
| 13 | `feat(ui): theme matching` | All frontend | Build passes |
| 14 | `feat(video): location metadata extraction` | analyze_videos_v2.py, LocationTag.tsx | Locations detected |
| 15 | `feat(ui): relationship tracking` | episodes.py, RelationshipTracker.tsx | Relationships visualized |
| 16 | `feat(video): narrative structure tagging` | analyze_videos_v2.py, [id]/page.tsx | Narrative beats detected |

---

## Success Criteria (Updated)

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(video): intensity-based screenshot extraction` | analyze_videos_v2.py | Screenshot count >= 100 |
| 2 | `feat(video): expand character detection` | analyze_videos_v2.py | Character count >= 25 |
| 4 | `feat(video): scene grouping algorithm` | analyze_videos_v2.py | Scene structure valid |
| 5 | `feat(ui): VisualTimeline component` | VisualTimeline.tsx | Component renders |
| 6 | `feat(ui): ScreenshotGallery component` | ScreenshotGallery.tsx | Gallery + lightbox work |
| 7 | `feat(ui): ContentTypeBadge component` | ContentTypeBadge.tsx | Badges display correctly |
| 8 | `feat(ui): IntensityIndicator component` | IntensityIndicator.tsx | Indicators display correctly |
| 9 | `feat(ui): CharacterPresenceTracker component` | CharacterPresenceTracker.tsx | Tracker displays correctly |
| 10 | `feat(api): video analysis endpoints` | episodes.py, models.py | API tests pass |
| 11 | `feat(ui): episode detail tabs` | [id]/page.tsx | Tabs functional |
| 12 | `feat(ui): component integration` | [id]/page.tsx | Data flows correctly |
| 13 | `feat(ui): theme matching` | All frontend | Build passes |

---

## Success Criteria

### Verification Commands
```bash
# Video analysis
cd /Users/wolfy/Developer/2026.Y/bats
python scripts/analyze_videos_v2.py
ls data/video_analysis/screenshots_v2/s01e01*.jpg | wc -l  # Expected: >= 100

# Backend
cd backend
uvicorn src.main:app --port 8000 &
curl -s http://localhost:8000/api/episodes/s01e01/analysis | jq '.episodes[0].scenes | length'  # Expected: >0

# Frontend
cd frontend
bun run build  # Expected: success
```

### Final Checklist
- [ ] Video analyzer v2 generates 100+ screenshots per episode
- [ ] All 7 episodes have complete visual documentation
- [ ] Episode UI displays visual timeline with content type badges
- [ ] Screenshot gallery is browsable with filtering by content type
- [ ] Character presence is visualized over episode duration
- [ ] Intensity heatmap shows dramatic peaks
- [ ] All components match existing "obsidian glass" visual theme
- [ ] Build passes with no errors
- [ ] Lighthouse score >= 90
- [ ] **Location metadata extracted and displayed**
- [ ] **Character relationships tracked and visualized**
- [ ] **Narrative structure tagged with plot points**
