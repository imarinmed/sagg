"use client";

import React from "react";
import { Flame } from "lucide-react";

// ============================================
// INTENSITY INDICATOR COMPONENT
// ============================================

interface IntensityIndicatorProps {
  intensity: number; // 1-5
  variant?: "bar" | "flames" | "heatmap";
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: { barWidth: "w-12", barHeight: "h-1.5", flameSize: 14, dotSize: "w-2 h-2", text: "text-xs" },
  md: { barWidth: "w-24", barHeight: "h-2", flameSize: 20, dotSize: "w-3 h-3", text: "text-xs" },
  lg: { barWidth: "w-32", barHeight: "h-2.5", flameSize: 24, dotSize: "w-4 h-4", text: "text-sm" },
} as const;

// Color mapping for intensity levels (cool → warm → hot)
const intensityColors = {
  1: "bg-blue-500",
  2: "bg-cyan-500",
  3: "bg-yellow-500",
  4: "bg-orange-500",
  5: "bg-red-600",
} as const;

const intensityLabels = {
  1: "Low",
  2: "Mild",
  3: "Moderate",
  4: "High",
  5: "Extreme",
} as const;

/**
 * Clamp intensity to 1-5 range
 */
function clampIntensity(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, Math.round(value))) as 1 | 2 | 3 | 4 | 5;
}

/**
 * Bar Variant: Custom progress bar with color gradient
 */
function BarVariant({
  intensity,
  showValue,
  size = "md",
}: {
  intensity: 1 | 2 | 3 | 4 | 5;
  showValue: boolean;
  size: "sm" | "md" | "lg";
}) {
  const percentage = (intensity / 5) * 100;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="flex items-center gap-2">
      <div className={sizeConfig.barWidth}>
        {/* Custom progress bar - HeroUI Progress not available in v3 beta yet */}
        <div 
          className={`${sizeConfig.barHeight} bg-[var(--color-surface-elevated)] rounded-full overflow-hidden`}
          role="progressbar"
          aria-valuenow={intensity}
          aria-valuemin={1}
          aria-valuemax={5}
        >
          <div
            className={`h-full transition-all duration-300 ${intensityColors[intensity]} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {showValue && (
        <div className="text-right">
          <span className={`${sizeConfig.text} font-semibold text-[var(--color-text-secondary)]`}>
            {intensity}/5
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Flames Variant: Visual flame indicators
 */
function FlamesVariant({
  intensity,
  showValue,
  size = "md",
}: {
  intensity: 1 | 2 | 3 | 4 | 5;
  showValue: boolean;
  size: "sm" | "md" | "lg";
}) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="transition-all duration-200"
            style={{
              opacity: level <= intensity ? 1 : 0.3,
            }}
          >
            <Flame
              size={sizeConfig.flameSize}
              className={
                level <= intensity
                  ? "text-orange-500 fill-orange-500"
                  : "text-gray-400"
              }
              aria-hidden={level > intensity}
            />
          </div>
        ))}
      </div>
      {showValue && (
        <span className={`${sizeConfig.text} font-semibold text-[var(--color-text-secondary)] ml-1`}>
          {intensity}/5
        </span>
      )}
    </div>
  );
}

/**
 * Heatmap Variant: Single colored indicator dot
 */
function HeatmapVariant({
  intensity,
  showValue,
  size = "md",
}: {
  intensity: 1 | 2 | 3 | 4 | 5;
  showValue: boolean;
  size: "sm" | "md" | "lg";
}) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeConfig.dotSize} rounded-full transition-all duration-200 ${intensityColors[intensity]} shadow-lg`}
        style={{
          boxShadow: `0 0 8px ${getIntensityGlowColor(intensity)}`,
        }}
        role="status"
        aria-label={`Intensity: ${intensityLabels[intensity]}`}
      />
      <div className="flex flex-col">
        <span className={`${sizeConfig.text} font-semibold text-[var(--color-text-secondary)]`}>
          {intensityLabels[intensity]}
        </span>
        {showValue && (
          <span className={`${sizeConfig.text} text-[var(--color-text-muted)]`}>
            {intensity}/5
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Get glow color for heatmap variant
 */
function getIntensityGlowColor(intensity: 1 | 2 | 3 | 4 | 5): string {
  const glows = {
    1: "rgba(59, 130, 246, 0.5)", // blue-500
    2: "rgba(34, 211, 238, 0.5)", // cyan-500
    3: "rgba(234, 179, 8, 0.5)", // yellow-500
    4: "rgba(249, 115, 22, 0.5)", // orange-500
    5: "rgba(220, 38, 38, 0.5)", // red-600
  };
  return glows[intensity];
}

/**
 * Main IntensityIndicator Component
 */
export function IntensityIndicator({
  intensity,
  variant = "bar",
  showValue = false,
  size = "md",
}: IntensityIndicatorProps) {
  const clampedIntensity = clampIntensity(intensity);

  switch (variant) {
    case "flames":
      return <FlamesVariant intensity={clampedIntensity} showValue={showValue} size={size} />;
    case "heatmap":
      return <HeatmapVariant intensity={clampedIntensity} showValue={showValue} size={size} />;
    case "bar":
    default:
      return <BarVariant intensity={clampedIntensity} showValue={showValue} size={size} />;
  }
}

/**
 * Export individual variants for direct use
 */
export const IntensityBar = React.memo(
  (props: Omit<IntensityIndicatorProps, "variant">) => (
    <IntensityIndicator {...props} variant="bar" />
  )
);

export const IntensityFlames = React.memo(
  (props: Omit<IntensityIndicatorProps, "variant">) => (
    <IntensityIndicator {...props} variant="flames" />
  )
);

export const IntensityHeatmap = React.memo(
  (props: Omit<IntensityIndicatorProps, "variant">) => (
    <IntensityIndicator {...props} variant="heatmap" />
  )
);
