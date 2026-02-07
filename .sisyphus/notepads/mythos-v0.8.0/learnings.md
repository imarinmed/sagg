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
