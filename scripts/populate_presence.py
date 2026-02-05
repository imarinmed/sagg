#!/usr/bin/env python3
import json
import sys
from pathlib import Path

backend_src = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_src.parent))


def main():
    from src.data import character_presence_db, video_analysis_db, episodes_db

    output_file = Path(__file__).parent.parent / "data" / "character_presence.json"

    presence_data = {
        "total_presences": len(character_presence_db),
        "total_episodes": len(video_analysis_db),
        "presences": [p.model_dump() for p in character_presence_db.values()],
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(presence_data, f, indent=2, ensure_ascii=False)

    print(f"Exported {len(character_presence_db)} presence records to {output_file}")

    print("\nPresence summary by episode:")
    for episode_id in sorted(video_analysis_db.keys()):
        episode_presences = [
            p for p in character_presence_db.values() if p.episode_id == episode_id
        ]
        if episode_presences:
            episode_title = episodes_db.get(episode_id)
            title = episode_title.title if episode_title else episode_id
            print(f"  {episode_id}: {len(episode_presences)} characters - {title[:50]}")
            for p in sorted(episode_presences, key=lambda x: -x.importance_rating)[:3]:
                print(
                    f"    - {p.character_id} (importance: {p.importance_rating}, moments: {p.moment_count})"
                )


if __name__ == "__main__":
    main()
