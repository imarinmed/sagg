# Work Plan: Premium Character Map Redesign - COMPREHENSIVE REFINED

## TL;DR

> **A cinematic, scalable character relationship visualization with distinct card aesthetics, intelligent navigation, and progressive disclosure.** Student/Cattle cards are portrait with overt tracking themes and 3D flip reveals. Authority cards are landscape club memberships with embossed mystery. **Smart clustering** handles 50+ characters. **Focus mode** prevents connector chaos. **Zoomable timeline** shows episode→scene→moment granularity. **Command palette** enables instant search. **Full accessibility** including keyboard nav, screen readers, and colorblind-safe design.
> 
> **Key Innovations**:
> - **3 View Modes**: Compact (clustered), Detail (full card), Compare (side-by-side)
> - **Smart Clustering**: Auto-group by family/year with expand/collapse
> - **Focus Mode**: Isolate character + connections, fade everything else
> - **Zoomable Timeline**: Episode → Scene → Key Moment (3 zoom levels)
> - **Spoiler System**: Hidden/Hinted/Revealed states for secret relationships
> - **Command Palette**: Cmd+K search, filters, navigation
> - **Accessibility First**: Keyboard nav, screen readers, colorblind-safe, reduced motion
> 
> **Deliverables**: 35 tasks across 7 waves
> **Estimated Effort**: 40-50 hours
> **Parallel Execution**: YES - 7 waves

---

## Critical Design Decisions

### 1. Scale Strategy: 8 → 20 → 50 Characters

**Problem**: Current design collapses at scale

**Solution: Progressive Disclosure**

```
8 CHARACTERS (Current)
├── View: Detail mode, all cards expanded
├── Connectors: All visible
└── Layout: Freeform mind map

20 CHARACTERS (Season 2)
├── View: Mixed mode
│   ├── Selected: Detail card
│   └── Others: Compact cards
├── Connectors: Selected character only
└── Layout: Clustered by family

50 CHARACTERS (Full Series)
├── View: Compact mode default
│   ├── Clusters collapsed
│   └── Search-first navigation
├── Connectors: Filtered by type
└── Layout: Hierarchical clusters
```

### 2. Mobile Strategy

**Problem**: Portrait cards (300×480px) don't fit on mobile

**Solution: Adaptive Layout**

```
DESKTOP (≥1024px)
├── Cards: Portrait (300×480px)
├── Layout: Freeform mind map
├── Interactions: Hover, 3D flip
└── Timeline: Full horizontal

TABLET (768-1023px)
├── Cards: Portrait (240×384px)
├── Layout: Organized grid
├── Interactions: Tap to expand
└── Timeline: Compact horizontal

MOBILE (<768px)
├── Cards: Horizontal scroll
│   ├── Peek: 100px width
│   └── Expanded: Full screen sheet
├── Layout: List + Focus mode
├── Interactions: Tap to expand sheet
└── Timeline: Vertical stack
```

### 3. Connector Visibility Strategy

**Problem**: Always-visible connectors = spaghetti at scale

**Solution: Contextual Visibility**

```
DEFAULT STATE
├── Show: No connectors (clean)
└── On hover: Show connectors for hovered card

FOCUS MODE (Click card)
├── Show: Connectors for selected character only
├── Fade: Other cards to 30% opacity
└── Highlight: Active relationship types

FILTER MODE
├── Show: Only filtered relationship types
├── Example: "Show only romantic + familial"
└── Hide: All other connectors

COMPARE MODE (2-3 cards selected)
├── Show: Connectors between selected cards
├── Show: Mutual connections
└── Highlight: Shared relationships
```

---

## Card System - REFINED

### Student/Cattle Card (Portrait)

**Dimensions**: 300px × 480px (desktop) / 240px × 384px (tablet)
**Border Radius**: 16px

**3 VIEW STATES**:

#### Compact State (Default in crowds)
```
┌─────────────────┐
│  [PORTRAIT]     │
│   100×120px     │
├─────────────────┤
│ KIARA NATT OCH  │
│ DAG             │
│ STK-24-KND-001  │
│ [QR mini]       │
└─────────────────┘
Size: 140px × 200px
```

#### Detail State (Selected/Expanded)
```
┌─────────────────────────────┐
│  NATT OCH DAG ESTATE        │
│  ═══════════════════════    │
│                             │
│  ┌─────────────────────┐   │
│  │    [PORTRAIT]       │   │
│  │    260×200px        │   │
│  └─────────────────────┘   │
│                             │
│  KIARA NATT OCH DAG        │
│  ═══════════════════        │
│                             │
│  STOCK ID: STK-24-KND-001-A │
│  HERD CLASS: A [PREMIUM]    │
│  BLOOD TYPE: PURE A+        │
│  PROCESSED: s01e01          │
│  ORIGIN: WILD               │
│  STATUS: ACTIVE             │
│  VALUE: €2,400,000          │
│                             │
│  ┌──────────┐              │
│  │ [QR CODE]│ 80×80px      │
│  │ ▓▓▓▓▓▓▓▓ │              │
│  └──────────┘              │
│                             │
│  [CLICK TO VIEW GRADING]   │
│                             │
│  PROPERTY OF ESTATE        │
└─────────────────────────────┘
Size: 300px × 480px
```

#### Back State (3D Flip Reveal)
```
┌─────────────────────────────┐
│  GRADING REPORT             │
│  ═══════════════════════    │
│                             │
│  PRESENCE.............. A+  │
│  INTENSITY............. A   │
│  BOND STRENGTH......... B+  │
│  SOCIAL STANDING....... A   │
│  BLOODLINE PURITY...... 89% │
│  CONDITION............. EXC │
│  BREEDING POTENTIAL.... HIGH│
│                             │
│  ─────────────────────────  │
│                             │
│  FEATS UNLOCKED:            │
│  🩸 First Feeding (s01e03)  │
│  💋 First Kiss (s01e02)     │
│  ⚡ Blood Bond (s01e05)     │
│                             │
│  ─────────────────────────  │
│                             │
│  TRAITS:                    │
│  [Rebellious] [Curious]     │
│  [Blood-Bound] [Awakening]  │
│                             │
│  [CLICK TO RETURN]          │
└─────────────────────────────┘
```

**Animation**:
- **Flip Duration**: 800ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Perspective**: 1000px
- **Reduced Motion**: Instant swap (no 3D)

### Authority Club Card (Landscape)

**Dimensions**: 400px × 260px (desktop) / 320px × 208px (tablet)
**Border Radius**: 20px

**View States**:

#### Compact State
```
┌────────────────────────┐
│ [HEX EMBOSSED]  HENRY  │
│  60px          NATT OCH│
│                DAG     │
│ [SEAL] [HOLO] [CHIP]   │
└────────────────────────┘
Size: 280px × 140px
```

#### Detail State
```
┌─────────────────────────────────────────────────────────────┐
│  ✦ ETERNAL COUNCIL ✦          [HOLOGRAM]  [WATERMARK]      │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│   ┌──────────┐                                             │
│  ╱            ╲    HENRY NATT OCH DAG                      │
│ │   EMBOSSED   │   ═══════════════════                     │
│ │   HEXAGON    │   Patriarch | Elder | Ancient Blood       │
│  ╲            ╱    Generation: 3rd | Purity: ████████      │
│   └──────────┘     Member Since: MDCCCXLVII (1847)         │
│      90px                                                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CLEARANCE: LEVEL ALPHA    SECT: NATT OCH DAG       │  │
│  │  INFLUENCE: EXTENSIVE      ASSETS: CLASSIFIED       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│     [SEAL]              [HOLOGRAM]              [CHIP]     │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│  AUTHORIZED PERSONNEL ONLY | ESTATE SECURITY DIVISION      │
└─────────────────────────────────────────────────────────────┘
```

---

## Navigation System - NEW

### Command Palette (Cmd+K)

**Trigger**: `Cmd/Ctrl + K` or click search icon

**Features**:
- Search characters by name
- Jump to specific episode
- Filter by relationship type
- Toggle view modes
- Keyboard-only navigation

```
┌─────────────────────────────────────┐
│  🔍 Search characters, episodes...  │
├─────────────────────────────────────┤
│  CHARACTERS                         │
│  ❯ Kiara Natt och Dag              │
│    Alfred                          │
│    Henry Natt och Dag              │
│                                     │
│  EPISODES                           │
│    S01E01 - The Awakening          │
│    S01E02 - First Blood            │
│                                     │
│  FILTERS                            │
│    Show: Vampires only             │
│    Show: Romantic relationships    │
│                                     │
│  VIEW MODES                         │
│    Switch to Compact view          │
│    Switch to Focus mode            │
└─────────────────────────────────────┘
```

### Smart Filters

**Filter Categories**:

```typescript
interface FilterState {
  // Character filters
  species: ('vampire' | 'human')[];
  year: (1 | 2 | 3)[];
  status: ('active' | 'quarantine' | 'processing')[];
  herdClass: ('A' | 'B' | 'C')[];
  
  // Relationship filters
  relationshipTypes: RelationshipType[];
  minStrength: number; // 1-5
  showSecret: boolean;
  
  // View filters
  viewMode: 'compact' | 'detail' | 'compare';
  clusterBy: 'family' | 'year' | 'species' | 'none';
}
```

**Filter UI**:
```
┌─────────────────────────────────────┐
│  FILTERS                    [Clear] │
├─────────────────────────────────────┤
│  Species: [All] [Vampire] [Human]   │
│  Year:    [All] [1] [2] [3]         │
│  Status:  [All] [Active] [Quar...]  │
│                                     │
│  Relationships:                     │
│  [✓] Romantic  [✓] Familial        │
│  [ ] Friendship [✓] Antagonistic   │
│  [ ] Professional                  │
│                                     │
│  Min Strength: [━━●━━━━] 3/5        │
│                                     │
│  [✓] Include secret relationships  │
└─────────────────────────────────────┘
```

### View Modes

#### Compact Mode (Default for crowds)
- Cards: 140×200px (portrait) or 280×140px (landscape)
- Show: Name, Stock ID, mini QR
- Connectors: None (hover to show)
- Layout: Clustered

#### Detail Mode (One selected)
- Cards: Full size
- Show: All details
- Connectors: Selected character only
- Layout: Freeform

#### Compare Mode (2-3 selected)
- Cards: Side-by-side
- Show: Shared relationships highlighted
- Connectors: Between selected only
- Layout: Horizontal split

#### Focus Mode (Immersive)
- Cards: One central, others faded
- Show: Full details + relationship summary panel
- Connectors: All for selected character
- Layout: Radial around selected

---

## Clustering System - NEW

### Auto-Cluster by Category

```typescript
interface ClusterConfig {
  by: 'family' | 'year' | 'species' | 'authority';
  layout: 'grid' | 'hierarchy' | 'force';
}
```

**Cluster Visual**:
```
┌─────────────────────────────────────────┐
│  NATT OCH DAG FAMILY          [5] 🔽   │
│  ═══════════════════════════════════   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │KIARA│ │HENRY│ │DESIR│ │JACQU│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│  HUMANS                         [4] 🔽 │
│  ═══════════════════════════════════   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ALFRED│ │ELISE│ │CHLOE│ │ERIC │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
└─────────────────────────────────────────┘
```

**Cluster Interactions**:
- Click header: Expand/collapse cluster
- Drag cluster: Move entire group
- Click count badge: Show cluster summary

---

## Timeline System - REFINED

### Zoomable Timeline (3 Levels)

```
LEVEL 1: EPISODES (Zoomed Out)
s01e01 ═══════●═══════ s01e02 ═══════●═══════ s01e03
"The        │         "First       │         "The
Awakening"   │          Blood"     │          Hunger"
             │                      │
           [EP1]                  [EP2]

LEVEL 2: SCENES (Zoomed In)
s01e01-scene-1 ──●── s01e01-scene-2 ──●── s01e01-scene-3
Opening       │    Kiara meets     │    Bloodlust
scene         │    Alfred          │    moment
              │                      │
            [Scene]               [Scene]

LEVEL 3: KEY MOMENTS (Max Zoom)
00:00 ──♦── 02:34 ──●── 05:12 ──♦── 08:45
Intro    │   First   │   Kiss    │   Feeding
         │   glance  │   scene   │
         │                      │
       [Moment]               [Moment]
       ♦ = Major event
       ● = Regular scene
```

### Timeline Controls

```
┌─────────────────────────────────────────────────────────┐
│  ◀◀  ▶/❚❚  ▶▶    [Episode] [Scene] [Moment]          │
│                                                         │
│  s01e01 ──────●────── s01e02 ──────♦────── s01e03     │
│  "The          │      "First       │      "The         │
│   Awakening"   │       Blood"     │       Hunger"     │
│                │                   │                   │
│              [Scene 3]          [Major Event]          │
│                                                         │
│  Current: s01e02-scene-3 "The First Bite"             │
│  [━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]     │
└─────────────────────────────────────────────────────────┘
```

### Relationship Lifecycle Visualization

**Show when relationships form/change**:
```
Kiara ──────●═══════●───────●═══════●───────►
            │       │       │       │
            │    [BOND    │       │
            │     FORMS]  │       │
            │       │       │       │
Alfred ─────┘       └───────┘       └───────►

● = Episode marker
═══ = Active relationship
─── = Before relationship formed
```

---

## Connector System - REFINED

### Contextual Visibility

**State Machine**:
```typescript
type ConnectorVisibility = 
  | 'hidden'      // Default: clean view
  | 'hover'       // Show on card hover
  | 'focus'       // Show for selected character
  | 'filter'      // Show filtered types
  | 'compare'     // Show between compared cards
  | 'all';        // Override: show everything
```

### Visual Encoding (Colorblind-Safe)

| Type | Color | Pattern | Icon |
|------|-------|---------|------|
| Romantic | Crimson #be185d | Solid | 💕 |
| Familial | Gold #c9a227 | Dashed | 👑 |
| Antagonistic | Red #dc2626 | Dotted | ⚔️ |
| Friendship | Silver #a1a1aa | Dash-dot | 🤝 |
| Blood Bond | Purple #991b1b | Thick + glow | 🩸 |
| Professional | Blue #8B5CF6 | Double line | 💼 |

### Strength Encoding

```
Strength 1: ─────────── 1px, 40% opacity
Strength 2: ═══════════ 2px, 50% opacity
Strength 3: ███████████ 3px, 70% opacity
Strength 4: ███████████ 4px, 85% opacity
Strength 5: ███████████ 5px, 100% + glow
```

### Relationship Badges

**Format**:
```
<--- daughter --->     (Bidirectional)
--- rival --->          (Outgoing)
<--- love interest     (Incoming)
```

**Position**: Midpoint of connector
**Visibility**: On hover or in focus mode

---

## Spoiler System - NEW

### Relationship Visibility States

```typescript
interface RelationshipVisibility {
  state: 'hidden' | 'hinted' | 'revealed';
  revealedAt?: string; // Episode ID when revealed
  hintText?: string;   // Ambiguous hint
}
```

**Visual States**:

```
HIDDEN (Default)
┌─────────────────────────────┐
│  [REDACTED]                 │
│  ═══════════════════════    │
│                             │
│  [LOCKED UNTIL S01E05]      │
│                             │
│  [Reveal Spoiler] 🔓        │
└─────────────────────────────┘

HINTED (After hint episode)
┌─────────────────────────────┐
│  [UNKNOWN CONNECTION]       │
│  ═══════════════════════    │
│                             │
│  "Their paths cross in      │
│   unexpected ways..."       │
│                             │
│  [Reveal Spoiler] 🔓        │
└─────────────────────────────┘

REVEALED (After reveal episode or user click)
┌─────────────────────────────┐
│  ROMANTIC RELATIONSHIP      │
│  ═══════════════════════    │
│                             │
│  Kiara <--- love ---> Alfred│
│  Formed: S01E03             │
│  Strength: 4/5              │
│                             │
│  [Hide Spoiler] 🔒          │
└─────────────────────────────┘
```

### Spoiler Settings

```
┌─────────────────────────────────────┐
│  SPOILER SETTINGS                   │
├─────────────────────────────────────┤
│  [✓] Hide future relationships     │
│  [✓] Show hints before reveals     │
│  [ ] Auto-reveal at episode        │
│                                     │
│  Current episode: S01E03           │
│  Revealing up to: S01E03           │
│                                     │
│  [Reveal All] [Reset to Current]   │
└─────────────────────────────────────┘
```

---

## Accessibility System - NEW

### Keyboard Navigation

```
Navigation:
- Tab: Move focus between cards
- Shift+Tab: Move focus backwards
- Enter: Select card / Flip card
- Esc: Exit focus mode / Close panel
- Arrow keys: Pan canvas
- +/-: Zoom in/out
- 0: Reset zoom

Shortcuts:
- Cmd/Ctrl+K: Open command palette
- F: Toggle focus mode
- C: Toggle compact/detail view
- R: Reset view
- /: Search
```

### Screen Reader Support

```typescript
interface AriaLabels {
  card: '${name}, ${role}, ${species}, Stock ID ${id}';
  connector: '${from} to ${to}, ${type} relationship, strength ${n}';
  timeline: 'Episode ${n}, ${title}, ${description}';
  cluster: '${name} cluster, ${count} characters';
}
```

### Colorblind Safety

**Patterns + Colors**:
- Romantic: Solid line + 💕 icon
- Familial: Dashed line + 👑 icon
- All types have distinct patterns, not just colors

**Testing**:
- Deuteranopia (green-blind)
- Protanopia (red-blind)
- Tritanopia (blue-blind)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .card-flip {
    transition: none;
    transform: none;
  }
  
  .card-front,
  .card-back {
    display: none;
  }
  
  .card-front.active,
  .card-back.active {
    display: block;
  }
  
  .connector-glow {
    animation: none;
  }
}
```

---

## Mini-map System - NEW

### Overview Navigation

```
┌─────────────────────────────────────────┐
│  MAIN CANVAS                            │
│                                         │
│  ┌─────┐      ┌─────┐                  │
│  │ A   │══════│ B   │                  │
│  └──┬──┘      └──┬──┘                  │
│     ║            ║                      │
│  ┌──┴──┐      ┌──┴──┐                  │
│  │ C   │══════│ D   │                  │
│  └─────┘      └─────┘                  │
│                                         │
│                    ┌─────────────┐     │
│                    │  MINI-MAP   │     │
│                    │  ┌───────┐  │     │
│                    │  │ ▓▓▓▓▓ │  │     │
│                    │  │ ▓▓▓▓▓ │  │     │
│                    │  │ ▓▓▓▓▓ │  │     │
│                    │  └───────┘  │     │
│                    │     [□]     │     │
│                    └─────────────┘     │
└─────────────────────────────────────────┘
```

**Mini-map Features**:
- Shows entire graph as thumbnail
- Viewport box shows current view
- Click to pan to location
- Drag viewport box to pan
- Character dots update in real-time

---

## Engagement & Progression - NEW

### Exploration Tracking

```typescript
interface ExplorationProgress {
  charactersViewed: string[];
  relationshipsDiscovered: string[];
  episodesExplored: string[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}
```

**Achievements**:
- "First Blood": View first vampire character
- "Matchmaker": Discover 5 romantic relationships
- "Detective": Reveal 3 secret relationships
- "Historian": Explore all episodes
- "Completionist": View all characters

### Dossier Completion

```
┌─────────────────────────────────────┐
│  DOSSIER COMPLETION                 │
├─────────────────────────────────────┤
│  Characters: 8/8 ████████████ 100% │
│  Relationships: 12/15 ████████░░ 80%│
│  Episodes: 5/7 ████████░░░░░░ 71%  │
│  Secrets: 2/5 ███░░░░░░░░░░░░ 40%  │
│                                     │
│  [View Achievements] [Export Data] │
└─────────────────────────────────────┘
```

---

## Mobile Adaptations - NEW

### Touch Interactions

```
TAP CARD
├── Single tap: Expand to full sheet
├── Double tap: Flip card
└── Long press: Show context menu

PINCH CANVAS
├── Pinch in: Zoom out
├── Pinch out: Zoom in
└── Double tap: Reset zoom

SWIPE
├── Horizontal: Scroll through cards
├── Vertical: Scroll timeline
└── Edge swipe: Open navigation
```

### Bottom Sheet (Mobile Detail View)

```
┌─────────────────────────────────────┐
│  ━━━━━ (drag handle)               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [PORTRAIT]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  KIARA NATT OCH DAG                │
│  STK-24-KND-001-A                  │
│                                     │
│  [Profile] [Metrics] [Relations]   │
│  ═════════════════════════════════ │
│                                     │
│  (Tab content here)                │
│                                     │
└─────────────────────────────────────┘
```

---

## Work Objectives - REFINED

### Core Objective
Create a cinematic, scalable character relationship visualization that handles 8-50+ characters through progressive disclosure, with distinct card aesthetics, intelligent navigation, and full accessibility.

### Concrete Deliverables

#### Wave 0: Foundation
1. **CommandPalette** component - Search, filters, navigation
2. **FilterPanel** component - Character and relationship filters
3. **ViewModeSwitcher** component - Compact/Detail/Compare/Focus modes
4. **useViewState** hook - Manage view mode, filters, selection

#### Wave 1: Card System
5. **StudentCattleCard** component - Portrait, QR code, tracking
6. **AuthorityClubCard** component - Landscape, embossed, luxury
7. **CardCompact** variant - Small size for crowds
8. **CardDetail** variant - Full size with all data
9. **CardCompare** variant - Side-by-side layout

#### Wave 2: 3D Animation
10. **CardFlip3D** component - Reusable flip wrapper
11. **FlipAnimation** utilities - Spring physics, reduced motion
12. **GlowEffects** components - Hover, active states

#### Wave 3: Navigation
13. **CommandPalette** implementation - Cmd+K search
14. **FilterSystem** - Species, year, status, relationships
15. **ViewModeSystem** - Compact/Detail/Compare/Focus
16. **MiniMap** component - Overview navigation

#### Wave 4: Clustering
17. **ClusterContainer** component - Group cards
18. **ClusterHeader** component - Expand/collapse
19. **AutoCluster** logic - Group by family/year/species
20. **ClusterLayout** engine - Grid/hierarchy/force

#### Wave 5: Timeline
21. **ZoomableTimeline** component - 3 zoom levels
22. **EpisodeMarkers** component - Circular stops
23. **SceneMarkers** component - Scene-level ticks
24. **KeyMomentMarkers** component - Diamond events
25. **RelationshipLifecycle** - Show formation/change

#### Wave 6: Connectors
26. **RelationshipConnector** SVG component - Orthogonal paths
27. **ConnectorVisibility** system - Contextual show/hide
28. **RelationshipBadge** component - Hover labels
29. **ConnectorGlow** effects - Hover highlights
30. **ColorblindPatterns** - Pattern + color encoding

#### Wave 7: Spoilers & Accessibility
31. **SpoilerSystem** - Hidden/Hinted/Revealed states
32. **KeyboardNavigation** - Full keyboard support
33. **ScreenReader** labels - ARIA attributes
34. **ReducedMotion** support - Accessibility
35. **ColorblindTesting** - Safe color palettes

#### Wave 8: Integration
36. **CharacterGraphLayout** - Main layout component
37. **MobileAdaptations** - Touch, bottom sheets
38. **EngagementSystem** - Achievements, progress
39. **ExportSystem** - Screenshots, links, data
40. **PageIntegration** - Full characters page

### Definition of Done

- [ ] Cards have 3 view states (Compact/Detail/Compare)
- [ ] 3D flip animation works (800ms, smooth)
- [ ] Command palette (Cmd+K) searches characters
- [ ] Filters work (species, year, status, relationships)
- [ ] View modes work (Compact/Detail/Compare/Focus)
- [ ] Clustering groups cards by family/year
- [ ] Timeline has 3 zoom levels (Episode/Scene/Moment)
- [ ] Connectors show contextually (hover/focus/filter)
- [ ] Spoiler system works (Hidden/Hinted/Revealed)
- [ ] Keyboard navigation works (Tab, Enter, Esc, arrows)
- [ ] Screen reader support (ARIA labels)
- [ ] Colorblind-safe (patterns + colors)
- [ ] Reduced motion support
- [ ] Mobile adaptations (touch, bottom sheets)
- [ ] Mini-map navigation
- [ ] Export/share functionality
- [ ] Responsive design (desktop/tablet/mobile)

### Must Have
- [ ] 3 view states for cards
- [ ] Command palette search
- [ ] Filter system
- [ ] Focus mode
- [ ] Zoomable timeline
- [ ] Contextual connector visibility
- [ ] Spoiler system
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Mobile adaptations

### Must NOT Have (Guardrails)
- [ ] **NO** always-visible connectors (contextual only)
- [ ] **NO** single card size (must have variants)
- [ ] **NO** desktop-only (mobile first)
- [ ] **NO** color-only encoding (patterns required)
- [ ] **NO** motion-required (reduced motion support)
- [ ] **NO** spoilers by default (opt-in reveal)

---

## Execution Strategy

### Waves (Parallel where possible)

```
Wave 0: Foundation (Prerequisites)
├── Task 1-4: Command palette, filters, view modes, state management
└── Output: useViewState hook, FilterPanel, ViewModeSwitcher

Wave 1: Card System (Blocked by Wave 0)
├── Task 5-9: Student/Authority cards, 3 size variants
└── Output: Complete card component library

Wave 2: Animation (Parallel with Wave 1)
├── Task 10-12: 3D flip, spring physics, glow effects
└── Output: CardFlip3D, animation utilities

Wave 3: Navigation (Blocked by Wave 0)
├── Task 13-16: Command palette, filters, view modes, mini-map
└── Output: Complete navigation system

Wave 4: Clustering (Blocked by Wave 1)
├── Task 17-20: Cluster container, auto-cluster, layouts
└── Output: Clustering system

Wave 5: Timeline (Parallel)
├── Task 21-25: Zoomable timeline, markers, lifecycle
└── Output: Complete timeline system

Wave 6: Connectors (Blocked by Wave 1, 4)
├── Task 26-30: SVG connectors, visibility, badges, accessibility
└── Output: Connector system

Wave 7: Spoilers & A11y (Parallel)
├── Task 31-35: Spoiler system, keyboard, screen reader, motion
└── Output: Accessibility suite

Wave 8: Integration (Blocked by all)
├── Task 36-40: Layout, mobile, engagement, export, page
└── Output: Complete integrated system
```

---

## Success Criteria

### Must Demonstrate
- [ ] Cards work in 3 sizes (Compact 140×200, Detail 300×480, Compare side-by-side)
- [ ] 3D flip animation (800ms, cubic-bezier easing)
- [ ] Command palette opens with Cmd+K
- [ ] Search finds characters by name
- [ ] Filters reduce visible characters
- [ ] View modes switch correctly
- [ ] Focus mode isolates selected character
- [ ] Clusters expand/collapse
- [ ] Timeline zooms (Episode → Scene → Moment)
- [ ] Connectors show on hover/focus
- [ ] Spoilers hidden by default
- [ ] Keyboard navigates cards (Tab, Enter, Esc)
- [ ] Screen reader announces cards
- [ ] Mobile shows bottom sheets
- [ ] Mini-map pans canvas
- [ ] Export generates screenshot

---

## Questions for Final Confirmation

Before I finalize this comprehensive plan, please confirm:

### 1. Cattle Tracking Overtness
How extreme should the cattle themes be?
- **A) Moderate**: Stock ID, Herd Class, QR code
- **B) Strong**: Add Value, Condition, Breeding Potential
- **C) Extreme**: Add Slaughter Date, Yield Estimates, Processing Facility

### 2. Mobile Priority
How important is mobile experience?
- **A) Critical**: Full feature parity
- **B) Important**: Core features work
- **C) Desktop-first**: Mobile is secondary

### 3. Accessibility Priority
How comprehensive should accessibility be?
- **A) WCAG AAA**: Full compliance
- **B) WCAG AA**: Standard compliance
- **C) Basic**: Keyboard + screen reader only

### 4. Timeline Complexity
How deep should the timeline go?
- **A) Episodes only** (simplest)
- **B) Episodes + Scenes** (balanced)
- **C) Full zoom** (Episode → Scene → Moment)

### 5. Spoiler Default
How should spoilers be handled?
- **A) Strict**: Hidden until episode reached
- **B) Moderate**: Hints shown, details hidden
- **C) Lenient**: User can reveal anytime

### 6. Performance vs Features
If we need to cut scope, what stays?
- **A) Keep all features, optimize** (40-50 hours)
- **B) Cut advanced features** (30-35 hours)
- **C) Cut to MVP** (20-25 hours)

---

## Plan Status

**Plan Location**: `.sisyphus/plans/premium-character-map-redesign.md`

**Status**: COMPREHENSIVE REFINED PLAN COMPLETE

**Total Tasks**: 40 (up from 18)
**Estimated Time**: 40-50 hours
**Waves**: 8 parallel waves
**New Systems**: 
- Command palette
- Smart clustering
- Zoomable timeline
- Spoiler system
- Full accessibility
- Mobile adaptations
- Mini-map
- Export/share

**Ready for**: Your final confirmation on the 6 questions above

Once you answer, I'll create the final implementation-ready plan and we can begin with `/start-work`.