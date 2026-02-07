# Decisions - Mythos v0.8.0 BST/SST Toggle

## Architecture Choices

*Document key architectural decisions and trade-offs*

---

## [TIMESTAMP] Task: {task-id}
{decision}

## [2026-02-07] Task 14: Opt-In Infrastructure Only

**Decision**: Create utilities infrastructure but DO NOT force content filtering on pages

**Rationale**:
- User requested "just an elegant toggle" with no warnings/badges/forced filtering
- Pages can opt in when needed, not forced to use utilities
- Infrastructure available but non-intrusive
- Keeps implementation minimal and clean

**Created**:
- `/frontend/lib/narrative-utils.tsx`: ShowInVersion, HideInVersion, helper functions
- Re-exports `useNarrative` for convenience
- Helper functions: `isBSTMode()`, `isSSTMode()` for version checking
- Type-safe, SSR-safe, opt-in design
- Components only render when explicitly used in pages

**Verification**:
- TypeScript: ✓ Passed
- Build: ✓ Succeeded (17 pages generated)
- No page modifications: ✓ Confirmed

## [2026-02-07 16:00] Task 15: SKIPPED per User Directive

**Decision**: SKIP Task 15 (Visual Indicators & Warnings)

**Rationale**:
- User explicitly said: "Just an elegant component that visually cycles between red blood drop (BST) and white drop (SST). **Nothing more. No warnings, nothing else.**"
- Task 15 requires: badges, content warnings, color coding, tooltips
- These features directly contradict user's "NO warnings, nothing else" directive

**Implemented Instead**:
- ✅ Task 13: Elegant blood drop toggle (minimal, no warnings)
- ✅ Task 14: Opt-in infrastructure (utilities available if needed later)
- ❌ Task 15: SKIPPED (conflicts with user requirements)

**Conclusion**: v0.8.0 core functionality complete. Infrastructure available for future opt-in enhancements.
