# Video Analysis & Scene Extraction Plan

## Objective

Analyze all 7 episodes of "Blod, Svett, Tårar" to:
1. Extract screenshots at key moments
2. Identify scenes with character appearances
3. Detect suggestive/physical content (dance, training, cheerleading, intimacy)
4. Map scenes to timestamps
5. Create a visual scene database for the wiki

## Source Materials

**Video Files:** `/Users/wolfy/Downloads/Blod Svet Tararr/`
- S01E01 - Kallblodig skolstart.mp4 (468MB)
- S01E02 - Audition till Batgirls.mp4 (556MB)
- S01E03 - Lunch hos Natt och Dag.mp4 (618MB)
- S01E04 - En oväntad fest.mp4 (554MB)
- S01E05 - Nödvamp och nördar.mp4 (618MB)
- S01E06 - Blåljus och blod.mp4 (582MB)
- S01E07 - Försonas i en kyss.mp4 (467MB)

**Subtitle Files:** `/Users/wolfy/Downloads/Blod Svet Tararr/Subtitles/`
- SRT format subtitles for all episodes
- Already contain dialogue with timestamps

## Implementation

### Step 1: Create Video Analysis Script

Create `scripts/analyze_videos.py`:

```python
#!/usr/bin/env python3
"""
Video Scene Analysis Tool for Blod, Svett, Tårar
Extracts screenshots, identifies scenes, characters, and suggestive content
"""

import os
import json
import subprocess
import re
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple
from datetime import timedelta

@dataclass
class SceneMoment:
    timestamp: str  # HH:MM:SS
    timestamp_seconds: float
    description: str
    characters_present: List[str]
    content_type: str  # "dialogue", "physical", "intimate", "dance", "training", etc.
    intensity: int  # 1-5
    screenshot_path: Optional[str] = None

@dataclass
class EpisodeAnalysis:
    episode_id: str
    episode_number: int
    title: str
    duration: str
    duration_seconds: float
    key_moments: List[SceneMoment]
    character_appearances: dict  # character -> list of timestamps
    suggestive_scenes: List[SceneMoment]  # dance, training, physical intimacy
    all_screenshots: List[str]

class VideoAnalyzer:
    def __init__(self, video_dir: str, output_dir: str):
        self.video_dir = Path(video_dir)
        self.output_dir = Path(output_dir)
        self.screenshots_dir = self.output_dir / "screenshots"
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        
        # Character recognition patterns
        self.characters = {
            "kiara": ["kiara", "natt och dag", "the vampire", "cold-blood"],
            "alfred": ["alfred", "carlsson"],
            "elise": ["elise"],
            "chloe": ["chloe"],
            "eric": ["eric"],
            "henry": ["henry", "natt och dag"],
            "jacques": ["jacques", "natt och dag"],
            "desiree": ["desirée", "desiree", "natt och dag"],
        }
        
        # Content detection patterns
        self.content_patterns = {
            "dance": ["dance", "dancing", "batgirls", "cheer", "routine", "performance", "audition"],
            "training": ["training", "practice", "workout", "exercise", "rehearsal", "gym"],
            "physical_intimacy": ["kiss", "kissing", "touch", "holding", "embrace", "intimate", "close"],
            "vampire_feeding": ["blood", "feeding", "bite", "hungry", "thirst", "triggered"],
            "confrontation": ["fight", "argue", "yell", "scream", "angry", "mad", "pissed"],
            "party": ["party", "masquerade", "ball", "celebration", "drunk", "dance floor"],
        }
    
    def parse_timestamp(self, timestamp_str: str) -> float:
        """Convert SRT timestamp to seconds"""
        timestamp_str = timestamp_str.replace(',', '.')
        parts = timestamp_str.split(':')
        if len(parts) == 3:
            hours, minutes, seconds = parts
            return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
        elif len(parts) == 2:
            minutes, seconds = parts
            return int(minutes) * 60 + float(seconds)
        return 0.0
    
    def format_timestamp(self, seconds: float) -> str:
        """Convert seconds to HH:MM:SS"""
        td = timedelta(seconds=int(seconds))
        return str(td)
    
    def get_video_duration(self, video_path: Path) -> Tuple[str, float]:
        """Get video duration using ffprobe"""
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(video_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        duration_seconds = float(result.stdout.strip())
        duration_str = self.format_timestamp(duration_seconds)
        return duration_str, duration_seconds
    
    def extract_screenshot(self, video_path: Path, timestamp: float, output_name: str) -> str:
        """Extract screenshot at specific timestamp"""
        output_path = self.screenshots_dir / output_name
        
        cmd = [
            "ffmpeg",
            "-ss", str(timestamp),
            "-i", str(video_path),
            "-vframes", "1",
            "-q:v", "2",  # High quality
            "-vf", "scale=1920:-1",  # Full HD width, maintain aspect
            str(output_path)
        ]
        
        subprocess.run(cmd, capture_output=True)
        return str(output_path)
    
    def analyze_subtitle_content(self, subtitle_path: Path) -> List[SceneMoment]:
        """Analyze subtitle file to identify key moments"""
        moments = []
        
        with open(subtitle_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse SRT format
        entries = re.split(r'\n\n+', content.strip())
        
        for entry in entries:
            lines = entry.strip().split('\n')
            if len(lines) < 3:
                continue
            
            timestamp_line = lines[1] if len(lines) > 1 else ""
            text = ' '.join(lines[2:])
            
            # Parse timestamps
            match = re.match(r'(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})', timestamp_line)
            if not match:
                continue
            
            start_time = self.parse_timestamp(match.group(1))
            end_time = self.parse_timestamp(match.group(2))
            mid_time = (start_time + end_time) / 2
            
            # Detect characters present
            characters_present = []
            text_lower = text.lower()
            for char_name, patterns in self.characters.items():
                if any(pattern in text_lower for pattern in patterns):
                    characters_present.append(char_name)
            
            # Detect content type
            content_type = "dialogue"
            intensity = 1
            
            for ctype, patterns in self.content_patterns.items():
                if any(pattern in text_lower for pattern in patterns):
                    content_type = ctype
                    intensity = 3 if ctype in ["physical_intimacy", "vampire_feeding"] else 2
                    break
            
            # Check for intense language
            intense_words = ["fuck", "shit", "damn", "hell", "sex", "naked", "horny", "lust"]
            if any(word in text_lower for word in intense_words):
                intensity = max(intensity, 4)
            
            moment = SceneMoment(
                timestamp=self.format_timestamp(mid_time),
                timestamp_seconds=mid_time,
                description=text[:200] + "..." if len(text) > 200 else text,
                characters_present=characters_present,
                content_type=content_type,
                intensity=intensity
            )
            moments.append(moment)
        
        return moments
    
    def filter_suggestive_scenes(self, moments: List[SceneMoment]) -> List[SceneMoment]:
        """Filter for dance, training, physical intimacy scenes"""
        suggestive_types = ["dance", "training", "physical_intimacy"]
        return [m for m in moments if m.content_type in suggestive_types or m.intensity >= 3]
    
    def analyze_episode(self, video_file: str, subtitle_file: str) -> EpisodeAnalysis:
        """Analyze a single episode"""
        video_path = self.video_dir / video_file
        subtitle_path = self.video_dir / "Subtitles" / subtitle_file
        
        # Extract episode info from filename
        match = re.match(r'S(\d+)E(\d+)', video_file)
        season = int(match.group(1)) if match else 1
        episode_num = int(match.group(2)) if match else 1
        episode_id = f"s{season:02d}e{episode_num:02d}"
        
        # Get video duration
        duration_str, duration_seconds = self.get_video_duration(video_path)
        
        # Analyze subtitles
        print(f"Analyzing {video_file}...")
        moments = self.analyze_subtitle_content(subtitle_path)
        
        # Extract screenshots for key moments
        screenshots = []
        for i, moment in enumerate(moments[:20]):  # Limit to first 20 moments
            screenshot_name = f"{episode_id}_moment_{i:03d}_{moment.timestamp.replace(':', '-')}.jpg"
            screenshot_path = self.extract_screenshot(
                video_path, 
                moment.timestamp_seconds, 
                screenshot_name
            )
            moment.screenshot_path = screenshot_path
            screenshots.append(screenshot_path)
            print(f"  Extracted screenshot at {moment.timestamp}")
        
        # Compile character appearances
        character_appearances = {}
        for moment in moments:
            for char in moment.characters_present:
                if char not in character_appearances:
                    character_appearances[char] = []
                character_appearances[char].append(moment.timestamp)
        
        # Filter suggestive scenes
        suggestive = self.filter_suggestive_scenes(moments)
        
        return EpisodeAnalysis(
            episode_id=episode_id,
            episode_number=episode_num,
            title=video_file.replace('.mp4', ''),
            duration=duration_str,
            duration_seconds=duration_seconds,
            key_moments=moments,
            character_appearances=character_appearances,
            suggestive_scenes=suggestive,
            all_screenshots=screenshots
        )
    
    def analyze_all_episodes(self):
        """Analyze all episodes in the directory"""
        video_files = sorted([f for f in self.video_dir.glob("*.mp4")])
        
        analyses = []
        for video_file in video_files:
            # Find matching subtitle file
            episode_match = re.search(r'S(\d+)E(\d+)', video_file.name)
            if not episode_match:
                continue
            
            season = episode_match.group(1)
            episode = episode_match.group(2)
            
            # Look for subtitle file
            subtitle_patterns = [
                f"s{season}e{episode}.srt",
                f"s{season}e{episode}.txt",
                f"*s{season}e{episode}*.srt"
            ]
            
            subtitle_file = None
            for pattern in subtitle_patterns:
                matches = list((self.video_dir / "Subtitles").glob(pattern))
                if matches:
                    subtitle_file = matches[0].name
                    break
            
            if subtitle_file:
                analysis = self.analyze_episode(video_file.name, subtitle_file)
                analyses.append(analysis)
            else:
                print(f"No subtitle found for {video_file.name}")
        
        # Save results
        results = {
            "total_episodes": len(analyses),
            "episodes": [asdict(a) for a in analyses]
        }
        
        output_file = self.output_dir / "video_analysis.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\nAnalysis complete! Results saved to {output_file}")
        print(f"Screenshots saved to {self.screenshots_dir}")
        
        return results

if __name__ == "__main__":
    video_dir = "/Users/wolfy/Downloads/Blod Svet Tararr"
    output_dir = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis"
    
    analyzer = VideoAnalyzer(video_dir, output_dir)
    results = analyzer.analyze_all_episodes()
```

### Step 2: Create Output Directory Structure

```
data/video_analysis/
├── video_analysis.json      # Master analysis file
├── screenshots/
│   ├── s01e01_moment_000_00-00-15.jpg
│   ├── s01e01_moment_001_00-02-30.jpg
│   └── ...
└── scenes/
    ├── s01e01_dance_scenes.json
    ├── s01e01_training_scenes.json
    └── ...
```

### Step 3: Run the Analysis

```bash
cd /Users/wolfy/Developer/2026.Y/bats
python scripts/analyze_videos.py
```

## What the Script Will Extract

### 1. Character Appearances
- Every timestamp where each character speaks or is mentioned
- Frequency of appearance per episode
- Character co-occurrence (who appears together)

### 2. Suggestive/Physical Content Detection

**Dance Scenes:**
- Keywords: "dance", "dancing", "batgirls", "cheer", "routine", "performance", "audition"
- Will capture all Batgirls training and performance scenes

**Training/Workout Scenes:**
- Keywords: "training", "practice", "workout", "exercise", "rehearsal", "gym"
- Physical training montages

**Physical Intimacy:**
- Keywords: "kiss", "kissing", "touch", "holding", "embrace", "intimate", "close"
- Romantic/erotic moments

**Vampire Feeding/Blood:**
- Keywords: "blood", "feeding", "bite", "hungry", "thirst", "triggered"
- Vampire feeding scenes (highly relevant for dark adaptation)

### 3. Screenshots
- High-quality 1920px wide screenshots
- Taken at midpoint of each dialogue segment
- Named with episode and timestamp for easy reference
- Organized by episode

### 4. Intensity Rating
Each scene gets an intensity score (1-5):
- 1: Dialogue, exposition
- 2: Mild tension, social conflict
- 3: Strong emotions, confrontation, dance/training
- 4: Physical intimacy, violence, adult language
- 5: Extreme content, vampire feeding, heavy themes

## Output Format

The `video_analysis.json` will contain:

```json
{
  "total_episodes": 7,
  "episodes": [
    {
      "episode_id": "s01e01",
      "episode_number": 1,
      "title": "S01E01 - Kallblodig skolstart [Blod svett tårar]",
      "duration": "0:28:15",
      "duration_seconds": 1695.0,
      "key_moments": [
        {
          "timestamp": "0:00:15",
          "timestamp_seconds": 15.0,
          "description": "Welcome back to the vampire channel...",
          "characters_present": ["alfred"],
          "content_type": "dialogue",
          "intensity": 1,
          "screenshot_path": ".../screenshots/s01e01_moment_000_00-00-15.jpg"
        }
      ],
      "character_appearances": {
        "kiara": ["0:02:30", "0:05:15", "0:08:45"],
        "alfred": ["0:00:15", "0:03:20"],
        "elise": ["0:04:10", "0:07:30"]
      },
      "suggestive_scenes": [
        {
          "timestamp": "0:12:30",
          "content_type": "dance",
          "intensity": 3,
          "description": "Batgirls audition scene..."
        }
      ],
      "all_screenshots": [...]
    }
  ]
}
```

## Integration with Wiki

After analysis, the data can be:

1. **Linked to Episode Pages** - Show screenshots alongside transcript
2. **Character Galleries** - All screenshots featuring specific characters
3. **Theme Collections** - All dance scenes, all training scenes, etc.
4. **Timeline Visualization** - Intensity graph with screenshot thumbnails
5. **Scene Cards** - Rich preview cards with screenshot, timestamp, description

## Requirements

- **ffmpeg** - For screenshot extraction (already installed)
- **ffprobe** - For video metadata (already installed)
- **Python 3** - For analysis script (already installed)
- **~5GB disk space** - For screenshots (estimated 20 screenshots × 7 episodes × ~35KB each)

## Expected Runtime

- Screenshot extraction: ~2-3 minutes per episode (14-21 minutes total)
- Subtitle analysis: ~30 seconds per episode
- **Total: ~20-25 minutes** for all 7 episodes

## Next Steps After Analysis

1. Review extracted screenshots
2. Manually curate/tag the most important scenes
3. Integrate screenshots into episode interface
4. Create themed galleries (Dance Scenes, Training Scenes, etc.)
5. Use screenshots for character profile images

## Success Criteria

- [ ] All 7 episodes analyzed
- [ ] 20+ screenshots extracted per episode
- [ ] Character appearance data complete
- [ ] Suggestive scenes identified and categorized
- [ ] Data successfully integrated into wiki interface

## Progress

- [x] Update video analysis script to expand character detection (YAML + subtitle heuristics)
- [x] Regenerate video analysis JSON and screenshots with expanded character set
