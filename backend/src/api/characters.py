
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..data import (
    character_evolution_db,
    character_presence_db,
    characters_db,
    episodes_db,
    relationships_db,
)
from ..models import (
    MILESTONE_TYPES,
    Character,
    CharacterEpisodePresenceResponse,
    CharacterEvolutionResponse,
    CharacterEvolutionSummary,
    D3GraphLink,
    D3GraphNode,
    EpisodePresenceEntry,
    Relationship,
    RelationshipGraphResponse,
)

router = APIRouter(prefix="/api/characters", tags=["characters"])

RELATIONSHIP_TYPE_GROUPS = {
    "romantic": 1,
    "family": 2,
    "friend": 3,
    "enemy": 4,
    "servant": 5,
    "master": 5,
    "ally": 3,
    "rival": 4,
}

RELATIONSHIP_TYPE_COLORS = {
    "romantic": "#e53e3e",
    "family": "#805ad5",
    "friend": "#38a169",
    "enemy": "#c53030",
    "servant": "#718096",
    "master": "#d69e2e",
    "ally": "#3182ce",
    "rival": "#dd6b20",
}


class RelationshipCreate(BaseModel):
    from_character_id: str
    to_character_id: str
    relationship_type: str
    description: str | None = None


class RelationshipUpdate(BaseModel):
    relationship_type: str | None = None
    description: str | None = None


@router.get("", response_model=list[Character])
async def list_characters():
    return list(characters_db.values())


@router.get("/{character_id}", response_model=Character)
async def get_character(character_id: str):
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")
    return characters_db[character_id]


@router.get("/{character_id}/relationships", response_model=list[Relationship])
async def get_character_relationships(character_id: str):
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    character_relationships = [
        rel
        for rel in relationships_db.values()
        if rel.from_character_id == character_id or rel.to_character_id == character_id
    ]
    return character_relationships


@router.get("/{character_id}/relationships/graph", response_model=RelationshipGraphResponse)
async def get_character_relationship_graph(character_id: str, depth: int = 1):
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    included_character_ids = {character_id}
    relevant_relationships: list[Relationship] = []

    current_layer = {character_id}
    for _ in range(depth):
        next_layer = set()
        for rel in relationships_db.values():
            if rel.from_character_id in current_layer:
                next_layer.add(rel.to_character_id)
                relevant_relationships.append(rel)
                included_character_ids.add(rel.to_character_id)
            elif rel.to_character_id in current_layer:
                next_layer.add(rel.from_character_id)
                relevant_relationships.append(rel)
                included_character_ids.add(rel.from_character_id)
        current_layer = next_layer

    seen_rel_ids = set()
    unique_relationships = []
    for rel in relevant_relationships:
        if rel.id not in seen_rel_ids:
            seen_rel_ids.add(rel.id)
            unique_relationships.append(rel)

    nodes = []
    for char_id in included_character_ids:
        char = characters_db.get(char_id)
        if char:
            is_center = char_id == character_id
            nodes.append(
                D3GraphNode(
                    id=char_id,
                    name=char.name,
                    group=1 if is_center else 2,
                    radius=30 if is_center else 20,
                    color="#c9a227" if is_center else "#6b7280",
                    metadata={"role": char.role, "family": char.family},
                )
            )

    links = []
    for rel in unique_relationships:
        rel_type = rel.relationship_type.lower()
        links.append(
            D3GraphLink(
                source=rel.from_character_id,
                target=rel.to_character_id,
                type=rel.relationship_type,
                value=RELATIONSHIP_TYPE_GROUPS.get(rel_type, 3),
                color=RELATIONSHIP_TYPE_COLORS.get(rel_type, "#718096"),
            )
        )

    return RelationshipGraphResponse(
        nodes=nodes,
        links=links,
        center_character_id=character_id,
        total_characters=len(nodes),
        total_relationships=len(links),
    )


@router.post("/relationships", response_model=Relationship, status_code=201)
async def create_relationship(data: RelationshipCreate):
    if data.from_character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Source character not found")
    if data.to_character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Target character not found")
    if data.from_character_id == data.to_character_id:
        raise HTTPException(status_code=400, detail="Self-referential relationships not allowed")

    rel_id = f"{data.from_character_id}-{data.to_character_id}"
    if rel_id in relationships_db:
        raise HTTPException(status_code=409, detail="Relationship already exists")

    new_relationship = Relationship(
        id=rel_id,
        from_character_id=data.from_character_id,
        to_character_id=data.to_character_id,
        relationship_type=data.relationship_type,
        description=data.description,
    )
    relationships_db[rel_id] = new_relationship
    return new_relationship


@router.put("/relationships/{relationship_id}", response_model=Relationship)
async def update_relationship(relationship_id: str, data: RelationshipUpdate):
    if relationship_id not in relationships_db:
        raise HTTPException(status_code=404, detail="Relationship not found")

    existing = relationships_db[relationship_id]
    updated_data = existing.model_dump()

    if data.relationship_type is not None:
        updated_data["relationship_type"] = data.relationship_type
    if data.description is not None:
        updated_data["description"] = data.description

    updated_relationship = Relationship(**updated_data)
    relationships_db[relationship_id] = updated_relationship
    return updated_relationship


@router.delete("/relationships/{relationship_id}", status_code=204)
async def delete_relationship(relationship_id: str):
    if relationship_id not in relationships_db:
        raise HTTPException(status_code=404, detail="Relationship not found")
    del relationships_db[relationship_id]
    return None


@router.get("/{character_id}/episode-presence", response_model=CharacterEpisodePresenceResponse)
async def get_character_episode_presence(character_id: str):
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    character = characters_db[character_id]
    presences = [p for p in character_presence_db.values() if p.character_id == character_id]

    episodes_list = []
    total_screen_time = 0

    for presence in sorted(
        presences,
        key=lambda p: episodes_db.get(p.episode_id, {}).id
        if p.episode_id in episodes_db
        else p.episode_id,
    ):
        episodes_list.append(
            EpisodePresenceEntry(
                episode_id=presence.episode_id,
                intensity=presence.importance_rating,
                screen_time=presence.total_screen_time_seconds,
                moment_count=presence.moment_count,
            )
        )
        total_screen_time += presence.total_screen_time_seconds

    return CharacterEpisodePresenceResponse(
        character_id=character_id,
        character_name=character.name,
        episodes=episodes_list,
        total_episodes=len(episodes_list),
        total_screen_time=total_screen_time,
    )


def _load_evolution_metadata() -> dict:
    """Load character evolution metadata (first appearances, arc summaries)."""
    import json
    from pathlib import Path

    metadata_file = (
        Path(__file__).parent.parent.parent.parent / "data" / "character_evolution_metadata.json"
    )
    if metadata_file.exists():
        with open(metadata_file, encoding="utf-8") as f:
            return json.load(f)
    return {"first_appearances": {}, "arc_summaries": {}}


@router.get("/evolution/types", response_model=list[str])
async def get_evolution_milestone_types():
    """Get all valid milestone types."""
    return MILESTONE_TYPES


@router.get("/evolution/summary", response_model=list[CharacterEvolutionSummary])
async def get_all_character_evolution_summaries():
    """Get evolution summary for all characters."""
    metadata = _load_evolution_metadata()
    first_appearances = metadata.get("first_appearances", {})
    arc_summaries = metadata.get("arc_summaries", {})

    summaries = []
    character_milestones: dict[str, list] = {}

    for milestone in character_evolution_db.values():
        char_id = milestone.character_id
        if char_id not in character_milestones:
            character_milestones[char_id] = []
        character_milestones[char_id].append(milestone)

    for char_id, milestones in character_milestones.items():
        char = characters_db.get(char_id)
        char_name = char.name if char else char_id

        sorted_milestones = sorted(milestones, key=lambda m: (m.episode_id, m.timestamp))
        latest = sorted_milestones[-1] if sorted_milestones else None

        total_episodes = 7
        episodes_with_milestones = len(set(m.episode_id for m in milestones))
        arc_completion = (episodes_with_milestones / total_episodes) * 100

        summaries.append(
            CharacterEvolutionSummary(
                character_id=char_id,
                character_name=char_name,
                first_appearance_episode=first_appearances.get(char_id),
                milestone_count=len(milestones),
                latest_milestone_type=latest.milestone_type if latest else None,
                arc_completion_percentage=round(arc_completion, 1),
            )
        )

    return sorted(summaries, key=lambda s: -s.milestone_count)


@router.get("/{character_id}/evolution", response_model=CharacterEvolutionResponse)
async def get_character_evolution(
    character_id: str,
    milestone_type: str | None = Query(None, description="Filter by milestone type"),
    min_importance: int | None = Query(None, ge=1, le=5, description="Minimum importance"),
):
    """Get character evolution milestones with timeline format for frontend."""
    all_milestones = [m for m in character_evolution_db.values() if m.character_id == character_id]

    if not all_milestones:
        char = characters_db.get(character_id)
        if not char:
            raise HTTPException(status_code=404, detail="Character not found")
        return CharacterEvolutionResponse(
            character_id=character_id,
            character_name=char.name,
            first_appearance_episode=None,
            character_arc_summary=None,
            total_milestones=0,
            milestones=[],
            timeline=[],
        )

    char = characters_db.get(character_id)
    char_name = char.name if char else character_id

    metadata = _load_evolution_metadata()
    first_appearance = metadata.get("first_appearances", {}).get(character_id)
    arc_summary = metadata.get("arc_summaries", {}).get(character_id)

    filtered_milestones = all_milestones
    if milestone_type:
        filtered_milestones = [m for m in filtered_milestones if m.milestone_type == milestone_type]
    if min_importance:
        filtered_milestones = [m for m in filtered_milestones if m.importance >= min_importance]

    sorted_milestones = sorted(filtered_milestones, key=lambda m: (m.episode_id, m.timestamp))

    timeline = []
    for milestone in sorted_milestones:
        episode = episodes_db.get(milestone.episode_id)
        episode_title = episode.title if episode else milestone.episode_id

        timeline.append(
            {
                "id": milestone.id,
                "episode_id": milestone.episode_id,
                "episode_title": episode_title,
                "timestamp": milestone.timestamp,
                "type": milestone.milestone_type,
                "description": milestone.description,
                "importance": milestone.importance,
                "intensity": milestone.intensity,
                "related_characters": milestone.related_characters,
                "screenshot_path": milestone.screenshot_path,
            }
        )

    return CharacterEvolutionResponse(
        character_id=character_id,
        character_name=char_name,
        first_appearance_episode=first_appearance,
        character_arc_summary=arc_summary,
        total_milestones=len(sorted_milestones),
        milestones=sorted_milestones,
        timeline=timeline,
    )
