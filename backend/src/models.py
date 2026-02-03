from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class KinkDescriptor(BaseModel):
    descriptor: str
    intensity: int = Field(ge=1, le=5)
    context: Optional[str] = None


class KinkLimit(BaseModel):
    descriptor: str
    type: str
    note: Optional[str] = None


class PreferredDynamic(BaseModel):
    type: str
    role: str
    intensity: int = Field(ge=1, le=5)


class EpisodeEvolution(BaseModel):
    episode_id: str
    descriptors: Dict[str, int] = {}


class KinkProfile(BaseModel):
    preferences: List[KinkDescriptor] = []
    limits: List[KinkLimit] = []
    evolution: List[EpisodeEvolution] = []
    preferred_dynamics: List[PreferredDynamic] = []
    consent_frameworks: List[str] = []


class SceneTags(BaseModel):
    content_warnings: List[str] = []
    descriptors: List[KinkDescriptor] = []
    consent_framework: Optional[str] = None
    power_dynamic: Optional[Dict[str, str]] = None
    intensity_rating: int = Field(ge=1, le=5, default=1)
    narrative_purpose: Optional[str] = None


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
    tags: Optional[SceneTags] = None


class Character(BaseModel):
    id: str
    name: str
    role: str
    description: Optional[str] = None
    family: Optional[str] = None
    adaptation_notes: Optional[str] = None
    canonical_traits: Optional[List[str]] = None
    adaptation_traits: Optional[List[str]] = None
    kink_profile: Optional[KinkProfile] = None


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
    node_type: str
    metadata: Optional[dict] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    edge_type: str
    label: Optional[str] = None


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
