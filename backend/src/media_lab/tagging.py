"""Image tagging system for media lab.

Manages tags that link images to entities (characters, episodes, mythos elements).
Stores tags in JSON for persistence.
"""

import json
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class ImageTag:
    """Represents a tag linking an image to an entity."""

    id: str
    image_path: str
    entity_type: str  # 'character', 'episode', 'mythos'
    entity_id: str
    created_at: str

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "ImageTag":
        """Create from dictionary."""
        return cls(**data)


class TagManager:
    """Manages image tags with JSON persistence."""

    def __init__(self, tags_file: Optional[Path] = None):
        """Initialize TagManager.

        Args:
            tags_file: Path to tags.json file. Defaults to data/tags.json
        """
        if tags_file is None:
            tags_file = Path(__file__).parent.parent.parent.parent / "data" / "tags.json"

        self.tags_file = Path(tags_file)
        self._tags: dict[str, ImageTag] = {}
        self._load_tags()

    def _load_tags(self) -> None:
        """Load tags from JSON file."""
        if self.tags_file.exists():
            try:
                with open(self.tags_file, "r") as f:
                    data = json.load(f)
                    self._tags = {tag_id: ImageTag.from_dict(tag) for tag_id, tag in data.items()}
            except (json.JSONDecodeError, KeyError):
                self._tags = {}
        else:
            self._tags = {}

    def _save_tags(self) -> None:
        """Save tags to JSON file."""
        self.tags_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.tags_file, "w") as f:
            data = {tag_id: tag.to_dict() for tag_id, tag in self._tags.items()}
            json.dump(data, f, indent=2)

    def add_tag(self, image_path: str, entity_type: str, entity_id: str) -> str:
        """Add a tag linking image to entity.

        Args:
            image_path: Path to image (relative to data/artifacts/)
            entity_type: Type of entity ('character', 'episode', 'mythos')
            entity_id: ID of the entity

        Returns:
            Tag ID
        """
        tag_id = str(uuid.uuid4())
        tag = ImageTag(
            id=tag_id,
            image_path=image_path,
            entity_type=entity_type,
            entity_id=entity_id,
            created_at=datetime.utcnow().isoformat(),
        )
        self._tags[tag_id] = tag
        self._save_tags()
        return tag_id

    def remove_tag(self, tag_id: str) -> bool:
        """Remove a tag by ID.

        Args:
            tag_id: ID of tag to remove

        Returns:
            True if tag was removed, False if not found
        """
        if tag_id in self._tags:
            del self._tags[tag_id]
            self._save_tags()
            return True
        return False

    def get_tags_for_image(self, image_path: str) -> list[ImageTag]:
        """Get all tags for a specific image.

        Args:
            image_path: Path to image

        Returns:
            List of ImageTag objects
        """
        return [tag for tag in self._tags.values() if tag.image_path == image_path]

    def get_images_for_entity(self, entity_type: str, entity_id: str) -> list[str]:
        """Get all images tagged with a specific entity.

        Args:
            entity_type: Type of entity ('character', 'episode', 'mythos')
            entity_id: ID of the entity

        Returns:
            List of unique image paths
        """
        image_paths = set()
        for tag in self._tags.values():
            if tag.entity_type == entity_type and tag.entity_id == entity_id:
                image_paths.add(tag.image_path)
        return sorted(list(image_paths))

    def get_all_tags(self) -> list[ImageTag]:
        """Get all tags.

        Returns:
            List of all ImageTag objects
        """
        return list(self._tags.values())

    def get_tag_by_id(self, tag_id: str) -> Optional[ImageTag]:
        """Get a tag by ID.

        Args:
            tag_id: ID of tag to retrieve

        Returns:
            ImageTag if found, None otherwise
        """
        return self._tags.get(tag_id)
