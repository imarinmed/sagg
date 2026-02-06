# Vinterhall Phone System - Phase 1 Implementation Plan

## Summary of User Feedback

The user has provided critical design feedback that changes the phone system approach:

### Key Changes Required
1. **Remove traditional status bar** (battery, signal, time) - girls shouldn't "bother" with these
2. **Replace with class schedule/next activity** showing what class/training is next
3. **Time should be relative**: "morning", "midday", "go to gym for next class"
4. **Phones are tools of dependence** - girls ask mentors for time, directions
5. **Phones used as keys** to access classes, training areas
6. **Left to charge during classes**
7. **Internal social media** (school Instagram/OnlyFans platform)
8. **Photo quality** evaluates beauty, sensuality, attractiveness
9. **iPhone 16 Pro Max** as physical reference
10. **Characters page layout**: iPhone mockup + character list + timeline controls

## Implementation Tasks

### Phase 1A: Lock Screen Redesign

#### Task 1: Create ClassStatusBar Component
**File**: `frontend/components/phone-system/lock-screen/ClassStatusBar.tsx`

**Requirements**:
- Show time of day as: dawn, morning, midday, afternoon, evening, night (with icons)
- Display next activity: type (class/training/gym/spa/social/rest), name, location, time until
- Show mandatory vs optional indicator (amber for mandatory)
- Battery indicator only when low (< 20%), with warning pulse
- NO signal bars, NO actual clock time, NO carrier info

**Interface**:
```typescript
export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

export interface NextActivity {
  type: 'class' | 'training' | 'gym' | 'spa' | 'social' | 'rest';
  name: string;
  location: string;
  timeUntil: string;
  isMandatory: boolean;
}
```

#### Task 2: Update PhoneLockScreen
**File**: `frontend/components/phone-system/lock-screen/PhoneLockScreen.tsx`

**Changes**:
- Replace old StatusBar with ClassStatusBar
- Add `timeOfDay`, `nextActivity`, `batteryLevel` props
- Remove signal strength, actual time display
- Keep photo gallery (95% of screen)
- Keep ID overlay (5% at bottom)

#### Task 3: Create SchoolSocialApp Component
**File**: `frontend/components/phone-system/apps/SchoolSocialApp.tsx`

**Features**:
- Internal school social media feed (like Instagram)
- Photo upload interface
- Rankings/stats tab (follower count, student rank)
- Messages/chat tab
- Premium content lock indicators
- Engagement metrics (likes, comments)

**Interface**:
```typescript
export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPremium: boolean;
  tags: string[];
}
```

### Phase 1B: Photo Quality System

#### Task 4: Create PhotoAssessment Component
**File**: `frontend/components/phone-system/assessment/PhotoAssessment.tsx`

**Purpose**: Evaluate photos based on:
- Lighting quality
- Composition
- Pose confidence
- **Beauty/sensuality/attractiveness score** (AI-simulated)
- Overall quality tier: poor → average → good → excellent

**Visual**: Show score breakdown with progress bars

### Phase 1C: Characters Page Integration

#### Task 5: Create iPhoneMockup Component
**File**: `frontend/components/phone-system/device/IPhoneMockup.tsx`

**Requirements**:
- Realistic iPhone 16 Pro Max dimensions (163mm x 77mm)
- Dynamic Island notch
- Titanium frame styling
- Glass back effect
- Side buttons (volume, power, action button)

#### Task 6: Update Characters Page Layout
**File**: `frontend/app/characters-new/page.tsx`

**New Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Header with breadcrumbs, search, spoiler controls          │
├─────────────────────────────────────────────────────────────┤
│ View tabs: Cards | Graph | Timeline | Families             │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌───────────────────────────────┐    │
│ │                  │  │ Character List                │    │
│ │  iPhone Mockup   │  │ - Kiara (active)              │    │
│ │                  │  │ - Elise                       │    │
│ │  Shows selected  │  │ - Chloe                       │    │
│ │  character's     │  │ - Sophie                      │    │
│ │  lock screen     │  └───────────────────────────────┘    │
│ │                  │  ┌───────────────────────────────┐    │
│ └──────────────────┘  │ Timeline Controls             │    │
│                       │ [Ep 1] [Ep 3] [Ep 6] [Ep 10]  │    │
│                       │ Mode: [Student] [Owner]       │    │
│                       │ Time: [Morning] [Midday]      │    │
│                       └───────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1D: Index Exports

#### Task 7: Update Component Exports
**Files**:
- `frontend/components/phone-system/lock-screen/index.ts`
- `frontend/components/phone-system/apps/index.ts`
- `frontend/components/phone-system/index.ts`
- `frontend/components/index.ts`

## Photo Quality Rubric

### Poor (Episode 1-2)
- Lighting: Harsh shadows or overexposed
- Composition: Off-center, awkward crop
- Pose: Stiff, uncomfortable
- Beauty Score: < 40/100

### Average (Episode 3-5)
- Lighting: Decent but flat
- Composition: Centered, basic
- Pose: Natural but tentative
- Beauty Score: 40-60/100

### Good (Episode 6-8)
- Lighting: Professional setup
- Composition: Interesting angles
- Pose: Confident, engaging
- Beauty Score: 60-80/100

### Excellent (Episode 9-10)
- Lighting: Studio quality
- Composition: Artistic, magazine-worthy
- Pose: Alluring, captivating
- Beauty Score: 80-100/100

## Sample Next Activities

```typescript
const sampleActivities: NextActivity[] = [
  { type: 'training', name: 'Companion Etiquette', location: 'Hall A', timeUntil: '15 min', isMandatory: true },
  { type: 'gym', name: 'Cardio Conditioning', location: 'Fitness Center', timeUntil: '45 min', isMandatory: true },
  { type: 'spa', name: 'Wellness Session', location: 'Spa Wing', timeUntil: '2 hrs', isMandatory: false },
  { type: 'social', name: 'Photography Upload', location: 'Media Lab', timeUntil: 'Now', isMandatory: false },
  { type: 'class', name: 'Dance Practice', location: 'Studio 3', timeUntil: '30 min', isMandatory: true },
];
```

## Success Criteria

- [ ] ClassStatusBar shows relative time (morning/midday) not clock
- [ ] Next activity clearly displayed with location and urgency
- [ ] Low battery warning (< 20%) with pulse animation
- [ ] No signal bars, no carrier info, no actual time
- [ ] Photo quality evaluates beauty/sensuality metrics
- [ ] SchoolSocialApp has feed, upload, rankings, messages tabs
- [ ] Characters page shows iPhone mockup + list + controls
- [ ] All components TypeScript error-free
- [ ] Responsive design works on mobile and desktop

## Next Steps

Run `/start-work` to begin implementation with Sisyphus.
