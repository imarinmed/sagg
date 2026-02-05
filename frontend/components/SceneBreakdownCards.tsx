"use client";

import React, { useRef } from "react";
import { Card, Avatar, ScrollShadow } from "@heroui/react";
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface Scene {
  scene_id: string;
  start_timestamp: string;
  end_timestamp: string;
  start_seconds: number;
  end_seconds: number;
  location?: string;
  characters: string[];
  content_summary: string;
  moments_count: number;
}

interface SceneBreakdownCardsProps {
  scenes: Scene[];
  activeSceneId?: string | null;
  onSceneClick?: (scene: Scene) => void;
  characterNames?: Record<string, string>;
}

export function SceneBreakdownCards({
  scenes,
  activeSceneId,
  onSceneClick,
  characterNames = {},
}: SceneBreakdownCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatDuration = (start: number, end: number): string => {
    const duration = end - start;
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all -translate-x-1/2"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all translate-x-1/2"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <ScrollShadow
        ref={scrollRef}
        orientation="horizontal"
        className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {scenes.map((scene, index) => {
          const isActive = activeSceneId === scene.scene_id;
          const duration = formatDuration(scene.start_seconds, scene.end_seconds);

          return (
            <Card
              key={scene.scene_id}
              className={`min-w-[280px] max-w-[280px] snap-start transition-all duration-300 cursor-pointer ${
                isActive
                  ? "ring-2 ring-[#D4AF37] scale-[1.02]"
                  : "hover:scale-[1.01]"
              }`}
              onClick={() => onSceneClick?.(scene)}
            >
              <Card.Content className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    Scene {index + 1}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Clock className="w-3 h-3" />
                    <span>{duration}</span>
                  </div>
                </div>

                {scene.location && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span className="truncate">{scene.location}</span>
                  </div>
                )}

                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                  {scene.content_summary}
                </p>

                {scene.characters.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <div className="flex -space-x-2">
                      {scene.characters.slice(0, 4).map((charId) => (
                        <Avatar
                          key={charId}
                          size="sm"
                          className="ring-2 ring-[var(--color-surface)] bg-[var(--color-surface-elevated)]"
                        >
                          <Avatar.Fallback className="text-[var(--color-text-secondary)] text-xs">
                            {(characterNames[charId] || charId).charAt(0).toUpperCase()}
                          </Avatar.Fallback>
                        </Avatar>
                      ))}
                      {scene.characters.length > 4 && (
                        <Avatar
                          size="sm"
                          className="ring-2 ring-[var(--color-surface)] bg-[var(--color-surface-elevated)]"
                        >
                          <Avatar.Fallback className="text-[var(--color-text-secondary)] text-xs">
                            +{scene.characters.length - 4}
                          </Avatar.Fallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-[var(--color-text-muted)]">
                  {scene.start_timestamp} - {scene.end_timestamp}
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollShadow>

      <div className="flex justify-center gap-1 mt-4">
        {scenes.map((scene) => (
          <div
            key={scene.scene_id}
            className={`w-2 h-2 rounded-full transition-all ${
              activeSceneId === scene.scene_id
                ? "bg-[#D4AF37] w-6"
                : "bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
