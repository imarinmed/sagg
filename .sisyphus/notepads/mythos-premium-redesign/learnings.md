# Learnings - Mythos Premium Redesign

## CSS Theme Extension
- Extended `globals.css` with "Archive Aesthetic" variables.
- Used `--color-section-accent: #d97706` (Amber) as the signature color for the archive.
- Added glassmorphism utilities `.glass-archive` with specific blur and border settings.
- Implemented theme-aware overrides for Nordic theme to ensure contrast (blue-tinted card backgrounds).
- Maintained compatibility with Tailwind v4 configuration.

## Font Configuration
- Installed `geist` package for Geist Sans, Mono, and Pixel fonts.
- Configured `layout.tsx` to import and use Geist fonts.
- Updated `globals.css` to use Geist fonts as primary fonts for headings, body, and mono, with existing fonts as fallbacks.
- Used `GeistPixelSquare` for the pixel font variant.

## Archive Layout Pattern
- Implemented `ArchiveLayout` for `/mythos` page.
- Uses a 3-column grid system (Left Sidebar, Main Content, Right Sidebar).
- `CategoryNav` component provides consistent sidebar navigation.
- `glass-archive` class provides the specific visual style for archive cards.
- Full-width layout (max-w-[1920px]) maximizes screen real estate for data-heavy views.
