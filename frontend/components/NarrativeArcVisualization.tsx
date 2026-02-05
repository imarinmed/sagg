"use client";

import React, { useMemo } from "react";
import { NarrativeBeats } from "@/lib/api";

interface NarrativeArcVisualizationProps {
  narrativeBeats: NarrativeBeats;
  durationSeconds: number;
}

const BEAT_COLORS = {
  inciting_incident: "#D4AF37",
  rising_action: "#C5A059",
  climax: "#8B0000",
  falling_action: "#722F37",
  resolution: "#4a5568",
};

const BEAT_LABELS = {
  inciting_incident: "Inciting Incident",
  rising_action_start: "Rising Action",
  climax: "Climax",
  falling_action_start: "Falling Action",
  resolution: "Resolution",
};

export function NarrativeArcVisualization({
  narrativeBeats,
  durationSeconds,
}: NarrativeArcVisualizationProps) {
  const width = 100;
  const height = 60;
  const padding = { top: 15, right: 8, bottom: 20, left: 8 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const arcPath = useMemo(() => {
    const points = [
      { x: 0, y: chartHeight },
      { x: chartWidth * 0.2, y: chartHeight * 0.7 },
      { x: chartWidth * 0.5, y: chartHeight * 0.3 },
      { x: chartWidth * 0.75, y: 0 },
      { x: chartWidth * 0.85, y: chartHeight * 0.4 },
      { x: chartWidth, y: chartHeight * 0.8 },
    ];

    const adjustedPoints = points.map((p) => ({
      x: p.x + padding.left,
      y: p.y + padding.top,
    }));

    let path = `M ${adjustedPoints[0].x} ${adjustedPoints[0].y}`;
    for (let i = 1; i < adjustedPoints.length; i++) {
      const prev = adjustedPoints[i - 1];
      const curr = adjustedPoints[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  }, [chartWidth, chartHeight, padding]);

  const beatMarkers = useMemo(() => {
    const markers = [];

    if (narrativeBeats.inciting_incident_seconds != null) {
      const x =
        (narrativeBeats.inciting_incident_seconds / durationSeconds) * chartWidth +
        padding.left;
      markers.push({
        key: "inciting_incident",
        x,
        y: padding.top + chartHeight * 0.7,
        label: "Inciting Incident",
        color: BEAT_COLORS.inciting_incident,
        timestamp: narrativeBeats.inciting_incident,
      });
    }

    if (narrativeBeats.climax_seconds != null) {
      const x =
        (narrativeBeats.climax_seconds / durationSeconds) * chartWidth +
        padding.left;
      markers.push({
        key: "climax",
        x,
        y: padding.top,
        label: "Climax",
        color: BEAT_COLORS.climax,
        timestamp: narrativeBeats.climax,
      });
    }

    if (narrativeBeats.resolution_seconds != null) {
      const x =
        (narrativeBeats.resolution_seconds / durationSeconds) * chartWidth +
        padding.left;
      markers.push({
        key: "resolution",
        x,
        y: padding.top + chartHeight * 0.8,
        label: "Resolution",
        color: BEAT_COLORS.resolution,
        timestamp: narrativeBeats.resolution,
      });
    }

    return markers;
  }, [narrativeBeats, durationSeconds, chartWidth, chartHeight, padding]);

  const actDividers = useMemo(() => {
    const dividers = [];

    if (narrativeBeats.act_1_end_seconds != null) {
      const x =
        (narrativeBeats.act_1_end_seconds / durationSeconds) * chartWidth +
        padding.left;
      dividers.push({ x, label: "Act I" });
    }

    if (narrativeBeats.act_2_end_seconds != null) {
      const x =
        (narrativeBeats.act_2_end_seconds / durationSeconds) * chartWidth +
        padding.left;
      dividers.push({ x, label: "Act II" });
    }

    return dividers;
  }, [narrativeBeats, durationSeconds, chartWidth, padding]);

  const confidencePercent = Math.round(narrativeBeats.confidence * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Episode Arc
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            confidencePercent >= 70
              ? "bg-green-900/30 text-green-400"
              : confidencePercent >= 40
                ? "bg-yellow-900/30 text-yellow-400"
                : "bg-red-900/30 text-red-400"
          }`}
        >
          {confidencePercent}% confidence
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={BEAT_COLORS.inciting_incident} />
            <stop offset="50%" stopColor={BEAT_COLORS.climax} />
            <stop offset="100%" stopColor={BEAT_COLORS.resolution} />
          </linearGradient>
        </defs>

        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="var(--color-surface)"
          rx="2"
        />

        {actDividers.map((divider, idx) => (
          <g key={idx}>
            <line
              x1={divider.x}
              y1={padding.top}
              x2={divider.x}
              y2={padding.top + chartHeight}
              stroke="var(--color-border)"
              strokeWidth="0.3"
              strokeDasharray="2,2"
            />
            <text
              x={
                idx === 0
                  ? padding.left + (divider.x - padding.left) / 2
                  : actDividers[idx - 1]
                    ? actDividers[idx - 1].x +
                      (divider.x - actDividers[idx - 1].x) / 2
                    : divider.x - 10
              }
              y={padding.top + chartHeight + 6}
              fill="var(--color-text-muted)"
              fontSize="3"
              textAnchor="middle"
            >
              {divider.label}
            </text>
          </g>
        ))}

        {actDividers.length > 0 && (
          <text
            x={
              actDividers[actDividers.length - 1].x +
              (padding.left + chartWidth - actDividers[actDividers.length - 1].x) / 2
            }
            y={padding.top + chartHeight + 6}
            fill="var(--color-text-muted)"
            fontSize="3"
            textAnchor="middle"
          >
            Act III
          </text>
        )}

        <path
          d={arcPath}
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {beatMarkers.map((marker) => (
          <g key={marker.key}>
            <circle
              cx={marker.x}
              cy={marker.y}
              r={2.5}
              fill={marker.color}
              stroke="var(--color-text-primary)"
              strokeWidth="0.3"
            />
            <text
              x={marker.x}
              y={marker.y - 4}
              fill={marker.color}
              fontSize="2.5"
              textAnchor="middle"
              fontWeight="bold"
            >
              {marker.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {beatMarkers.map((marker) => (
          <div key={marker.key} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: marker.color }}
            />
            <span className="text-xs text-[var(--color-text-muted)]">
              {marker.label}: {marker.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
