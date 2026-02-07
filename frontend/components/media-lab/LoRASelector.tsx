"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Slider,
  Card,
  CardBody,
  CardHeader,
  Chip,
} from "@heroui/react";
import { X, Plus } from "lucide-react";
import { api, ModelInfo } from "@/lib/api";

export interface LoRAConfig {
  path: string;
  weight: number;
  name?: string; // Optional name for display
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

  // Fetch available LoRA models on mount
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

  // Notify parent whenever selectedLoRAs changes
  useEffect(() => {
    onUpdate(selectedLoRAs);
  }, [selectedLoRAs, onUpdate]);

  const handleAddLoRA = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (!model) return;

    // Check if already selected
    if (selectedLoRAs.some((l) => l.path === model.id)) return;

    const newLoRA: LoRAConfig = {
      path: model.id,
      weight: 0.8, // Default weight
      name: model.name,
    };

    setSelectedLoRAs([...selectedLoRAs, newLoRA]);
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

  // Filter out already selected models from the dropdown options
  const availableOptions = availableModels.filter(
    (model) => !selectedLoRAs.some((l) => l.path === model.id)
  );

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">LoRA Models</h3>
        <Chip size="sm" variant="flat" color="primary">
          {selectedLoRAs.length} Active
        </Chip>
      </div>

      {error && <div className="text-danger text-sm">{error}</div>}

      {/* Selection Dropdown */}
      <Select
        label="Add LoRA"
        placeholder="Select a LoRA model"
        isLoading={isLoading}
        isDisabled={isLoading || availableOptions.length === 0}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected) {
            handleAddLoRA(selected);
          }
        }}
        className="max-w-full"
      >
        {availableOptions.map((model) => (
          <SelectItem key={model.id} textValue={model.name}>
            <div className="flex flex-col">
              <span className="text-small">{model.name}</span>
              <span className="text-tiny text-default-400">
                {(model.size_gb || 0).toFixed(2)} GB
              </span>
            </div>
          </SelectItem>
        ))}
      </Select>

      {/* Selected LoRAs List */}
      <div className="flex flex-col gap-3 mt-2">
        {selectedLoRAs.length === 0 && (
          <div className="text-center text-default-400 text-sm py-4 border border-dashed border-default-200 rounded-lg">
            No LoRA models selected
          </div>
        )}

        {selectedLoRAs.map((lora) => (
          <Card key={lora.path} className="w-full" shadow="sm">
            <CardBody className="p-3">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {lora.name || lora.path}
                    </span>
                    <span className="text-tiny text-default-400 font-mono truncate max-w-[200px]">
                      {lora.path}
                    </span>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleRemoveLoRA(lora.path)}
                  >
                    <X size={16} />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-default-500 w-12">Weight</span>
                  <Slider
                    aria-label="LoRA Weight"
                    size="sm"
                    step={0.05}
                    maxValue={2.0}
                    minValue={-1.0}
                    defaultValue={0.8}
                    value={lora.weight}
                    onChange={(val) => handleWeightChange(lora.path, val)}
                    className="max-w-md"
                    showSteps={true} 
                  />
                  <span className="text-xs font-mono w-10 text-right">
                    {lora.weight.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
