#!/usr/bin/env python3
"""
Extract narrative beats from video analysis and episode data.
Creates stable beat segmentation for BST narrative.
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from datetime import timedelta

# Import ID generator
import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "backend" / "src"))
from utils.id_generator import generate_beat_id

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_DIR = DATA_DIR / "narratives" / "bst"


def parse_timestamp(ts: str) -> float:
    """Convert timestamp like '0:00:47' to seconds."""
    parts = ts.split(":")
    if len(parts) == 2:
        minutes, seconds = parts
        return float(minutes) * 60 + float(seconds)
    elif len(parts) == 3:
        hours, minutes, seconds = parts
        return float(hours) * 3600 + float(minutes) * 60 + float(seconds)
    return 0.0


def format_time(seconds: float) -> str:
    """Format seconds as HH:MM:SS."""
    td = timedelta(seconds=int(seconds))
    return str(td)


def extract_beats_from_episode(
    episode_id: str, video_data: Dict, episode_data: Dict
) -> List[Dict]:
    """Extract beats from a single episode."""
    beats = []
    moments = video_data.get("key_moments", [])

    # Group moments into beats (every ~1.5-2 minutes for more granular beats)
    beat_duration = 100  # seconds (~1.7 minutes per beat)
    current_beat_start = 0
    current_beat_moments = []
    current_beat_characters = set()
    current_beat_locations = set()
    beat_sequence = 1

    for moment in moments:
        ts_seconds = moment.get("timestamp_seconds", 0)

        # If we've exceeded beat duration, save current beat and start new one
        if ts_seconds - current_beat_start > beat_duration and current_beat_moments:
            # Create beat
            beat = {
                "beat_id": generate_beat_id(episode_id, beat_sequence),
                "episode_id": episode_id,
                "start_time": format_time(current_beat_start),
                "end_time": format_time(ts_seconds),
                "start_seconds": current_beat_start,
                "end_seconds": ts_seconds,
                "characters": sorted(list(current_beat_characters)),
                "moments": [m.get("timestamp") for m in current_beat_moments],
                "summary": generate_beat_summary(current_beat_moments),
                "location": list(current_beat_locations)[0]
                if len(current_beat_locations) == 1
                else "multiple",
                "intensity": calculate_intensity(current_beat_moments),
                "content_types": list(
                    set(m.get("content_type", "unknown") for m in current_beat_moments)
                ),
            }
            beats.append(beat)

            # Reset for next beat
            beat_sequence += 1
            current_beat_start = ts_seconds
            current_beat_moments = []
            current_beat_characters = set()
            current_beat_locations = set()

        # Add moment to current beat
        current_beat_moments.append(moment)
        current_beat_characters.update(moment.get("characters_present", []))
        if moment.get("location"):
            current_beat_locations.add(moment.get("location"))

    # Don't forget the last beat
    if current_beat_moments:
        last_moment = current_beat_moments[-1]
        end_time = last_moment.get(
            "timestamp_seconds", current_beat_start + beat_duration
        )

        beat = {
            "beat_id": generate_beat_id(episode_id, beat_sequence),
            "episode_id": episode_id,
            "start_time": format_time(current_beat_start),
            "end_time": format_time(end_time),
            "start_seconds": current_beat_start,
            "end_seconds": end_time,
            "characters": sorted(list(current_beat_characters)),
            "moments": [m.get("timestamp") for m in current_beat_moments],
            "summary": generate_beat_summary(current_beat_moments),
            "location": list(current_beat_locations)[0]
            if len(current_beat_locations) == 1
            else "multiple",
            "intensity": calculate_intensity(current_beat_moments),
            "content_types": list(
                set(m.get("content_type", "unknown") for m in current_beat_moments)
            ),
        }
        beats.append(beat)

    return beats


def generate_beat_summary(moments: List[Dict]) -> str:
    """Generate a summary for a beat from its moments."""
    if not moments:
        return "Unknown"

    # Get first and last moment descriptions
    first = moments[0].get("description", "")[:50]
    last = moments[-1].get("description", "")[:50]

    # Count content types
    content_types = {}
    for m in moments:
        ct = m.get("content_type", "unknown")
        content_types[ct] = content_types.get(ct, 0) + 1

    dominant_type = (
        max(content_types.items(), key=lambda x: x[1])[0] if content_types else "mixed"
    )

    return f"{dominant_type.replace('_', ' ').title()}: {first}..."


def calculate_intensity(moments: List[Dict]) -> int:
    """Calculate average intensity for a beat."""
    if not moments:
        return 1

    intensities = [m.get("intensity", 1) for m in moments if m.get("intensity")]
    if not intensities:
        return 1

    return round(sum(intensities) / len(intensities))


def main():
    """Main extraction function."""
    print("Extracting BST beats from video analysis...")

    # Load video analysis
    video_analysis_path = DATA_DIR / "video_analysis" / "video_analysis_v2.json"
    with open(video_analysis_path) as f:
        video_data = json.load(f)

    # Load episode data
    episodes_path = DATA_DIR / "parsed" / "episodes.json"
    with open(episodes_path) as f:
        episodes = json.load(f)

    all_beats = []

    # Process each episode
    for episode in episodes:
        episode_id = episode["id"]
        print(f"Processing {episode_id}...")

        # Find video data for this episode
        episode_video_data = None
        for ep in video_data.get("episodes", []):
            if ep["episode_id"] == episode_id:
                episode_video_data = ep
                break

        if not episode_video_data:
            print(f"  Warning: No video data found for {episode_id}")
            continue

        # Extract beats
        beats = extract_beats_from_episode(episode_id, episode_video_data, episode)
        all_beats.extend(beats)
        print(f"  Extracted {len(beats)} beats")

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Save beats
    beats_path = OUTPUT_DIR / "beats.json"
    with open(beats_path, "w") as f:
        json.dump(
            {"version": "1.0.0", "total_beats": len(all_beats), "beats": all_beats},
            f,
            indent=2,
        )

    print(f"\nExtraction complete!")
    print(f"Total beats: {len(all_beats)}")
    print(f"Output: {beats_path}")

    # Validation
    assert len(all_beats) >= 70, f"Expected at least 70 beats, got {len(all_beats)}"
    print("✓ Validation passed: >= 70 beats")


if __name__ == "__main__":
    main()
