# backend/tests/media_lab/test_basic.py
from src.media_lab.executor import JobExecutor


def test_executor_init():
    # Verify we can import and instantiate the executor
    executor = JobExecutor()
    assert executor.states["QUEUED"] == "QUEUED"
    assert executor.states["RUNNING"] == "RUNNING"


def test_execute_enhance_structure():
    # Verify the structure of execute_enhance method
    executor = JobExecutor()
    result = executor.execute_enhance(
        "test_job_123", {"source_image_path": "test.png", "quality_preset": "medium"}
    )

    assert "artifact_path" in result
    assert result["artifact_path"] == "artifacts/test_job_123/enhanced.png"
    assert "metadata" in result
    assert result["metadata"]["quality_preset"] == "medium"
