# Work Plan: Premium Character Map Redesign - FINAL EXHAUSTIVE

## TL;DR

> **A cinematic, massively scalable character relationship visualization for 50+ characters with "beautiful chaos" connector aesthetics and multi-track timeline.** Student cards are portrait with overt companion-training tracking themes (Social Development ID, Companion Class, Suitability Ratings) and 3D flip reveals showing "Etiquette Assessments." Authority cards are landscape black-club-client cards with embossed mystery. **50+ node mind map** with always-visible connectors that create controlled chaos—hover to focus, fade to clarify. **Multi-track timeline** shows character presence, intimacy levels, and key moments across episode→scene→moment zoom levels. **Full clustering** by vampire families. **Search-first navigation** with command palette. **Dark secret**: The school trains companions/courtesans for the elite.
> 
> **Scale**: 8 → 20 → 50+ characters  
> **Connector Strategy**: Beautiful chaos default, hover to focus  
> **Timeline**: Multi-track with presence heatmaps, intimacy filters, key moments  
> **Theme**: Prestigious academy (public) / Companion training (private)  
> **Total Tasks**: 50 across 10 waves  
> **Estimated Effort**: 60-75 hours

---

## The Dark Secret Theme

### Public Face: "Natt och Dag Academy"
- Prestigious private school for vampire and human youth
- Focus on "social development" and "cultural education"
- Elegant, institutional aesthetic
- Student IDs, class rankings, academic metrics

### Private Reality: "The Companion Program"
- Secret training for future companions, courtesans, arm candy
- Students assessed for: charm, grace, seduction, pleasure arts
- "Graduates" placed with wealthy vampire elite
- Dark euphemisms mask true purpose

### Visual Language

**Public Documentation** (Front of Cards):
```
NATT OCH DAG ACADEMY
Student ID: STD-2024-KND-001
Social Development Track
Etiquette Level: Advanced
Cultural Education: Comprehensive
```

**Private Documentation** (Back of Cards):
```
COMPANION CANDIDATE ASSESSMENT
Asset ID: CMP-24-KND-001-A
Companion Class: A [Premium]
Suitability: High Society / Private
Training Modules: Etiquette, Charm, Seduction
Placement Potential: €2,400,000
Client Suitability: Elite / Ancient
Specialization: Blood-play / Companionship
```

**Euphemism Dictionary**:
| Public Term | Private Meaning |
|-------------|-----------------|
| Social Development | Seduction Training |
| Etiquette Assessment | Pleasure Arts Evaluation |
| Cultural Education | Client Preference Studies |
| Grace Training | Physical Allure Development |
| Charm Class | Emotional Manipulation |
| Suitability Rating | Client Market Value |
| Placement | Assignment to Patron |
| Companion Class | Quality Tier (A/B/C) |

---

## Card System - FINAL

### Student/Companion Cards (Portrait)

**Dimensions**: 300px × 480px (desktop) / 240px × 384px (tablet) / Full-width (mobile)
**Border Radius**: 16px

#### FRONT (Public Face)

```
┌─────────────────────────────┐
│  NATT OCH DAG ACADEMY       │
│  ═══════════════════════    │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │    [PORTRAIT]       │   │
│  │    260×200px        │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  KIARA NATT OCH DAG        │
│  ═══════════════════        │
│                             │
│  STUDENT ID: STD-24-KND-001 │
│  SOCIAL DEV: Advanced Track │
│  ETIQUETTE: Level 3         │
│  CULTURAL ED: Comprehensive │
│  STATUS: Active             │
│                             │
│  ┌──────────┐              │
│  │ [QR CODE]│              │
│  │ ▓▓▓▓▓▓▓▓ │              │
│  └──────────┘              │
│                             │
│  [CLICK FOR ASSESSMENT]    │
│                             │
│  ESTABLISHED 1847          │
└─────────────────────────────┘
```

#### BACK (Private Assessment)

```
┌─────────────────────────────┐
│  COMPANION CANDIDATE        │
│  ASSESSMENT RECORD          │
│  ═══════════════════════    │
│  CLASSIFICATION: CONFIDENTIAL│
│                             │
│  ASSET ID: CMP-24-KND-001-A │
│  COMPANION CLASS: A [ELITE] │
│  SUITABILITY: High Society  │
│  BLOOD TYPE: Pure A+        │
│  TRAINING START: s01e01     │
│  ORIGIN: Wild [Premium]     │
│  STATUS: Active Training    │
│                             │
│  ─── PLACEMENT VALUE ───    │
│  €2,400,000                 │
│                             │
│  ─── TRAINING MODULES ───   │
│  ETIQUETTE.............. A+ │
│  CHARM.................. A  │
│  SEDUCTION.............. B+ │
│  PLEASURE ARTS.......... A  │
│  BLOOD-PLAY............. A+ │
│  CONVERSATION........... A  │
│                             │
│  ─── ACHIEVEMENTS ───       │
│  🩸 First Feeding (s01e03)  │
│  💋 First Kiss (s01e02)     │
│  ⚡ Blood Bond (s01e05)     │
│  🎭 Seduction Mastery       │
│                             │
│  ─── CLIENT SUITABILITY ─── │
│  Elite: ████████████ 95%   │
│  Ancient: ████████░░ 80%   │
│  Noble: █████████░░░ 85%   │
│                             │
│  [CLICK TO RETURN]          │
│  PROPERTY OF ESTATE         │
└─────────────────────────────┘
```

### Authority/Patron Cards (Landscape)

**Dimensions**: 400px × 260px (desktop) / 320px × 208px (tablet)
**Border Radius**: 20px

```
┌─────────────────────────────────────────────────────────────┐
│  ✦ ETERNAL COUNCIL ✦          [HOLOGRAM]  [WATERMARK]      │
│  ═══════════════════════════════════════════════════════   │
│  NATT OCH DAG ESTATE | PRIVATE MEMBERSHIP                  │
│                                                             │
│   ┌──────────┐                                             │
│  ╱            ╲    HENRY NATT OCH DAG                      │
│ │   EMBOSSED   │   ═══════════════════                     │
│ │   HEXAGON    │   Patriarch | Elder | Patron Status       │
│  ╲            ╱    Generation: 3rd | Bloodline: Pure       │
│   └──────────┘     Member Since: MDCCCXLVII (1847)         │
│      OUTLINE                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CLEARANCE: LEVEL ALPHA    SECT: NATT OCH DAG       │  │
│  │  INFLUENCE: EXTENSIVE      ASSETS: CLASSIFIED       │  │
│  │  COMPANION PRIVILEGES: Unlimited                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│     [SEAL]              [HOLOGRAM]              [CHIP]     │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│  AUTHORIZED PERSONNEL ONLY | CLIENT PRIVILEGES             │
└─────────────────────────────────────────────────────────────┘
```

---

## 50+ Node Mind Map - "Beautiful Chaos"

### Visual Strategy: Controlled Chaos

**Default State (The Web)**:
- All 50+ nodes visible
- All 200+ connectors visible
- Opacity creates depth hierarchy
- Slight blur on distant connections
- Animated particle flow along edges

**Visual Hierarchy**:
```
Layer 1 (100% opacity): Selected/hovered card
Layer 2 (90% opacity):  Connected cards (1 hop)
Layer 3 (70% opacity):   Connected cards (2 hops)
Layer 4 (40% opacity):   All other cards
Layer 5 (20% opacity):   Distant connections
```

### Hover Interactions

**Hover Card**:
```
BEFORE: All cards visible, all connectors visible

AFTER:
- Hovered card: 100% opacity, glow effect
- Connected cards: 90% opacity
- Unconnected cards: 30% opacity (faded)
- Connected edges: 100% opacity, animated flow
- Unconnected edges: 10% opacity (ghosted)
```

**Hover Connector**:
```
BEFORE: All cards visible

AFTER:
- Source card: 100% opacity
- Target card: 100% opacity
- Other cards: 40% opacity (dimmed)
- Hovered edge: 100% opacity, pulse animation
- Other edges: 20% opacity (background)
- Relationship badge: Visible at midpoint
```

### Connector Specifications (50+ Nodes)

**Path Style**:
- Orthogonal with rounded corners (Manhattan routing)
- Slight curve for aesthetic (not rigid)
- Bundle similar paths where possible

**Visual Encoding**:
| Type | Color | Pattern | Width | Animation |
|------|-------|---------|-------|-----------|
| Romantic | Crimson #be185d | Solid | 3px | Slow pulse |
| Familial | Gold #c9a227 | Solid | 2px | Steady glow |
| Antagonistic | Red #dc2626 | Dashed | 2px | Sharp flicker |
| Training | Purple #8B5CF6 | Dotted | 2px | Flow dots |
| Blood Bond | Dark Red #991b1b | Thick | 4px | Heartbeat |
| Professional | Blue #4f46e5 | Double | 2px | Static |

**Performance Optimization**:
- Canvas rendering for edges (not SVG)
- Virtual rendering: Only draw visible edges
- Level-of-detail: Simplify distant edges
- GPU acceleration for animations

---

## Multi-Track Timeline - "The Striking Component"

### Concept: DAW-style Multi-Track Timeline

Like Ableton Live or DaVinci Resolve, but for narrative data.

### Track Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZOOM: [Episode ▼]  FILTERS: [All ▼]  PLAYBACK: [▶/❚❚]  [◀◀] [▶▶]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRACK 1: EPISODE MARKERS                                                   │
│  s01e01 ───────●─────── s01e02 ───────●─────── s01e03 ───────●───────►    │
│  "The         │        "First        │        "The        │               │
│   Awakening"  │         Blood"      │         Hunger"    │               │
│               │                     │                    │               │
│  TRACK 2: KIARA PRESENCE [████████░░] 80%                                  │
│  ████████░░░░░░████████████░░░░░░████████░░░░░░████████████████░░░░░░►    │
│  High      Low           High              Medium         High            │
│                                                                             │
│  TRACK 3: INTIMACY LEVEL [FILTER: All ▼]                                   │
│  ░░░░██░░░░░░░░████░░░░░░░░██░░░░░░░░████░░░░░░░░██░░░░░░░░████░░░░░░►   │
│       ↑              ↑              ↑              ↑                        │
│    [Kiss]        [Feeding]      [Intimate]    [Blood Bond]                │
│                                                                             │
│  TRACK 4: RELATIONSHIP FORMATIONS                                          │
│  ═══════════════════════════════════════════════════════════════════════► │
│       ║                    ║                    ║                          │
│    [Kiara-             [Kiara-              [Henry-                       │
│     Alfred              Alfred               Jacques                        │
│     Bond Forms]         Romance]             Alliance]                     │
│                                                                             │
│  TRACK 5: KEY MOMENTS [♦ = Major  ● = Scene  ★ = Intimate]                │
│  ────♦────●────★────●────♦────●────★────●────♦────●────★────●────♦────►  │
│      E1    S1   K1   S2   E2   S3   K2   S4   E3   S5   K3   S6   E4      │
│                                                                             │
│  CURRENT: s01e03-scene-2 "The First Bite"                                  │
│  [━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Track Specifications

**Track 1: Episode Markers**
- Large markers at episode boundaries
- Episode title on hover
- Click to jump

**Track 2: Character Presence (Heatmap)**
- Color intensity = screen time percentage
- Gradient: Dark (absent) → Crimson (major presence)
- Hover: Show exact percentage

**Track 3: Intimacy Level (Filterable)**
- Filter: All / Romantic / Physical / Blood-play
- Height = intensity (1-5)
- Color coding by type
- Markers for specific acts (kiss, feeding, etc.)

**Track 4: Relationship Formations**
- Vertical lines when relationships form
- Color = relationship type
- Hover: Show relationship details

**Track 5: Key Moments**
- ♦ Diamond = Major plot event
- ● Circle = Regular scene
- ★ Star = Intimate/physical moment
- Click to jump to moment

### Zoom Levels

**Level 1: EPISODE** (Zoomed Out)
```
Shows: Episode markers only
Use: Overview of season arc
```

**Level 2: SCENE** (Mid Zoom)
```
Shows: Episode + Scene markers
Use: Navigate to specific scenes
```

**Level 3: MOMENT** (Max Zoom)
```
Shows: Episode + Scene + Key moments with timestamps
Use: Precise navigation to intimate moments
```

### Content Filters

**Filter Bar**:
```
[✓] Show Presence    [✓] Show Intimacy    [ ] Show Violence
[✓] Show Romantic    [✓] Show Blood-play  [ ] Show Training
[Filter by Character ▼]  [Filter by Type ▼]
```

**Intimacy Filter Presets**:
- "All Content" - Everything visible
- "Romantic Only" - Kisses, romance, relationships
- "Physical Only" - Intimate scenes, feeding
- "Blood-play" - Vampire feeding, blood bonds
- "Training" - Companion training moments

---

## Family Clustering System

### Cluster by Vampire Families

**Families**:
- Natt och Dag (Kiara, Henry, Desirée, Jacques)
- Independent (Alfred, Elise, Chloe, Eric)
- [Future families for 50+ characters]

**Cluster Visual**:
```
┌─────────────────────────────────────────────────────────────┐
│  NATT OCH DAG FAMILY                              [4] 🔽   │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                      │
│  │KIARA│  │HENRY│  │DESIR│  │JACQU│                      │
│  │[A+] │  │[Pat]│  │[Mat]│  │[Sha]│                      │
│  └─────┘  └─────┘  └─────┘  └─────┘                      │
│                                                             │
│  Connections: ████████████████████████████████████ 12      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  INDEPENDENT                                      [4] 🔽   │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                      │
│  │ALFRED│  │ELISE│  │CHLOE│  │ERIC │                      │
│  │[A]  │  │[B]  │  │[C]  │  │[B+] │                      │
│  └─────┘  └─────┘  └─────┘  └─────┘                      │
│                                                             │
│  Connections: ██████████████████████████████░░░░░░ 8       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Cluster Interactions**:
- Click header: Expand/collapse
- Click count: Show cluster statistics
- Drag header: Move entire cluster
- Click card: Focus on character

**Cluster Statistics**:
- Total connections within cluster
- Average companion class
- Dominant blood type
- Relationship density

---

## Navigation System

### Command Palette (Cmd+K)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search characters, episodes, relationships...           │
├─────────────────────────────────────────────────────────────┤
│  CHARACTERS                                                 │
│  ❯ Kiara Natt och Dag              [A+] [Natt och Dag]     │
│    Alfred                          [A]  [Independent]      │
│    Henry Natt och Dag              [Patron] [Natt och Dag] │
│                                                             │
│  QUICK ACTIONS                                              │
│    Show only romantic relationships                        │
│    Filter by Companion Class A                             │
│    Jump to s01e03 "The Hunger"                             │
│    Compare Kiara and Alfred                                │
│                                                             │
│  VIEW MODES                                                 │
│    Switch to Focus Mode                                    │
│    Show All Connectors (Chaos Mode)                        │
│    Collapse All Clusters                                   │
└─────────────────────────────────────────────────────────────┘
```

### Filter System

**Character Filters**:
- Family: [All] [Natt och Dag] [Independent] [...]
- Species: [All] [Vampire] [Human]
- Companion Class: [All] [A] [B] [C]
- Status: [All] [Active] [Training] [Placed]

**Relationship Filters**:
- Type: [All] [Romantic] [Familial] [Training] [Blood]
- Strength: [All] [1-2] [3] [4-5]
- Visibility: [All] [Revealed] [Hidden]

**Timeline Filters**:
- Content: [All] [Romantic] [Physical] [Training]
- Intensity: [All] [Low] [Medium] [High]

---

## Mobile Adaptations

### Vertical Stack Layout

```
┌─────────────────────────────────────┐
│  HEADER                             │
│  Natt och Dag Academy | 8 Students │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ KIARA NATT OCH DAG          │   │
│  │ [Portrait]                  │   │
│  │ Class A | Natt och Dag      │   │
│  │ [View Assessment]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ALFRED                      │   │
│  │ [Portrait]                  │   │
│  │ Class A | Independent       │   │
│  │ [View Assessment]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Scroll for more...]              │
│                                     │
├─────────────────────────────────────┤
│  [Timeline] [Filters] [Search]     │
└─────────────────────────────────────┘
```

**Mobile Interactions**:
- Tap card: Open full-screen bottom sheet
- Swipe: Scroll through cards
- Pinch: Zoom timeline
- Long press: Show context menu

### Bottom Sheet (Card Detail)

```
┌─────────────────────────────────────┐
│  ━━━━━ (drag handle)               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [PORTRAIT]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  KIARA NATT OCH DAG                │
│  Class A | Natt och Dag Family     │
│                                     │
│  [Assessment] [Relationships] [Timeline]│
│  ══════════════════════════════════│
│                                     │
│  (Tab content)                     │
│                                     │
│  [Flip for Private Record]         │
│                                     │
└─────────────────────────────────────┘
```

---

## Work Objectives - FINAL

### Core Objective
Create a cinematic, massively scalable character relationship visualization supporting 50+ characters with "beautiful chaos" connector aesthetics, multi-track timeline with presence heatmaps and intimacy filters, and a dark secret theme of companion training masked as prestigious academy education.

### Concrete Deliverables (50 Tasks)

#### Wave 0: Foundation
1. **CommandPalette** - Search, quick actions
2. **FilterSystem** - Character, relationship, timeline filters
3. **ViewStateManager** - Mode switching, state persistence
4. **MobileDetector** - Responsive adaptations

#### Wave 1: Card Components
5. **StudentCompanionCard** - Portrait, public face
6. **StudentAssessmentBack** - Portrait, private assessment
7. **AuthorityPatronCard** - Landscape, embossed
8. **CardPortrait** - Image component with crimson border
9. **CardQRCode** - Decorative QR component
10. **CardAssessmentGrid** - Training module ratings

#### Wave 2: 3D Animation
11. **CardFlip3D** - Reusable flip wrapper
12. **FlipAnimation** - 800ms cubic-bezier
13. **GlowEffects** - Hover, active states
14. **ReducedMotion** - Accessibility alternative

#### Wave 3: 50+ Node Graph
15. **NodeGraphCanvas** - Canvas-based rendering
16. **OrthogonalConnector** - Path generation
17. **EdgeBundling** - Group similar paths
18. **ParticleFlow** - Animated edge particles
19. **FocusMode** - Hover to highlight
20. **ChaosMode** - All visible default

#### Wave 4: Family Clustering
21. **ClusterContainer** - Group cards
22. **ClusterHeader** - Expand/collapse
23. **FamilyAutoCluster** - Group by family
24. **ClusterStats** - Show metrics
25. **ClusterDrag** - Move groups

#### Wave 5: Multi-Track Timeline
26. **TimelineContainer** - DAW-style layout
27. **EpisodeTrack** - Episode markers
28. **PresenceTrack** - Character heatmap
29. **IntimacyTrack** - Physical moments
30. **RelationshipTrack** - Bond formations
31. **KeyMomentTrack** - Major events
32. **TimelineZoom** - Episode/Scene/Moment
33. **TimelineFilters** - Content type filters

#### Wave 6: Navigation
34. **CommandPaletteUI** - Search interface
35. **FilterPanel** - Filter controls
36. **ViewModeToggle** - Chaos/Focus/Compare
37. **MiniMap** - Overview navigation
38. **BreadcrumbTrail** - Path history

#### Wave 7: Spoilers & Secrets
39. **SpoilerSystem** - Hidden/Hinted/Revealed
40. **SecretRelationship** - Masked connections
41. **RevealControls** - Spoiler settings

#### Wave 8: Accessibility
42. **KeyboardNavigation** - Tab, arrows, Enter
43. **ScreenReader** - ARIA labels
44. **ColorblindPatterns** - Pattern + color
45. **HighContrast** - WCAG AA

#### Wave 9: Mobile
46. **VerticalStack** - Mobile layout
47. **BottomSheet** - Card detail
48. **TouchGestures** - Tap, swipe, pinch
49. **MobileTimeline** - Simplified tracks

#### Wave 10: Integration
50. **CharactersPage** - Full integration

### Definition of Done

- [ ] 50+ character nodes render smoothly (60fps)
- [ ] 200+ connectors visible simultaneously
- [ ] Hover card fades unconnected elements
- [ ] Hover connector highlights relationship
- [ ] Multi-track timeline with 5 tracks
- [ ] Timeline zoom: Episode → Scene → Moment
- [ ] Presence heatmap track
- [ ] Intimacy filter track
- [ ] Key moment markers (♦ ● ★)
- [ ] Family clustering works
- [ ] Command palette (Cmd+K) functional
- [ ] Card 3D flip animation (800ms)
- [ ] Assessment back with training modules
- [ ] Mobile vertical stack layout
- [ ] Full keyboard navigation
- [ ] Screen reader support
- [ ] Spoiler system for secrets

### Must Have
- [ ] 50+ node performance
- [ ] Beautiful chaos connectors
- [ ] Multi-track timeline
- [ ] Family clustering
- [ ] 3D card flip
- [ ] Command palette
- [ ] Mobile vertical stack
- [ ] Accessibility suite

### Must NOT Have
- [ ] **NO** pagination (show all)
- [ ] **NO** hidden connectors by default
- [ ] **NO** desktop-only features
- [ ] **NO** color-only encoding

---

## Execution Strategy

### 10 Waves (Sequential where needed)

```
Wave 0: Foundation
├── Tasks 1-4: Navigation, filters, state
└── Output: useViewState, CommandPalette

Wave 1-2: Cards (Blocked by 0)
├── Tasks 5-14: Both card types, flip animation
└── Output: Complete card system

Wave 3: 50+ Graph (Blocked by 0)
├── Tasks 15-20: Canvas graph, connectors
└── Output: NodeGraphCanvas

Wave 4: Clustering (Blocked by 1, 3)
├── Tasks 21-25: Family clusters
└── Output: ClusterSystem

Wave 5: Timeline (Parallel)
├── Tasks 26-33: 5-track timeline
└── Output: TimelineSystem

Wave 6: Navigation (Blocked by 0)
├── Tasks 34-38: Command palette, mini-map
└── Output: NavigationSuite

Wave 7: Spoilers (Parallel)
├── Tasks 39-41: Secret relationships
└── Output: SpoilerSystem

Wave 8: Accessibility (Parallel)
├── Tasks 42-45: A11y suite
└── Output: AccessibilitySuite

Wave 9: Mobile (Blocked by 1, 5)
├── Tasks 46-49: Mobile adaptations
└── Output: MobileLayout

Wave 10: Integration (Blocked by all)
├── Task 50: Full page integration
└── Output: Complete system
```

---

## Success Criteria

### Performance
- [ ] 50 nodes + 200 edges at 60fps
- [ ] <100ms initial render
- [ ] <16ms hover response
- [ ] Works on 2020+ laptops
- [ ] Works on 2022+ mobile

### Functionality
- [ ] All 50 tasks complete
- [ ] All interactions smooth
- [ ] All filters work
- [ ] All zoom levels functional
- [ ] Mobile layout usable

### Visual Quality
- [ ] "Beautiful chaos" achieved
- [ ] Multi-track timeline striking
- [ ] 3D flip elegant
- [ ] Dark theme consistent
- [ ] Premium feel throughout

---

## Final Notes

**Theme Consistency**:
- Public: Prestigious academy language
- Private: Companion training reality
- Visual: Elegant but with dark undertones
- Interactions: Smooth, cinematic, revealing

**Scale Handling**:
- 8 characters: Full detail, all connectors
- 20 characters: Clusters, chaos mode
- 50+ characters: Optimized rendering, focus mode

**Mobile Strategy**:
- Phase 1: Vertical stack (functional)
- Phase 2: Enhanced mobile (future)

**Timeline Vision**:
- Most complex component
- DAW-style multi-track
- Filterable, zoomable, striking
- Shows presence, intimacy, relationships

---

**Plan Location**: `.sisyphus/plans/premium-character-map-redesign-FINAL.md`

**Status**: FINAL EXHAUSTIVE PLAN COMPLETE

**Ready for**: `/start-work` execution

**Total Tasks**: 50  
**Waves**: 10  
**Estimated Time**: 60-75 hours  
**Complexity**: Very High  
**Reward**: Exceptional, unique, cinematic character visualization
