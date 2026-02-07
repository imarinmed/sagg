"""Preset system for saving and loading pipeline configurations."""

import json
import logging
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class Preset:
    """Preset for storing pipeline configuration.
    
    Attributes:
        id: Unique preset identifier
        name: Human-readable preset name
        description: Optional description of preset
        config: PipelineConfig as dictionary (for JSON serialization)
        created_at: ISO format timestamp when preset was created
        updated_at: ISO format timestamp when preset was last updated
    """

    id: str
    name: str
    description: str
    config: dict[str, Any]
    created_at: str
    updated_at: str

    @classmethod
    def create(cls, name: str, description: str, config: dict[str, Any]) -> "Preset":
        """Factory method to create new preset with timestamps.
        
        Args:
            name: Preset name
            description: Preset description
            config: PipelineConfig as dictionary
            
        Returns:
            New Preset instance with generated ID and timestamps
        """
        now = datetime.now(UTC).isoformat()
        return cls(
            id=str(uuid4()),
            name=name,
            description=description,
            config=config,
            created_at=now,
            updated_at=now,
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert preset to dictionary for JSON serialization.

        Returns:
            Dictionary representation of preset
        """
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Preset":
        """Create preset from dictionary (e.g., loaded from JSON).

        Args:
            data: Dictionary with preset data

        Returns:
            Preset instance
        """
        return cls(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            config=data["config"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
        )


class PresetManager:
    """Manages preset persistence and retrieval.

    Stores presets as JSON files in data/presets/ directory.
    Each preset is stored as a separate JSON file named by preset ID.
    """

    def __init__(self, base_dir: Optional[Path] = None):
        """Initialize preset manager.

        Args:
            base_dir: Base directory for presets. Defaults to data/presets/
        """
        if base_dir is None:
            # Resolve relative to this file's location
            base_dir = Path(__file__).parent.parent.parent.parent / "data" / "presets"

        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        logger.debug(f"PresetManager initialized at {self.base_dir}")

    def save_preset(self, name: str, description: str, config: dict[str, Any]) -> Preset:
        """Save a new preset to disk.

        Args:
            name: Preset name
            description: Preset description
            config: PipelineConfig as dictionary

        Returns:
            Created Preset instance

        Raises:
            IOError: If preset cannot be written to disk
        """
        preset = Preset.create(name, description, config)
        preset_path = self.base_dir / f"{preset.id}.json"

        try:
            with open(preset_path, "w") as f:
                json.dump(preset.to_dict(), f, indent=2)
            logger.info(f"Saved preset {preset.id}: {name}")
        except Exception as e:
            logger.error(f"Failed to save preset {preset.id}: {e}")
            raise IOError(f"Failed to save preset: {e}") from e

        return preset

    def load_preset(self, preset_id: str) -> Preset:
        """Load a preset from disk.

        Args:
            preset_id: ID of preset to load

        Returns:
            Loaded Preset instance

        Raises:
            FileNotFoundError: If preset doesn't exist
            IOError: If preset cannot be read from disk
        """
        preset_path = self.base_dir / f"{preset_id}.json"

        if not preset_path.exists():
            raise FileNotFoundError(f"Preset {preset_id} not found")

        try:
            with open(preset_path, "r") as f:
                data = json.load(f)
            preset = Preset.from_dict(data)
            logger.debug(f"Loaded preset {preset_id}")
            return preset
        except Exception as e:
            logger.error(f"Failed to load preset {preset_id}: {e}")
            raise IOError(f"Failed to load preset: {e}") from e

    def list_presets(self) -> list[Preset]:
        """List all presets.

        Returns:
            List of all Preset instances, sorted by created_at descending

        Raises:
            IOError: If presets cannot be listed
        """
        try:
            presets = []
            for preset_file in sorted(self.base_dir.glob("*.json")):
                try:
                    with open(preset_file, "r") as f:
                        data = json.load(f)
                    presets.append(Preset.from_dict(data))
                except Exception as e:
                    logger.warning(f"Failed to load preset {preset_file}: {e}")
                    continue

            # Sort by created_at descending (newest first)
            presets.sort(key=lambda p: p.created_at, reverse=True)
            logger.debug(f"Listed {len(presets)} presets")
            return presets
        except Exception as e:
            logger.error(f"Failed to list presets: {e}")
            raise IOError(f"Failed to list presets: {e}") from e

    def delete_preset(self, preset_id: str) -> bool:
        """Delete a preset from disk.

        Args:
            preset_id: ID of preset to delete

        Returns:
            True if preset was deleted, False if it didn't exist

        Raises:
            IOError: If preset cannot be deleted
        """
        preset_path = self.base_dir / f"{preset_id}.json"

        if not preset_path.exists():
            logger.warning(f"Preset {preset_id} does not exist")
            return False

        try:
            preset_path.unlink()
            logger.info(f"Deleted preset {preset_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete preset {preset_id}: {e}")
            raise IOError(f"Failed to delete preset: {e}") from e


# Global preset manager instance
_preset_manager: Optional[PresetManager] = None


def get_preset_manager() -> PresetManager:
    """Get singleton PresetManager instance.

    Returns:
        Global PresetManager instance
    """
    global _preset_manager
    if _preset_manager is None:
        _preset_manager = PresetManager()
    return _preset_manager
