# Learnings - Mythos v0.8.0 BST/SST Toggle

## Component Patterns

*Document reusable patterns discovered during implementation*

---

## [TIMESTAMP] Task: {task-id}
{findings}

## [2026-02-07] Task 13: Narrative Toggle Component

**LocalStorage Keys**:
- `blod-narrative-version`: "bst" | "sst"
- `blod-sst-consent`: "true" | null

**SSR Hydration Pattern**:
- Used `useEffect` to set `mounted` state to true.
- Rendered `null` or default content until mounted to avoid hydration mismatch.
- Defaulted to 'bst' on server-side render.

**HeroUI Components Used**:
- Modal: Used as a container with custom inner structure (divs) because `ModalContent`, `ModalHeader`, etc. were not available in the installed version.
- Button: Used `variant="ghost"` as `flat` and `soft` were not available in the installed version.
- Checkbox: Used `onChange` (boolean) instead of `onValueChange` or event-based `onChange`.

**Gotchas**:
- HeroUI v3 beta API differences: `Modal` subcomponents missing, `useDisclosure` missing, `Button` variants limited.
- `Checkbox` prop `onChange` takes a boolean directly in this version, unlike standard HTML input.

## [2026-02-07] Task 13 Simplified: Blood Drop Toggle

**Design Pattern**:
- Single Droplet icon (lucide-react)
- Color transition: Red (#8B0000) ↔ White (#FFFFFF)
- No modals, no warnings - just elegant visual cycle

**User Feedback**:
- Original complex age verification removed per user request
- Simplified to pure visual toggle for better UX

**CSS Effects**:
- Scale hover: scale-110
- Color transition: 300ms
- Optional drop-shadow glow

**Implementation Time**: ~15 minutes (major simplification from original)

## [2026-02-07 15:30] Task 13 QA: Narrative Toggle Hands-On Testing

**QA Results: ✅ ALL PASSED**

**Visual Verification**:
- ✅ Blood drop icon visible in navigation bar
- ✅ Button shows "Switch to SST mode" in BST state
- ✅ Button shows "Switch to BST mode" in SST state
- ✅ Click toggles instantly between modes

**State Persistence**:
- ✅ localStorage key `blod-narrative-version` correctly stores "bst" or "sst"
- ✅ Page refresh preserves selected mode
- ✅ Toggle state persists across navigation

**Functionality**:
- ✅ BST → SST: Instant toggle, no modals, no warnings
- ✅ SST → BST: Instant toggle back
- ✅ No console errors
- ✅ No SSR hydration warnings

**Design Implementation**:
- Single Droplet icon from lucide-react
- Color transition smooth (300ms)
- Hover effect working (scale-110)
- Elegant and minimal as requested

**User Requirement Met**: "Just an elegant component that visually cycles between red blood drop (BST) and white drop (SST). Nothing more. No warnings, nothing else." ✅
