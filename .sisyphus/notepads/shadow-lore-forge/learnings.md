# Phone System Demo

Created a dedicated demo page for the Vinterhall Phone System at `/phone-demo`.

## Features
- **Interactive Phone Mockup**: Uses `ChainHolster` and `PhoneLockScreen` components.
- **Dynamic State**: Controls for Episode (1-10), Time of Day, Geofence Mode, and Next Activity.
- **Visual Progression**: Demonstrates photo quality improvement and nickname degradation over episodes.
- **Customization**: Switchable holster materials (Silver, Gold, Obsidian, Rose Gold).

## Components Used
- `frontend/components/phone-system/lock-screen/PhoneLockScreen.tsx`
- `frontend/components/phone-system/phone-device/ChainHolster.tsx`

## Usage
Navigate to `/phone-demo` to interact with the system.

## Phone View Implementation (Characters Page)
- Created `PhoneView` component with split layout (Phone/Controls).
- Integrated `ChainHolster` and `PhoneLockScreen` components.
- Added "Phone" tab to `characters-new` page.
- Updated `useViewState` to support 'phone' mode.
- Mapped existing `demoStudents` data to `StudentData` format required by phone components.
- Added mock photos for demonstration purposes.

## Geofencing System
- Implemented `GeofenceProvider` with three modes: public, student, owner.
- Permissions logic centralized in provider to control access to photos, ID, schedule, and tracking.
- Persistence via localStorage ensures mode remains consistent across reloads.
- Simulated location mapping (Town/Campus/Private) tied to geofence mode for now.
