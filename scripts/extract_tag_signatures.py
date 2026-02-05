#!/usr/bin/env python3
"""
Extract tag signatures from video analysis content.
Maps moments and beats to tags from the tag library.
"""

import json
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent / "data"


def load_tag_library() -> Dict:
    """Load the tag library."""
    with open(DATA_DIR / "tags" / "library.json") as f:
        return json.load(f)


def load_video_analysis() -> Dict:
    """Load video analysis data."""
    with open(DATA_DIR / "video_analysis" / "video_analysis_v2.json") as f:
        return json.load(f)


def load_beats() -> List[Dict]:
    """Load beats data."""
    with open(DATA_DIR / "narratives" / "bst" / "beats.json") as f:
        return json.load(f)["beats"]


def content_type_to_tags(content_type: str, tag_library: Dict) -> List[str]:
    """Map content type to relevant tags."""
    content_type_mapping = {
        "vampire_feeding": ["blood_as_ritual", "dependence"],
        "dialogue": [],
        "party": ["teen_angst"],
        "vampire_lore": ["eternal_youth", "transformation"],
        "dance": [],
        "dark_desire": ["forbidden_desire", "seduction"],
        "dialogue_exposition": [],
        "dialogue_confrontational": ["confrontation", "rebellion"],
        "hierarchy": ["inheritance_as_cage", "dominance"],
        "dialogue_emotional": [],
        "dialogue_romantic": ["seduction", "forbidden_desire"],
        "physical_intimacy": ["seduction", "intensity_3"],
        "power_play": ["dominance", "coercion", "manipulation"],
        "revelation": ["revelation"],
        "temptation": ["temptation"],
        "rescue": ["rescue"],
        "humiliation": ["humiliation"],
        "transformation": ["transformation"],
    }

    return content_type_mapping.get(content_type, [])


def extract_moment_tags(moment: Dict, tag_library: Dict) -> List[str]:
    """Extract tags for a single moment."""
    tags = set()

    # Map content type
    content_type = moment.get("content_type", "")
    tags.update(content_type_to_tags(content_type, tag_library))

    # Map intensity
    intensity = moment.get("intensity", 1)
    if intensity >= 4:
        tags.add("intensity_4")
    elif intensity >= 3:
        tags.add("intensity_3")
    elif intensity >= 2:
        tags.add("intensity_2")
    else:
        tags.add("intensity_1")

    # Map location
    location = moment.get("location", "")
    if location == "natt_och_dag_mansion":
        tags.add("luxury_dread")
        tags.add("inheritance_as_cage")
    elif location == "school":
        tags.add("teen_angst")

    # Map characters to relationship dynamics
    characters = moment.get("characters_present", [])
    if "kiara_natt_och_dag" in characters:
        if "jacques_natt_och_dag" in characters:
            tags.add("forbidden_desire")
            tags.add("manipulation")
        if "alfred" in characters:
            tags.add("seduction")
            tags.add("temptation")
        if "desiree_natt_och_dag" in characters:
            tags.add("inheritance_as_cage")
            tags.add("coercion")

    return list(tags)


def extract_beat_signature(
    beat: Dict, moments_data: List[Dict], tag_library: Dict
) -> Dict:
    """Extract tag signature for a beat."""
    # Find moments in this beat's time range
    beat_start = beat.get("start_seconds", 0)
    beat_end = beat.get("end_seconds", 0)

    beat_tags = defaultdict(int)
    content_types = []

    for episode in moments_data.get("episodes", []):
        if episode["episode_id"] == beat["episode_id"]:
            for moment in episode.get("key_moments", []):
                moment_ts = moment.get("timestamp_seconds", 0)
                if beat_start <= moment_ts <= beat_end:
                    moment_tags = extract_moment_tags(moment, tag_library)
                    for tag in moment_tags:
                        beat_tags[tag] += 1
                    content_types.append(moment.get("content_type", "unknown"))

    # Calculate tag frequencies (normalize to 0-1)
    total_tags = sum(beat_tags.values())
    tag_frequencies = {}
    if total_tags > 0:
        tag_frequencies = {tag: count / total_tags for tag, count in beat_tags.items()}

    return {
        "beat_id": beat["beat_id"],
        "episode_id": beat["episode_id"],
        "tag_frequencies": tag_frequencies,
        "dominant_tags": sorted(
            tag_frequencies.items(), key=lambda x: x[1], reverse=True
        )[:5],
        "content_types": list(set(content_types)),
        "total_tag_instances": total_tags,
    }


def extract_episode_signature(episode_id: str, beats: List[Dict]) -> Dict:
    """Extract aggregate tag signature for an episode."""
    episode_beats = [b for b in beats if b["episode_id"] == episode_id]

    # Aggregate tag frequencies
    all_tags = defaultdict(float)
    for beat in episode_beats:
        for tag, freq in beat.get("tag_frequencies", {}).items():
            all_tags[tag] += freq

    # Normalize
    total = sum(all_tags.values())
    if total > 0:
        all_tags = {tag: count / total for tag, count in all_tags.items()}

    return {
        "episode_id": episode_id,
        "tag_signature": dict(all_tags),
        "dominant_tags": sorted(all_tags.items(), key=lambda x: x[1], reverse=True)[
            :10
        ],
        "beat_count": len(episode_beats),
    }


def main():
    """Main extraction function."""
    print("Extracting tag signatures from content...")

    # Load data
    tag_library = load_tag_library()
    video_data = load_video_analysis()
    beats = load_beats()

    print(f"Loaded {len(beats)} beats")

    # Extract beat signatures
    print("Extracting beat signatures...")
    beat_signatures = []
    for beat in beats:
        signature = extract_beat_signature(beat, video_data, tag_library)
        beat_signatures.append(signature)

    # Extract episode signatures
    print("Extracting episode signatures...")
    episode_ids = list(set(b["episode_id"] for b in beats))
    episode_signatures = []
    for ep_id in sorted(episode_ids):
        sig = extract_episode_signature(ep_id, beat_signatures)
        episode_signatures.append(sig)

    # Create output directory
    output_dir = DATA_DIR / "derived"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save signatures
    signatures_data = {
        "version": "1.0.0",
        "beat_signatures": beat_signatures,
        "episode_signatures": episode_signatures,
        "total_beats_processed": len(beat_signatures),
        "total_episodes_processed": len(episode_signatures),
    }

    output_path = output_dir / "signatures.json"
    with open(output_path, "w") as f:
        json.dump(signatures_data, f, indent=2)

    print(f"\nExtraction complete!")
    print(f"Beat signatures: {len(beat_signatures)}")
    print(f"Episode signatures: {len(episode_signatures)}")
    print(f"Output: {output_path}")

    # Show sample
    print("\nSample episode signature (s01e01):")
    s01e01 = next((s for s in episode_signatures if s["episode_id"] == "s01e01"), None)
    if s01e01:
        print(f"  Dominant tags: {s01e01['dominant_tags'][:5]}")

    # Validation
    assert len(beat_signatures) == len(beats), "Beat signature count mismatch"
    assert len(episode_signatures) == 7, (
        f"Expected 7 episodes, got {len(episode_signatures)}"
    )
    print("✓ Validation passed")


if __name__ == "__main__":
    main()
