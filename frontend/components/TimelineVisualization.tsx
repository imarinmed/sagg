"use client";

import React, { useMemo, useCallback } from "react";
import { VideoMoment, NarrativeBeats } from "@/lib/api";
import { Tooltip } from "@heroui/react";

interface TimelineVisualizationProps {
  moments: VideoMoment[];
  durationSeconds: number;
  onMomentClick?: (moment: VideoMoment) => void;
  selectedTimestamp?: number;
  height?: number;
  narrativeBeats?: NarrativeBeats;
}

const CONTENT_TYPE_COLORS: Record<string, string> = {
  dance: "#D4AF37",
  training: "#C5A059",
  physical_intimacy: "#8B0000",
  vampire_feeding: "#4a0404",
  confrontation: "#722F37",
  party: "#B76E79",
  dialogue: "#808080",
  transformation: "#4a0404",
  romantic_tension: "#B76E79",
};

const INTENSITY_COLORS = [
  "#22c55e",
  "#4ade80",
  "#f59e0b",
  "#f87171",
  "#dc2626",
];

const NARRATIVE_BEAT_COLORS: Record<string, string> = {
  inciting_incident: "#D4AF37",
  climax: "#8B0000",
  resolution: "#4a5568",
};

export function TimelineVisualization({
  moments,
  durationSeconds,
  onMomentClick,
  selectedTimestamp,
  height = 120,
  narrativeBeats,
}: TimelineVisualizationProps) {
  const width = 100;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const momentsWithScreenshots = useMemo(
    () => moments.filter((m) => m.screenshot_path),
    [moments]
  );

  const intensityPath = useMemo(() => {
    if (moments.length === 0) return "";

    const points = moments.map((m) => ({
      x: (m.timestamp_seconds / durationSeconds) * chartWidth + padding.left,
      y: padding.top + chartHeight - ((m.intensity - 1) / 4) * chartHeight,
    }));

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  }, [moments, durationSeconds, chartWidth, chartHeight, padding]);

  const gradientPath = useMemo(() => {
    if (!intensityPath) return "";
    const lastPoint = moments[moments.length - 1];
    const lastX =
      (lastPoint.timestamp_seconds / durationSeconds) * chartWidth +
      padding.left;
    return `${intensityPath} L ${lastX} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  }, [intensityPath, moments, durationSeconds, chartWidth, chartHeight, padding]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const timeMarkers = useMemo(() => {
    const markers = [];
    const interval = durationSeconds > 600 ? 120 : 60;
    for (let t = 0; t <= durationSeconds; t += interval) {
      markers.push({
        time: t,
        x: (t / durationSeconds) * chartWidth + padding.left,
        label: formatTime(t),
      });
    }
    return markers;
  }, [durationSeconds, chartWidth, padding.left, formatTime]);

  const narrativeBeatMarkers = useMemo(() => {
    if (!narrativeBeats) return [];
    const markers = [];
    
    if (narrativeBeats.inciting_incident_seconds != null) {
      markers.push({
        key: "inciting_incident",
        x: (narrativeBeats.inciting_incident_seconds / durationSeconds) * chartWidth + padding.left,
        label: "Inciting Incident",
        shortLabel: "II",
        color: NARRATIVE_BEAT_COLORS.inciting_incident,
        timestamp: narrativeBeats.inciting_incident,
      });
    }
    
    if (narrativeBeats.climax_seconds != null) {
      markers.push({
        key: "climax",
        x: (narrativeBeats.climax_seconds / durationSeconds) * chartWidth + padding.left,
        label: "Climax",
        shortLabel: "C",
        color: NARRATIVE_BEAT_COLORS.climax,
        timestamp: narrativeBeats.climax,
      });
    }
    
    if (narrativeBeats.resolution_seconds != null) {
      markers.push({
        key: "resolution",
        x: (narrativeBeats.resolution_seconds / durationSeconds) * chartWidth + padding.left,
        label: "Resolution",
        shortLabel: "R",
        color: NARRATIVE_BEAT_COLORS.resolution,
        timestamp: narrativeBeats.resolution,
      });
    }
    
    return markers;
  }, [narrativeBeats, durationSeconds, chartWidth, padding.left]);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="intensityGradient"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent-primary)" />
            <stop offset="100%" stopColor="var(--color-accent-secondary)" />
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

        {[1, 2, 3, 4, 5].map((level) => {
          const y =
            padding.top + chartHeight - ((level - 1) / 4) * chartHeight;
          return (
            <g key={level}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="var(--color-border-subtle)"
                strokeWidth="0.2"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 3}
                y={y + 1}
                fill="var(--color-text-muted)"
                fontSize="3"
                textAnchor="end"
              >
                {level}
              </text>
            </g>
          );
        })}

        {gradientPath && (
          <path d={gradientPath} fill="url(#intensityGradient)" />
        )}

        {intensityPath && (
          <path
            d={intensityPath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {momentsWithScreenshots.map((moment, idx) => {
          const x =
            (moment.timestamp_seconds / durationSeconds) * chartWidth +
            padding.left;
          const y =
            padding.top +
            chartHeight -
            ((moment.intensity - 1) / 4) * chartHeight;
          const color =
            CONTENT_TYPE_COLORS[moment.content_type] || CONTENT_TYPE_COLORS.dialogue;
          const isSelected =
            selectedTimestamp !== undefined &&
            Math.abs(moment.timestamp_seconds - selectedTimestamp) < 1;

          return (
            <g
              key={`${moment.timestamp_seconds}-${idx}`}
              onClick={() => onMomentClick?.(moment)}
              className="cursor-pointer"
              style={{ pointerEvents: "all" }}
            >
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 3 : 2}
                fill={color}
                stroke={isSelected ? "var(--color-text-primary)" : "none"}
                strokeWidth="0.5"
              />
              <title>
                {moment.timestamp} - {moment.content_type} (Intensity:{" "}
                {moment.intensity})
              </title>
            </g>
          );
        })}

        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="var(--color-border)"
          strokeWidth="0.3"
        />

        {timeMarkers.map((marker) => (
          <g key={marker.time}>
            <line
              x1={marker.x}
              y1={padding.top + chartHeight}
              x2={marker.x}
              y2={padding.top + chartHeight + 3}
              stroke="var(--color-border)"
              strokeWidth="0.3"
            />
            <text
              x={marker.x}
              y={padding.top + chartHeight + 8}
              fill="var(--color-text-muted)"
              fontSize="3"
              textAnchor="middle"
            >
              {marker.label}
            </text>
          </g>
        ))}

        {narrativeBeatMarkers.map((marker) => (
          <g key={marker.key}>
            <line
              x1={marker.x}
              y1={padding.top}
              x2={marker.x}
              y2={padding.top + chartHeight}
              stroke={marker.color}
              strokeWidth="0.5"
              strokeDasharray="2,1"
              opacity="0.8"
            />
            <circle
              cx={marker.x}
              cy={padding.top - 3}
              r="2.5"
              fill={marker.color}
            />
            <text
              x={marker.x}
              y={padding.top - 3}
              fill="var(--color-text-primary)"
              fontSize="2"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
            >
              {marker.shortLabel}
            </text>
            <title>{marker.label}: {marker.timestamp}</title>
          </g>
        ))}

        <text
          x={padding.left - 8}
          y={padding.top + chartHeight / 2}
          fill="var(--color-text-secondary)"
          fontSize="3"
          textAnchor="middle"
          transform={`rotate(-90, ${padding.left - 8}, ${padding.top + chartHeight / 2})`}
        >
          Intensity
        </text>
      </svg>

      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {Object.entries(CONTENT_TYPE_COLORS)
          .filter(([type]) =>
            moments.some((m) => m.content_type === type)
          )
          .map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[var(--color-text-muted)] capitalize">
                {type.replace("_", " ")}
              </span>
            </div>
          ))}
      </div>
      
      {narrativeBeatMarkers.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-[var(--color-border-subtle)] justify-center">
          <span className="text-xs text-[var(--color-text-muted)] font-medium">Narrative Beats:</span>
          {narrativeBeatMarkers.map((marker) => (
            <div key={marker.key} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: marker.color, color: 'white' }}
              >
                {marker.shortLabel}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {marker.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
