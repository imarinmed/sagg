"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Slider,
  Card,
  Chip,
  Label,
  Modal,
} from "@heroui/react";
import { X, Plus, ChevronDown } from "lucide-react";
import { api, ModelInfo } from "@/lib/api";

export interface LoRAConfig {
  path: string;
  weight: number;
  name?: string;
}

interface LoRASelectorProps {
  onUpdate: (loras: LoRAConfig[]) => void;
  className?: string;
}

export function LoRASelector({ onUpdate, className = "" }: LoRASelectorProps) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedLoRAs, setSelectedLoRAs] = useState<LoRAConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const response = await api.mediaLab.listModels("lora");
        setAvailableModels(response.models);
      } catch (err) {
        console.error("Failed to fetch LoRA models:", err);
        setError("Failed to load LoRA models");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    onUpdate(selectedLoRAs);
  }, [selectedLoRAs, onUpdate]);

  const handleAddLoRA = () => {
    if (!selectedModelId) return;
    
    const model = availableModels.find((m) => m.id === selectedModelId);
    if (!model) return;

    if (selectedLoRAs.some((l) => l.path === model.id)) return;

    const newLoRA: LoRAConfig = {
      path: model.id,
      weight: 0.8,
      name: model.name,
    };

    setSelectedLoRAs([...selectedLoRAs, newLoRA]);
    setSelectedModelId("");
    setIsOpen(false);
  };

  const handleRemoveLoRA = (path: string) => {
    setSelectedLoRAs(selectedLoRAs.filter((l) => l.path !== path));
  };

  const handleWeightChange = (path: string, weight: number | number[]) => {
    const newWeight = Array.isArray(weight) ? weight[0] : weight;
    setSelectedLoRAs(
      selectedLoRAs.map((l) =>
        l.path === path ? { ...l, weight: newWeight } : l
      )
    );
  };

  const availableOptions = availableModels.filter(
    (model) => !selectedLoRAs.some((l) => l.path === model.id)
  );

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">LoRA Models</h3>
        <Chip size="sm" variant="soft" color="accent">
          {selectedLoRAs.length} Active
        </Chip>
      </div>

      {error && <div className="text-danger text-sm">{error}</div>}

      {/* Add LoRA Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col gap-4 p-4">
          <h4 className="text-lg font-semibold">Select LoRA Model</h4>
          
          <div className="flex flex-col gap-2">
            <Label>Available Models</Label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Choose a LoRA model...</option>
              {availableOptions.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({(model.size_gb || 0).toFixed(2)} GB)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onPress={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onPress={handleAddLoRA}
              isDisabled={!selectedModelId}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>

      {/* Selected LoRAs List */}
      <div className="flex flex-col gap-3 mt-2">
        {selectedLoRAs.length === 0 && (
          <div className="text-center text-default-400 text-sm py-4 border border-dashed border-default-200 rounded-lg">
            No LoRA models selected
          </div>
        )}

        {selectedLoRAs.map((lora) => (
          <Card key={lora.path} className="w-full">
            <div className="p-3">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {lora.name || lora.path}
                    </span>
                    <span className="text-xs text-default-400 font-mono truncate max-w-[200px]">
                      {lora.path}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => handleRemoveLoRA(lora.path)}
                  >
                    <X size={16} />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-default-500 w-12">Weight</span>
                  <Slider
                    aria-label="LoRA Weight"
                    step={0.05}
                    maxValue={2.0}
                    minValue={-1.0}
                    defaultValue={0.8}
                    value={lora.weight}
                    onChange={(val) => handleWeightChange(lora.path, val)}
                    className="max-w-md"
                  />
                  <span className="text-xs font-mono w-10 text-right">
                    {lora.weight.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
