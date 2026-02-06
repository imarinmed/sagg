# Work Plan: Character Card Redesign v2

## TL;DR

Complete redesign of StudentCompanionCard and AuthorityPatronCard components with:
- **Skeuomorphic cattle-card aesthetic**: Physical card feel with shimmer, holographic elements, premium shadows
- **Hover-reveal interaction**: Card back information revealed on hover instead of click-to-flip
- **Female influence visualization**: Multiple beauty references per character (Kiara = Alexis Ren + Nata Lee)
- **English primary language**: Swedish as authentic faded underlay text
- **Cheerleader affiliation**: All students belong to cheerleader squad with subtle visual indicators
- **Skaraborg setting**: Remote Swedish academy with proper gravitas
- **Authority card differentiation**: Family-based styling (Natt och Dag = regal/exclusive), status-based hierarchy

---

## Design Direction

### Visual Aesthetic: "Premium Cattle Cards"

**Inspiration Sources:**
- Luxury trading cards (Topps Chrome, Panini Prizm holographic)
- ID cards with security features
- High-end cosmetics packaging
- Vampire: The Masquerade card aesthetic
- Swedish design minimalism with dark luxury

**Key Visual Elements:**

1. **Physical Card Properties:**
   - Rounded corners (16px radius)
   - Subtle edge highlighting (light catches the rim)
   - Drop shadow with depth (multi-layer shadow)
   - Holographic shimmer overlay that moves with hover
   - Embossed/Debossed texture patterns
   - Glass-like surface reflection

2. **Material Effects:**
   - **Base**: Matte black card stock texture
   - **Accent areas**: Holographic foil (shifts gold/purple/crimson)
   - **Security features**: Micro-text patterns, Guilloche lines
   - **Premium zones**: Metallic gold/silver leaf accents

3. **Lighting & Shimmer:**
   - Diagonal light sweep animation on hover (subtle)
   - Specular highlights on raised elements
   - Inner glow on important data fields
   - Frosted glass overlays for sections

### Color System

**Card Base Colors:**
```css
/* Card Stock */
--card-base: #0a0a0f;           /* Deep matte black */
--card-edge: #1a1a24;           /* Slightly lighter edge */
--card-shadow: 0 25px 50px -12px rgba(0,0,0,0.8),
               0 12px 24px -8px rgba(0,0,0,0.6),
               inset 0 1px 0 rgba(255,255,255,0.05);

/* Holographic Accents */
--holo-gold: linear-gradient(135deg, #d4af37 0%, #f4d03f 25%, #d4af37 50%, #c9a227 75%, #d4af37 100%);
--holo-crimson: linear-gradient(135deg, #8b0000 0%, #be185d 50%, #8b0000 100%);
--holo-purple: linear-gradient(135deg, #2d1b4e 0%, #8b5cf6 50%, #2d1b4e 100%);

/* Family Colors */
--family-natt-och-dag: #d4af37;     /* Royal gold */
--family-vinter: #c0c0c0;           /* Silver */
--family-bergman: #cd853f;          /* Bronze */
--family-standard: #8b8b8b;         /* Standard gray */

/* Cheerleader Accent */
--cheer-accent: #ff6b9d;            /* Neon pink highlight */
--cheer-subtle: rgba(255,107,157,0.15); /* Very subtle pink glow */
```

---

## StudentCompanionCard v2 Specification

### Card Dimensions
- **Width**: 320px
- **Height**: 480px
- **Border radius**: 16px
- **Perspective**: 1000px (for 3D effects)

### Front of Card (Static Display)

```
┌─────────────────────────────────────┐
│ ╔══════════════════════════════════╗ │
│ ║  HOLOGRAPHIC HEADER STRIP       ║ │
│ ║  ✦ ID: STD-24-KND-001 ✦         ║ │
│ ╚══════════════════════════════════╝ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [PORTRAIT PLACEHOLDER]    │   │
│  │                             │   │
│  │   Silhouette outline with   │   │
│  │   family color glow         │   │
│  │                             │   │
│  │   ◈ ◈ ◈ ◈ ◈                 │   │
│  │   Fitness: 9/10             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  KIARA NATT OCH DAG                │
│  ═══════════════════                │
│  Training Group: Advanced           │
│                                     │
│  ┌─ Cheerleader Squad ─┐           │
│  │  ✦ Natt och Dag    │           │
│  └─────────────────────┘           │
│                                     │
│  [HOVER TO REVEAL ASSESSMENT]      │
│                                     │
│  ST. CECILIA ACADEMY               │
│  Skaraborg, Sweden                 │
└─────────────────────────────────────┘
```

**Front Elements:**
1. **Holographic Header**: ID number with shifting colors
2. **Portrait Area**: 
   - Silhouette placeholder with family-colored rim light
   - Fitness rating as star/diamond indicators
   - Subtle cheerleader icon overlay (bottom-right corner)
3. **Name**: Large, English primary
4. **Training Group**: English with Swedish faded below
5. **Cheerleader Badge**: Squad affiliation with subtle styling
6. **School Footer**: Academy name + location

### Back of Card (Revealed on Hover)

```
┌─────────────────────────────────────┐
│ ╔══════════════════════════════════╗ │
│ ║  KONFIDENTIELL / CONFIDENTIAL   ║ │
│ ║  ★ CLASS A ELITE ★              ║ │
│ ╚══════════════════════════════════╝ │
│                                     │
│  COMPANION CANDIDATE               │
│  ═══════════════════════            │
│                                     │
│  ┌─ VISUAL INFLUENCES ─┐           │
│  │                     │           │
│  │  ● Alexis Ren       │           │
│  │  ● Nata Lee         │           │
│  │  ● Madison Beer     │           │
│  │                     │           │
│  └─────────────────────┘           │
│                                     │
│  PLACEMENT VALUE                    │
│  €2,400,000                        │
│                                     │
│  TRAINING MODULES                   │
│  Physical Conditioning  ★★★★★      │
│  Dance                  ★★★★★      │
│  Body Language          ★★★★☆      │
│                                     │
│  CLIENT SUITABILITY                 │
│  Elite:     ████████████ 95%       │
│  Ancient:   ████████░░░░ 80%       │
│                                     │
│  [ACHIEVEMENT BADGES ROW]          │
│  🏆 🩸 💋 ⚡                        │
│                                     │
│  ESTATE PROPERTY                   │
└─────────────────────────────────────┘
```

**Back Elements:**
1. **Confidential Header**: Security strip aesthetic
2. **Class Badge**: A/B/C with elite designation
3. **Visual Influences Section**: Multiple female references with visual indicators
4. **Placement Value**: Large monetary value with gold styling
5. **Training Modules**: Star ratings with progress bars
6. **Client Suitability**: Horizontal bar charts
7. **Achievement Badges**: Row of icons (First Kiss, Blood Bond, etc.)
8. **Footer**: Estate ownership stamp

### Visual Influence Component

Each character has 2-4 female influences displayed as:
- Small circular avatar/silhouette
- Name label
- Contribution percentage or "Primary/Secondary" indicator
- Visual blend representation

**Example Influences:**
- **Kiara**: Alexis Ren (40%) + Nata Lee (35%) + Madison Beer (25%)
- **Elise**: Alexis Ren (50%) + Helga Lovekaty (30%) + Annabel Lucinda (20%)
- **Chloe**: Madison Beer (45%) + Sydney Sweeney (35%) + Alexis Ren (20%)
- **Sophie**: Sydney Sweeney (60%) + Madison Beer (25%) + Annabel Lucinda (15%)

### Interaction: Hover Reveal

**Behavior:**
1. **Default State**: Front of card visible
2. **Hover State**: 
   - Card lifts slightly (translateY -8px)
   - Shadow intensifies
   - Light sweep animation across surface
   - Back content fades in with slight scale (0.98 → 1.0)
   - Front content fades out (or stays as ghost overlay)
3. **Transition**: 
   - Duration: 400ms
   - Easing: cubic-bezier(0.4, 0, 0.2, 1)
   - No click required - pure hover interaction

**Implementation Approach:**
```typescript
// Pseudo-structure
<CardContainer>
  <FrontFace 
    style={{ 
      opacity: isHovered ? 0.3 : 1,
      transform: isHovered ? 'scale(0.95)' : 'scale(1)'
    }}
  />
  <BackFace
    style={{
      opacity: isHovered ? 1 : 0,
      transform: isHovered ? 'scale(1)' : 'scale(0.95)',
      pointerEvents: isHovered ? 'auto' : 'none'
    }}
  />
</CardContainer>
```

---

## AuthorityPatronCard v2 Specification

### Card Dimensions
- **Width**: 400px
- **Height**: 260px (landscape)
- **Border radius**: 12px

### Front of Card (Minimalist)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌──────────────┐                                        │
│    │              │     DESIRÉE NATT OCH DAG               │
│    │   FACE       │     ═══════════════════════             │
│    │   OUTLINE    │                                        │
│    │   (family    │     [Regal gold border accent]         │
│    │   colored    │                                        │
│    │   glow)      │     Matriarch                           │
│    │              │                                        │
│    └──────────────┘                                        │
│                                                             │
│              ◈ Natt och Dag Est. 1847 ◈                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Front Elements:**
1. **Portrait Outline**: Minimal silhouette with family color glow
2. **Name Only**: Large, prominent
3. **Title**: Single word (Matriarch, Patriarch, Professor, Coach)
4. **Family Badge**: Small, bottom center

**Family-Specific Front Styling:**

| Family | Border | Glow | Texture |
|--------|--------|------|---------|
| Natt och Dag | Gold (3px) | Strong gold | Embossed crest pattern |
| Vinter | Silver (2px) | Soft silver | Frost pattern |
| Bergman | Bronze (1px) | Subtle bronze | Standard matte |
| Other | Gray (1px) | None | Standard matte |

### Back of Card (Information Rich)

```
┌─────────────────────────────────────────────────────────────┐
│  ✦ THE ETERNAL COUNCIL ✦      [HOLOGRAM]  [WATERMARK]      │
│  ═══════════════════════════════════════════════════════   │
│  NATT OCH DAG ESTATE | PRIVATE MEMBERSHIP                  │
│                                                             │
│   STATUS: Matriarch                                        │
│   SECTOR: North                                            │
│   CLEARANCE: Level Alpha                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GENERATION: 2nd    BLOODLINE: Pure                  │  │
│  │  MEMBER SINCE: 1847                                  │  │
│  │  INFLUENCE: Comprehensive                            │  │
│  │  ASSETS: Classified                                  │  │
│  │  COMPANION PRIVILEGES: Unlimited                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│     [SEAL]            [HOLOGRAM]              [CHIP]       │
│                                                             │
│  AUTHORIZED PERSONNEL ONLY | CLIENT PRIVILEGES             │
└─────────────────────────────────────────────────────────────┘
```

**Authority Status Types:**

1. **Matriarch/Patriarch** (Family Heads):
   - Gold accents
   - "The Eternal Council" header
   - Full information display
   - Seal + Hologram + Chip badges

2. **Professor** (Academic):
   - Deep purple accents
   - "Academic Faculty" header
   - Department, Specialization fields
   - Teaching rating

3. **Coach** (Training):
   - Crimson accents
   - "Training Staff" header
   - Specialty (Dance, Fitness, etc.)
   - Student success metrics

4. **Standard Authority** (Other):
   - Silver/gray accents
   - Position, Department
   - Basic clearance info

---

## Language System

### Pattern: English Primary + Swedish Underlay

**Implementation:**
```typescript
interface BilingualText {
  primary: string;      // English - prominent
  secondary: string;    // Swedish - faded, smaller, below
}

// Example rendering
<div className="text-field">
  <span className="primary">Physical Conditioning</span>
  <span className="secondary">Fysisk Kondition</span>
</div>

// CSS
.primary {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.secondary {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text-muted);
  opacity: 0.5;
  letter-spacing: 0.05em;
}
```

**Label Translations:**

| English | Swedish |
|---------|---------|
| Physical Conditioning | Fysisk Kondition |
| Dance | Dans |
| Body Language | Kroppsspråk |
| Conversation | Konversation |
| Seduction | Förförelse |
| Pleasure Arts | Njutningskonst |
| Blood Play | Blod-Spel |
| Flexibility | Flexibilitet |
| Endurance | Uthållighet |
| Training Group | Träningsgrupp |
| Student ID | Elev-ID |
| Active | Aktiv |
| Training | Under Utbildning |
| Companion Candidate | Följeslagare Kandidat |
| Class | Klass |
| Placement Value | Placerings Värde |
| Client Suitability | Klient Lämplighet |
| Estate Property | Egendom av Staten |

---

## School Identity

### Name Options (To Be Decided)

**Current Issues with "St. Cecilia":**
- Lacks gravitas for vampire academy
- Too common/catholic-sounding
- Doesn't convey remote Swedish location

**Proposed Alternatives:**

1. **The Skaraborg Academy** - Simple, location-based
2. **Institutet för Vampyrisk Kultur** (Institute for Vampiric Culture)
3. **The Vinterhall Academy** - Nordic, mysterious
4. **St. Elin's Preparatory** - Swedish saint (Elin of Skövde)
5. **The Natt Academy** - Darker, family-associated
6. **Skaraborg Hemliga Akademi** (Skaraborg Secret Academy)

**Recommended:**
- **Primary**: "The Vinterhall Academy" or "Skaraborg Hemliga Akademi"
- **Subtitle**: "A Preparatory Institute for the Vampiric Arts"

**Location Context:**
- Skaraborg, Sweden (remote, forested area)
- Near Lake Vänern or in dense pine forests
- Isolated, centuries-old institution
- Gothic architecture mixed with Swedish functionalism

---

## Cheerleader Affiliation

### Visual Indicators (Subtle)

1. **Small Icon**: Pom-pom or star in corner of portrait
2. **Squad Badge**: Minimal badge at bottom of card
3. **Color Accent**: Very subtle pink/neon accent in gradient
4. **Pattern**: Micro-pattern of cheerleader silhouettes in background

**Squad Structure:**
- All students are cheerleaders
- Squads named after families or traits
- Example: "Natt och Dag Squad", "Elite Flyers", etc.

**Card Integration:**
```
┌──────────────────────────────┐
│  [PORTRAIT]              🎀  │  ← Tiny cheer icon
│                              │
│  KIARA NATT OCH DAG          │
│                              │
│  ┌─ Squad: Night Flyers ─┐   │
│  └────────────────────────┘   │
└──────────────────────────────┘
```

---

## Animation Specifications

### Card Hover Effects

**1. Lift Effect:**
```css
.card:hover {
  transform: translateY(-8px) rotateX(5deg);
  box-shadow: 
    0 30px 60px -15px rgba(0,0,0,0.9),
    0 15px 30px -10px rgba(0,0,0,0.7);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**2. Light Sweep:**
```css
@keyframes lightSweep {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  opacity: 0;
}

.card:hover::before {
  opacity: 1;
  animation: lightSweep 1.5s ease-out;
}
```

**3. Holographic Shimmer:**
```css
@keyframes shimmer {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(30deg); }
}

.holo-element {
  animation: shimmer 3s ease-in-out infinite;
}
```

**4. Back Content Reveal:**
```css
.card-back {
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .card-back {
  opacity: 1;
  transform: scale(1);
}

.card-front {
  opacity: 1;
  transform: scale(1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .card-front {
  opacity: 0.2;
  transform: scale(0.95);
}
```

---

## Component Structure

### StudentCompanionCard v2

```typescript
interface StudentCompanionCardV2Props {
  // Identity
  id: string;
  name: string;
  studentId: string;
  
  // Visual
  portraitUrl?: string;
  silhouetteVariant: 'default' | 'dancer' | 'cheerleader';
  
  // Training
  trainingGroup: 'Elite' | 'Advanced' | 'Intermediate';
  fitnessLevel: number; // 1-10
  
  // Influences (NEW)
  visualInfluences: Array<{
    name: string;
    percentage: number;
    avatar?: string;
  }>;
  
  // Cheerleader (NEW)
  cheerleaderSquad: string;
  cheerleaderRole?: 'captain' | 'flyer' | 'base' | 'spotter';
  
  // Assessment
  companionClass: 'A' | 'B' | 'C';
  placementValue: number;
  trainingModules: Array<{
    name: string;
    nameSv: string;
    rating: number;
  }>;
  clientSuitability: {
    elite: number;
    ancient: number;
    noble: number;
    experimental: number;
  };
  
  // Achievements
  achievements: Array<{
    icon: string;
    label: string;
    episode: string;
  }>;
  
  // Metadata
  family: string;
  establishedYear: number;
  status: 'active' | 'training';
}
```

### AuthorityPatronCard v2

```typescript
interface AuthorityPatronCardV2Props {
  // Identity
  id: string;
  name: string;
  
  // Visual
  portraitUrl?: string;
  silhouetteVariant: string;
  
  // Status (NEW - determines card style)
  status: 'matriarch' | 'patriarch' | 'professor' | 'coach' | 'staff';
  
  // Family (determines styling tier)
  family: string;
  familyTier: 'exclusive' | 'standard' | 'minor';
  
  // For status = professor
  department?: string;
  specialization?: string;
  teachingRating?: number;
  
  // For status = coach
  coachingSpecialty?: string;
  studentSuccessRate?: number;
  
  // Common fields
  title: string;
  sector: string;
  generation?: number;
  bloodline?: 'Pure' | 'Mixed' | 'Unknown';
  memberSince: number;
  clearance: string;
  influence: string;
  assets: string;
  companionPrivileges: string;
  currentCompanion?: string;
  isCompanionSecret?: boolean;
}
```

---

## Implementation Tasks

### Task 1: Create Card Base Components
- [ ] `CardContainer` - Skeuomorphic container with shadows, shimmer
- [ ] `CardFront` - Front face wrapper
- [ ] `CardBack` - Back face wrapper
- [ ] `HolographicStrip` - Shimmering header/footer element
- [ ] `SecurityPattern` - Guilloche/micro-text background pattern
- [ ] `LightSweep` - Hover light animation overlay

### Task 2: Student Card Components
- [ ] `StudentPortrait` - Silhouette with family glow
- [ ] `VisualInfluences` - Female reference visualization
- [ ] `TrainingModules` - Star ratings with progress bars
- [ ] `ClientSuitability` - Horizontal bar charts
- [ ] `AchievementBadges` - Icon row component
- [ ] `CheerleaderBadge` - Squad affiliation indicator
- [ ] `BilingualText` - English/Swedish text component

### Task 3: Authority Card Components
- [ ] `AuthorityPortrait` - Minimal outline with family styling
- [ ] `StatusBadge` - Role indicator (Matriarch/Professor/etc)
- [ ] `FamilyCrest` - Family-specific emblem
- [ ] `SecurityBadges` - Seal/Hologram/Chip icons
- [ ] `AuthorityInfoGrid` - Information display based on status type

### Task 4: Update Data Structures
- [ ] Update demo data with visual influences
- [ ] Update demo data with cheerleader squads
- [ ] Update demo data with authority status types
- [ ] Update school name references

### Task 5: CSS/Theme Updates
- [ ] Add cattle-card shadow system
- [ ] Add holographic gradient animations
- [ ] Add family color variables
- [ ] Add cheerleader accent styles
- [ ] Create card texture patterns

### Task 6: Integration
- [ ] Replace StudentCompanionCard in page
- [ ] Replace AuthorityPatronCard in page
- [ ] Update filter/sort to handle new fields
- [ ] Test hover interactions
- [ ] Verify responsive behavior

---

## Success Criteria

### Visual Quality
- [ ] Cards look like physical luxury trading cards
- [ ] Shimmer/glassmorphism effects are subtle but present
- [ ] Shadows create depth without being heavy
- [ ] Holographic elements shift colors smoothly
- [ ] Family differences are visually distinct

### Interaction
- [ ] Hover reveals back content smoothly (400ms)
- [ ] No click required to see back of card
- [ ] Light sweep animation on hover
- [ ] Card lifts physically on hover
- [ ] All animations are 60fps smooth

### Information Architecture
- [ ] Front shows essential info only (name, ID, fitness, squad)
- [ ] Back shows detailed assessment on hover
- [ ] Visual influences clearly displayed
- [ ] English primary with Swedish underlay
- [ ] Cheerleader affiliation subtle but visible

### Authority Differentiation
- [ ] Natt och Dag cards look distinctly regal/exclusive
- [ ] Standard families have simpler styling
- [ ] Status types (Matriarch/Professor/Coach) visually distinct
- [ ] Front minimal, back information-rich

### Content
- [ ] School name updated to chosen alternative
- [ ] Skaraborg location referenced
- [ ] All text uses bilingual pattern
- [ ] Character influences properly assigned

---

## Notes

**Premium Quality Checkpoints:**
- Every animation must serve a purpose
- No element without visual refinement
- Typography hierarchy must be crystal clear
- Color usage intentional and restrained
- Space used generously (premium feel)

**Swedish Authenticity:**
- Use real Swedish terms where appropriate
- Keep Swedish text faded/subordinate
- Ensure translations are accurate
- Maintain Nordic design sensibility (minimalist, functional)

**Vampire Aesthetic:**
- Dark, luxurious, exclusive
- Hints of danger and sensuality
- Academic/training institution feel
- Age and lineage matter
