# Task 6: Taboo Content Tag Styling

## Summary
Created special visual treatment for taboo content tags with blood-hued border glow effect across all three themes.

## Implementation

### Components Created
- **TabooTag.tsx**: New component with blood-hued styling
  - Supports removable state with X button
  - Uses Inter font for typography
  - Smooth hover transitions
  - Accessible focus states

### CSS Added to globals.css
Added taboo tag CSS variables and styles:
- `--taboo-border`: Blood-hued border color
- `--taboo-glow`: Subtle glow effect color
- `--taboo-glow-strong`: Enhanced glow on hover
- `--taboo-bg`: Dark background to make border pop
- `--taboo-text`: Text color per theme

### Theme-Specific Colors
- **Gothic**: Deep crimson #8B0000
- **Luxury**: Wine burgundy #722F37  
- **Nordic**: Dried blood #4A0404

### Integration with KinkTagSelector
- Added `tabooCategories` array to identify taboo content
- Taboo tags now render with TabooTag component
- Regular tags continue using existing Chip styling

## Visual Design
- Blood/wine hues (not bright warning red)
- Subtle box-shadow glow effect
- Dark background for contrast
- Elegant, mature appearance
- Not alarming or warning-like

## Files Modified
1. Created: `frontend/components/TabooTag.tsx`
2. Modified: `frontend/app/globals.css` (added taboo styles)
3. Modified: `frontend/components/KinkTagSelector.tsx` (integrated TabooTag)

## Build Status
✓ Build passes successfully
