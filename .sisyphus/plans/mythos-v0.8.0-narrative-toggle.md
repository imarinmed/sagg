# Mythos v0.8.0 - BST/SST Dual Narrative Toggle System

**Milestone**: Implement user-controlled toggle between BST (family-friendly canon) and SST (adult adaptation) content versions

**Status**: Planning
**Created**: 2026-02-07
**Backend Support**: ✅ COMPLETE (models, data structures, API)
**Frontend Support**: ⏳ NOT STARTED

---

## Overview

The Blod Wiki contains two narrative versions:
- **BST** (Blood, Sweat, Tears): Family-friendly Swedish TV series canon
- **SST** (Blood, Sweat, Tears: Sin & Secrets): Adult adaptation with mature themes

**Current State**: Backend fully supports BST/SST data via `NarrativeVersion` enum, SST-specific fields on Character (`kink_profile`, `adaptation_traits`) and MythosElement (`erotic_implications`, `dark_variant`, etc.). Frontend TypeScript types match backend but NO UI for toggling versions exists.

**Goal**: Add frontend toggle system so users can switch between BST and SST content, with age verification, visual indicators, and conditional rendering.

---

## Data Architecture (Already Implemented)

### Backend Models (`backend/src/models.py`)

**NarrativeVersion Enum**:
```python
class NarrativeVersion(str, Enum):
    BST = "bst"  # Family-friendly canon
    SST = "sst"  # Adult adaptation
    BOTH = "both"  # Shared content
```

**Character Model**:
- `canonical_traits: list[str]` - BST version traits
- `adaptation_traits: list[str]` - SST version traits
- `kink_profile: KinkProfile | None` - SST-exclusive (preferences, limits, evolution, dynamics, consent)

**MythosElement Model**:
- Shared fields: id, name, category, description, traits, abilities, weaknesses
- SST-exclusive: `dark_variant`, `erotic_implications`, `horror_elements`, `taboo_potential`

**Scene Model**:
- `scene_tags: SceneTags | None` - SST-exclusive (content warnings, kink descriptors, intensity rating)

### Frontend Types (`frontend/lib/api.ts`)

**✅ TypeScript interfaces already match backend models** - no type changes needed.

---

## Implementation Tasks

### Task 13: Global Narrative Toggle Component

**Objective**: Create UI component for users to switch between BST ↔ SST versions

**Requirements**:
- [ ] Create React Context for narrative version state (`NarrativeContext`)
  - State: `version: 'bst' | 'sst'`
  - Methods: `setVersion()`, `toggleVersion()`
  - Persist preference in localStorage key: `blod-narrative-version`
  - Default: `bst` (family-friendly)

- [ ] Create provider component (`NarrativeProvider`)
  - Wrap app in `/frontend/app/layout.tsx`
  - Load persisted preference on mount
  - Prevent SSR hydration mismatch (use `useEffect` for localStorage)

- [ ] Create toggle UI component (`NarrativeToggle`)
  - Position: Top navigation bar (next to theme toggle)
  - Design: HeroUI `Button` with `variant="soft"` toggle
  - Labels: "BST (Canon)" and "SST (Adaptation)"
  - Icon: Book icon for BST, Flame icon for SST
  - State indicator: Golden accent for BST, Crimson accent for SST

- [ ] Add age verification gate
  - Modal dialog when switching to SST for first time
  - Checkbox: "I am 18+ and consent to view mature content"
  - Persist consent in localStorage: `blod-sst-consent`
  - Block SST access until consent given

**Files to Create/Modify**:
- `/frontend/lib/narrative-context.tsx` (NEW)
- `/frontend/components/NarrativeToggle.tsx` (NEW)
- `/frontend/app/layout.tsx` (MODIFY - wrap with provider)

**Verification**:
- [ ] Toggle persists across page refreshes
- [ ] Age gate appears on first SST switch
- [ ] No console errors or TypeScript issues
- [ ] Build succeeds: `bun run build`

---

### Task 14: Version-Specific Content Rendering

**Objective**: Conditionally show/hide content based on selected narrative version

**Requirements**:
- [ ] Create conditional rendering utilities
  - `useNarrative()` hook to access context
  - `<ShowInVersion version="bst|sst|both">` wrapper component
  - `isBST()`, `isSST()` helper functions

- [ ] Update Character Pages (`/frontend/app/characters/[id]/page.tsx`)
  - Show `canonical_traits` in BST mode
  - Show `adaptation_traits` in SST mode
  - Conditionally render `kink_profile` section (SST-only)
  - Add section headers: "Canonical Traits (BST)" vs "Adaptation Traits (SST)"

- [ ] Update Mythos Pages
  - Main mythos page (`/frontend/app/mythos/page.tsx`)
  - Element detail pages (if they exist)
  - Hide SST fields in BST mode: `dark_variant`, `erotic_implications`, `horror_elements`, `taboo_potential`
  - Show all fields in SST mode with clear labeling

- [ ] Update Episode/Scene Pages (if applicable)
  - Hide scenes with `scene_tags` in BST mode
  - Show content warnings in SST mode

**Files to Create/Modify**:
- `/frontend/lib/narrative-utils.tsx` (NEW - hooks and components)
- `/frontend/app/characters/[id]/page.tsx` (MODIFY)
- `/frontend/app/mythos/page.tsx` (MODIFY)
- Any other pages displaying character/mythos data

**Verification**:
- [ ] Switching versions updates visible content instantly
- [ ] SST-only fields hidden in BST mode
- [ ] No errors when SST fields are null/undefined
- [ ] TypeScript clean: `bun run typecheck`
- [ ] Build succeeds: `bun run build`

---

### Task 15: Visual Indicators & Warnings

**Objective**: Add visual cues to distinguish BST vs SST content

**Requirements**:
- [ ] Create badge components
  - `<NarrativeBadge version="bst|sst" />` using HeroUI `Chip`
  - BST badge: Gold color (`#D4AF37`), "Canon" label
  - SST badge: Crimson color (`#8B0000`), "Adaptation" label
  - Size: `sm` for inline, `md` for headers

- [ ] Add badges to content sections
  - Character trait sections
  - Mythos element descriptions
  - Episode/scene cards (if showing version-specific content)

- [ ] Create content warning component (SST mode)
  - `<ContentWarning warnings={string[]} intensity={1-5} />`
  - Red alert box with warning icon
  - Collapsible details
  - Position: Top of SST-exclusive content sections

- [ ] Add color coding to UI
  - BST mode: Golden accents (`--color-accent-primary`)
  - SST mode: Crimson accents (`--color-accent-secondary`)
  - Apply to: Toggle button, section headers, badges

- [ ] Add help tooltip to toggle
  - Explain BST vs SST difference
  - Link to documentation/FAQ (if exists)

**Files to Create/Modify**:
- `/frontend/components/NarrativeBadge.tsx` (NEW)
- `/frontend/components/ContentWarning.tsx` (NEW)
- All pages modified in Task 14 (add badges)
- `/frontend/app/globals.css` (may need color overrides)

**Verification**:
- [ ] Badges display correct colors and labels
- [ ] Content warnings show for SST-exclusive sections
- [ ] Color accents update when switching versions
- [ ] Tooltip provides helpful context
- [ ] All components use HeroUI v3 patterns (no deprecated props)
- [ ] Build succeeds: `bun run build`

---

## Testing Checklist

After implementing all three tasks:

### Functional Tests
- [ ] Toggle switches between BST ↔ SST successfully
- [ ] Age verification gate appears on first SST switch
- [ ] Preference persists across page refresh
- [ ] Consent persists across sessions
- [ ] Character pages show correct traits for version
- [ ] Mythos pages hide/show SST fields correctly
- [ ] No errors in browser console

### Build Tests
- [ ] TypeScript typecheck passes: `bun run typecheck`
- [ ] Production build succeeds: `bun run build`
- [ ] No LSP diagnostics errors: Check project-level diagnostics
- [ ] Frontend dev server runs without warnings

### Visual Tests
- [ ] Badges display with correct colors
- [ ] Toggle button shows active state
- [ ] Content warnings render properly
- [ ] Color accents match theme
- [ ] No layout shifts when switching versions

### Edge Cases
- [ ] Handles missing SST fields gracefully (null/undefined)
- [ ] Works when character has no `kink_profile`
- [ ] Works when mythos element has no SST fields
- [ ] Age gate doesn't re-trigger after consent given
- [ ] No flash of wrong version on page load

---

## Implementation Strategy

### Phase 1: Foundation (Task 13)
1. Create React Context and provider
2. Add toggle UI component to navigation
3. Implement age verification gate
4. Test state persistence

### Phase 2: Content Rendering (Task 14)
1. Create utility hooks and components
2. Update character pages first (most visible)
3. Update mythos pages
4. Test all content switches correctly

### Phase 3: Visual Polish (Task 15)
1. Create badge and warning components
2. Add badges to all relevant sections
3. Implement color coding
4. Add tooltip to toggle
5. Final visual QA

---

## Technical Constraints

### HeroUI v3 API (Must Follow)
- `Chip` component variants: `primary | secondary | tertiary | soft` (NO "flat" or "outline")
- `Button` component variants: `primary | secondary | tertiary | soft | outline | danger | ghost`
- NO `as` prop - use wrapper `<Link><Button></Button></Link>` pattern
- Use `Modal` (NOT `Dialog` - doesn't exist in v3)

### Theme System
- BST accent: `var(--color-accent-primary)` (#D4AF37 gold)
- SST accent: `var(--color-accent-secondary)` (#8B0000 crimson)
- Gothic effects: `.glass-card`, `.blood-glow`, `.fog-overlay`

### Next.js 15 + React 19
- Server components by default - add `"use client"` for state/context
- LocalStorage access MUST be in `useEffect` to avoid SSR hydration mismatch
- State updates must not cause layout shifts

---

## Success Criteria

**Task 13**: User can toggle between BST and SST with preference persisted. Age gate blocks SST until consent given.

**Task 14**: All pages show/hide content correctly based on version. No errors when SST fields missing.

**Task 15**: Visual indicators clearly distinguish BST from SST content. Color accents update with version.

**Overall**: Users can seamlessly switch between family-friendly and adult content versions with clear visual feedback and appropriate safeguards.

---

## Notes

- Backend API does NOT need changes - all data structures already support BST/SST
- Some endpoints may support `?version=bst/sst` query param but NOT required for v0.8.0 (client-side filtering sufficient)
- Focus on CHARACTER and MYTHOS pages first (most visible BST/SST differences)
- Episode/scene filtering is lower priority (may defer to v0.9.0)
- Consider adding "Report Issue" link for content misclassification

---

## Notepad Structure

Created alongside this plan:
```
.sisyphus/notepads/mythos-v0.8.0/
  learnings.md    # Implementation patterns, component conventions
  decisions.md    # Architecture choices, trade-offs
  issues.md       # Problems encountered, workarounds
  problems.md     # Unresolved blockers
```

Subagents MUST append findings to appropriate notepad after completing tasks.
