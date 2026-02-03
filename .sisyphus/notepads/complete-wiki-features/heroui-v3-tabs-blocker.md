# HeroUI v3 Migration - Major Blocker

## Date: 2026-02-03

## Status: SIGNIFICANT REFACTORING REQUIRED

### Issue
The `SceneTagEditor.tsx` component uses the old HeroUI v2 Tabs API which is completely incompatible with HeroUI v3 beta.

### Old API (v2)
```tsx
<Tabs selectedKey={activeTab} onSelectionChange={...}>
  <Tab key="warnings" title={<div>...tab header...</div>}>
    {<div>...tab content...</div>}
  </Tab>
</Tabs>
```

### New API (v3)
```tsx
<Tabs>
  <Tabs.List>
    <Tabs.Tab id="warnings">Tab Header</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="warnings">
    {<div>...tab content...</div>}
  </Tabs.Panel>
</Tabs>
```

### Impact
This requires a complete rewrite of the SceneTagEditor component's tab structure, not just simple prop changes.

### Components Affected
- `SceneTagEditor.tsx` - Uses Tabs with title prop and inline content
- Potentially other components using Tabs

### Recommendation
This is a substantial change that should be handled as a dedicated task. The component needs:
1. Restructure from inline Tab content to separate Tabs.Panel components
2. Move tab headers from `title` prop to Tabs.Tab children
3. Update state management for tab selection

### Alternative
Consider temporarily disabling or simplifying the SceneTagEditor to allow the build to pass, then revisit with a proper refactor.

### Related Files
- `frontend/components/SceneTagEditor.tsx` - Main file needing rewrite
- `frontend/components/KinkTagSelector.tsx` - Related component (already fixed)

### Current Build Status
Build fails at SceneTagEditor.tsx due to Tabs API incompatibility.
