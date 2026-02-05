#!/usr/bin/env python3
"""
Enhanced Video Scene Analysis Tool for Blod, Svett, Tårar
Implements heuristic character extraction, extended screenshot coverage,
refined content taxonomy, and metadata extraction.
"""

import os
import json
import subprocess
import re
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import List, Optional, Tuple, Dict, Set
from datetime import timedelta
from collections import defaultdict


@dataclass
class SceneMoment:
    timestamp: str
    timestamp_seconds: float
    description: str
    characters_present: List[str]
    content_type: str
    intensity: int
    screenshot_path: Optional[str] = None
    location: Optional[str] = None
    mood: Optional[str] = None
    dialogue_type: Optional[str] = None
    relationships_highlighted: List[str] = field(default_factory=list)
    vampire_lore_elements: List[str] = field(default_factory=list)


@dataclass
class EpisodeAnalysis:
    episode_id: str
    episode_number: int
    title: str
    duration: str
    duration_seconds: float
    key_moments: List[SceneMoment]
    character_appearances: dict
    suggestive_scenes: List[SceneMoment]
    all_screenshots: List[str]
    locations_detected: List[str] = field(default_factory=list)
    content_type_distribution: dict = field(default_factory=dict)
    character_interactions: List[dict] = field(default_factory=list)


class EnhancedVideoAnalyzer:
    def __init__(self, video_dir: str, output_dir: str, characters_dir: Optional[str] = None):
        self.video_dir = Path(video_dir)
        self.output_dir = Path(output_dir)
        self.characters_dir = Path(characters_dir) if characters_dir else None
        self.screenshots_dir = self.output_dir / "screenshots"
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)

        self.characters = {}
        self.canonical_ids = {}
        self.character_aliases = {}
        
        if self.characters_dir and self.characters_dir.exists():
            self._load_characters_from_yaml()

        if not self.characters:
            self._init_fallback_characters()

        self._build_character_patterns()
        self.content_patterns = self._init_content_patterns()
        self.location_patterns = self._init_location_patterns()
        self.mood_patterns = self._init_mood_patterns()
        self.lore_patterns = self._init_lore_patterns()
        self.stopwords = self._init_stopwords()

    def _init_fallback_characters(self):
        self.characters = {
            "kiara": ["kiara", "natt och dag", "the vampire", "cold-blood", "kia"],
            "alfred": ["alfred", "carlsson", "affe"],
            "elise": ["elise", "elisa"],
            "chloe": ["chloe", "chloé"],
            "eric": ["eric", "erik"],
            "henry": ["henry", "natt och dag", "mr natt och dag", "father"],
            "jacques": ["jacques", "natt och dag", "uncle"],
            "desiree": ["desirée", "desiree", "natt och dag", "mrs natt och dag", "mother"],
            "livia": ["livia", "livi"],
            "jonas": ["jonas"],
            "principal": ["principal", "rektor"],
            "felicia": ["felicia"],
            "didde": ["didde"],
            "siri": ["siri"],
            "kylie": ["kylie"],
            "kevin": ["kevin", "kev"],
            "adam": ["adam"],
            "coach": ["coach", "tränare", "trainer"],
            "substitute": ["substitute", "vikarie"],
            "batgirls": ["batgirls", "bat girls", "dance team", "cheer squad"],
        }
        
        self.character_aliases = {
            "affe": "alfred",
            "kia": "kiara",
            "jack": "jacques",
            "livi": "livia",
            "kev": "kevin",
        }

    def _load_characters_from_yaml(self):
        for yaml_file in sorted(self.characters_dir.glob("*.yaml")):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    content = f.read()

                char_id = None
                char_name = None

                for line in content.split("\n"):
                    line = line.strip()
                    if line.startswith("id:"):
                        char_id = line.split(":", 1)[1].strip()
                    elif line.startswith("name:"):
                        char_name = line.split(":", 1)[1].strip()

                if char_id and char_name:
                    patterns = [char_name.lower(), char_id.lower()]
                    first_name = char_name.lower().split()[0]
                    if len(first_name) >= 3:
                        patterns.append(first_name)
                    
                    self.characters[char_id] = patterns
                    self.canonical_ids[char_name.lower()] = char_id
                    if len(first_name) >= 3:
                        self.canonical_ids[first_name] = char_id
                        
            except Exception as e:
                print(f"Warning: Could not load character from {yaml_file}: {e}")

    def _build_character_patterns(self):
        self.character_regexes = {}
        for char_id, patterns in self.characters.items():
            escaped_patterns = []
            for pattern in patterns:
                escaped = re.escape(pattern.lower())
                escaped_patterns.append(r'\b' + escaped + r'\b')
            combined = '|'.join(escaped_patterns)
            self.character_regexes[char_id] = re.compile(combined, re.IGNORECASE)

    def _init_content_patterns(self) -> Dict[str, List[str]]:
        return {
            "dialogue_romantic": ["love", "kiss", "heart", "crush", "like you", "love you", "attraction", "flirt", "flirting", "date", "dating", "kärlek", "kyss", "älskar", "tycker om"],
            "dialogue_confrontational": ["fight", "argue", "yell", "scream", "angry", "mad", "pissed", "hate", "stupid", "idiot", "shut up", "leave me alone", "bråka", "arg", "skrika", "skäms", "dum"],
            "dialogue_exposition": ["school", "classroom", "hallway", "corridor", "locker", "cafeteria", "gym", "principal", "explain", "tell me", "what happened", "how come", "skola", "klassrum", "korridor", "skåp", "kafeteria", "gympa", "rektor"],
            "dialogue_emotional": ["sad", "cry", "tears", "sorry", "upset", "worried", "scared", "afraid", "nervous", "anxious", "ledsen", "gråta", "tårar", "orolig", "rädd"],
            "dance": ["dance", "dancing", "batgirls", "cheer", "routine", "performance", "audition", "choreography", "dans", "dansa"],
            "training": ["training", "practice", "workout", "exercise", "rehearsal", "gym", "träning", "öva", "gympa"],
            "physical_intimacy": ["kiss", "kissing", "touch", "holding", "embrace", "hug", "intimate", "close", "cuddle", "kyss", "kyssa", "hålla om"],
            "confrontation": ["fight", "fighting", "punch", "hit", "slap", "push", "grab", "attack", "bråk", "slåss", "slå", "sparka"],
            "vampire_feeding": ["blood", "feeding", "feed", "bite", "biting", "hungry", "thirst", "thirsty", "triggered", "blod", "bitning", "bita", "hungrig", "törst", "törstig"],
            "vampire_lore": ["vampire", "vampires", "immortal", "fangs", "glamour", "compulsion", "daylight", "sun", "stake", "garlic", "vampyr", "odödlig", "tänder", "solljus"],
            "transformation": ["turn", "turned", "change", "becoming", "transform", "new vampire", "freshly turned", "förvandlas", "bli vampyr"],
            "party": ["party", "parties", "masquerade", "ball", "celebration", "drunk", "dance floor", "fest", "bal", "kalas", "dansa"],
            "social_drama": ["gossip", "rumor", "secret", "lie", "lying", "truth", "betray", "betrayal", "trust", "skvaller", "rykte", "lögn"],
            "hierarchy": ["queen", "popular", "cool", "loser", "nerd", "jock", "emo", "goth", "status", "rank", "alpha", "beta"],
            "dark_desire": ["want", "need", "desire", "lust", "passion", "hunger", "craving", "obsession", "possessive", "mine", "begär", "lusta", "passion", "hunger", "besatt"],
            "power_dynamic": ["control", "dominant", "submissive", "obey", "command", "master", "serve", "authority", "power", "kontroll", "lyda"],
            "taboo": ["forbidden", "wrong", "shouldn't", "can't", "secret", "hide", "hidden", "förbjuden", "fel", "hemlig", "dölja"],
        }

    def _init_location_patterns(self) -> Dict[str, List[str]]:
        return {
            "school": ["school", "classroom", "hallway", "corridor", "locker", "cafeteria", "gym", "principal's office", "skola", "klassrum", "korridor", "skåp", "kafeteria", "gympa", "rektorns kontor"],
            "natt_och_dag_mansion": ["mansion", "house", "natt och dag", "living room", "kitchen", "bedroom", "study", "library", "herregård", "hus", "vardagsrum", "kök", "sovrum", "bibliotek"],
            "dance_studio": ["studio", "dance studio", "rehearsal space", "practice room", "dansstudio", "övningslokal"],
            "party_venue": ["party", "club", "bar", "masquerade", "ballroom", "venue", "festlokal", "klubb", "bar", "balrum"],
            "outdoors": ["outside", "park", "street", "forest", "woods", "garden", "ute", "park", "gata", "skog", "trädgård"],
            "bedroom": ["bedroom", "my room", "your room", "bed", "sleep", "sovrum", "mitt rum", "ditt rum", "säng", "sova"],
        }

    def _init_mood_patterns(self) -> Dict[str, List[str]]:
        return {
            "tense": ["tense", "awkward", "uncomfortable", "silence", "staring", "spänd", "obekväm", "tystnad", "stirra"],
            "romantic": ["romantic", "sweet", "tender", "soft", "gentle", "romantisk", "söt", "mjuk", "ömt"],
            "dramatic": ["dramatic", "intense", "serious", "heavy", "deep", "dramatisk", "intensiv", "allvarlig", "djup"],
            "comedic": ["funny", "laugh", "joke", "hilarious", "ridiculous", "rolig", "skratta", "skämt", "löjlig"],
            "dark": ["dark", "creepy", "scary", "disturbing", "unsettling", "mörk", "läskig", "otäck", "störande"],
            "melancholic": ["sad", "melancholy", "depressed", "lonely", "empty", "ledsen", "melankolisk", "deprimerad", "ensam", "tom"],
        }

    def _init_lore_patterns(self) -> Dict[str, List[str]]:
        return {
            "blood_bond": ["blood bond", "bond", "connected", "feel you", "taste", "blood", "blodsband", "band", "känna dig", "smaka"],
            "glamour": ["glamour", "compel", "compulsion", "influence", "control mind", "tvinga", "påverka", "kontrollera"],
            "daywalking": ["daylight", "sun", "ring", "daywalker", "walk in sun", "solljus", "sol", "ring", "dagvandrare"],
            "feeding": ["feed", "feeding", "hunt", "hunting", "prey", "victim", "föda", "jakt", "jaga", "byte", "offer"],
            "transformation": ["turn", "turned", "become", "change", "new vampire", "förvandlas", "bli", "förändras", "ny vampyr"],
            "family": ["sire", "childe", "progeny", "bloodline", "clan", "skapare", "avkomma", "blodslinje", "klan"],
        }

    def _init_stopwords(self) -> Set[str]:
        return {"the", "and", "or", "but", "a", "an", "as", "is", "are", "be", "been", "being", "have", "has", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "must", "i", "me", "my", "we", "us", "you", "he", "she", "it", "they", "them", "this", "that", "these", "those", "what", "which", "who", "whom", "why", "how", "where", "when", "there", "here", "from", "to", "in", "on", "at", "by", "for", "with", "of", "not", "no", "yes", "oh", "ah", "um", "uh", "yeah", "okay", "ok", "right", "well", "so", "just", "really", "very", "too", "also", "only", "then", "now", "here", "there", "up", "down", "out", "over", "under", "again", "further", "once", "more", "most", "other", "some", "time", "way", "than", "own", "same", "such", "all", "any", "both", "each", "few"}

    def parse_timestamp(self, timestamp_str: str) -> float:
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
        td = timedelta(seconds=int(seconds))
        return str(td)

    def get_video_duration(self, video_path: Path) -> Tuple[str, float]:
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        duration_seconds = float(result.stdout.strip())
        duration_str = self.format_timestamp(duration_seconds)
        return duration_str, duration_seconds

    def extract_screenshot(self, video_path: Path, timestamp: float, output_name: str) -> str:
        output_path = self.screenshots_dir / output_name
        cmd = ["ffmpeg", "-ss", str(timestamp), "-i", str(video_path), "-vframes", "1", "-q:v", "2", "-vf", "scale=1920:-1", str(output_path)]
        subprocess.run(cmd, capture_output=True)
        return str(output_path)

    def _resolve_character_name(self, name: str) -> Optional[str]:
        name_lower = name.lower().strip()
        if not name_lower or len(name_lower) < 3:
            return None
        if name_lower in self.stopwords:
            return None
        if name_lower in self.character_aliases:
            return self.character_aliases[name_lower]
        if name_lower in self.canonical_ids:
            return self.canonical_ids[name_lower]
        if name_lower in self.characters:
            return name_lower
        for char_id, patterns in self.characters.items():
            for pattern in patterns:
                if pattern in name_lower or name_lower in pattern:
                    return char_id
        return None

    def _extract_characters_heuristic(self, text: str) -> List[str]:
        characters = set()
        
        # Method 1: Speaker prefix patterns
        speaker_patterns = [
            r'^[-–]?\s*([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?)[:\?\.]\s',
            r'^([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?):\s',
        ]
        
        for pattern in speaker_patterns:
            match = re.match(pattern, text)
            if match:
                name = match.group(1).strip()
                resolved = self._resolve_character_name(name)
                if resolved:
                    characters.add(resolved)

        # Method 2: Direct address patterns
        text_lower = text.lower()
        address_patterns = [
            r'\b(hi|hey|hello|yo|excuse me)\s*,?\s+([A-ZÅÄÖ][a-zåäö]+)\b',
            r'\b(thanks|thank you)\s+,?\s+([A-ZÅÄÖ][a-zåäö]+)\b',
            r'\b(sorry|pardon)\s+,?\s+([A-ZÅÄÖ][a-zåäö]+)\b',
        ]
        
        for pattern in address_patterns:
            for match in re.finditer(pattern, text_lower):
                start, end = match.span(2)
                name = text[start:end]
                resolved = self._resolve_character_name(name)
                if resolved:
                    characters.add(resolved)

        # Method 3: Introduction patterns
        intro_patterns = [
            r'my name is\s+([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?)',
            r'i am\s+([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?)',
            r'this is\s+([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?)',
        ]
        
        for pattern in intro_patterns:
            for match in re.finditer(pattern, text_lower):
                start, end = match.span(1)
                name = text[start:end]
                resolved = self._resolve_character_name(name)
                if resolved:
                    characters.add(resolved)

        # Method 4: Known character regex patterns
        for char_id, regex in self.character_regexes.items():
            if regex.search(text):
                characters.add(char_id)

        # Method 5: Title-cased tokens
        title_pattern = r'\b([A-ZÅÄÖ][a-zåäö]*(?:\s+[A-ZÅÄÖ][a-zåäö]*){0,2})\b'
        for match in re.finditer(title_pattern, text):
            name = match.group(1).strip()
            if len(name) >= 3 and name.lower() not in self.stopwords:
                resolved = self._resolve_character_name(name)
                if resolved:
                    characters.add(resolved)

        # Method 6: Possessive patterns
        possessive_pattern = r"\b([A-ZÅÄÖ][a-zåäö]+)'s?\s+(?:house|room|car|phone|book|bag)"
        for match in re.finditer(possessive_pattern, text):
            name = match.group(1)
            resolved = self._resolve_character_name(name)
            if resolved:
                characters.add(resolved)

        return list(characters)

    def _detect_content_type(self, text: str) -> Tuple[str, int]:
        text_lower = text.lower()
        type_scores = {}
        
        for ctype, patterns in self.content_patterns.items():
            score = sum(1 for pattern in patterns if pattern in text_lower)
            if score > 0:
                type_scores[ctype] = score
        
        if not type_scores:
            return "dialogue", 1
        
        best_type = max(type_scores, key=type_scores.get)
        intensity = 1
        
        if best_type in ["physical_intimacy", "vampire_feeding", "dark_desire"]:
            intensity = 3
        elif best_type in ["confrontation", "taboo", "power_dynamic"]:
            intensity = 3
        elif best_type in ["dance", "training", "party"]:
            intensity = 2
        
        intense_words = ["fuck", "shit", "damn", "hell", "sex", "naked", "horny", "lust", "desire", "obsession", "control", "master", "slave", "blood", "bite", "kill", "die", "death", "murder"]
        intense_count = sum(1 for word in intense_words if word in text_lower)
        if intense_count >= 2:
            intensity = min(5, intensity + 2)
        elif intense_count == 1:
            intensity = min(5, intensity + 1)
        
        return best_type, intensity

    def _detect_location(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        location_scores = {}
        
        for location, patterns in self.location_patterns.items():
            score = sum(1 for pattern in patterns if pattern in text_lower)
            if score > 0:
                location_scores[location] = score
        
        if location_scores:
            return max(location_scores, key=location_scores.get)
        return None

    def _detect_mood(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        mood_scores = {}
        
        for mood, patterns in self.mood_patterns.items():
            score = sum(1 for pattern in patterns if pattern in text_lower)
            if score > 0:
                mood_scores[mood] = score
        
        if mood_scores:
            return max(mood_scores, key=mood_scores.get)
        return None

    def _detect_lore_elements(self, text: str) -> List[str]:
        text_lower = text.lower()
        elements = []
        
        for element, patterns in self.lore_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                elements.append(element)
        
        return elements

    def _extract_dialogue_subtype(self, content_type: str, text: str) -> Optional[str]:
        if not content_type.startswith("dialogue"):
            return None
        if content_type != "dialogue":
            return content_type.replace("dialogue_", "")
        return "general"

    def _detect_relationships(self, characters: List[str], text: str) -> List[str]:
        if len(characters) < 2:
            return []
        
        relationships = []
        text_lower = text.lower()
        
        relationship_indicators = {
            "romantic": ["love", "kiss", "like", "attracted", "crush", "date", "together"],
            "hostile": ["hate", "fight", "angry", "mad", "annoying", "stupid", "idiot"],
            "friendly": ["friend", "help", "thanks", "nice", "cool", "buddy"],
            "familial": ["father", "mother", "dad", "mom", "sister", "brother", "family"],
            "authority": ["sir", "ma'am", "mr", "mrs", "principal", "teacher", "boss"],
        }
        
        for rel_type, indicators in relationship_indicators.items():
            if any(ind in text_lower for ind in indicators):
                for i, char1 in enumerate(characters):
                    for char2 in characters[i+1:]:
                        relationships.append(f"{char1}-{char2}:{rel_type}")
        
        return relationships

    def analyze_subtitle_content(self, subtitle_path: Path) -> List[SceneMoment]:
        moments = []
        
        with open(subtitle_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        entries = re.split(r"\n\n+", content.strip())
        
        for entry in entries:
            lines = entry.strip().split("\n")
            if len(lines) < 3:
                continue
            
            timestamp_line = lines[1] if len(lines) > 1 else ""
            text = " ".join(lines[2:])
            
            match = re.match(r"(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})", timestamp_line)
            if not match:
                continue
            
            start_time = self.parse_timestamp(match.group(1))
            end_time = self.parse_timestamp(match.group(2))
            mid_time = (start_time + end_time) / 2
            
            characters_present = self._extract_characters_heuristic(text)
            content_type, intensity = self._detect_content_type(text)
            location = self._detect_location(text)
            mood = self._detect_mood(text)
            dialogue_type = self._extract_dialogue_subtype(content_type, text)
            lore_elements = self._detect_lore_elements(text)
            relationships = self._detect_relationships(characters_present, text)
            
            moment = SceneMoment(
                timestamp=self.format_timestamp(mid_time),
                timestamp_seconds=mid_time,
                description=text[:200] + "..." if len(text) > 200 else text,
                characters_present=characters_present,
                content_type=content_type,
                intensity=intensity,
                location=location,
                mood=mood,
                dialogue_type=dialogue_type,
                relationships_highlighted=relationships,
                vampire_lore_elements=lore_elements,
            )
            moments.append(moment)
        
        return moments

    def filter_suggestive_scenes(self, moments: List[SceneMoment]) -> List[SceneMoment]:
        suggestive_types = ["dance", "training", "physical_intimacy", "dark_desire", "vampire_feeding"]
        return [m for m in moments if m.content_type in suggestive_types or m.intensity >= 3]

    def select_moments_for_screenshots(self, moments: List[SceneMoment], max_screenshots: int = 100) -> List[SceneMoment]:
        if not moments:
            return []
        
        high_intensity = [m for m in moments if m.intensity >= 4]
        suggestive_types = ["dance", "training", "physical_intimacy", "vampire_feeding", "dark_desire", "power_dynamic", "taboo"]
        suggestive = [m for m in moments if m.content_type in suggestive_types and m not in high_intensity]
        lore_moments = [m for m in moments if m.vampire_lore_elements and m not in high_intensity and m not in suggestive]
        
        priority_count = len(high_intensity) + len(suggestive) + len(lore_moments)
        remaining_budget = max(0, max_screenshots - priority_count)
        
        other_moments = [m for m in moments if m not in high_intensity and m not in suggestive and m not in lore_moments]
        
        sampled = []
        if remaining_budget > 0 and other_moments:
            step = max(1, len(other_moments) // remaining_budget)
            sampled = other_moments[::step][:remaining_budget]
        
        selected = high_intensity + suggestive + lore_moments + sampled
        selected.sort(key=lambda m: m.timestamp_seconds)
        
        print(f"    Selected {len(selected)} moments: {len(high_intensity)} high-intensity, {len(suggestive)} suggestive, {len(lore_moments)} lore, {len(sampled)} sampled")
        
        return selected[:max_screenshots]

    def propagate_characters_in_scenes(self, moments: List[SceneMoment], window_seconds: float = 30.0) -> List[SceneMoment]:
        group_scene_types = ["dance", "party", "training", "confrontation", "party"]
        
        for i, moment in enumerate(moments):
            if moment.content_type not in group_scene_types:
                continue
            
            nearby_characters = set()
            for j, other in enumerate(moments):
                if abs(other.timestamp_seconds - moment.timestamp_seconds) <= window_seconds:
                    nearby_characters.update(other.characters_present)
            
            if nearby_characters:
                moment.characters_present = list(set(moment.characters_present) | nearby_characters)
        
        return moments

    def _aggregate_metadata(self, moments: List[SceneMoment]) -> dict:
        locations = set()
        content_distribution = defaultdict(int)
        character_pairs = defaultdict(int)
        
        for moment in moments:
            if moment.location:
                locations.add(moment.location)
            content_distribution[moment.content_type] += 1
            
            chars = sorted(moment.characters_present)
            for i, char1 in enumerate(chars):
                for char2 in chars[i+1:]:
                    pair = f"{char1}-{char2}"
                    character_pairs[pair] += 1
        
        top_interactions = [
            {"pair": pair, "count": count}
            for pair, count in sorted(character_pairs.items(), key=lambda x: x[1], reverse=True)
            if count >= 2
        ]
        
        return {
            "locations_detected": sorted(locations),
            "content_type_distribution": dict(content_distribution),
            "character_interactions": top_interactions[:20],
        }

    def analyze_episode(self, video_file: str, subtitle_file: str) -> EpisodeAnalysis:
        video_path = self.video_dir / video_file
        subtitle_path = self.video_dir / "Subtitles" / subtitle_file
        
        match = re.match(r"S(\d+)E(\d+)", video_file)
        season = int(match.group(1)) if match else 1
        episode_num = int(match.group(2)) if match else 1
        episode_id = f"s{season:02d}e{episode_num:02d}"
        
        duration_str, duration_seconds = self.get_video_duration(video_path)
        
        print(f"Analyzing {video_file}...")
        moments = self.analyze_subtitle_content(subtitle_path)
        moments = self.propagate_characters_in_scenes(moments)
        
        selected_moments = self.select_moments_for_screenshots(moments, max_screenshots=100)
        
        screenshots = []
        for i, moment in enumerate(selected_moments):
            screenshot_name = f"{episode_id}_moment_{i:03d}_{moment.timestamp.replace(':', '-')}.jpg"
            screenshot_path = self.extract_screenshot(video_path, moment.timestamp_seconds, screenshot_name)
            moment.screenshot_path = screenshot_path
            screenshots.append(screenshot_path)
            if i < 5 or i % 10 == 0:
                print(f"  [{i+1}/{len(selected_moments)}] {moment.timestamp} - {moment.content_type} (intensity: {moment.intensity})")
        
        character_appearances = defaultdict(list)
        for moment in moments:
            for char in moment.characters_present:
                character_appearances[char].append(moment.timestamp)
        
        suggestive = self.filter_suggestive_scenes(moments)
        metadata = self._aggregate_metadata(moments)
        
        return EpisodeAnalysis(
            episode_id=episode_id,
            episode_number=episode_num,
            title=video_file.replace(".mp4", ""),
            duration=duration_str,
            duration_seconds=duration_seconds,
            key_moments=moments,
            character_appearances=dict(character_appearances),
            suggestive_scenes=suggestive,
            all_screenshots=screenshots,
            locations_detected=metadata["locations_detected"],
            content_type_distribution=metadata["content_type_distribution"],
            character_interactions=metadata["character_interactions"],
        )

    def analyze_all_episodes(self):
        video_files = sorted([f for f in self.video_dir.glob("*.mp4")])
        
        analyses = []
        for video_file in video_files:
            episode_match = re.search(r"S(\d+)E(\d+)", video_file.name)
            if not episode_match:
                continue
            
            season = episode_match.group(1)
            episode = episode_match.group(2)
            
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
        
        results = {
            "total_episodes": len(analyses),
            "episodes": [asdict(a) for a in analyses],
        }
        
        output_file = self.output_dir / "video_analysis_enhanced.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\nEnhanced analysis complete! Results saved to {output_file}")
        print(f"Screenshots saved to {self.screenshots_dir}")
        
        print("\n" + "="*60)
        print("ANALYSIS SUMMARY")
        print("="*60)
        for analysis in analyses:
            print(f"\n{analysis.episode_id.upper()}:")
            print(f"  Duration: {analysis.duration}")
            print(f"  Total moments: {len(analysis.key_moments)}")
            print(f"  Screenshots: {len(analysis.all_screenshots)}")
            print(f"  Characters detected: {len(analysis.character_appearances)}")
            print(f"  Locations: {', '.join(analysis.locations_detected) or 'None detected'}")
            print(f"  Content types: {len(analysis.content_type_distribution)}")
            print(f"  Top interactions: {len(analysis.character_interactions)}")
        
        return results


if __name__ == "__main__":
    video_dir = "/Users/wolfy/Downloads/Blod Svet Tararr"
    output_dir = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis"
    characters_dir = "/Users/wolfy/Developer/2026.Y/bats/data/characters"
    
    analyzer = EnhancedVideoAnalyzer(video_dir, output_dir, characters_dir)
    results = analyzer.analyze_all_episodes()
