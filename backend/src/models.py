from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class NarrativeVersion(str, Enum):
    BST = "bst"
    SST = "sst"
    BOTH = "both"


class KinkDescriptor(BaseModel):
    descriptor: str
    intensity: int = Field(ge=1, le=5)
    context: str | None = None


class KinkLimit(BaseModel):
    descriptor: str
    type: str
    note: str | None = None


class PreferredDynamic(BaseModel):
    type: str
    role: str
    intensity: int = Field(ge=1, le=5)


class EpisodeEvolution(BaseModel):
    episode_id: str
    descriptors: dict[str, int] = {}


class KinkProfile(BaseModel):
    preferences: list[KinkDescriptor] = []
    limits: list[KinkLimit] = []
    evolution: list[EpisodeEvolution] = []
    preferred_dynamics: list[PreferredDynamic] = []
    consent_frameworks: list[str] = []


class SceneTags(BaseModel):
    content_warnings: list[str] = []
    descriptors: list[KinkDescriptor] = []
    consent_framework: str | None = None
    power_dynamic: dict[str, str] | None = None
    intensity_rating: int = Field(ge=1, le=5, default=1)
    narrative_purpose: str | None = None


class Episode(BaseModel):
    id: str
    title: str
    episode_number: int
    air_date: str | None = None
    description: str | None = None
    season: int
    synopsis: str | None = None


class Scene(BaseModel):
    id: str
    episode_id: str
    scene_number: int
    title: str
    description: str | None = None
    characters: list[str]
    tags: SceneTags | None = None


class Character(BaseModel):
    id: str
    name: str
    role: str
    description: str | None = None
    family: str | None = None
    adaptation_notes: str | None = None
    canonical_traits: list[str] | None = None
    adaptation_traits: list[str] | None = None
    kink_profile: KinkProfile | None = None


class Relationship(BaseModel):
    id: str
    from_character_id: str
    to_character_id: str
    relationship_type: str
    description: str | None = None


class MythosElement(BaseModel):
    id: str
    name: str
    category: str
    sub_category: str | None = None
    description: str | None = None
    short_description: str | None = None
    related_episodes: list[str] = []
    related_characters: list[str] = []
    media_urls: list[str] = []
    traits: list[str] = []
    abilities: list[str] = []
    weaknesses: list[str] = []
    significance: str | None = None
    dark_variant: str | None = None
    erotic_implications: str | None = None
    horror_elements: list[str] = []
    taboo_potential: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


CONNECTION_TYPES = ["prerequisite", "related", "contradicts", "evolves_to", "explains"]


class MythosConnection(BaseModel):
    id: str
    from_element_id: str
    to_element_id: str
    connection_type: str = Field(
        ..., pattern="^(prerequisite|related|contradicts|evolves_to|explains)$"
    )
    description: str | None = None
    strength: int = Field(ge=1, le=5, default=3)

    def model_post_init(self, __context):
        if self.from_element_id == self.to_element_id:
            raise ValueError("Self-referential connections are not allowed")


class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str
    metadata: dict | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    edge_type: str
    label: str | None = None


class GraphData(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# D3.js Compatible Graph Models
class D3GraphNode(BaseModel):
    """D3.js force-directed graph node"""

    id: str
    name: str
    group: int = 1
    radius: int = 20
    color: str | None = None
    metadata: dict | None = None


class D3GraphLink(BaseModel):
    """D3.js force-directed graph link/edge"""

    source: str
    target: str
    type: str
    value: int = 1
    color: str | None = None


class D3GraphData(BaseModel):
    """D3.js compatible graph format"""

    nodes: list[D3GraphNode]
    links: list[D3GraphLink]


# Character Relationship Graph Response
class RelationshipGraphResponse(D3GraphData):
    """Character relationships in D3.js format"""

    center_character_id: str | None = None
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
    character_name: str | None = None
    episodes: list[EpisodePresenceEntry]
    total_screen_time: int = 0
    total_appearances: int = 0


class EpisodeHeatmapResponse(BaseModel):
    """Episode character presence heatmap format"""

    episode_id: str
    episode_title: str
    characters: list[CharacterHeatmapData]


class CharacterEpisodePresenceResponse(BaseModel):
    """Character's presence across all episodes"""

    character_id: str
    character_name: str | None = None
    episodes: list[EpisodePresenceEntry]
    total_episodes: int = 0
    total_screen_time: int = 0


# Mythos Graph Response
class MythosGraphResponse(D3GraphData):
    """Full mythos graph in D3.js format"""

    total_elements: int = 0
    total_connections: int = 0
    categories: list[str] = []


class VideoMoment(BaseModel):
    timestamp: str
    timestamp_seconds: float
    description: str
    characters_present: list[str] = []
    content_type: str
    intensity: int = Field(ge=1, le=5, default=1)
    screenshot_path: str | None = None


class VideoScene(BaseModel):
    scene_id: str
    start_timestamp: str
    end_timestamp: str
    start_seconds: float
    end_seconds: float
    location: str | None = None
    characters: list[str] = []
    content_summary: str
    moments_count: int


class VideoAnalysis(BaseModel):
    episode_id: str
    episode_number: int
    title: str
    duration: str
    duration_seconds: float
    key_moments: list[VideoMoment]
    scenes: list[VideoScene] | None = []
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
    scene_appearances: list[str] = Field(default_factory=list)
    total_screen_time_seconds: int = Field(default=0, ge=0)
    importance_rating: int = Field(default=3, ge=1, le=5)
    first_appearance_timestamp: str | None = None
    last_appearance_timestamp: str | None = None
    key_moments: list[KeyMomentSummary] = Field(default_factory=list)
    moment_count: int = Field(default=0, ge=0)
    avg_intensity: float = Field(default=0.0, ge=0.0, le=5.0)


class EpisodeCharacterPresenceResponse(BaseModel):
    episode_id: str
    episode_title: str
    total_characters: int
    presences: list[EpisodeCharacterPresence]


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
    related_characters: list[str] = Field(default_factory=list)
    quote: str | None = None
    intensity: int = Field(ge=1, le=5, default=3)
    content_type: str | None = None
    screenshot_path: str | None = None

    def model_post_init(self, __context):
        if self.importance < 1 or self.importance > 5:
            raise ValueError("Importance must be between 1 and 5")


class CharacterEvolutionResponse(BaseModel):
    """Response for character evolution endpoint"""

    character_id: str
    character_name: str
    first_appearance_episode: str | None = None
    character_arc_summary: str | None = None
    total_milestones: int
    milestones: list[CharacterEvolutionMilestone]
    timeline: list[dict] = Field(default_factory=list)  # Formatted for frontend


class CharacterEvolutionSummary(BaseModel):
    """Summary of character evolution for listing"""

    character_id: str
    character_name: str
    first_appearance_episode: str | None = None
    milestone_count: int
    latest_milestone_type: str | None = None
    arc_completion_percentage: float = 0.0  # 0-100


# Media Lab Models
class MediaJobStatus(str, Enum):
    """Job lifecycle states"""

    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class WorkflowType(str, Enum):
    """Supported media workflow types"""

    ENHANCE = "enhance"
    INTERPOLATE = "interpolate"
    GENERATE = "generate"
    BLEND = "blend"


class MediaJobSubmitRequest(BaseModel):
    """Request to submit a new media job"""

    character_id: str
    workflow_type: str = Field(..., pattern="^(enhance|interpolate|generate|blend)$")
    parameters: dict = Field(default_factory=dict)


class ArtifactData(BaseModel):
    """Artifact metadata and reference"""

    id: str
    artifact_type: str
    file_path: str
    file_size_bytes: int | None = None
    metadata_json: dict | None = None


class MediaJobResponse(BaseModel):
    """Response for a media job"""

    id: str
    character_id: str
    workflow_type: str
    status: str
    progress: int = Field(ge=0, le=100)
    error_message: str | None = None
    artifacts: list[ArtifactData] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class MediaJobListResponse(BaseModel):
    """Response for listing media jobs"""

    total: int
    jobs: list[MediaJobResponse]


class ArtifactListResponse(BaseModel):
    """Response for listing artifacts for a job"""

    job_id: str
    total_artifacts: int
    artifacts: list[ArtifactData]


class CancelJobRequest(BaseModel):
    """Request to cancel a job"""

    reason: str | None = None


class RetryJobRequest(BaseModel):
    """Request to retry a job"""

    reason: str | None = None


class StageConfig(BaseModel):
    """Configuration for a single pipeline stage"""

    stage_type: str = Field(..., pattern="^(text_to_image|refiner|detailer|upscaler|img2img|instruct_pix2pix)$")
    name: str | None = None
    parameters: dict = Field(default_factory=dict)
    loras: list["LoRAConfig"] = Field(default_factory=list)


class LoRAConfig(BaseModel):
    """Configuration for LoRA (Low-Rank Adaptation) model"""

    path: str
    weight: float = 1.0


class PipelineConfig(BaseModel):
    """Configuration for 9-stage linear pipeline"""

    stages: list[StageConfig]
    parameters: dict = Field(default_factory=dict)
    loras: list[LoRAConfig] = Field(default_factory=list)
    seed: int = Field(default=-1, ge=-1)
    width: int | None = Field(default=None, ge=256, le=2048)
    height: int | None = Field(default=None, ge=256, le=2048)
    source_image_path: str | None = None
    instruction: str | None = None
    mask_path: str | None = None
    strength: float = Field(default=0.75, ge=0.0, le=1.0)
    sampler: str = Field(
        default="euler",
        pattern="^(euler|euler_ancestral|heun|dpm_2|dpm_2_ancestral|lms|ddim|pndm|ddpm)$"
    )
    scheduler: str = Field(
        default="normal",
        pattern="^(normal|karras|exponential|sgm_uniform|simple)$"
    )

    def model_post_init(self, __context):
        """Validate width and height are multiples of 8"""
        if self.width is not None and self.width % 8 != 0:
            raise ValueError(f"width must be a multiple of 8, got {self.width}")
        if self.height is not None and self.height % 8 != 0:
            raise ValueError(f"height must be a multiple of 8, got {self.height}")


# Model Registry Models
class ModelType(str, Enum):
    """Types of models supported in the registry"""

    CHECKPOINT = "checkpoint"
    LORA = "lora"
    EMBEDDING = "embedding"


class ModelInfo(BaseModel):
    """Metadata for a registered model"""

    name: str
    model_type: ModelType
    file_path: str
    file_size_bytes: int | None = None
    discovered_at: datetime | None = None
    description: str | None = None
    tags: list[str] = Field(default_factory=list)
    metadata: dict | None = Field(default_factory=dict)


# Pipeline Execution Models
class GenerateRequest(BaseModel):
    """Request to generate media using pipeline"""

    pipeline_config: PipelineConfig
    input_data: dict = Field(default_factory=dict)


class EnhanceRequest(BaseModel):
    """Request to enhance media using pipeline"""

    pipeline_config: PipelineConfig
    input_data: dict = Field(default_factory=dict)


class PipelineExecutionResponse(BaseModel):
    """Response from pipeline execution"""

    job_id: str
    success: bool
    data: dict = Field(default_factory=dict)
    artifacts: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    error: str | None = None


class ModelsListResponse(BaseModel):
    """Response for listing available models"""

    total: int
    models: list[ModelInfo]
