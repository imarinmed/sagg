"use client";

import React from "react";
import { Slider, Tooltip } from "@heroui/react";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showLabels?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const intensityLabels: Record<number, { label: string; description: string; color: string }> = {
  1: {
    label: "Subtextual",
    description: "Implied, metaphorical, or background element",
    color: "text-success-600",
  },
  2: {
    label: "Suggestive",
    description: "Clear hints without explicit depiction",
    color: "text-success-500",
  },
  3: {
    label: "Implied",
    description: "Strong suggestion, reader inference required",
    color: "text-warning-600",
  },
  4: {
    label: "Explicit",
    description: "Direct depiction, clearly stated",
    color: "text-danger-500",
  },
  5: {
    label: "Transgressive",
    description: "Extreme, boundary-pushing, potentially shocking",
    color: "text-danger-700",
  },
};

const intensityColors = [
  "bg-success-500",
  "bg-success-400",
  "bg-warning-500",
  "bg-danger-400",
  "bg-danger-600",
];

export function IntensitySlider({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  label = "Intensity",
  showLabels = true,
  disabled = false,
  size = "md",
}: IntensitySliderProps) {
  const currentIntensity = intensityLabels[value];

  const getTrackGradient = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, 
      ${value >= 1 ? "#22c55e" : "#e5e7eb"} 0%, 
      ${value >= 2 ? "#4ade80" : "#e5e7eb"} 25%, 
      ${value >= 3 ? "#f59e0b" : "#e5e7eb"} 50%, 
      ${value >= 4 ? "#f87171" : "#e5e7eb"} 75%, 
      ${value >= 5 ? "#dc2626" : "#e5e7eb"} 100%)`;
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const thumbSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="w-full space-y-3">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-default-700">{label}</span>
          <Tooltip>
            <Tooltip.Trigger>
              <span
                className={`text-sm font-bold ${currentIntensity?.color || "text-default-600"}`}
              >
                {value}/5
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {currentIntensity?.description}
            </Tooltip.Content>
          </Tooltip>
        </div>
      )}

      <div className="relative">
        <Slider
          value={value}
          onChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
          min={min}
          max={max}
          step={step}
          isDisabled={disabled}
          classNames={{
            base: "w-full",
            track: `${sizeClasses[size]} rounded-full`,
            thumb: `${thumbSizes[size]} bg-white border-2 border-default-300 shadow-md`,
            filler: "bg-transparent",
          }}
          style={{
            // @ts-ignore
            "--slider-track-background": getTrackGradient(),
          }}
        />

        {/* Custom track styling */}
        <style jsx>{`
          div :global([role="slider"]) {
            background: var(--slider-track-background) !important;
          }
        `}</style>
      </div>

      {showLabels && (
        <div className="flex justify-between text-[10px] text-default-400 px-1">
          {Object.entries(intensityLabels).map(([level, info]) => (
            <Tooltip key={level}>
              <Tooltip.Trigger>
                <span
                  className={`cursor-help transition-colors ${
                    parseInt(level) === value ? info.color : ""
                  }`}
                >
                  {level}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {info.description}
              </Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      )}

      {currentIntensity && (
        <div className="text-center">
          <span className={`text-sm font-medium ${currentIntensity.color}`}>
            {currentIntensity.label}
          </span>
          <p className="text-xs text-default-500 mt-1">
            {currentIntensity.description}
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function IntensityBadge({ value }: { value: number }) {
  const info = intensityLabels[value];
  if (!info) return null;

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <span
          className={`
            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
            ${
              value >= 4
                ? "bg-danger-100 text-danger-700"
                : value >= 3
                ? "bg-warning-100 text-warning-700"
                : "bg-success-100 text-success-700"
            }
          `}
        >
          {value}/5 {info.label}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {info.description}
      </Tooltip.Content>
    </Tooltip>
  );
}
