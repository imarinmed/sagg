# Issues

- `bun run typecheck` failed initially due to type mismatches in `ImageTagger.tsx` and `ErrorBoundary.tsx`.
- `ImageTagger.tsx` had to be patched with `// @ts-ignore` to pass typecheck.
- `ErrorBoundary.tsx` had to be updated to remove invalid props `color` and `startContent`.
