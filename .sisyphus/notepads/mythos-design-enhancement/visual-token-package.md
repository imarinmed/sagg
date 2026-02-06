# Mythos Premium Visual Language Parity Package

> **Status**: Draft
> **Date**: 2026-02-06
> **Source**: Task 2 / Mythos Design Enhancement Plan

## 1. Executive Summary

This package defines the visual standards required to elevate the `/mythos` section from a "functional database" to a "cinematic encyclopedia." It establishes strict parity with the Landing and Character pages by enforcing specific token usage, editorial typography, and atmospheric depth while explicitly constraining generic patterns (e.g., the "anti-purple" rule).

## 2. Token Map & Usage

### 2.1. Color Hierarchy (The "Anti-Purple" Protocol)
**Constraint**: Purple (`--training-purple`, `--shadow-purple`) is restricted to *specific* semantic meanings (Training/Magic) and must NOT be used for general UI chrome, borders, or backgrounds.

| Semantic Role | Token | Usage Rule |
| :--- | :--- | :--- |
| **Primary Brand** | `var(--nordic-gold)` | Key actions, active states, primary borders, hero text emphasis. |
| **Narrative Tension** | `var(--blood-crimson)` | "Taboo" tags, danger warnings, critical lore implications, hover accents. |
| **Surface Base** | `var(--polar-night)` | Page background. NEVER pure black (`#000`). Always textured. |
| **Surface Layer** | `var(--glass-bg)` | Cards, panels. Must use backdrop-blur. |
| **Text Body** | `var(--color-text-secondary)` | Standard reading text. High readability required. |
| **Text Headings** | `var(--color-text-primary)` | Titles, section headers. |
| **Muted/Meta** | `var(--color-text-muted)` | Metadata, timestamps, secondary labels. |

### 2.2. Typography Scale (Editorial)
Shift from "Dashboard" (Inter-heavy) to "Editorial" (Cormorant-led).

| Component | Font Family | Token | Usage |
| :--- | :--- | :--- | :--- |
| **Page Title** | Cormorant | `text-4xl` / `text-5xl` | Hero section only. Tracking `wide`. |
| **Section Header** | Cormorant | `text-2xl` | Major module dividers (e.g., "Core Traits"). |
| **Card Title** | Cormorant | `text-xl` | Grid items. |
| **Body Copy** | Inter | `text-base` | Long-form descriptions. `leading-relaxed`. |
| **UI Labels** | Inter | `text-xs` / `text-sm` | Chips, buttons, metadata. `tracking-wider`. |
| **Data/Code** | JetBrains | `text-xs` | IDs, technical rules, stats. |

### 2.3. Spacing & Rhythm
Move from tight "data density" to "museum gallery" spacing.

| Token | Value | Usage |
| :--- | :--- | :--- |
| **Section Gap** | `gap-12` / `py-16` | Between major page bands (Hero -> Grid -> Graph). |
| **Module Gap** | `gap-6` / `gap-8` | Between cards in a grid. |
| **Content Pad** | `p-6` / `p-8` | Inside glass cards. |
| **Text Stack** | `space-y-4` | Between paragraphs/elements in body. |

### 2.4. Elevation & Depth
Parity with Landing Page 3D effects.

| Level | Class | Visual Effect | Usage |
| :--- | :--- | :--- | :--- |
| **Base** | `.glass` | Flat glass, subtle border. | Standard cards, filters. |
| **Floating** | `.glass-premium` | Higher blur, lighter border, shadow. | Featured/Hero cards. |
| **Interactive** | `.hover-lift` | Y-translate (-4px), shadow bloom. | Clickable cards. |
| **3D** | `.card-3d` | Perspective tilt (optional). | Hero featured item only. |

## 3. Component Visual Specs

### 3.1. Mythos Card (Grid Item)
*   **Container**: `aspect-[2/3]` (vertical cinematic) or `aspect-[16/9]` (landscape editorial).
*   **Border**: `1px solid var(--color-border-subtle)`.
*   **Hover**: Border becomes `var(--nordic-gold)` (30% opacity). Image scales 1.05x.
*   **Typography**: Title in `font-heading`, bottom-aligned or overlay.
*   **Meta**: Category icon + name in `text-xs` `font-mono` top-right.

### 3.2. Encyclopedia Header (List Page)
*   **Layout**: Split 60/40 or Centered.
*   **Background**: `bg-texture-pattern` visible through glass.
*   **Controls**: NOT hidden in tabs. Exposed as a "Control Bar" (Search + Chips).

### 3.3. Detail View Header
*   **Layout**: Hero banner with blurred background image.
*   **Title**: Large, centered or left-aligned `font-heading`.
*   **Badges**: "Pill" shape, `variant="soft"`, using semantic category colors.

## 4. Motion & Interaction Cadence

### 4.1. Entrance Choreography
*   **Global**: `animate-fade-in-up` on page load.
*   **Stagger**: Grid items MUST use `.stagger-1` through `.stagger-10`.
*   **Duration**: `duration-normal` (300ms) for UI, `duration-slow` (500ms) for layout shifts.

### 4.2. Micro-Interactions
*   **Hover**: Instant feedback (`duration-fast`).
*   **Filter Change**: `AnimatePresence` for list reordering. No jarring jumps.
*   **Tabs**: Cross-fade content (`opacity: 0` -> `opacity: 1`).

## 5. Accessibility & Mobile Constraints

### 5.1. Mobile Adaptation
*   **Grid**: Collapses to 1 column (cards) or 2 columns (compact tiles).
*   **Filters**: Collapses into horizontal scroll or drawer.
*   **Typography**: `clamp()` functions handle scaling, but ensure `text-base` never drops below 16px equivalent.
*   **Touch Targets**: All interactive elements min 44px height.

### 5.2. Accessibility Guardrails
*   **Contrast**: Gold text on dark background must pass AA (check opacity).
*   **Focus**: `focus-visible` ring must be `var(--nordic-gold)` and distinct from hover state.
*   **Motion**: Respect `prefers-reduced-motion` (disable staggers/tilts).

## 6. Parity Crosswalk

| Feature | Landing Page (Gold Standard) | Current Mythos (To Fix) | Target Mythos State |
| :--- | :--- | :--- | :--- |
| **Hero** | Cinematic, 3D Posters, Shine | Text + Stats, Flat | Editorial Header, Featured Card |
| **Nav** | Glass Cards, Iconography | Standard Tabs | Integrated Taxonomy Rail |
| **Grid** | Spacious, Hover Effects | Dense, Standard Grid | Gallery Grid, Cinematic Aspect |
| **Type** | Heavy Cormorant Usage | Heavy Inter Usage | Cormorant for all hierarchy |
| **Vibe** | "Movie Poster" | "Admin Dashboard" | "Arcane Encyclopedia" |

## 7. Implementation Checklist (For Tasks 3-9)

- [ ] **Global**: Ensure `bg-texture` is applied to Mythos layouts.
- [ ] **Typography**: Refactor all section headers to `font-heading`.
- [ ] **Cards**: Update `MythosCard` to use `GlassCard` with `hover-lift`.
- [ ] **Filters**: Move out of "Filters" button; expose top-level chips.
- [ ] **Colors**: Audit for purple overuse; replace with Gold/Crimson/Neutral.
- [ ] **Detail**: Add "Hero" visual block at top of `[id]/page.tsx`.
