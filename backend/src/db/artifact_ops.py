"""Database operations for artifact tagging.

Provides CRUD operations for artifact tags using SQLModel session.
"""

from datetime import datetime, timezone
from uuid import uuid4
import json

from sqlalchemy import and_
from sqlmodel import Session, delete, select

from .db_models import ArtifactTag, MediaArtifact


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


def create_artifact(
    session: Session,
    job_id: str,
    artifact_type: str,
    file_path: str,
    file_size_bytes: int | None = None,
    metadata_json: str | dict | None = None,
) -> MediaArtifact:
    """Create a new artifact in the database.

    Args:
        session: SQLModel session
        job_id: ID of the job that created this artifact
        artifact_type: Type of artifact (image, video, etc.)
        file_path: Relative path to artifact file
        file_size_bytes: Optional file size in bytes
        metadata_json: Optional JSON metadata (dict or JSON string)

    Returns:
        Created MediaArtifact model
    """
    # Convert dict to JSON string if needed
    if isinstance(metadata_json, dict):
        metadata_json = json.dumps(metadata_json)
    
    artifact = MediaArtifact(
        id=str(uuid4()),
        job_id=job_id,
        artifact_type=artifact_type,
        file_path=file_path,
        file_size_bytes=file_size_bytes,
        metadata_json=metadata_json,
        created_at=datetime.now(UTC).replace(tzinfo=None),
    )
    session.add(artifact)
    session.commit()
    session.refresh(artifact)
    return artifact


def get_artifact(session: Session, artifact_id: str) -> MediaArtifact | None:
    """Get an artifact by ID.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact

    Returns:
        MediaArtifact model or None if not found
    """
    return session.exec(
        select(MediaArtifact).where(MediaArtifact.id == artifact_id)
    ).first()


def get_artifacts_by_job(session: Session, job_id: str) -> list[MediaArtifact]:
    """Get all artifacts for a job.

    Args:
        session: SQLModel session
        job_id: ID of the job

    Returns:
        List of MediaArtifact models
    """
    return session.exec(
        select(MediaArtifact).where(MediaArtifact.job_id == job_id)
    ).all()


def update_artifact(
    session: Session,
    artifact_id: str,
    artifact_type: str | None = None,
    file_size_bytes: int | None = None,
    metadata_json: str | None = None,
) -> MediaArtifact | None:
    """Update artifact metadata.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact to update
        artifact_type: Optional new artifact type
        file_size_bytes: Optional new file size
        metadata_json: Optional new metadata

    Returns:
        Updated MediaArtifact model or None if not found
    """
    artifact = get_artifact(session, artifact_id)
    if not artifact:
        return None

    if artifact_type is not None:
        artifact.artifact_type = artifact_type
    if file_size_bytes is not None:
        artifact.file_size_bytes = file_size_bytes
    if metadata_json is not None:
        artifact.metadata_json = metadata_json

    session.add(artifact)
    session.commit()
    session.refresh(artifact)
    return artifact


def delete_artifact(session: Session, artifact_id: str) -> bool:
    """Delete an artifact and its tags.

    Args:
        session: SQLModel session
        artifact_id: ID of the artifact to delete

    Returns:
        True if deleted, False if not found
    """
    artifact = get_artifact(session, artifact_id)
    if not artifact:
        return False

    # Delete associated tags
    delete_artifact_tags(session, artifact_id)

    # Delete the artifact
    session.delete(artifact)
    session.commit()
    return True
