#!/usr/bin/env python3
"""
Extract character relationships from video analysis data.

This script analyzes character co-occurrences across episodes to infer relationships.
It uses the video_analysis_v2.json data which has cleaner character IDs.

Relationship types are inferred from:
- Co-occurrence frequency
- Scene content_type (confrontation, physical_intimacy, party, etc.)
- Dialogue context
- Character family names (e.g., _natt_och_dag suffix indicates familial)
"""

import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

# Add backend to path for imports
backend_src = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_src.parent))


def load_video_analysis() -> dict[str, Any]:
    """Load video analysis data from JSON."""
    video_analysis_file = (
        Path(__file__).parent.parent
        / "data"
        / "video_analysis"
        / "video_analysis_v2.json"
    )

    if not video_analysis_file.exists():
        raise FileNotFoundError(f"Video analysis file not found: {video_analysis_file}")

    with open(video_analysis_file, encoding="utf-8") as f:
        return json.load(f)


def load_characters() -> set[str]:
    """Load valid character IDs from YAML files."""
    characters_dir = Path(__file__).parent.parent / "data" / "characters"
    character_ids = set()

    if characters_dir.exists():
        for yaml_file in characters_dir.glob("*.yaml"):
            character_ids.add(yaml_file.stem)

    return character_ids


def extract_co_occurrences(video_data: dict) -> dict:
    """
    Extract character co-occurrences from video analysis.

    Returns a dict mapping character pairs to their co-occurrence data:
    {
        (char_a, char_b): {
            'count': int,
            'episodes': set[str],
            'content_types': Counter,
            'intensities': list[int],
            'descriptions': list[str],
        }
    }
    """
    co_occurrences = defaultdict(
        lambda: {
            "count": 0,
            "episodes": set(),
            "content_types": defaultdict(int),
            "intensities": [],
            "descriptions": [],
        }
    )

    for episode in video_data.get("episodes", []):
        episode_id = episode.get("episode_id", "")

        for moment in episode.get("key_moments", []):
            characters = moment.get("characters_present", [])
            content_type = moment.get("content_type", "dialogue")
            intensity = moment.get("intensity", 1)
            description = moment.get("description", "")

            # Skip moments with 0 or 1 characters
            if len(characters) < 2:
                continue

            # Create pairs from all characters present
            for i, char_a in enumerate(characters):
                for char_b in characters[i + 1 :]:
                    # Normalize pair ordering (alphabetical)
                    pair = tuple(sorted([char_a, char_b]))

                    co_occurrences[pair]["count"] += 1
                    co_occurrences[pair]["episodes"].add(episode_id)
                    co_occurrences[pair]["content_types"][content_type] += 1
                    co_occurrences[pair]["intensities"].append(intensity)
                    co_occurrences[pair]["descriptions"].append(description)

    return co_occurrences


def infer_relationship_type(
    char_a: str,
    char_b: str,
    co_data: dict,
) -> tuple[str, str]:
    """
    Infer the relationship type and generate a description.

    Returns (relationship_type, description)
    """
    content_types = co_data["content_types"]
    descriptions = co_data["descriptions"]
    count = co_data["count"]
    episode_count = len(co_data["episodes"])

    # Check for family relationship (shared surname suffix)
    if "_natt_och_dag" in char_a and "_natt_och_dag" in char_b:
        return (
            "familial",
            f"Family members (Natt och Dag). Appear together in {episode_count} episode(s).",
        )

    # Analyze content types for relationship inference
    romantic_signals = content_types.get("physical_intimacy", 0) + content_types.get(
        "romance", 0
    )

    conflict_signals = (
        content_types.get("confrontation", 0)
        + content_types.get("fight", 0)
        + content_types.get("argument", 0)
    )

    social_signals = (
        content_types.get("party", 0)
        + content_types.get("dance", 0)
        + content_types.get("social", 0)
    )

    professional_signals = (
        content_types.get("class", 0)
        + content_types.get("school", 0)
        + content_types.get("work", 0)
    )

    vampire_signals = content_types.get("vampire_feeding", 0) + content_types.get(
        "transformation", 0
    )

    # Check descriptions for keywords
    desc_text = " ".join(descriptions).lower()

    # Romantic indicators
    romantic_keywords = [
        "kiss",
        "love",
        "together",
        "boyfriend",
        "girlfriend",
        "flirt",
        "hot",
        "cute",
    ]
    romantic_keyword_count = sum(1 for kw in romantic_keywords if kw in desc_text)

    # Antagonistic indicators
    antagonistic_keywords = [
        "fight",
        "mad",
        "angry",
        "hate",
        "enemy",
        "evil",
        "jealous",
        "revenge",
    ]
    antagonistic_keyword_count = sum(
        1 for kw in antagonistic_keywords if kw in desc_text
    )

    # Friendship indicators
    friendship_keywords = ["friend", "buddy", "help", "support", "together", "hang out"]
    friendship_keyword_count = sum(1 for kw in friendship_keywords if kw in desc_text)

    # Determine relationship type based on signals
    if romantic_signals > 2 or romantic_keyword_count > 2:
        rel_type = "romantic"
        desc = f"Romantic connection suggested by {romantic_signals + romantic_keyword_count} romantic indicators across {episode_count} episode(s)."
    elif conflict_signals > 2 or antagonistic_keyword_count > 2:
        rel_type = "antagonistic"
        desc = f"Conflict-based relationship with {conflict_signals + antagonistic_keyword_count} confrontational moments across {episode_count} episode(s)."
    elif (
        "teacher" in char_a
        or "teacher" in char_b
        or "principal" in char_a
        or "principal" in char_b
    ):
        rel_type = "professional"
        desc = f"Student-teacher or professional relationship. Co-appear in {count} scenes across {episode_count} episode(s)."
    elif social_signals > count * 0.5:
        rel_type = "social"
        desc = f"Social acquaintances, primarily seen together at parties/events. {count} co-occurrences across {episode_count} episode(s)."
    elif friendship_keyword_count > 1 or count > 10:
        rel_type = "friendship"
        desc = f"Friendship indicated by frequent co-appearances ({count} times) across {episode_count} episode(s)."
    elif vampire_signals > 0:
        rel_type = "supernatural"
        desc = f"Connected through vampire-related events ({vampire_signals} supernatural moments)."
    else:
        rel_type = "acquaintance"
        desc = f"General acquaintances, appearing together {count} times across {episode_count} episode(s)."

    return rel_type, desc


def determine_direction(
    char_a: str, char_b: str, known_characters: set[str]
) -> tuple[str, str]:
    """
    Determine relationship direction (from -> to).

    Priority: main characters -> supporting -> minor
    """
    # Main characters (protagonists)
    protagonists = {"kiara_natt_och_dag", "alfred", "eric", "chloe", "elise"}

    # Supporting characters
    supporting = {"jonas", "didde", "mother", "jacques_natt_och_dag", "principal"}

    def character_rank(char: str) -> int:
        if char in protagonists:
            return 3
        if char in supporting:
            return 2
        if char in known_characters:
            return 1
        return 0

    rank_a = character_rank(char_a)
    rank_b = character_rank(char_b)

    # Higher rank character is "from" (the focus)
    if rank_a >= rank_b:
        return char_a, char_b
    return char_b, char_a


def extract_relationships(min_co_occurrences: int = 2) -> list[dict]:
    """
    Main extraction function.

    Args:
        min_co_occurrences: Minimum number of times characters must appear together
                           to generate a relationship (default: 2)

    Returns:
        List of relationship dictionaries
    """
    print("Loading video analysis data...")
    video_data = load_video_analysis()

    print("Loading known characters...")
    known_characters = load_characters()
    print(f"  Found {len(known_characters)} character files")

    print("Extracting co-occurrences...")
    co_occurrences = extract_co_occurrences(video_data)
    print(f"  Found {len(co_occurrences)} unique character pairs")

    print(f"Generating relationships (min co-occurrences: {min_co_occurrences})...")
    relationships = []
    seen_pairs = set()

    for (char_a, char_b), co_data in co_occurrences.items():
        # Filter by minimum co-occurrence threshold
        if co_data["count"] < min_co_occurrences:
            continue

        # Skip self-relationships (shouldn't happen, but be safe)
        if char_a == char_b:
            continue

        # Avoid duplicate pairs
        pair_key = tuple(sorted([char_a, char_b]))
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)

        # Determine direction
        from_char, to_char = determine_direction(char_a, char_b, known_characters)

        # Infer relationship type
        rel_type, description = infer_relationship_type(char_a, char_b, co_data)

        # Create relationship
        rel_id = f"{from_char}-{to_char}"
        relationship = {
            "id": rel_id,
            "from_character_id": from_char,
            "to_character_id": to_char,
            "relationship_type": rel_type,
            "description": description,
            "metadata": {
                "co_occurrence_count": co_data["count"],
                "episode_count": len(co_data["episodes"]),
                "episodes": sorted(co_data["episodes"]),
                "avg_intensity": round(
                    sum(co_data["intensities"]) / len(co_data["intensities"])
                    if co_data["intensities"]
                    else 0,
                    2,
                ),
                "content_types": dict(co_data["content_types"]),
            },
        }
        relationships.append(relationship)

    # Sort by co-occurrence count (most frequent first)
    relationships.sort(key=lambda r: -r["metadata"]["co_occurrence_count"])

    return relationships


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract character relationships from video analysis"
    )
    parser.add_argument(
        "--min-cooccurrences",
        type=int,
        default=2,
        help="Minimum co-occurrences to create a relationship (default: 2)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output file path (default: data/character_relationships.json)",
    )
    args = parser.parse_args()

    # Extract relationships
    relationships = extract_relationships(min_co_occurrences=args.min_cooccurrences)

    # Prepare output
    output_data = {
        "total_relationships": len(relationships),
        "relationship_types": {},
        "relationships": relationships,
    }

    # Count by type
    for rel in relationships:
        rel_type = rel["relationship_type"]
        output_data["relationship_types"][rel_type] = (
            output_data["relationship_types"].get(rel_type, 0) + 1
        )

    # Determine output path
    output_path = args.output
    if output_path is None:
        output_path = (
            Path(__file__).parent.parent / "data" / "character_relationships.json"
        )
    else:
        output_path = Path(output_path)

    # Write output
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\nExtracted {len(relationships)} relationships")
    print(f"Output written to: {output_path}")

    print("\nRelationship type breakdown:")
    for rel_type, count in sorted(
        output_data["relationship_types"].items(), key=lambda x: -x[1]
    ):
        print(f"  {rel_type}: {count}")

    # Show some notable relationships
    print("\nTop 10 relationships by co-occurrence:")
    for i, rel in enumerate(relationships[:10], 1):
        print(
            f"  {i}. {rel['from_character_id']} -> {rel['to_character_id']} "
            f"({rel['relationship_type']}, {rel['metadata']['co_occurrence_count']} co-occurrences)"
        )

    # Check for Kiara-Alfred relationship (QA requirement)
    kiara_alfred = [
        r
        for r in relationships
        if (
            "kiara" in r["from_character_id"].lower()
            and "alfred" in r["to_character_id"].lower()
        )
        or (
            "alfred" in r["from_character_id"].lower()
            and "kiara" in r["to_character_id"].lower()
        )
    ]
    if kiara_alfred:
        print(f"\n✓ QA Check: Kiara-Alfred relationship exists!")
        for r in kiara_alfred:
            print(f"  {r['id']}: {r['relationship_type']} - {r['description']}")
    else:
        print("\n✗ QA Check: Kiara-Alfred relationship NOT found!")

    return len(relationships)


if __name__ == "__main__":
    count = main()
    # Exit with error if less than 50 relationships (QA requirement)
    if count < 50:
        print(f"\nWarning: Only {count} relationships extracted, target is >50")
        sys.exit(1)
