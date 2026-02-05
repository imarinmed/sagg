# Draft: Elite Character Card Map Redesign

## Current State Analysis

### Existing Implementation
- **Current component**: `CharacterPolaroidWeb` in `/frontend/app/characters/page.tsx`
- **Current visualization**: Polaroid-style cards with simple relationship lines
- **Current data source**: Hardcoded `charactersData` array with 8 main characters
- **Backend data available**: `data/character_relationships.json` (103 relationships)
- **Backend models**: `Character`, `Relationship` in `backend/src/models.py`

### Character Categorization

**STUDENTS (Young Characters - Student Cards)**:
- Kiara Natt och Dag (vampire, 16, protagonist)
- Alfred (human, 16, love interest)
- Elise (human, 16, rival)
- Chloe (human, 16, friend)
- Eric (human, 16, best friend)
- Felicia (human, 16, follower)
- Didde (human, 16, jock)

**PARENTS/ADULTS (Authority Figures - Parent Cards)**:
- Henry Natt och Dag (vampire, 45, father)
- Desirée Natt och Dag (vampire, 43, mother)
- Jacques Natt och Dag (vampire, 40, uncle)

**Additional Characters from relationships**:
- Principal, Jonas, Siri, Livia, Kevin, Adam, Mother, Teacher Math
- Party students (1, 2, 3), Batgirls (1, 2, 3)

### Current Technical Stack
- React 18+ with TypeScript
- D3.js for force-directed graphs
- Framer Motion for animations
- HeroUI components
- Tailwind CSS
- GlassCard component for glassmorphism

## Design Vision: "Elegant Premium Elite Club/School Card"

### Aesthetic Keywords
- Elegant, sexy, erotic, engaging
- Premium elite club/school card mix
- Curved but structured connectors
- Hidden grid discipline

### Card Design Concept

**Student Cards**:
- Portrait orientation (2:3 ratio)
- Premium ID card aesthetic
- Gold/crimson accents
- Photo area with elegant frame
- Character name in elegant serif
- Role/species badges
- Subtle erotic undertones (sensual poses, suggestive styling)

**Parent Cards**:
- Landscape orientation (3:2 ratio)
- Authority/privilege aesthetic
- Darker, more opulent styling
- Family crest/badge
- Formal typography
- Power indicators

### Connector System
- Curved Bezier paths (not straight lines)
- Grid-aligned anchor points (hidden grid rule)
- Relationship type color coding
- Animated flow effects
- Hover reveals relationship details

## Technical Approach

### Option 1: Enhanced D3.js with Custom Layout
- Use D3 force simulation for initial positioning
- Apply grid-snapping post-simulation
- Custom Bezier path generation for connectors
- SVG-based rendering

### Option 2: React + Framer Motion with Manual Layout
- Pre-calculated grid-based positions
- Framer Motion for animations
- SVG overlay for connectors
- More control over exact positioning

### Option 3: Hybrid Approach (RECOMMENDED)
- D3 force simulation for organic feel
- Grid constraint system for structure
- Framer Motion for card animations
- SVG for connector rendering

## Color Palette

**Primary Colors**:
- Deep Obsidian: `#0a0a0f`
- Crimson Blood: `#8B0000`
- Antique Gold: `#D4AF37`

**Accent Colors**:
- Rose Gold: `#B76E79`
- Midnight Blue: `#1a1a2e`
- Champagne: `#F7E7CE`

**Relationship Colors**:
- Romantic: `#ff6b9d` (rose pink)
- Familial: `#D4AF37` (gold)
- Antagonistic: `#ef4444` (crimson)
- Social: `#60a5fa` (soft blue)
- Professional: `#8B5CF6` (purple)
- Blood Bond: `#8B0000` (deep red)

## Typography

**Student Cards**:
- Name: Playfair Display (elegant serif)
- Role: Inter (clean sans-serif)
- Details: Source Sans Pro

**Parent Cards**:
- Name: Cormorant Garamond (formal serif)
- Title: Inter
- Details: Source Sans Pro

## Implementation Phases

### Phase 1: Data Integration
- Connect to backend API for real character data
- Categorize characters (student/parent/other)
- Load relationships from backend

### Phase 2: Card Components
- Create `EliteStudentCard` component
- Create `EliteParentCard` component
- Implement glassmorphism with gold/crimson accents

### Phase 3: Layout System
- Implement hidden grid system
- Create grid-aware positioning algorithm
- Design curved connector path generator

### Phase 4: Interaction
- Drag-to-rearrange with grid snapping
- Hover effects on cards
- Relationship line hover reveals
- Zoom and pan controls

### Phase 5: Polish
- Entrance animations
- Relationship flow animations
- Erotic/sensual styling touches
- Performance optimization
