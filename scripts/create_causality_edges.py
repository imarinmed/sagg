#!/usr/bin/env python3
"""
Create causality edges between narrative beats.
Maps cause-effect relationships in the BST narrative.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import timedelta

DATA_DIR = Path(__file__).parent.parent / "data"


def load_beats() -> List[Dict]:
    """Load beats data."""
    with open(DATA_DIR / "narratives" / "bst" / "beats.json") as f:
        return json.load(f)["beats"]


def load_character_evolution() -> List[Dict]:
    """Load character evolution data."""
    try:
        with open(DATA_DIR / "character_evolution.json") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def find_beat_by_time(
    beats: List[Dict], episode_id: str, timestamp_seconds: float
) -> Optional[Dict]:
    """Find the beat that contains a given timestamp."""
    for beat in beats:
        if beat["episode_id"] == episode_id:
            if beat["start_seconds"] <= timestamp_seconds <= beat["end_seconds"]:
                return beat
    return None


def create_causality_edges(beats: List[Dict], evolution_data: List[Dict]) -> List[Dict]:
    """Create causality edges between beats."""
    edges = []
    edge_id = 1

    # Group beats by episode
    episodes = {}
    for beat in beats:
        ep = beat["episode_id"]
        if ep not in episodes:
            episodes[ep] = []
        episodes[ep].append(beat)

    # Sort beats within each episode by time
    for ep in episodes:
        episodes[ep].sort(key=lambda b: b["start_seconds"])

    # Create sequential edges (beat N -> beat N+1)
    for ep, ep_beats in episodes.items():
        for i in range(len(ep_beats) - 1):
            current = ep_beats[i]
            next_beat = ep_beats[i + 1]

            edge = {
                "edge_id": f"edge-{edge_id:04d}",
                "version": "bst",
                "from_beat_id": current["beat_id"],
                "to_beat_id": next_beat["beat_id"],
                "type": "enables",
                "stac": {
                    "situation": current["summary"][:100],
                    "task": "Narrative progression",
                    "action": "Scene transition",
                    "consequence": next_beat["summary"][:100],
                },
                "mechanism_refs": [],
                "confidence": 0.9,
                "evidence": [
                    {
                        "episode_id": ep,
                        "from_beat": current["beat_id"],
                        "to_beat": next_beat["beat_id"],
                    }
                ],
            }
            edges.append(edge)
            edge_id += 1

    # Create character arc edges from evolution data
    char_episodes = {}
    for evo in evolution_data:
        char_id = evo.get("character_id")
        ep_id = evo.get("episode_id")
        if char_id and ep_id:
            key = (char_id, ep_id)
            if key not in char_episodes:
                char_episodes[key] = []
            char_episodes[key].append(evo)

    # For characters appearing in multiple episodes, create cross-episode edges
    characters = set(k[0] for k in char_episodes.keys())
    for char in characters:
        char_eps = sorted([k[1] for k in char_episodes.keys() if k[0] == char])
        for i in range(len(char_eps) - 1):
            ep1 = char_eps[i]
            ep2 = char_eps[i + 1]

            # Find last beat of ep1 and first beat of ep2
            if ep1 in episodes and ep2 in episodes and episodes[ep1] and episodes[ep2]:
                last_beat_ep1 = max(episodes[ep1], key=lambda b: b["start_seconds"])
                first_beat_ep2 = min(episodes[ep2], key=lambda b: b["start_seconds"])

                if char in last_beat_ep1.get(
                    "characters", []
                ) and char in first_beat_ep2.get("characters", []):
                    edge = {
                        "edge_id": f"edge-{edge_id:04d}",
                        "version": "bst",
                        "from_beat_id": last_beat_ep1["beat_id"],
                        "to_beat_id": first_beat_ep2["beat_id"],
                        "type": "motivates",
                        "stac": {
                            "situation": f"{char} at end of {ep1}",
                            "task": f"Continue {char}'s arc",
                            "action": "Episode transition",
                            "consequence": f"{char} in {ep2}",
                        },
                        "mechanism_refs": ["character_arc"],
                        "confidence": 0.7,
                        "evidence": [
                            {"character": char, "from_episode": ep1, "to_episode": ep2}
                        ],
                    }
                    edges.append(edge)
                    edge_id += 1

    # Create relationship-based edges
    # Find beats with shared characters
    for i, beat1 in enumerate(beats):
        chars1 = set(beat1.get("characters", []))
        if not chars1:
            continue

        for beat2 in beats[i + 1 :]:  # Only look forward
            chars2 = set(beat2.get("characters", []))
            shared = chars1 & chars2

            # If beats share characters and are within reasonable time distance
            if shared and beat1["episode_id"] == beat2["episode_id"]:
                time_diff = beat2["start_seconds"] - beat1["end_seconds"]
                if 0 < time_diff < 300:  # Within 5 minutes
                    edge = {
                        "edge_id": f"edge-{edge_id:04d}",
                        "version": "bst",
                        "from_beat_id": beat1["beat_id"],
                        "to_beat_id": beat2["beat_id"],
                        "type": "reveals",
                        "stac": {
                            "situation": beat1["summary"][:80],
                            "task": f"Develop interaction between {', '.join(list(shared)[:2])}",
                            "action": "Continued scene",
                            "consequence": beat2["summary"][:80],
                        },
                        "mechanism_refs": ["relationship_development"],
                        "confidence": 0.6,
                        "evidence": [
                            {
                                "shared_characters": list(shared),
                                "time_gap_seconds": time_diff,
                            }
                        ],
                    }
                    edges.append(edge)
                    edge_id += 1

    return edges


def main():
    """Main function."""
    print("Creating causality edges...")

    beats = load_beats()
    evolution_data = load_character_evolution()

    print(f"Loaded {len(beats)} beats")
    print(f"Loaded {len(evolution_data)} evolution events")

    edges = create_causality_edges(beats, evolution_data)

    print(f"Created {len(edges)} causality edges")

    # Create output directory
    output_dir = DATA_DIR / "causality"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save edges
    output_path = output_dir / "edges.json"
    with open(output_path, "w") as f:
        json.dump(
            {"version": "1.0.0", "total_edges": len(edges), "edges": edges}, f, indent=2
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(edges) >= 50, f"Expected at least 50 edges, got {len(edges)}"

    # Check for self-referential edges
    for edge in edges:
        assert edge["from_beat_id"] != edge["to_beat_id"], (
            f"Self-referential edge: {edge['edge_id']}"
        )

    print("✓ Validation passed: >= 50 edges, no self-references")

    # Show sample
    print("\nSample edges:")
    for edge in edges[:3]:
        print(
            f"  {edge['edge_id']}: {edge['from_beat_id']} -> {edge['to_beat_id']} ({edge['type']})"
        )


if __name__ == "__main__":
    main()
