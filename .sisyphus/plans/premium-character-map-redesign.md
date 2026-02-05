# Work Plan: Premium Character Map Redesign - REFINED

## TL;DR

> **Transform the character map into a premium, cinematic experience** with distinct card aesthetics for different character classes. **Student/Cattle cards** are portrait-oriented with prominent QR codes, overt cattle tracking themes (Stock ID, Herd Class, Blood Type, Processing Date), and 3D flip animation to reveal grading metrics and feats on the back. **Authority cards** are landscape black-club-client cards with embossed photo outlines, holographic watermarks, and exclusive luxury styling. **Always-visible orthogonal connectors** create a mind-map visualization between characters. **Single elegant timeline** with detailed episode stops and key moment markers allows temporal exploration.
> 
> **Deliverables**:
> - `StudentCattleCard` component (portrait, QR code, overt tracking, 3D flip)
> - `AuthorityClubCard` component (landscape, embossed, holographic, mysterious)
> - `ElegantTimeline` component (single line, detailed stops, key moments)
> - `MindMapConnector` system (always-visible orthogonal rounded paths)
> - `CharacterGraphLayout` component (force-directed or positioned layout)
> - 3D card flip animation system
> - Full page integration with cinematic styling
> 
> **Estimated Effort**: XL (22-28 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Card System → 3D Flip Animation → Connectors → Timeline → Layout → Integration

---

## Design Vision - REFINED

### Student/Cattle Cards: "Catalogued Assets"

**Concept**: Portrait-oriented cattle identification with overt tracking themes. The body is the product being managed.

**Visual Language**:
- **Orientation**: Portrait (taller than wide) to showcase face/body
- **Base**: Obsidian glass with crimson undertones
- **Typography**: 
  - Name: Cormorant Garamond (elegant but institutional)
  - Tracking data: JetBrains Mono (monospace, barcode-like)
  - Labels: Small caps, dehumanizing
- **Overt Tracking Elements**:
  - **QR Code**: Prominent, scannable-looking (decorative)
  - **Stock ID**: "STK-2024-KND-001-A" (Stock-Year-Initials-Number-Class)
  - **Herd Class**: A, B, C (with A being "premium stock")
  - **Blood Type**: Vampiric blood types (A+, Pure, Diluted, etc.)
  - **Processing Date**: When they were "acquired" or "turned"
  - **Origin**: "Wild" or "Bred"
  - **Status Tags**: "Active", "Quarantine", "Processing"
  - **Value Rating**: Dollar/Euro amount (dark implication)
- **Photo**: Full portrait area, face and body visible
- **Security Features**: QR code, micro-text patterns, "PROPERTY OF" watermarks

**Front Layout**:
```
┌─────────────────────────────┐
│  NATT OCH DAG ESTATE        │
│  ═══════════════════════    │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │    [PORTRAIT]       │   │
│  │    Face + Body      │   │
│  │                     │   │
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
│                             │
│  ┌──────────┐              │
│  │ [QR CODE]│              │
│  │ ▓▓▓▓▓▓▓▓ │              │
│  │ ▓▓▓▓▓▓▓▓ │              │
│  │ ▓▓▓▓▓▓▓▓ │              │
│  └──────────┘              │
│                             │
│  [CLICK TO VIEW GRADING]   │
│                             │
│  PROPERTY OF ESTATE        │
└─────────────────────────────┘
```

**Back Layout** (Revealed via 3D Flip):
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

### Authority Cards: "Elite Club Membership"

**Concept**: Black card luxury for the elite—parents, professors, relatives. Mysterious, face is secondary to status.

**Visual Language**:
- **Orientation**: Landscape (prestigious credit card style)
- **Base**: Deep obsidian with gold accents, leather texture
- **Typography**:
  - Name: Playfair Display (regal, gold gradient)
  - Title: Cinzel small caps (ancient)
  - Seals: Decorative serif
- **Photo**: Embossed/outline only, not prominent
- **Luxury Elements**:
  - Holographic gold shimmer (animated)
  - Watermark patterns
  - "Eternal Council" or "Inner Circle" designation
  - Member since ancient dates
  - "Authorized Personnel" seal with embossed effect
  - Guilloche patterns (intricate line work)
- **Mystery**: Some information hidden/encoded

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✦ ETERNAL COUNCIL ✦          [HOLOGRAM]  [WATERMARK]      │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│   ┌──────────┐                                             │
│  ╱            ╲    HENRY NATT OCH DAG                      │
│ │   EMBOSSED   │   ═══════════════════                     │
│ │   OUTLINE    │   Patriarch | Elder | Ancient Blood       │
│  ╲            ╱    Generation: 3rd | Purity: ████████      │
│   └──────────┘     Member Since: MDCCCXLVII (1847)         │
│      HEXAGON                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CLEARANCE: LEVEL ALPHA    SECT: NATT OCH DAG       │  │
│  │  INFLUENCE: EXTENSIVE      ASSETS: CLASSIFIED       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│     [SEAL]              [HOLOGRAM]              [CHIP]     │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│  AUTHORIZED PERSONNEL ONLY | ESTATE SECURITY               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3D Card Flip Animation System

### Technical Implementation

```typescript
interface FlippableCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
}

// CSS 3D Transform
.card-container {
  perspective: 1000px;
  width: 300px;
  height: 480px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Animation Details
- **Duration**: 800ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) - smooth deceleration
- **Perspective**: 1000px for realistic 3D depth
- **Shadow**: Dynamic shadow that shifts during flip
- **Glow**: Crimson glow on front, gold shimmer on back

---

## Elegant Timeline

### Concept
Single elegant line with detailed stops—like a luxury train line or subway map.

### Visual Design

```
◀◀  ▶/❚❚  ▶▶

s01e01 ──────●────── s01e02 ──────♦────── s01e03 ──────●────── s01e04
"The          │      "First       │      "The         │      "Blood
 Awakening"    │       Blood"     │       Hunger"     │       Bonds"
               │                   │                   │
              [Scene]            [Event]            [Scene]

● = Episode marker (circle)
♦ = Major event marker (diamond)
│ = Scene/key moment indicator
```

### Structure
- **Base Line**: 2px elegant curve or straight line with subtle gradient
- **Episode Stops**: Circular markers with episode number
- **Event Markers**: Diamond shapes for major plot points
- **Scene Indicators**: Small ticks between episodes
- **Current Position**: Glowing indicator that moves smoothly
- **Hover**: Episode title and brief description appear

### CSS Implementation
```css
.timeline-container {
  position: relative;
  padding: 40px 20px;
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(201, 162, 39, 0.3) 10%,
    rgba(201, 162, 39, 0.6) 50%,
    rgba(201, 162, 39, 0.3) 90%,
    transparent 100%
  );
}

.episode-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #0a0a0f;
  border: 2px solid #c9a227;
  cursor: pointer;
  transition: all 0.3s ease;
}

.episode-marker:hover {
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 0 0 20px rgba(201, 162, 39, 0.5);
}

.episode-marker.active {
  background: #c9a227;
  box-shadow: 0 0 30px rgba(201, 162, 39, 0.6);
}

.event-marker {
  width: 12px;
  height: 12px;
  background: #c53030;
  transform: translate(-50%, -50%) rotate(45deg);
  border: 2px solid rgba(255, 255, 255, 0.8);
}
```

---

## Mind Map Connector System

### Always-Visible Orthogonal Connectors

**Concept**: Circuit-board aesthetics meeting subway map clarity. Always visible to show the web of relationships.

### Visual Design

```
         ┌──────────┐
         │  KIARA   │◄───────┐
         │  [Cattle]│        │
         └────┬─────┘        │
              │              │
              │ Romantic     │
              │ (Crimson)    │ Familial
         ┌────┴─────┐        │ (Gold)
         │  ROUND   │        │
         │  CORNER  │        │
         └────┬─────┘        │
              │              │
    ┌─────────┼─────────┐    │
    │         │         │    │
    ▼         ▼         ▼    │
┌───────┐ ┌───────┐ ┌───────┐│
│ ALFRED│ │ HENRY │ │DESIREE││
│[Cattle]│ │[Club] │ │[Club] │┘
└───────┘ └───────┘ └───────┘
```

### Connector Specifications

**Path Style**:
- Orthogonal (Manhattan routing)
- Rounded corners (12px radius)
- Always visible with subtle opacity

**Colors by Relationship Type**:
| Type         | Color     | Hex       | Style          |
| ------------ | --------- | --------- | -------------- |
| Romantic     | Crimson   | #be185d   | Solid, glow    |
| Familial     | Gold      | #c9a227   | Solid, elegant |
| Antagonistic | Blood Red | #dc2626   | Dashed, sharp  |
| Friendship   | Silver    | #a1a1aa   | Dotted, light  |
| Blood Bond   | Deep Red  | #991b1b   | Pulsing, thick |
| Professional | Purple    | #8B5CF6   | Solid, muted   |

**Hover Effects**:
- Brightness increase (1.2x)
- Glow intensifies
- Relationship badge appears at midpoint
- Connected cards highlight

**Badge Format**:
```
<--- daughter --->
<--- love interest --->
--- rival --->
```

### Implementation

```typescript
interface ConnectorProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: RelationshipType;
  strength: number; // 1-5
  isBidirectional: boolean;
}

function generateOrthogonalPath(
  from: GridPoint,
  to: GridPoint,
  radius: number = 12
): string {
  const midX = (from.x + to.x) / 2;
  
  return `
    M ${from.x} ${from.y}
    L ${midX - radius} ${from.y}
    Q ${midX} ${from.y} ${midX} ${from.y + (to.y > from.y ? radius : -radius)}
    L ${midX} ${to.y - (to.y > from.y ? radius : -radius)}
    Q ${midX} ${to.y} ${midX + (to.x > midX ? radius : -radius)} ${to.y}
    L ${to.x} ${to.y}
  `;
}
```

---

## Work Objectives - REFINED

### Core Objective
Create a cinematic character relationship visualization with distinct aesthetics: portrait cattle cards with overt tracking themes and 3D flip reveals, landscape club cards with embossed mystery, always-visible mind map connectors, and an elegant single-line timeline.

### Concrete Deliverables

1. **StudentCattleCard** component (`frontend/components/StudentCattleCard.tsx`)
   - Portrait orientation (300px × 480px)
   - Prominent QR code
   - Overt cattle tracking (Stock ID, Herd Class, Blood Type, etc.)
   - Full portrait photo area
   - 3D flip to reveal grading on back

2. **AuthorityClubCard** component (`frontend/components/AuthorityClubCard.tsx`)
   - Landscape orientation (400px × 260px)
   - Embossed photo outline (hexagonal)
   - Holographic watermarks
   - Gold/crimson luxury aesthetic
   - Mysterious encoded information

3. **CardFlipAnimation** system (`frontend/components/CardFlip3D.tsx`)
   - Reusable 3D flip wrapper
   - Smooth 800ms transition
   - Dynamic shadows
   - Front/back content slots

4. **ElegantTimeline** component (`frontend/components/ElegantTimeline.tsx`)
   - Single elegant line design
   - Episode stops with circular markers
   - Event diamonds for major moments
   - Scene tick indicators
   - Smooth position animation

5. **MindMapConnector** system
   - `OrthogonalConnector.tsx` - SVG path generation
   - `RelationshipBadge.tsx` - Hover badges
   - `ConnectorGlow.tsx` - Glow effects
   - Always-visible design

6. **CharacterGraphLayout** component (`frontend/components/CharacterGraphLayout.tsx`)
   - Positioned card layout
   - SVG connector overlay
   - Pan and zoom controls
   - Force-directed or manual positioning

7. **Integration** (`frontend/app/characters/page.tsx`)
   - Full assembly of all components
   - Temporal data integration
   - Responsive design
   - Cinematic animations

### Definition of Done

- [ ] Student cards are portrait with QR codes and overt cattle tracking
- [ ] Student cards flip in 3D to reveal grading on back
- [ ] Authority cards are landscape with embossed photos
- [ ] Authority cards have holographic watermarks and seals
- [ ] Timeline is single elegant line with episode stops
- [ ] Timeline has diamond markers for major events
- [ ] Timeline has tick marks for scenes/key moments
- [ ] Connectors are always visible between related characters
- [ ] Connectors use orthogonal rounded paths
- [ ] Connectors show relationship badges on hover
- [ ] Cards update as timeline position changes
- [ ] Smooth cinematic animations throughout
- [ ] Responsive design works on all screen sizes

### Must Have
- [ ] Portrait student cards with overt cattle themes
- [ ] 3D flip animation to reveal card backs
- [ ] Landscape authority cards with embossed photos
- [ ] Holographic watermarks on authority cards
- [ ] Prominent QR codes on student cards
- [ ] Single elegant timeline line
- [ ] Always-visible orthogonal connectors
- [ ] Relationship badges on hover
- [ ] Cinematic smooth animations
- [ ] Responsive layout

### Must NOT Have (Guardrails)
- [ ] **NO** subtle/subtle cattle tracking (must be overt)
- [ ] **NO** prominent photos on authority cards (embossed only)
- [ ] **NO** hidden connectors (always visible)
- [ ] **NO** basic timeline slider (must be elegant line)
- [ ] **NO** generic card designs (distinct aesthetics required)
- [ ] **NO** landscape student cards (portrait only)

---

## Card Specifications - REFINED

### Student/Cattle Card (Portrait)

**Dimensions**: 300px × 480px
**Border Radius**: 16px
**Background**:
```css
background: linear-gradient(180deg, 
  rgba(20, 20, 25, 0.95) 0%, 
  rgba(15, 10, 15, 0.98) 100%
);
backdrop-filter: blur(20px);
border: 1px solid rgba(139, 38, 53, 0.4);
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.5),
  0 0 60px rgba(139, 38, 53, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

**Front Elements**:
1. **Header**: "NATT OCH DAG ESTATE" + small crest
2. **Portrait Area**: 260px × 200px, rounded corners, crimson border
3. **Name**: Cormorant Garamond, 24px, white
4. **Stock ID**: JetBrains Mono, 11px, crimson
5. **Tracking Grid**:
   - Herd Class: A/B/C with "Premium" badge
   - Blood Type: Pure/Diluted/Mixed
   - Processed Date: Episode ID
   - Origin: Wild/Bred
   - Status: Active/Quarantine/Processing
6. **QR Code**: 80px × 80px, decorative but prominent
7. **Footer**: "PROPERTY OF ESTATE" micro-text

**Back Elements**:
1. **Header**: "GRADING REPORT"
2. **Metrics**: Letter grades (A+, A, B+, etc.)
3. **Feats**: List with episode unlocks
4. **Traits**: Tag display
5. **Footer**: "[CLICK TO RETURN]"

### Authority Club Card (Landscape)

**Dimensions**: 400px × 260px
**Border Radius**: 20px
**Background**:
```css
background: 
  linear-gradient(145deg, rgba(15, 15, 20, 0.98), rgba(8, 8, 12, 0.99)),
  url('leather-texture.png');
border: 1px solid rgba(201, 162, 39, 0.5);
box-shadow: 
  0 12px 40px rgba(0, 0, 0, 0.6),
  0 0 80px rgba(201, 162, 39, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.08);
```

**Elements**:
1. **Header**: "ETERNAL COUNCIL" with holographic icon
2. **Photo**: Hexagonal embossed outline (60px), no actual photo
3. **Name**: Playfair Display, 28px, gold gradient
4. **Title**: Cinzel small caps, 12px, gold-300
5. **Info Grid**:
   - Clearance Level
   - Sect
   - Influence
   - Assets (Classified)
6. **Security Row**: Seal + Hologram + Chip icons
7. **Footer**: "AUTHORIZED PERSONNEL ONLY"

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Card System):
├── Task 1: Create StudentCattleCard component (portrait, QR code, tracking)
├── Task 2: Create AuthorityClubCard component (landscape, embossed, luxury)
└── Task 3: Create shared card styles and utilities

Wave 2 (3D Animation):
├── Task 4: Create CardFlip3D wrapper component
├── Task 5: Implement flip animation with shadows
└── Task 6: Add glow effects during flip

Wave 3 (Connectors):
├── Task 7: Create OrthogonalConnector SVG component
├── Task 8: Create RelationshipBadge component
├── Task 9: Implement always-visible connector layout
└── Task 10: Add hover glow effects

Wave 4 (Timeline):
├── Task 11: Create ElegantTimeline component
├── Task 12: Create episode markers and event diamonds
├── Task 13: Create scene tick indicators
└── Task 14: Add smooth position animation

Wave 5 (Layout & Integration):
├── Task 15: Create CharacterGraphLayout component
├── Task 16: Implement pan and zoom controls
├── Task 17: Integrate everything into characters page
└── Task 18: Add responsive design and polish

Critical Path: Task 1 → Task 2 → Task 4 → Task 7 → Task 11 → Task 15 → Task 17
```

---

## TODOs Summary

### Wave 1: Card System
- **Task 1**: StudentCattleCard - Portrait, QR code, overt cattle tracking
- **Task 2**: AuthorityClubCard - Landscape, embossed, holographic
- **Task 3**: Shared card utilities

### Wave 2: 3D Animation
- **Task 4**: CardFlip3D wrapper
- **Task 5**: Flip animation with shadows
- **Task 6**: Glow effects

### Wave 3: Connectors
- **Task 7**: OrthogonalConnector SVG
- **Task 8**: RelationshipBadge
- **Task 9**: Always-visible layout
- **Task 10**: Hover effects

### Wave 4: Timeline
- **Task 11**: ElegantTimeline
- **Task 12**: Episode markers
- **Task 13**: Scene ticks
- **Task 14**: Position animation

### Wave 5: Layout & Integration
- **Task 15**: CharacterGraphLayout
- **Task 16**: Pan/zoom controls
- **Task 17**: Page integration
- **Task 18**: Responsive polish

---

## Success Criteria

### Must Demonstrate
- [ ] Student cards show QR codes, Stock IDs, Herd Class, Blood Type
- [ ] Student cards flip in 3D to reveal grading on back
- [ ] Authority cards show embossed hexagonal photo outlines
- [ ] Authority cards have holographic watermarks
- [ ] Timeline is single elegant line with circular episode stops
- [ ] Timeline has diamond markers for major events
- [ ] Timeline has tick marks for scenes
- [ ] Connectors are always visible between characters
- [ ] Connectors use orthogonal rounded paths
- [ ] Relationship badges appear on hover
- [ ] Cards update as timeline scrubs
- [ ] Smooth cinematic animations (800ms flip, spring physics)
- [ ] Responsive layout on all screen sizes

---

## Plan Status

**Plan Location**: `.sisyphus/plans/premium-character-map-redesign.md`

**Ready to Execute**: Run `/start-work` to begin implementation

**Estimated Time**: 22-28 hours
**Waves**: 5 parallel waves
**Tasks**: 18 detailed tasks

This plan incorporates all your feedback:
- ✅ Portrait student cards with overt cattle tracking
- ✅ Prominent QR codes
- ✅ 3D flip to reveal grading
- ✅ Landscape authority cards with embossed photos
- ✅ Holographic watermarks
- ✅ Always-visible connectors (mind map style)
- ✅ Single elegant timeline line
- ✅ Cinematic smooth animations
- ✅ Current color scheme (crimson/gold)
