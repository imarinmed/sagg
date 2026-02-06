"""Job execution and lifecycle management.

Handles state transitions, validation rules, and cancellation checkpoints
for media processing jobs.
"""

from enum import Enum
from typing import Any


class JobStatus(str, Enum):
    """Valid job lifecycle states."""

    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class JobExecutor:
    """Manages job state transitions and execution lifecycle."""

    TERMINAL_STATES = {JobStatus.SUCCEEDED, JobStatus.FAILED, JobStatus.CANCELLED}

    ALLOWED_TRANSITIONS = {
        JobStatus.QUEUED: {JobStatus.RUNNING, JobStatus.CANCELLED},
        JobStatus.RUNNING: {JobStatus.SUCCEEDED, JobStatus.FAILED, JobStatus.CANCELLED},
        JobStatus.SUCCEEDED: set(),
        JobStatus.FAILED: set(),
        JobStatus.CANCELLED: set(),
    }

    def __init__(self):
        """Initialize executor."""
        self._job_states: dict[str, JobStatus] = {}
        self._cancellation_flags: set[str] = set()

    def create_job(self, job_id: str) -> None:
        """Initialize job in QUEUED state.

        Args:
            job_id: Unique job identifier.
        """
        self._job_states[job_id] = JobStatus.QUEUED

    def get_status(self, job_id: str) -> JobStatus | None:
        """Get current job status.

        Args:
            job_id: Unique job identifier.

        Returns:
            JobStatus or None if job not found.
        """
        return self._job_states.get(job_id)

    def transition(self, job_id: str, new_status: JobStatus) -> bool:
        """Attempt to transition job to new status.

        Validates transition rules per contract:
        - QUEUED -> RUNNING, CANCELLED
        - RUNNING -> SUCCEEDED, FAILED, CANCELLED
        - Terminal states: no transitions allowed

        Args:
            job_id: Unique job identifier.
            new_status: Target JobStatus.

        Returns:
            True if transition allowed, False otherwise.
        """
        current = self._job_states.get(job_id)
        if current is None:
            return False

        if new_status not in self.ALLOWED_TRANSITIONS.get(current, set()):
            return False

        self._job_states[job_id] = new_status
        return True

    def request_cancellation(self, job_id: str) -> bool:
        """Request cancellation of a job.

        Only valid if job is in QUEUED or RUNNING state.

        Args:
            job_id: Unique job identifier.

        Returns:
            True if cancellation request accepted, False otherwise.
        """
        current = self._job_states.get(job_id)
        if current not in (JobStatus.QUEUED, JobStatus.RUNNING):
            return False

        self._cancellation_flags.add(job_id)
        return self.transition(job_id, JobStatus.CANCELLED)

    def is_cancellation_requested(self, job_id: str) -> bool:
        """Check if cancellation has been requested.

        Used as checkpoint during execution to gracefully interrupt.

        Args:
            job_id: Unique job identifier.

        Returns:
            True if cancellation was requested, False otherwise.
        """
        return job_id in self._cancellation_flags

    def clear_cancellation_flag(self, job_id: str) -> None:
        """Clear cancellation flag after handling.

        Args:
            job_id: Unique job identifier.
        """
        self._cancellation_flags.discard(job_id)

    def is_terminal(self, job_id: str) -> bool:
        """Check if job is in a terminal state.

        Args:
            job_id: Unique job identifier.

        Returns:
            True if job is in SUCCEEDED, FAILED, or CANCELLED state.
        """
        current = self._job_states.get(job_id)
        return current in self.TERMINAL_STATES

    def can_retry(self, job_id: str) -> bool:
        """Check if job can be retried.

        Only FAILED jobs can be retried.

        Args:
            job_id: Unique job identifier.

        Returns:
            True if job can be retried, False otherwise.
        """
        current = self._job_states.get(job_id)
        return current == JobStatus.FAILED

    def reset_for_retry(self, job_id: str) -> bool:
        """Reset job state for retry after failure.

        Args:
            job_id: Unique job identifier.

        Returns:
            True if reset successful, False otherwise.
        """
        if not self.can_retry(job_id):
            return False

        self._job_states[job_id] = JobStatus.QUEUED
        self.clear_cancellation_flag(job_id)
        return True

    def execute_interpolation(self, job_id: str, parameters: dict[str, Any]) -> dict[str, Any]:
        """Execute frame interpolation workflow.

        Validates interpolation parameters and generates deterministic artifact
        metadata containing fps values.

        Args:
            job_id: Unique job identifier.
            parameters: Workflow parameters dict with keys:
                - source_video_path: str (path to source video)
                - source_fps: int (fps of source video)
                - target_fps: int (desired output fps)

        Returns:
            Dictionary with artifact_path and metadata dictionary.

        Raises:
            ValueError: If validation fails with structured error message.
        """
        # Parse parameters
        source_video_path = parameters.get("source_video_path")
        source_fps = parameters.get("source_fps")
        target_fps = parameters.get("target_fps")

        # Validate presence
        if not source_video_path:
            raise ValueError("Missing required parameter: source_video_path")
        if source_fps is None:
            raise ValueError("Missing required parameter: source_fps")
        if target_fps is None:
            raise ValueError("Missing required parameter: target_fps")

        # Validate types and ranges
        supported_fps_values = {24, 25, 30, 50, 60, 120, 240}

        try:
            source_fps_int = int(source_fps)
            target_fps_int = int(target_fps)
        except (ValueError, TypeError) as e:
            raise ValueError(
                f"Invalid fps values: source_fps and target_fps must be integers. "
                f"Got source_fps={source_fps} (type {type(source_fps).__name__}), "
                f"target_fps={target_fps} (type {type(target_fps).__name__})"
            ) from e

        if source_fps_int not in supported_fps_values:
            raise ValueError(
                f"Unsupported source_fps: {source_fps_int}. "
                f"Supported values: {sorted(supported_fps_values)}"
            )

        if target_fps_int not in supported_fps_values:
            raise ValueError(
                f"Unsupported target_fps: {target_fps_int}. "
                f"Supported values: {sorted(supported_fps_values)}"
            )

        if target_fps_int <= source_fps_int:
            raise ValueError(
                f"Invalid fps combination: target_fps ({target_fps_int}) must be "
                f"greater than source_fps ({source_fps_int})"
            )

        # Generate deterministic artifact metadata
        artifact_path = f"artifacts/{job_id}/interpolated.mp4"
        metadata = {
            "source_fps": source_fps_int,
            "target_fps": target_fps_int,
            "interpolation_factor": target_fps_int / source_fps_int,
            "source_video_path": source_video_path,
        }

        return {
            "artifact_path": artifact_path,
            "metadata": metadata,
        }

    def execute_enhance(self, job_id: str, parameters: dict[str, Any]) -> dict[str, Any]:
        """Execute image enhancement/upscaling workflow.

        Validates image format and generates deterministic artifact
        metadata containing enhancement parameters.

        Args:
            job_id: Unique job identifier.
            parameters: Workflow parameters dict with keys:
                - source_image_path: str (path to source image)
                - quality_preset: str (optional, one of 'low', 'medium', 'high')

        Returns:
            Dictionary with artifact_path and metadata dictionary.

        Raises:
            ValueError: If image format or parameters are invalid.
        """
        source_image_path = parameters.get("source_image_path")
        quality_preset = parameters.get("quality_preset", "medium")

        if not source_image_path:
            raise ValueError("Missing required parameter: source_image_path")

        supported_formats = {".jpg", ".jpeg", ".png", ".webp"}

        ext = None
        for fmt in supported_formats:
            if source_image_path.lower().endswith(fmt):
                ext = fmt
                break

        if not ext:
            raise ValueError(
                f"Unsupported image format in '{source_image_path}'. "
                f"Supported formats: {', '.join(sorted(supported_formats))}"
            )

        if quality_preset not in ("low", "medium", "high"):
            raise ValueError(
                f"Invalid quality_preset: {quality_preset}. Must be one of: low, medium, high"
            )

        artifact_path = f"artifacts/{job_id}/enhanced{ext}"
        metadata = {
            "source_image_path": source_image_path,
            "quality_preset": quality_preset,
            "operation": "enhance",
        }

        return {
            "artifact_path": artifact_path,
            "metadata": metadata,
        }
