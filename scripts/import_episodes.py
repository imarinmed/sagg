#!/usr/bin/env python3
"""Import all 7 episodes into the backend."""

import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.parse_transcript import parse_episode, episode_to_dict


EPISODES = [
    ("s01e01", "Kallblodig skolstart", "Cold-blooded School Start"),
    ("s01e02", "Audition till Batgirls", "Audition for the Batgirls"),
    ("s01e03", "Lunch hos Natt och Dag", "Lunch at Natt och Dag's"),
    ("s01e04", "En oväntad fest", "An Unexpected Party"),
    ("s01e05", "Nödvamp och nördar", "Vampires in Distress and Nerds"),
    ("s01e06", "Blåljus och blod", "Blue Lights and Blood"),
    ("s01e07", "Försonas i en kyss", "Reconciled in a Kiss"),
]


def import_all_episodes():
    """Parse and save all episodes as JSON."""
    transcript_dir = Path("/Users/wolfy/Developer/2026.Y/bats/data/transcripts")
    output_dir = Path("/Users/wolfy/Developer/2026.Y/bats/data/parsed")
    output_dir.mkdir(exist_ok=True)

    all_episodes = []

    for episode_id, title, title_en in EPISODES:
        file_path = transcript_dir / f"{episode_id}.txt"

        if not file_path.exists():
            print(f"Warning: {file_path} not found, skipping")
            continue

        print(f"Parsing {episode_id}: {title}...")

        episode = parse_episode(file_path, episode_id, title, title_en)
        episode_dict = episode_to_dict(episode)

        # Save individual episode
        with open(output_dir / f"{episode_id}.json", "w", encoding="utf-8") as f:
            json.dump(episode_dict, f, indent=2, ensure_ascii=False)

        all_episodes.append(episode_dict)

        print(f"  - Scenes: {len(episode.scenes)}")
        print(f"  - Dialogue lines: {sum(len(s.dialogue) for s in episode.scenes)}")
        print(
            f"  - Characters: {set().union(*[set(s.characters) for s in episode.scenes]) or 'None detected'}"
        )

    # Save all episodes index
    with open(output_dir / "episodes.json", "w", encoding="utf-8") as f:
        json.dump(all_episodes, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Imported {len(all_episodes)} episodes to {output_dir}")


if __name__ == "__main__":
    import_all_episodes()
