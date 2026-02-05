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
    def __init__(
        self, video_dir: str, output_dir: str, characters_dir: Optional[str] = None
    ):
        self.video_dir = Path(video_dir)
        self.output_dir = Path(output_dir)
        self.characters_dir = Path(characters_dir) if characters_dir else None
        self.screenshots_dir = self.output_dir / "screenshots"
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)

        # Character recognition patterns - will be expanded from YAML
        self.characters = {}
        self.canonical_ids = {}  # Map canonical name to id

        # Load characters from YAML files if available
        if self.characters_dir and self.characters_dir.exists():
            self._load_characters_from_yaml()

        # Add fallback for primary characters if YAML not available
        if not self.characters:
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

        secondary_char_patterns = {
            "livia": ["livia", "livi"],
            "jonas": ["jonas"],
            "principal": ["principal", "rektor"],
            "felicia": ["felicia"],
            "didde": ["didde"],
            "siri": ["siri"],
            "kylie": ["kylie"],
            "kevin": ["kevin", "kev"],
            "adam": ["adam"],
            "batgirls": ["batgirls", "bat girls", "dance team"],
            "coach": ["coach", "tränare"],
            "substitute": ["substitute", "vikarie"],
        }

        for char_id, patterns in secondary_char_patterns.items():
            if char_id not in self.characters:
                self.characters[char_id] = patterns

        # Character aliases for matching variations
        self.character_aliases = {
            "affe": "alfred",
            "jack": "jacques",
            "livi": "livia",
            "kylie": "kylie",
            "kev": "kevin",
            "adam": "adam",
        }

        # Secondary characters detected from subtitles
        self.secondary_characters = [
            "livia",
            "jonas",
            "principal",
            "felicia",
            "didde",
            "siri",
            "kylie",
            "kevin",
            "adam",
        ]

        # Common stopwords to avoid false positives
        self.stopwords = {
            "the",
            "and",
            "or",
            "but",
            "a",
            "an",
            "as",
            "is",
            "are",
            "be",
            "been",
            "being",
            "have",
            "has",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "may",
            "might",
            "can",
            "must",
            "i",
            "me",
            "my",
            "we",
            "us",
            "you",
            "he",
            "she",
            "it",
            "they",
            "them",
            "this",
            "that",
            "these",
            "those",
            "what",
            "which",
            "who",
            "whom",
            "why",
            "how",
            "where",
            "when",
            "there",
            "here",
            "from",
            "to",
            "in",
            "on",
            "at",
            "by",
            "for",
            "with",
            "of",
        }

        # Content detection patterns - defined here so always available
        self.content_patterns = {
            "dance": [
                "dance",
                "dancing",
                "batgirls",
                "cheer",
                "routine",
                "performance",
                "audition",
                "dans",
            ],
            "training": [
                "training",
                "practice",
                "workout",
                "exercise",
                "rehearsal",
                "gym",
                "träning",
            ],
            "physical_intimacy": [
                "kiss",
                "kissing",
                "touch",
                "holding",
                "embrace",
                "intimate",
                "close",
                "kysser",
                "kyssa",
            ],
            "vampire_feeding": [
                "blood",
                "feeding",
                "bite",
                "hungry",
                "thirst",
                "triggered",
                "blod",
                "bitning",
            ],
            "confrontation": [
                "fight",
                "argue",
                "yell",
                "scream",
                "angry",
                "mad",
                "pissed",
                "bråka",
                "arg",
            ],
            "party": [
                "party",
                "masquerade",
                "ball",
                "celebration",
                "drunk",
                "dance floor",
                "fest",
                "bal",
            ],
        }

    def _load_characters_from_yaml(self):
        """Parse character YAML files without external dependencies."""
        if not self.characters_dir or not self.characters_dir.exists():
            return

        for yaml_file in sorted(self.characters_dir.glob("*.yaml")):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    content = f.read()

                char_id = None
                char_name = None

                for line in content.split("\n"):
                    if line.startswith("id:"):
                        char_id = line.split(":", 1)[1].strip()
                    elif line.startswith("name:"):
                        char_name = line.split(":", 1)[1].strip()

                    if char_id and char_name:
                        break

                if char_id and char_name:
                    patterns = [
                        p.strip()
                        for p in [
                            char_name.lower(),
                            char_id.lower(),
                            char_name.lower().split()[0],
                        ]
                        if p and len(p) >= 3
                    ]
                    self.characters[char_id] = patterns
                    self.canonical_ids[char_name.lower()] = char_id
            except Exception:
                pass

    def parse_timestamp(self, timestamp_str: str) -> float:
        """Convert SRT timestamp to seconds"""
        timestamp_str = timestamp_str.replace(",", ".")
        parts = timestamp_str.split(":")
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
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        duration_seconds = float(result.stdout.strip())
        duration_str = self.format_timestamp(duration_seconds)
        return duration_str, duration_seconds

    def extract_screenshot(
        self, video_path: Path, timestamp: float, output_name: str
    ) -> str:
        """Extract screenshot at specific timestamp"""
        output_path = self.screenshots_dir / output_name

        cmd = [
            "ffmpeg",
            "-ss",
            str(timestamp),
            "-i",
            str(video_path),
            "-vframes",
            "1",
            "-q:v",
            "2",  # High quality
            "-vf",
            "scale=1920:-1",  # Full HD width, maintain aspect
            str(output_path),
        ]

        subprocess.run(cmd, capture_output=True)
        return str(output_path)

    def _resolve_character_name(self, name: str) -> Optional[str]:
        """Resolve a detected name to canonical character ID."""
        name_lower = name.lower().strip()

        if not name_lower or len(name_lower) < 3:
            return None
        if name_lower in self.stopwords:
            return None

        if name_lower in self.character_aliases:
            return self.character_aliases[name_lower]

        # Check canonical_ids for multi-word names from YAML (e.g., "kiara natt och dag" -> "kiara_natt_och_dag")
        if name_lower in self.canonical_ids:
            return self.canonical_ids[name_lower]

        if name_lower in self.characters:
            return name_lower

        for secondary_char in self.secondary_characters:
            if secondary_char.startswith(name_lower) or name_lower.startswith(
                secondary_char
            ):
                return secondary_char

        return None

    def _extract_speaker_characters(self, text: str) -> List[str]:
        """Extract character names from speaker labels and direct address patterns."""
        characters = []
        text_lower = text.lower()

        # Match speaker prefix with Swedish letters and multi-word names
        speaker_prefix_match = re.match(r"^([A-Za-zÅÄÖåäö\s]+):\s", text)
        if speaker_prefix_match:
            name = speaker_prefix_match.group(1).strip()
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.append(resolved)

        # Greeting pattern with Swedish letters
        greeting_pattern = (
            r"\b(hi|hey|yo)\s*,?\s+([A-Za-zÅÄÖåäö\s]+?)(?:\s|,|\.|\!|\?|$)"
        )
        for match in re.finditer(greeting_pattern, text_lower):
            name = match.group(2).strip()
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.append(resolved)

        # Intro pattern with Swedish letters
        intro_pattern = r"my\s+name\s+is\s+([A-Za-zÅÄÖåäö\s]+?)(?:\s|,|\.|\!|\?|$)"
        for match in re.finditer(intro_pattern, text_lower):
            name = match.group(1).strip()
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.append(resolved)

        return list(set(characters))

    def analyze_subtitle_content(self, subtitle_path: Path) -> List[SceneMoment]:
        """Analyze subtitle file to identify key moments"""
        moments = []

        with open(subtitle_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse SRT format
        entries = re.split(r"\n\n+", content.strip())

        for entry in entries:
            lines = entry.strip().split("\n")
            if len(lines) < 3:
                continue

            timestamp_line = lines[1] if len(lines) > 1 else ""
            text = " ".join(lines[2:])

            # Parse timestamps
            match = re.match(
                r"(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})",
                timestamp_line,
            )
            if not match:
                continue

            start_time = self.parse_timestamp(match.group(1))
            end_time = self.parse_timestamp(match.group(2))
            mid_time = (start_time + end_time) / 2

            characters_present = []
            text_lower = text.lower()

            for char_name, patterns in self.characters.items():
                if any(pattern in text_lower for pattern in patterns):
                    characters_present.append(char_name)

            speaker_chars = self._extract_speaker_characters(text)
            for char in speaker_chars:
                if char not in characters_present:
                    characters_present.append(char)

            # Detect content type
            content_type = "dialogue"
            intensity = 1

            for ctype, patterns in self.content_patterns.items():
                if any(pattern in text_lower for pattern in patterns):
                    content_type = ctype
                    intensity = (
                        3 if ctype in ["physical_intimacy", "vampire_feeding"] else 2
                    )
                    break

            # Check for intense language
            intense_words = [
                "fuck",
                "shit",
                "damn",
                "hell",
                "sex",
                "naked",
                "horny",
                "lust",
            ]
            if any(word in text_lower for word in intense_words):
                intensity = max(intensity, 4)

            moment = SceneMoment(
                timestamp=self.format_timestamp(mid_time),
                timestamp_seconds=mid_time,
                description=text[:200] + "..." if len(text) > 200 else text,
                characters_present=characters_present,
                content_type=content_type,
                intensity=intensity,
            )
            moments.append(moment)

        return moments

    def filter_suggestive_scenes(self, moments: List[SceneMoment]) -> List[SceneMoment]:
        """Filter for dance, training, physical intimacy scenes"""
        suggestive_types = ["dance", "training", "physical_intimacy"]
        return [
            m for m in moments if m.content_type in suggestive_types or m.intensity >= 3
        ]

    def select_moments_for_screenshots(
        self, moments: List[SceneMoment], max_screenshots: int = 50
    ) -> List[SceneMoment]:
        """
        Select moments for screenshot extraction based on intensity and distribution.

        Strategy:
        1. Always include high-intensity moments (4-5)
        2. Include all suggestive content types (dance, training, physical_intimacy)
        3. Sample remaining moments evenly across the episode timeline
        """
        if not moments:
            return []

        # 1. High-intensity moments (4-5) - always include
        high_intensity = [m for m in moments if m.intensity >= 4]

        # 2. Suggestive content types - always include (if not already high-intensity)
        suggestive_types = ["dance", "training", "physical_intimacy", "vampire_feeding"]
        suggestive = [
            m
            for m in moments
            if m.content_type in suggestive_types and m not in high_intensity
        ]

        # 3. Calculate remaining budget for timeline sampling
        priority_count = len(high_intensity) + len(suggestive)
        remaining_budget = max(0, max_screenshots - priority_count)

        # 4. Sample remaining moments evenly across timeline
        other_moments = [
            m for m in moments if m not in high_intensity and m not in suggestive
        ]

        sampled = []
        if remaining_budget > 0 and other_moments:
            step = max(1, len(other_moments) // remaining_budget)
            sampled = other_moments[::step][:remaining_budget]

        # 5. Combine and sort by timestamp
        selected = high_intensity + suggestive + sampled
        selected.sort(key=lambda m: m.timestamp_seconds)

        print(
            f"    Selected {len(selected)} moments: "
            f"{len(high_intensity)} high-intensity, "
            f"{len(suggestive)} suggestive, "
            f"{len(sampled)} sampled"
        )

        return selected[:max_screenshots]

    def propagate_characters_in_scenes(
        self, moments: List[SceneMoment], window_seconds: float = 30.0
    ) -> List[SceneMoment]:
        """
        Second pass: propagate characters across nearby moments in group scenes.

        For non-dialogue scenes (dance, party, training, confrontation),
        characters mentioned nearby are likely still present.
        """
        group_scene_types = ["dance", "party", "training", "confrontation"]

        for i, moment in enumerate(moments):
            if moment.content_type not in group_scene_types:
                continue

            # Find characters in nearby moments (within window)
            nearby_characters = set()
            for j, other in enumerate(moments):
                if (
                    abs(other.timestamp_seconds - moment.timestamp_seconds)
                    <= window_seconds
                ):
                    nearby_characters.update(other.characters_present)

            # Add nearby characters to this moment
            if nearby_characters:
                moment.characters_present = list(
                    set(moment.characters_present) | nearby_characters
                )

        return moments

    def analyze_episode(self, video_file: str, subtitle_file: str) -> EpisodeAnalysis:
        """Analyze a single episode"""
        video_path = self.video_dir / video_file
        subtitle_path = self.video_dir / "Subtitles" / subtitle_file

        # Extract episode info from filename
        match = re.match(r"S(\d+)E(\d+)", video_file)
        season = int(match.group(1)) if match else 1
        episode_num = int(match.group(2)) if match else 1
        episode_id = f"s{season:02d}e{episode_num:02d}"

        # Get video duration
        duration_str, duration_seconds = self.get_video_duration(video_path)

        # Analyze subtitles
        print(f"Analyzing {video_file}...")
        moments = self.analyze_subtitle_content(subtitle_path)

        # Second pass: propagate characters in group scenes
        moments = self.propagate_characters_in_scenes(moments)

        # Select moments for screenshots using intensity-based sampling
        selected_moments = self.select_moments_for_screenshots(
            moments, max_screenshots=50
        )

        # Extract screenshots for selected moments
        screenshots = []
        for i, moment in enumerate(selected_moments):
            screenshot_name = (
                f"{episode_id}_moment_{i:03d}_{moment.timestamp.replace(':', '-')}.jpg"
            )
            screenshot_path = self.extract_screenshot(
                video_path, moment.timestamp_seconds, screenshot_name
            )
            moment.screenshot_path = screenshot_path
            screenshots.append(screenshot_path)
            print(
                f"  Extracted screenshot at {moment.timestamp} (intensity: {moment.intensity}, type: {moment.content_type})"
            )

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
            title=video_file.replace(".mp4", ""),
            duration=duration_str,
            duration_seconds=duration_seconds,
            key_moments=moments,
            character_appearances=character_appearances,
            suggestive_scenes=suggestive,
            all_screenshots=screenshots,
        )

    def analyze_all_episodes(self):
        """Analyze all episodes in the directory"""
        video_files = sorted([f for f in self.video_dir.glob("*.mp4")])

        analyses = []
        for video_file in video_files:
            # Find matching subtitle file
            episode_match = re.search(r"S(\d+)E(\d+)", video_file.name)
            if not episode_match:
                continue

            season = episode_match.group(1)
            episode = episode_match.group(2)

            # Look for subtitle file
            subtitle_patterns = [
                f"s{season}e{episode}.srt",
                f"s{season}e{episode}.txt",
                f"*s{season}e{episode}*.srt",
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
            "episodes": [asdict(a) for a in analyses],
        }

        output_file = self.output_dir / "video_analysis.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\nAnalysis complete! Results saved to {output_file}")
        print(f"Screenshots saved to {self.screenshots_dir}")

        return results


if __name__ == "__main__":
    video_dir = "/Users/wolfy/Downloads/Blod Svet Tararr"
    output_dir = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis"
    characters_dir = "/Users/wolfy/Developer/2026.Y/bats/data/characters"

    analyzer = VideoAnalyzer(video_dir, output_dir, characters_dir)
    results = analyzer.analyze_all_episodes()
