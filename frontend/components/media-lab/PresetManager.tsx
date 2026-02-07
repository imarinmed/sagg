"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Label, Switch } from "@heroui/react";
import { Save, Trash2, RefreshCw } from "lucide-react";
import { api, Preset, PipelineConfig } from "@/lib/api";

interface PresetManagerProps {
  currentConfig: PipelineConfig | null;
  onLoadPreset: (config: PipelineConfig) => void;
  className?: string;
}

export function PresetManager({ currentConfig, onLoadPreset, className = "" }: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.mediaLab.listPresets();
      setPresets(response.presets);
      if (response.presets.length > 0) {
        setSelectedPresetId(response.presets[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load presets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = async (presetId: string) => {
    if (!presetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const preset = await api.mediaLab.loadPreset(presetId);
      onLoadPreset(preset.config as PipelineConfig);
      setSelectedPresetId(presetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!currentConfig) {
      setError("No configuration to save");
      return;
    }

    if (!presetName.trim()) {
      setError("Preset name is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const newPreset = await api.mediaLab.savePreset(
        presetName.trim(),
        presetDescription.trim(),
        currentConfig as Record<string, any>
      );
      setPresets([newPreset, ...presets]);
      setSelectedPresetId(newPreset.id);
      setPresetName("");
      setPresetDescription("");
      setShowSaveForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!confirm("Are you sure you want to delete this preset?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.mediaLab.deletePreset(presetId);
      setPresets(presets.filter((p) => p.id !== presetId));
      if (selectedPresetId === presetId) {
        setSelectedPresetId(presets.length > 0 ? presets[0].id : "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete preset");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Presets</h3>

        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

        {presets.length > 0 ? (
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Load preset</Label>
            <div className="flex gap-2">
              <select
                value={selectedPresetId}
                onChange={(e) => handleLoadPreset(e.target.value)}
                disabled={isLoading}
                className="flex-1 p-2 border rounded-md bg-background text-foreground"
              >
                <option value="">Select a preset...</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                variant="ghost"
                onPress={loadPresets}
                isDisabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">No presets saved yet</div>
        )}

        {selectedPreset && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded space-y-1">
            <div className="font-medium">{selectedPreset.name}</div>
            {selectedPreset.description && <div>{selectedPreset.description}</div>}
            <div className="text-gray-500">
              Created: {new Date(selectedPreset.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            isSelected={showSaveForm}
            onChange={(isSelected) => setShowSaveForm(isSelected)}
            isDisabled={!currentConfig}
          />
          <Label className="text-sm">Save current as preset</Label>
        </div>

        {showSaveForm && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex flex-col gap-1">
              <Label className="text-sm">Preset Name *</Label>
              <input
                type="text"
                placeholder="e.g., My Favorite Settings"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                disabled={isSaving}
                className="p-2 border rounded-md bg-background text-foreground text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm">Description</Label>
              <textarea
                placeholder="Optional description of this preset"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                disabled={isSaving}
                rows={2}
                className="p-2 border rounded-md bg-background text-foreground text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onPress={handleSavePreset}
                isDisabled={isSaving || !presetName.trim()}
                className="flex-1"
              >
                Save Preset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  setShowSaveForm(false);
                  setPresetName("");
                  setPresetDescription("");
                }}
                isDisabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {selectedPresetId && (
          <Button
            size="sm"
            onPress={() => handleDeletePreset(selectedPresetId)}
            isDisabled={isLoading || isSaving}
            className="w-full"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected Preset
          </Button>
        )}
      </div>
    </Card>
  );
}
