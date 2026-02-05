# Work Plan: Temporal Character Relationship System

## TL;DR

> **Build a temporal character relationship visualization** with **time-evolving access cards** and **orthogonal connector system**. Cards display character state at specific timeline points, evolving metrics/classifications/stats over episodes. Connectors use **rounded orthogonal segments** (subway-map style) with **hue-shift hover effects** and **relationship badges** ("<--- daughter --->"). A **timeline slider** allows scrubbing through episodes to see relationships evolve. Cards themselves evolve - adding/removing feats, classifications, body measurements, bloodline purity, and more.
> 
> **Deliverables**:
> - `TemporalCharacterCard` component (time-aware, evolving data)
> - `TimelineConnector` system (orthogonal, rounded, hue-shift hover)
> - `RelationshipBadge` component ("<--- type --->" labels)
> - `EpisodeTimeline` slider component
> - `TemporalGraphEngine` (manages time-state calculations)
> - `useTemporalData` hook (episode-aware data fetching)
> - Time-evolving data models and transformations
> > **Estimated Effort**: XL (15-20 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Data Models → Card System → Connector Engine → Timeline → Integration

---

## Context

### Refined Requirements (CRITICAL)

**Connector System**:
- **Unified style**: Orthogonal segments with rounded, smooth corners
- **Visual reference**: Subway maps, circuit boards, organized flow diagrams
- **Hover behavior**: Hue shift to signify relationship type + intensity
- **Relationship badges**: "<--- daughter --->", "<--- love interest --->", "<--- rival --->"
- **Dynamic**: Relationships appear/disappear/change as timeline progresses

**Timeline System**:
- **Episode slider**: Scrub through s01e01 → s01e07 (and beyond)
- **Time-aware rendering**: Cards and connectors show state at selected episode
- **Animation**: Smooth transitions between time states
- **Playback**: Play/pause auto-advance through episodes

**Evolving Cards**:
- **Dynamic metrics**: Presence %, intensity, bond strength change over time
- **Evolving classifications**: Roles, ranks, titles change (Student → Graduate, etc.)
- **Body measurements**: Height, build descriptors (for vampire maturation)
- **Bloodline purity**: Changes based on actions, feedings, transformations
- **Key feats**: Achievements unlock over episodes ("First Feeding", "Blood Bond Formed")
- **Traits**: Add/remove as character develops
- **Visual evolution**: Card styling subtly changes (wear, prestige indicators)

**Data Architecture**:
- **Time-series data**: All character attributes tracked per-episode
- **Relationship evolution**: Relationships form, strengthen, weaken, break
- **Event-driven changes**: Specific moments trigger card updates
- **Historical view**: Can view any past episode state

---

## Work Objectives

### Core Objective
Build a **temporal visualization system** where character cards and relationships evolve over the story timeline, with orthogonal rounded connectors and interactive timeline scrubbing.

### Concrete Deliverables
1. **TemporalCharacterCard** component (`frontend/components/TemporalCharacterCard.tsx`)
2. **CardEvolutionEngine** (`frontend/lib/cardEvolutionEngine.ts`) - calculates card state at time T
3. **TimelineConnector** component (`frontend/components/TimelineConnector.tsx`)
4. **RelationshipBadge** component (`frontend/components/RelationshipBadge.tsx`)
5. **EpisodeTimeline** slider (`frontend/components/EpisodeTimeline.tsx`)
6. **TemporalGraphEngine** (`frontend/lib/temporalGraphEngine.ts`) - manages time-state
7. **useTemporalData** hook (`frontend/lib/useTemporalData.ts`)
8. **Time-evolution data models** (`frontend/lib/temporalModels.ts`)
9. **Integration** - Full temporal system in characters page

### Definition of Done
- [ ] Timeline slider renders with episode markers (s01e01-s01e07)
- [ ] Scrubbing timeline updates cards and connectors in real-time
- [ ] Cards show evolving metrics (presence, intensity, bond) at selected episode
- [ ] Cards show evolving classifications, feats, traits at selected episode
- [ ] Bloodline purity changes over timeline
- [ ] Body measurements evolve (if applicable)
- [ ] Orthogonal rounded connectors render between related characters
- [ ] Connector hue shifts on hover based on relationship type
- [ ] Relationship badges appear ("<--- daughter --->", etc.)
- [ ] Relationships appear/disappear as timeline progresses
- [ ] Smooth animations between time states
- [ ] Play/pause auto-advance works
- [ ] Edit mode preserved (edits apply to current timeline point)
- [ ] Backend temporal data integrated
- [ ] All evidence captured

### Must Have
- [ ] Time-aware card system with evolving data
- [ ] Episode timeline slider (s01e01 → s01e07+)
- [ ] Orthogonal rounded connectors (subway-map style)
- [ ] Hue-shift hover effects on connectors
- [ ] Relationship badges ("<--- type --->")
- [ ] Dynamic relationship visibility (appear/disappear over time)
- [ ] Evolving metrics (presence %, intensity, bond)
- [ ] Evolving classifications and feats
- [ ] Bloodline purity tracking
- [ ] Smooth timeline transitions
- [ ] Play/pause playback

### Must NOT Have (Guardrails)
- [ ] **NO** organic/chaotic curves (orthogonal only)
- [ ] **NO** static cards (must evolve)
- [ ] **NO** portrait orientation (landscape only)
- [ ] **NO** hardcoded timeline data
- [ ] **NO** changes to other graph components
- [ ] **NO** backend schema changes

---

## Card Evolution System

### Time-Aware Card State

```typescript
interface TemporalCharacterState {
  episodeId: string;
  episodeNumber: number;
  
  // Core identity (mostly static)
  id: string;
  name: string;
  species: 'vampire' | 'human';
  
  // Evolving metrics
  metrics: {
    presencePercentage: number;  // 0-100
    averageIntensity: number;    // 1-5
    bondStrength: number;        // 0-100
    socialStanding: number;      // 0-100
  };
  
  // Evolving classifications
  classification: {
    role: string;           // "Student" → "Graduate" → "Elder"
    rank: string;           // "Novice" → "Adept" → "Master"
    year: number;           // 1, 2, 3...
    status: string;         // "Active", "Exiled", "Transformed"
  };
  
  // Evolving physical (for vampires)
  physical: {
    apparentAge: number;
    build: string;          // "Slender" → "Athletic" → "Predatory"
    height: string;
    distinguishingMarks: string[];
  };
  
  // Evolving bloodline
  bloodline: {
    purity: number;         // 0-100
    generation: number;     // 1st, 2nd, 3rd gen vampire
    sire: string | null;
    progeny: string[];
  };
  
  // Accumulated feats
  feats: {
    id: string;
    name: string;
    episodeUnlocked: string;
    icon: string;
  }[];
  
  // Active traits
  traits: string[];         // Changes as character develops
  
  // Visual evolution
  visualTier: number;       // Affects card styling prestige
  wearLevel: number;        // 0-100, affects card wear/tear
}
```

### Evolution Rules Engine

```typescript
interface EvolutionRule {
  trigger: {
    type: 'episode' | 'event' | 'milestone' | 'relationship';
    condition: string;
  };
  effect: {
    attribute: string;
    operation: 'set' | 'add' | 'multiply' | 'unlock';
    value: any;
  };
}

// Example rules
const evolutionRules: EvolutionRule[] = [
  {
    trigger: { type: 'episode', condition: 's01e03' },
    effect: { attribute: 'feats', operation: 'unlock', value: 'first_feeding' }
  },
  {
    trigger: { type: 'milestone', condition: 'blood_bond_formed' },
    effect: { attribute: 'bloodline.purity', operation: 'add', value: 5 }
  },
  {
    trigger: { type: 'relationship', condition: 'romantic_partner_count > 1' },
    effect: { attribute: 'metrics.socialStanding', operation: 'add', value: 10 }
  }
];
```

### Card Layout: Temporal View

```
┌─────────────────────────────────────────────────────────────────┐
│ [TIER]  ID: VAMP-001    EP: s01e03    [PLAY/PAUSE]             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  KIARA NATT OCH DAG                    [PHOTO]   │
│  │          │  ════════════════════════════════════════════    │
│  │  CREST   │  ROLE: Student (Year 2) ← evolves                │
│  │          │  RANK: Novice Vampire ← evolves                   │
│  └──────────┘  STATUS: Active                                  │
│                                                                 │
│  METRICS (at s01e03):                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Presence: 73% ↑    Intensity: 4.2 ↑    Bond: B+        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  BLOODLINE: Purity 89% ↑ (was 84% at s01e01)                   │
│  PHYSICAL: 17 years | Slender build | 5'6"                     │
│                                                                 │
│  FEATS UNLOCKED:                                               │
│  🩸 First Feeding (s01e03)    💋 First Kiss (s01e02)          │
│                                                                 │
│  ACTIVE TRAITS:                                                │
│  [Rebellious] [Curious] [Blood-Bound] [Awakening]             │
│                                                                 │
│  [◄──────────────────────●──────────────────────►] s01e03      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Connector System: Orthogonal Rounded

### Visual Style

**Orthogonal with Rounded Corners**:
```
    ┌─────────┐
    │         │
    │  CARD   │
    │    A    │
    └────┬────┘
         │
         │ (vertical segment)
         │
    ┌────┴────┐
    │  ROUND  │ ← smooth corner radius
    │  CORNER │
    └────┬────┘
         │
         │ (horizontal segment)
         │
    ┌────┴────┐
    │         │
    │  CARD   │
    │    B    │
    └─────────┘
```

**Implementation**:
```typescript
function generateOrthogonalRoundedPath(
  source: GridPoint,
  target: GridPoint,
  cornerRadius: number = 10
): string {
  // Calculate orthogonal route (Manhattan distance)
  const midX = source.x + (target.x - source.x) / 2;
  
  // Build path with rounded corners
  return `
    M ${source.x} ${source.y}
    L ${midX - cornerRadius} ${source.y}
    Q ${midX} ${source.y} ${midX} ${source.y + (target.y > source.y ? cornerRadius : -cornerRadius)}
    L ${midX} ${target.y - (target.y > source.y ? cornerRadius : -cornerRadius)}
    Q ${midX} ${target.y} ${midX + (target.x > midX ? cornerRadius : -cornerRadius)} ${target.y}
    L ${target.x} ${target.y}
  `;
}
```

### Hover Effects

**Hue Shift by Relationship Type**:
```css
/* Base colors */
--romantic-base: #be185d;
--familial-base: #c9a227;
--antagonistic-base: #dc2626;
--professional-base: #8B5CF6;

/* Hover hue shift */
.connector:hover {
  filter: hue-rotate(15deg) brightness(1.2);
  transition: filter 0.3s ease;
}

/* High intensity glow */
.connector[data-intensity="5"]:hover {
  filter: hue-rotate(15deg) brightness(1.4);
  box-shadow: 0 0 20px currentColor;
}
```

### Relationship Badges

**Badge Component**:
```typescript
interface RelationshipBadgeProps {
  type: 'daughter' | 'son' | 'sire' | 'progeny' | 'love-interest' | 'rival' | 'ally' | 'enemy';
  direction: 'incoming' | 'outgoing' | 'bidirectional';
  intensity: number;
}

// Visual: <--- daughter --->
//         <--- love interest --->
//         ---> rival <---
```

**Badge Layout**:
```
Positioned at midpoint of connector:

    ┌─────────┐
    │  CARD   │
    └────┬────┘
         │
    <--- daughter --->    ← badge appears on hover
         │
    ┌────┴────┐
    │  CARD   │
    └─────────┘
```

---

## Timeline System

### Episode Timeline Component

```typescript
interface EpisodeTimelineProps {
  episodes: Episode[];           // s01e01 through s01e07
  currentEpisode: string;        // "s01e03"
  onEpisodeChange: (episode: string) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed?: number;        // 1x, 2x, 0.5x
}
```

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [◀◀]  [▶/❚❚]  [▶▶]    SPEED: [1x ▼]                        │
│                                                                 │
│  s01e01    s01e02    s01e03    s01e04    s01e05    s01e06...  │
│     │         │         ●         │         │         │        │
│     └─────────┴─────────┴─────────┴─────────┴─────────┘        │
│                                                                 │
│  [══════════════════════════════════════════════════════]      │
│              ▲                                                  │
│         Current: s01e03 - "The Awakening"                      │
└─────────────────────────────────────────────────────────────────┘
```

### Time-State Management

```typescript
class TemporalGraphEngine {
  private characterStates: Map<string, TemporalCharacterState[]>;
  private relationshipStates: Map<string, TemporalRelationship[]>;
  
  // Get state at specific episode
  getCharacterAtEpisode(characterId: string, episodeId: string): TemporalCharacterState {
    // Apply all evolution rules up to this episode
    return this.calculateState(characterId, episodeId);
  }
  
  // Get relationships at specific episode
  getRelationshipsAtEpisode(episodeId: string): TemporalRelationship[] {
    // Filter relationships that exist at this point in time
    return this.relationshipStates.filter(r => 
      r.firstAppearanceEpisode <= episodeId &&
      (r.endEpisode == null || r.endEpisode >= episodeId)
    );
  }
  
  // Animate between episodes
  async transitionToEpisode(fromEpisode: string, toEpisode: string): Promise<void> {
    // Interpolate values for smooth animation
  }
}
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation):
├── Task 1: Create temporal data models
├── Task 2: Create CardEvolutionEngine
└── Task 3: Create time-evolution rules

Wave 2 (Card System):
├── Task 4: Create TemporalCharacterCard component
├── Task 5: Implement evolving metrics display
└── Task 6: Add feats/traits evolution

Wave 3 (Connector System):
├── Task 7: Create orthogonal rounded connector generator
├── Task 8: Create RelationshipBadge component
└── Task 9: Implement hue-shift hover effects

Wave 4 (Timeline & Integration):
├── Task 10: Create EpisodeTimeline slider
├── Task 11: Create TemporalGraphEngine
├── Task 12: Create useTemporalData hook
└── Task 13: Full integration with playback

Critical Path: Task 1 → Task 2 → Task 4 → Task 7 → Task 10 → Task 13
```

---

## TODOs Summary

### Wave 1: Foundation
- **Task 1**: Temporal data models (TemporalCharacterState, TemporalRelationship)
- **Task 2**: CardEvolutionEngine (calculates state at time T)
- **Task 3**: Evolution rules system (triggers and effects)

### Wave 2: Card System
- **Task 4**: TemporalCharacterCard component (landscape, time-aware)
- **Task 5**: Evolving metrics display (animated counters)
- **Task 6**: Feats/traits/classifications evolution

### Wave 3: Connector System
- **Task 7**: Orthogonal rounded connector generator (subway-map style)
- **Task 8**: RelationshipBadge component ("<--- type --->")
- **Task 9**: Hue-shift hover effects

### Wave 4: Timeline & Integration
- **Task 10**: EpisodeTimeline slider (scrubber + play/pause)
- **Task 11**: TemporalGraphEngine (time-state management)
- **Task 12**: useTemporalData hook (episode-aware fetching)
- **Task 13**: Full integration with smooth transitions

---

## Success Criteria

### Must Demonstrate
- [ ] Scrub timeline from s01e01 to s01e07
- [ ] Cards update metrics in real-time
- [ ] Bloodline purity changes over episodes
- [ ] Feats unlock at specific episodes
- [ ] Relationships appear/disappear
- [ ] Orthogonal rounded connectors
- [ ] Hover shows hue shift + relationship badge
- [ ] Play button auto-advances through episodes
- [ ] Smooth animations between states

---

## Extraordinary Additions (Make It "Wow")

Based on research into premium data visualization, luxury UI patterns, and Apple Design Award winners, here are additions that will elevate this from **good** to **extraordinary**:

### P0: Essential "Wow" Features

**1. Liquid Glass Morphism**
- Cards appear as flowing, semi-transparent obsidian
- High blur (`blur(40px)`) with multiple layered shadows
- Inner glow that creates depth
- **Implementation**: Enhanced CSS `backdrop-filter` with liquid glass formula

**2. Living Typography**
- Character names have variable font weight that responds to intensity
- Subtle "breathing" animation (font-weight 400 → 500 → 400)
- Creates sense of life/presence
- **Implementation**: CSS `font-variation-settings` with breathing keyframes

**3. Blood Pulse Animation**
- Cards have subtle heartbeat glow synchronized to relationship intensity
- Higher intensity = faster pulse
- Creates living, breathing ecosystem feel
- **Implementation**: Box-shadow pulse animation tied to intensity metric

**4. Magnetic Connectors**
- As cursor approaches, nearby connectors subtly bend toward cursor
- Like iron filings to a magnet
- Creates sense of interactivity and responsiveness
- **Implementation**: SVG path manipulation on mousemove with distance calculation

### P1: High-Impact Features

**5. Character Aura Visualization**
- Each character emits subtle particle field
- Particles orbit character card
- Color-coded by species (crimson for vampires, gold for humans)
- **Implementation**: Canvas or SVG particle system with orbital animation

**6. Relationship Ribbon Charts**
- Connectors are variable-width ribbons showing relationship history
- Width changes along path based on historical intensity
- Visual timeline embedded in connector itself
- **Implementation**: SVG paths with variable stroke-width along path

**7. Haptic Timeline Scrubbing**
- Slider provides resistance at key narrative moments
- "Snap points" at episode boundaries with vibration
- Visual "gravity well" effect at major beats
- **Implementation**: Custom scrub handler with `navigator.vibrate()` and snap logic

**8. Metric Counter Animation**
- Numbers don't just change—they "roll" like slot machines
- Satisfying tactile feel during timeline scrub
- **Implementation**: `requestAnimationFrame` counter with easing

### P2: Delight Features

**9. Feat Unlock Celebration**
- When feat unlocks during playback, badge "blooms" into existence
- Particle burst celebration
- **Implementation**: Framer Motion with scale/rotate bloom animation

**10. Bloodline Purity "Flow"**
- Purity changes show liquid animation (mercury rising)
- Shimmer effect on bloodline meter
- **Implementation**: CSS gradient animation with `background-position` shift

**11. Relationship "Heartbeat"**
- Intense relationships have ECG-style pulsing lines
- Synchronized to scene intensity
- **Implementation**: SVG path animation mimicking ECG waveform

**12. "Blood Memory" Ghost Echo**
- Click any card → see ghostly echo of past selves
- Semi-transparent previous-episode states overlay
- Compare evolution at a glance
- **Implementation**: Stacked card renders with opacity/blur

### P3: Easter Eggs & Secrets

**13. Secret Relationships Toggle**
- Some relationships hidden by default (secret affairs, hidden alliances)
- Settings modal allows "Reveal All Secrets" toggle
- Secret relationships appear with special styling (ghostly, flickering)
- **Implementation**: Hidden relationship flag + settings modal

**14. Midnight Mode (Auto-Activate)**
- Between 12am-1am, interface enters deeper "midnight mode"
- Occasional lightning flash effects
- Hidden lore snippets appear on hover
- Deeper shadows, more intense crimson accents
- **Implementation**: Time-based CSS class activation + random lightning intervals

**15. Character Voices (Spatial Audio)**
- Each character has subtle ambient sound on hover
- Vampires: Heartbeats, soft breathing, whispered names
- Humans: Softer sounds, nervous breathing
- Spatial audio positioning (left/right based on card position)
- **Implementation**: Web Audio API with positional audio
- **Note**: Respects `prefers-reduced-motion` and has mute toggle

**16. Konami Code Secret View**
- ↑↑↓↓←→←→BA unlocks "bloodline purity matrix" view
- Alternative visualization mode showing pure bloodline hierarchy
- **Implementation**: Keyboard sequence detector

**17. Relationship "Tug"**
- Hover character for >5 seconds → connected characters subtly pull toward them
- Visual representation of attraction/influence
- **Implementation**: Force simulation with hover trigger

**Saved for Future Concepts:**
- **Blood Bond Effect** - Interface-wide atmosphere shift when viewing blood-bonded pairs (deferred to future release)

### Implementation Priority

| Priority | Feature | Impact | Effort | Phase |
|----------|---------|--------|--------|-------|
| 🔴 P0 | Liquid glass + refraction | High | Medium | Wave 2 |
| 🔴 P0 | Blood pulse animation | High | Low | Wave 2 |
| 🔴 P0 | Living typography | High | Low | Wave 2 |
| 🔴 P0 | Particle trail connectors | High | Medium | Wave 3 |
| 🔴 P0 | Blood Memory ghost echo | High | Medium | Wave 4 |
| 🔴 P0 | Relationship resonance | High | Low | Wave 3 |
| 🔴 P0 | Time rewind effect | High | Low | Wave 4 |
| 🟡 P1 | Intensity heatmap overlay | High | Medium | Wave 4 |
| 🟡 P1 | Relationship lifecycle (patina) | High | Medium | Wave 3 |
| 🟡 P1 | Predictive web (ghost futures) | Medium | High | Wave 4 |
| 🟡 P1 | Card breath hover | Medium | Low | Wave 2 |
| 🟡 P1 | Metric counter animation | Medium | Low | Wave 2 |
| 🟡 P1 | Feat unlock celebration | Delight | Low | Wave 4 |
| 🟡 P1 | Bloodline purity flow | Medium | Low | Wave 2 |
| 🟡 P1 | Accessibility enhancements | Critical | Medium | All waves |
| 🟡 P1 | Performance optimizations | Critical | Medium | All waves |
| 🟢 P2 | Secret relationships toggle | Delight | Low | Wave 4 |
| 🟢 P2 | Midnight mode | Delight | Low | Post-MVP |
| 🟢 P2 | Character voices (spatial audio) | Delight | High | Post-MVP |
| 🟢 P2 | Konami code | Delight | Low | Post-MVP |
| 🟢 P2 | Relationship tug | Delight | Low | Post-MVP |
| ⚪ Future | Blood Bond atmosphere shift | High | Medium | Future concept |

---

## Next Steps

1. Run `/start-work` to begin execution
2. Execute Wave 1 tasks (Foundation)
3. Execute Wave 2 tasks (Card System + P0 extraordinary features)
4. Execute Wave 3 tasks (Connector System + P1 features)
5. Execute Wave 4 tasks (Timeline + Integration + P2 features)
6. Add P3 easter eggs (post-MVP)
7. Run final QA
8. Capture evidence
9. Commit all changes

**Plan saved to**: `.sisyphus/plans/elite-character-map-redesign.md`

**Ready to execute**: Run `/start-work` to begin
