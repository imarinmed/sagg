# Work Plan: Vinterhall Akademi E-Ink Card System v3

## TL;DR

Transform cards into **premium e-ink display devices** - like high-end digital photo frames clipped to waist chains. The objectification is explicit: ID numbers dominate while names fade to mere overlays.

**Student Cards:**
- **Front**: 100% visual - swipe through contexts (Portrait, Gym, School, Spa, Class)
- **Overlay**: Prominent ID (STD-24-001), minimal first name only
- **Back**: Swipe through data sections (Assessment, Training, History, Suitability)
- **Aesthetic**: Matte e-ink with subtle digital shimmer

**Client Cards:**
- **Front**: Large Roman numeral tier watermark (I, II, III) as elegant overlay
- **Back**: Swipe through patron data, privileges, companion history
- **Aesthetic**: Premium client access card

**Core Concept**: Advanced e-ink technology allows swipe navigation - multiple images on front, multiple data sections on back.

---

## The E-Ink Aesthetic

### Visual Language

Unlike glossy trading cards, these are **matte digital displays** that mimic premium e-ink:

```
MATTE BLACK SURFACE
┌──────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Subtle texture
│  ▓                        ▓  │
│  ▓   [PHOTO DISPLAY]      ▓  │  ← High contrast image
│  ▓                        ▓  │
│  ▓   ◈ STD-24-001 ◈       ▓  │  ← ID prominent (gold)
│  ▓                        ▓  │
│  ▓   Kiara                ▓  │  ← Name minimal (white)
│  ▓                        ▓  │
│  ▓   ● ● ● ○ ○            ▓  │  ← Context dots
│  ▓                        ▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────────────────┘
      ││
   ╔══╧╧══╗
   ║ CLIP ║
   ╚══════╝
```

**Key Characteristics:**
- Matte black surface (not glossy)
- High-contrast display area
- Subtle digital refresh effect on swipe
- Gold/silver accents for ID and premium elements
- E-ink "ghosting" effect during transitions

### E-Ink CSS Foundation

```css
/* E-ink card base */
.eink-card {
  background: #0a0a0a;
  border-radius: 16px;
  border: 2px solid #1a1a1a;
  box-shadow:
    /* Physical depth */
    0 20px 40px -10px rgba(0,0,0,0.8),
    0 10px 20px -5px rgba(0,0,0,0.6),
    /* Inner bevel */
    inset 0 1px 0 rgba(255,255,255,0.05),
    inset 0 -1px 0 rgba(0,0,0,0.5);
  
  /* E-ink matte texture */
  background-image: 
    url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-blend-mode: overlay;
  background-size: 100px 100px;
}

/* Display area - high contrast */
.eink-display {
  background: #050505;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
}

/* E-ink refresh animation */
@keyframes eink-refresh {
  0% { filter: invert(0); }
  25% { filter: invert(1); }
  50% { filter: invert(0); }
  75% { filter: contrast(2) brightness(0.5); }
  100% { filter: contrast(1) brightness(1); }
}

.eink-transitioning {
  animation: eink-refresh 0.3s ease-out;
}

/* ID overlay - prominent gold */
.eink-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4af37;
  text-shadow: 0 0 20px rgba(212,175,55,0.3);
  letter-spacing: 0.1em;
}

/* Name overlay - minimal white */
.eink-name {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.05em;
}
```

---

## Student Card Front: Visual Gallery

### Photo Contexts (Swipeable)

Each student has **5 photo contexts** that users can swipe through:

1. **Portrait** - Face focus, beauty shot
2. **Gym** - Fitness, workout, athletic wear
3. **School** - Uniform, classroom setting
4. **Spa** - Relaxation, self-care, intimate
5. **Class** - Training, companion instruction

### Front Layout

```
┌──────────────────────────────┐
│      ╔══════════╗            │
│      ║  CLIP    ║            │ ← Chain attachment
│      ╚══════════╝            │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   [PHOTO GALLERY]      │  │
│  │                        │  │
│  │   Swipe to change      │  │
│  │   context              │  │
│  │                        │  │
│  │   Current: GYM         │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│     ◈◈◈◈◈                   │
│     STD-24-KND-001           │ ← Prominent ID
│                              │
│     Kiara                    │ ← First name only
│                              │
│  ● ○ ○ ○ ○  (swipe dots)     │
│  P G S S C                   │
│                              │
│  [swipe hint] →              │
└──────────────────────────────┘
```

**Context Indicator Dots:**
- Filled = current context
- Letters below: P(ortrait), G(ym), S(chool), S(pa), C(lass)

### Swipe Interface

```tsx
interface PhotoContext {
  id: 'portrait' | 'gym' | 'school' | 'spa' | 'class';
  label: string;
  labelSv: string;
  imageUrl: string;
  fitnessDisplay?: number; // Shows fitness rating in gym context
}

// Front component structure
const CardFront = () => {
  const [currentContext, setCurrentContext] = useState(0);
  const contexts: PhotoContext[] = [
    { id: 'portrait', label: 'Portrait', labelSv: 'Porträtt', imageUrl: '/kiara-portrait.jpg' },
    { id: 'gym', label: 'Training', labelSv: 'Träning', imageUrl: '/kiara-gym.jpg', fitnessDisplay: 9 },
    { id: 'school', label: 'Academy', labelSv: 'Akademi', imageUrl: '/kiara-school.jpg' },
    { id: 'spa', label: 'Wellness', labelSv: 'Välbefinnande', imageUrl: '/kiara-spa.jpg' },
    { id: 'class', label: 'Instruction', labelSv: 'Instruktion', imageUrl: '/kiara-class.jpg' },
  ];
  
  return (
    <div className="card-front">
      {/* Chain clip */}
      <ChainClip />
      
      {/* Photo display with swipe */}
      <SwipeableGallery
        items={contexts}
        currentIndex={currentContext}
        onSwipe={setCurrentContext}
        renderItem={(context) => (
          <div className="photo-container">
            <img src={context.imageUrl} alt={context.label} />
            
            {/* Context label overlay */}
            <div className="context-label">
              {context.label}
              <span className="swedish">{context.labelSv}</span>
            </div>
            
            {/* Fitness badge for gym context */}
            {context.fitnessDisplay && (
              <div className="fitness-badge">
                ◈ {context.fitnessDisplay}/10 ◈
              </div>
            )}
          </div>
        )}
      />
      
      {/* ID - Prominent */}
      <div className="id-overlay">
        <span className="id-shimmer">◈ {studentId} ◈</span>
      </div>
      
      {/* Name - Minimal */}
      <div className="name-overlay">
        {firstName}
      </div>
      
      {/* Context navigation dots */}
      <ContextDots
        contexts={contexts}
        currentIndex={currentContext}
        onSelect={setCurrentContext}
      />
      
      {/* Swipe hint */}
      <div className="swipe-hint">
        <ChevronRight className="animate-pulse" />
        <span>swipe</span>
      </div>
    </div>
  );
};
```

### Swipe Animation

```css
/* Swipe transition */
.swipe-container {
  position: relative;
  overflow: hidden;
}

.swipe-item {
  position: absolute;
  inset: 0;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease;
}

.swipe-item.current {
  transform: translateX(0);
  opacity: 1;
}

.swipe-item.prev {
  transform: translateX(-100%);
  opacity: 0;
}

.swipe-item.next {
  transform: translateX(100%);
  opacity: 0;
}

/* E-ink refresh flash during swipe */
.swipe-item.changing {
  animation: eink-refresh 0.2s ease-out;
}

@keyframes eink-refresh {
  0% { filter: none; }
  50% { filter: invert(0.3) contrast(1.5); }
  100% { filter: none; }
}
```

---

## Student Card Back: Data Sections

### Swipeable Information Panels

Back has **4 sections** accessible via swipe:

1. **Assessment** - Companion class, placement value, visual essence
2. **Training** - Modules, ratings, progress
3. **History** - Key moments, achievements, timeline
4. **Suitability** - Client match percentages

### Back Layout

```
┌──────────────────────────────┐
│      ╔══════════╗            │
│      ║  CLIP    ║            │
│      ╚══════════╝            │
│                              │
│  ┌────────────────────────┐  │
│  │  CONFIDENTIAL          │  │
│  │  ═══════════════════   │  │
│  │                        │  │
│  │  [CURRENT SECTION]     │  │
│  │                        │  │
│  │  Swipe for more data   │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  ◈ ASSESSMENT ◈              │ ← Section tabs (current highlighted)
│  Training  History  Suit     │
│                              │
│  ● ○ ○ ○                     │
│                              │
│  [swipe sections] →          │
└──────────────────────────────┘
```

### Section Components

```tsx
type BackSection = 'assessment' | 'training' | 'history' | 'suitability';

const CardBack = () => {
  const [currentSection, setCurrentSection] = useState<BackSection>('assessment');
  
  const sections: Record<BackSection, SectionData> = {
    assessment: {
      title: 'Assessment',
      titleSv: 'Bedömning',
      content: <AssessmentPanel />,
    },
    training: {
      title: 'Training',
      titleSv: 'Träning',
      content: <TrainingPanel />,
    },
    history: {
      title: 'History',
      titleSv: 'Historia',
      content: <HistoryPanel />,
    },
    suitability: {
      title: 'Suitability',
      titleSv: 'Lämplighet',
      content: <SuitabilityPanel />,
    },
  };
  
  return (
    <div className="card-back">
      <ChainClip />
      
      <div className="confidential-strip">
        KONFIDENTIELL / CONFIDENTIAL
      </div>
      
      <SwipeableSections
        sections={sections}
        currentSection={currentSection}
        onSwipe={setCurrentSection}
      />
      
      <SectionTabs
        sections={sections}
        currentSection={currentSection}
        onSelect={setCurrentSection}
      />
    </div>
  );
};
```

### Assessment Section (Default)

```
┌──────────────────────────────┐
│  ◈ ASSESSMENT / BEDÖMNING ◈  │
│                              │
│  COMPANION CLASS             │
│  ★ A [ELITE] ★               │
│                              │
│  PLACEMENT VALUE             │
│  €2,400,000                  │
│                              │
│  VISUAL ESSENCE              │
│  ┌─────────────────────┐     │
│  │ ● Alexis Ren  40%   │     │
│  │ ● Nata Lee    35%   │     │
│  │ ● M. Beer     25%   │     │
│  └─────────────────────┘     │
│                              │
│  ESTATE PROPERTY             │
└──────────────────────────────┘
```

### Training Section

```
┌──────────────────────────────┐
│  ◈ TRAINING / TRÄNING ◈      │
│                              │
│  Physical Conditioning       │
│  Fysisk Kondition            │
│  ★★★★★ (5/5)                 │
│  ████████████████████ 100%   │
│                              │
│  Dance                       │
│  Dans                        │
│  ★★★★★ (5/5)                 │
│  ████████████████████ 100%   │
│                              │
│  Body Language               │
│  Kroppsspråk                 │
│  ★★★★☆ (4/5)                 │
│  ████████████████░░░░ 80%    │
│                              │
│  [more modules...]           │
└──────────────────────────────┘
```

---

## Client Card: Tier Watermark

### Front Design

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                           ╔══════════╗                      │
│                           ║  CLIP    ║                      │
│                           ╚══════════╝                      │
│                                                             │
│                              ████████                       │
│                              ██    ██                       │
│          ◈◈◈◈◈◈◈◈◈◈◈◈◈◈     ██ I  ██     ◈◈◈◈◈◈◈◈◈◈◈◈◈◈  │
│          ◈                ██    ██                ◈         │
│          ◈   [ELEGANT     ████████    ELEGANT]    ◈         │
│          ◈    PROFILE                              ◈         │
│          ◈                PHOTO                    ◈         │
│          ◈                                         ◈         │
│          ◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈  │
│                                                             │
│                         Desirée                           │
│                                                             │
│                    ◈ TIER I PATRON ◈                      │
│                                                             │
│                    [swipe for data] →                     │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
1. **Giant Roman Numeral** as watermark (I, II, or III)
2. **Elegant profile photo** (minimal, sophisticated)
3. **First name only** (Desirée, Henry, etc.)
4. **Tier badge**: "TIER I PATRON" / "TIER II PATRON" / "TIER III PATRON"

### Roman Numeral Watermark

```css
.tier-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 200px;
  font-weight: 100;
  font-family: 'Times New Roman', serif;
  color: transparent;
  -webkit-text-stroke: 2px rgba(212,175,55,0.15);
  z-index: 0;
  pointer-events: none;
}

/* Tier I - Gold */
.tier-watermark.tier-1 {
  -webkit-text-stroke-color: rgba(212,175,55,0.2);
}

/* Tier II - Silver */
.tier-watermark.tier-2 {
  -webkit-text-stroke-color: rgba(192,192,192,0.2);
}

/* Tier III - Bronze */
.tier-watermark.tier-3 {
  -webkit-text-stroke-color: rgba(205,133,63,0.2);
}
```

### Client Back Sections

Swipe through:
1. **Profile** - Name, estate, status, member since
2. **Privileges** - Access levels, rights, restrictions
3. **Companions** - Current and past companions
4. **History** - Transactions, events, activities

```tsx
interface ClientCardProps {
  id: string;
  firstName: string;
  estate: string;
  tier: 1 | 2 | 3;
  status: 'matriarch' | 'patriarch' | 'collector' | 'patron';
  memberSince: number;
  privileges: string[];
  companions: Companion[];
}
```

---

## Chain Clip Variations

### By Card Type

**Student Standard:**
```
    ╔══════════╗
    ║  ◈◈◈   ║  ← Simple gold with gem
    ╚══════════╝
```

**Student Cheerleader (Skaraborg Bats):**
```
    ╔══════════╗
    ║  🦇◈🦇  ║  ← Bat motif
    ╚══════════╝
```

**Client Tier I:**
```
    ╔══════════╗
    ║   I ◈   ║  ← Roman numeral
    ╚══════════╝
```

**Client Tier II:**
```
    ╔══════════╗
    ║   II ◈  ║
    ╚══════════╝
```

**Client Tier III:**
```
    ╔══════════╗
    ║  III ◈  ║
    ╚══════════╝
```

---

## Implementation Architecture

### Core Components

```
frontend/components/cards/
├── EInkCard/
│   ├── EInkCard.tsx           # Base card container
│   ├── ChainClip.tsx          # Clip visual variations
│   ├── SwipeContainer.tsx     # Touch/mouse swipe handler
│   ├── EInkTransition.tsx     # E-ink refresh animation
│   └── ContextDots.tsx        # Navigation dots
│
├── StudentCard/
│   ├── StudentCard.tsx        # Main student card
│   ├── StudentFront.tsx       # Photo gallery front
│   ├── StudentBack.tsx        # Data sections back
│   ├── PhotoGallery.tsx       # Swipeable contexts
│   ├── IDOverlay.tsx          # Prominent ID display
│   ├── VisualEssence.tsx      # Female influences
│   └── AssessmentPanel.tsx    # Back section panels
│
├── ClientCard/
│   ├── ClientCard.tsx         # Main client card
│   ├── ClientFront.tsx        # Tier watermark front
│   ├── ClientBack.tsx         # Data sections back
│   ├── TierWatermark.tsx      # Roman numeral overlay
│   └── PrivilegesPanel.tsx    # Back section panels
│
└── effects/
    ├── EInkRefresh.tsx        # Refresh flash effect
    ├── MatteTexture.tsx       # E-ink surface texture
    └── ShimmerText.tsx        # Gold ID shimmer
```

### Swipe Gesture System

```tsx
// SwipeContainer.tsx
interface SwipeContainerProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

const SwipeContainer = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  threshold = 50 
}: SwipeContainerProps) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontal && Math.abs(distanceX) > threshold) {
      if (distanceX > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  };
  
  // Mouse drag support for desktop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number } | null>(null);
  
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX });
  };
  
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const distance = dragStart.x - e.clientX;
    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
    
    setIsDragging(false);
    setDragStart(null);
  };
  
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={() => setIsDragging(false)}
      className="swipe-container"
    >
      {children}
    </div>
  );
};
```

### State Management

```typescript
// Card state
interface StudentCardState {
  // Front
  currentPhotoContext: number; // 0-4 (portrait, gym, school, spa, class)
  
  // Back
  currentDataSection: 'assessment' | 'training' | 'history' | 'suitability';
  
  // Visual
  isHovering: boolean;
  isTransitioning: boolean;
}

interface ClientCardState {
  // Front (no swipe, just display)
  
  // Back
  currentDataSection: 'profile' | 'privileges' | 'companions' | 'history';
  
  // Visual
  isHovering: boolean;
}
```

---

## Data Structure

### Student Card Data

```typescript
interface StudentCardData {
  // Identity
  id: string;
  firstName: string;
  fullName: string;
  studentId: string;           // "STD-24-KND-001" - PROMINENT
  
  // Photo contexts
  photos: {
    portrait: string;
    gym: string;
    school: string;
    spa: string;
    class: string;
  };
  
  // Visual essence (female influences)
  visualEssence: Array<{
    name: string;
    percentage: number;
    traits: string[];
  }>;
  
  // Squad
  squad?: {
    name: string;              // "Skaraborg Bats"
    joinedEpisode?: string;    // "s01e02"
    role?: string;
  };
  
  // Assessment data (back of card)
  assessment: {
    companionClass: 'A' | 'B' | 'C';
    placementValue: number;
    trainingModules: TrainingModule[];
    clientSuitability: ClientSuitability;
    achievements: Achievement[];
    keyMoments: KeyMoment[];
  };
  
  // Metadata
  family: string;
  fitnessLevel: number;
  status: 'active' | 'training';
}
```

### Client Card Data

```typescript
interface ClientCardData {
  // Identity
  id: string;
  firstName: string;
  fullName: string;
  
  // Tier (front - prominent watermark)
  tier: 1 | 2 | 3;
  tierLabel: string;           // "I", "II", "III"
  
  // Visual
  portrait: string;
  estate: string;
  
  // Status
  status: 'matriarch' | 'patriarch' | 'collector' | 'patron';
  memberSince: number;
  
  // Data sections (back of card)
  profile: {
    estate: string;
    generation?: number;
    bloodline?: string;
  };
  
  privileges: string[];
  
  companions: Array<{
    name: string;
    isSecret: boolean;
    period: string;
  }>;
  
  history: Array<{
    date: string;
    event: string;
    type: string;
  }>;
}
```

---

## Demo Data

### Kiara (Episode 1 vs Episode 2+)

```typescript
// Episode 1 - Pre-cheerleader
const kiaraEpisode1: StudentCardData = {
  id: 'kiara',
  firstName: 'Kiara',
  fullName: 'Kiara Natt och Dag',
  studentId: 'STD-24-KND-001',
  photos: {
    portrait: '/kiara/portrait.jpg',
    gym: '/kiara/gym-1.jpg',      // Less confident pose
    school: '/kiara/school-1.jpg',
    spa: '/kiara/spa-1.jpg',
    class: '/kiara/class-1.jpg',
  },
  visualEssence: [
    { name: 'Alexis Ren', percentage: 40, traits: ['Grace', 'Dance'] },
    { name: 'Nata Lee', percentage: 35, traits: ['Perfection', 'Fitness'] },
    { name: 'Madison Beer', percentage: 25, traits: ['Seduction', 'Youth'] },
  ],
  squad: undefined,              // No squad yet
  assessment: {
    companionClass: 'A',
    placementValue: 2400000,
    trainingModules: [...],
    clientSuitability: { elite: 95, ancient: 80, noble: 85, experimental: 60 },
    achievements: [],             // Fewer achievements
    keyMoments: [...],
  },
  family: 'Natt och Dag',
  fitnessLevel: 7,               // Lower fitness
  status: 'training',
};

// Episode 2+ - Joined Skaraborg Bats
const kiaraEpisode2: StudentCardData = {
  ...kiaraEpisode1,
  photos: {
    portrait: '/kiara/portrait-2.jpg',
    gym: '/kiara/gym-2.jpg',      // Confident, fit
    school: '/kiara/school-2.jpg',
    spa: '/kiara/spa-2.jpg',
    class: '/kiara/class-2.jpg',
  },
  squad: {
    name: 'Skaraborg Bats',
    joinedEpisode: 's01e02',
    role: 'flyer',
  },
  fitnessLevel: 9,               // Improved
  achievements: [
    { icon: '🏆', label: 'Joined Squad', episode: 's01e02' },
    { icon: '💪', label: 'Fitness Milestone', episode: 's01e03' },
  ],
};
```

---

## Success Criteria

### Visual Quality
- [ ] E-ink matte texture visible
- [ ] ID is visually dominant on front
- [ ] Name is subtle overlay (first name only)
- [ ] Swipe transitions have e-ink refresh effect
- [ ] Roman numerals are elegant watermarks (client cards)
- [ ] Chain clips look physically attached

### Interaction
- [ ] Swipe gestures work on mobile (touch)
- [ ] Swipe gestures work on desktop (mouse drag)
- [ ] 5 photo contexts swipe smoothly
- [ ] 4 back sections swipe smoothly
- [ ] E-ink refresh animation plays on transition
- [ ] Context dots are tappable

### Content
- [ ] ID format: "STD-24-KND-001" (prominent)
- [ ] Photo contexts: Portrait, Gym, School, Spa, Class
- [ ] Back sections: Assessment, Training, History, Suitability
- [ ] Client tiers: I, II, III as watermarks
- [ ] Squad "Skaraborg Bats" appears for cheerleaders
- [ ] Kiara has episode-based transformation

### Technical
- [ ] TypeScript types for all data structures
- [ ] Swipe gesture abstraction (reusable)
- [ ] E-ink transition component (reusable)
- [ ] Responsive (mobile touch, desktop mouse)
- [ ] 60fps animations
- [ ] Accessible (keyboard navigation)

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] `EInkCard` base container with matte texture
- [ ] `SwipeContainer` gesture handler (touch + mouse)
- [ ] `EInkTransition` refresh animation
- [ ] `ChainClip` variations (student, cheerleader, tier I/II/III)
- [ ] `ContextDots` navigation component

### Phase 2: Student Card
- [ ] `PhotoGallery` with 5 contexts
- [ ] `IDOverlay` prominent display
- [ ] `StudentFront` all-visual design
- [ ] Back panels: Assessment, Training, History, Suitability
- [ ] `StudentBack` swipeable sections
- [ ] Kiara episode-based state

### Phase 3: Client Card
- [ ] `TierWatermark` Roman numerals
- [ ] `ClientFront` minimal elegant design
- [ ] Back panels: Profile, Privileges, Companions, History
- [ ] `ClientBack` swipeable sections

### Phase 4: Integration
- [ ] Update `characters-new/page.tsx`
- [ ] Create demo data with photo contexts
- [ ] Test swipe on mobile/desktop
- [ ] Visual QA for premium quality

### Phase 5: Polish
- [ ] Fine-tune e-ink refresh timing
- [ ] Optimize image loading
- [ ] Add accessibility features
- [ ] Performance optimization

---

## Notes

**Objectification Through Design:**
- ID number is largest text element
- Name is subtle, almost secondary
- Photos emphasize body/fitness
- "Property of Estate" footer
- All design choices reinforce "cattle tag" concept

**E-Ink vs Glossy:**
- Matte surface feels more "institutional"
- Digital refresh effect emphasizes "device" nature
- High contrast = premium display technology
- Less playful than trading cards, more serious

**Swipe Interface Benefits:**
- Multiple photos without clutter
- Multiple data sections organized
- Feels like using a digital device
- Natural mobile interaction

**Premium Quality Checkpoints:**
- Every swipe must feel satisfying
- E-ink refresh must be visible but quick
- ID shimmer must catch light
- Chain clip must look physically real
- All text must be perfectly readable
