## 2026-02-06 18:43:49 CET - Task 1 IA Blueprint

### 1) `/mythos` above-fold composition
- **Frame A - Encyclopedia Header Rail (persistent):** compact title, one-line value proposition, and immediate global control row (search input, category filter chips, sort select) visible without tab switching.
- **Frame B - Taxonomy + Active Query State:** left/upper zone surfaces category index with counts and active-state emphasis; right/lower zone shows live result count and currently applied query/filter state.
- **Frame C - Curated Entry Strip:** first 3-5 featured mythos cards (mixed categories) to establish narrative pull while preserving index utility; each card must expose category, short description, and clear detail CTA.
- **Frame D - Onward Options:** graph/timeline become secondary routes below fold, announced above fold as optional exploration modes, not the default entry interaction.

### 2) `/mythos` primary modules and order
1. **Search + taxonomy controls (priority P0):** fastest path to intent matching; always visible.
2. **Active filter state + result count (P0):** immediate feedback loop for confidence and scan speed.
3. **Featured/curated mythos strip (P1):** emotional hook plus guided starting points.
4. **Main encyclopedia result grid/list (P1):** dense reference browsing.
5. **Graph/timeline alternate lenses (P2):** optional deep exploration after entry discovery.

### 3) `/mythos/[id]` above-fold composition
- **Top utility rail:** back-to-index, breadcrumb-like category context, and quick actions (jump links) grouped in one strip.
- **Hero knowledge block:** title + category badge + short description + one-sentence narrative significance summary.
- **Key facts row:** compact chips/counters for traits, abilities, weaknesses, related episodes/characters to establish reference density immediately.
- **Section jump anchors:** explicit links to `Reference`, `Narrative Implications`, `Related Links`, `Connection Graph` to prevent scroll hunting.

### 4) `/mythos/[id]` reference + narrative module map
- **Reference lane (first):** canonical description, traits, abilities, weaknesses, rules/mechanics.
- **Narrative lane (second):** significance, dark variant, horror/taboo implications, thematic interpretation.
- **Context lane (third):** related episodes/characters with semantic grouping.
- **Exploration lane (fourth):** lore connection graph + recommended next reads.
- **Module priority rationale:** start with factual grounding for trust, then move to narrative meaning for depth, then route users outward to avoid dead-end pages.

### 5) Discovery path map
- Primary path: `search -> filter -> detail`.
- Flow definition:
  - User enters query in global mythos search.
  - User narrows by taxonomy filter (category chips) with instant count feedback.
  - User opens a matching detail card.
- Onward paths from detail:
  - `detail -> related links -> episode/character context`
  - `detail -> lore connections -> adjacent mythos element`
  - `detail -> back to index with preserved query/filter state`
- Discoverability rationale: each step must show visible state transition (input value, active filter, result count, selected destination) to reduce uncertainty and backtracking.

### 6) Mobile IA notes
- Keep search and one-row category chips pinned near top; collapse sort + secondary controls into a single expandable drawer.
- Preserve result count and active filters as a compact sticky capsule above the card list.
- On detail pages, render jump anchors as horizontally scrollable pills directly under title block.
- Maintain reading rhythm with strict module stacking order: hero summary -> key facts -> reference -> narrative -> related -> graph.
- Keep onward-path CTAs full-width and explicit to support thumb navigation and avoid hidden affordances.
