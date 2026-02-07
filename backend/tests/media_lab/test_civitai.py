"""Tests for CivitAI API client."""

import json
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

import pytest
import requests

from src.media_lab.civitai import CivitAIClient, get_civitai_client


@pytest.fixture
def civitai_client():
    """Create a CivitAI client for testing."""
    client = CivitAIClient()
    client.clear_cache()
    return client


@pytest.fixture
def mock_search_response():
    """Mock response for search_models."""
    return {
        "items": [
            {
                "id": 1,
                "name": "Test LoRA Model",
                "type": "LORA",
                "description": "A test model",
                "stats": {"downloadCount": 100},
                "modelVersions": [
                    {
                        "id": 100,
                        "name": "v1.0",
                        "downloadUrl": "https://civitai.com/download/model/100",
                    }
                ],
            }
        ]
    }


@pytest.fixture
def mock_version_response():
    """Mock response for get_model_version."""
    return {
        "id": 100,
        "name": "v1.0",
        "description": "Model version 1",
        "downloadUrl": "https://civitai.com/download/model/100",
        "files": [{"name": "model.safetensors", "size": 1024000, "type": "model"}],
    }


class TestCivitAIClient:
    """Test suite for CivitAIClient."""

    def test_client_initialization(self, civitai_client):
        """Test client initializes correctly."""
        assert civitai_client is not None
        assert civitai_client._cache == {}
        assert civitai_client._rate_limit_wait == 0

    def test_search_models_success(self, civitai_client, mock_search_response):
        """Test successful model search."""
        with patch.object(civitai_client, "_make_request", return_value=mock_search_response):
            results = civitai_client.search_models("test", model_type="LORA")

            assert len(results) == 1
            assert results[0]["name"] == "Test LoRA Model"
            assert results[0]["type"] == "LORA"

    def test_search_models_with_nsfw(self, civitai_client, mock_search_response):
        """Test search with NSFW filter."""
        with patch.object(civitai_client, "_make_request") as mock_request:
            mock_request.return_value = mock_search_response
            civitai_client.search_models("test", nsfw=True)

            # Verify correct params were passed
            call_args = mock_request.call_args
            assert call_args[1]["params"]["nsfw"] == "true"

    def test_search_models_caching(self, civitai_client, mock_search_response):
        """Test that search results are cached."""
        with patch.object(
            civitai_client, "_make_request", return_value=mock_search_response
        ) as mock_request:
            # First call
            civitai_client.search_models("test")
            assert mock_request.call_count == 1

            # Second call (should use cache)
            civitai_client.search_models("test")
            assert mock_request.call_count == 1  # No additional call

            # Different params (should not use cache)
            civitai_client.search_models("test", model_type="Checkpoint")
            assert mock_request.call_count == 2

    def test_get_model_version(self, civitai_client, mock_version_response):
        """Test retrieving model version details."""
        with patch.object(civitai_client, "_make_request", return_value=mock_version_response):
            result = civitai_client.get_model_version("100")

            assert result["id"] == 100
            assert result["name"] == "v1.0"
            assert result["downloadUrl"] == "https://civitai.com/download/model/100"

    def test_get_model_version_caching(self, civitai_client, mock_version_response):
        """Test that version details are cached."""
        with patch.object(
            civitai_client, "_make_request", return_value=mock_version_response
        ) as mock_request:
            # First call
            civitai_client.get_model_version("100")
            assert mock_request.call_count == 1

            # Second call (should use cache)
            civitai_client.get_model_version("100")
            assert mock_request.call_count == 1

            # Different ID (should not use cache)
            civitai_client.get_model_version("101")
            assert mock_request.call_count == 2

    def test_download_model(self, civitai_client, tmp_path):
        """Test model downloading with progress tracking."""
        test_file = tmp_path / "test_model.safetensors"
        test_content = b"test model content" * 100

        # Mock the session.get to return streaming response
        mock_response = MagicMock()
        mock_response.headers = {"content-length": str(len(test_content))}
        mock_response.iter_content = Mock(
            return_value=[test_content[i : i + 100] for i in range(0, len(test_content), 100)]
        )

        with patch.object(civitai_client._session, "get", return_value=mock_response):
            progress_calls = []

            def progress_callback(current, total):
                progress_calls.append((current, total))

            result = civitai_client.download_model(
                "https://example.com/model.safetensors",
                test_file,
                progress_callback=progress_callback,
            )

            # Verify file was created
            assert result == test_file
            assert test_file.exists()

            # Verify progress callback was called
            assert len(progress_calls) > 0
            # Final call should have total size
            assert progress_calls[-1][1] == len(test_content)

    def test_download_model_without_progress(self, civitai_client, tmp_path):
        """Test downloading without progress callback."""
        test_file = tmp_path / "test_model.safetensors"

        mock_response = MagicMock()
        mock_response.headers = {"content-length": "1000"}
        mock_response.iter_content = Mock(return_value=[b"test"])

        with patch.object(civitai_client._session, "get", return_value=mock_response):
            result = civitai_client.download_model(
                "https://example.com/model.safetensors", test_file
            )

            assert result == test_file

    def test_rate_limit_handling(self, civitai_client):
        """Test handling of rate limit responses."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.headers = {"Retry-After": "2"}

        with patch.object(civitai_client._session, "get", return_value=mock_response):
            with pytest.raises(requests.exceptions.RetryError):
                civitai_client._make_request("models")

            # Verify rate limit wait was set
            assert civitai_client._rate_limit_wait == 2.0

    def test_cache_expiration(self, civitai_client, mock_search_response):
        """Test that cache expires after duration."""
        with patch.object(
            civitai_client, "_make_request", return_value=mock_search_response
        ) as mock_request:
            # Set short cache duration
            civitai_client._cache_duration = 1

            # First call
            civitai_client.search_models("test")
            assert mock_request.call_count == 1

            # Second call (within cache duration)
            civitai_client.search_models("test")
            assert mock_request.call_count == 1

            # Wait for cache to expire
            import time

            time.sleep(1.1)

            # Third call (cache expired)
            civitai_client.search_models("test")
            assert mock_request.call_count == 2

    def test_clear_cache(self, civitai_client, mock_search_response):
        """Test clearing cache."""
        with patch.object(civitai_client, "_make_request", return_value=mock_search_response):
            civitai_client.search_models("test")
            assert len(civitai_client._cache) > 0

            civitai_client.clear_cache()
            assert len(civitai_client._cache) == 0

    def test_get_civitai_client_singleton(self):
        """Test that get_civitai_client returns singleton."""
        # Import fresh to test singleton
        import src.media_lab.civitai as civitai_module

        # Reset global
        civitai_module._civitai_client = None

        client1 = civitai_module.get_civitai_client()
        client2 = civitai_module.get_civitai_client()

        assert client1 is client2
