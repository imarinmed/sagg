"""HuggingFace Hub client for model search and download."""

import os
import time
from collections.abc import Callable
from pathlib import Path

import requests

HF_TOKEN = os.environ.get("HF_TOKEN")
HF_API_BASE = "https://huggingface.co/api"
HF_CACHE_DURATION = 3600  # 1 hour cache for search results


class HuggingFaceClient:
    """Client for interacting with HuggingFace Hub."""

    def __init__(self):
        """Initialize HuggingFace client."""
        self.token = HF_TOKEN
        self.headers = {"User-Agent": "blod-wiki/0.1.0"}
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

        # Cache for search results: {query+filter: (timestamp, results)}
        self._search_cache: dict = {}

    def search_models(
        self,
        query: str,
        filter: str = "sdxl",
        limit: int = 10,
    ) -> list[dict]:
        """Search for models on HuggingFace Hub.

        Args:
            query: Search query string (e.g., "anime", "portrait")
            filter: Filter string (e.g., "sdxl", "checkpoint"). Default "sdxl"
            limit: Max results to return (default 10)

        Returns:
            List of model metadata dicts with keys: id, name, description, likes, downloads
        """
        cache_key = f"{query}:{filter}"

        # Check cache
        if cache_key in self._search_cache:
            timestamp, results = self._search_cache[cache_key]
            if time.time() - timestamp < HF_CACHE_DURATION:
                return results[:limit]

        try:
            # Build search params
            params = {
                "q": query,
                "limit": min(limit * 2, 100),  # Fetch extra in case filtering
            }

            # Add filter if specified
            if filter:
                params["filter"] = filter

            # Call HF API
            url = f"{HF_API_BASE}/models"
            response = requests.get(url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()

            models = response.json()

            # Extract relevant fields
            results = []
            for model in models:
                results.append(
                    {
                        "id": model.get("id"),
                        "name": model.get("id"),  # HF uses id as display name
                        "description": model.get("description", ""),
                        "likes": model.get("likes", 0),
                        "downloads": model.get("downloads", 0),
                        "tags": model.get("tags", []),
                        "private": model.get("private", False),
                        "gated": model.get("gated", False),
                    }
                )

            # Cache results
            self._search_cache[cache_key] = (time.time(), results)

            return results[:limit]

        except requests.exceptions.RequestException:
            # Fallback to empty results on API error
            return []

    def get_model_info(self, repo_id: str) -> dict | None:
        """Get metadata for a specific model.

        Args:
            repo_id: Model repository ID (e.g., "runwayml/stable-diffusion-v1-5")

        Returns:
            Dict with model metadata or None if not found
        """
        try:
            url = f"{HF_API_BASE}/models/{repo_id}"
            response = requests.get(url, headers=self.headers, timeout=10)

            if response.status_code == 404:
                return None

            response.raise_for_status()
            model = response.json()

            return {
                "id": model.get("id"),
                "description": model.get("description", ""),
                "likes": model.get("likes", 0),
                "downloads": model.get("downloads", 0),
                "tags": model.get("tags", []),
                "private": model.get("private", False),
                "gated": model.get("gated", False),
                "files": model.get("siblings", []),  # List of files in repo
            }

        except requests.exceptions.RequestException:
            return None

    def download_model(
        self,
        repo_id: str,
        filename: str,
        save_path: Path,
        progress_callback: Callable[[int, int], None] | None = None,
    ) -> Path:
        """Download a model file from HuggingFace Hub.

        Args:
            repo_id: Model repository ID
            filename: Filename to download (e.g., "model.safetensors")
            save_path: Path to save the file to
            progress_callback: Optional callback(current_bytes, total_bytes) for progress

        Returns:
            Path to downloaded file

        Raises:
            requests.exceptions.RequestException: On download error
        """
        # Ensure parent directory exists
        save_path.parent.mkdir(parents=True, exist_ok=True)

        # Build download URL
        url = f"https://huggingface.co/{repo_id}/resolve/main/{filename}"

        try:
            # Stream download to track progress
            response = requests.get(url, headers=self.headers, stream=True, timeout=30)
            response.raise_for_status()

            total_size = int(response.headers.get("content-length", 0))
            downloaded = 0

            # Write file with progress tracking
            with open(save_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)

                        if progress_callback and total_size > 0:
                            progress_callback(downloaded, total_size)

            return save_path

        except requests.exceptions.RequestException:
            # Clean up partial file on error
            if save_path.exists():
                save_path.unlink()
            raise


def get_huggingface_client() -> HuggingFaceClient:
    """Get or create singleton HuggingFace client."""
    if not hasattr(get_huggingface_client, "_instance"):
        get_huggingface_client._instance = HuggingFaceClient()
    return get_huggingface_client._instance
