#!/usr/bin/env python3
"""Parse SRT transcript files into structured data."""

import re
import json
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any


@dataclass
class DialogueLine:
    index: int
    start_time: str
    end_time: str
    text: str
    speaker: Optional[str] = None


@dataclass
class Scene:
    id: str
    start_time: str
    end_time: str
    location: Optional[str]
    dialogue: List[DialogueLine]
    characters: List[str]


@dataclass
class Episode:
    id: str
    title: str
    title_en: str
    season: int
    episode_number: int
    scenes: List[Scene]


def parse_timecode(timecode: str) -> int:
    """Convert SRT timecode to milliseconds."""
    hours, minutes, seconds = timecode.replace(",", ".").split(":")
    total_ms = int(hours) * 3600000 + int(minutes) * 60000 + float(seconds) * 1000
    return int(total_ms)


def parse_srt(content: str) -> List[DialogueLine]:
    """Parse SRT content into dialogue lines."""
    lines = []

    # Split by double newline to get subtitle blocks
    blocks = re.split(r"\n\n+", content.strip())

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines_in_block = block.split("\n")
        if len(lines_in_block) < 3:
            continue

        # First line is index
        try:
            index = int(lines_in_block[0].strip())
        except ValueError:
            continue

        # Second line is timecode
        timecode_match = re.match(
            r"(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})",
            lines_in_block[1].strip(),
        )
        if not timecode_match:
            continue

        start_time = timecode_match.group(1)
        end_time = timecode_match.group(2)

        # Remaining lines are text
        text = " ".join(lines_in_block[2:]).strip()

        lines.append(
            DialogueLine(
                index=index,
                start_time=start_time,
                end_time=end_time,
                text=text,
                speaker=None,
            )
        )

    return lines


def extract_speaker(text: str) -> tuple[str, Optional[str]]:
    """Extract speaker name from dialogue.

    Looks for patterns like:
    - "-Hey, Alfred." -> speaker is the person being addressed
    - "-Alfred: Hey there." -> speaker is Alfred
    """
    # Pattern: "-Name: text" or "-Name? text"
    speaker_pattern = re.match(r"^[-–]\s*([A-Z][a-zA-Z\s]*?)[:\?\.]\s*(.*)$", text)
    if speaker_pattern:
        speaker = speaker_pattern.group(1).strip()
        remaining_text = speaker_pattern.group(2).strip()
        return remaining_text, speaker

    # Pattern: "-Hey, Name." -> speaker is implied to be someone else
    address_pattern = re.match(r"^[-–]\s*[^,]*,\s*([A-Z][a-zA-Z]+)[\.\!\?]", text)
    if address_pattern:
        # The person being addressed
        addressed = address_pattern.group(1).strip()
        return text, None  # Speaker unknown

    return text, None


def time_to_seconds(time_str: str) -> float:
    """Convert SRT timecode to seconds."""
    hours, minutes, seconds = time_str.replace(",", ".").split(":")
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def group_into_scenes(
    dialogue_lines: List[DialogueLine], episode_id: str
) -> List[Scene]:
    """Group dialogue lines into scenes based on time gaps."""
    if not dialogue_lines:
        return []

    scenes = []
    current_scene_lines = []
    scene_number = 1

    # Group by time gaps (gaps > 30 seconds = new scene)
    SCENE_GAP_THRESHOLD = 30  # seconds

    for i, line in enumerate(dialogue_lines):
        if i == 0:
            current_scene_lines.append(line)
            continue

        prev_end = time_to_seconds(dialogue_lines[i - 1].end_time)
        curr_start = time_to_seconds(line.start_time)

        if curr_start - prev_end > SCENE_GAP_THRESHOLD:
            # Create scene from accumulated lines
            if current_scene_lines:
                scene = create_scene(current_scene_lines, episode_id, scene_number)
                scenes.append(scene)
                scene_number += 1
                current_scene_lines = []

        current_scene_lines.append(line)

    # Don't forget the last scene
    if current_scene_lines:
        scene = create_scene(current_scene_lines, episode_id, scene_number)
        scenes.append(scene)

    return scenes


def create_scene(
    lines: List[DialogueLine], episode_id: str, scene_number: int
) -> Scene:
    """Create a Scene from dialogue lines."""
    # Extract speakers and clean up dialogue
    characters = set()
    processed_lines = []

    for line in lines:
        text, speaker = extract_speaker(line.text)
        if speaker:
            characters.add(speaker)
        processed_lines.append(
            DialogueLine(
                index=line.index,
                start_time=line.start_time,
                end_time=line.end_time,
                text=text,
                speaker=speaker,
            )
        )

    return Scene(
        id=f"{episode_id}_sc{scene_number:03d}",
        start_time=lines[0].start_time,
        end_time=lines[-1].end_time,
        location=None,  # Would need manual annotation
        dialogue=processed_lines,
        characters=list(characters),
    )


def parse_episode(
    file_path: Path, episode_id: str, title: str, title_en: str = ""
) -> Episode:
    """Parse a full episode from SRT file."""
    content = file_path.read_text(encoding="utf-8")
    dialogue_lines = parse_srt(content)
    scenes = group_into_scenes(dialogue_lines, episode_id)

    # Extract season and episode number from ID
    match = re.match(r"s(\d+)e(\d+)", episode_id)
    season = int(match.group(1)) if match else 1
    episode_number = int(match.group(2)) if match else 1

    return Episode(
        id=episode_id,
        title=title,
        title_en=title_en,
        season=season,
        episode_number=episode_number,
        scenes=scenes,
    )


def episode_to_dict(episode: Episode) -> Dict[str, Any]:
    """Convert Episode to dictionary for JSON serialization."""
    return {
        "id": episode.id,
        "title": episode.title,
        "title_en": episode.title_en,
        "season": episode.season,
        "episode_number": episode.episode_number,
        "scenes": [
            {
                "id": scene.id,
                "start_time": scene.start_time,
                "end_time": scene.end_time,
                "location": scene.location,
                "characters": scene.characters,
                "dialogue": [
                    {
                        "index": d.index,
                        "start_time": d.start_time,
                        "end_time": d.end_time,
                        "text": d.text,
                        "speaker": d.speaker,
                    }
                    for d in scene.dialogue
                ],
            }
            for scene in episode.scenes
        ],
    }


if __name__ == "__main__":
    # Test parsing s01e01
    transcript_dir = Path("/Users/wolfy/Developer/2026.Y/bats/data/transcripts")

    episode = parse_episode(
        transcript_dir / "s01e01.txt",
        "s01e01",
        "Kallblodig skolstart",
        "Cold-blooded School Start",
    )

    print(f"Episode: {episode.title}")
    print(f"Scenes: {len(episode.scenes)}")
    print(f"Total dialogue lines: {sum(len(s.dialogue) for s in episode.scenes)}")
    print(
        f"Characters detected: {set().union(*[set(s.characters) for s in episode.scenes])}"
    )

    # Save as JSON
    output_dir = Path("/Users/wolfy/Developer/2026.Y/bats/data/parsed")
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / f"{episode.id}.json", "w", encoding="utf-8") as f:
        json.dump(episode_to_dict(episode), f, indent=2, ensure_ascii=False)

    print(f"\nSaved to {output_dir / episode.id}.json")
