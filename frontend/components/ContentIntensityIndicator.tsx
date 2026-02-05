"use client";

import React from "react";
import { Tooltip } from "@heroui/react";
import { Flame, AlertTriangle, Heart, Zap, Shield } from "lucide-react";

interface ContentIntensityIndicatorProps {
  intensity: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const INTENSITY_CONFIG = {
  1: {
    label: "Mild",
    description: "Light content suitable for general audiences",
    icon: Shield,
    color: "#4a5568",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/50",
  },
  2: {
    label: "Moderate",
    description: "Some suggestive or intense moments",
    icon: Heart,
    color: "#718096",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
  },
  3: {
    label: "Intense",
    description: "Strong themes and mature content",
    icon: Zap,
    color: "#D4AF37",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
  },
  4: {
    label: "Very Intense",
    description: "Explicit content and graphic themes",
    icon: Flame,
    color: "#C5A059",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
  },
  5: {
    label: "Extreme",
    description: "Highly explicit content - viewer discretion advised",
    icon: AlertTriangle,
    color: "#8B0000",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
  },
};

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-0.5",
    icon: "w-3 h-3",
    text: "text-xs",
    bar: "w-16 h-1.5",
  },
  md: {
    container: "px-3 py-1",
    icon: "w-4 h-4",
    text: "text-sm",
    bar: "w-24 h-2",
  },
  lg: {
    container: "px-4 py-2",
    icon: "w-5 h-5",
    text: "text-base",
    bar: "w-32 h-2.5",
  },
};

export function ContentIntensityIndicator({
  intensity,
  showLabel = true,
  size = "md",
  className = "",
}: ContentIntensityIndicatorProps) {
  const config = INTENSITY_CONFIG[intensity as keyof typeof INTENSITY_CONFIG] ||
    INTENSITY_CONFIG[3];
  const Icon = config.icon;
  const sizes = SIZE_CONFIG[size];

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger aria-label={`Content intensity: ${config.label}`}>
        <div
          className={`inline-flex items-center gap-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${sizes.container} ${className}`}
        >
          <Icon
            className={sizes.icon}
            style={{ color: config.color }}
          />
          
          {/* Intensity bar */}
          <div className={`${sizes.bar} bg-black/30 rounded-full overflow-hidden`}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(intensity / 5) * 100}%`,
                backgroundColor: config.color,
              }}
            />
          </div>

          {showLabel && (
            <span
              className={`${sizes.text} font-medium`}
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          )}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <div className="max-w-xs p-2">
          <p className="font-semibold mb-1" style={{ color: config.color }}>
            {config.label}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {config.description}
          </p>
        </div>
      </Tooltip.Content>
    </Tooltip>
  );
}

// Compact version for use in lists
export function ContentIntensityBadge({
  intensity,
  size = "sm",
}: {
  intensity: number;
  size?: "sm" | "md";
}) {
  const config = INTENSITY_CONFIG[intensity as keyof typeof INTENSITY_CONFIG] ||
    INTENSITY_CONFIG[3];
  const Icon = config.icon;

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger aria-label={`Intensity: ${config.label}`}>
        <div
          className={`inline-flex items-center justify-center rounded-full ${
            size === "sm" ? "w-6 h-6" : "w-8 h-8"
          } ${config.bgColor} ${config.borderColor} border`}
        >
          <Icon
            className={size === "sm" ? "w-3 h-3" : "w-4 h-4"}
            style={{ color: config.color }}
          />
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{config.description}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
