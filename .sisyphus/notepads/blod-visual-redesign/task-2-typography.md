# Task 2: Typography System - Learnings

## Font Configuration Pattern
- Use next/font/google for optimal loading with display: 'swap'
- Define CSS variables (--font-cormorant, --font-inter, --font-jetbrains) 
- Apply variable class to html element, inter.className to body
- Always include fallback fonts: serif, sans-serif, monospace

## Fluid Typography Scale
- Use clamp() for responsive sizing without breakpoints
- Formula: clamp(min, preferred, max)
- Preferred uses vw units for fluid scaling
- Example: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)

## CSS Custom Properties Structure
```
--font-heading: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
--font-body: var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: var(--font-jetbrains), 'JetBrains Mono', 'Fira Code', monospace;
```

## Font Weights Used
- Cormorant Garamond: 300, 400, 600
- Inter: 400, 500, 600
- JetBrains Mono: 400, 500

## Typography Application
- h1-h6: Cormorant Garamond, normal weight, wide tracking, tight line-height
- body: Inter, base size, normal line-height
- code/pre: JetBrains Mono

## Performance Notes
- display: 'swap' prevents FOUT
- next/font automatically optimizes and subsets fonts
- CSS variables enable theme-aware typography
