"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface EpisodeTimelineProps {
  episodes: { id: string; title: string }[];
  currentEpisode: string;
  onEpisodeChange: (episode: string) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function EpisodeTimeline({
  episodes,
  currentEpisode,
  onEpisodeChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
}: EpisodeTimelineProps) {
  const [isDragging, setIsDragging] = useState(false);

  const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        const prevIndex = Math.max(0, currentIndex - 1);
        onEpisodeChange(episodes[prevIndex].id);
      } else if (e.key === "ArrowRight") {
        const nextIndex = Math.min(episodes.length - 1, currentIndex + 1);
        onEpisodeChange(episodes[nextIndex].id);
      } else if (e.key === " ") {
        e.preventDefault();
        onPlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, episodes, onEpisodeChange, onPlayPause]);

  const handleScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const index = Math.floor(percentage * episodes.length);
      const clampedIndex = Math.max(0, Math.min(episodes.length - 1, index));
      onEpisodeChange(episodes[clampedIndex].id);
    },
    [episodes, onEpisodeChange]
  );

  return (
    <div className="w-full bg-black/40 backdrop-blur-md rounded-lg p-4 border border-white/10">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const prevIndex = Math.max(0, currentIndex - 1);
              onEpisodeChange(episodes[prevIndex].id);
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ◀◀
          </button>
          <button
            onClick={onPlayPause}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            onClick={() => {
              const nextIndex = Math.min(episodes.length - 1, currentIndex + 1);
              onEpisodeChange(episodes[nextIndex].id);
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ▶▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-white/10 rounded px-2 py-1 text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div
        className="relative h-12 bg-white/5 rounded-lg cursor-pointer overflow-hidden"
        onClick={handleScrub}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Episode markers */}
        <div className="absolute inset-0 flex">
          {episodes.map((ep, index) => (
            <div
              key={ep.id}
              className={`flex-1 border-r border-white/10 flex items-center justify-center text-xs ${
                index === currentIndex
                  ? "bg-white/20 text-white"
                  : "text-gray-500"
              }`}
            >
              {ep.id}
            </div>
          ))}
        </div>

        {/* Current position indicator */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-amber-500"
          animate={{
            left: `${((currentIndex + 0.5) / episodes.length) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Current episode info */}
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-400">
          {currentEpisode} - {episodes[currentIndex]?.title || "Unknown"}
        </span>
      </div>
    </div>
  );
}
