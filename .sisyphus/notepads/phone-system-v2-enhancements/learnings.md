## 2026-02-06 Task: Phase A verification
- /characters page renders CharactersPhoneView directly; no view toggle in page file.
- Phase A tasks 1-2 verified complete (toggle removed, phone view default).

## 2026-02-06 Task: Phase A layout
- CharactersPhoneView updated to 3-column layout with dominant center phone and right lifeline placeholder.
- Phone scale increased (~1.25) and left list tightened (smaller padding/avatar).

## Layout Patterns
- **3-Column Grid for Desktop**: Used `lg:grid lg:grid-cols-[280px_1fr_280px]` to create a dominant center stage for the phone interface while keeping side panels (list and future timeline) accessible but unobtrusive.
- **Scaling Transforms**: Used `scale-125` in Framer Motion animation to significantly increase the visual weight of the phone component without altering its internal layout logic.
- **Glassmorphism Placeholders**: Created a placeholder for the "Lifeline" column using consistent glassmorphism styles (`bg-black/40 backdrop-blur-xl`) to maintain visual consistency even for empty states.

## 2026-02-06 Task: Frame tones
- IPhoneMockup now supports frameTone variants (titanium, silver, graphite, obsidian, gold, rose-gold) with dynamic frame/btn styling.

## 2026-02-06 Task: Device logic
- CharactersPhoneView now chooses ChainHolster for females (gold or rose-gold) and IPhoneMockup for males (silver or obsidian) based on character variant.

## 2026-02-06 Task: Phase C Timeline
- Implemented vertical timeline in CharactersPhoneView.tsx replacing the placeholder.
- Used Array(10) to generate 10 episode nodes.
- Used framer-motion layout and layoutId for smooth state transitions.
- Local state viewEpisode allows independent navigation within the phone view.
