"""SQLModel database models for relational data.

These models use SQLModel which combines SQLAlchemy ORM with Pydantic validation.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import field_validator, model_validator
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Index, SQLModel


class RelationshipType(str, Enum):
    """Canonical relationship types between characters."""

    ROMANTIC = "romantic"
    FAMILIAL = "familial"
    ANTAGONISTIC = "antagonistic"
    SIRE_PROGENY = "sire/progeny"
    FRIENDSHIP = "friendship"
    PROFESSIONAL = "professional"


class CharacterRelationshipBase(SQLModel):
    """Base model for character relationships with validation."""

    from_character_id: str = Field(..., index=True, description="ID of the source character")
    to_character_id: str = Field(..., index=True, description="ID of the target character")
    relationship_type: RelationshipType = Field(..., description="Type of relationship")
    intensity: int = Field(default=3, ge=1, le=5, description="Intensity of relationship (1-5)")
    start_episode: str | None = Field(default=None, description="Episode where relationship begins")
    end_episode: str | None = Field(
        default=None, description="Episode where relationship ends (if applicable)"
    )
    description: str = Field(default="", description="Description of the relationship")
    is_canonical: bool = Field(
        default=True,
        description="Whether relationship is from source material or adaptation only",
    )

    @field_validator("intensity")
    @classmethod
    def validate_intensity(cls, v: int) -> int:
        """Ensure intensity is within valid range."""
        if not 1 <= v <= 5:
            raise ValueError("Intensity must be between 1 and 5")
        return v

    @model_validator(mode="after")
    def validate_no_self_relationship(self) -> "CharacterRelationshipBase":
        """Prevent self-referential relationships."""
        if self.from_character_id == self.to_character_id:
            raise ValueError("Character cannot have a relationship with themselves")
        return self


class CharacterRelationship(CharacterRelationshipBase, table=True):
    """SQLModel table for character relationships.

    Stores directed edges between characters with metadata.
    Uses UUID for primary key and includes composite unique constraint
    to prevent duplicate edges.
    """

    __tablename__ = "character_relationships"
    __table_args__ = (
        # Prevent duplicate edges: same from->to with same type
        UniqueConstraint(
            "from_character_id", "to_character_id", "relationship_type", name="uq_relationship_edge"
        ),
        Index("ix_relationship_from_to", "from_character_id", "to_character_id"),
    )

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique identifier for the relationship",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="When the relationship was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow, description="When the relationship was last updated"
    )


# --- Pydantic Schemas for API ---


class CharacterRelationshipCreate(CharacterRelationshipBase):
    """Schema for creating a new relationship."""

    pass


class CharacterRelationshipUpdate(SQLModel):
    """Schema for updating a relationship (all fields optional)."""

    relationship_type: RelationshipType | None = None
    intensity: int | None = Field(default=None, ge=1, le=5)
    start_episode: str | None = None
    end_episode: str | None = None
    description: str | None = None
    is_canonical: bool | None = None


class CharacterRelationshipRead(CharacterRelationshipBase):
    """Schema for reading a relationship (includes id and timestamps)."""

    id: str
    created_at: datetime
    updated_at: datetime


class CharacterRelationshipWithNames(CharacterRelationshipRead):
    """Schema for reading a relationship with character names resolved."""

    from_character_name: str | None = None
    to_character_name: str | None = None


class RelationshipBulkCreate(SQLModel):
    """Schema for bulk creating relationships."""

    relationships: list[CharacterRelationshipCreate]


class RelationshipStats(SQLModel):
    """Statistics about relationships for a character."""

    character_id: str
    total_relationships: int
    by_type: dict[str, int]
    average_intensity: float
