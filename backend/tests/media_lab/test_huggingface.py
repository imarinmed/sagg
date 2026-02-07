"""Tests for HuggingFace Hub client."""

import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from src.media_lab.huggingface import HuggingFaceClient


class TestHuggingFaceClient:
    """Test HuggingFace client functionality."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return HuggingFaceClient()

    @patch("src.media_lab.huggingface.requests.get")
    def test_search_models_success(self, mock_get, client):
        """Test successful model search."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "id": "black-forest-labs/FLUX.1-dev",
                "description": "FLUX.1 dev model",
                "likes": 1000,
                "downloads": 5000,
                "tags": ["flux", "diffusion"],
                "private": False,
                "gated": False,
            },
            {
                "id": "stabilityai/stable-diffusion-3-medium",
                "description": "Stable Diffusion 3 Medium",
                "likes": 2000,
                "downloads": 10000,
                "tags": ["stable-diffusion", "text-to-image"],
                "private": False,
                "gated": False,
            },
        ]
        mock_get.return_value = mock_response

        # Search
        results = client.search_models("anime", filter="sdxl", limit=10)

        # Verify results
        assert len(results) == 2
        assert results[0]["id"] == "black-forest-labs/FLUX.1-dev"
        assert results[0]["likes"] == 1000
        assert results[1]["downloads"] == 10000

    @patch("src.media_lab.huggingface.requests.get")
    def test_search_models_caching(self, mock_get, client):
        """Test search result caching."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "id": "model-1",
                "description": "Test model",
                "likes": 100,
                "downloads": 500,
                "tags": [],
                "private": False,
                "gated": False,
            }
        ]
        mock_get.return_value = mock_response

        # First search - hits API
        results1 = client.search_models("test", filter="sdxl", limit=5)
        assert mock_get.call_count == 1

        # Second search - should use cache
        results2 = client.search_models("test", filter="sdxl", limit=5)
        assert mock_get.call_count == 1  # No additional call
        assert results1 == results2

        # Different query - should hit API
        results3 = client.search_models("other", filter="sdxl", limit=5)
        assert mock_get.call_count == 2

    @patch("src.media_lab.huggingface.requests.get")
    def test_search_models_api_error(self, mock_get, client):
        """Test search handles API errors gracefully."""
        # Mock API error (RequestException)
        import requests
        mock_get.side_effect = requests.RequestException("API Error")

        # Search should return empty list
        results = client.search_models("test", filter="sdxl", limit=5)
        assert results == []

    @patch("src.media_lab.huggingface.requests.get")
    def test_get_model_info_success(self, mock_get, client):
        """Test getting model info."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "runwayml/stable-diffusion-v1-5",
            "description": "Stable Diffusion v1.5",
            "likes": 5000,
            "downloads": 100000,
            "tags": ["stable-diffusion"],
            "private": False,
            "gated": False,
            "siblings": [
                {"rfilename": "model.safetensors"},
                {"rfilename": "config.json"},
            ],
        }
        mock_get.return_value = mock_response

        # Get info
        info = client.get_model_info("runwayml/stable-diffusion-v1-5")

        # Verify
        assert info is not None
        assert info["id"] == "runwayml/stable-diffusion-v1-5"
        assert info["likes"] == 5000
        assert len(info["files"]) == 2

    @patch("src.media_lab.huggingface.requests.get")
    def test_get_model_info_not_found(self, mock_get, client):
        """Test get_model_info handles 404."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        # Get info - should return None
        info = client.get_model_info("nonexistent/model")
        assert info is None

    @patch("src.media_lab.huggingface.requests.get")
    def test_download_model_success(self, mock_get, client, tmp_path):
        """Test successful model download."""
        # Mock download response with progress
        mock_response = MagicMock()
        mock_response.headers = {"content-length": "1000"}
        mock_response.iter_content.return_value = [b"x" * 500, b"x" * 500]
        mock_get.return_value = mock_response

        # Create temporary save path
        save_path = tmp_path / "model.safetensors"

        # Track progress callback
        progress_calls = []

        def progress_cb(current, total):
            progress_calls.append((current, total))

        # Download
        result = client.download_model(
            "runwayml/stable-diffusion-v1-5",
            "model.safetensors",
            save_path,
            progress_callback=progress_cb,
        )

        # Verify
        assert result == save_path
        assert save_path.exists()
        assert save_path.stat().st_size == 1000
        # Should have progress callback invocations
        assert len(progress_calls) == 2

    @patch("src.media_lab.huggingface.requests.get")
    def test_download_model_error_cleanup(self, mock_get, client, tmp_path):
        """Test download error cleans up partial files."""
        # Mock download error
        import requests
        mock_get.side_effect = requests.RequestException("Download failed")

        save_path = tmp_path / "model.safetensors"

        # Download should raise
        with pytest.raises(requests.RequestException):
            client.download_model(
                "runwayml/stable-diffusion-v1-5",
                "model.safetensors",
                save_path,
            )

        # File should not exist after error
        assert not save_path.exists()

    @patch("src.media_lab.huggingface.requests.get")
    def test_search_models_limit(self, mock_get, client):
        """Test search respects limit parameter."""
        # Mock API response with many results
        models = [
            {
                "id": f"model-{i}",
                "description": f"Model {i}",
                "likes": i * 100,
                "downloads": i * 1000,
                "tags": [],
                "private": False,
                "gated": False,
            }
            for i in range(20)
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = models
        mock_get.return_value = mock_response

        # Search with limit=5
        results = client.search_models("test", limit=5)

        # Should return only 5 results
        assert len(results) == 5
        assert results[0]["id"] == "model-0"
        assert results[4]["id"] == "model-4"
