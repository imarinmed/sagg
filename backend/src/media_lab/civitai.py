"""CivitAI API client for downloading models and LoRAs."""

import json
import time
import hashlib
from collections.abc import Callable
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class CivitAIClient:
    """Client for interacting with CivitAI API."""

    BASE_URL = "https://civitai.com/api/v1/"
    REQUEST_TIMEOUT = 30
    MAX_RETRIES = 3

    def __init__(self):
        """Initialize CivitAI client with session and cache."""
        self._session = self._create_session()
        self._cache = {}
        self._cache_duration = 3600  # 1 hour in seconds
        self._rate_limit_wait = 0

    def _create_session(self) -> requests.Session:
        """Create requests session with retry strategy."""
        session = requests.Session()
        retry_strategy = Retry(
            total=self.MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    def _check_rate_limit(self):
        """Check and handle rate limiting with exponential backoff."""
        if self._rate_limit_wait > 0:
            wait_time = min(self._rate_limit_wait, 60)  # Max 60 second wait
            time.sleep(wait_time)
            self._rate_limit_wait = 0

    def _make_request(self, endpoint: str, params: dict | None = None) -> dict:
        """Make API request with rate limit handling."""
        self._check_rate_limit()

        url = urljoin(self.BASE_URL, endpoint)
        try:
            response = self._session.get(
                url, params=params, timeout=self.REQUEST_TIMEOUT
            )

            # Handle rate limiting
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "60")
                self._rate_limit_wait = float(retry_after)
                raise requests.exceptions.HTTPError(
                    "Rate limited by CivitAI API (429)"
                )

            response.raise_for_status()
            return response.json()

        except requests.exceptions.HTTPError as e:
            if "Rate limited" in str(e):
                raise requests.exceptions.RetryError(str(e)) from e
            raise requests.exceptions.RequestException(
                f"CivitAI API request failed: {str(e)}"
            ) from e
        except requests.exceptions.RequestException as e:
            raise requests.exceptions.RequestException(
                f"CivitAI API request failed: {str(e)}"
            ) from e

    def _get_cache_key(self, endpoint: str, params: Optional[dict] = None) -> str:
        """Generate cache key from endpoint and params."""
        key_str = f"{endpoint}:{json.dumps(params or {}, sort_keys=True)}"
        return hashlib.md5(key_str.encode()).hexdigest()

    def _get_cached(self, cache_key: str) -> dict | None:
        """Get cached value if not expired."""
        if cache_key in self._cache:
            data, timestamp = self._cache[cache_key]
            if datetime.now() - timestamp < timedelta(seconds=self._cache_duration):
                return data
            else:
                del self._cache[cache_key]
        return None

    def _set_cache(self, cache_key: str, data: dict):
        """Store data in cache with timestamp."""
        self._cache[cache_key] = (data, datetime.now())

    def search_models(
        self,
        query: str,
        model_type: str = "LORA",
        nsfw: bool = False,
        limit: int = 10,
    ) -> list[dict]:
        """Search for models on CivitAI.

        Args:
            query: Search query string
            model_type: Model type (LORA, Checkpoint, etc.)
            nsfw: Include NSFW models
            limit: Maximum results to return

        Returns:
            List of model metadata dicts
        """
        cache_key = self._get_cache_key(
            "models",
            {"query": query, "type": model_type, "nsfw": nsfw, "limit": limit},
        )

        # Check cache first
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached.get("items", [])

        params = {
            "query": query,
            "type": model_type,
            "nsfw": "true" if nsfw else "false",
            "limit": limit,
        }

        data = self._make_request("models", params=params)
        self._set_cache(cache_key, data)

        return data.get("items", [])

    def get_model_version(self, version_id: str) -> dict:
        """Get details for a specific model version.

        Args:
            version_id: Model version ID from CivitAI

        Returns:
            Model version metadata
        """
        cache_key = self._get_cache_key(f"model-versions/{version_id}")

        # Check cache first
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        data = self._make_request(f"model-versions/{version_id}")
        self._set_cache(cache_key, data)

        return data

    def download_model(
        self,
        download_url: str,
        save_path: Path,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Path:
        """Download model file from URL with progress tracking.

        Args:
            download_url: Direct download URL for the model
            save_path: Path to save the model file
            progress_callback: Optional callback(current_bytes, total_bytes)

        Returns:
            Path to downloaded file
        """
        save_path.parent.mkdir(parents=True, exist_ok=True)

        self._check_rate_limit()

        response = self._session.get(download_url, stream=True, timeout=self.REQUEST_TIMEOUT)
        response.raise_for_status()

        total_size = int(response.headers.get("content-length", 0))
        downloaded = 0

        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if progress_callback:
                        progress_callback(downloaded, total_size)

        return save_path

    def clear_cache(self):
        """Clear all cached data."""
        self._cache.clear()


# Global client instance
_civitai_client = None


def get_civitai_client() -> CivitAIClient:
    """Get or create global CivitAI client."""
    global _civitai_client
    if _civitai_client is None:
        _civitai_client = CivitAIClient()
    return _civitai_client
