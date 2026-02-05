# Video Analysis System Improvements - BST Wiki

## Executive Summary

This document provides actionable recommendations for improving the video scene analysis system and episode UI for the "Blod, Svett, Tårar" dark adaptation wiki.

---

## 1. Gap Analysis: Current Video Analysis Approach

### Critical Issues

| Issue | Location | Impact |
|-------|----------|--------|
| **Hardcoded 20-screenshot limit** | `analyze_videos.py:502` | Only captures first ~45 seconds of each episode |
| **Sequential extraction** | `moments[:20]` | Misses all high-intensity scenes after first minute |
| **Keyword-only intensity** | Lines 450-461 | Misses visual intensity (dance, physical scenes) |
| **Single-pass character detection** | Lines 428-435 | Only detects characters mentioned in text, not visually present |

### Detailed Gap Analysis

#### A. Screenshot Extraction (Critical)
```python
# CURRENT (line 502)
for i, moment in enumerate(moments[:20]):  # Hardcoded limit

# PROBLEM: 
# - Episode 1 has 200+ moments, only first 20 captured
# - All screenshots are from timestamps 0:00:03 to 0:00:45
# - Misses cheerleader practice, dance scenes, confrontations
```

**Evidence from `video_analysis.json`:**
- Episode S01E01: 20 screenshots, all between timestamps `0:00:03` and `0:00:45`
- After moment 20, all `screenshot_path` fields are `null`
- High-intensity moments at 7:19 (dance audition), 10:00+ (confrontations) have no screenshots

#### B. Intensity Detection (Moderate)
```python
# CURRENT: Only keyword matching
intense_words = ["fuck", "shit", "damn", "hell", "sex", "naked", "horny", "lust"]
if any(word in text_lower for word in intense_words):
    intensity = max(intensity, 4)

# MISSING:
# - No boost for dance/training (visual intensity)
# - No boost for physical intimacy keywords
# - No contextual intensity (argument escalation)
```

#### C. Character Detection (Moderate)
- Only detects characters by name mention in dialogue
- Misses: Characters present but not speaking, group scenes
- Example: Batgirls dance scene has 6+ characters but only detects speaker

#### D. Content Type Classification (Minor)
- Current types: dance, training, physical_intimacy, vampire_feeding, confrontation, party, dialogue
- Missing: **transformation**, **romantic_tension**, **group_scene**, **solo_performance**

---

## 2. Recommended Improvements

### A. Intensity-Based Screenshot Extraction

Replace the hardcoded limit with intelligent sampling:

```python
def select_moments_for_screenshots(moments: List[SceneMoment], max_screenshots: int = 50) -> List[SceneMoment]:
    """Select moments for screenshot extraction based on intensity and distribution."""
    
    # 1. Always include high-intensity moments (4-5)
    high_intensity = [m for m in moments if m.intensity >= 4]
    
    # 2. Include all suggestive content types
    suggestive = [m for m in moments 
                  if m.content_type in ['dance', 'training', 'physical_intimacy', 'vampire_feeding']
                  and m not in high_intensity]
    
    # 3. Sample remaining moments evenly across timeline
    remaining_budget = max_screenshots - len(high_intensity) - len(suggestive)
    other_moments = [m for m in moments if m not in high_intensity and m not in suggestive]
    
    if remaining_budget > 0 and other_moments:
        step = max(1, len(other_moments) // remaining_budget)
        sampled = other_moments[::step][:remaining_budget]
    else:
        sampled = []
    
    # Combine and sort by timestamp
    selected = high_intensity + suggestive + sampled
    selected.sort(key=lambda m: m.timestamp_seconds)
    
    return selected[:max_screenshots]
```

### B. Enhanced Intensity Calculation

```python
def calculate_intensity(self, text: str, content_type: str, context: dict) -> int:
    """Calculate intensity with multiple factors."""
    intensity = 1
    text_lower = text.lower()
    
    # Base intensity by content type
    type_intensity = {
        'dialogue': 1,
        'party': 2,
        'dance': 3,  # INCREASED: Visual intensity
        'training': 3,  # INCREASED: Physical activity
        'confrontation': 3,
        'physical_intimacy': 4,
        'vampire_feeding': 4,
    }
    intensity = max(intensity, type_intensity.get(content_type, 1))
    
    # Profanity boost
    profanity = ['fuck', 'shit', 'damn', 'hell']
    if any(word in text_lower for word in profanity):
        intensity = max(intensity, 4)
    
    # Suggestive language boost
    suggestive = ['kiss', 'touch', 'body', 'close', 'intimate', 'hot', 'sexy']
    if any(word in text_lower for word in suggestive):
        intensity = max(intensity, 3)
    
    # Violence/conflict boost
    violent = ['fight', 'blood', 'kill', 'attack', 'hurt', 'scream']
    if any(word in text_lower for word in violent):
        intensity = max(intensity, 4)
    
    return min(intensity, 5)
```

### C. Secondary Character Expansion

Add these characters to `secondary_char_patterns`:

```python
secondary_char_patterns = {
    # Existing
    "livia": ["livia", "livi"],
    "jonas": ["jonas"],
    "principal": ["principal", "rektor"],
    "felicia": ["felicia"],
    "didde": ["didde"],
    "siri": ["siri"],
    "kylie": ["kylie"],
    "kevin": ["kevin", "kev"],
    "adam": ["adam"],
    
    # NEW: Add these
    "batgirls": ["batgirls", "bat girls", "dance team"],
    "mr_beast": ["mr beast", "beast"],
    "coach": ["coach", "tränare"],
    "substitute": ["substitute", "vikarie"],
    "blood_system": ["blood system", "blodsystemet"],
}
```

### D. Two-Pass Character Detection

```python
def detect_characters_two_pass(self, moments: List[SceneMoment]) -> List[SceneMoment]:
    """Second pass: propagate characters across adjacent scenes."""
    
    window_size = 5  # ~30 seconds context window
    
    for i, moment in enumerate(moments):
        # Look at surrounding moments
        start = max(0, i - window_size)
        end = min(len(moments), i + window_size)
        
        nearby_characters = set()
        for j in range(start, end):
            nearby_characters.update(moments[j].characters_present)
        
        # Only add if scene is non-dialogue (implies group scene)
        if moment.content_type in ['dance', 'party', 'training', 'confrontation']:
            moment.characters_present = list(
                set(moment.characters_present) | nearby_characters
            )
    
    return moments
```

---

## 3. Episode UI Redesign Recommendations

### Available HeroUI v3 Components

| Component | Use Case |
|-----------|----------|
| `Slider` | Timeline scrubbing, intensity range filters |
| `Tabs` | Content type filtering (Dance / Intimate / Dialogue) |
| `TagGroup` | Character filters, content warnings |
| `Card` | Screenshot gallery items, moment cards |
| `Modal` | Full-screen screenshot viewer |
| `ScrollShadow` | Scrollable gallery, dialogue |
| `Chip` | Character badges, intensity indicators |
| `Tooltip` | Scene details on hover |

### Proposed UI Architecture

```
EpisodeDetailPage
├── EpisodeHeader (title, synopsis, stats)
├── TimelineVisualization (custom SVG/Canvas)
│   ├── IntensityGraph (line chart showing intensity over time)
│   ├── ContentTypeMarkers (colored dots for scene types)
│   └── ScreenshotThumbnails (clickable timeline markers)
├── FilterBar
│   ├── ContentTypeFilter (Tabs: All | Dance | Intimate | Action | Dialogue)
│   ├── IntensityFilter (Slider range: 1-5)
│   └── CharacterFilter (TagGroup with character chips)
├── GalleryView (Card grid of screenshots)
│   └── ScreenshotCard
│       ├── Thumbnail
│       ├── Timestamp
│       ├── IntensityBadge
│       └── CharacterChips
├── SceneList (Accordion)
│   └── SceneAccordionItem
│       ├── SceneHeader (timestamp, location, intensity)
│       ├── CharacterPresence (linked character chips)
│       ├── DialogueView (ScrollShadow)
│       └── ScreenshotGallery (if available)
└── ScreenshotModal (full-screen view)
```

### Key UI Components to Build

1. **TimelineVisualization** - Custom component showing:
   - X-axis: Episode duration
   - Y-axis: Intensity (1-5)
   - Colored markers for content types
   - Clickable screenshot thumbnails

2. **ScreenshotGallery** - Grid of screenshot cards with:
   - Lazy-loaded images
   - Intensity badge overlay
   - Content type indicator
   - Hover: show timestamp + characters

3. **CharacterTracker** - Shows character presence over time:
   - Row per character
   - Markers where they appear
   - Click to filter scenes

---

## 4. AI-Slop Prevention Guidelines

### DO NOT:
- Generate placeholder screenshots or fake data
- Add generic "loading..." states without actual functionality
- Use stock UI patterns without adapting to "obsidian glass" theme
- Create excessive component abstraction layers
- Add features not requested (feature creep)
- Use generic color schemes instead of gold/blood theme

### DO:
- Use existing `GlassCard`, `IntensityBadge`, `IntensitySlider` components
- Match the established visual language (CSS variables in `globals.css`)
- Keep screenshot URLs pointing to actual extracted files
- Provide fallback UI when screenshots don't exist
- Use real data from `video_analysis.json`

### Code Quality Guardrails:
- No console.log in production code
- TypeScript strict mode for all new components
- Proper error boundaries for API failures
- Lazy load heavy components (gallery, timeline)
- Use HeroUI v3 compound component patterns

---

## 5. Scope Guardrails

### Phase 1: Video Analysis Script (Backend)
**Scope:** Python script changes only
- [ ] Implement intensity-based screenshot selection
- [ ] Add enhanced intensity calculation
- [ ] Add secondary characters to detection
- [ ] Implement two-pass character detection
- [ ] Re-run analysis on all 7 episodes
- [ ] Verify screenshot extraction (target: ~50 per episode)

**Not in scope:**
- Video frame analysis (visual AI)
- Audio analysis
- Manual screenshot annotation UI

### Phase 2: Episode UI Redesign (Frontend)
**Scope:** Episode detail page transformation
- [ ] Create `TimelineVisualization` component
- [ ] Create `ScreenshotGallery` component
- [ ] Add filter bar (content type, intensity, characters)
- [ ] Integrate video analysis data into UI
- [ ] Add screenshot modal viewer
- [ ] Link character chips to character pages

**Not in scope:**
- Video playback integration
- Real-time screenshot extraction
- User annotation features
- Mobile-specific layouts (responsive is fine)

### Estimated Effort:
- Phase 1: ~2-3 hours
- Phase 2: ~4-6 hours
- Total: ~6-9 hours

---

## 6. Implementation Priority

1. **HIGH** - Fix screenshot extraction (line 502) - Without this, no meaningful gallery
2. **HIGH** - Intensity-based selection - Ensures valuable scenes captured
3. **MEDIUM** - Enhanced intensity calculation - Better data quality
4. **MEDIUM** - Screenshot gallery UI - Visible user value
5. **LOW** - Timeline visualization - Nice-to-have, complex
6. **LOW** - Two-pass character detection - Marginal improvement

---

## Appendix: File References

| File | Purpose |
|------|---------|
| `scripts/analyze_videos.py` | Video analysis script (modify) |
| `data/video_analysis/video_analysis.json` | Analysis output (regenerate) |
| `frontend/app/episodes/[id]/page.tsx` | Episode detail page (redesign) |
| `frontend/components/IntensitySlider.tsx` | Reuse for filters |
| `frontend/components/IntensityBadge.tsx` | Reuse for gallery |
| `frontend/components/GlassCard.tsx` | Base styling |
| `frontend/components/SceneTagEditor.tsx` | Reference for tags UI |
