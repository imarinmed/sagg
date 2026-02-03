import json
import yaml
from pathlib import Path

from .models import (
    Character,
    Episode,
    EpisodeEvolution,
    KinkDescriptor,
    KinkLimit,
    KinkProfile,
    MythosElement,
    Relationship,
    Scene,
)

# Base path for data files
DATA_DIR = Path(__file__).parent.parent.parent / "data"


def load_episodes_from_json() -> dict:
    """Load episodes from data/parsed/episodes.json"""
    episodes_db = {}
    episodes_file = DATA_DIR / "parsed" / "episodes.json"

    if not episodes_file.exists():
        print(f"Warning: episodes.json not found at {episodes_file}")
        return episodes_db

    try:
        with open(episodes_file, encoding="utf-8") as f:
            episodes_data = json.load(f)

        for ep_data in episodes_data:
            episode = Episode(
                id=ep_data.get("id", f"ep{ep_data.get('episode_number')}"),
                title=ep_data.get("title", ""),
                episode_number=ep_data.get("episode_number", 0),
                season=ep_data.get("season", 1),
                air_date=ep_data.get("air_date"),
                description=ep_data.get("description"),
                synopsis=ep_data.get("synopsis", ep_data.get("title_en", "")),
            )
            episodes_db[episode.id] = episode

        print(f"Loaded {len(episodes_db)} episodes from episodes.json")
    except Exception as e:
        print(f"Error loading episodes.json: {e}")

    return episodes_db


def load_scenes_from_episodes() -> dict:
    """Load scenes from individual s01e*.json files"""
    scenes_db = {}
    parsed_dir = DATA_DIR / "parsed"

    if not parsed_dir.exists():
        print(f"Warning: parsed directory not found at {parsed_dir}")
        return scenes_db

    # Find all episode files (s01e01.json, s01e02.json, etc.)
    episode_files = sorted(parsed_dir.glob("s01e*.json"))

    try:
        for ep_file in episode_files:
            with open(ep_file, encoding="utf-8") as f:
                ep_data = json.load(f)

            episode_id = ep_data.get("id")
            scenes = ep_data.get("scenes", [])

            for scene_data in scenes:
                scene = Scene(
                    id=scene_data.get("id", f"{episode_id}_scene_{len(scenes_db)}"),
                    episode_id=episode_id,
                    scene_number=len([s for s in scenes_db.values() if s.episode_id == episode_id])
                    + 1,
                    title=scene_data.get("location") or f"Scene {scene_data.get('id')}",
                    description=f"Start: {scene_data.get('start_time')}, "
                    f"End: {scene_data.get('end_time')}",
                    characters=scene_data.get("characters", []),
                    tags=None,
                )
                scenes_db[scene.id] = scene

        print(f"Loaded {len(scenes_db)} scenes from episode JSON files")
    except Exception as e:
        print(f"Error loading scenes: {e}")

    return scenes_db


def load_characters_from_yaml() -> tuple:
    """Load characters from data/characters/*.yaml files"""
    characters_db = {}
    relationships_db = {}
    characters_dir = DATA_DIR / "characters"

    if not characters_dir.exists():
        print(f"Warning: characters directory not found at {characters_dir}")
        return characters_db, relationships_db

    # Find all character YAML files
    char_files = sorted(characters_dir.glob("*.yaml"))

    try:
        for char_file in char_files:
            with open(char_file, encoding="utf-8") as f:
                char_data = yaml.safe_load(f)

            if not char_data:
                continue

            char_id = char_data.get("id", char_file.stem)
            name = char_data.get("name", "")

            # Extract kink profile if exists
            kink_profile = None
            if "kink_profile" in char_data:
                kp = char_data["kink_profile"]
                kink_profile = KinkProfile(
                    preferences=[
                        KinkDescriptor(
                            descriptor=p.get("id", ""),
                            intensity=p.get("intensity", 1),
                            context=p.get("notes"),
                        )
                        for p in kp.get("preferences", [])
                    ],
                    limits=[
                        KinkLimit(
                            descriptor=lim.get("id", ""),
                            type=lim.get("type", "hard"),
                            note=lim.get("notes"),
                        )
                        for lim in kp.get("limits", [])
                    ],
                    evolution=[
                        EpisodeEvolution(
                            episode_id=ep_id,
                            descriptors={
                                d.get("id", ""): d.get("intensity", 1) for d in descriptors
                            },
                        )
                        for ep_id, descriptors in kp.get("evolution", {}).items()
                    ]
                    if "evolution" in kp
                    else [],
                    consent_frameworks=kp.get("consent_frameworks", []),
                )

            # Get canonical and adaptation info
            canonical = char_data.get("canonical", {})
            adaptation = char_data.get("adaptation", {})

            canonical_traits = (
                canonical.get("traits", []) if isinstance(canonical.get("traits"), list) else []
            )
            adaptation_traits = (
                adaptation.get("traits_added", [])
                if isinstance(adaptation.get("traits_added"), list)
                else []
            )

            character = Character(
                id=char_id,
                name=name,
                role=char_data.get("role", adaptation.get("arc_dark", "Character")),
                description=canonical.get("description") or adaptation.get("psychological_profile"),
                family=canonical.get("family"),
                adaptation_notes=adaptation.get("arc_dark"),
                canonical_traits=canonical_traits,
                adaptation_traits=adaptation_traits,
                kink_profile=kink_profile,
            )
            characters_db[char_id] = character

            # Extract relationships from canonical data
            for rel_data in canonical.get("relationships", []):
                rel_to_id = rel_data.get("character", "")
                rel_type = rel_data.get("type", "unknown")
                dynamic = rel_data.get("dynamic", "")

                rel_id = f"{char_id}-{rel_to_id}"
                relationship = Relationship(
                    id=rel_id,
                    from_character_id=char_id,
                    to_character_id=rel_to_id,
                    relationship_type=rel_type,
                    description=dynamic,
                )
                relationships_db[rel_id] = relationship

        print(f"Loaded {len(characters_db)} characters from YAML files")
        print(f"Extracted {len(relationships_db)} relationships from character data")
    except Exception as e:
        print(f"Error loading characters: {e}")

    return characters_db, relationships_db


def load_mythos_from_yaml() -> dict:
    """Load mythos elements from data/mythos/*.yaml files"""
    mythos_db = {}
    mythos_dir = DATA_DIR / "mythos"

    if not mythos_dir.exists():
        print(f"Warning: mythos directory not found at {mythos_dir}")
        return mythos_db

    # Find all mythos YAML files
    mythos_files = sorted(mythos_dir.glob("*.yaml"))

    try:
        for mythos_file in mythos_files:
            with open(mythos_file, encoding="utf-8") as f:
                mythos_data = yaml.safe_load(f)

            if not mythos_data:
                continue

            mythos_id = mythos_data.get("id", mythos_file.stem)

            # Get canonical info
            canonical = mythos_data.get("canonical", {})

            # Extract related characters
            related_chars = []
            for ability in canonical.get("abilities", []):
                if isinstance(ability, str):
                    related_chars.append(ability)

            # Also check if there's explicit character references
            if "related_characters" in canonical:
                related_chars.extend(canonical.get("related_characters", []))

            mythos_element = MythosElement(
                id=mythos_id,
                name=mythos_data.get("name", ""),
                category=mythos_data.get("category", "General"),
                description=canonical.get("description"),
                related_characters=related_chars if related_chars else None,
                significance=canonical.get("significance"),
            )
            mythos_db[mythos_id] = mythos_element

        print(f"Loaded {len(mythos_db)} mythos elements from YAML files")
    except Exception as e:
        print(f"Error loading mythos elements: {e}")

    return mythos_db


# Initialize databases on module load
print("Loading data files...")
episodes_db = load_episodes_from_json()
scenes_db = load_scenes_from_episodes()
characters_db, relationships_db = load_characters_from_yaml()
mythos_db = load_mythos_from_yaml()

print("\nData loading complete:")
print(f"  Episodes: {len(episodes_db)}")
print(f"  Scenes: {len(scenes_db)}")
print(f"  Characters: {len(characters_db)}")
print(f"  Relationships: {len(relationships_db)}")
print(f"  Mythos Elements: {len(mythos_db)}")
