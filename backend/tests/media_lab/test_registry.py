"""
Tests for ModelRegistry - Model discovery and registration.

Tests cover:
- Directory scanning (creation, recursion, extension filtering)
- Manual registration (validation, error handling)
- Model queries (by name, by type, counting)
- Registry management (add, remove, clear)
"""

import tempfile
from pathlib import Path

import pytest

from src.media_lab.registry import ModelRegistry
from src.models import ModelType


@pytest.fixture
def registry():
    """Create a fresh registry for each test."""
    return ModelRegistry()


@pytest.fixture
def temp_models_dir():
    """Create a temporary directory structure with test model files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        base = Path(tmpdir)

        # Create directory structure
        checkpoints_dir = base / "checkpoints"
        checkpoints_dir.mkdir()
        (checkpoints_dir / "model_v1.safetensors").touch()
        (checkpoints_dir / "model_v2.ckpt").touch()

        loras_dir = base / "loras"
        loras_dir.mkdir()
        (loras_dir / "lora_style_a.safetensors").touch()

        embeddings_dir = base / "embeddings"
        embeddings_dir.mkdir()
        (embeddings_dir / "embedding_1.safetensors").touch()

        # Nested directory
        nested = base / "custom" / "nested" / "models"
        nested.mkdir(parents=True)
        (nested / "deep_model.safetensors").touch()

        yield base


class TestModelRegistryScan:
    """Test directory scanning functionality."""

    def test_scan_creates_missing_directory(self, registry, temp_models_dir):
        """scan_models should create directory if it doesn't exist."""
        missing_dir = temp_models_dir / "missing"
        assert not missing_dir.exists()

        result = registry.scan_models(missing_dir)

        assert missing_dir.exists()
        assert result == []

    def test_scan_empty_directory(self, registry, temp_models_dir):
        """scan_models should return empty list for empty directory."""
        empty_dir = temp_models_dir / "empty"
        empty_dir.mkdir()

        result = registry.scan_models(empty_dir)

        assert result == []

    def test_scan_finds_safetensors_files(self, registry, temp_models_dir):
        """scan_models should find .safetensors files."""
        result = registry.scan_models(temp_models_dir / "checkpoints")

        names = [m.name for m in result]
        assert "model_v1" in names

    def test_scan_finds_ckpt_files(self, registry, temp_models_dir):
        """scan_models should find .ckpt files."""
        result = registry.scan_models(temp_models_dir / "checkpoints")

        names = [m.name for m in result]
        assert "model_v2" in names

    def test_scan_recursive(self, registry, temp_models_dir):
        """scan_models should recursively find files in nested directories."""
        result = registry.scan_models(temp_models_dir)

        names = [m.name for m in result]
        assert "deep_model" in names
        assert len(result) >= 5

    def test_scan_ignores_non_model_files(self, registry, temp_models_dir):
        """scan_models should ignore files with unsupported extensions."""
        (temp_models_dir / "readme.txt").touch()
        (temp_models_dir / "config.json").touch()

        result = registry.scan_models(temp_models_dir)

        names = [m.name for m in result]
        assert "readme" not in names
        assert "config" not in names

    def test_scan_sets_file_path(self, registry, temp_models_dir):
        """scan_models should set absolute file paths."""
        result = registry.scan_models(temp_models_dir / "checkpoints")

        assert all(Path(m.file_path).is_absolute() for m in result)

    def test_scan_sets_discovered_timestamp(self, registry, temp_models_dir):
        """scan_models should set discovered_at timestamp."""
        result = registry.scan_models(temp_models_dir)

        assert all(m.discovered_at is not None for m in result)

    def test_scan_detects_file_size(self, registry, temp_models_dir):
        """scan_models should detect file size."""
        test_file = temp_models_dir / "test.safetensors"
        test_content = b"test data" * 100
        test_file.write_bytes(test_content)

        result = registry.scan_models(temp_models_dir)

        test_model = next((m for m in result if m.name == "test"), None)
        assert test_model is not None
        assert test_model.file_size_bytes == len(test_content)

    def test_scan_returns_model_info(self, registry, temp_models_dir):
        """scan_models should return ModelInfo objects."""
        from src.models import ModelInfo

        result = registry.scan_models(temp_models_dir)

        assert all(isinstance(m, ModelInfo) for m in result)

    def test_scan_invalid_path_type(self, registry):
        """scan_models should handle non-directory paths."""
        with tempfile.NamedTemporaryFile() as tmpfile:
            result = registry.scan_models(tmpfile.name)
            assert result == []


class TestModelRegistryRegister:
    """Test manual model registration."""

    def test_register_model_success(self, registry, temp_models_dir):
        """register_model should add model to registry."""
        model_path = temp_models_dir / "checkpoints" / "model_v1.safetensors"

        result = registry.register_model(model_path, ModelType.CHECKPOINT)

        assert result.name == "model_v1"
        assert result.model_type == ModelType.CHECKPOINT
        assert Path(result.file_path).is_absolute()

    def test_register_model_custom_name(self, registry, temp_models_dir):
        """register_model should use custom name if provided."""
        model_path = temp_models_dir / "checkpoints" / "model_v1.safetensors"

        result = registry.register_model(model_path, ModelType.CHECKPOINT, name="my_custom_model")

        assert result.name == "my_custom_model"

    def test_register_model_with_description(self, registry, temp_models_dir):
        """register_model should store description."""
        model_path = temp_models_dir / "checkpoints" / "model_v1.safetensors"

        result = registry.register_model(
            model_path,
            ModelType.CHECKPOINT,
            description="A test model",
        )

        assert result.description == "A test model"

    def test_register_model_with_tags(self, registry, temp_models_dir):
        """register_model should store tags."""
        model_path = temp_models_dir / "checkpoints" / "model_v1.safetensors"

        result = registry.register_model(
            model_path,
            ModelType.CHECKPOINT,
            tags=["test", "v1"],
        )

        assert result.tags == ["test", "v1"]

    def test_register_model_file_not_found(self, registry):
        """register_model should raise FileNotFoundError for missing files."""
        with pytest.raises(FileNotFoundError):
            registry.register_model("/nonexistent/path/model.safetensors", ModelType.CHECKPOINT)

    def test_register_model_unsupported_extension(self, registry, temp_models_dir):
        """register_model should raise ValueError for unsupported extensions."""
        unsupported = temp_models_dir / "model.txt"
        unsupported.touch()

        with pytest.raises(ValueError, match="Unsupported file extension"):
            registry.register_model(unsupported, ModelType.CHECKPOINT)

    def test_register_model_type_checkpoint(self, registry, temp_models_dir):
        """register_model should support checkpoint type."""
        model_path = temp_models_dir / "checkpoints" / "model_v1.safetensors"

        result = registry.register_model(model_path, ModelType.CHECKPOINT)

        assert result.model_type == ModelType.CHECKPOINT

    def test_register_model_type_lora(self, registry, temp_models_dir):
        """register_model should support lora type."""
        model_path = temp_models_dir / "loras" / "lora_style_a.safetensors"

        result = registry.register_model(model_path, ModelType.LORA)

        assert result.model_type == ModelType.LORA

    def test_register_model_type_embedding(self, registry, temp_models_dir):
        """register_model should support embedding type."""
        model_path = temp_models_dir / "embeddings" / "embedding_1.safetensors"

        result = registry.register_model(model_path, ModelType.EMBEDDING)

        assert result.model_type == ModelType.EMBEDDING


class TestModelRegistryQuery:
    """Test model query functionality."""

    def test_get_model_path_found(self, registry, temp_models_dir):
        """get_model_path should return path for registered model."""
        registry.scan_models(temp_models_dir)

        path = registry.get_model_path("model_v1")

        assert path is not None
        assert path.endswith("model_v1.safetensors")

    def test_get_model_path_not_found(self, registry):
        """get_model_path should return None for unknown model."""
        path = registry.get_model_path("nonexistent")

        assert path is None

    def test_get_model_info(self, registry, temp_models_dir):
        """get_model should return full ModelInfo."""
        registry.scan_models(temp_models_dir)

        model_info = registry.get_model("model_v1")

        assert model_info is not None
        assert model_info.name == "model_v1"
        assert model_info.model_type == ModelType.CHECKPOINT

    def test_get_model_not_found(self, registry):
        """get_model should return None for unknown model."""
        model_info = registry.get_model("nonexistent")

        assert model_info is None

    def test_list_models_all(self, registry, temp_models_dir):
        """list_models without filter should return all models."""
        registry.scan_models(temp_models_dir)

        models = registry.list_models()

        assert len(models) > 0
        assert all(m.file_path for m in models)

    def test_list_models_by_type_checkpoint(self, registry, temp_models_dir):
        """list_models should filter by checkpoint type."""
        registry.scan_models(temp_models_dir)

        models = registry.list_models(ModelType.CHECKPOINT)

        assert all(m.model_type == ModelType.CHECKPOINT for m in models)
        assert len(models) > 0

    def test_list_models_by_type_lora(self, registry, temp_models_dir):
        """list_models should filter by lora type."""
        registry.register_model(
            temp_models_dir / "loras" / "lora_style_a.safetensors", ModelType.LORA
        )

        models = registry.list_models(ModelType.LORA)

        assert all(m.model_type == ModelType.LORA for m in models)

    def test_list_models_empty_filter(self, registry):
        """list_models should return empty list if no matches."""
        models = registry.list_models(ModelType.LORA)

        assert models == []

    def test_list_all(self, registry, temp_models_dir):
        """list_all should return all registered models."""
        registry.scan_models(temp_models_dir)

        models = registry.list_all()

        assert len(models) > 0

    def test_count_models_total(self, registry, temp_models_dir):
        """count_models should return total count."""
        registry.scan_models(temp_models_dir)

        count = registry.count_models()

        assert count > 0

    def test_count_models_by_type(self, registry, temp_models_dir):
        """count_models should filter by type."""
        registry.scan_models(temp_models_dir)

        count = registry.count_models(ModelType.CHECKPOINT)

        assert count > 0


class TestModelRegistryManagement:
    """Test registry management operations."""

    def test_model_exists_true(self, registry, temp_models_dir):
        """model_exists should return True for registered model."""
        registry.scan_models(temp_models_dir)

        exists = registry.model_exists("model_v1")

        assert exists is True

    def test_model_exists_false(self, registry):
        """model_exists should return False for unknown model."""
        exists = registry.model_exists("nonexistent")

        assert exists is False

    def test_remove_model_success(self, registry, temp_models_dir):
        """remove_model should remove registered model."""
        registry.scan_models(temp_models_dir)
        assert registry.model_exists("model_v1")

        removed = registry.remove_model("model_v1")

        assert removed is True
        assert not registry.model_exists("model_v1")

    def test_remove_model_not_found(self, registry):
        """remove_model should return False for unknown model."""
        removed = registry.remove_model("nonexistent")

        assert removed is False

    def test_clear_registry(self, registry, temp_models_dir):
        """clear should remove all models."""
        registry.scan_models(temp_models_dir)
        assert registry.count_models() > 0

        registry.clear()

        assert registry.count_models() == 0
        assert registry.list_all() == []

    def test_register_overwrites_existing(self, registry, temp_models_dir):
        """Registering same model twice should update it."""
        model_path = temp_models_dir / "checkpoints" / "model_v1.safetensors"

        registry.register_model(model_path, ModelType.CHECKPOINT, description="First")
        registry.register_model(model_path, ModelType.CHECKPOINT, description="Second")

        model = registry.get_model("model_v1")
        assert model.description == "Second"


class TestModelRegistryIntegration:
    """Integration tests combining multiple operations."""

    def test_scan_then_query(self, registry, temp_models_dir):
        """Scan directory then query for specific model."""
        registry.scan_models(temp_models_dir)

        model = registry.get_model("model_v1")

        assert model is not None
        assert model.model_type == ModelType.CHECKPOINT
        assert Path(model.file_path).exists()

    def test_mix_scan_and_register(self, registry, temp_models_dir):
        """Mix scan with manual registration."""
        registry.scan_models(temp_models_dir / "checkpoints")
        registry.register_model(
            temp_models_dir / "loras" / "lora_style_a.safetensors",
            ModelType.LORA,
        )

        all_models = registry.list_all()
        checkpoints = registry.list_models(ModelType.CHECKPOINT)
        loras = registry.list_models(ModelType.LORA)

        assert len(all_models) >= len(checkpoints) + len(loras)

    def test_registry_workflow(self, registry, temp_models_dir):
        """Complete workflow: scan, register, query, manage."""
        # Scan base directory
        registry.scan_models(temp_models_dir)
        initial_count = registry.count_models()

        # Register custom model
        new_model = registry.register_model(
            temp_models_dir / "loras" / "lora_style_a.safetensors",
            ModelType.LORA,
            name="custom_lora",
            tags=["custom"],
        )

        # Query
        assert registry.model_exists("custom_lora")
        assert registry.get_model_path("custom_lora") is not None

        # Filter and count
        loras = registry.list_models(ModelType.LORA)
        assert any(m.name == "custom_lora" for m in loras)

        # Remove
        registry.remove_model("custom_lora")
        assert not registry.model_exists("custom_lora")
