"""Tests for preset system."""

import json
import tempfile
from pathlib import Path

import pytest

from src.media_lab.presets import Preset, PresetManager


class TestPreset:
    """Test Preset dataclass."""

    def test_preset_create(self):
        """Test creating a new preset with timestamps."""
        config = {"stages": [], "parameters": {}}
        preset = Preset.create("Test Preset", "A test preset", config)

        assert preset.name == "Test Preset"
        assert preset.description == "A test preset"
        assert preset.config == config
        assert preset.id is not None
        assert preset.created_at is not None
        assert preset.updated_at is not None

    def test_preset_to_dict(self):
        """Test converting preset to dictionary."""
        config = {"stages": [], "parameters": {}}
        preset = Preset.create("Test Preset", "Description", config)
        preset_dict = preset.to_dict()

        assert preset_dict["id"] == preset.id
        assert preset_dict["name"] == "Test Preset"
        assert preset_dict["description"] == "Description"
        assert preset_dict["config"] == config
        assert "created_at" in preset_dict
        assert "updated_at" in preset_dict

    def test_preset_from_dict(self):
        """Test creating preset from dictionary."""
        data = {
            "id": "test-id",
            "name": "Test",
            "description": "Desc",
            "config": {"key": "value"},
            "created_at": "2025-01-01T00:00:00",
            "updated_at": "2025-01-01T00:00:00",
        }
        preset = Preset.from_dict(data)

        assert preset.id == "test-id"
        assert preset.name == "Test"
        assert preset.description == "Desc"
        assert preset.config == {"key": "value"}


class TestPresetManager:
    """Test PresetManager."""

    @pytest.fixture
    def temp_preset_dir(self):
        """Create temporary preset directory."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield Path(tmpdir)

    @pytest.fixture
    def manager(self, temp_preset_dir):
        """Create PresetManager with temporary directory."""
        return PresetManager(temp_preset_dir)

    def test_save_preset(self, manager):
        """Test saving a preset."""
        config = {"stages": [], "parameters": {}, "seed": 42}
        preset = manager.save_preset("Test Preset", "Test description", config)

        assert preset.name == "Test Preset"
        assert preset.description == "Test description"
        assert preset.config == config

        # Verify file was created
        preset_file = manager.base_dir / f"{preset.id}.json"
        assert preset_file.exists()

    def test_load_preset(self, manager):
        """Test loading a preset."""
        config = {"stages": [], "parameters": {}, "seed": 123}
        saved_preset = manager.save_preset("Saved Preset", "Description", config)

        loaded_preset = manager.load_preset(saved_preset.id)

        assert loaded_preset.id == saved_preset.id
        assert loaded_preset.name == "Saved Preset"
        assert loaded_preset.description == "Description"
        assert loaded_preset.config == config
        assert loaded_preset.created_at == saved_preset.created_at

    def test_load_nonexistent_preset(self, manager):
        """Test loading non-existent preset raises error."""
        with pytest.raises(FileNotFoundError):
            manager.load_preset("nonexistent-id")

    def test_list_presets(self, manager):
        """Test listing all presets."""
        # Create multiple presets
        config1 = {"stages": [], "seed": 1}
        config2 = {"stages": [], "seed": 2}
        config3 = {"stages": [], "seed": 3}

        preset1 = manager.save_preset("Preset 1", "First", config1)
        preset2 = manager.save_preset("Preset 2", "Second", config2)
        preset3 = manager.save_preset("Preset 3", "Third", config3)

        presets = manager.list_presets()

        assert len(presets) == 3
        # Should be sorted by created_at descending
        assert presets[0].id == preset3.id
        assert presets[1].id == preset2.id
        assert presets[2].id == preset1.id

    def test_list_empty_presets(self, manager):
        """Test listing presets when none exist."""
        presets = manager.list_presets()
        assert presets == []

    def test_delete_preset(self, manager):
        """Test deleting a preset."""
        config = {"stages": [], "parameters": {}}
        preset = manager.save_preset("To Delete", "This will be deleted", config)

        # Verify file exists
        preset_file = manager.base_dir / f"{preset.id}.json"
        assert preset_file.exists()

        # Delete preset
        deleted = manager.delete_preset(preset.id)
        assert deleted is True

        # Verify file is gone
        assert not preset_file.exists()

        # Verify it's not in list
        presets = manager.list_presets()
        assert len(presets) == 0

    def test_delete_nonexistent_preset(self, manager):
        """Test deleting non-existent preset returns False."""
        deleted = manager.delete_preset("nonexistent-id")
        assert deleted is False

    def test_pipeline_config_round_trip(self, manager):
        """Test that PipelineConfig can be saved and loaded as dict."""
        # Complex config similar to real usage
        config = {
            "stages": [
                {
                    "name": "text_to_image",
                    "params": {"model": "sd-v1.5", "guidance_scale": 7.5},
                }
            ],
            "parameters": {"custom_param": "value"},
            "loras": [{"name": "lora1", "weight": 0.8}],
            "seed": 42,
            "batch_size": 2,
            "width": 512,
            "height": 512,
            "sampler": "euler",
            "scheduler": "karras",
            "strength": 0.75,
        }

        # Save and load
        preset = manager.save_preset("Complex Config", "Full pipeline config", config)
        loaded = manager.load_preset(preset.id)

        # Verify all fields round-trip correctly
        assert loaded.config == config
        assert loaded.config["seed"] == 42
        assert loaded.config["batch_size"] == 2
        assert loaded.config["width"] == 512
        assert loaded.config["height"] == 512
        assert loaded.config["sampler"] == "euler"
        assert loaded.config["scheduler"] == "karras"
        assert len(loaded.config["loras"]) == 1
        assert loaded.config["loras"][0]["weight"] == 0.8
