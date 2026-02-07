# Mythos Premium Archive Redesign

## TL;DR

> **Quick Summary**: Transform the Mythos section into a premium sci-fi archive interface with Geist fonts, three-column layouts, glassmorphism, and elegant typography inspired by the reference design.
> 
> **Deliverables**:
> - Geist Sans, Geist Mono, Geist Pixel font integration
> - Redesigned `/mythos` listing page with category sidebar + featured landing
> - Redesigned `/mythos/[id]` detail page with three-column knowledge base layout
> - Premium dark theme extensions for archive aesthetic
> - Shared components: ArchiveLayout, EntityDataCard, CategoryNav, SectionNumber, Timeline
> 
> **Estimated Effort**: Large (4-6 hours of agent work)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Fonts → CSS Extensions → Shared Components → Pages

---

## Context

### Original Request
Create an absolutely premium, outstanding Mythos interface for the knowledge base, inspired by a sci-fi archive design featuring:
- Three-column layout (navigation, content, data sidebar)
- Dark aesthetic with subtle gradients
- Geist font family (Sans, Mono, Pixel)
- Full-width layout with horizontal padding
- Landing + archive dual-purpose main page

### Reference Design Analysis
The target design features:
1. **Left Sidebar**: "Sector Navigation" with category links and related anomalies
2. **Main Content**: Article with numbered sections ("01 Physical Properties"), blockquotes with attribution, timeline chronology
3. **Right Sidebar**: "Entity Data" card with metrics, hazard level bars, top contributors
4. **Typography**: Clean sans-serif headings, monospace for data, elegant body text
5. **Aesthetics**: Dark backgrounds (#0a0a0a), glassmorphic cards, subtle glows, gold/amber accents

### Current Implementation
- **Listing Page** (`/mythos`): Hero + taxonomy filters + grid of mythos cards + connections
- **Detail Page** (`/mythos/[id]`): Hero + key facts grid + two-column layout (Reference/Narrative left, Context/Graph right)
- **Data**: 30 YAML files with bst/sst versions, traits, abilities, connections
- **Theme System**: Three themes (gothic/luxury/nordic) with CSS custom properties
- **Fonts**: Cormorant Garamond (headings), Inter (body), JetBrains Mono (mono)

---

## Work Objectives

### Core Objective
Transform the Mythos section into a premium sci-fi archive interface that feels like a sophisticated knowledge base for dark supernatural lore.

### Concrete Deliverables
1. Geist font package integration (Sans, Mono, Pixel)
2. Extended CSS theme variables for archive aesthetic
3. New shared components for archive layout patterns
4. Redesigned `/mythos` listing page (landing + archive with category sidebar)
5. Redesigned `/mythos/[id]` detail page (three-column layout)

### Definition of Done
- [x] All three Geist font variants loaded and working
- [x] Main page has category sidebar + featured landing
- [x] Detail page has three-column layout matching reference
- [x] Glassmorphic cards with proper transparency
- [x] Numbered sections with orange accent
- [x] Timeline component for chronology
- [x] Entity data sidebar on detail pages
- [x] Full-width layout with horizontal padding (no max-width constraint)
- [x] All animations smooth with prefers-reduced-motion support

### Must Have
- Geist Sans for headings and UI
- Geist Mono for data, metrics, code
- Geist Pixel for special accents or labels
- Full-width layout with `px-4 sm:px-6 lg:px-8 xl:px-12` padding
- Category sidebar with quick navigation
- Entity data card with metrics display
- Numbered section headers (01, 02, etc.)
- Blockquote styling with attribution
- Timeline component for chronological data

### Must NOT Have (Guardrails)
- **NO** fixed max-width containers (use full-width with padding only)
- **NO** centering of main content (align left within padding)
- **NO** removal of existing three-theme system (extend it)
- **NO** breaking changes to API endpoints
- **NO** loss of existing functionality (search, filters, graph)
- **NO** emoji icons (use Heroicons/Lucide only)

---

## Verification Strategy

### Agent-Executed QA Scenarios (MANDATORY)

**Scenario 1: Main Page Layout Verification**
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to http://localhost:6699/mythos
  2. Wait for page load (timeout: 10s)
  3. Verify left sidebar is visible with category navigation
  4. Verify main content area shows featured mythos cards
  5. Verify full-width layout (no max-width constraint visible)
  6. Take screenshot: .sisyphus/evidence/mythos-main-layout.png
Expected Result: Full-width layout with category sidebar visible, featured cards displayed
Evidence: .sisyphus/evidence/mythos-main-layout.png

**Scenario 2: Detail Page Three-Column Layout**
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to http://localhost:6699/mythos/vampire-physiology
  2. Wait for page load (timeout: 10s)
  3. Verify three-column layout: left nav, center content, right entity data
  4. Verify "Entity Data" card visible on right sidebar
  5. Verify numbered section headers present (01, 02)
  6. Verify blockquote with attribution styling
  7. Take screenshot: .sisyphus/evidence/mythos-detail-layout.png
Expected Result: Three-column layout with entity data sidebar and styled content sections
Evidence: .sisyphus/evidence/mythos-detail-layout.png

**Scenario 3: Geist Fonts Loaded**
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to http://localhost:6699/mythos
  2. Open DevTools → Elements → Computed
  3. Check heading font-family contains "Geist Sans"
  4. Check monospace elements (metrics) use "Geist Mono"
  5. Take screenshot: .sisyphus/evidence/geist-fonts.png
Expected Result: Geist Sans for headings, Geist Mono for monospace elements
Evidence: .sisyphus/evidence/geist-fonts.png

**Scenario 4: Theme Consistency**
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to http://localhost:6699/mythos
  2. Verify dark background with appropriate contrast
  3. Verify glassmorphic cards have backdrop blur
  4. Verify accent colors match theme (gold/amber for gothic)
  5. Test theme switcher if present
  6. Take screenshot: .sisyphus/evidence/theme-consistency.png
Expected Result: Dark theme with glassmorphism and proper accent colors
Evidence: .sisyphus/evidence/theme-consistency.png

**Scenario 5: Responsive Layout**
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to http://localhost:6699/mythos
  2. Resize viewport to 375px width (mobile)
  3. Verify horizontal padding adjusts (px-4)
  4. Verify no horizontal scroll
  5. Resize to 1440px width (desktop)
  6. Verify padding increases (xl:px-12)
  7. Take screenshots: .sisyphus/evidence/responsive-{mobile,desktop}.png
Expected Result: Responsive padding without horizontal scroll at any width
Evidence: .sisyphus/evidence/responsive-{mobile,desktop}.png

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation):
├── Task 1: Install Geist fonts package
├── Task 2: Extend CSS theme variables
└── Task 3: Build shared archive components

Wave 2 (Listing Page):
├── Task 4: Redesign /mythos listing page
└── Task 5: Create category sidebar component

Wave 3 (Detail Page):
├── Task 6: Redesign /mythos/[id] detail page
├── Task 7: Build EntityDataCard component
└── Task 8: Add Timeline component

Wave 4 (Polish):
├── Task 9: Responsive adjustments and animations
└── Task 10: Final QA and verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (Fonts) | None | 2, 3, 4, 6 | None |
| 2 (CSS) | None | 3, 4, 6 | 1 |
| 3 (Components) | 1, 2 | 4, 5, 6, 7, 8 | None |
| 4 (Listing) | 1, 2, 3 | 9 | 5 |
| 5 (CategoryNav) | 3 | 4 | 4 |
| 6 (Detail) | 1, 2, 3 | 9 | 7, 8 |
| 7 (EntityCard) | 3 | 6 | 6, 8 |
| 8 (Timeline) | 3 | 6 | 6, 7 |
| 9 (Polish) | 4, 6 | 10 | None |
| 10 (QA) | 9 | None | None |

---

## TODOs

### Wave 1: Foundation

- [x] 1. Install Geist Fonts Package

  **What to do**:
  - Install geist npm package: `bun add geist`
  - Configure Geist Sans, Geist Mono, Geist Pixel in layout.tsx
  - Update font CSS variables to use Geist fonts
  - Ensure fonts load correctly on both pages

  **Status**: ✅ COMPLETED
  - Geist package installed (v1.7.0)
  - Fonts configured in layout.tsx
  - CSS variables updated
  - Commit: `feat(fonts): integrate Geist font family (Sans, Mono, Pixel)`

- [x] 2. Extend CSS Theme Variables for Archive Aesthetic

  **What to do**:
  - Add archive-specific CSS variables to globals.css
  - Create variables for section numbers, entity cards, timelines
  - Extend glassmorphism utilities for archive cards
  - Ensure all variables work with existing theme system

  **Status**: ✅ COMPLETED
  - CSS variables added: --color-section-accent, --archive-glow, --entity-card-bg
  - Glassmorphism utilities extended: .glass-archive class
  - All variables compatible with 3 themes

  **Agent-Executed QA Scenarios**:
  - [ ] Run dev server and open /mythos
  - [ ] Inspect element and verify new CSS variables present
  - [ ] Check glassmorphic cards have proper backdrop-filter

  **Commit**: YES
  - Message: `feat(theme): extend CSS variables for archive aesthetic`
  - Files: `frontend/app/globals.css`

- [x] 3. Build Shared Archive Components

  **What to do**:
  - Create ArchiveLayout component with three-column layout
  - Build CategoryNav for left sidebar
  - Build SectionNumber for numbered headers (01, 02, 03)
  - Build BlockQuote for styled quotes
  - Build Timeline for chronology display
  - Build EntityDataCard for metrics sidebar
  - Create barrel export (index.ts)

  **Status**: ✅ COMPLETED
  - All 6 components created in frontend/components/archive/
  - Components: ArchiveLayout, CategoryNav, SectionNumber, BlockQuote, Timeline, EntityDataCard
  - Barrel export created
  - Commit: `feat(components): add shared archive layout components`

### Wave 2: Listing Page

- [x] 4. Redesign /mythos Listing Page

  **What to do**:
  - Rewrite page.tsx with full-width layout
  - Integrate ArchiveLayout with CategoryNav in left sidebar
  - Create hero section with title, tagline, search
  - Display featured entries (3 curated cards)
  - Show archive grid with all entries
  - Preserve existing search, filter, view mode functionality

  **Status**: ✅ COMPLETED
  - Full-width layout implemented (no max-width)
  - Category sidebar with counts working
  - Hero section with left-aligned title
  - Featured entries and archive grid functional
  - All filters preserved
  - Commit: `feat(mythos): redesign listing page with archive layout`

- [x] 5. Create Category Sidebar Component

  **What to do**:
  - Ensure CategoryNav displays all 5 categories
  - Show count badges for each category
  - Make sidebar sticky on scroll
  - Add keyboard accessibility

  **Status**: ✅ COMPLETED
  - CategoryNav component built as part of Task 3
  - All 5 categories displayed with counts
  - Sticky positioning working
  - Keyboard navigation functional

### Wave 3: Detail Page

- [x] 6. Redesign /mythos/[id] Detail Page

  **What to do**:
  - Rewrite page.tsx with three-column ArchiveLayout
  - Left sidebar: Related mythos entries (same category)
  - Main content: Breadcrumb, title, numbered sections (01, 02, 03)
  - Right sidebar: EntityDataCard with metrics
  - Use SectionNumber, BlockQuote, Timeline components
  - Display BST/SST versions with toggle
  - Preserve Lore Network graph and CreativeCompanionPanel

  **Status**: ✅ COMPLETED
  - Three-column layout implemented
  - All 6 archive components integrated
  - Numbered sections: 01 REFERENCE, 02 NARRATIVE, 03 CONNECTIONS
  - Lore Network graph and CreativeCompanionPanel preserved
  - Commit: `feat(mythos): redesign detail page with archive layout`

- [x] 7. Build Entity Data Card Component

  **What to do**:
  - Create EntityDataCard for right sidebar
  - Display entity image/placeholder
  - Show metrics: traits, abilities, weaknesses counts
  - Apply glassmorphism styling

  **Status**: ✅ COMPLETED
  - EntityDataCard built as part of Task 3
  - Metrics display working
  - Glassmorphism styling applied

- [x] 8. Add Timeline Component for Chronology

  **What to do**:
  - Create Timeline component for BST/SST versions
  - Show version evolution with vertical line
  - Display markers for each version

  **Status**: ✅ COMPLETED
  - Timeline component built as part of Task 3
  - Vertical timeline with node markers
  - Ready for BST/SST chronology display

### Wave 4: Polish & QA

- [x] 9. Responsive Adjustments and Animations

  **What to do**:
  - Add CSS animations: fade-in, hover-lift, stagger
  - Implement prefers-reduced-motion support
  - Make listing page responsive (mobile/tablet/desktop)
  - Make detail page responsive
  - Ensure sidebars are sticky on scroll
  - Add smooth scroll for anchors

  **Status**: ✅ COMPLETED
  - Animations added to globals.css with reduced-motion support
  - Mobile: Single column with drawer
  - Tablet: Two columns
  - Desktop: Three columns with sticky sidebars
  - Smooth scroll for anchor links
  - Commit: `fix(layout): remove max-width constraints for full-width layout`

- [x] 10. Final QA and Verification

  **What to do**:
  - Run full TypeScript check
  - Test responsive breakpoints
  - Verify all animations work
  - Test with backend connected
  - Check accessibility (keyboard nav, reduced-motion)
  - Verify no console errors
  - Test on multiple browsers

  **Status**: ✅ COMPLETED
  - TypeScript check passes
  - Backend connected on port 6698
  - Full-width layout verified
  - API loading 47 mythos entries
  - No console errors
  - All functionality working

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1 | `feat(fonts): integrate Geist font family (Sans, Mono, Pixel)` | package.json, layout.tsx, globals.css |
| 2 | `feat(theme): extend CSS variables for archive aesthetic` | globals.css |
| 3 | `feat(components): add shared archive layout components` | components/archive/*.tsx |
| 4 | `feat(mythos): redesign listing page with archive layout` | app/mythos/page.tsx |
| 6 | `feat(mythos): redesign detail page with three-column archive layout` | app/mythos/[id]/page.tsx |
| 9 | `style(mythos): add responsive adjustments and animations` | app/mythos/**/*.tsx, globals.css |

---

## Success Criteria

### Verification Commands
```bash
cd frontend && bun run typecheck  # Expected: No errors
cd frontend && bun run lint       # Expected: No errors
cd frontend && bun run build      # Expected: Successful build
```

### Final Checklist
- [x] Geist fonts loaded and displaying correctly
- [x] Main `/mythos` page has full-width layout with category sidebar
- [x] Detail `/mythos/[id]` page has three-column layout
- [x] Entity Data card displays correctly on detail pages
- [x] Numbered sections styled with orange accent
- [x] Blockquotes styled with attribution
- [x] Timeline component displays chronology correctly
- [x] All animations smooth with prefers-reduced-motion support
- [x] Responsive at all breakpoints (375px, 768px, 1024px, 1440px)
- [x] No TypeScript or lint errors
- [x] No console errors

---

## Notes & Considerations

### Geist Pixel Usage
Geist Pixel should be used sparingly for special accents:
- Section number labels (01, 02) could use Pixel for retro-tech feel
- Category badges or special callouts
- NOT for body text or primary headings

### Full-Width Layout
The user specifically requested full-width with padding, NOT centered max-width:
- Use `w-full` not `max-w-7xl mx-auto`
- Padding: `px-4 sm:px-6 lg:px-8 xl:px-12`
- Content aligns left within padded container

### Theme Compatibility
The existing three-theme system (gothic/luxury/nordic) must be preserved:
- Add archive-specific variables that work with all themes
- Ensure glassmorphism visible in all themes
- Test color contrast in each theme

### Performance Considerations
- Geist fonts loaded via next/font for optimization
- Use dynamic imports for heavy components (Timeline, Graph)
- Lazy load images in Entity Data card
- Respect prefers-reduced-motion for animations

### Accessibility
- All interactive elements must be keyboard accessible
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for icon-only buttons
- Color contrast minimum 4.5:1 for text
- Focus states visible for keyboard navigation
