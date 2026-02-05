#!/usr/bin/env python3
"""
Extract character evolution milestones from video analysis and character data.

Milestone Types:
- first_appearance: Character first appears in series
- relationship_change: New relationship forms or changes
- power_awakening: Vampire powers manifest/develop
- character_growth: Personal development moment
- trauma: Difficult/traumatic event
- triumph: Victory/achievement moment
- revelation: Important truth revealed
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import yaml


DATA_DIR = Path(__file__).parent.parent / "data"


def infer_milestone_type(moment: dict, character_id: str, characters_data: dict) -> str:
    """Infer milestone type based on moment content and character context."""
    description = moment.get("description", "").lower()
    content_type = moment.get("content_type", "").lower()
    intensity = moment.get("intensity", 1)

    char_data = characters_data.get(character_id, {})
    is_vampire = char_data.get("canonical", {}).get("species") == "vampire"

    if "first" in description and ("time" in description or "meet" in description):
        return "first_appearance"

    if content_type in ["vampire_feeding", "blood_bond"] or "blood" in description:
        if is_vampire:
            return "power_awakening"
        return "revelation"

    if "kiss" in description or "love" in description or "together" in description:
        return "relationship_change"

    if "fight" in description or "attack" in description or "danger" in description:
        if intensity >= 4:
            return "trauma"
        return "character_growth"

    if "win" in description or "succeed" in description or "triumph" in description:
        return "triumph"

    if "learn" in description or "discover" in description or "truth" in description:
        return "revelation"

    if "change" in description or "grow" in description or "realize" in description:
        return "character_growth"

    if intensity >= 4:
        return "character_growth"

    return "character_growth"


def calculate_importance(moment: dict, is_first_appearance: bool) -> int:
    """Calculate importance rating 1-5 based on moment properties."""
    base_importance = moment.get("intensity", 1)

    if is_first_appearance:
        return 5

    if moment.get("screenshot_path"):
        base_importance = min(5, base_importance + 1)

    content_type = moment.get("content_type", "").lower()
    if content_type in ["vampire_feeding", "blood_bond", "dramatic"]:
        base_importance = min(5, base_importance + 1)

    return max(1, min(5, base_importance))


def load_video_analysis() -> dict:
    """Load video analysis data."""
    video_file = DATA_DIR / "video_analysis" / "video_analysis_v2.json"
    if not video_file.exists():
        print(f"Error: {video_file} not found")
        return {}

    with open(video_file, encoding="utf-8") as f:
        return json.load(f)


def load_characters_yaml() -> dict:
    """Load all character YAML files."""
    characters = {}
    char_dir = DATA_DIR / "characters"

    if not char_dir.exists():
        print(f"Warning: {char_dir} not found")
        return characters

    for char_file in char_dir.glob("*.yaml"):
        with open(char_file, encoding="utf-8") as f:
            char_data = yaml.safe_load(f)
            if char_data:
                char_id = char_data.get("id", char_file.stem)
                characters[char_id] = char_data

    return characters


def generate_arc_summaries(characters_data: dict) -> dict:
    """Generate arc summaries from character YAML data."""
    summaries = {}

    for char_id, char_data in characters_data.items():
        adaptation = char_data.get("adaptation", {})
        canonical = char_data.get("canonical", {})

        arc_dark = adaptation.get("arc_dark", "")
        arc = canonical.get("arc", "")
        psych_profile = adaptation.get("psychological_profile", "")

        summary = arc_dark or arc or psych_profile
        if summary:
            summaries[char_id] = summary[:500]

    return summaries


def extract_milestones() -> list:
    """Extract character evolution milestones from video analysis."""
    video_data = load_video_analysis()
    characters_data = load_characters_yaml()
    arc_summaries = generate_arc_summaries(characters_data)

    if not video_data:
        return []

    milestones = []
    character_first_appearances: dict[str, dict] = {}
    milestone_counter = 0

    episodes = sorted(
        video_data.get("episodes", []), key=lambda e: e.get("episode_number", 0)
    )

    for episode in episodes:
        episode_id = episode.get("episode_id", "")
        moments = episode.get("key_moments", [])

        for moment in moments:
            characters_present = moment.get("characters_present", [])
            intensity = moment.get("intensity", 1)

            if not characters_present or intensity < 3:
                continue

            for char_id in characters_present:
                is_first = char_id not in character_first_appearances

                if is_first:
                    character_first_appearances[char_id] = {
                        "episode_id": episode_id,
                        "timestamp": moment.get("timestamp", "00:00:00"),
                    }
                    milestone_type = "first_appearance"
                    importance = 5
                else:
                    if intensity < 4:
                        continue
                    milestone_type = infer_milestone_type(
                        moment, char_id, characters_data
                    )
                    importance = calculate_importance(moment, is_first)

                other_characters = [c for c in characters_present if c != char_id]

                milestone_counter += 1
                milestone = {
                    "id": f"evo_{char_id}_{episode_id}_{milestone_counter:04d}",
                    "character_id": char_id,
                    "episode_id": episode_id,
                    "timestamp": moment.get("timestamp", "00:00:00"),
                    "milestone_type": milestone_type,
                    "description": moment.get("description", ""),
                    "importance": importance,
                    "related_characters": other_characters[:5],
                    "quote": None,
                    "intensity": intensity,
                    "content_type": moment.get("content_type"),
                    "screenshot_path": moment.get("screenshot_path"),
                }
                milestones.append(milestone)

    print(
        f"Extracted {len(milestones)} milestones for {len(character_first_appearances)} characters"
    )

    metadata = {
        "first_appearances": {
            char_id: data["episode_id"]
            for char_id, data in character_first_appearances.items()
        },
        "arc_summaries": arc_summaries,
    }

    metadata_file = DATA_DIR / "character_evolution_metadata.json"
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to {metadata_file}")

    return milestones


def main():
    print("Extracting character evolution milestones...")

    milestones = extract_milestones()

    if not milestones:
        print("No milestones extracted. Check data files.")
        return 1

    output_file = DATA_DIR / "character_evolution.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(milestones, f, indent=2)

    print(f"Saved {len(milestones)} milestones to {output_file}")

    character_counts: dict[str, int] = {}
    for m in milestones:
        char_id = m["character_id"]
        character_counts[char_id] = character_counts.get(char_id, 0) + 1

    print("\nMilestones per character:")
    for char_id, count in sorted(character_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {char_id}: {count}")

    type_counts: dict[str, int] = {}
    for m in milestones:
        mt = m["milestone_type"]
        type_counts[mt] = type_counts.get(mt, 0) + 1

    print("\nMilestones by type:")
    for mtype, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {mtype}: {count}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
