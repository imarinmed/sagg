"use client";

import React, { useCallback, useEffect } from "react";
import Image from "next/image";
import { Button, Chip } from "@heroui/react";
import { VideoMoment } from "@/lib/api";
import { IntensityBadge } from "./IntensitySlider";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Download,
} from "lucide-react";

interface ScreenshotModalProps {
  moment: VideoMoment | null;
  episodeId: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function ScreenshotModal({
  moment,
  episodeId,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: ScreenshotModalProps) {
  const screenshotUrl = moment?.screenshot_path
    ? `/api/screenshots/${episodeId}/${moment.screenshot_path.split("/").pop()}`
    : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrevious) {
        onPrevious?.();
      } else if (e.key === "ArrowRight" && hasNext) {
        onNext?.();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [hasPrevious, hasNext, onPrevious, onNext, onClose]
  );

  useEffect(() => {
    if (moment) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [moment, handleKeyDown]);

  if (!moment) return null;

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl mx-4">
        <Button
          isIconOnly
          variant="ghost"
          onClick={onClose}
          className="absolute -top-12 right-0 z-20 bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="w-5 h-5" />
        </Button>

        {hasPrevious && (
          <Button
            isIconOnly
            variant="ghost"
            onClick={onPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-20 bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {hasNext && (
          <Button
            isIconOnly
            variant="ghost"
            onClick={onNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-20 bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        <div className="glass rounded-lg overflow-hidden">
          <div className="aspect-video relative bg-black">
            {screenshotUrl ? (
              <Image
                src={screenshotUrl}
                alt={moment.description}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[var(--color-text-muted)]">
                  No screenshot available
                </span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 bg-[var(--color-surface)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[var(--color-text-primary)]">
                  {moment.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] text-sm">
                  <Clock className="w-4 h-4" />
                  {moment.timestamp}
                </div>
                <IntensityBadge value={moment.intensity} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Chip
                size="sm"
                variant="soft"
                className={
                  contentTypeColors[moment.content_type] || contentTypeColors.dialogue
                }
              >
                {moment.content_type.replace("_", " ")}
              </Chip>

              {moment.characters_present.length > 0 && (
                <>
                  <span className="text-[var(--color-text-muted)]">|</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                    {moment.characters_present.map((char) => (
                      <Chip
                        key={char}
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] capitalize"
                      >
                        {char}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Use arrow keys to navigate</span>
              {screenshotUrl && (
                <a
                  href={screenshotUrl}
                  download
                  className="flex items-center gap-1 hover:text-[var(--color-accent-primary)]"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
