# Media Lab Studio: Premium Redesign v2.0

## Executive Summary

Complete transformation into a **truly premium, professional AI generation studio** with:
- **Live DAGGR workflow visualization** embedded in the interface
- **Node-based pipeline editor** (ComfyUI-style but polished)
- **Real-time execution tracking** with animated node graphs
- **Premium dark glassmorphism design** with fluid animations
- **All header warnings removed**
- **Professional-grade UX** matching Higgsfield/Runway quality

---

## Part 1: Critical Fixes

### 1.1 Remove Header Content
**Remove:** NarrativeToggle warning component completely
**File:** `frontend/components/NarrativeToggle.tsx` - Delete or hide
**File:** `frontend/app/layout.tsx` - Remove NarrativeToggle from header

### 1.2 Fix API 404
**Add:** `GET /api/media-lab/capabilities` endpoint
**File:** `backend/src/api/media_lab.py`

---

## Part 2: Premium Design System

### 2.1 Visual Identity

#### Color Palette (Premium Dark)
```css
/* Core Backgrounds */
--bg-primary: #0a0a0f;         /* Deepest black-blue */
--bg-secondary: #12121a;       /* Panel background */
--bg-tertiary: #1a1a25;        /* Elevated surfaces */
--bg-glass: rgba(18, 18, 26, 0.85);  /* Glass morphism */

/* Accents (Premium Gradient Ready) */
--accent-cyan: #00d4ff;
--accent-purple: #a855f7;
--accent-pink: #ec4899;
--accent-indigo: #6366f1;
--accent-gradient: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%);

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Text Hierarchy */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-muted: rgba(255, 255, 255, 0.4);
--text-accent: #00d4ff;

/* Borders & Glows */
--border-subtle: rgba(255, 255, 255, 0.08);
--border-accent: rgba(0, 212, 255, 0.3);
--glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
--glow-purple: 0 0 20px rgba(168, 85, 247, 0.3);
```

#### Typography (Premium)
- **Display:** "Space Grotesk" or "Inter" (weights 400, 500, 600, 700)
- **Monospace:** "JetBrains Mono" (for seeds, technical data)
- **Scale:**
  - Display: 32px/40px (page titles)
  - Title: 24px/32px (section headers)
  - Subtitle: 18px/24px (card titles)
  - Body: 14px/20px (content)
  - Caption: 12px/16px (labels, metadata)

#### Spacing & Layout
```css
/* Grid System */
--grid-unit: 4px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;

/* Layout */
--sidebar-width: 320px;
--sidebar-collapsed: 64px;
--header-height: 56px;
--panel-gap: 16px;
--border-radius: 12px;
--border-radius-sm: 8px;
--border-radius-lg: 16px;
```

#### Animations & Transitions
```css
/* Timing Functions */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Durations */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;

/* Effects */
--transition-all: all var(--duration-normal) var(--ease-smooth);
--transition-transform: transform var(--duration-normal) var(--ease-spring);
--transition-opacity: opacity var(--duration-fast) var(--ease-smooth);
```

---

## Part 3: Main Layout Architecture

### 3.1 Overall Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px, fixed, glass morphism)                                       │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ [Logo]  [Workflow Graph ▼] [Queue] [History] [Models] [Settings]   🔍 │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  LEFT SIDEBAR (320px, collapsible, glass)                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  ┌─ WORKFLOW NODES ───────────────────────────────────────────────┐  │ │
│  │  │ [📷 Text2Img] ──────────────→ [🎨 Refiner]                    │  │ │
│  │  │      ↓                              ↓                         │  │ │
│  │  │ [✨ Detailer 1] ───→ [✨ Detailer 2] ───→ [✨ Detailer 3]      │  │ │
│  │  │      ↓                                                        │  │ │
│  │  │ [📈 Upscaler]                                                 │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌─ PARAMETERS ───────────────────────────────────────────────────┐  │ │
│  │  │ ⚙️ Model                                                        │  │ │
│  │  │    ├─ Checkpoint: [SDXL Base ▼]                                │  │ │
│  │  │    └─ LoRAs: [+ Add LoRA]                                     │  │ │
│  │  │                                                                 │  │ │
│  │  │ 📝 Prompt                                                      │  │ │
│  │  │    [Masterpiece, best quality...                    ]         │  │ │
│  │  │    [Enhance, detailed, 8k uhd...                    ] ↓       │  │ │
│  │  │                                                                 │  │ │
│  │  │ 🔧 Generation Settings                                         │  │ │
│  │  │    Steps:  [━━●━━━━━━] 28              CFG:  [━━●━━] 7.5      │  │ │
│  │  │    Size:   [ 512x512 ▼]                Seed: [12345] [🎲]      │  │ │
│  │  │    Sampler: [ DPM++ 2M Karras ▼]                               │  │ │
│  │  │                                                                 │  │ │
│  │  │ ▶ Advanced ▼                                                   │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  [⚡ GENERATE]  [⚙️ Queue]                                          │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
├───────────────────────────┬─────────────────────────────────────────────────┤
│                           │                                                 │
│  DAGGR VISUALIZER         │  PREVIEW PANEL (flex, center)                  │
│  (300px, collapsible)     │                                                 │
│                           │  ┌─────────────────────────────────────────────┐│
│  ┌───────────────────────┐│  │                                             ││
│  │ LIVE EXECUTION GRAPH ││  │     [Generated Image Preview]               ││
│  │                      ││  │     1024 x 1024 px                          ││
│  │  ● Text2Img    [━━━] ││  │                                             ││
│  │    ↓ processing      ││  │  ┌───────────────────────────────────────┐  ││
│  │  ○ Refiner     [   ] ││  │  │  Comparison Slider                    │  ││
│  │  ○ Detailer 1  [   ] ││  │  │  [Original] |==========●| [Enhanced]  │  ││
│  │  ○ Upscaler    [   ] ││  │  └───────────────────────────────────────┘  ││
│  │                      ││  │                                             ││
│  │ Step: 15/28 (53%)    ││  └─────────────────────────────────────────────┘│
│  │ ETA: 12s             ││                                                 │
│  │                      ││  ┌──────────────────────────────────────────────┐│
│  │ [⚠️ Cancel] [⏸ Pause]││  │ TOOLBAR                                       ││
│  └───────────────────────┘│  │ [🎭 Mask] [⬆️ Upscale] [✨ Detail] [💾 Save]  ││
│                           │  │ [🗑️ Delete] [📥 Download]                     ││
│  ┌─ QUEUE ──────────────┐│  └──────────────────────────────────────────────┘│
│  │ 1. Generate x4       ││                                                 │
│  │ 2. Enhance img_01    ││                                                 │
│  └───────────────────────┘│                                                 │
│                           │                                                 │
└───────────────────────────┴─────────────────────────────────────────────────┘
```

---

## Part 4: DAGGR Workflow Visualizer (Core Feature)

### 4.1 Embedded Node Graph

**Purpose:** Visual representation of the 9-stage pipeline with live execution status

**Design:**
```typescript
interface DAGGRNode {
  id: string;
  type: 'text2img' | 'refiner' | 'detailer' | 'upscaler' | 'img2img';
  label: string;
  status: 'idle' | 'queued' | 'running' | 'complete' | 'error';
  progress: number; // 0-100
  eta?: string;
  checkpoint?: string;
  params?: Record<string, any>;
  inputs: string[]; // node IDs
  outputs: string[]; // node IDs
}
```

**Visual Design:**
- **Idle:** Gray border (#3f3f46), no glow
- **Queued:** Cyan border with subtle pulse animation
- **Running:** 
  - Cyan border with glow
  - Progress bar inside node
  - Animated gradient background
  - "Processing..." text with spinner
- **Complete:** Green checkmark, green border
- **Error:** Red border, red glow, error icon

**Interactions:**
- Click node → Show detailed parameters in panel
- Hover node → Tooltip with stage info
- Double-click → Open stage settings
- Drag to reorder (if allowed)

**Layout:**
- Vertical flow (top to bottom)
- Auto-layout with dagre or ELK.js
- Animated connections (bezier curves)
- Connection pulses when data flows

**Component Structure:**
```
DAGGRVisualizer/
├── WorkflowGraph.tsx          # Main graph container
├── DAGGRNode.tsx              # Individual node component
├── DAGGREDge.tsx              # Connection lines
├── NodeStatus.tsx             # Status indicator
├── ProgressBar.tsx            # Node progress
├── MiniMap.tsx                # Overview map
└── Controls.tsx               # Zoom/pan controls
```

---

## Part 5: Component Specifications

### 5.1 Workflow Nodes Panel (Left Sidebar Top)

**Features:**
1. **Visual Pipeline:** Show all 9 stages as connected nodes
2. **Live Status:** Each node shows current state
3. **Expandable:** Click to expand node details
4. **Reorderable:** Drag nodes to change pipeline order

**Node Types:**
- **Text2Img:** Primary generation
- **Refiner:** High-res fix
- **Detailer (x3):** Face/hand/body detail
- **Upscaler:** Final upscale
- **Img2Img:** Image-to-image (alternative to Text2Img)

### 5.2 Parameters Panel (Left Sidebar Bottom)

**Sections:**

#### Model Configuration
```
┌─ MODEL ─────────────────────────────┐
│                                     │
│ Checkpoint                          │
│ ┌─────────────────────────────────┐ │
│ │ 🖼️  SDXL Base                    │ │
│ │    3.5 GB • Photorealistic      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ LoRA Adapters                       │ │
│ ┌─────────────────────────────────┐ │
│ │ 🎨 Detail Tweaker    [━━●━━] 0.8│ │
│ │ ❌                              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ✏️ Ink Style         [━━●━━] 1.0│ │
│ │ ❌                              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Add LoRA Adapter]               │
└─────────────────────────────────────┘
```

#### Prompt Engineering
```
┌─ PROMPT ────────────────────────────┐
│                                     │
│ Style: [Photorealistic ▼]          │
│                                     │
│ Positive                            │
│ ┌─────────────────────────────────┐ │
│ │ masterpiece, best quality,      │ │
│ │ 1girl, silver hair, blue eyes...│ │
│ └─────────────────────────────────┘ │
│ [Enhance with AI]                  │
│                                     │
│ Negative                            │
│ ┌─────────────────────────────────┐ │
│ │ worst quality, lowres, bad      │ │
│ │ anatomy, bad hands, text...     │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

#### Generation Settings
```
┌─ SETTINGS ──────────────────────────┐
│                                     │
│ Sampling Steps                      │
│ [━●━━━━━━━━━━━━━━━━━━━] 28         │
│                                     │
│ CFG Scale                           │
│ [━━━━━●━━━━━━━━━━━━━━━] 7.5        │
│                                     │
│ Resolution                          │
│ [ 512x512 ▼] [ 🔒 Aspect Ratio ]   │
│                                     │
│ Seed                                │
│ [ 1234567890 ] [ 🎲 ] [ ♻️ Last ]  │
│                                     │
│ Sampler                             │
│ [ DPM++ 2M Karras ▼]               │
│                                     │
│ Scheduler                           │
│ [ Karras ▼]                        │
│                                     │
└─────────────────────────────────────┘
```

### 5.3 Preview Panel (Center)

**Features:**
1. **Main Preview:** Large image display with zoom/pan
2. **Comparison Mode:** Before/after slider for Enhance
3. **Batch Grid:** When batch_size > 1, show grid
4. **Metadata Overlay:** Show generation info on hover
5. **Fullscreen Mode:** Expand to fill screen

**Toolbar Actions:**
- 🎭 Mask (opens MaskPainter)
- ⬆️ Upscale (run upscaler)
- ✨ Detail (run detailer)
- 💾 Save to Gallery
- 🗑️ Delete
- 📥 Download
- 🔍 Zoom In/Out/Fit

### 5.4 Queue Panel (Right Sidebar)

**Shows:**
- Current job progress
- Pending jobs list
- Estimated completion times
- Cancel/Pause controls

---

## Part 6: Tab Views

### 6.1 Generate Tab
- Full workflow editor
- All 9 stages visible
- Real-time preview updates

### 6.2 Enhance Tab (Img2Img)
- Source image drop zone
- Denoising strength slider (0.0 - 1.0)
- Same parameters as Generate
- Side-by-side comparison

### 6.3 Batch Tab
- Grid of generated images
- Multi-select with Shift/Ctrl
- Bulk actions (Download All, Delete Selected)
- Statistics (total, selected, size)

### 6.4 Models Tab
**Sub-tabs:**
- **Local:** Installed checkpoints and LoRAs
- **CivitAI:** Browse and download
- **HuggingFace:** Browse and download

**Model Card:**
- Preview thumbnail
- Name and type badge
- Size and download count
- Install/Download button with progress

---

## Part 7: Animations & Interactions

### 7.1 Micro-interactions

**Button Hover:**
- Scale: 1.0 → 1.02
- Background lightens
- Duration: 150ms
- Easing: ease-out

**Node Running:**
- Border: cyan glow pulse (2s loop)
- Background: animated gradient
- Progress bar: smooth fill

**Panel Collapse:**
- Height: animate to 0
- Opacity: 1 → 0
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

**Image Load:**
- Blur: 20px → 0px
- Opacity: 0 → 1
- Scale: 1.05 → 1.0
- Duration: 400ms

### 7.2 Page Transitions
- Fade between tabs
- Duration: 200ms
- No jarring jumps

### 7.3 Loading States
- Skeleton screens for panels
- Spinner for async actions
- Progress bars for long operations
- Never show empty/blank states

---

## Part 8: Responsive Behavior

### Desktop (1400px+)
- Full 3-column layout
- DAGGR visualizer expanded
- All controls visible

### Laptop (1200px - 1399px)
- Slightly narrower sidebars
- DAGGR visualizer collapsible

### Tablet (768px - 1199px)
- Left sidebar collapsible to icons
- Bottom sheet for parameters
- Simplified DAGGR view

### Mobile (< 768px)
- Single column
- Bottom navigation
- Full-screen preview
- Modal sheets for parameters

---

## Part 9: Implementation Priority

### Phase 1: Foundation (Days 1-2)
- [ ] Remove header warning content
- [x] **Remove NarrativeToggle from header**
- [x] **Fix API 404 error** (capabilities endpoint added)
- [x] **Setup new design system** (CSS variables in design-system.css)
- [ ] Create base layout components
- [ ] Implement glass morphism header

### Phase 2: DAGGR Visualizer (Days 3-4)
- [ ] Implement node graph component
- [ ] Create node types and connections
- [ ] Add live execution status
- [ ] Wire to backend pipeline events
- [ ] Test with real generation jobs

### Phase 3: Parameters Panel (Days 5-6)
- [ ] Redesign Model section with LoRA cards
- [ ] Redesign Prompt section with AI enhance
- [ ] Redesign Settings with new sliders
- [ ] Add accordion animations
- [ ] Connect all to backend

### Phase 4: Preview & Queue (Days 7-8)
- [ ] Redesign preview panel
- [ ] Add comparison slider
- [ ] Create queue panel
- [ ] Add toolbar actions
- [ ] Batch view grid

### Phase 5: Models Browser (Days 9-10)
- [ ] Local models grid
- [ ] CivitAI integration
- [ ] HuggingFace integration
- [ ] Download with progress

### Phase 6: Polish & Launch (Days 11-12)
- [ ] All animations
- [ ] Responsive design
- [ ] Error handling
- [ ] Performance optimization
- [ ] Final testing

---

## Part 10: Technical Stack

### Required Libraries
```json
{
  "dependencies": {
    "@heroicons/react": "^2.x",
    "@xyflow/react": "^12.x",        // For DAGGR node graph
    "dagre": "^0.8.x",               // Graph auto-layout
    "framer-motion": "^11.x",        // Animations
    "zustand": "^4.x",               // State management
    "react-use": "^17.x",            // Utility hooks
    "recharts": "^2.x"               // For progress visualization
  }
}
```

### State Management (Zustand)
```typescript
interface MediaLabStore {
  // Workflow
  nodes: DAGGRNode[];
  edges: DAGGREdge[];
  selectedNode: string | null;
  
  // Generation
  currentJob: Job | null;
  queue: Job[];
  history: GeneratedImage[];
  
  // Parameters
  params: GenerationParams;
  presets: Preset[];
  
  // UI State
  activeTab: 'generate' | 'enhance' | 'batch' | 'models';
  sidebarCollapsed: boolean;
  daggrExpanded: boolean;
  
  // Actions
  generate: () => void;
  enhance: (image: File) => void;
  updateParams: (params: Partial<GenerationParams>) => void;
  cancelJob: (jobId: string) => void;
}
```

---

## Part 11: Acceptance Criteria

### Functional Requirements
- [ ] DAGGR visualizer shows live pipeline execution
- [ ] All 9 stages visible and trackable
- [ ] Node progress updates in real-time
- [ ] Generate/Enhance/Batch all work
- [ ] Models browser downloads work
- [ ] No 404 API errors
- [ ] Responsive on all screen sizes

### Visual Requirements
- [ ] Premium dark theme applied throughout
- [ ] Glass morphism effects on panels
- [ ] Smooth animations (no jarring transitions)
- [ ] Professional typography and spacing
- [ ] Consistent color usage
- [ ] No visual glitches or layout shifts

### UX Requirements
- [ ] Intuitive workflow visualization
- [ ] Clear status indicators
- [ ] Helpful tooltips on all controls
- [ ] Keyboard shortcuts supported
- [ ] Loading states for all async operations
- [ ] Error messages are clear and actionable
- [ ] Feels like Runway/ComfyUI quality

### Performance Requirements
- [ ] First paint < 1.5s
- [ ] Node graph renders smoothly (60fps)
- [ ] Image preview loads quickly
- [ ] No memory leaks
- [ ] Works on mid-range hardware

---

## Summary

This redesign transforms the Media Lab from a basic interface into a **premium, professional AI generation studio** that rivals ComfyUI, Higgsfield, and Runway.

**Key Differentiators:**
1. **Embedded DAGGR visualizer** - See your pipeline execute in real-time
2. **Premium glassmorphism design** - Beautiful, modern, professional
3. **Fluid animations** - Delightful micro-interactions throughout
4. **Intuitive workflow** - Node-based mental model
5. **Fully functional** - All features work reliably

**Timeline:** 12 days for complete implementation
**Result:** Production-ready professional tool
