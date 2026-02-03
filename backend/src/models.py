from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Episode(BaseModel):
    id: str
    title: str
    episode_number: int
    air_date: Optional[str] = None
    description: Optional[str] = None
    season: int
    synopsis: Optional[str] = None


class Scene(BaseModel):
    id: str
    episode_id: str
    scene_number: int
    title: str
    description: Optional[str] = None
    characters: List[str]


class Character(BaseModel):
    id: str
    name: str
    role: str
    description: Optional[str] = None
    family: Optional[str] = None
    adaptation_notes: Optional[str] = None
    canonical_traits: Optional[List[str]] = None
    adaptation_traits: Optional[List[str]] = None


class Relationship(BaseModel):
    id: str
    from_character_id: str
    to_character_id: str
    relationship_type: str
    description: Optional[str] = None


class MythosElement(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    related_characters: Optional[List[str]] = None
    significance: Optional[str] = None


class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str  # "character", "episode", "mythos"
    metadata: Optional[dict] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    edge_type: str
    label: Optional[str] = None


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
