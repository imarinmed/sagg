# Blod Dark Adaptation Wiki - Visual Redesign Plan

## TL;DR

> **Quick Summary**: Complete visual transformation of the Blod Dark Adaptation Wiki from generic gray interface to a luxurious three-theme dark aesthetic (Classic Gothic, Modern Luxury, Nordic Noir) with obsidian glass effects, champagne gold accents, and editorial typography.
> 
> **Deliverables**:
> - Three complete theme systems with user selector
> - Custom HeroUI v3 theme configuration with OKLCH colors
> - Typography system: Cormorant Garamond + Inter + JetBrains Mono
> - Glassmorphism component library
> - Asset repository structure in `public/assets/`
> - Special taboo content tag styling (editorial requirement)
> - Animation system (subtle + dramatic)
> - Theme persistence infrastructure
> 
> **Estimated Effort**: Large (8-10 tasks, ~2-3 days)
> **Parallel Execution**: YES - 3 waves (Infrastructure → Components → Polish)
> **Critical Path**: Theme infrastructure → Typography → Core components → Taboo styling

---

## Context

### Original Request
Transform the current "subpar" HeroUI interface into something "sexy, evocatively erotic, elegant, stylish" inspired by obsidian glass, gold and blood hues. Scrape visual assets from SVT Play, IMDb, and Instagram for reference material.

### Interview Summary
**Key Discussions**:
- Asset management: Manual curation (Option B) - user selects images
- Three-theme system: Classic Gothic, Modern Luxury, Nordic Noir
- Typography: Cormorant Garamond (headings) + Inter (body) + JetBrains Mono (mono)
- Content sensitivity: No age verification, no content warnings, special taboo tag styling required
- Animation: Both subtle AND dramatic where appropriate
- Brand: Current "Blod, Svett, Tårar" reference → future "Blod, Svett, Sagg" transition

**Research Findings**:
- Imperial Obsidian color palette with OKLCH values for perceptual uniformity
- Glassmorphism system with 4 blur layers (8px-40px) and noise texture
- Typography pairing strategy with accessibility considerations
- HeroUI v3 theme configuration patterns using CSS custom properties

### Metis Review
**Identified Gaps** (addressed in plan):
- Typography question: Inter vs alternatives → Resolved: Keep Inter for UI, consider Source Serif 4 for article body (decision point in Task 2)
- Taboo content treatment: Not defined → Resolved: Blood-hued border glow treatment
- Component scope: Need explicit list → Resolved: Navigation, Cards, Layout, ThemeSelector, TabooTag
- Animation scope: Need definition → Resolved: Theme transitions (dramatic), hovers (subtle), page load (orchestrated)

---

## Work Objectives

### Core Objective
Transform the generic gray HeroUI interface into a premium, luxurious dark aesthetic that evokes the mood of a vampire's private study — dark, elegant, slightly dangerous, but impeccably refined.

### Concrete Deliverables
1. **Theme Infrastructure**: Three complete theme systems with CSS custom properties
2. **Typography System**: Web fonts with Next.js optimization
3. **Component Library**: Glassmorphism-styled Navigation, Cards, Layout, ThemeSelector
4. **Taboo Content Styling**: Special visual treatment for editorial-required tags
5. **Animation System**: CSS transitions + orchestrated page effects
6. **Asset Repository**: `public/assets/` structure with optimization pipeline
7. **Theme Persistence**: localStorage-based preference system

### Definition of Done
- [ ] All three themes pass WCAG 2.1 AA contrast (≥4.5:1 for body text)
- [ ] Theme switching completes in <300ms with no layout shift
- [ ] Typography renders correctly with no FOUT (flash of unstyled text)
- [ ] Glassmorphism effects work at 60fps (Lighthouse performance ≥85)
- [ ] Taboo content tags display distinct blood-hued border glow
- [ ] Theme preference persists across browser sessions
- [ ] All existing pages display correctly with new styling

### Must Have
- Three theme systems (Classic Gothic, Modern Luxury, Nordic Noir)
- User-accessible theme selector
- Cormorant Garamond for headings
- Glassmorphism cards and navigation
- Taboo content tag styling
- Theme persistence

### Must NOT Have (Guardrails)
- Theme-specific component variants (use CSS variables only)
- Opacity < 0.7 on text backgrounds
- Ambient particle effects or custom cursors
- Page transitions before core styling complete
- Gold accents exceeding 15% of viewport
- Animations that don't respect `prefers-reduced-motion`

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.

### Test Decision
- **Infrastructure exists**: NO (will add minimal test setup)
- **Automated tests**: NO (Agent-Executed QA only)
- **Framework**: None (visual verification via Playwright screenshots)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Frontend/UI** | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot |
| **CSS/Styling** | Bash (curl + grep) | Check computed styles, color values |
| **Typography** | Playwright | Screenshot text rendering, check font-family |
| **Performance** | Lighthouse CLI | Assert performance score ≥85 |

**Each Scenario Format:**
```
Scenario: [Descriptive name]
  Tool: [Playwright / Bash]
  Preconditions: [What must be true]
  Steps:
    1. [Exact action with selector]
    2. [Assertion with expected value]
  Expected Result: [Concrete outcome]
  Evidence: [Screenshot path / output capture]
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Start Immediately):
├── Task 1: Theme Infrastructure (no dependencies)
└── Task 2: Typography System (no dependencies)

Wave 2 (Components - After Wave 1):
├── Task 3: Layout & Navigation (depends: 1, 2)
├── Task 4: Card Components (depends: 1, 2)
└── Task 5: Theme Selector Component (depends: 1, 2)

Wave 3 (Specialized - After Wave 2):
├── Task 6: Taboo Content Styling (depends: 4)
├── Task 7: Animation System (depends: 3, 4, 5)
└── Task 8: Asset Repository (depends: none, can parallel)

Wave 4 (Integration - After Wave 3):
└── Task 9: Page Integration & Polish (depends: 3, 4, 5, 6, 7)

Wave 5 (Final - After Wave 4):
└── Task 10: Performance & Accessibility Audit (depends: 9)

Critical Path: 1 → 2 → 3 → 6 → 9 → 10
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4, 5 | 2, 8 |
| 2 | None | 3, 4, 5 | 1, 8 |
| 3 | 1, 2 | 7, 9 | 4, 5 |
| 4 | 1, 2 | 6, 7, 9 | 3, 5 |
| 5 | 1, 2 | 7, 9 | 3, 4 |
| 6 | 4 | 9 | 7, 8 |
| 7 | 3, 4, 5 | 9 | 6, 8 |
| 8 | None | None | 1, 2 |
| 9 | 3, 4, 5, 6, 7 | 10 | None |
| 10 | 9 | None | None |

---

## TODOs

- [ ] 1. Theme Infrastructure

  **What to do**:
  - Create CSS custom property system for three themes
  - Implement theme switching logic with localStorage persistence
  - Set up data-attribute based theming (`[data-theme="gothic"]`)
  - Define OKLCH color values for all three palettes
  - Create theme type definitions for TypeScript

  **Must NOT do**:
  - Create component-level theme logic (CSS variables only)
  - Add animations (Task 7 handles this)
  - Implement taboo styling (Task 6 handles this)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `vercel-react-best-practices`]
  - **Justification**: CSS architecture and theme system design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `frontend/app/globals.css` - Current minimal CSS
  - HeroUI v3 theming docs - CSS variable patterns
  - OKLCH color format - Perceptual uniformity

  **Acceptance Criteria**:
  - [ ] CSS file with three theme definitions (gothic, luxury, nordic)
  - [ ] localStorage persistence working (set item → refresh → theme persists)
  - [ ] No flash of wrong theme on page load
  - [ ] TypeScript types for theme names

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Theme persistence works correctly
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for page load (timeout: 5s)
      3. Execute in console: localStorage.setItem('theme', 'nordic-noir')
      4. Refresh page
      5. Assert: html[data-theme="nordic-noir"] exists
      6. Assert: No visible flash of default theme
      7. Screenshot: .sisyphus/evidence/task-1-theme-persist.png
    Expected Result: Theme persists across refresh without flash
    Evidence: .sisyphus/evidence/task-1-theme-persist.png
  ```

  **Commit**: YES
  - Message: `feat(theme): add three-theme infrastructure with persistence`
  - Files: `frontend/app/globals.css`, `frontend/lib/theme.ts`

---

- [ ] 2. Typography System

  **What to do**:
  - Configure Next.js font optimization for Cormorant Garamond, Inter, JetBrains Mono
  - Set up CSS custom properties for typography scale
  - Implement fluid typography with `clamp()`
  - Create typography utility classes
  - **DECISION POINT**: Keep Inter for body OR switch to Source Serif 4 for articles?

  **Must NOT do**:
  - Load fonts from external CDNs (use next/font)
  - Apply typography to components (Task 3+ does this)
  - Add accent fonts (out of scope for now)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `vercel-react-best-practices`]
  - **Justification**: Font optimization and CSS architecture

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:
  - Next.js font optimization docs
  - `frontend/app/layout.tsx` - Where fonts are loaded
  - CSS `clamp()` for fluid typography

  **Acceptance Criteria**:
  - [ ] Cormorant Garamond loads for headings
  - [ ] Inter loads for body text
  - [ ] JetBrains Mono loads for monospace
  - [ ] No FOUT (flash of unstyled text) on page load
  - [ ] Typography scale uses fluid sizing

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Fonts load correctly with no FOUT
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000 with clear cache
      2. Wait for page load (timeout: 5s)
      3. Screenshot immediately: .sisyphus/evidence/task-2-font-load-initial.png
      4. Wait additional 3s for font load
      5. Screenshot: .sisyphus/evidence/task-2-font-load-final.png
      6. Assert: h1 font-family contains "Cormorant Garamond"
      7. Assert: body font-family contains "Inter"
      8. Compare screenshots - no visible font swap
    Expected Result: Fonts load without visible flash
    Evidence: Screenshots in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(typography): add Cormorant Garamond + Inter + JetBrains Mono`
  - Files: `frontend/app/layout.tsx`, `frontend/app/globals.css`

---

- [ ] 3. Layout & Navigation

  **What to do**:
  - Redesign Layout component with glassmorphism shell
  - Implement Navigation with glass effect and theme selector placement
  - Create footer styling
  - Ensure responsive behavior
  - Add page transition container

  **Must NOT do**:
  - Add animations (Task 7 handles this)
  - Implement theme selector logic (Task 5 handles this)
  - Style content cards (Task 4 handles this)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `heroui`]
  - **Justification**: Component styling with HeroUI integration

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 7, 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `frontend/components/Layout.tsx` - Current layout
  - `frontend/components/Navigation.tsx` - Current navigation
  - Glassmorphism CSS patterns from research

  **Acceptance Criteria**:
  - [ ] Navigation has glassmorphism effect
  - [ ] Layout has proper dark background
  - [ ] Theme selector slot exists in navigation
  - [ ] Responsive at 375px, 768px, 1440px
  - [ ] No layout shift on theme switch

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Navigation displays correctly across viewports
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 1, 2 complete
    Steps:
      1. Navigate to http://localhost:3000
      2. Set viewport: 375x667 (mobile)
      3. Screenshot: .sisyphus/evidence/task-3-nav-mobile.png
      4. Set viewport: 768x1024 (tablet)
      5. Screenshot: .sisyphus/evidence/task-3-nav-tablet.png
      6. Set viewport: 1440x900 (desktop)
      7. Screenshot: .sisyphus/evidence/task-3-nav-desktop.png
      8. Assert: No horizontal scroll at any viewport
      9. Assert: Glass effect visible (backdrop-filter applied)
    Expected Result: Navigation responsive with glassmorphism at all sizes
    Evidence: Screenshots in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(layout): add glassmorphism navigation and layout shell`
  - Files: `frontend/components/Layout.tsx`, `frontend/components/Navigation.tsx`

---

- [ ] 4. Card Components

  **What to do**:
  - Create glassmorphism Card component variants
  - Style Card.Header, Card.Content, Card.Footer
  - Implement hover states with gold shadow bloom
  - Create episode card, character card, mythos card variants

  **Must NOT do**:
  - Add taboo content styling (Task 6 handles this)
  - Implement card animations (Task 7 handles this)
  - Create new card types beyond styling existing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `heroui`]
  - **Justification**: Component styling and HeroUI override patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 6, 7, 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `frontend/app/page.tsx` - Current card usage
  - `frontend/app/episodes/page.tsx` - Episode cards
  - HeroUI Card component docs

  **Acceptance Criteria**:
  - [ ] Cards have glassmorphism effect
  - [ ] Hover states lift with gold shadow
  - [ ] All three themes apply correctly to cards
  - [ ] Cards work in grid layouts

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Card hover effects work correctly
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 1, 2 complete
    Steps:
      1. Navigate to http://localhost:3000
      2. Screenshot initial state: .sisyphus/evidence/task-4-card-initial.png
      3. Hover over first card
      4. Wait 300ms for transition
      5. Screenshot hover state: .sisyphus/evidence/task-4-card-hover.png
      6. Assert: Card has transform: translateY(-1px) or similar
      7. Assert: Box-shadow visible with gold tint
      8. Assert: No layout shift of surrounding elements
    Expected Result: Card lifts with gold glow on hover
    Evidence: Screenshots in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(components): add glassmorphism card variants`
  - Files: `frontend/components/GlassCard.tsx`, `frontend/app/globals.css`

---

- [ ] 5. Theme Selector Component

  **What to do**:
  - Create ThemeSelector dropdown/button group
  - Connect to theme context/persistence
  - Style selector for all three themes
  - Add visual indicators for active theme

  **Must NOT do**:
  - Implement theme logic (Task 1 handles this)
  - Add selector animations (Task 7 handles this)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `heroui`]
  - **Justification**: Interactive component with state management

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 7, 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `frontend/components/ThemeToggle.tsx` - Current theme toggle
  - HeroUI Select/Button components

  **Acceptance Criteria**:
  - [ ] Selector displays all three themes
  - [ ] Clicking theme switches immediately
  - [ ] Active theme visually indicated
  - [ ] Selector accessible via keyboard

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Theme selector switches themes correctly
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 1, 2, 3 complete
    Steps:
      1. Navigate to http://localhost:3000
      2. Click theme selector
      3. Select "Modern Luxury" theme
      4. Wait 300ms for transition
      5. Screenshot: .sisyphus/evidence/task-5-theme-luxury.png
      6. Assert: html[data-theme="luxury"] exists
      7. Assert: Background color changed to luxury palette
      8. Click theme selector again
      9. Select "Nordic Noir" theme
      10. Assert: html[data-theme="nordic"] exists
    Expected Result: Theme switches correctly with visual change
    Evidence: Screenshots in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(components): add theme selector with three options`
  - Files: `frontend/components/ThemeSelector.tsx`

---

- [ ] 6. Taboo Content Styling

  **What to do**:
  - Create special visual treatment for taboo content tags
  - Implement blood-hued border glow effect
  - Ensure treatment works across all three themes
  - Style KinkTagSelector and related components
  - Make treatment CSS-only (no JS required)

  **Must NOT do**:
  - Add content warnings or age gates
  - Implement hover-to-reveal behavior
  - Use opacity < 0.7 on text

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `heroui`]
  - **Justification**: Specialized component styling with editorial requirements

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 2)
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `frontend/components/KinkTagSelector.tsx` - Current tag selector
  - `frontend/components/SceneTagEditor.tsx` - Tag editor
  - Blood-hued color values from research

  **Acceptance Criteria**:
  - [ ] Taboo tags have distinct blood-hued border glow
  - [ ] Treatment visible in all three themes
  - [ ] No JavaScript required for visual state
  - [ ] Treatment doesn't impact readability

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Taboo content tags display special styling
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 1, 2, 4 complete
    Steps:
      1. Navigate to http://localhost:3000/characters/1 (or page with taboo tags)
      2. Screenshot: .sisyphus/evidence/task-6-taboo-tags.png
      3. Assert: Taboo tags have border-color with crimson hue
      4. Assert: Box-shadow visible with crimson glow
      5. Assert: Text remains readable (contrast ≥4.5:1)
      6. Switch to each theme
      7. Assert: Taboo styling visible in all themes
    Expected Result: Taboo tags have distinct blood-hued treatment
    Evidence: Screenshots in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(ui): add blood-hued styling for taboo content tags`
  - Files: `frontend/components/KinkTagSelector.tsx`, `frontend/app/globals.css`

---

- [ ] 7. Animation System

  **What to do**:
  - Implement theme transition animation (dramatic)
  - Add card hover animations (subtle)
  - Create page load orchestration
  - Add scroll-triggered reveals where appropriate
  - Respect `prefers-reduced-motion`

  **Must NOT do**:
  - Add ambient background animations
  - Implement custom cursor effects
  - Add sound or haptic feedback

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
  - **Justification**: CSS animations and transitions

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 2)
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - CSS transitions and keyframes
  - `prefers-reduced-motion` media query

  **Acceptance Criteria**:
  - [ ] Theme transition completes in <300ms
  - [ ] Card hovers have smooth transitions
  - [ ] Page load has orchestrated reveal
  - [ ] Animations respect reduced motion preference

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Theme transition animation works smoothly
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 1, 3, 5 complete
    Steps:
      1. Navigate to http://localhost:3000
      2. Record video of viewport (3 seconds)
      3. Click theme selector
      4. Select different theme
      5. Stop recording
      6. Assert: Transition completes within 300ms
      7. Assert: No layout shift during transition
      8. Save video: .sisyphus/evidence/task-7-theme-transition.mp4
    Expected Result: Smooth theme transition without jank
    Evidence: Video in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(animation): add theme transitions and hover effects`
  - Files: `frontend/app/globals.css`, `frontend/lib/animations.ts`

---

- [ ] 8. Asset Repository

  **What to do**:
  - Create `public/assets/` directory structure
  - Set up image optimization pipeline
  - Create metadata schema for assets
  - Document asset curation workflow
  - Add placeholder/fallback system

  **Must NOT do**:
  - Scrape images automatically (manual curation per user request)
  - Implement CDN integration (local assets only for now)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`frontend-ui-ux`]
  - **Justification**: File organization and documentation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - Next.js public directory conventions
  - Image optimization best practices

  **Acceptance Criteria**:
  - [ ] Directory structure created
  - [ ] Metadata schema documented
  - [ ] Placeholder system working
  - [ ] README with curation workflow

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Asset repository structure exists
    Tool: Bash
    Preconditions: None
    Steps:
      1. List directory: ls -la frontend/public/assets/
      2. Assert: Directory exists
      3. Assert: Subdirectories exist (posters/, episodes/, characters/)
      4. Assert: README.md exists with curation instructions
      5. Assert: placeholder.svg exists in each subdirectory
    Expected Result: Asset repository structure in place
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `chore(assets): create asset repository structure`
  - Files: `frontend/public/assets/`, `frontend/public/assets/README.md`

---

- [ ] 9. Page Integration & Polish

  **What to do**:
  - Apply new styling to all existing pages
  - Update home page with glassmorphism cards
  - Style episodes page
  - Style characters page
  - Style mythos page
  - Style graph page
  - Ensure all components use new theme system

  **Must NOT do**:
  - Add new page functionality
  - Change page routing
  - Modify API calls

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `heroui`]
  - **Justification**: Integration and consistency across pages

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3, 4, 5, 6, 7

  **References**:
  - All page files in `frontend/app/`
  - Component files in `frontend/components/`

  **Acceptance Criteria**:
  - [ ] All pages display with new styling
  - [ ] No broken layouts
  - [ ] All three themes work on all pages
  - [ ] Navigation works between pages

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: All pages display correctly with new styling
    Tool: Playwright (playwright skill)
    Preconditions: All previous tasks complete
    Steps:
      1. Navigate to each page: /, /episodes, /characters, /mythos, /graph
      2. Screenshot each page in each theme (15 screenshots total)
      3. Assert: No console errors
      4. Assert: No broken layouts
      5. Assert: Navigation works between pages
      6. Save screenshots: .sisyphus/evidence/task-9-page-*.png
    Expected Result: All pages styled consistently
    Evidence: Screenshots in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `feat(pages): apply new styling to all pages`
  - Files: All page files in `frontend/app/`

---

- [ ] 10. Performance & Accessibility Audit

  **What to do**:
  - Run Lighthouse performance audit
  - Verify WCAG 2.1 AA contrast compliance
  - Check glassmorphism performance impact
  - Verify font loading performance
  - Document any issues found

  **Must NOT do**:
  - Fix issues beyond simple tweaks (create follow-up tasks)
  - Add new features to address issues

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]
  - **Justification**: Automated testing and verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (final)
  - **Blocks**: None
  - **Blocked By**: Task 9

  **References**:
  - Lighthouse CI
  - WCAG 2.1 AA guidelines
  - Playwright for automated testing

  **Acceptance Criteria**:
  - [ ] Lighthouse performance score ≥85
  - [ ] All body text has contrast ≥4.5:1
  - [ ] No critical accessibility violations
  - [ ] Glassmorphism doesn't cause jank

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Performance meets requirements
    Tool: Bash (Lighthouse CLI)
    Preconditions: Production build complete
    Steps:
      1. Build: cd frontend && bun run build
      2. Start: bun run start
      3. Run: npx lighthouse http://localhost:3000 --output=json
      4. Assert: categories.performance.score >= 0.85
      5. Assert: categories.accessibility.score >= 0.90
      6. Save report: .sisyphus/evidence/task-10-lighthouse.json
    Expected Result: Performance ≥85, Accessibility ≥90
    Evidence: Lighthouse report in .sisyphus/evidence/
  ```

  ```
  Scenario: Contrast meets WCAG AA
    Tool: Playwright (playwright skill)
    Preconditions: All pages styled
    Steps:
      1. Navigate to http://localhost:3000
      2. Execute axe-core contrast check
      3. Assert: No contrast violations for body text
      4. Test all three themes
      5. Save report: .sisyphus/evidence/task-10-contrast.json
    Expected Result: All themes pass WCAG AA contrast
    Evidence: Axe report in .sisyphus/evidence/
  ```

  **Commit**: YES
  - Message: `chore(a11y): performance and accessibility audit`
  - Files: Documentation of issues found

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(theme): add three-theme infrastructure` | globals.css, lib/theme.ts | Theme persistence test |
| 2 | `feat(typography): add Cormorant + Inter + JetBrains` | layout.tsx, globals.css | Font loading test |
| 3 | `feat(layout): add glassmorphism navigation` | Layout.tsx, Navigation.tsx | Responsive screenshots |
| 4 | `feat(components): add glassmorphism cards` | GlassCard.tsx, globals.css | Hover effect test |
| 5 | `feat(components): add theme selector` | ThemeSelector.tsx | Theme switching test |
| 6 | `feat(ui): add taboo content styling` | KinkTagSelector.tsx, globals.css | Taboo tag screenshot |
| 7 | `feat(animation): add transitions and effects` | globals.css, lib/animations.ts | Transition video |
| 8 | `chore(assets): create asset repository` | public/assets/ | Directory structure |
| 9 | `feat(pages): apply styling to all pages` | app/**/*.tsx | Page screenshots |
| 10 | `chore(a11y): performance audit` | docs/audit.md | Lighthouse report |

---

## Success Criteria

### Verification Commands
```bash
# Build verification
cd frontend && bun run build
# Expected: Build succeeds with no errors

# Theme persistence
curl -s http://localhost:3000 | grep -o 'data-theme="[^"]*"'
# Expected: Shows current theme attribute

# Font loading
curl -s http://localhost:3000 | grep -o 'font-family:[^;]*'
# Expected: Contains Cormorant Garamond and Inter

# Performance
npx lighthouse http://localhost:3000 --only-categories=performance --output=json | jq '.categories.performance.score'
# Expected: >= 0.85
```

### Final Checklist
- [ ] All three themes work correctly
- [ ] Theme persistence across sessions
- [ ] Typography renders with no FOUT
- [ ] Glassmorphism effects at 60fps
- [ ] Taboo content tags have blood-hued styling
- [ ] All pages styled consistently
- [ ] Performance score ≥85
- [ ] WCAG AA contrast compliance
- [ ] No console errors
- [ ] Responsive at all breakpoints
