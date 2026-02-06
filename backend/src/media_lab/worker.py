"""Media processing worker runtime.

Executes queued jobs with support for dispatch to workflow-specific handlers,
progress tracking, and cancellation checkpoints.
"""

import asyncio
import contextlib
from abc import ABC, abstractmethod

from .executor import JobExecutor, JobStatus
from .queue import JobQueue, JobTask


class WorkflowDispatcher(ABC):
    """Base interface for workflow-specific handlers."""

    @abstractmethod
    async def execute(self, task: JobTask) -> dict[str, str]:
        """Execute workflow for given task.

        Args:
            task: JobTask with character_id, workflow_type, and parameters.

        Returns:
            Dictionary with workflow outputs (e.g., artifact_path, metadata).
        """
        pass


class EnhanceDispatcher(WorkflowDispatcher):
    """Handler for image enhancement/upscaling workflows."""

    async def execute(self, task: JobTask) -> dict[str, str]:
        """Execute enhancement workflow (stub).

        Args:
            task: JobTask with enhancement parameters.

        Returns:
            Dictionary with output artifact path.
        """
        await asyncio.sleep(0.1)
        return {
            "artifact_path": f"artifacts/{task.job_id}/enhanced.jpg",
            "metadata": "enhanced",
        }


class InterpolateDispatcher(WorkflowDispatcher):
    """Handler for frame interpolation workflows."""

    def __init__(self, executor: JobExecutor):
        """Initialize interpolation dispatcher with executor.

        Args:
            executor: JobExecutor instance for interpolation execution.
        """
        self.executor = executor

    async def execute(self, task: JobTask) -> dict[str, str]:
        """Execute interpolation workflow.

        Validates interpolation parameters and generates artifact metadata
        via executor.execute_interpolation().

        Args:
            task: JobTask with interpolation parameters (source_video_path,
                  source_fps, target_fps).

        Returns:
            Dictionary with artifact_path and metadata from executor.

        Raises:
            ValueError: If interpolation parameters are invalid.
        """
        return self.executor.execute_interpolation(task.job_id, task.parameters)


class GenerateDispatcher(WorkflowDispatcher):
    """Handler for generative workflows."""

    async def execute(self, task: JobTask) -> dict[str, str]:
        """Execute generation workflow (stub).

        Args:
            task: JobTask with generation parameters.

        Returns:
            Dictionary with output artifact path.
        """
        await asyncio.sleep(0.1)
        return {
            "artifact_path": f"artifacts/{task.job_id}/generated.jpg",
            "metadata": "generated",
        }


class BlendDispatcher(WorkflowDispatcher):
    """Handler for image blending workflows."""

    async def execute(self, task: JobTask) -> dict[str, str]:
        """Execute blending workflow (stub).

        Args:
            task: JobTask with blending parameters.

        Returns:
            Dictionary with output artifact path.
        """
        await asyncio.sleep(0.1)
        return {
            "artifact_path": f"artifacts/{task.job_id}/blended.jpg",
            "metadata": "blended",
        }


class MediaWorker:
    """Worker process for executing queued media jobs."""

    def __init__(self, queue: JobQueue, executor: JobExecutor):
        """Initialize worker with queue and executor.

        Args:
            queue: JobQueue instance.
            executor: JobExecutor instance.
        """
        self.queue = queue
        self.executor = executor
        self._running = False
        self.dispatchers = {
            "enhance": EnhanceDispatcher(),
            "interpolate": InterpolateDispatcher(executor),
            "generate": GenerateDispatcher(),
            "blend": BlendDispatcher(),
        }

    async def run_job(self, task: JobTask) -> bool:
        """Execute a single job with lifecycle management.

        Handles state transitions, progress tracking, and error recovery.

        Args:
            task: JobTask to execute.

        Returns:
            True if job succeeded, False if failed or cancelled.
        """
        job_id = task.job_id
        workflow_type = task.workflow_type

        self.executor.transition(job_id, JobStatus.RUNNING)
        self.queue.notify_status_change(job_id, JobStatus.RUNNING)

        dispatcher = self.dispatchers.get(workflow_type)
        if not dispatcher:
            self.executor.transition(job_id, JobStatus.FAILED)
            self.queue.notify_status_change(job_id, JobStatus.FAILED)
            return False

        try:
            await dispatcher.execute(task)

            if self.executor.is_cancellation_requested(job_id):
                self.executor.clear_cancellation_flag(job_id)
                self.executor.transition(job_id, JobStatus.CANCELLED)
                self.queue.notify_status_change(job_id, JobStatus.CANCELLED)
                return False

            self.executor.transition(job_id, JobStatus.SUCCEEDED)
            self.queue.notify_status_change(job_id, JobStatus.SUCCEEDED)
            return True

        except Exception:
            if task.retry_count < task.max_retries:
                task.retry_count += 1
                self.executor.reset_for_retry(job_id)
                self.queue.notify_status_change(job_id, JobStatus.QUEUED)
                self.queue.enqueue(
                    job_id,
                    task.character_id,
                    task.workflow_type,
                    task.parameters,
                )
                return False

            self.executor.transition(job_id, JobStatus.FAILED)
            self.queue.notify_status_change(job_id, JobStatus.FAILED)
            return False

    def process_one(self) -> bool:
        """Process single job from queue (synchronous).

        Returns:
            True if a job was processed, False if queue empty.
        """
        task = self.queue.dequeue()
        if not task:
            return False

        with contextlib.suppress(Exception):
            asyncio.run(self.run_job(task))

        self.queue.mark_complete(task.job_id)
        return True

    async def run(self, poll_interval: float = 1.0) -> None:
        """Run worker event loop.

        Continuously polls queue and executes jobs until stopped.

        Args:
            poll_interval: Seconds between queue polls.
        """
        self._running = True
        while self._running:
            task = self.queue.dequeue()
            if task:
                await self.run_job(task)
                self.queue.mark_complete(task.job_id)
            else:
                await asyncio.sleep(poll_interval)

    def stop(self) -> None:
        """Stop the worker event loop."""
        self._running = False
