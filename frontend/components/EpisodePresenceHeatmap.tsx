"use client";

import React from "react";
import { Tooltip } from "@heroui/react";
import Link from "next/link";

interface EpisodePresence {
  episode_id: string;
  intensity: number;
  screen_time: number;
  moment_count: number;
}

interface EpisodePresenceHeatmapProps {
  characterId: string;
  characterName: string;
  episodes: EpisodePresence[];
  onEpisodeClick?: (episodeId: string) => void;
}

function formatScreenTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getIntensityColor(intensity: number): string {
  // Color gradient from cool (low presence) to warm (high presence)
  const colors = {
    0: "rgba(75, 85, 99, 0.2)",      // Gray - no presence
    1: "rgba(59, 130, 246, 0.4)",    // Blue - minimal
    2: "rgba(34, 197, 94, 0.5)",     // Green - low
    3: "rgba(234, 179, 8, 0.6)",     // Yellow - moderate
    4: "rgba(249, 115, 22, 0.7)",    // Orange - high
    5: "rgba(220, 38, 38, 0.8)",     // Red - intense
  };
  return colors[intensity as keyof typeof colors] || colors[0];
}

function getIntensityBorder(intensity: number): string {
  const borders = {
    0: "border-gray-600/30",
    1: "border-blue-500/50",
    2: "border-green-500/50",
    3: "border-yellow-500/50",
    4: "border-orange-500/50",
    5: "border-red-500/50",
  };
  return borders[intensity as keyof typeof borders] || borders[0];
}

export function EpisodePresenceHeatmap({
  characterId,
  characterName,
  episodes,
  onEpisodeClick,
}: EpisodePresenceHeatmapProps) {
  // Calculate stats
  const totalScreenTime = episodes.reduce((sum, ep) => sum + ep.screen_time, 0);
  const totalMoments = episodes.reduce((sum, ep) => sum + ep.moment_count, 0);
  const maxScreenTime = Math.max(...episodes.map((ep) => ep.screen_time));
  const avgIntensity = episodes.length > 0
    ? Math.round(episodes.reduce((sum, ep) => sum + ep.intensity, 0) / episodes.length)
    : 0;

  if (episodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[var(--color-text-muted)]">
        No episode presence data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] text-center">
          <p className="text-2xl font-bold text-[#D4AF37]">{episodes.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Episodes
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] text-center">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {formatScreenTime(totalScreenTime)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Screen Time
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] text-center">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {totalMoments}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Key Moments
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div>
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          Episode Presence Heatmap
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {episodes.map((episode) => {
            const sizeRatio = maxScreenTime > 0 ? episode.screen_time / maxScreenTime : 0;
            
            return (
              <Tooltip key={episode.episode_id} delay={0}>
                <Tooltip.Trigger aria-label={`${episode.episode_id} presence`}>
                  <Link
                    href={`/episodes/${episode.episode_id}`}
                    onClick={(e) => {
                      if (onEpisodeClick) {
                        e.preventDefault();
                        onEpisodeClick(episode.episode_id);
                      }
                    }}
                  >
                    <div
                      className={`relative aspect-square rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center p-2 ${getIntensityBorder(
                        episode.intensity
                      )}`}
                      style={{
                        backgroundColor: getIntensityColor(episode.intensity),
                      }}
                    >
                      {/* Episode label */}
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {episode.episode_id.slice(-2).toUpperCase()}
                      </span>
                      
                      {/* Screen time bar */}
                      <div className="absolute bottom-1 left-1 right-1 h-1 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/80 rounded-full transition-all duration-300"
                          style={{ width: `${sizeRatio * 100}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <div className="p-2 space-y-1">
                    <p className="font-semibold">
                      Episode {episode.episode_id.slice(-2)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Screen time: {formatScreenTime(episode.screen_time)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Moments: {episode.moment_count}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Intensity: {episode.intensity}/5
                    </p>
                  </div>
                </Tooltip.Content>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">Presence Intensity:</span>
        <div className="flex items-center gap-1">
          <span className="text-[var(--color-text-muted)]">Low</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getIntensityColor(level) }}
              />
            ))}
          </div>
          <span className="text-[var(--color-text-muted)]">High</span>
        </div>
      </div>

      {/* Screen Time Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          Screen Time by Episode
        </h4>
        <div className="space-y-2">
          {episodes.map((episode) => {
            const widthPercent = maxScreenTime > 0 
              ? (episode.screen_time / maxScreenTime) * 100 
              : 0;
            
            return (
              <div key={episode.episode_id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-[var(--color-text-muted)] w-8">
                  {episode.episode_id.slice(-2).toUpperCase()}
                </span>
                <div className="flex-1 h-6 bg-[var(--color-surface-elevated)] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: getIntensityColor(episode.intensity),
                      minWidth: episode.screen_time > 0 ? "40px" : "0",
                    }}
                  >
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {formatScreenTime(episode.screen_time)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
