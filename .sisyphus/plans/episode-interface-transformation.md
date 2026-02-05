# Episode Interface Transformation Plan

## Vision

Transform the episode interface from a simple transcript viewer into an immersive, multi-layered exploration experience that reveals the depth of the "Blod, Svett, Sagg" dark adaptation. The interface will offer:

- **Raw transcript access** for purists and writers
- **Rich scene breakdowns** with locations, character arcs, and thematic analysis
- **Visual timeline** showing episode progression and intensity
- **Character involvement tracking** showing who appears when and how their relationships evolve
- **Reader-facing content indicators** for the dark adaptation themes
- **Seamless adaptation notes** revealing the transformation from canonical to dark version

## Architecture Overview

```
Episode Page
├── Header (Bilingual titles, runtime, intensity, characters)
├── Tab Navigation
│   ├── Overview (Synopsis + key moments)
│   ├── Timeline (Visual progression + intensity graph)
│   ├── Scenes (Rich scene cards with themes)
│   ├── Transcript (Full searchable dialogue)
│   ├── Characters (Who appears + their evolution)
│   └── Themes (Extracted topics + mythos connections)
└── Adaptation Panel (Collapsible side notes)
```

## Phase 1: Data Enrichment (Backend)

### 1.1 Episode Parser Enhancement

**Current State:** Episode JSON has polluted character arrays and no real scene segmentation

**Target State:** Rich episode data with:
- Clean character extraction (actual names, not dialogue fragments)
- Scene segmentation based on location/time changes
- Theme/topic extraction from dialogue
- Character presence tracking per scene
- Intensity scoring per scene

**Implementation:**
- Create `scripts/enrich_episodes.py`
- Use regex patterns to identify scene breaks
- Map dialogue fragments to actual character names
- Extract themes using keyword matching
- Generate scene summaries

### 1.2 New Data Schema

```typescript
interface EnrichedEpisode {
  // Core metadata
  id: string;
  title: string;
  title_en: string;
  season: number;
  episode_number: number;
  runtime: string; // calculated from timestamps
  synopsis: string; // AI-generated or manual
  synopsis_adaptation: string; // How this episode transforms in dark version
  
  // Content indicators
  intensity_rating: number; // 1-5 overall episode intensity
  content_warnings: string[]; // ["non_con", "blood_play", "power_imbalance"]
  themes: string[]; // ["integration", "desire", "identity", "power"]
  mythos_elements: string[]; // ["vampire-physiology", "blood-bond"]
  
  // Scenes (properly segmented)
  scenes: EnrichedScene[];
  
  // Character tracking
  characters_present: CharacterPresence[];
  
  // Raw transcript (preserved)
  transcript: DialogueLine[];
}

interface EnrichedScene {
  id: string;
  scene_number: number;
  title: string; // e.g., "The Arrival", "The Confrontation"
  description: string; // Brief summary
  location: string; // e.g., "Skaraborg High School - Classroom"
  start_time: string;
  end_time: string;
  duration: string;
  
  // Content
  characters: string[]; // Clean character names
  dialogue: DialogueLine[];
  
  // Analysis
  intensity_rating: number;
  content_warnings: string[];
  themes: string[];
  key_moments: KeyMoment[];
  
  // Adaptation
  adaptation_notes: string;
  canonical_comparison?: string;
}

interface CharacterPresence {
  character_id: string;
  name: string;
  first_appearance: string; // timestamp
  scenes_present: number[];
  dialogue_count: number;
  evolution_moment?: string; // Key character development
}

interface KeyMoment {
  timestamp: string;
  description: string;
  type: "dialogue" | "action" | "revelation" | "intimacy";
  characters_involved: string[];
  significance: string;
}
```

## Phase 2: Interface Components (Frontend)

### 2.1 Episode Header Redesign

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Back]  S01E01                    [Intensity: 🔴🔴🔴⚪⚪]    │
│                                                             │
│         Kallblodig skolstart                                │
│         Cold-blooded School Start                           │
│                                                             │
│  Runtime: 14:46  |  7 Scenes  |  8 Characters              │
│                                                             │
│  [🧛 Kiara] [👤 Alfred] [👤 Elise] [👤 Eric] ...           │
│                                                             │
│  Tags: [Vampire Integration] [School Drama] [Desire]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Bilingual titles with elegant typography
- Runtime and scene count
- Character headshot row (click to jump to their moments)
- Intensity rating (blood drop icons)
- Theme tags (clickable filters)
- Content warning disclosure (taboo styling)

### 2.2 Tab Navigation System

**Tabs:**
1. **Overview** - Synopsis, key moments, featured themes
2. **Timeline** - Visual episode progression
3. **Scenes** - Rich scene cards
4. **Transcript** - Full searchable dialogue
5. **Characters** - Detailed involvement tracking
6. **Themes** - Extracted topics with mythos connections

### 2.3 Timeline Visualization

**Design:**
- Horizontal timeline with scene markers
- Intensity graph overlay (area chart)
- Character presence lanes (who's on screen when)
- Key moment markers (click to jump)
- Timecode tooltips

**Visual Style:**
- Dark background with gold accent lines
- Scene markers as blood-drop or pearl-drop icons
- Intensity shown via gradient (transparent → crimson)
- Character lanes as colored bars

### 2.4 Scene Breakdown Cards

**Card Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Scene 1: The Arrival                                0:00-2:30│
│ 📍 Skaraborg High School - Main Entrance                    │
│                                                             │
│ Kiara arrives at school for the first time, feeling like    │
│ an outsider among humans. The scene establishes her         │
│ vulnerability and the school's social hierarchy.            │
│                                                             │
│ Characters: 🧛 Kiara  👤 Alfred  👤 Eric                    │
│                                                             │
│ Themes: [Identity] [Integration] [Otherness]               │
│ Intensity: 🔴🔴⚪⚪⚪                                        │
│                                                             │
│ Key Moments:                                                │
│ • 0:45 - Kiara's first interaction with humans             │
│ • 1:30 - Alfred offers to be her guide                     │
│ • 2:15 - Eric's dismissive attitude revealed               │
│                                                             │
│ [View Scene Dialogue] [Adaptation Notes]                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Transcript Viewer

**Features:**
- Searchable text (highlight matches)
- Speaker color-coding (vampires = gold, humans = silver)
- Timestamp links (click to jump in timeline)
- Mythos term highlighting (hover for definition)
- Copy-to-clipboard for writers
- Filter by character
- Filter by scene

### 2.6 Character Involvement Panel

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Character Presence in This Episode                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🧛 Kiara Natt och Dag                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  85% presence            │
│  First: 0:00 | Scenes: 1, 2, 3, 5, 6, 7                   │
│  Evolution: First day of school - establishes vulnerability │
│  [View Kiara's Profile] [See Her Moments]                  │
│                                                             │
│  👤 Alfred                                                  │
│  ━━━━━━━━━━━━━━━━  45% presence                            │
│  First: 0:45 | Scenes: 1, 3, 5                            │
│  Evolution: Takes on mentor role for Kiara                 │
│                                                             │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.7 Themes & Analysis Panel

**Features:**
- Auto-extracted themes with frequency
- Mythos element connections
- Quote highlights per theme
- Cross-episode theme tracking
- "First appearance of [theme]" indicators

### 2.8 Adaptation Notes System

**Implementation:**
- Collapsible side panel (right side)
- Toggle: "Show Adaptation Notes"
- Inline annotations on scenes/dialogue
- Comparison view: Canonical vs Dark
- Author commentary on transformation choices

## Phase 3: Data Extraction Strategy

### 3.1 Scene Segmentation Logic

**Approach:**
1. **Location Detection:** Look for location keywords in dialogue
   - "This is Skaraborg High School"
   - "At the castle..."
   - "In the classroom..."

2. **Time Jumps:** Significant timestamp gaps (>30 seconds)

3. **Character Entry/Exit:** New characters appearing or leaving

4. **Contextual Analysis:** Dialogue transitions indicating scene changes

### 3.2 Character Name Extraction

**Problem:** Current data has polluted character arrays

**Solution:**
- Maintain mapping of actual character names
- Use speaker attribution when available
- Pattern match dialogue for character mentions
- Cross-reference with character database

### 3.3 Theme Extraction

**Keyword Categories:**

**Vampire Lore:**
- cold-blooded, vampire, fangs, blood, feeding, triggered
- sunlight, SPF, umbrella, daywalking
- transformation, turned, sire

**Social Dynamics:**
- school, class, student, teacher, principal
- Batgirls, dance, team, popular
- masquerade, party, ball

**Relationships:**
- together, dating, breakup, kiss, love
- friends, enemies, rivalry
- family, parents, siblings

**Power & Control:**
- trigger, control, hunger, desire
- dominant, submissive, power
- compulsion, influence

**Identity & Integration:**
- different, outsider, fit in, belong
- human, vampire, hybrid
- mask, disguise, true self

### 3.4 Intensity Scoring

**Factors:**
- Physical intimacy descriptions
- Violence/blood mentions
- Power dynamic language
- Emotional intensity markers
- Scene duration (longer = more investment)

**Scale:**
- 1: Dialogue, exposition
- 2: Mild tension, social conflict
- 3: Strong emotions, confrontation
- 4: Physical intimacy, violence
- 5: Extreme content, non-con, heavy themes

## Phase 4: Implementation Priority

### Week 1: Foundation
- [ ] Create data enrichment parser
- [ ] Generate enriched episode JSON files
- [ ] Update backend API to serve new schema
- [ ] Update TypeScript interfaces

### Week 2: Core Interface
- [ ] Redesign episode header
- [ ] Implement tab navigation system
- [ ] Build transcript viewer with search
- [ ] Add speaker color-coding

### Week 3: Rich Components
- [ ] Create timeline visualization
- [ ] Build scene breakdown cards
- [ ] Implement character involvement panel
- [ ] Add theme extraction display

### Week 4: Polish & Integration
- [ ] Add adaptation notes system
- [ ] Implement content warning displays
- [ ] Add cross-episode navigation
- [ ] Performance optimization
- [ ] Visual refinement

## Technical Considerations

### Performance
- Lazy load transcript (virtual scrolling for long episodes)
- Cache enriched data
- Optimize timeline rendering

### Accessibility
- Keyboard navigation for tabs
- Screen reader support for timeline
- High contrast mode support

### Mobile
- Responsive timeline (vertical on mobile)
- Collapsible sections
- Touch-friendly scene cards

## Success Metrics

- Users can find specific moments quickly
- Character arcs are visible across episodes
- Themes are discoverable and explorable
- Adaptation notes enhance understanding
- Interface feels luxurious and immersive

## Next Steps

1. **Approve this plan**
2. **Prioritize which episodes to enrich first** (all 7, or start with 1-2?)
3. **Decide on manual vs automated scene segmentation**
4. **Define specific adaptation notes format**
5. **Begin Phase 1 implementation**

This plan creates a truly premium episode experience worthy of the "Blod, Svett, Sagg" dark adaptation universe.
