"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { Calendar, Sparkles } from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { MythosElement } from "@/lib/api";

interface MythosTimelineProps {
  elements: MythosElement[];
  onElementClick?: (element: MythosElement) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  biology: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  supernatural: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  society: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  psychology: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  rules: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

function episodeSortKey(episodeId: string): number {
  const match = episodeId.match(/s(\d+)e(\d+)/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const season = Number(match[1]);
  const episode = Number(match[2]);
  return season * 100 + episode;
}

export function MythosTimeline({ elements, onElementClick }: MythosTimelineProps) {
  const timelineItems = useMemo(() => {
    return elements
      .map((element) => {
        const relatedEpisodes = element.related_episodes || [];
        const sortedEpisodes = [...relatedEpisodes].sort(
          (a, b) => episodeSortKey(a) - episodeSortKey(b)
        );
        return {
          ...element,
          firstEpisode: sortedEpisodes[0],
          relatedEpisodes: sortedEpisodes,
        };
      })
      .sort((a, b) => {
        const aKey = a.firstEpisode ? episodeSortKey(a.firstEpisode) : Number.MAX_SAFE_INTEGER;
        const bKey = b.firstEpisode ? episodeSortKey(b.firstEpisode) : Number.MAX_SAFE_INTEGER;
        if (aKey === bKey) return a.name.localeCompare(b.name);
        return aKey - bKey;
      });
  }, [elements]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Calendar className="w-4 h-4" />
        <span>Timeline by earliest related episode</span>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border)]" />
        <div className="space-y-6">
          {timelineItems.map((element) => {
            const categoryStyle = CATEGORY_STYLES[element.category] || CATEGORY_STYLES.society;
            const description = element.short_description || element.description || "";
            return (
              <div key={element.id} className="relative pl-10">
                <div className="absolute left-2 top-6 w-4 h-4 rounded-full bg-[#D4AF37] border-2 border-[var(--color-bg-primary)]" />
                <Link
                  href={`/mythos/${element.id}`}
                  className="block"
                  onClick={(event) => {
                    if (onElementClick) {
                      event.preventDefault();
                      onElementClick(element);
                    }
                  }}
                >
                  <GlassCard className="transition-all hover:border-[var(--color-border-hover)]">
                    <CardHeader>
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs px-2 py-1 rounded-full border ${categoryStyle}`}>
                          {element.category}
                        </span>
                        {element.firstEpisode ? (
                          <Chip
                            size="sm"
                            variant="soft"
                            className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                          >
                            {element.firstEpisode.toUpperCase()}
                          </Chip>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
                          {element.name}
                        </h3>
                      </div>
                      {description && (
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                          {description}
                        </p>
                      )}
                      {element.relatedEpisodes?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {element.relatedEpisodes.slice(0, 4).map((episodeId) => (
                            <Chip
                              key={episodeId}
                              size="sm"
                              variant="soft"
                              className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                            >
                              {episodeId.toUpperCase()}
                            </Chip>
                          ))}
                          {element.relatedEpisodes.length > 4 && (
                            <Chip
                              size="sm"
                              variant="soft"
                              className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                            >
                              +{element.relatedEpisodes.length - 4} more
                            </Chip>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </GlassCard>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
