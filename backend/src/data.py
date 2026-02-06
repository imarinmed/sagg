import json
from pathlib import Path

import yaml

from .models import (
    Character,
    CharacterEvolutionMilestone,
    Episode,
    EpisodeCharacterPresence,
    EpisodeEvolution,
    KeyMomentSummary,
    KinkDescriptor,
    KinkLimit,
    KinkProfile,
    MythosConnection,
    MythosElement,
    Relationship,
    Scene,
    VideoAnalysis,
    VideoMoment,
    VideoScene,
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
    mythos_db = {}
    mythos_dir = DATA_DIR / "mythos"

    if not mythos_dir.exists():
        print(f"Warning: mythos directory not found at {mythos_dir}")
        return mythos_db

    mythos_files = sorted(mythos_dir.glob("*.yaml"))

    try:
        for mythos_file in mythos_files:
            with open(mythos_file, encoding="utf-8") as f:
                mythos_data = yaml.safe_load(f)

            if not mythos_data:
                continue

            mythos_id = mythos_data.get("id", mythos_file.stem)
            canonical = mythos_data.get("canonical", {})
            adaptation = mythos_data.get("adaptation_expansion", {})

            related_chars: list[str] = []
            for ability in canonical.get("abilities", []):
                if isinstance(ability, str):
                    related_chars.append(ability)
            if "related_characters" in canonical:
                related_chars.extend(canonical.get("related_characters", []))
            if "related_characters" in mythos_data:
                related_chars.extend(mythos_data.get("related_characters", []))

            related_episodes: list[str] = canonical.get("source_episodes", [])
            if "related_episodes" in mythos_data:
                related_episodes = mythos_data.get("related_episodes", [])

            mythos_element = MythosElement(
                id=mythos_id,
                name=mythos_data.get("name", ""),
                category=mythos_data.get("category", "General"),
                description=canonical.get("description"),
                short_description=mythos_data.get("short_description"),
                related_episodes=related_episodes,
                related_characters=related_chars,
                media_urls=mythos_data.get("media_urls", []),
                traits=canonical.get("traits", []),
                abilities=canonical.get("abilities", []),
                weaknesses=canonical.get("weaknesses", []),
                significance=canonical.get("significance"),
                dark_variant=adaptation.get("dark_variant"),
                erotic_implications=adaptation.get("erotic_implications"),
                horror_elements=adaptation.get("horror_elements", []),
                taboo_potential=adaptation.get("taboo_potential"),
            )
            mythos_db[mythos_id] = mythos_element

        print(f"Loaded {len(mythos_db)} mythos elements from YAML files")
    except Exception as e:
        print(f"Error loading mythos elements: {e}")

    return mythos_db


def load_mythos_connections_from_json() -> dict:
    connections_db = {}
    connections_file = DATA_DIR / "mythos" / "connections.json"

    if not connections_file.exists():
        print(f"Warning: mythos connections.json not found at {connections_file}")
        return connections_db

    try:
        with open(connections_file, encoding="utf-8") as f:
            connections_data = json.load(f)

        seen_pairs: set[tuple[str, str]] = set()
        for conn_data in connections_data.get("connections", []):
            from_id = conn_data.get("from_element_id", "")
            to_id = conn_data.get("to_element_id", "")

            pair = (from_id, to_id)
            if pair in seen_pairs:
                print(f"Warning: Duplicate connection {from_id} -> {to_id}, skipping")
                continue
            seen_pairs.add(pair)

            if from_id == to_id:
                print(f"Warning: Self-referential connection {from_id}, skipping")
                continue

            conn_id = conn_data.get("id", f"{from_id}_to_{to_id}")
            connection = MythosConnection(
                id=conn_id,
                from_element_id=from_id,
                to_element_id=to_id,
                connection_type=conn_data.get("connection_type", "related"),
                description=conn_data.get("description"),
                strength=conn_data.get("strength", 3),
            )
            connections_db[conn_id] = connection

        print(f"Loaded {len(connections_db)} mythos connections from connections.json")
    except Exception as e:
        print(f"Error loading mythos connections: {e}")

    return connections_db


def load_video_analysis_from_json() -> dict:
    """Load video analysis from data/video_analysis/video_analysis_v2.json"""
    video_analysis_db = {}
    video_analysis_file = DATA_DIR / "video_analysis" / "video_analysis_v2.json"

    if not video_analysis_file.exists():
        print(f"Warning: video_analysis_v2.json not found at {video_analysis_file}")
        return video_analysis_db

    try:
        with open(video_analysis_file, encoding="utf-8") as f:
            data = json.load(f)

        episodes_list = data.get("episodes", [])

        for ep_data in episodes_list:
            episode_id = ep_data.get("episode_id", "")

            # Parse moments
            moments = []
            for moment_data in ep_data.get("key_moments", []):
                moment = VideoMoment(
                    timestamp=moment_data.get("timestamp", ""),
                    timestamp_seconds=moment_data.get("timestamp_seconds", 0.0),
                    description=moment_data.get("description", ""),
                    characters_present=moment_data.get("characters_present", []),
                    content_type=moment_data.get("content_type", ""),
                    intensity=moment_data.get("intensity", 1),
                    screenshot_path=moment_data.get("screenshot_path"),
                )
                moments.append(moment)

            # Parse scenes (if present)
            scenes = []
            for scene_data in ep_data.get("scenes", []):
                scene = VideoScene(
                    scene_id=scene_data.get("scene_id", ""),
                    start_timestamp=scene_data.get("start_timestamp", ""),
                    end_timestamp=scene_data.get("end_timestamp", ""),
                    start_seconds=scene_data.get("start_seconds", 0.0),
                    end_seconds=scene_data.get("end_seconds", 0.0),
                    location=scene_data.get("location"),
                    characters=scene_data.get("characters", []),
                    content_summary=scene_data.get("content_summary", ""),
                    moments_count=scene_data.get("moments_count", 0),
                )
                scenes.append(scene)

            video_analysis = VideoAnalysis(
                episode_id=episode_id,
                episode_number=ep_data.get("episode_number", 0),
                title=ep_data.get("title", ""),
                duration=ep_data.get("duration", ""),
                duration_seconds=ep_data.get("duration_seconds", 0.0),
                key_moments=moments,
                scenes=scenes,
                total_moments=len(moments),
                total_scenes=len(scenes),
            )
            video_analysis_db[episode_id] = video_analysis

        print(f"Loaded {len(video_analysis_db)} video analyses from video_analysis_v2.json")
    except Exception as e:
        print(f"Error loading video analysis: {e}")

    return video_analysis_db


def load_character_presence_from_video_analysis(video_analysis_db: dict, scenes_db: dict) -> dict:
    presence_db = {}

    for episode_id, video_analysis in video_analysis_db.items():
        character_moments: dict = {}

        for moment in video_analysis.key_moments:
            for char_id in moment.characters_present:
                if char_id not in character_moments:
                    character_moments[char_id] = []
                character_moments[char_id].append(moment)

        for char_id, moments in character_moments.items():
            if not moments:
                continue

            moments_sorted = sorted(moments, key=lambda m: m.timestamp_seconds)
            first_moment = moments_sorted[0]
            last_moment = moments_sorted[-1]

            avg_interval_seconds = 3.0
            estimated_screen_time = len(moments) * int(avg_interval_seconds)

            intensities = [m.intensity for m in moments]
            avg_intensity = sum(intensities) / len(intensities) if intensities else 0.0

            if len(moments) >= 10:
                importance = 5
            elif len(moments) >= 5:
                importance = 4
            elif len(moments) >= 3:
                importance = 3
            elif len(moments) >= 2:
                importance = 2
            else:
                importance = 1

            episode_scenes = [s for s in scenes_db.values() if s.episode_id == episode_id]
            scene_appearances = []
            for scene in episode_scenes:
                if char_id in scene.characters:
                    scene_appearances.append(scene.id)

            key_moment_summaries = [
                KeyMomentSummary(
                    timestamp=m.timestamp,
                    timestamp_seconds=m.timestamp_seconds,
                    description=m.description,
                    content_type=m.content_type,
                    intensity=m.intensity,
                )
                for m in moments_sorted[:10]
            ]

            presence_id = f"{episode_id}_{char_id}"
            presence = EpisodeCharacterPresence(
                id=presence_id,
                episode_id=episode_id,
                character_id=char_id,
                scene_appearances=scene_appearances,
                total_screen_time_seconds=estimated_screen_time,
                importance_rating=importance,
                first_appearance_timestamp=first_moment.timestamp,
                last_appearance_timestamp=last_moment.timestamp,
                key_moments=key_moment_summaries,
                moment_count=len(moments),
                avg_intensity=round(avg_intensity, 2),
            )
            presence_db[presence_id] = presence

    print(f"Generated {len(presence_db)} character presence records from video analysis")
    return presence_db


# Initialize databases on module load
print("Loading data files...")
episodes_db = load_episodes_from_json()
scenes_db = load_scenes_from_episodes()
characters_db, relationships_db = load_characters_from_yaml()
mythos_db = load_mythos_from_yaml()
mythos_connections_db = load_mythos_connections_from_json()
video_analysis_db = load_video_analysis_from_json()

print("\nData loading complete:")
print(f"  Episodes: {len(episodes_db)}")
print(f"  Scenes: {len(scenes_db)}")
print(f"  Characters: {len(characters_db)}")
print(f"  Relationships: {len(relationships_db)}")
print(f"  Mythos Elements: {len(mythos_db)}")
print(f"  Mythos Connections: {len(mythos_connections_db)}")
print(f"  Video Analyses: {len(video_analysis_db)}")

character_presence_db = load_character_presence_from_video_analysis(video_analysis_db, scenes_db)
print(f"  Character Presences: {len(character_presence_db)}")


def load_character_evolution_from_json() -> dict:
    evolution_db = {}
    evolution_file = DATA_DIR / "character_evolution.json"

    if not evolution_file.exists():
        print(f"Warning: character_evolution.json not found at {evolution_file}")
        return evolution_db

    try:
        with open(evolution_file, encoding="utf-8") as f:
            evolution_data = json.load(f)

        for milestone_data in evolution_data:
            milestone_id = milestone_data.get("id", "")
            milestone = CharacterEvolutionMilestone(
                id=milestone_id,
                character_id=milestone_data.get("character_id", ""),
                episode_id=milestone_data.get("episode_id", ""),
                timestamp=milestone_data.get("timestamp", "00:00:00"),
                milestone_type=milestone_data.get("milestone_type", "character_growth"),
                description=milestone_data.get("description", ""),
                importance=milestone_data.get("importance", 3),
                related_characters=milestone_data.get("related_characters", []),
                quote=milestone_data.get("quote"),
                intensity=milestone_data.get("intensity", 3),
                content_type=milestone_data.get("content_type"),
                screenshot_path=milestone_data.get("screenshot_path"),
            )
            evolution_db[milestone_id] = milestone

        print(f"Loaded {len(evolution_db)} character evolution milestones")
    except Exception as e:
        print(f"Error loading character evolution: {e}")

    return evolution_db


def load_relationships_from_json(existing_relationships: dict) -> dict:
    """Load relationships from JSON, merging with existing YAML relationships (YAML takes precedence)."""
    relationships_db = dict(existing_relationships)
    relationships_file = DATA_DIR / "character_relationships.json"

    if not relationships_file.exists():
        print("Note: character_relationships.json not found, using YAML relationships only")
        return relationships_db

    try:
        with open(relationships_file, encoding="utf-8") as f:
            data = json.load(f)

        added_count = 0
        for rel_data in data.get("relationships", []):
            rel_id = rel_data.get("id", "")
            from_char = rel_data.get("from_character_id", "")
            to_char = rel_data.get("to_character_id", "")

            existing_keys = {rel_id, f"{from_char}-{to_char}", f"{to_char}-{from_char}"}
            if any(key in relationships_db for key in existing_keys):
                continue

            relationship = Relationship(
                id=rel_id,
                from_character_id=from_char,
                to_character_id=to_char,
                relationship_type=rel_data.get("relationship_type", "acquaintance"),
                description=rel_data.get("description"),
            )
            relationships_db[rel_id] = relationship
            added_count += 1

        print(f"Added {added_count} relationships from character_relationships.json")
    except Exception as e:
        print(f"Error loading relationships from JSON: {e}")

    return relationships_db


character_evolution_db = load_character_evolution_from_json()
print(f"  Character Evolution: {len(character_evolution_db)}")

relationships_db = load_relationships_from_json(relationships_db)
print(f"  Total Relationships (after merge): {len(relationships_db)}")


def load_causality_edges_from_json() -> dict:
    """Load causality edges from data/causality/edges.json"""
    edges_db = {}
    edges_file = DATA_DIR / "causality" / "edges.json"

    if not edges_file.exists():
        print(f"Warning: causality edges.json not found at {edges_file}")
        return edges_db

    try:
        with open(edges_file, encoding="utf-8") as f:
            data = json.load(f)

        for edge_data in data.get("edges", []):
            edge_id = edge_data.get("edge_id", "")
            edges_db[edge_id] = edge_data

        print(f"Loaded {len(edges_db)} causality edges from edges.json")
    except Exception as e:
        print(f"Error loading causality edges: {e}")

    return edges_db


def load_claims_from_json() -> dict:
    """Load knowledge claims from data/knowledge/claims.json"""
    claims_db = {}
    claims_file = DATA_DIR / "knowledge" / "claims.json"

    if not claims_file.exists():
        print(f"Warning: knowledge claims.json not found at {claims_file}")
        return claims_db

    try:
        with open(claims_file, encoding="utf-8") as f:
            data = json.load(f)

        for claim_data in data.get("claims", []):
            claim_id = claim_data.get("claim_id", "")
            claims_db[claim_id] = claim_data

        print(f"Loaded {len(claims_db)} knowledge claims from claims.json")
    except Exception as e:
        print(f"Error loading knowledge claims: {e}")

    return claims_db


def load_entity_versions(entity_type: str, entity_id: str) -> dict | None:
    """Load BST/SST versions for a mythos or character entity from YAML"""
    if entity_type == "mythos":
        entity_dir = DATA_DIR / "mythos"
    elif entity_type == "character":
        entity_dir = DATA_DIR / "characters"
    else:
        return None

    yaml_file = entity_dir / f"{entity_id}.yaml"
    if not yaml_file.exists():
        return None

    try:
        with open(yaml_file, encoding="utf-8") as f:
            data = yaml.safe_load(f)

        versions = data.get("versions", {})
        return {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "name": data.get("name", entity_id),
            "bst_version": versions.get("bst", {}),
            "sst_version": versions.get("sst", {}),
            "divergences": data.get("divergences", []),
        }
    except Exception as e:
        print(f"Error loading entity versions for {entity_type}/{entity_id}: {e}")
        return None


causality_edges_db = load_causality_edges_from_json()
print(f"  Causality Edges: {len(causality_edges_db)}")

claims_db = load_claims_from_json()
print(f"  Knowledge Claims: {len(claims_db)}")
