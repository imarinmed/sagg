"use client";

import React from "react";
import { Avatar, Tooltip } from "@heroui/react";
import Link from "next/link";

interface PresenceEntry {
  character_id: string;
  character_name: string;
  first_appearance_timestamp: string;
  last_appearance_timestamp: string;
  total_screen_time_seconds: number;
  importance_rating: number;
  moment_count: number;
}

interface CharacterPresenceTimelineProps {
  presences: PresenceEntry[];
  episodeDuration: number;
}

const IMPORTANCE_COLORS = {
  1: "#4a5568",
  2: "#718096",
  3: "#D4AF37",
  4: "#C5A059",
  5: "#8B0000",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function parseTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parts[0] * 60 + parts[1];
}

export function CharacterPresenceTimeline({
  presences,
  episodeDuration,
}: CharacterPresenceTimelineProps) {
  const sortedPresences = [...presences].sort(
    (a, b) =>
      parseTimestampToSeconds(a.first_appearance_timestamp) -
      parseTimestampToSeconds(b.first_appearance_timestamp)
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Character Appearances
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {sortedPresences.length} characters
        </span>
      </div>

      <div className="relative">
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
          <span>00:00</span>
          <span>{formatDuration(episodeDuration / 2)}</span>
          <span>{formatDuration(episodeDuration)}</span>
        </div>

        <div className="relative h-2 bg-[var(--color-surface-elevated)] rounded-full mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent rounded-full" />
        </div>

        <div className="space-y-3">
          {sortedPresences.map((presence) => {
            const startSeconds = parseTimestampToSeconds(
              presence.first_appearance_timestamp
            );
            const endSeconds = parseTimestampToSeconds(
              presence.last_appearance_timestamp
            );
            const startPercent = (startSeconds / episodeDuration) * 100;
            const widthPercent =
              ((endSeconds - startSeconds) / episodeDuration) * 100;
            const color =
              IMPORTANCE_COLORS[
                presence.importance_rating as keyof typeof IMPORTANCE_COLORS
              ];

            return (
              <Tooltip key={presence.character_id} delay={0}>
                <Tooltip.Trigger aria-label={`${presence.character_name} presence timeline`}>
                  <Link
                    href={`/characters/${presence.character_id}`}
                    className="flex items-center gap-3 group w-full"
                  >
                    <Avatar
                      size="sm"
                      className="bg-[var(--color-surface-elevated)]"
                    >
                      <Avatar.Fallback className="text-[var(--color-text-secondary)]">
                        {presence.character_name.charAt(0)}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex-1 relative h-8 bg-[var(--color-surface)] rounded-lg overflow-hidden">
                      <div
                        className="absolute h-full rounded-lg transition-all duration-300 group-hover:brightness-110"
                        style={{
                          left: `${startPercent}%`,
                          width: `${Math.max(widthPercent, 2)}%`,
                          backgroundColor: color,
                          opacity: 0.7,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                      </div>

                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-text-secondary)] z-10">
                        {presence.character_name}
                      </span>
                    </div>
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <div className="p-2 space-y-1">
                    <p className="font-semibold">{presence.character_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Screen time: {formatDuration(presence.total_screen_time_seconds)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Moments: {presence.moment_count}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Importance: {presence.importance_rating}/5
                    </p>
                  </div>
                </Tooltip.Content>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-muted)]">Importance:</span>
        {Object.entries(IMPORTANCE_COLORS).map(([level, color]) => (
          <div key={level} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--color-text-muted)]">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
