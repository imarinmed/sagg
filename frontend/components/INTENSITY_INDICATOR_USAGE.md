# IntensityIndicator Component Usage Guide

The `IntensityIndicator` component provides visual representation of intensity levels (1-5) with three distinct variants optimized for different use cases.

## Basic Usage

```tsx
import { IntensityIndicator } from '@/components/IntensityIndicator';

// Default: bar variant
<IntensityIndicator intensity={3} />

// With numeric value
<IntensityIndicator intensity={4} showValue />

// Different variant
<IntensityIndicator intensity={2} variant="flames" />
<IntensityIndicator intensity={5} variant="heatmap" />
```

## Variants

### 1. Bar Variant (Default)
Progress bar with color gradient, ideal for showing intensity in context of other information.

```tsx
<IntensityIndicator 
  intensity={3} 
  variant="bar" 
  showValue 
/>
```

**Use cases:**
- Scene intensity in timeline
- Content filter intensity level
- Episode intensity overview
- Intensity distribution charts

### 2. Flames Variant
5 flame icons with filled/unfilled status, compact and visually interesting.

```tsx
<IntensityIndicator 
  intensity={4} 
  variant="flames"
  showValue={false}
/>
```

**Use cases:**
- Timeline compact view
- Quick visual scan in lists
- Mobile/responsive layouts
- Category badges

### 3. Heatmap Variant
Single colored dot with glow effect and intensity label, most compact option.

```tsx
<IntensityIndicator 
  intensity={2} 
  variant="heatmap" 
  showValue
/>
```

**Use cases:**
- Dense grid layouts
- Character intensity indicator
- Scene list summaries
- Search result highlights

## Using Exported Variants

Pre-configured variant components for convenience:

```tsx
import { 
  IntensityBar, 
  IntensityFlames, 
  IntensityHeatmap 
} from '@/components/IntensityIndicator';

<IntensityBar intensity={3} />
<IntensityFlames intensity={2} showValue />
<IntensityHeatmap intensity={5} />
```

## Props Reference

```typescript
interface IntensityIndicatorProps {
  intensity: number;              // Required: 1-5 (auto-clamped)
  variant?: 'bar' | 'flames' | 'heatmap';  // Defaults to 'bar'
  showValue?: boolean;            // Defaults to false
}
```

### intensity
- **Required**: `number`
- **Range**: 1-5 (values outside range are automatically clamped)
- **Examples**: `1`, `2.5` (rounded to 3), `10` (clamped to 5)

### variant
- **Optional**: `'bar' | 'flames' | 'heatmap'`
- **Default**: `'bar'`
- **bar**: Progress bar (recommended for prominence)
- **flames**: Flame icons (recommended for visual interest)
- **heatmap**: Colored dot (recommended for compactness)

### showValue
- **Optional**: `boolean`
- **Default**: `false`
- Shows numeric value (e.g., "3/5")
- Useful for transparency in critical contexts

## Color Gradient

| Intensity | Color | Label | Use |
|-----------|-------|-------|-----|
| 1 | Blue-500 | "Low" | Mild scenes |
| 2 | Cyan-500 | "Mild" | Light content |
| 3 | Yellow-500 | "Moderate" | Standard scenes |
| 4 | Orange-500 | "High" | Intense content |
| 5 | Red-600 | "Extreme" | Maximum intensity |

## Real-World Examples

### Scene Moment Card
```tsx
<Card>
  <CardContent>
    <h3>Night Club Scene</h3>
    <p>Music, dance, vampire encounter</p>
    <IntensityIndicator intensity={4} variant="flames" />
  </CardContent>
</Card>
```

### Content Filtering
```tsx
<div className="flex items-center justify-between">
  <span>Adult Content Filter</span>
  <IntensityIndicator 
    intensity={filterLevel} 
    variant="heatmap"
    showValue 
  />
</div>
```

### Scene Timeline
```tsx
{scenes.map(scene => (
  <div key={scene.id}>
    <h4>{scene.title}</h4>
    <IntensityIndicator 
      intensity={scene.intensity}
      variant="bar"
    />
  </div>
))}
```

### Kink Scene Marking
```tsx
<fieldset>
  <legend>Scene Intensity</legend>
  <div className="grid grid-cols-3 gap-2">
    {[1, 2, 3, 4, 5].map(level => (
      <button
        key={level}
        onClick={() => setIntensity(level)}
        className={selected === level ? 'ring-2' : ''}
      >
        <IntensityIndicator intensity={level} variant="heatmap" />
      </button>
    ))}
  </div>
</fieldset>
```

## Accessibility

The component includes built-in accessibility features:

- **Bar variant**: `role="progressbar"` with ARIA attributes
- **Flames variant**: Proper icon labeling with `aria-hidden`
- **Heatmap variant**: `role="status"` with descriptive `aria-label`

All components are WCAG 2.1 AA compliant and support:
- Screen readers
- Keyboard navigation
- High contrast mode
- Reduced motion preferences

## Performance

- No external dependencies beyond Lucide icons
- Memoized exported variants using `React.memo()`
- CSS-based animations (no JS)
- Lightweight component structure (~10KB minified)

## Integration Notes

The component is designed to integrate seamlessly with:
- Scene analysis data (for intensity marking)
- Content filtering systems
- Timeline visualizations
- Character relationships
- Kink/BDSM scene marking systems
- Content warning mechanisms

Ready for production use in all these contexts.
