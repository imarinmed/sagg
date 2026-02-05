"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EvolvingMetricsProps {
  metrics: {
    presencePercentage: number;
    averageIntensity: number;
    bondStrength: number;
    socialStanding: number;
  };
  previousMetrics?: {
    presencePercentage: number;
    averageIntensity: number;
    bondStrength: number;
    socialStanding: number;
  };
  isAnimating?: boolean;
  className?: string;
}

export function EvolvingMetrics({
  metrics,
  previousMetrics,
  isAnimating = false,
  className = "",
}: EvolvingMetricsProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <MetricCard
        label="Presence"
        value={metrics.presencePercentage}
        previousValue={previousMetrics?.presencePercentage}
        unit="%"
        isAnimating={isAnimating}
      />
      <MetricCard
        label="Intensity"
        value={metrics.averageIntensity}
        previousValue={previousMetrics?.averageIntensity}
        max={5}
        isAnimating={isAnimating}
      />
      <MetricCard
        label="Bond"
        value={metrics.bondStrength}
        previousValue={previousMetrics?.bondStrength}
        unit="%"
        isAnimating={isAnimating}
      />
      <MetricCard
        label="Standing"
        value={metrics.socialStanding}
        previousValue={previousMetrics?.socialStanding}
        unit="%"
        isAnimating={isAnimating}
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  max?: number;
  isAnimating: boolean;
}

function MetricCard({
  label,
  value,
  previousValue,
  unit = "",
  max = 100,
  isAnimating,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const trend = previousValue !== undefined ? value - previousValue : 0;

  useEffect(() => {
    if (!isAnimating) {
      setDisplayValue(value);
      return;
    }

    const startValue = previousValue ?? value;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, previousValue, isAnimating]);

  const percentage = max === 100 ? value : (value / max) * 100;

  return (
    <div className="bg-white/5 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        {trend !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
          </motion.div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold">
          {displayValue.toFixed(unit ? 0 : 1)}
        </span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>

      <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #4a5568, ${getColorForValue(percentage)})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function getColorForValue(value: number): string {
  if (value < 30) return "#4a5568";
  if (value < 60) return "#d69e2e";
  if (value < 80) return "#c53030";
  return "#c9a227";
}
