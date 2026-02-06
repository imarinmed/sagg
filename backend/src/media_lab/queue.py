"""Job queue abstraction for media processing tasks.

Provides a simple in-memory queue for job management with FIFO ordering
and callback support for status updates.
"""

import contextlib
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any


@dataclass
class JobTask:
    """Represents a job task in the queue."""

    job_id: str
    character_id: str
    workflow_type: str
    parameters: dict[str, Any]
    created_at: datetime
    retry_count: int = 0
    max_retries: int = 3


class JobQueue:
    """Simple FIFO queue for media job processing."""

    def __init__(self):
        """Initialize empty queue."""
        self._queue: list[JobTask] = []
        self._running: dict[str, JobTask] = {}
        self._callbacks: list[Callable[[str, str], None]] = []

    def enqueue(
        self,
        job_id: str,
        character_id: str,
        workflow_type: str,
        parameters: dict[str, Any],
    ) -> JobTask:
        """Add job to queue.

        Args:
            job_id: Unique job identifier.
            character_id: Character being processed.
            workflow_type: Type of workflow (enhance, interpolate, generate, blend).
            parameters: Workflow-specific parameters.

        Returns:
            JobTask that was enqueued.
        """
        task = JobTask(
            job_id=job_id,
            character_id=character_id,
            workflow_type=workflow_type,
            parameters=parameters,
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        self._queue.append(task)
        return task

    def dequeue(self) -> JobTask | None:
        """Remove and return next job from queue.

        Returns:
            JobTask or None if queue is empty.
        """
        if not self._queue:
            return None
        task = self._queue.pop(0)
        self._running[task.job_id] = task
        return task

    def mark_running(self, job_id: str) -> None:
        """Mark job as currently executing.

        Args:
            job_id: Job identifier.
        """
        # Job already in _running when dequeued, but can be called explicitly
        pass

    def mark_complete(self, job_id: str) -> None:
        """Remove job from running set after completion.

        Args:
            job_id: Job identifier.
        """
        if job_id in self._running:
            del self._running[job_id]

    def is_running(self, job_id: str) -> bool:
        """Check if job is currently executing.

        Args:
            job_id: Job identifier.

        Returns:
            True if job is running, False otherwise.
        """
        return job_id in self._running

    def get_running(self, job_id: str) -> JobTask | None:
        """Get running job by ID.

        Args:
            job_id: Job identifier.

        Returns:
            JobTask if running, None otherwise.
        """
        return self._running.get(job_id)

    def size(self) -> int:
        """Get number of jobs pending in queue.

        Returns:
            Count of queued jobs.
        """
        return len(self._queue)

    def register_callback(self, callback: Callable[[str, str], None]) -> None:
        """Register callback for job status updates.

        Args:
            callback: Function with signature (job_id: str, status: str) -> None
        """
        self._callbacks.append(callback)

    def notify_status_change(self, job_id: str, status: str) -> None:
        """Notify all registered callbacks of status change.

        Args:
            job_id: Job identifier.
            status: New status (QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED).
        """
        for callback in self._callbacks:
            with contextlib.suppress(Exception):
                callback(job_id, status)
