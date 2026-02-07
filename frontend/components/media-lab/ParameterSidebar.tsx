"use client";

import React, { useState } from "react";
import {
  Button,
  TextArea,
  Slider,
  Label,
  Select,
  ListBox,
  Switch,
} from "@heroui/react";
import { Shuffle } from "lucide-react";
import { LoRASelector, LoRAConfig } from "./LoRASelector";

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  sampler: string;
  scheduler: string;
  seed: number;
  loras: LoRAConfig[];
  instruction?: string;
}

interface ParameterSidebarProps {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
}

const SAMPLERS = ["euler", "euler_ancestral", "heun", "dpm_2", "dpm_2_ancestral", "lms", "ddim", "pndm", "ddpm"];
const SCHEDULERS = ["normal", "karras", "exponential", "sgm_uniform", "simple"];

// Aspect ratio presets: { label: [width, height] }
const ASPECT_RATIOS = {
  "1:1": [512, 512],
  "16:9": [1024, 576],
  "9:16": [576, 1024],
  "4:3": [1024, 768],
  "3:4": [768, 1024],
};

export function ParameterSidebar({ onGenerate, isGenerating }: ParameterSidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [cfgScale, setCfgScale] = useState(7);
  const [sampler, setSampler] = useState("euler");
  const [scheduler, setScheduler] = useState("normal");
  const [seed, setSeed] = useState(-1);
  const [lastUsedSeed, setLastUsedSeed] = useState<number | null>(null);
  const [loras, setLoras] = useState<LoRAConfig[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  const [baseAspectRatio, setBaseAspectRatio] = useState(1); // width / height
  const [instruction, setInstruction] = useState("");

  // Load last used seed from localStorage on mount
  React.useEffect(() => {
    const savedSeed = localStorage.getItem("last-used-seed");
    if (savedSeed) {
      const parsed = parseInt(savedSeed, 10);
      if (!isNaN(parsed)) {
        setLastUsedSeed(parsed);
      }
    }
  }, []);

  const handleGenerate = () => {
    const generatedSeed = seed === -1 ? Math.floor(Math.random() * 2147483647) : seed;
    
    // Save seed to localStorage
    localStorage.setItem("last-used-seed", generatedSeed.toString());
    setLastUsedSeed(generatedSeed);
    
    onGenerate({
      prompt,
      negativePrompt,
      width,
      height,
      steps,
      cfgScale,
      sampler,
      scheduler,
      seed: generatedSeed,
      loras,
      instruction: instruction || undefined,
    });
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647));
  };

  const usePreviousSeed = () => {
    if (lastUsedSeed !== null) {
      setSeed(lastUsedSeed);
    }
  };

  // Apply preset aspect ratio
  const applyAspectRatio = (presetLabel: string) => {
    const [presetWidth, presetHeight] = ASPECT_RATIOS[presetLabel as keyof typeof ASPECT_RATIOS];
    setWidth(presetWidth);
    setHeight(presetHeight);
    if (aspectRatioLocked) {
      setBaseAspectRatio(presetWidth / presetHeight);
    }
  };

  // Handle width change with aspect ratio locking
  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (aspectRatioLocked && baseAspectRatio > 0) {
      const newHeight = Math.round(newWidth / baseAspectRatio / 8) * 8; // Snap to 8-multiple
      setHeight(Math.max(256, newHeight));
    }
  };

  // Handle height change with aspect ratio locking
  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (aspectRatioLocked && baseAspectRatio > 0) {
      const newWidth = Math.round(newHeight * baseAspectRatio / 8) * 8; // Snap to 8-multiple
      setWidth(Math.max(256, newWidth));
    }
  };

  // Toggle aspect ratio lock
  const handleLockToggle = (isLocked: boolean) => {
    setAspectRatioLocked(isLocked);
    if (isLocked && height > 0) {
      setBaseAspectRatio(width / height);
    }
  };

  // Get current aspect ratio display
  const currentAspectRatioDisplay = (width / height).toFixed(2);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Generation Parameters</h3>

      {/* Prompt */}
      <div className="flex flex-col gap-1">
        <Label>Prompt</Label>
        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate..."
          rows={3}
        />
      </div>

      {/* Edit Instruction (for img2img/InstructPix2Pix modes) */}
      <div className="flex flex-col gap-1">
        <Label>Edit Instruction</Label>
        <TextArea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Describe the edit you want (e.g., 'make it red', 'add sunglasses')..."
          rows={2}
        />
      </div>

      {/* Aspect Ratio Presets */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm">Aspect Ratio Presets</Label>
        <div className="grid grid-cols-5 gap-1">
          {Object.keys(ASPECT_RATIOS).map((label) => (
            <Button
              key={label}
              size="sm"
              variant="ghost"
              onPress={() => applyAspectRatio(label)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Width/Height with Aspect Ratio Lock */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Resolution</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-default-500">Aspect: {currentAspectRatioDisplay}</span>
            <Switch
              size="sm"              
              isSelected={aspectRatioLocked}
              onChange={handleLockToggle}
            />
            <span className="text-xs text-default-500">Lock</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Width</Label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 512)}
              min={256}
              max={2048}
              step={64}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Height</Label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 512)}
              min={256}
              max={2048}
              step={64}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
        </div>
      </div>

      {/* Advanced Toggle */}
      <Button
        variant="ghost"
        onPress={() => setShowAdvanced(!showAdvanced)}
        className="text-sm"
      >
        {showAdvanced ? "Hide Advanced" : "Show Advanced"}
      </Button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="flex flex-col gap-4">
          {/* Negative Prompt */}
          <div className="flex flex-col gap-1">
            <Label>Negative Prompt</Label>
            <TextArea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Things to exclude..."
              rows={2}
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <Label>Steps</Label>
              <span className="text-sm text-default-500">{steps}</span>
            </div>
            <Slider
              value={steps}
              onChange={(v) => setSteps(Array.isArray(v) ? v[0] : v)}
              minValue={1}
              maxValue={50}
              step={1}
            />
          </div>

          {/* CFG Scale */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <Label>CFG Scale</Label>
              <span className="text-sm text-default-500">{cfgScale}</span>
            </div>
            <Slider
              value={cfgScale}
              onChange={(v) => setCfgScale(Array.isArray(v) ? v[0] : v)}
              minValue={1}
              maxValue={20}
              step={0.5}
            />
          </div>

          {/* Sampler */}
          <div className="flex flex-col gap-1">
            <Label>Sampler</Label>
            <Select
              value={sampler}
              onChange={(value) => setSampler(String(value))}
              placeholder="Select sampler"
              className="w-full"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {SAMPLERS.map((s) => (
                    <ListBox.Item key={s} id={s} textValue={s}>
                      {s}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Scheduler */}
          <div className="flex flex-col gap-1">
            <Label>Scheduler</Label>
            <Select
              value={scheduler}
              onChange={(value) => setScheduler(String(value))}
              placeholder="Select scheduler"
              className="w-full"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {SCHEDULERS.map((sch) => (
                    <ListBox.Item key={sch} id={sch} textValue={sch}>
                      {sch}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Seed */}
          <div className="flex flex-col gap-1">
            <Label>Seed</Label>
            <div className="flex gap-2">
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                className="flex-1 p-2 border rounded-md bg-background"
                placeholder="-1 for random"
              />
              <Button variant="ghost" onPress={randomizeSeed}>
                <Shuffle size={16} />
              </Button>
            </div>
            {lastUsedSeed !== null && (
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={usePreviousSeed}
                className="text-xs mt-1"
              >
                Use Last Seed ({lastUsedSeed})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* LoRAs */}
      <LoRASelector onUpdate={setLoras} />

      {/* Generate Button */}
      <Button
        onPress={handleGenerate}
        isDisabled={isGenerating || !prompt.trim()}
        className="mt-auto"
      >
        {isGenerating ? "Generating..." : "Generate"}
      </Button>
    </div>
  );
}
