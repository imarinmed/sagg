"""Database operations for artifact tagging.

Provides CRUD operations for artifact tags using SQLModel session.
"""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import and_
from sqlmodel import Session, delete, select

from .db_models import ArtifactTag


UTC = timezone.utc


def create_artifact_tag(
    session: Session, artifact_id: str, entity_type: str, entity_id: str
) -> ArtifactTag:
    """Create a new artifact tag.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact being tagged
        entity_type: Type of entity ('character', 'episode', 'mythos')
        entity_id: ID of the entity

    Returns:
        Created ArtifactTag model

    Raises:
        IntegrityError if tag already exists (unique constraint violation)
    """
    tag = ArtifactTag(
        id=str(uuid4()),
        artifact_id=artifact_id,
        entity_type=entity_type,
        entity_id=entity_id,
        created_at=datetime.now(UTC).replace(tzinfo=None),
        updated_at=datetime.now(UTC).replace(tzinfo=None),
    )
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


def get_artifact_tags(session: Session, artifact_id: str) -> dict[str, list[str]]:
    """Get all tags for an artifact organized by entity type.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact

    Returns:
        Dict with entity types as keys and lists of entity IDs as values.
        Example: {'character': ['id1', 'id2'], 'episode': ['s01e01']}
    """
    tags = session.exec(select(ArtifactTag).where(ArtifactTag.artifact_id == artifact_id)).all()

    result: dict[str, list[str]] = {}
    for tag in tags:
        if tag.entity_type not in result:
            result[tag.entity_type] = []
        result[tag.entity_type].append(tag.entity_id)

    return result


def update_artifact_tags(
    session: Session,
    artifact_id: str,
    tags: dict[str, list[str]],
) -> dict[str, list[str]]:
    """Replace all tags for an artifact with new ones.

    Deletes existing tags and creates new ones based on the provided dict.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact
        tags: Dict with entity types as keys and lists of entity IDs as values

    Returns:
        Updated tags dict
    """
    # Delete all existing tags for this artifact
    session.exec(delete(ArtifactTag).where(ArtifactTag.artifact_id == artifact_id))
    session.commit()

    # Create new tags
    for entity_type, entity_ids in tags.items():
        for entity_id in entity_ids:
            create_artifact_tag(session, artifact_id, entity_type, entity_id)

    return get_artifact_tags(session, artifact_id)


def delete_artifact_tags(session: Session, artifact_id: str) -> None:
    """Delete all tags for an artifact.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact to delete tags for
    """
    session.exec(delete(ArtifactTag).where(ArtifactTag.artifact_id == artifact_id))
    session.commit()


def get_artifacts_by_entity(session: Session, entity_type: str, entity_id: str) -> list[str]:
    """Get all artifact IDs tagged with a specific entity.

    Args:
        session: SQLModel session
        entity_type: Type of entity ('character', 'episode', 'mythos')
        entity_id: ID of the entity

    Returns:
        List of artifact IDs
    """
    tags = session.exec(
        select(ArtifactTag).where(
            and_(
                ArtifactTag.entity_type == entity_type,
                ArtifactTag.entity_id == entity_id,
            )
        )
    ).all()

    return [tag.artifact_id for tag in tags]
