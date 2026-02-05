"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types based on temporal_index.json structure
interface Scene {
  scene_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  moments: string[];
  characters_present: string[];
  intensity: {
    erotic: number;
    horror: number;
    drama: number;
  };
  tags: string[];
  has_branches: boolean;
}

interface Episode {
  episode_id: string;
  title: string;
  title_en: string;
  episode_number: number;
  air_date: string | null;
  scenes: Scene[];
  cumulative_intensity: {
    erotic: number;
    horror: number;
    drama: number;
  };
}

interface Season {
  season_id: string;
  season_number: number;
  episodes: Episode[];
}

interface TemporalIndex {
  version: string;
  total_episodes: number;
  total_scenes: number;
  total_moments: number;
  seasons: Season[];
}

interface TemporalNavigatorProps {
  data: TemporalIndex;
  className?: string;
}

type ViewMode = "episodes" | "scenes";
type IntensityType = "erotic" | "horror" | "drama";

const intensityColors: Record<IntensityType, string> = {
  erotic: "#ff6b9d",
  horror: "#8b0000",
  drama: "#d4af37",
};

const intensityLabels: Record<IntensityType, string> = {
  erotic: "Erotic",
  horror: "Horror",
  drama: "Drama",
};

export function TemporalNavigator({ data, className = "" }: TemporalNavigatorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("episodes");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityType | null>(null);
  const [hoveredEpisode, setHoveredEpisode] = useState<string | null>(null);

  // Get all unique characters across all episodes
  const allCharacters = useMemo(() => {
    const characters = new Set<string>();
    data.seasons.forEach((season) => {
      season.episodes.forEach((episode) => {
        episode.scenes.forEach((scene) => {
          scene.characters_present.forEach((char) => characters.add(char));
        });
      });
    });
    return Array.from(characters).sort();
  }, [data]);

  // Calculate total duration for scaling
  const totalDuration = useMemo(() => {
    return data.seasons.reduce((total, season) => {
      return (
        total +
        season.episodes.reduce((epTotal, episode) => {
          return (
            epTotal +
            episode.scenes.reduce((scTotal, scene) => scTotal + scene.duration_seconds, 0)
          );
        }, 0)
      );
    }, 0);
  }, [data]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format character ID for display
  const formatCharacterName = (id: string): string => {
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-primary)" }}
          >
            Temporal Navigator
          </h2>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <span>{data.total_episodes} Episodes</span>
            <span>•</span>
            <span>{data.total_scenes} Scenes</span>
            <span>•</span>
            <span>{data.total_moments} Moments</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg glass">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>View:</span>
            <div className="flex rounded-md overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
              <button
                onClick={() => setViewMode("episodes")}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === "episodes"
                    ? "text-white"
                    : "hover:bg-white/5"
                }`}
                style={{
                  backgroundColor: viewMode === "episodes" ? "var(--color-accent-primary)" : "transparent",
                }}
              >
                Episodes
              </button>
              <button
                onClick={() => setViewMode("scenes")}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === "scenes"
                    ? "text-white"
                    : "hover:bg-white/5"
                }`}
                style={{
                  backgroundColor: viewMode === "scenes" ? "var(--color-accent-primary)" : "transparent",
                }}
              >
                Scenes
              </button>
            </div>
          </div>

          {/* Character Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Character:</span>
            <select
              value={selectedCharacter || ""}
              onChange={(e) => setSelectedCharacter(e.target.value || null)}
              className="px-3 py-1.5 text-sm rounded-md bg-black/30 border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            >
              <option value="">All Characters</option>
              {allCharacters.map((char) => (
                <option key={char} value={char}>
                  {formatCharacterName(char)}
                </option>
              ))}
            </select>
          </div>

          {/* Intensity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Intensity:</span>
            <div className="flex gap-1">
              {(Object.keys(intensityColors) as IntensityType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedIntensity(selectedIntensity === type ? null : type)}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    selectedIntensity === type ? "ring-1" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: intensityColors[type] + "30",
                    color: intensityColors[type],
                    boxShadow: selectedIntensity === type ? `0 0 0 1px ${intensityColors[type]}` : 'none',
                  }}
                  title={intensityLabels[type]}
                >
                  {type.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {data.seasons.map((season) => (
          <div key={season.season_id} className="space-y-3">
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-secondary)" }}
            >
              Season {season.season_number}
            </h3>

            <div className="space-y-2">
              {season.episodes.map((episode, epIndex) => {
                const episodeDuration = episode.scenes.reduce(
                  (total, scene) => total + scene.duration_seconds,
                  0
                );
                const episodeWidth = (episodeDuration / totalDuration) * 100;

                return (
                  <motion.div
                    key={episode.episode_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: epIndex * 0.05 }}
                    className="relative"
                    onMouseEnter={() => setHoveredEpisode(episode.episode_id)}
                    onMouseLeave={() => setHoveredEpisode(null)}
                  >
                    {/* Episode Bar */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 text-sm font-medium shrink-0"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        EP{episode.episode_number}
                      </div>

                      <div className="flex-1 relative">
                        {/* Episode Container */}
                        <div
                          className="relative h-12 rounded-md overflow-hidden cursor-pointer transition-all hover:brightness-110"
                          style={{
                            width: `${episodeWidth}%`,
                            minWidth: "100px",
                            background: `linear-gradient(90deg, var(--color-bg-tertiary), var(--color-bg-secondary))`,
                            border: `1px solid ${hoveredEpisode === episode.episode_id ? "var(--color-accent-primary)" : "var(--color-border)"}`,
                          }}
                        >
                          {/* Scene Segments */}
                          {viewMode === "scenes" &&
                            episode.scenes.map((scene, sceneIndex) => {
                              const sceneWidth = (scene.duration_seconds / episodeDuration) * 100;
                              const isCharacterPresent =
                                !selectedCharacter ||
                                scene.characters_present.includes(selectedCharacter);
                              const intensityValue = selectedIntensity
                                ? scene.intensity[selectedIntensity]
                                : Math.max(
                                    scene.intensity.erotic,
                                    scene.intensity.horror,
                                    scene.intensity.drama
                                  );

                              return (
                                <motion.div
                                  key={scene.scene_id}
                                  className="absolute top-0 h-full border-r border-black/20"
                                  style={{
                                    left: `${
                                      (episode.scenes
                                        .slice(0, sceneIndex)
                                        .reduce((sum, s) => sum + s.duration_seconds, 0) /
                                        episodeDuration) *
                                      100
                                    }%`,
                                    width: `${sceneWidth}%`,
                                    backgroundColor: selectedIntensity
                                      ? intensityColors[selectedIntensity]
                                      : `rgba(212, 175, 55, ${intensityValue})`,
                                    opacity: isCharacterPresent ? 1 : 0.2,
                                  }}
                                  title={`Scene ${sceneIndex + 1}: ${formatTime(
                                    scene.duration_seconds
                                  )}`}
                                  whileHover={{ opacity: 0.8 }}
                                />
                              );
                            })}

                          {/* Episode Overview (when in episodes mode) */}
                          {viewMode === "episodes" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-xs truncate px-2"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                {episode.title_en}
                              </span>
                            </div>
                          )}

                          {/* Intensity Overlay */}
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id={`gradient-${episode.episode_id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                              </linearGradient>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#gradient-${episode.episode_id})`} />
                          </svg>
                        </div>

                        {/* Episode Info */}
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                          <span>{formatTime(episodeDuration)}</span>
                          <span>•</span>
                          <span>{episode.scenes.length} scenes</span>
                          {hoveredEpisode === episode.episode_id && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs"
                              style={{ color: "var(--color-accent-primary)" }}
                            >
                              {episode.title}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Character Presence (when character selected) */}
                    <AnimatePresence>
                      {selectedCharacter && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-16 mt-2 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${episodeWidth}%`,
                                minWidth: "100px",
                                backgroundColor: "var(--color-bg-tertiary)",
                              }}
                            >
                              {episode.scenes.map((scene, sceneIndex) => {
                                const sceneWidth = (scene.duration_seconds / episodeDuration) * 100;
                                const isPresent = scene.characters_present.includes(selectedCharacter);

                                return (
                                  <div
                                    key={scene.scene_id}
                                    className="absolute h-full rounded-full"
                                    style={{
                                      left: `${
                                        (episode.scenes
                                          .slice(0, sceneIndex)
                                          .reduce((sum, s) => sum + s.duration_seconds, 0) /
                                          episodeDuration) *
                                        100
                                      }%`,
                                      width: `${sceneWidth}%`,
                                      backgroundColor: isPresent
                                        ? "var(--color-accent-primary)"
                                        : "transparent",
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                              {formatCharacterName(selectedCharacter)}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 rounded-lg glass">
        <h4
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Intensity Legend
        </h4>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(intensityColors) as IntensityType[]).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: intensityColors[type] }}
              />
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {intensityLabels[type]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemporalNavigator;
