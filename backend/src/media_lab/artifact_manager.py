"""Artifact persistence and management.

Handles saving generated outputs to disk with metadata tracking
and retrieval of stored artifacts.
"""

import json
import logging
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)


class ArtifactManager:
    """Manages artifact persistence to disk with metadata."""

    def __init__(self, base_path: str = "data/artifacts"):
        """Initialize artifact manager.

        Args:
            base_path: Root directory for artifact storage.
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        logger.info("Artifact manager initialized at %s", self.base_path)

    def create_job_directory(self, job_id: str) -> Path:
        """Create job-specific artifact directory.

        Args:
            job_id: Unique job identifier.

        Returns:
            Path to job directory.
        """
        job_dir = self.base_path / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        logger.debug("Created artifact directory for job_id=%s", job_id)
        return job_dir

    def save_artifact(
        self,
        job_id: str,
        filename: str,
        data: bytes,
        metadata: Optional[dict[str, Any]] = None,
    ) -> str:
        """Save artifact to disk with optional metadata.

        Args:
            job_id: Unique job identifier.
            filename: Output filename (e.g., 'generated.png').
            data: Raw bytes to save.
            metadata: Optional metadata dict to save as JSON sidecar.

        Returns:
            Relative path to saved artifact from data directory.

        Raises:
            IOError: If file write fails.
        """
        job_dir = self.create_job_directory(job_id)
        artifact_path = job_dir / filename

        try:
            # Write artifact file
            artifact_path.write_bytes(data)
            logger.info(
                "Saved artifact for job_id=%s: %s (%d bytes)",
                job_id,
                filename,
                len(data),
            )

            # Save metadata sidecar if provided
            if metadata:
                metadata_path = job_dir / f"{filename}.metadata.json"
                metadata["filename"] = filename
                metadata["job_id"] = job_id
                with open(metadata_path, "w") as f:
                    json.dump(metadata, f, indent=2)
                logger.debug("Saved metadata for %s", filename)

            # Return relative path from data directory
            relative_path = str(artifact_path.relative_to(Path("data")))
            return relative_path

        except IOError as e:
            logger.error("Failed to save artifact for job_id=%s: %s", job_id, str(e))
            raise

    def get_artifact(self, job_id: str, filename: str) -> Optional[bytes]:
        """Retrieve artifact from disk.

        Args:
            job_id: Unique job identifier.
            filename: Artifact filename.

        Returns:
            Raw bytes if artifact exists, None otherwise.
        """
        artifact_path = self.base_path / job_id / filename

        if not artifact_path.exists():
            logger.warning("Artifact not found: %s", artifact_path)
            return None

        try:
            data = artifact_path.read_bytes()
            logger.debug("Retrieved artifact: %s (%d bytes)", artifact_path, len(data))
            return data
        except IOError as e:
            logger.error("Failed to read artifact %s: %s", artifact_path, str(e))
            return None

    def get_artifact_metadata(self, job_id: str, filename: str) -> Optional[dict[str, Any]]:
        """Retrieve metadata for artifact.

        Args:
            job_id: Unique job identifier.
            filename: Artifact filename.

        Returns:
            Metadata dict if sidecar exists, None otherwise.
        """
        metadata_path = self.base_path / job_id / f"{filename}.metadata.json"

        if not metadata_path.exists():
            return None

        try:
            with open(metadata_path) as f:
                return json.load(f)
        except (IOError, json.JSONDecodeError) as e:
            logger.error("Failed to read metadata for %s: %s", filename, str(e))
            return None

    def list_job_artifacts(self, job_id: str) -> list[str]:
        """List all artifacts for a job.

        Args:
            job_id: Unique job identifier.

        Returns:
            List of artifact filenames (excluding metadata sidecars).
        """
        job_dir = self.base_path / job_id

        if not job_dir.exists():
            return []

        artifacts = [
            f.name for f in job_dir.iterdir()
            if f.is_file() and not f.name.endswith(".metadata.json")
        ]
        return sorted(artifacts)

    def delete_job_artifacts(self, job_id: str) -> bool:
        """Delete all artifacts for a job.

        Args:
            job_id: Unique job identifier.

        Returns:
            True if deletion succeeded, False otherwise.
        """
        job_dir = self.base_path / job_id

        if not job_dir.exists():
            return True

        try:
            import shutil
            shutil.rmtree(job_dir)
            logger.info("Deleted artifacts for job_id=%s", job_id)
            return True
        except Exception as e:
            logger.error("Failed to delete artifacts for job_id=%s: %s", job_id, str(e))
            return False
