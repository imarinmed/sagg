# HeroUI v3 Tabs Pattern

## Migration from v2 to v3

### Old v2 API (Deprecated)
```tsx
import { Tabs, Tab } from "@heroui/react";

<Tabs selectedKey={activeTab} onSelectionChange={...}>
  <Tab key="tab1" title={<div>Tab Header</div>}>
    <div>Tab Content</div>
  </Tab>
</Tabs>
```

### New v3 API (Compound Components)
```tsx
import { Tabs } from "@heroui/react";

<Tabs selectedKey={activeTab} onSelectionChange={...}>
  <Tabs.ListContainer>
    <Tabs.List aria-label="Tab categories">
      <Tabs.Tab id="tab1">
        <div>Tab Header</div>
        <Tabs.Indicator />
      </Tabs.Tab>
    </Tabs.List>
  </Tabs.ListContainer>
  
  <Tabs.Panel id="tab1">
    <div>Tab Content</div>
  </Tabs.Panel>
</Tabs>
```

## Key Changes

1. **Import**: Only import `Tabs`, no separate `Tab` component
2. **Structure**: Use compound component pattern with `Tabs.ListContainer`, `Tabs.List`, `Tabs.Tab`, `Tabs.Indicator`, `Tabs.Panel`
3. **Identification**: Use `id` prop instead of `key` for tabs and panels
4. **Headers**: Move from `title` prop to children of `Tabs.Tab`
5. **Content**: Move to separate `Tabs.Panel` components with matching `id`
6. **Indicator**: Add `<Tabs.Indicator />` inside each `Tabs.Tab` for visual indicator

## API Reference

### Tabs Props
- `selectedKey`: Controlled selected tab key
- `defaultSelectedKey`: Default selected tab key
- `onSelectionChange`: Selection change handler
- `variant`: "primary" | "secondary"
- `orientation`: "horizontal" | "vertical"

### Tabs.Tab Props
- `id`: Unique tab identifier (required)
- `isDisabled`: Whether tab is disabled

### Tabs.Panel Props
- `id`: Panel identifier matching tab id (required)

## Common Issues

### Button API Changes
- `variant="light"` → `variant="ghost"`
- `color="success"` → `className="text-success"`
- `color="danger"` → `className="text-danger"`

### TextArea API Changes
- No `label` prop - use separate `<Label>` component or custom label markup
- No `size` prop - use Tailwind classes instead
