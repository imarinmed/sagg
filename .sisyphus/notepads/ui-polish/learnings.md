# Learnings

- HeroUI v3 components (`Button`, `Chip`, `Input`) have some type mismatches with the current `@heroui/react` package version.
- `Button` does not support `startContent` or `color` props in the current version.
- `Chip` does not support `onClose` prop in the current version.
- `Input` does not support `startContent` prop in the current version.
- `StudioLayout` pattern helps in maintaining consistent layout across different views in `media-lab`.
- `Skeleton` component is useful for loading states and can be customized with variants.
- `ErrorBoundary` is essential for catching runtime errors in React components.
