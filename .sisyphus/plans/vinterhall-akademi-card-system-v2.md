# Work Plan: Vinterhall Akademi Card System v2

## TL;DR

Transform the character cards into **waist-chain clipped cattle tags** for Vinterhall Akademi - a recently-formed Swedish institution marketing "high-quality companions" to elite patrons. 

**Core Concept**: Cards hang from elegant gold/silver waist chains (part of the uniform), asymmetrically positioned to draw attention to hips as girls walk. The chains force lean waists. Cards function as unsuspicious cattle tags to the uninitiated.

**Key Changes**:
- **School**: Vinterhall Akademi (Skaraborg, Sweden)
- **Interaction**: Hover-reveal (front ghosts to 20%, back fades in)
- **Front**: Super-attractive visual showcase (faces, bodies, silhouettes)
- **Back**: Detailed assessment data + female influences
- **Squad**: "Skaraborg Bats" (Kiara joins episode 2)
- **Patrons**: Clients/purchasers, not authorities
- **Aesthetic**: Luxury trading card + ID security features + holographic shimmer

---

## The Waist Chain System

### Concept
Each female student wears an **elegant gold or silver waist chain** as part of her uniform. The chain:
- Is narrow/slim (forces maintenance of lean waist to wear it)
- Falls asymmetrically, drawing attention to hips and backside
- Has a clip mechanism where the card attaches
- Varies by uniform type: gym, class, dance, cheerleader
- Looks like decorative jewelry to outsiders
- Functions as a "cattle tag" marking the bearer as companion-trainee

### Visual Representation on Cards

**Top of Card - Chain Attachment:**
```
    ╔══════════╗
    ║  ◈ CLIP ◈ ║  ← Gold/silver clip with gem detail
    ╚══════════╝
         ││
    ┌────┴┴────┐
    │          │
    │   CARD   │
    │   BODY   │
    │          │
    └──────────┘
```

**Clip Variations by Uniform:**
- **Class uniform**: Simple elegant gold clip
- **Gym uniform**: Sporty chain with metallic clip
- **Dance uniform**: Delicate chain with crystal accent
- **Cheerleader uniform**: "Skaraborg Bats" branded clip with bat motif

---

## Vinterhall Akademi Identity

### School Concept
- **Name**: Vinterhall Akademi
- **Location**: Remote Skaraborg, Sweden (forested area near Lake Vänern)
- **Founded**: Recently (within last 5-10 years)
- **Public Face**: Elite finishing school for young women
- **True Purpose**: Training high-quality companions, courtesans, trophy wives, escorts for vampire elite
- **Marketing**: Targets wealthy patrons/clients seeking "premium companions"
- **Unsuspicious To Outsiders**: Looks like an exclusive Scandinavian boarding school

### Branding on Cards
```
┌──────────────────────────────┐
│         ◈ CLIP ◈             │
├──────────────────────────────┤
│                              │
│   VINTERHALL AKADEMI         │
│   Skaraborg, Sverige         │
│                              │
│   [Portrait Area]            │
│                              │
│   "Preparing Tomorrow's      │
│    Companions"               │
│                              │
└──────────────────────────────┘
```

---

## StudentCompanionCard v2 Specification

### Card Dimensions
- **Width**: 300px
- **Height**: 520px
- **Border radius**: 16px
- **Chain attachment**: 40px clip area at top

### Front of Card (Visual Showcase)

**Purpose**: Maximum visual appeal. Showcases the girl's beauty and body.

```
         ╔══════════╗
         ║ ◈ CLIP ◈ ║     ← Gold/silver chain clip
         ╚══════════╝
              │
    ┌─────────┴─────────┐
    │  ◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈  │  ← Holographic shimmer strip
    │                   │
    │  ┌─────────────┐  │
    │  │             │  │
    │  │   [LARGE    │  │  ← Portrait/silhouette area
    │  │   FACE &    │  │     (80% of card height)
    │  │   BODY      │  │
    │  │   VISUAL]   │  │
    │  │             │  │
    │  │   ◈ 9/10 ◈  │  │  ← Fitness rating (holographic)
    │  └─────────────┘  │
    │                   │
    │  KIARA            │
    │  NATT OCH DAG     │  ← Large name
    │                   │
    │  ═══════════════  │
    │                   │
    │  ID: STD-24-001   │
    │                   │
    │  ┌─────────────┐  │
    │  │ SKARABORG   │  │  ← Squad badge (appears ep 2)
    │  │ BATS        │  │     (ghosted/unstyled before)
    │  └─────────────┘  │
    │                   │
    │  [Hover for      │
    │   Assessment]     │
    │                   │
    │  VINTERHALL       │
    │  AKADEMI          │
    └───────────────────┘
```

**Front Elements:**
1. **Chain Clip** (top): 3D metallic clip graphic
2. **Holographic Header**: ID number with shifting colors
3. **Large Portrait Area**: 
   - Full-body or 3/4 portrait showing fitness/beauty
   - Silhouette with family-colored rim light
   - Holographic overlay that shimmers
   - Fitness rating prominently displayed
4. **Name**: Large, elegant typography
5. **Student ID**: Small, below name
6. **Squad Badge**: "Skaraborg Bats" (only for cheerleaders)
   - Kiara: Not present in episode 1, appears episode 2+
7. **Hover Hint**: "Hover for Assessment"
8. **Footer**: "Vinterhall Akademi"

### Back of Card (Assessment Data)

**Revealed on hover** - front ghosts to 20% opacity, this fades in

```
         ╔══════════╗
         ║ ◈ CLIP ◈ ║
         ╚══════════╝
              │
    ┌─────────┴─────────┐
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← "CONFIDENTIAL" security strip
    │                   │
    │  COMPANION        │
    │  CANDIDATE        │
    │  ═══════════════  │
    │  CLASS A [ELITE]  │
    │                   │
    │  ◈ VISUAL         │
    │    ESSENCE ◈      │
    │                   │
    │  ┌─────────────┐  │
    │  │ ● Alexis    │  │  ← Female influences
    │  │   Ren  40%  │  │     (distilled traits)
    │  │ ● Nata Lee  │  │
    │  │   35%       │  │
    │  │ ● Madison   │  │
    │  │   Beer 25%  │  │
    │  └─────────────┘  │
    │                   │
    │  PLACEMENT VALUE  │
    │  €2,400,000      │
    │                   │
    │  TRAINING         │
    │  Physical         │
    │  Conditioning     │
    │  Fysisk Kondition │  ← English/Swedish
    │  ★★★★★            │
    │                   │
    │  CLIENT SUITABILITY│
    │  Elite: ████ 95%  │
    │  Ancient: ██ 80%  │
    │                   │
    │  [Achievement     │
    │   badges]         │
    │                   │
    │  ESTATE PROPERTY  │
    └───────────────────┘
```

**Back Elements:**
1. **Security Strip**: "KONFIDENTIELL / CONFIDENTIAL"
2. **Classification**: "CLASS A [ELITE]" with holographic badge
3. **Visual Essence Section**: Female influences with percentages
4. **Placement Value**: Large monetary figure
5. **Training Modules**: Star ratings with bilingual labels
6. **Client Suitability**: Progress bars for different client types
7. **Achievement Badges**: Row of earned accomplishments
8. **Footer**: "EGENDOM AV ESTATEN / ESTATE PROPERTY"

### Visual Influence Component

```
┌─ VISUAL ESSENCE ─┐
│                  │
│  ● Alexis Ren   │
│    ━━━━━━━━━━━  │  ← 40% filled bar
│    Grace · Dance│
│                  │
│  ● Nata Lee     │
│    ━━━━━━━━━    │  ← 35% filled bar
│    Perfection   │
│                  │
│  ● Madison Beer │
│    ━━━━━━━      │  ← 25% filled bar
│    Seduction    │
│                  │
└──────────────────┘
```

Each influence shows:
- Name
- Percentage contribution
- Trait keywords distilled from that influence
- Visual bar indicating strength

### Interaction: Hover Reveal

**Technical Implementation:**
```typescript
// Container with both faces
<div className="card-container group">
  {/* Front - visible by default, ghosts on hover */}
  <div className="card-front 
    group-hover:opacity-20 
    group-hover:scale-95">
    {/* Front content */}
  </div>
  
  {/* Back - hidden by default, revealed on hover */}
  <div className="card-back 
    opacity-0 
    group-hover:opacity-100 
    scale-95 
    group-hover:scale-100">
    {/* Back content */}
  </div>
  
  {/* Light sweep overlay */}
  <div className="light-sweep group-hover:animate-sweep" />
</div>
```

**Animation Specs:**
- Duration: 400ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Front: opacity 1→0.2, scale 1→0.95
- Back: opacity 0→1, scale 0.95→1
- Light sweep: Diagonal wipe animation

---

## Patron/Client Card Specification

### Concept Shift
- **NOT** "authorities" or council members
- **ARE** clients, patrons, purchasers of companion services
- Cards represent their **membership/status** in the client program

### Card Dimensions
- **Width**: 400px
- **Height**: 260px (landscape)
- **Border radius**: 12px

### Front of Card (Minimalist Status)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌──────────────┐                                        │
│    │              │     DESIRÉE NATT OCH DAG               │
│    │   FACE       │     ═══════════════════════             │
│    │   OUTLINE    │                                        │
│    │   (elegant   │     [Gold border accent]               │
│    │   profile)   │                                        │
│    │              │     Matriarch · Client Tier I          │
│    └──────────────┘                                        │
│                                                             │
│              ◈ Natt och Dag Estate ◈                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Front Elements:**
1. **Portrait**: Elegant profile outline (minimal)
2. **Name**: Prominent
3. **Role**: "Matriarch" / "Collector" / "Patron"
4. **Client Tier**: I, II, III (determines privileges)
5. **Family/Estate**: Estate name

### Back of Card (Privileges & Information)

```
┌─────────────────────────────────────────────────────────────┐
│  ◈ VINTERHALL AKADEMI ◈      [HOLOGRAM]  [SECURE]          │
│  ═══════════════════════════════════════════════════════   │
│  CLIENT MEMBERSHIP · TIER I                                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NAME: Desirée Natt och Dag                          │  │
│  │  ESTATE: Natt och Dag                                │  │
│  │  STATUS: Matriarch                                   │  │
│  │  MEMBER SINCE: 1847                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  PRIVILEGES:                                               │
│  ✓ Unlimited Companion Access                             │
│  ✓ First Selection Rights                                 │
│  ✓ Private Training Observation                           │
│  ✓ Elite Class Placement Priority                         │
│                                                             │
│  CURRENT COMPANIONS:                                       │
│  ● [Classified]                                           │
│                                                             │
│     [SEAL]            [HOLOGRAM]              [CHIP]       │
│                                                             │
│  AUTHORIZED CLIENT · PRIVILEGED ACCESS                     │
└─────────────────────────────────────────────────────────────┘
```

**Client Tier System:**

| Tier | Name | Privileges | Card Accent |
|------|------|------------|-------------|
| I | Elite Patron | Unlimited, First pick | Gold |
| II | Distinguished | Limited, Second pick | Silver |
| III | Standard | Restricted, Waitlist | Bronze |

---

## Visual Effects Specification

### 1. Chain & Clip

**Gold Clip:**
```css
.chain-clip {
  width: 60px;
  height: 40px;
  background: linear-gradient(
    135deg,
    #d4af37 0%,
    #f4d03f 30%,
    #d4af37 50%,
    #c9a227 70%,
    #d4af37 100%
  );
  border-radius: 8px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.4),
    inset 0 -1px 0 rgba(0,0,0,0.3),
    0 4px 8px rgba(0,0,0,0.3);
  position: relative;
}

.chain-clip::before {
  content: '◈';
  position: absolute;
  center: both;
  color: rgba(255,255,255,0.9);
  font-size: 20px;
}
```

**Chain Links:**
```css
.chain-link {
  width: 12px;
  height: 24px;
  border: 2px solid #d4af37;
  border-radius: 6px;
  background: transparent;
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 2px 4px rgba(0,0,0,0.2);
}
```

### 2. Holographic Shimmer

```css
@keyframes holoShift {
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(15deg) brightness(1.1); }
  100% { filter: hue-rotate(0deg) brightness(1); }
}

.holographic {
  background: linear-gradient(
    135deg,
    rgba(212,175,55,0.3) 0%,
    rgba(190,24,93,0.3) 50%,
    rgba(212,175,55,0.3) 100%
  );
  animation: holoShift 3s ease-in-out infinite;
  backdrop-filter: blur(2px);
}
```

### 3. Light Sweep on Hover

```css
@keyframes lightSweep {
  0% { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(200%) rotate(25deg); }
}

.light-sweep {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.2) 50%,
    transparent 100%
  );
  width: 50%;
  opacity: 0;
  pointer-events: none;
}

.card-container:hover .light-sweep {
  opacity: 1;
  animation: lightSweep 1s ease-out;
}
```

### 4. Card Lift & Shadow

```css
.card-container {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 10px 30px -10px rgba(0,0,0,0.5),
    0 5px 15px -5px rgba(0,0,0,0.3);
}

.card-container:hover {
  transform: translateY(-12px) rotateX(5deg);
  box-shadow:
    0 30px 60px -15px rgba(0,0,0,0.7),
    0 15px 30px -10px rgba(0,0,0,0.5);
}
```

### 5. Ghosting Transition

```css
.card-front {
  transition: opacity 0.4s ease, transform 0.4s ease;
  opacity: 1;
  transform: scale(1);
}

.card-container:hover .card-front {
  opacity: 0.2;
  transform: scale(0.95);
  filter: blur(1px);
}

.card-back {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.card-container:hover .card-back {
  opacity: 1;
  transform: scale(1);
}
```

---

## Kiara's Card Evolution

### Episode 1 (Pre-Cheerleader)

```
┌──────────────────────────────┐
│         ◈ CLIP ◈             │
├──────────────────────────────┤
│  ◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈             │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   [KIARA PORTRAIT]     │  │
│  │                        │  │
│  │   ◈ 7/10 ◈             │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  KIARA NATT OCH DAG          │
│                              │
│  ID: STD-24-001              │
│                              │
│  [NO SQUAD BADGE]            │
│                              │
│  [Hover for Assessment]      │
│                              │
│  VINTERHALL AKADEMI          │
└──────────────────────────────┘
```

**Characteristics:**
- No squad badge
- Lower fitness rating (7/10)
- "Unstyled" card design (simpler clip)
- Less confident pose in portrait

### Episode 2+ (Joined Skaraborg Bats)

```
┌──────────────────────────────┐
│         ◈ CLIP ◈             │
├──────────────────────────────┤
│  ◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈             │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   [KIARA PORTRAIT]     │  │
│  │   (Confident, fit)     │  │
│  │                        │  │
│  │   ◈ 9/10 ◈             │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  KIARA NATT OCH DAG          │
│                              │
│  ID: STD-24-001              │
│                              │
│  ┌──────────────────────┐    │
│  │  ◈ SKARABORG BATS ◈  │    │
│  │     [BAT LOGO]       │    │
│  └──────────────────────┘    │
│                              │
│  [Hover for Assessment]      │
│                              │
│  VINTERHALL AKADEMI          │
└──────────────────────────────┘
```

**Characteristics:**
- Squad badge appears
- Higher fitness (9/10)
- Premium clip design
- More confident portrait
- Achievements added

---

## Component Architecture

### File Structure

```
frontend/components/
├── cards/
│   ├── StudentCardV2/                    # New component directory
│   │   ├── index.tsx                     # Main export
│   │   ├── StudentCard.tsx               # Card container
│   │   ├── ChainClip.tsx                 # Chain attachment visual
│   │   ├── CardFront.tsx                 # Visual showcase face
│   │   ├── CardBack.tsx                  # Assessment data face
│   │   ├── VisualEssence.tsx             # Female influences
│   │   ├── SquadBadge.tsx                # Skaraborg Bats badge
│   │   ├── TrainingModules.tsx           # Star ratings
│   │   └── AchievementRow.tsx            # Badges
│   │
│   └── PatronCardV2/                     # Client cards
│       ├── index.tsx
│       ├── PatronCard.tsx
│       ├── ClientFront.tsx
│       ├── ClientBack.tsx
│       └── PrivilegesList.tsx
│
├── effects/
│   ├── HolographicShimmer.tsx
│   ├── LightSweep.tsx
│   └── GlassSurface.tsx
│
└── [existing components...]
```

### Props Interface

```typescript
// StudentCardV2
interface StudentCardV2Props {
  // Identity
  id: string;
  name: string;
  studentId: string;
  
  // Visual
  portraitVariant: string;
  fitnessLevel: number;        // 1-10
  
  // Squad (optional based on episode)
  squad?: {
    name: string;              // "Skaraborg Bats"
    joinedEpisode?: string;    // "s01e02"
    role?: string;             // "flyer", "base", etc.
  };
  
  // Visual Essence (female influences)
  visualEssence: Array<{
    name: string;              // "Alexis Ren"
    percentage: number;        // 40
    traits: string[];          // ["Grace", "Dance"]
  }>;
  
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
  achievements: Achievement[];
  
  // Metadata
  family: string;
  familyTier: 'exclusive' | 'standard';
  status: 'active' | 'training';
  
  // Card style variant
  cardStyle?: 'standard' | 'premium' | 'unstyled';
}

// PatronCardV2
interface PatronCardV2Props {
  id: string;
  name: string;
  portraitVariant: string;
  
  // Client status
  tier: 1 | 2 | 3;            // I, II, III
  status: 'matriarch' | 'patriarch' | 'collector' | 'patron';
  
  // Estate
  estate: string;
  estateTier: 'exclusive' | 'standard';
  
  // Membership
  memberSince: number;
  
  // Privileges
  privileges: string[];
  
  // Current companions
  currentCompanions?: Array<{
    name: string;
    isSecret: boolean;
  }>;
}
```

---

## Implementation Tasks

### Phase 1: Core Card Infrastructure
- [ ] Create `CardContainer` with chain clip visual
- [ ] Implement hover-reveal system (front ghost, back fade)
- [ ] Add light sweep animation
- [ ] Create holographic shimmer effect
- [ ] Build bilingual text component

### Phase 2: Student Card
- [ ] `ChainClip` component (gold/silver variants)
- [ ] `CardFront` with large portrait area
- [ ] `CardBack` with assessment layout
- [ ] `VisualEssence` influence display
- [ ] `SquadBadge` ("Skaraborg Bats")
- [ ] `TrainingModules` star ratings
- [ ] `AchievementRow` badge display
- [ ] Kiara's episode-based transformation

### Phase 3: Patron Card
- [ ] `ClientFront` minimalist design
- [ ] `ClientBack` privileges display
- [ ] Tier-based styling (Gold/Silver/Bronze)
- [ ] Estate branding integration

### Phase 4: Integration
- [ ] Update `characters-new/page.tsx`
- [ ] Create demo data with visual essences
- [ ] Add episode-based state for Kiara
- [ ] Test all hover interactions
- [ ] Visual QA for premium quality

### Phase 5: Polish
- [ ] Fine-tune animation timing
- [ ] Optimize CSS performance
- [ ] Add accessibility (aria labels)
- [ ] Mobile responsive adjustments

---

## Success Criteria

### Visual Quality
- [ ] Cards look like luxury physical objects
- [ ] Chain/clip mechanism is visually convincing
- [ ] Holographic effects shimmer appropriately
- [ ] Light sweep adds premium feel
- [ ] Front showcases beauty/fitness effectively
- [ ] Back data is readable and well-organized

### Interaction
- [ ] Hover reveals back smoothly (400ms)
- [ ] Front ghosts to exactly 20% opacity
- [ ] No click required for reveal
- [ ] Card lifts with satisfying shadow
- [ ] All animations run at 60fps

### Content
- [ ] "Vinterhall Akademi" branding throughout
- [ ] "Skaraborg Bats" squad correctly displayed
- [ ] Female influences shown with percentages
- [ ] Bilingual text (English/Swedish) working
- [ ] Patrons distinguished from authorities
- [ ] Kiara's transformation based on episode

### Technical
- [ ] TypeScript compiles without errors
- [ ] Components reusable and well-structured
- [ ] CSS animations GPU-accelerated
- [ ] Responsive down to mobile
- [ ] Accessible (keyboard navigation, screen readers)

---

## Notes

**Critical Quality Checkpoints:**
- Every pixel must serve the "premium cattle tag" aesthetic
- The chain attachment is central to the concept - make it convincing
- Front must be genuinely attractive (this sells the dark premise)
- Hover reveal should feel magical, not jarring
- Swedish text should feel authentic, not Google Translate

**Narrative Considerations:**
- Cards mark girls as property (cattle tags) but look like luxury items
- The unsuspicious design is intentional - hiding in plain sight
- Cheerleader status is a progression/achievement
- Visual essence shows ideal they're being molded toward

**Performance Notes:**
- Use CSS transforms for animations (GPU accelerated)
- Avoid heavy filters on mobile
- Lazy-load portrait images
- Debounce hover states if needed
