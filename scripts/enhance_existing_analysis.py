#!/usr/bin/env python3
"""
Enhance existing video_analysis.json with improved character extraction and metadata.
This script processes the existing analysis without requiring video files.
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from typing import List, Optional, Dict, Set


class ExistingAnalysisEnhancer:
    def __init__(self, characters_dir: Optional[str] = None):
        self.characters_dir = Path(characters_dir) if characters_dir else None
        
        # Initialize character data
        self.characters = {}
        self.canonical_ids = {}
        self.character_aliases = {}
        self.character_regexes = {}
        
        if self.characters_dir and self.characters_dir.exists():
            self._load_characters_from_yaml()
        
        if not self.characters:
            self._init_fallback_characters()
        
        self._build_character_patterns()
        
        # Initialize patterns
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

    def _init_content_patterns(self):
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

    def _init_location_patterns(self):
        return {
            "school": ["school", "classroom", "hallway", "corridor", "locker", "cafeteria", "gym", "principal's office", "skola", "klassrum", "korridor", "skåp", "kafeteria", "gympa", "rektorns kontor"],
            "natt_och_dag_mansion": ["mansion", "house", "natt och dag", "living room", "kitchen", "bedroom", "study", "library", "herregård", "hus", "vardagsrum", "kök", "sovrum", "bibliotek"],
            "dance_studio": ["studio", "dance studio", "rehearsal space", "practice room", "dansstudio", "övningslokal"],
            "party_venue": ["party", "club", "bar", "masquerade", "ballroom", "venue", "festlokal", "klubb", "bar", "balrum"],
            "outdoors": ["outside", "park", "street", "forest", "woods", "garden", "ute", "park", "gata", "skog", "trädgård"],
            "bedroom": ["bedroom", "my room", "your room", "bed", "sleep", "sovrum", "mitt rum", "ditt rum", "säng", "sova"],
        }

    def _init_mood_patterns(self):
        return {
            "tense": ["tense", "awkward", "uncomfortable", "silence", "staring", "spänd", "obekväm", "tystnad", "stirra"],
            "romantic": ["romantic", "sweet", "tender", "soft", "gentle", "romantisk", "söt", "mjuk", "ömt"],
            "dramatic": ["dramatic", "intense", "serious", "heavy", "deep", "dramatisk", "intensiv", "allvarlig", "djup"],
            "comedic": ["funny", "laugh", "joke", "hilarious", "ridiculous", "rolig", "skratta", "skämt", "löjlig"],
            "dark": ["dark", "creepy", "scary", "disturbing", "unsettling", "mörk", "läskig", "otäck", "störande"],
            "melancholic": ["sad", "melancholy", "depressed", "lonely", "empty", "ledsen", "melankolisk", "deprimerad", "ensam", "tom"],
        }

    def _init_lore_patterns(self):
        return {
            "blood_bond": ["blood bond", "bond", "connected", "feel you", "taste", "blood", "blodsband", "band", "känna dig", "smaka"],
            "glamour": ["glamour", "compel", "compulsion", "influence", "control mind", "tvinga", "påverka", "kontrollera"],
            "daywalking": ["daylight", "sun", "ring", "daywalker", "walk in sun", "solljus", "sol", "ring", "dagvandrare"],
            "feeding": ["feed", "feeding", "hunt", "hunting", "prey", "victim", "föda", "jakt", "jaga", "byte", "offer"],
            "transformation": ["turn", "turned", "become", "change", "new vampire", "förvandlas", "bli", "förändras", "ny vampyr"],
            "family": ["sire", "childe", "progeny", "bloodline", "clan", "skapare", "avkomma", "blodslinje", "klan"],
        }

    def _init_stopwords(self):
        return {"the", "and", "or", "but", "a", "an", "as", "is", "are", "be", "been", "being", "have", "has", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "must", "i", "me", "my", "we", "us", "you", "he", "she", "it", "they", "them", "this", "that", "these", "those", "what", "which", "who", "whom", "why", "how", "where", "when", "there", "here", "from", "to", "in", "on", "at", "by", "for", "with", "of", "not", "no", "yes", "oh", "ah", "um", "uh", "yeah", "okay", "ok", "right", "well", "so", "just", "really", "very", "too", "also", "only", "then", "now", "here", "there", "up", "down", "out", "over", "under", "again", "further", "once", "more", "most", "other", "some", "time", "way", "than", "own", "same", "such", "all", "any", "both", "each", "few"}

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

    def _detect_content_type(self, text: str):
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

    def enhance_moment(self, moment: dict) -> dict:
        """Enhance a single moment with improved character extraction and metadata."""
        text = moment.get("description", "")
        
        # Extract characters using heuristics
        characters = self._extract_characters_heuristic(text)
        if not characters:
            characters = moment.get("characters_present", [])
        
        # Detect content type and intensity
        content_type, intensity = self._detect_content_type(text)
        
        # Detect additional metadata
        location = self._detect_location(text)
        mood = self._detect_mood(text)
        lore_elements = self._detect_lore_elements(text)
        relationships = self._detect_relationships(characters, text)
        
        # Update moment
        enhanced = moment.copy()
        enhanced["characters_present"] = characters
        enhanced["content_type"] = content_type
        enhanced["intensity"] = intensity
        enhanced["location"] = location
        enhanced["mood"] = mood
        enhanced["vampire_lore_elements"] = lore_elements
        enhanced["relationships_highlighted"] = relationships
        
        return enhanced

    def enhance_episode(self, episode: dict) -> dict:
        """Enhance all moments in an episode."""
        print(f"Enhancing {episode['episode_id']}...")
        
        enhanced_episode = episode.copy()
        enhanced_moments = []
        
        for i, moment in enumerate(episode.get("key_moments", [])):
            enhanced_moment = self.enhance_moment(moment)
            enhanced_moments.append(enhanced_moment)
            
            if i < 3 or i % 50 == 0:
                chars = enhanced_moment.get("characters_present", [])
                print(f"  Moment {i}: {enhanced_moment['content_type']} - chars: {chars}")
        
        enhanced_episode["key_moments"] = enhanced_moments
        
        # Rebuild character appearances
        character_appearances = defaultdict(list)
        for moment in enhanced_moments:
            for char in moment.get("characters_present", []):
                character_appearances[char].append(moment["timestamp"])
        enhanced_episode["character_appearances"] = dict(character_appearances)
        
        # Rebuild suggestive scenes
        suggestive_types = ["dance", "training", "physical_intimacy", "dark_desire", "vampire_feeding"]
        enhanced_episode["suggestive_scenes"] = [
            m for m in enhanced_moments 
            if m["content_type"] in suggestive_types or m["intensity"] >= 3
        ]
        
        # Aggregate metadata
        locations = set()
        content_distribution = defaultdict(int)
        character_pairs = defaultdict(int)
        
        for moment in enhanced_moments:
            if moment.get("location"):
                locations.add(moment["location"])
            content_distribution[moment["content_type"]] += 1
            
            chars = sorted(moment.get("characters_present", []))
            for i, char1 in enumerate(chars):
                for char2 in chars[i+1:]:
                    pair = f"{char1}-{char2}"
                    character_pairs[pair] += 1
        
        enhanced_episode["locations_detected"] = sorted(locations)
        enhanced_episode["content_type_distribution"] = dict(content_distribution)
        enhanced_episode["character_interactions"] = [
            {"pair": pair, "count": count}
            for pair, count in sorted(character_pairs.items(), key=lambda x: x[1], reverse=True)
            if count >= 2
        ][:20]
        
        return enhanced_episode

    def enhance_analysis(self, input_file: str, output_file: str):
        """Enhance the entire video analysis file."""
        print(f"Loading analysis from {input_file}...")
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        enhanced_episodes = []
        for episode in data.get("episodes", []):
            enhanced = self.enhance_episode(episode)
            enhanced_episodes.append(enhanced)
        
        enhanced_data = {
            "total_episodes": len(enhanced_episodes),
            "episodes": enhanced_episodes,
            "enhanced": True,
            "enhancement_version": "2.0",
        }
        
        print(f"\nSaving enhanced analysis to {output_file}...")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(enhanced_data, f, indent=2, ensure_ascii=False)
        
        print("\n" + "="*60)
        print("ENHANCEMENT COMPLETE")
        print("="*60)
        
        for episode in enhanced_episodes:
            print(f"\n{episode['episode_id'].upper()}:")
            print(f"  Total moments: {len(episode['key_moments'])}")
            print(f"  Characters detected: {len(episode['character_appearances'])}")
            print(f"  Locations: {', '.join(episode.get('locations_detected', [])) or 'None detected'}")
            print(f"  Content types: {len(episode.get('content_type_distribution', {}))}")
            print(f"  Top interactions: {len(episode.get('character_interactions', []))}")
        
        return enhanced_data


if __name__ == "__main__":
    input_file = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis.json"
    output_file = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_enhanced.json"
    characters_dir = "/Users/wolfy/Developer/2026.Y/bats/data/characters"
    
    enhancer = ExistingAnalysisEnhancer(characters_dir)
    enhanced_data = enhancer.enhance_analysis(input_file, output_file)
