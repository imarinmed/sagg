#!/usr/bin/env python3
"""
Video Scene Analysis Tool v2 for Blod, Svett, Tårar
Enhanced character detection with 15+ secondary characters, speaker label extraction, and alias resolution
"""

import os
import json
import subprocess
import re
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Dict, Set
from datetime import timedelta


@dataclass
class SceneMoment:
    timestamp: str  # HH:MM:SS
    timestamp_seconds: float
    description: str
    characters_present: List[str]
    content_type: str  # "dialogue", "physical", "intimate", "dance", "training", etc.
    intensity: int  # 1-5
    location: Optional[str] = None
    screenshot_path: Optional[str] = None


@dataclass
class Scene:
    """A grouped collection of temporally-close moments forming a logical scene."""

    scene_id: str  # e.g., "s01e01_scene_001"
    start_time: str  # HH:MM:SS
    end_time: str  # HH:MM:SS
    start_seconds: float
    end_seconds: float
    duration_seconds: float
    characters: List[str]  # Merged from all moments in scene
    intensity: int  # Max intensity from all moments (1-5)
    content_type: str  # Primary content type (most frequent or highest intensity)
    moment_count: int  # Number of moments in this scene
    moments: List[SceneMoment]  # Reference to all moments in scene
    location: Optional[str] = None  # Primary location detected in scene


@dataclass
class NarrativeBeats:
    """Narrative structure beats for an episode."""

    inciting_incident: Optional[str] = None  # timestamp
    inciting_incident_seconds: Optional[float] = None
    rising_action_start: Optional[str] = None
    rising_action_start_seconds: Optional[float] = None
    climax: Optional[str] = None
    climax_seconds: Optional[float] = None
    falling_action_start: Optional[str] = None
    falling_action_start_seconds: Optional[float] = None
    resolution: Optional[str] = None
    resolution_seconds: Optional[float] = None
    # Act structure
    act_1_end_seconds: Optional[float] = None  # ~20% of episode
    act_2_end_seconds: Optional[float] = None  # ~80% of episode
    # Confidence scores (0-1)
    confidence: float = 0.0


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
    scenes: Optional[List[Scene]] = None
    narrative_beats: Optional[NarrativeBeats] = None


class VideoAnalyzer:
    def __init__(
        self, video_dir: str, output_dir: str, characters_dir: Optional[str] = None
    ):
        self.video_dir = Path(video_dir)
        self.output_dir = Path(output_dir)
        self.characters_dir = Path(characters_dir) if characters_dir else None
        self.screenshots_dir = self.output_dir / "screenshots"
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)

        # Character recognition patterns - expanded from YAML
        self.characters = {}
        self.canonical_ids = {}  # Map canonical name to id
        self.character_aliases = {}  # Alias -> canonical id mapping

        # Load characters from YAML files if available
        if self.characters_dir and self.characters_dir.exists():
            self._load_characters_from_yaml()

        # Add fallback for primary characters if YAML not available
        if not self.characters:
            self.characters = {
                "kiara": ["kiara", "natt och dag", "the vampire", "cold-blood"],
                "alfred": ["alfred", "carlsson", "affe"],
                "elise": ["elise"],
                "chloe": ["chloe"],
                "eric": ["eric"],
                "henry": ["henry", "natt och dag"],
                "jacques": ["jacques", "natt och dag", "jack"],
                "desiree": ["desirée", "desiree", "natt och dag"],
            }

        # 15+ NEW SECONDARY CHARACTERS
        secondary_char_patterns = {
            # Characters from existing analysis
            "livia": ["livia", "livi"],
            "jonas": ["jonas"],
            "principal": ["principal", "rektor", "headmaster"],
            "felicia": ["felicia"],
            "didde": ["didde"],
            "siri": ["siri"],
            "kylie": ["kylie"],
            "kevin": ["kevin", "kev"],
            "adam": ["adam"],
            # New Teachers
            "teacher_math": ["math teacher", "math instructor", "mr.", "fru"],
            "teacher_english": ["english teacher", "english instructor", "språk"],
            "substitute_teacher": ["substitute", "vikarie", "temp teacher"],
            # New Batgirls (unnamed dancers)
            "batgirl_1": ["batgirl", "dancer", "cheerleader", "cheer"],
            "batgirl_2": ["bat girl", "dance team", "squad"],
            "batgirl_3": ["batgirls", "bat girls", "dance routine"],
            # Party/School Students
            "party_student_1": ["student", "partygoer", "attendee"],
            "party_student_2": ["classmate", "schoolmate", "peer"],
            "party_student_3": ["friend group", "friend", "buddy"],
            # Family/Staff
            "father": ["dad", "father", "pappa"],
            "mother": ["mom", "mother", "mamma"],
            "janitor": ["janitor", "custodian", "cleaner", "vaktmästare"],
            "lunch_lady": ["lunch lady", "cafeteria", "cook", "kokska"],
            "coach": ["coach", "trainer", "instructor", "tränare"],
            # Additional characters
            "security": ["security", "guard", "security guard"],
            "counselor": ["counselor", "school nurse", "nurse", "skolsköterska"],
            "librarian": ["librarian", "library", "bibliotek"],
        }

        for char_id, patterns in secondary_char_patterns.items():
            if char_id not in self.characters:
                self.characters[char_id] = patterns

        # Expanded character aliases for Swedish names and nicknames
        self.character_aliases = {
            "affe": "alfred",
            "jack": "jacques",
            "livi": "livia",
            "kylie": "kylie",
            "kev": "kevin",
            "adam": "adam",
            "rektor": "principal",
            "vikarie": "substitute_teacher",
            "vaktmästare": "janitor",
            "kokska": "lunch_lady",
            "tränare": "coach",
            "skolsköterska": "counselor",
            "pappa": "father",
            "mamma": "mother",
        }

        # Secondary characters detected from subtitles
        self.secondary_characters = list(secondary_char_patterns.keys())

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
            "det",
            "den",
            "de",
            "han",
            "hon",
            "det",
            "och",
            "eller",
            "men",
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
                "dansar",
                "dansgrupp",
            ],
            "training": [
                "training",
                "practice",
                "workout",
                "exercise",
                "rehearsal",
                "gym",
                "träning",
                "tränar",
                "övning",
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
                "hålla",
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
                "biter",
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
                "gräla",
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
                "festa",
            ],
        }

        # Location detection patterns - match against subtitle context
        self.location_patterns = {
            "school": [
                "school",
                "skola",
                "classroom",
                "klassrum",
                "hallway",
                "korridor",
                "cafeteria",
                "lunch room",
                "gymnasium",
            ],
            "castle": [
                "castle",
                "slott",
                "natt och dag",
                "cellar",
                "källare",
                "dungeon",
                "basement",
            ],
            "gym": [
                "gym",
                "training room",
                "dance studio",
                "övningslokal",
                "träningslokal",
                "fitness",
            ],
            "party": [
                "party",
                "fest",
                "masquerade",
                "bal",
                "dance floor",
                "nightclub",
                "club",
            ],
            "outdoors": [
                "outside",
                "outdoors",
                "park",
                "woods",
                "skog",
                "forest",
                "garden",
                "street",
                "gata",
            ],
            "home": [
                "home",
                "house",
                "bedroom",
                "sovrum",
                "kitchen",
                "kök",
                "living room",
                "apartment",
                "lägenhet",
            ],
            "car": ["car", "vehicle", "driving", "biltur", "backseat", "trunk"],
        }

    def _load_characters_from_yaml(self):
        """Parse character YAML files and extract names, aliases, and variations."""
        if not self.characters_dir or not self.characters_dir.exists():
            return

        for yaml_file in sorted(self.characters_dir.glob("*.yaml")):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    content = f.read()

                char_id = None
                char_name = None
                aliases = []

                for line in content.split("\n"):
                    if line.startswith("id:"):
                        char_id = line.split(":", 1)[1].strip()
                    elif line.startswith("name:"):
                        char_name = line.split(":", 1)[1].strip()
                    # Extract aliases from YAML if present
                    elif "alias" in line.lower() and ":" in line:
                        alias = line.split(":", 1)[1].strip()
                        if alias:
                            aliases.append(alias)

                if char_id and char_name:
                    # Build pattern list with name, id, first name, and Swedish variations
                    patterns = []

                    # Add full name and lowercase version
                    patterns.append(char_name.lower())

                    # Add character ID
                    if char_id and len(char_id) >= 3:
                        patterns.append(char_id.lower())

                    # Add first name
                    first_name = char_name.lower().split()[0]
                    if len(first_name) >= 3:
                        patterns.append(first_name)

                    # Add aliases
                    for alias in aliases:
                        alias_lower = alias.lower().strip()
                        if len(alias_lower) >= 3:
                            patterns.append(alias_lower)

                    # Remove duplicates while preserving order
                    patterns = list(dict.fromkeys(patterns))

                    self.characters[char_id] = patterns
                    self.canonical_ids[char_name.lower()] = char_id

            except Exception as e:
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

        # Check aliases first
        if name_lower in self.character_aliases:
            return self.character_aliases[name_lower]

        # Check canonical_ids for multi-word names from YAML
        if name_lower in self.canonical_ids:
            return self.canonical_ids[name_lower]

        # Check if name is a known character ID
        if name_lower in self.characters:
            return name_lower

        # Fuzzy match against secondary characters
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

        # SPEAKER PREFIX: "Name: dialogue" format with Swedish letters
        speaker_prefix_match = re.match(r"^([A-Za-zÅÄÖåäö\s]+?):\s", text)
        if speaker_prefix_match:
            name = speaker_prefix_match.group(1).strip()
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.append(resolved)

        # GREETING PATTERN: "hi/hey Name"
        greeting_pattern = (
            r"\b(hi|hey|yo)\s*,?\s+([A-Za-zÅÄÖåäö\s]+?)(?:\s|,|\.|\!|\?|$)"
        )
        for match in re.finditer(greeting_pattern, text_lower):
            name = match.group(2).strip()
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.append(resolved)

        # INTRO PATTERN: "my name is Name"
        intro_pattern = r"my\s+name\s+is\s+([A-Za-zÅÄÖåäö\s]+?)(?:\s|,|\.|\!|\?|$)"
        for match in re.finditer(intro_pattern, text_lower):
            name = match.group(1).strip()
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.append(resolved)

        # TITLE-CASED TOKEN EXTRACTION: Capture capitalized words as potential character names
        # This catches unnamed characters like "Mr. Anderson" or role descriptors
        title_words = re.findall(r"\b([A-Z][a-z]+)\b", text)
        for word in title_words:
            resolved = self._resolve_character_name(word)
            if resolved and resolved not in characters:
                characters.append(resolved)

        return list(set(characters))

    def _extract_title_cased_roles(self, text: str) -> List[str]:
        """Extract role-based characters from title-cased words."""
        characters = []

        # Look for role keywords in capital letters
        role_patterns = {
            "teacher": "teacher_english",
            "coach": "coach",
            "principal": "principal",
            "janitor": "janitor",
            "counselor": "counselor",
            "nurse": "counselor",
            "guard": "security",
        }

        text_lower = text.lower()
        for role, char_id in role_patterns.items():
            if role in text_lower:
                characters.append(char_id)

        return list(set(characters))

    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location from subtitle text using pattern matching."""
        text_lower = text.lower()

        for location, patterns in self.location_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return location

        return None

    def analyze_subtitle_content(self, subtitle_path: Path) -> List[SceneMoment]:
        """Analyze subtitle file to identify key moments with expanded character detection."""
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

            # 1. PATTERN MATCHING: Direct keyword search
            for char_name, patterns in self.characters.items():
                if any(pattern in text_lower for pattern in patterns):
                    characters_present.append(char_name)

            # 2. SPEAKER EXTRACTION: Parse "Name: dialogue" format
            speaker_chars = self._extract_speaker_characters(text)
            for char in speaker_chars:
                if char not in characters_present:
                    characters_present.append(char)

            # 3. ROLE-BASED EXTRACTION: Detect teachers, coaches, etc.
            role_chars = self._extract_title_cased_roles(text)
            for char in role_chars:
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

            location = self._extract_location(text)

            moment = SceneMoment(
                timestamp=self.format_timestamp(mid_time),
                timestamp_seconds=mid_time,
                description=text[:200] + "..." if len(text) > 200 else text,
                characters_present=characters_present,
                content_type=content_type,
                intensity=intensity,
                location=location,
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
        """Select moments for screenshot extraction based on intensity and distribution."""
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
        """Propagate characters across nearby moments in group scenes."""
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

    def _create_scene_from_moments(
        self, moments: List[SceneMoment], episode_id: str, scene_index: int
    ) -> Scene:
        """Create a Scene from a cluster of temporally-close moments."""
        all_characters = set()
        for moment in moments:
            all_characters.update(moment.characters_present)

        max_intensity = max(m.intensity for m in moments)

        content_type_counts = {}
        for m in moments:
            ct = m.content_type
            if ct not in content_type_counts:
                content_type_counts[ct] = {"count": 0, "max_intensity": 0}
            content_type_counts[ct]["count"] += 1
            content_type_counts[ct]["max_intensity"] = max(
                content_type_counts[ct]["max_intensity"], m.intensity
            )

        primary_content_type = "dialogue"
        best_score = 0
        for ct, data in content_type_counts.items():
            score = data["count"] + (data["max_intensity"] * 2)
            if ct != "dialogue":
                score += 3
            if score > best_score:
                best_score = score
                primary_content_type = ct

        location_counts = {}
        for m in moments:
            if m.location:
                location_counts[m.location] = location_counts.get(m.location, 0) + 1

        primary_location = None
        if location_counts:
            primary_location = sorted(location_counts.items(), key=lambda x: x[1])[-1][
                0
            ]

        start_seconds = moments[0].timestamp_seconds
        end_seconds = moments[-1].timestamp_seconds

        return Scene(
            scene_id=f"{episode_id}_scene_{scene_index:03d}",
            start_time=self.format_timestamp(start_seconds),
            end_time=self.format_timestamp(end_seconds),
            start_seconds=start_seconds,
            end_seconds=end_seconds,
            duration_seconds=end_seconds - start_seconds,
            characters=sorted(list(all_characters)),
            intensity=max_intensity,
            content_type=primary_content_type,
            moment_count=len(moments),
            moments=moments,
            location=primary_location,
        )

    def _cluster_moments_into_scenes(
        self,
        moments: List[SceneMoment],
        episode_id: str,
        threshold_seconds: float = 10.0,
    ) -> List[Scene]:
        """Cluster moments into scenes using temporal proximity (45s default threshold)."""
        if not moments:
            return []

        sorted_moments = sorted(moments, key=lambda m: m.timestamp_seconds)

        scene_clusters = []
        current_cluster = [sorted_moments[0]]

        for moment in sorted_moments[1:]:
            time_gap = moment.timestamp_seconds - current_cluster[-1].timestamp_seconds
            if time_gap < threshold_seconds:
                current_cluster.append(moment)
            else:
                scene_clusters.append(current_cluster)
                current_cluster = [moment]

        if current_cluster:
            scene_clusters.append(current_cluster)

        merged_clusters = self._merge_small_scenes(scene_clusters, threshold_seconds)

        scenes = []
        for idx, cluster in enumerate(merged_clusters):
            scene = self._create_scene_from_moments(cluster, episode_id, idx + 1)
            scenes.append(scene)

        return scenes

    def _merge_small_scenes(
        self, clusters: List[List[SceneMoment]], threshold_seconds: float
    ) -> List[List[SceneMoment]]:
        """Merge scenes with fewer than 3 moments into neighbors."""
        if len(clusters) <= 1:
            return clusters

        min_moments = 3
        merged = []
        i = 0

        while i < len(clusters):
            cluster = clusters[i]

            if len(cluster) >= min_moments:
                merged.append(cluster)
                i += 1
                continue

            if i == 0 and len(clusters) > 1:
                clusters[1] = cluster + clusters[1]
                i += 1
                continue

            if merged:
                last_merged = merged[-1]
                prev_end = last_merged[-1].timestamp_seconds
                curr_start = cluster[0].timestamp_seconds

                if i + 1 < len(clusters):
                    next_start = clusters[i + 1][0].timestamp_seconds
                    curr_end = cluster[-1].timestamp_seconds

                    gap_to_prev = curr_start - prev_end
                    gap_to_next = next_start - curr_end

                    if gap_to_prev <= gap_to_next:
                        merged[-1] = last_merged + cluster
                    else:
                        clusters[i + 1] = cluster + clusters[i + 1]
                else:
                    merged[-1] = last_merged + cluster
            else:
                if i + 1 < len(clusters):
                    clusters[i + 1] = cluster + clusters[i + 1]
                else:
                    merged.append(cluster)

            i += 1

        return merged

    def detect_narrative_beats(
        self, moments: List[SceneMoment], duration_seconds: float
    ) -> NarrativeBeats:
        if not moments or duration_seconds <= 0:
            return NarrativeBeats(confidence=0.0)

        act_1_end = duration_seconds * 0.20
        act_2_end = duration_seconds * 0.80
        act_1_threshold = duration_seconds * 0.25
        climax_start = duration_seconds * 0.60
        climax_end = duration_seconds * 0.85
        resolution_start = duration_seconds * 0.85

        sorted_moments = sorted(moments, key=lambda m: m.timestamp_seconds)

        inciting_incident = None
        inciting_incident_seconds = None
        inciting_incident_intensity = 0

        for m in sorted_moments:
            if m.timestamp_seconds > act_1_threshold:
                break
            if m.intensity > inciting_incident_intensity:
                inciting_incident_intensity = m.intensity
                inciting_incident = m.timestamp
                inciting_incident_seconds = m.timestamp_seconds

        climax = None
        climax_seconds = None
        climax_intensity = 0

        for m in sorted_moments:
            if climax_start <= m.timestamp_seconds <= climax_end:
                if m.intensity > climax_intensity:
                    climax_intensity = m.intensity
                    climax = m.timestamp
                    climax_seconds = m.timestamp_seconds

        if climax_seconds is None:
            max_moment = max(sorted_moments, key=lambda m: m.intensity)
            climax = max_moment.timestamp
            climax_seconds = max_moment.timestamp_seconds
            climax_intensity = max_moment.intensity

        rising_action_start = None
        rising_action_start_seconds = None

        if inciting_incident_seconds:
            for m in sorted_moments:
                if m.timestamp_seconds > inciting_incident_seconds:
                    rising_action_start = m.timestamp
                    rising_action_start_seconds = m.timestamp_seconds
                    break

        falling_action_start = None
        falling_action_start_seconds = None

        if climax_seconds:
            for m in sorted_moments:
                if m.timestamp_seconds > climax_seconds:
                    falling_action_start = m.timestamp
                    falling_action_start_seconds = m.timestamp_seconds
                    break

        resolution = None
        resolution_seconds = None
        resolution_intensity = float("inf")

        for m in sorted_moments:
            if m.timestamp_seconds >= resolution_start:
                if m.intensity < resolution_intensity:
                    resolution_intensity = m.intensity
                    resolution = m.timestamp
                    resolution_seconds = m.timestamp_seconds

        confidence = 0.0
        confidence_factors = []

        if inciting_incident_seconds and inciting_incident_seconds < act_1_threshold:
            confidence_factors.append(0.25)

        if climax_seconds and climax_start <= climax_seconds <= climax_end:
            confidence_factors.append(0.35)

        if climax_intensity >= 3:
            confidence_factors.append(0.20)

        if (
            inciting_incident_seconds
            and climax_seconds
            and inciting_incident_seconds < climax_seconds
        ):
            confidence_factors.append(0.20)

        confidence = sum(confidence_factors)

        return NarrativeBeats(
            inciting_incident=inciting_incident,
            inciting_incident_seconds=inciting_incident_seconds,
            rising_action_start=rising_action_start,
            rising_action_start_seconds=rising_action_start_seconds,
            climax=climax,
            climax_seconds=climax_seconds,
            falling_action_start=falling_action_start,
            falling_action_start_seconds=falling_action_start_seconds,
            resolution=resolution,
            resolution_seconds=resolution_seconds,
            act_1_end_seconds=act_1_end,
            act_2_end_seconds=act_2_end,
            confidence=confidence,
        )

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

        # Cluster moments into scenes
        scenes = self._cluster_moments_into_scenes(moments, episode_id)
        print(f"  Grouped {len(moments)} moments into {len(scenes)} scenes")

        narrative_beats = self.detect_narrative_beats(moments, duration_seconds)
        print(
            f"  Narrative beats detected (confidence: {narrative_beats.confidence:.0%})"
        )

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
            scenes=scenes,
            narrative_beats=narrative_beats,
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

        output_file = self.output_dir / "video_analysis_v2.json"
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
