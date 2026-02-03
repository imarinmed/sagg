# Draft: Visual Redesign Consultation - Blod Dark Adaptation Wiki

## Current State Analysis

### Visual Architecture (from explore agent)
**Current Implementation:**
- HeroUI v3 beta.5 with Tailwind CSS v4
- Generic gray color scheme (`bg-gray-50/950`, `text-gray-900/600/500`)
- System font stack (no custom typography)
- Manual dark mode via classList manipulation
- **No Tailwind config file** - minimal theming
- **No design tokens** - only `--radius: 0.625rem`

**Key Files:**
- `/frontend/app/globals.css` - 19 lines, minimal styling
- `/frontend/components/Layout.tsx` - basic shell with gray backgrounds
- `/frontend/components/Navigation.tsx` - standard top nav with gray borders
- `/frontend/app/page.tsx` - 4-card grid, generic HeroUI cards

### Visual Assets Discovered

**SVT Play (Main Source):**
- Main poster: `https://www.svtstatic.se/image/custom/1144/53567596/1766071142?format=auto&chromaSubSampling=false&enableAvif=true&quality=85`
- Dimensions: 480x270 (meta tags indicate 1000x1500 available)
- 8 episodes total (7 available, 1 upcoming)
- **Limitation:** JavaScript-rendered, need Playwright for full scraping

**IMDb:**
- High-res poster: `https://m.media-amazon.com/images/M/MV5BZDQ0MGM5NmItNDNhOS00MTZjLTk1M2UtNjkxN2UyMWViYzJlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg`
- 1000x1500 resolution
- Rating: 7.0/10
- Genre: Drama (YA vampire)

**Instagram:**
- Reel URL: https://www.instagram.com/reel/DTnT89EDeeY/
- **Limitation:** React-rendered, requires browser automation

## User's Vision

**Desired Aesthetic:**
- "Sexy, evocatively erotic, elegant, stylish"
- **Visual metaphors:** Obsidian glass, gold and blood hues, white seed
- **Inspiration:** Premium, sophisticated creative platform
- **Target:** Writers and creators working on dark adaptation

**Content Context:**
- Swedish YA vampire series adaptation
- Dark, explicit content (Stephen King × Guillermo del Toro × GRRM)
- Taboo elements: incest themes, extreme power dynamics
- IP permission secured

## Research Completed: Dark Luxury UI Patterns

### Recommended Color Palette: "Imperial Obsidian"

| Role | Color Name | Hex | Usage |
|------|------------|-----|-------|
| **Primary Base** | Obsidian Void | `#080808` | Main background - deep black with subtle undertone |
| **Surface/Card** | Deep Anthracite | `#141414` | Elevated surfaces, cards, panels |
| **Primary Accent** | Liquid Champagne | `#C5A059` | CTAs, highlights, luxury indicators |
| **Secondary Accent** | Royal Crimson | `#8B0000` | Drama, passion, taboo content warnings |
| **Crimson Light** | Blood Rose | `#A52A2A` | Hover states, secondary accents |
| **Text Primary** | Silver Silk | `#E5E5E5` | Primary text, headings |
| **Text Secondary** | Muted Stone | `#9CA3AF` | Secondary text, descriptions |
| **Border Subtle** | Smoke | `#2A2A2A` | Subtle borders, dividers |
| **Border Accent** | Gold Mist | `rgba(197, 160, 89, 0.3)` | Accent borders, glows |

**Why Not Pure Black?** OLED optimization, visual depth, reduced eye strain, premium feel

**Accessibility:** All colors meet WCAG AA/AAA standards (Silver Silk on Obsidian: 16.8:1, Champagne: 8.2:1)

### Glassmorphism System

**Obsidian Glass Effect:**
- Layer 1 (Subtle): 8px blur, 25% opacity - backgrounds
- Layer 2 (Cards): 16px blur, 45% opacity - cards, panels
- Layer 3 (Modals): 24px blur, 65% opacity - overlays
- Layer 4 (Premium): 40px blur, 75% opacity - hero sections

**Key Techniques:**
- `backdrop-filter: blur(24px) saturate(180%)`
- Subtle borders with `rgba(255, 255, 255, 0.08)`
- Gold accent glows with `rgba(197, 160, 89, 0.15)`
- Noise texture overlay (0.025 opacity) for anti-banding
- Internal sheen effect with gradient overlays

### Typography Recommendation

**Primary Pairing: Heritage Modernity**
- **Display/Headings:** Cormorant Garamond (300/400/600 weights, +0.02em tracking)
- **Body Text:** Inter (400/500 weights, 1.6 line-height)

**Alternative Options:**
- Playfair Display (fashion-forward, bold)
- Cinzel (classical, timeless)
- PP Editorial New (trendy, narrow, retro-chic)

### HeroUI v3 Integration Strategy

**Theme Configuration:**
- Uses OKLCH color format for better perceptual uniformity
- Custom CSS variables for all theme tokens
- Component-specific overrides (buttons, cards, inputs, navigation)
- Tailwind v4 @theme syntax for custom utilities

**Key Implementation:**
- `[data-theme="dark-luxury"]` attribute-based theming
- Glass effect classes: `.glass-card`, `.glass-card-premium`, `.glass-subtle`
- Gold gradient buttons with shadow glows
- Crimson accents for danger/taboo content

### Reference Inspiration

**High-End Fashion:** Saint Laurent (stark black + gold), Gucci (rich textures)
**Streaming:** Netflix 2026 (midnight navy), HBO Max (digital vault aesthetic)
**Creative Tools:** DaVinci Resolve (professional dark), Figma (clean dark mode)

## Key Questions for User

1. **Asset Management:**
   - Where should scraped poster/images be stored? (public/assets/, CDN, external hosting?)
   - Do you want automated scraping via Playwright script, or manual download?

2. **Color Palette Specificity:**
   - "Blood hues" - crimson, burgundy, wine, or darker dried-blood tones?
   - "Gold" - champagne gold, antique gold, rose gold, or bright metallic?
   - "Obsidian glass" - pure black with transparency, or deep charcoal?

3. **Typography:**
   - Editorial serif for headings? (Playfair Display, Cormorant Garamond, Cinzel?)
   - Modern sans for body? (Inter, Satoshi, plus Jakarta Sans?)
   - Any specific font preferences or licensing constraints?

4. **Content Warnings/Adult Content:**
   - Age gate/verification system needed?
   - How to handle explicit content warnings in the UI?
   - Special styling for mature/taboo content tags?

5. **Interactive Elements:**
   - Animation preferences? (subtle elegance vs dramatic reveals)
   - Sound/haptic feedback considerations?
   - Mobile vs desktop priority?

6. **Brand Integration:**
   - Use actual series poster/key art, or create original artwork?
   - Logo/wordmark treatment for "Blod, Svett, Tårar"?
   - Swedish language elements in the UI?

## Scope Boundaries

**INCLUDE:**
- Complete visual redesign of existing components
- Custom HeroUI theme configuration
- Typography system with web fonts
- Color palette with CSS custom properties
- Glassmorphism effects where appropriate
- Asset repository structure for scraped images

**EXCLUDE (unless specified):**
- New page functionality (focus on visual polish of existing)
- Backend/API changes
- Content migration
- User authentication/authorization
- Complex animations (unless simple CSS transitions suffice)

## Technical Considerations

**HeroUI v3 Beta Constraints:**
- Uses React Aria Components as foundation
- BEM classes from @heroui/styles package
- Theme overrides via CSS custom properties
- Tailwind v4 syntax (no tailwind.config.js)

**Performance Priorities:**
- Next.js 15 with App Router
- Bun for package management
- Font optimization via next/font
- Image optimization for scraped assets

## Next Steps

1. ✓ Dark luxury UI research completed
2. Present findings to user with visual concepts (THIS MESSAGE)
3. Confirm color palette, typography, and asset strategy
4. Generate comprehensive work plan for visual redesign

## Visual Concept Preview

Based on research, here's what your platform will look like:

**The Atmosphere:**
- Deep obsidian backgrounds (`#080808`) that feel like velvet darkness
- Glass cards floating with subtle blur and gold-accented borders
- Cormorant Garamond headings in silver silk, tracking slightly wide for elegance
- Champagne gold (`#C5A059`) buttons that glow softly on hover
- Crimson (`#8B0000`) accents for intensity indicators and taboo content warnings

**Key Interactions:**
- Cards lift subtly on hover with gold shadow bloom
- Navigation sticks with glassmorphism blur over content
- Content warnings pulse gently with crimson glow
- Typography breathes with generous line-height and whitespace

**The Feeling:**
Like stepping into a vampire's private study — dark, luxurious, slightly dangerous, but impeccably refined. The interface doesn't just display content; it sets the mood for creative work.
