"use client";

import React from "react";
import Image from "next/image";
import { Chip, Tooltip } from "@heroui/react";
import { VideoMoment } from "@/lib/api";
import { IntensityBadge } from "./IntensitySlider";
import { Clock, Users } from "lucide-react";

interface ScreenshotCardProps {
  moment: VideoMoment;
  onClick?: () => void;
  episodeId: string;
}

export function ScreenshotCard({ moment, onClick, episodeId }: ScreenshotCardProps) {
  const screenshotUrl = moment.screenshot_path
    ? `/api/screenshots/${episodeId}/${moment.screenshot_path.split("/").pop()}`
    : null;

  const contentTypeColors: Record<string, string> = {
    dance: "bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]",
    training: "bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]",
    physical_intimacy: "bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]",
    vampire_feeding: "bg-[var(--color-accent-secondary)]/30 text-[var(--color-accent-secondary)]",
    confrontation: "bg-red-900/20 text-red-400",
    party: "bg-pink-900/20 text-pink-400",
    dialogue: "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]",
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative glass rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 hover:scale-[1.02]
        hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]
      `}
    >
      <div className="aspect-video relative bg-[var(--color-surface)]">
        {screenshotUrl ? (
          <Image
            src={screenshotUrl}
            alt={moment.description}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--color-text-muted)] text-sm">
              No screenshot
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-xs">
            <Clock className="w-3 h-3" />
            {moment.timestamp}
          </div>
        </div>

        <div className="absolute top-2 right-2">
          <IntensityBadge value={moment.intensity} />
        </div>

        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
          `}
        />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
          {moment.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <Chip
            size="sm"
            variant="soft"
            className={contentTypeColors[moment.content_type] || contentTypeColors.dialogue}
          >
            {moment.content_type.replace("_", " ")}
          </Chip>

          {moment.characters_present.length > 0 && (
            <Tooltip>
              <Tooltip.Trigger>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Users className="w-3 h-3" />
                  {moment.characters_present.length}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {moment.characters_present.join(", ")}
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>

        {moment.characters_present.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {moment.characters_present.slice(0, 3).map((char) => (
              <span
                key={char}
                className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] capitalize"
              >
                {char}
              </span>
            ))}
            {moment.characters_present.length > 3 && (
              <span className="text-xs px-1.5 py-0.5 text-[var(--color-text-muted)]">
                +{moment.characters_present.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
