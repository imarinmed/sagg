"""
Tests for LoRA Manager.

Tests cover loading, unloading, applying multiple LoRAs, and tracking.
Uses mock objects to avoid requiring actual GPU/diffusers library.
"""

import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import tempfile
import hashlib

from src.media_lab.lora import LoRAManager, LoRAConfig, calculate_hash


class TestLoRAConfig:
    """Test LoRA configuration class."""

    def test_lora_config_initialization(self):
        """Test basic LoRA config creation."""
        config = LoRAConfig("/path/to/lora.safetensors")
        assert config.lora_path == Path("/path/to/lora.safetensors")
        assert config.adapter_name == "lora"
        assert config.weight == 1.0

    def test_lora_config_with_custom_name_and_weight(self):
        """Test LoRA config with custom name and weight."""
        config = LoRAConfig(
            "/path/to/lora.safetensors",
            adapter_name="my_lora",
            weight=0.5,
        )
        assert config.adapter_name == "my_lora"
        assert config.weight == 0.5

    def test_lora_config_repr(self):
        """Test LoRA config string representation."""
        config = LoRAConfig("/path/to/lora.safetensors", adapter_name="test")
        assert "test" in repr(config)
        assert "1.0" in repr(config)


class TestLoRAManagerInitialization:
    """Test LoRA manager initialization."""

    def test_initialization(self):
        """Test manager initializes with empty state."""
        manager = LoRAManager()
        assert manager.get_loaded_loras() == {}
        assert not manager.has_lora("test")


class TestLoRAManagerLoadLora:
    """Test loading single LoRA adapters."""

    def test_load_lora_success(self):
        """Test successfully loading a LoRA."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()

            manager.load_lora(model, tmp.name, adapter_name="test", weight=0.8)

            assert manager.has_lora("test")
            assert model.load_lora_weights.called
            loaded = manager.get_loaded_loras()
            assert loaded["test"]["weight"] == 0.8
            assert loaded["test"]["fused"] is False

    def test_load_lora_file_not_found(self):
        """Test loading from non-existent file raises error."""
        manager = LoRAManager()
        model = Mock()

        with pytest.raises(FileNotFoundError):
            manager.load_lora(model, "/nonexistent/path.safetensors")

    def test_load_lora_model_no_support(self):
        """Test loading on model without LoRA support raises error."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock(spec=[])  # No load_lora_weights method

            with pytest.raises(ValueError, match="does not support LoRA"):
                manager.load_lora(model, tmp.name)

    def test_load_lora_model_error(self):
        """Test handling of model loading errors."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock(side_effect=Exception("Test error"))

            with pytest.raises(RuntimeError, match="Failed to load LoRA"):
                manager.load_lora(model, tmp.name)

    def test_load_lora_default_adapter_name(self):
        """Test adapter name defaults to filename stem."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp:
            try:
                manager = LoRAManager()
                model = Mock()
                model.load_lora_weights = Mock()

                manager.load_lora(model, tmp.name)

                stem = Path(tmp.name).stem
                assert manager.has_lora(stem)
            finally:
                Path(tmp.name).unlink()


class TestLoRAManagerUnloadLoras:
    """Test unloading LoRA adapters."""

    def test_unload_loras_success(self):
        """Test successfully unloading LoRAs."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()
            model.unfuse_lora = Mock()
            model.unload_lora_weights = Mock()

            # Load first
            manager.load_lora(model, tmp.name, adapter_name="test")
            assert manager.has_lora("test")

            # Unload
            manager.unload_loras(model)

            assert not manager.has_lora("test")
            assert model.unfuse_lora.called
            assert model.unload_lora_weights.called

    def test_unload_loras_partial_support(self):
        """Test unloading with model that only supports unfuse."""
        manager = LoRAManager()
        model = Mock(spec=["unfuse_lora"])
        model.unfuse_lora = Mock()

        manager._loaded_loras["test"] = {"path": "test.safetensors", "weight": 1.0}

        manager.unload_loras(model)

        assert not manager.has_lora("test")
        assert model.unfuse_lora.called

    def test_unload_loras_error(self):
        """Test handling of unload errors."""
        manager = LoRAManager()
        model = Mock()
        model.unfuse_lora = Mock(side_effect=Exception("Test error"))
        model.unload_lora_weights = Mock()

        manager._loaded_loras["test"] = {"path": "test.safetensors", "weight": 1.0}

        with pytest.raises(RuntimeError, match="Failed to unload"):
            manager.unload_loras(model)


class TestLoRAManagerApplyLoras:
    """Test applying multiple LoRA adapters."""

    def test_apply_single_lora(self):
        """Test applying a single LoRA."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()
            model.unfuse_lora = Mock()
            model.unload_lora_weights = Mock()

            config = LoRAConfig(tmp.name, adapter_name="test", weight=0.8)
            manager.apply_loras(model, [config])

            assert manager.has_lora("test")
            assert model.load_lora_weights.called

    def test_apply_multiple_loras(self):
        """Test applying multiple LoRAs with different weights."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp1:
            with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp2:
                manager = LoRAManager()
                model = Mock()
                model.load_lora_weights = Mock()
                model.unfuse_lora = Mock()
                model.unload_lora_weights = Mock()
                model.set_adapters = Mock()

                configs = [
                    LoRAConfig(tmp1.name, adapter_name="lora1", weight=0.6),
                    LoRAConfig(tmp2.name, adapter_name="lora2", weight=0.4),
                ]
                manager.apply_loras(model, configs)

                assert manager.has_lora("lora1")
                assert manager.has_lora("lora2")
                assert model.set_adapters.called

    def test_apply_loras_with_fuse(self):
        """Test applying LoRAs with fusion."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()
            model.unfuse_lora = Mock()
            model.unload_lora_weights = Mock()
            model.fuse_lora = Mock()

            config = LoRAConfig(tmp.name, adapter_name="test")
            manager.apply_loras(model, [config], fuse=True)

            assert model.fuse_lora.called
            assert manager.get_loaded_loras()["test"]["fused"] is True

    def test_apply_loras_empty_list(self):
        """Test applying empty LoRA list raises error."""
        manager = LoRAManager()
        model = Mock()

        with pytest.raises(ValueError, match="cannot be empty"):
            manager.apply_loras(model, [])

    def test_apply_loras_clears_previous(self):
        """Test applying new LoRAs clears previous ones."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp1:
            with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp2:
                manager = LoRAManager()
                model = Mock()
                model.load_lora_weights = Mock()
                model.unfuse_lora = Mock()
                model.unload_lora_weights = Mock()

                # Load first set
                config1 = LoRAConfig(tmp1.name, adapter_name="old")
                manager.apply_loras(model, [config1])
                assert manager.has_lora("old")

                # Load second set - should clear first
                config2 = LoRAConfig(tmp2.name, adapter_name="new")
                manager.apply_loras(model, [config2])
                assert not manager.has_lora("old")
                assert manager.has_lora("new")

    def test_apply_loras_fuse_not_supported(self):
        """Test fusing when model doesn't support it (logs warning)."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock(spec=["load_lora_weights"])
            model.load_lora_weights = Mock()
            model.unfuse_lora = Mock()

            config = LoRAConfig(tmp.name)
            # Should not raise, just log warning
            manager.apply_loras(model, [config], fuse=True)
            assert manager.has_lora(Path(tmp.name).stem)


class TestLoRAManagerTracking:
    """Test LoRA tracking functionality."""

    def test_get_loaded_loras(self):
        """Test retrieving loaded LoRA information."""
        manager = LoRAManager()

        manager._loaded_loras = {
            "lora1": {"path": "path1.safetensors", "weight": 0.6, "fused": False},
            "lora2": {"path": "path2.safetensors", "weight": 0.4, "fused": True},
        }

        loaded = manager.get_loaded_loras()
        assert len(loaded) == 2
        assert loaded["lora1"]["weight"] == 0.6
        assert loaded["lora2"]["fused"] is True

    def test_has_lora(self):
        """Test checking if LoRA is loaded."""
        manager = LoRAManager()
        manager._loaded_loras["test"] = {"path": "test.safetensors", "weight": 1.0}

        assert manager.has_lora("test")
        assert not manager.has_lora("nonexistent")

    def test_clear(self):
        """Test clearing all LoRA tracking."""
        manager = LoRAManager()
        manager._loaded_loras["test"] = {"path": "test.safetensors", "weight": 1.0}

        assert manager.has_lora("test")
        manager.clear()
        assert not manager.has_lora("test")
        assert manager.get_loaded_loras() == {}


class TestLoRAManagerThreadSafety:
    """Test thread safety of LoRA manager."""

    def test_concurrent_operations(self):
        """Test that concurrent operations are thread-safe."""
        import threading

        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()
            model.unfuse_lora = Mock()
            model.unload_lora_weights = Mock()

            results = []

            def load_lora(name):
                try:
                    config = LoRAConfig(tmp.name, adapter_name=name)
                    manager.apply_loras(model, [config])
                    results.append(("success", name))
                except Exception as e:
                    results.append(("error", str(e)))

            threads = [threading.Thread(target=load_lora, args=(f"lora_{i}",)) for i in range(3)]

            for t in threads:
                t.start()

            for t in threads:
                t.join()

            # Should have some successful operations without crashes
            assert len(results) > 0
            assert any(r[0] == "success" for r in results)

class TestCalculateHash:
    """Test hash calculation function."""

    def test_calculate_hash_basic(self):
        """Test calculating SHA256 hash of a file."""
        with tempfile.NamedTemporaryFile(mode="wb", delete=False) as tmp:
            tmp.write(b"test content")
            tmp.flush()
            tmp_path = tmp.name

        try:
            hash_result = calculate_hash(tmp_path)
            assert isinstance(hash_result, str)
            assert len(hash_result) == 64  # SHA256 hex digest is 64 chars
        finally:
            Path(tmp_path).unlink()

    def test_calculate_hash_consistent(self):
        """Test that hash is consistent for same file."""
        with tempfile.NamedTemporaryFile(mode="wb", delete=False) as tmp:
            tmp.write(b"consistent content")
            tmp.flush()
            tmp_path = tmp.name

        try:
            hash1 = calculate_hash(tmp_path)
            hash2 = calculate_hash(tmp_path)
            assert hash1 == hash2
        finally:
            Path(tmp_path).unlink()

    def test_calculate_hash_different_content(self):
        """Test that different files produce different hashes."""
        with tempfile.NamedTemporaryFile(mode="wb", delete=False) as tmp1:
            tmp1.write(b"content 1")
            tmp1.flush()
            path1 = tmp1.name

        with tempfile.NamedTemporaryFile(mode="wb", delete=False) as tmp2:
            tmp2.write(b"content 2")
            tmp2.flush()
            path2 = tmp2.name

        try:
            hash1 = calculate_hash(path1)
            hash2 = calculate_hash(path2)
            assert hash1 != hash2
        finally:
            Path(path1).unlink()
            Path(path2).unlink()

    def test_calculate_hash_file_not_found(self):
        """Test hash calculation with non-existent file."""
        with pytest.raises(FileNotFoundError):
            calculate_hash("/nonexistent/path/file.safetensors")


class TestLoRACaching:
    """Test LoRA caching functionality."""

    def test_cache_hit(self):
        """Test that second load returns cached entry."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()

            # First load
            manager.load_lora(model, tmp.name, adapter_name="test")
            assert model.load_lora_weights.call_count == 1

            # Second load - should hit cache
            manager.load_lora(model, tmp.name, adapter_name="test")
            assert model.load_lora_weights.call_count == 1  # Not called again

            # Verify cache stats
            stats = manager.get_cache_stats()
            assert stats["hits"] == 1
            assert stats["misses"] == 1

    def test_cache_miss_different_file(self):
        """Test that different files cause cache miss."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp1:
            with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp2:
                manager = LoRAManager()
                model = Mock()
                model.load_lora_weights = Mock()

                # Load first file
                manager.load_lora(model, tmp1.name, adapter_name="lora1")
                assert model.load_lora_weights.call_count == 1

                # Load different file - cache miss
                manager.load_lora(model, tmp2.name, adapter_name="lora2")
                assert model.load_lora_weights.call_count == 2

                # Verify stats
                stats = manager.get_cache_stats()
                assert stats["hits"] == 0
                assert stats["misses"] == 2

    def test_cache_eviction_lru(self):
        """Test LRU eviction when cache is full."""
        manager = LoRAManager(max_cache_size=2)
        model = Mock()
        model.load_lora_weights = Mock()

        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp1:
            with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp2:
                with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp3:
                    try:
                        # Load 3 files (cache size is 2)
                        manager.load_lora(model, tmp1.name, adapter_name="lora1")
                        manager.load_lora(model, tmp2.name, adapter_name="lora2")
                        manager.load_lora(model, tmp3.name, adapter_name="lora3")

                        # Cache should have size 2 (oldest evicted)
                        stats = manager.get_cache_stats()
                        assert stats["size"] == 2
                    finally:
                        Path(tmp1.name).unlink()
                        Path(tmp2.name).unlink()
                        Path(tmp3.name).unlink()

    def test_clear_cache(self):
        """Test clearing the cache."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()

            # Load to populate cache
            manager.load_lora(model, tmp.name, adapter_name="test")
            stats_before = manager.get_cache_stats()
            assert stats_before["size"] > 0

            # Clear cache
            manager.clear_cache()
            stats_after = manager.get_cache_stats()
            assert stats_after["size"] == 0
            assert stats_after["hits"] == 0
            assert stats_after["misses"] == 0

    def test_get_cache_stats(self):
        """Test cache statistics reporting."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()

            # Initial state
            stats = manager.get_cache_stats()
            assert stats["hits"] == 0
            assert stats["misses"] == 0
            assert stats["size"] == 0

            # After load
            manager.load_lora(model, tmp.name, adapter_name="test")
            stats = manager.get_cache_stats()
            assert stats["hits"] == 0
            assert stats["misses"] == 1
            assert stats["size"] == 1

            # Cache hit
            manager.load_lora(model, tmp.name, adapter_name="test")
            stats = manager.get_cache_stats()
            assert stats["hits"] == 1
            assert stats["misses"] == 1
            assert stats["size"] == 1

    def test_hash_stored_in_loaded_loras(self):
        """Test that file hash is stored with loaded LoRA metadata."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors") as tmp:
            manager = LoRAManager()
            model = Mock()
            model.load_lora_weights = Mock()

            manager.load_lora(model, tmp.name, adapter_name="test")

            loaded = manager.get_loaded_loras()
            assert "hash" in loaded["test"]
            assert isinstance(loaded["test"]["hash"], str)
            assert len(loaded["test"]["hash"]) == 64

    def test_cache_max_size_default(self):
        """Test default max cache size is 10."""
        manager = LoRAManager()
        stats = manager.get_cache_stats()
        assert manager._max_cache_size == 10

    def test_cache_max_size_custom(self):
        """Test custom max cache size."""
        manager = LoRAManager(max_cache_size=5)
        assert manager._max_cache_size == 5

    def test_cache_lru_move_to_end(self):
        """Test that cache moves recently used items to end."""
        manager = LoRAManager(max_cache_size=3)
        model = Mock()
        model.load_lora_weights = Mock()

        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp1:
            with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp2:
                with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp3:
                    with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as tmp4:
                        try:
                            # Load 3 files
                            manager.load_lora(model, tmp1.name, adapter_name="lora1")
                            manager.load_lora(model, tmp2.name, adapter_name="lora2")
                            manager.load_lora(model, tmp3.name, adapter_name="lora3")

                            # Re-access first file (moves to end)
                            manager.load_lora(model, tmp1.name, adapter_name="lora1")

                            # Load new file - should evict lora2 (not lora1)
                            manager.load_lora(model, tmp4.name, adapter_name="lora4")

                            # lora1 should still be loaded
                            assert manager.has_lora("lora1")
                            # lora2 should have been evicted (not in loaded_loras if
                            # it was only in cache)
                            # lora3 and lora4 should exist
                            assert manager.has_lora("lora3")
                            assert manager.has_lora("lora4")

                        finally:
                            Path(tmp1.name).unlink()
                            Path(tmp2.name).unlink()
                            Path(tmp3.name).unlink()
                            Path(tmp4.name).unlink()
