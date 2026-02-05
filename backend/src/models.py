from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class NarrativeVersion(str, Enum):
    BST = "bst"
    SST = "sst"
    BOTH = "both"


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
    short_description: Optional[str] = None
    related_episodes: List[str] = []
    related_characters: List[str] = []
    media_urls: List[str] = []
    traits: List[str] = []
    abilities: List[str] = []
    weaknesses: List[str] = []
    significance: Optional[str] = None
    dark_variant: Optional[str] = None
    erotic_implications: Optional[str] = None
    horror_elements: List[str] = []
    taboo_potential: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


CONNECTION_TYPES = ["prerequisite", "related", "contradicts", "evolves_to", "explains"]


class MythosConnection(BaseModel):
    id: str
    from_element_id: str
    to_element_id: str
    connection_type: str = Field(
        ..., pattern="^(prerequisite|related|contradicts|evolves_to|explains)$"
    )
    description: Optional[str] = None
    strength: int = Field(ge=1, le=5, default=3)

    def model_post_init(self, __context):
        if self.from_element_id == self.to_element_id:
            raise ValueError("Self-referential connections are not allowed")


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


# D3.js Compatible Graph Models
class D3GraphNode(BaseModel):
    """D3.js force-directed graph node"""

    id: str
    name: str
    group: int = 1
    radius: int = 20
    color: Optional[str] = None
    metadata: Optional[dict] = None


class D3GraphLink(BaseModel):
    """D3.js force-directed graph link/edge"""

    source: str
    target: str
    type: str
    value: int = 1
    color: Optional[str] = None


class D3GraphData(BaseModel):
    """D3.js compatible graph format"""

    nodes: List[D3GraphNode]
    links: List[D3GraphLink]


# Character Relationship Graph Response
class RelationshipGraphResponse(D3GraphData):
    """Character relationships in D3.js format"""

    center_character_id: Optional[str] = None
    total_characters: int = 0
    total_relationships: int = 0


# Heatmap Models for Episode Presence
class EpisodePresenceEntry(BaseModel):
    """Single episode presence entry for heatmap"""

    episode_id: str
    intensity: int = Field(ge=0, le=5)
    screen_time: int = 0
    moment_count: int = 0


class CharacterHeatmapData(BaseModel):
    """Single character's heatmap data"""

    character_id: str
    character_name: Optional[str] = None
    episodes: List[EpisodePresenceEntry]
    total_screen_time: int = 0
    total_appearances: int = 0


class EpisodeHeatmapResponse(BaseModel):
    """Episode character presence heatmap format"""

    episode_id: str
    episode_title: str
    characters: List[CharacterHeatmapData]


class CharacterEpisodePresenceResponse(BaseModel):
    """Character's presence across all episodes"""

    character_id: str
    character_name: Optional[str] = None
    episodes: List[EpisodePresenceEntry]
    total_episodes: int = 0
    total_screen_time: int = 0


# Mythos Graph Response
class MythosGraphResponse(D3GraphData):
    """Full mythos graph in D3.js format"""

    total_elements: int = 0
    total_connections: int = 0
    categories: List[str] = []


class VideoMoment(BaseModel):
    timestamp: str
    timestamp_seconds: float
    description: str
    characters_present: List[str] = []
    content_type: str
    intensity: int = Field(ge=1, le=5, default=1)
    screenshot_path: Optional[str] = None


class VideoScene(BaseModel):
    scene_id: str
    start_timestamp: str
    end_timestamp: str
    start_seconds: float
    end_seconds: float
    location: Optional[str] = None
    characters: List[str] = []
    content_summary: str
    moments_count: int


class VideoAnalysis(BaseModel):
    episode_id: str
    episode_number: int
    title: str
    duration: str
    duration_seconds: float
    key_moments: List[VideoMoment]
    scenes: Optional[List[VideoScene]] = []
    total_moments: int
    total_scenes: int


class KeyMomentSummary(BaseModel):
    timestamp: str
    timestamp_seconds: float
    description: str
    content_type: str
    intensity: int


class EpisodeCharacterPresence(BaseModel):
    id: str
    episode_id: str
    character_id: str
    scene_appearances: List[str] = Field(default_factory=list)
    total_screen_time_seconds: int = Field(default=0, ge=0)
    importance_rating: int = Field(default=3, ge=1, le=5)
    first_appearance_timestamp: Optional[str] = None
    last_appearance_timestamp: Optional[str] = None
    key_moments: List[KeyMomentSummary] = Field(default_factory=list)
    moment_count: int = Field(default=0, ge=0)
    avg_intensity: float = Field(default=0.0, ge=0.0, le=5.0)


class EpisodeCharacterPresenceResponse(BaseModel):
    episode_id: str
    episode_title: str
    total_characters: int
    presences: List[EpisodeCharacterPresence]


# Character Evolution Tracking Models

MILESTONE_TYPES = [
    "first_appearance",
    "relationship_change",
    "power_awakening",
    "character_growth",
    "trauma",
    "triumph",
    "revelation",
]


class CharacterEvolutionMilestone(BaseModel):
    """Tracks significant character evolution moments across episodes"""

    id: str
    character_id: str
    episode_id: str
    timestamp: str  # HH:MM:SS in episode
    milestone_type: str = Field(
        ...,
        pattern="^(first_appearance|relationship_change|power_awakening|character_growth|trauma|triumph|revelation)$",
    )
    description: str
    importance: int = Field(ge=1, le=5, default=3)
    related_characters: List[str] = Field(default_factory=list)
    quote: Optional[str] = None
    intensity: int = Field(ge=1, le=5, default=3)
    content_type: Optional[str] = None
    screenshot_path: Optional[str] = None

    def model_post_init(self, __context):
        if self.importance < 1 or self.importance > 5:
            raise ValueError("Importance must be between 1 and 5")


class CharacterEvolutionResponse(BaseModel):
    """Response for character evolution endpoint"""

    character_id: str
    character_name: str
    first_appearance_episode: Optional[str] = None
    character_arc_summary: Optional[str] = None
    total_milestones: int
    milestones: List[CharacterEvolutionMilestone]
    timeline: List[Dict] = Field(default_factory=list)  # Formatted for frontend


class CharacterEvolutionSummary(BaseModel):
    """Summary of character evolution for listing"""

    character_id: str
    character_name: str
    first_appearance_episode: Optional[str] = None
    milestone_count: int
    latest_milestone_type: Optional[str] = None
    arc_completion_percentage: float = 0.0  # 0-100
