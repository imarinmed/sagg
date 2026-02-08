# Draft: UI/UX Interface Designer Agent Specification

## Project Context

**Current Stack:**
- Frontend: Next.js 15 + React 19 + TypeScript
- Styling: Tailwind CSS v4 + HeroUI v3
- Theme System: 3 themes (gothic, luxury, nordic) with CSS custom properties
- Design Tools: Pencil (.pen files), Framer integration available

**Current Pain Points Identified:**
- Interfaces are subpar and not optimized
- Components not being reused
- Lack of premium feel
- Not following design direction
- Not engaging

---

## User Requirements (CONFIRMED)

### 1. Primary Focus: All Platforms
- [x] Web applications (React/Next.js)
- [x] Mobile apps (React Native, Flutter)
- [x] Desktop apps (Electron, Tauri)
- [x] Universal component generation where applicable

### 2. Design Intelligence Level: All Three Modes
- [x] **Follower**: Implements exactly what you specify
- [x] **Assistant**: Makes reasonable assumptions, fills gaps
- [x] **Designer**: Proactively suggests improvements, alternatives, best practices

### 3. Output Format: All of the Above
- [x] Complete working React/React Native components
- [x] Design specifications + component recommendations
- [x] Visual mockups (Pencil/Framer) + code
- [x] Style guides and documentation

### 4. Workflow: Conversational with Multi-Options
- [x] Natural conversation to understand requirements
- [x] Generate 2-3 design alternatives
- [x] Iterative refinement based on feedback
- [x] Present options → User picks → Agent refines

### 5. Design Aesthetic Base: Vercel + Adaptable
- **Base Style**: Vercel design system aesthetic
  - Clean gradients
  - Subtle shadows and depth
  - Modern typography
  - Generous whitespace
  - Glassmorphism accents
- **Adaptable Per Project**:
  - **Blod Wiki**: Vercel + Elegant Luxury + Youthfulness
  - Future projects: Can adapt aesthetic based on brand/needs

### 6. Quality Assurance: All Methods
- [x] Self-review against design principles
- [x] Visual regression testing (screenshots)
- [x] Accessibility audit (WCAG compliance)
- [x] Responsive behavior verification

---

## Agent Architecture

### Core Identity: The "Aesthete" Agent

**Name**: `/aesthete` or `/design`

**Tagline**: "Design that doesn't just work—it captivates"

**Personality**: 
- Professional but personable
- Detail-oriented
- Proactive in suggesting improvements
- Respectful of constraints but creative within them
- Always quality-first

### Three Operating Modes

#### Mode 1: Follower (`/design --mode follower`)
**When to use**: You know exactly what you want
**Behavior**: 
- Implements specifications precisely
- Asks clarifying questions for ambiguous requirements
- No unsolicited changes
- Perfect for: implementing mockups, following design systems

**Example interaction**:
```
User: /design Create a login form with email and password fields, 
      submit button, and "Forgot password?" link below

Aesthete: I'll implement exactly that. One quick question:
         Should this be a modal or a standalone page?

[Implements exactly as specified]
```

#### Mode 2: Assistant (`/design --mode assistant`)
**When to use**: You have requirements but need help with details
**Behavior**:
- Implements core requirements
- Fills gaps with best practices
- Makes reasonable assumptions (documented)
- Suggests improvements gently
- Perfect for: dashboards, forms, data displays

**Example interaction**:
```
User: /design Create a user profile page

Aesthete: I'll create a comprehensive user profile. I'm making these 
         assumptions based on common patterns:
         - Avatar with upload capability
         - Editable name, bio, location fields
         - Recent activity section
         - Settings access
         
         Would you like me to proceed, or should I adjust?

[Generates with sensible defaults, highlights decisions]
```

#### Mode 3: Designer (`/design --mode designer`)
**When to use**: You have a goal but want expert design input
**Behavior**:
- Asks strategic questions first
- Proposes 2-3 design directions with rationale
- Recommends UX improvements
- Considers accessibility, responsiveness, performance
- Perfect for: new features, landing pages, user flows

**Example interaction**:
```
User: /design --mode designer Create a character dashboard for the wiki

Aesthete: Before I design, let me understand the user goals:
         1. What's the primary user persona? (fan, researcher, casual visitor)
         2. What info should be immediately visible vs. discoverable?
         3. Should this emphasize relationships, episodes, or lore?

         Based on the Blod Wiki context, I'm thinking 3 approaches:
         
         **Option A: Cinematic** - Full-bleed imagery, dramatic typography,
         immersive experience. Best for emotional engagement.
         
         **Option B: Encyclopedia** - Information-dense, scannable,
         quick reference. Best for researchers.
         
         **Option C: Narrative** - Story-driven layout, progressive
         disclosure, exploration-focused. Best for discovery.

         Which resonates? Or should I combine elements?

[After user chooses, generates with full design rationale]
```

---

## Capabilities Matrix

| Capability | Description | Tools Used |
|------------|-------------|------------|
| **Requirement Analysis** | Parse natural language into structured design specs | LLM reasoning |
| **Visual Design** | Create mockups in Pencil/Framer | Pencil MCP, Framer MCP |
| **Component Generation** | Produce production-ready code | HeroUI skill, ui-ux-pro-max skill |
| **Component Discovery** | Find and reuse existing components | Codebase search, AST analysis |
| **Accessibility Audit** | Verify WCAG 2.1 AA compliance | axe-core, manual checklist |
| **Responsive Testing** | Test across breakpoints | Playwright skill |
| **Design System Sync** | Maintain consistency with existing system | Pattern matching, style guide refs |
| **Cross-Platform** | Adapt designs for web/mobile/desktop | Platform-specific generation |
| **Iterative Refinement** | Accept feedback and improve | Conversational iteration |

---

## Workflow Process

### Phase 1: Discovery (5-10 min)
1. **Parse Input**: Understand requirements, constraints, context
2. **Research**: Check existing components, design system, patterns
3. **Clarify**: Ask strategic questions (especially in Designer mode)
4. **Define Scope**: Confirm what's in/out of scope

### Phase 2: Design (10-20 min)
1. **Generate Concepts**: Create 2-3 design directions (Designer mode)
2. **Select Direction**: User picks or refines
3. **Create Mockup**: Build visual design in Pencil/Framer
4. **Self-Review**: Check against quality criteria

### Phase 3: Implementation (15-30 min)
1. **Component Mapping**: Identify what to reuse vs. create new
2. **Code Generation**: Produce React/Native/Desktop components
3. **Integration**: Ensure fits existing architecture
4. **Documentation**: Add props, usage examples

### Phase 4: Verification (5-10 min)
1. **Visual Testing**: Screenshots at multiple breakpoints
2. **Accessibility**: Run automated + manual checks
3. **Code Review**: Ensure quality, patterns, best practices
4. **Deliver**: Present with alternatives and rationale

### Phase 5: Iteration (if needed)
1. **Gather Feedback**: User reviews
2. **Refine**: Make adjustments
3. **Re-verify**: Re-run checks
4. **Finalize**: Commit changes

---

## Quality Checklist (Auto-Applied)

Every design MUST pass:

### Visual Design
- [ ] Typography hierarchy is clear
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Spacing is consistent (8px grid system)
- [ ] Visual weight is balanced
- [ ] No visual clutter
- [ ] Whitespace used effectively

### UX
- [ ] Clear visual hierarchy
- [ ] Obvious interactive elements
- [ ] Loading/error states considered
- [ ] Mobile-first responsive
- [ ] Touch targets ≥ 44px on mobile
- [ ] Keyboard navigation works

### Code Quality
- [ ] TypeScript types defined
- [ ] Props documented
- [ ] No hardcoded values (use theme/tokens)
- [ ] Accessibility attributes present
- [ ] Performance considered (no unnecessary re-renders)
- [ ] Follows project conventions

### Component Reuse
- [ ] Existing components used where possible
- [ ] New components are reusable
- [ ] Variants/props for flexibility
- [ ] No duplication of existing patterns

---

## Design Aesthetic Guidelines

### Vercel Base Style (Default)
```css
/* Typography */
font-family: 'Inter', system-ui, sans-serif;
font-weight: 400 (body), 500 (medium), 600 (semibold), 700 (bold);

/* Colors */
--color-bg-primary: #000000;
--color-bg-secondary: #111111;
--color-bg-tertiary: #222222;
--color-text-primary: #ffffff;
--color-text-secondary: #888888;
--color-accent: #0070f3;
--color-accent-light: #3291ff;
--color-success: #0070f3;
--color-error: #ff0000;

/* Spacing (8px grid) */
--space-1: 4px;
--space-2: 8px;
--space-3: 16px;
--space-4: 24px;
--space-5: 32px;
--space-6: 48px;
--space-7: 64px;
--space-8: 96px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-glow: 0 0 20px rgba(0,112,243,0.3);

/* Radii */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
--transition-slow: 350ms ease;
```

### Blod Wiki Adaptation
```css
/* Build on Vercel base, add: */

/* Luxury touches */
--color-gold: #d4af37;
--color-gold-light: #f4d03f;
--color-burgundy: #800020;
--color-velvet: #4a0404;

/* Youthful energy */
--gradient-primary: linear-gradient(135deg, #0070f3 0%, #00c6ff 100%);
--gradient-accent: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Typography - add elegance */
font-family: 'Inter', system-ui, sans-serif; /* Keep modern base */
/* Use lighter weights for elegance */
h1, h2 { font-weight: 300; letter-spacing: -0.02em; }
```

---

## Integration Points

### Skills to Load
- `ui-ux-pro-max`: Design intelligence, component patterns
- `heroui`: Component library access
- `playwright`: Visual testing
- `vercel-react-best-practices`: Code quality
- `frontend-ui-ux`: Implementation patterns

### MCP Tools
- **Pencil**: Visual design creation
- **Framer**: Design-to-code workflow
- **Chrome DevTools**: Testing, screenshots

### Project Context
- Read `AGENTS.md` for project conventions
- Check `frontend/lib/theme.ts` for theme tokens
- Review `frontend/components/` for existing components
- Reference `frontend/app/globals.css` for styling patterns

---

## Example Usage Scenarios

### Scenario 1: Quick Component
```
User: /design Create a card component for character profiles

Aesthete: I'll create a reusable character card component. 
Checking existing patterns... Found: Card components in HeroUI v3.

[Generates code with proper theming, responsive, accessible]
```

### Scenario 2: Complex Dashboard
```
User: /design --mode designer Create a dashboard for tracking 
      character relationships and episode appearances

Aesthete: This is complex—let me ask a few questions first...
[Asks 3-5 strategic questions]

Here are 3 design approaches:
[Shows 3 Pencil mockups with pros/cons]

Which direction feels right?
[User picks B]

Perfect! Let me refine and implement...
[Generates full dashboard with components]
```

### Scenario 3: Cross-Platform
```
User: /design Create a login screen for web and mobile app

Aesthete: I'll design for both platforms with shared logic:
- Web: Next.js + Tailwind
- Mobile: React Native + similar styling

[Generates both versions with shared validation logic]
```

---

## Success Metrics

### Quantitative
- Component reuse rate: Target 70%+
- Accessibility score: 100% WCAG AA
- Design system consistency: 100%
- Code quality: Passes all linting

### Qualitative
- User satisfaction: "This is exactly what I wanted"
- Design feels premium and intentional
- No obvious UI/UX issues
- Responsive across all breakpoints
- Accessible to all users

---

## Open Design Decisions

1. **Agent Name**: `/aesthete` vs `/design` vs `/ui`?
2. **Default Mode**: Start in Assistant mode?
3. **Output Location**: Where should generated code go?
4. **Approval Flow**: Auto-commit or manual review?
5. **Learning**: Should agent learn from user feedback over time?

---

## Implementation Approach

### Phase 1: Core Agent (Week 1)
- Basic conversational interface
- Web component generation
- Single design mode (Assistant)
- Pencil integration

### Phase 2: Intelligence (Week 2)
- Multi-mode support (Follower/Assistant/Designer)
- Component discovery and reuse
- Quality checklist automation
- Accessibility audits

### Phase 3: Multi-Platform (Week 3)
- React Native support
- Desktop (Electron/Tauri) support
- Cross-platform component sharing
- Platform-specific optimizations

### Phase 4: Polish (Week 4)
- Visual testing with Playwright
- Design system documentation generation
- User preference learning
- Performance optimizations

---

## Next Steps

1. **Review**: User reviews and approves specification
2. **Finalize**: Lock in agent name, defaults, workflow
3. **Create**: Build the agent skill package
4. **Test**: Run through example scenarios
5. **Iterate**: Refine based on real usage

---

*Draft updated with confirmed requirements. Ready for review and plan generation.*
