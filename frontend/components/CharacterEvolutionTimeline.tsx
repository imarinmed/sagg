"use client";

import React, { useState } from "react";
import { Chip } from "@heroui/react";
import Link from "next/link";
import { Play, Star, Heart, Zap, Users, Eye, Flame, type LucideIcon } from "lucide-react";

interface EvolutionMilestone {
  id: string;
  character_id: string;
  episode_id: string;
  timestamp: string;
  milestone_type: string;
  description: string;
  importance: number;
  related_characters: string[];
  quote?: string | null;
  intensity: number;
  content_type: string;
  screenshot_path?: string;
}

interface CharacterEvolutionTimelineProps {
  characterId: string;
  characterName: string;
  milestones: EvolutionMilestone[];
  arcSummary?: string;
  onMilestoneClick?: (milestone: EvolutionMilestone) => void;
}

const MILESTONE_TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  first_appearance: { icon: Star, color: "#D4AF37", label: "First Appearance" },
  relationship_change: { icon: Heart, color: "#ff6b9d", label: "Relationship Change" },
  power_awakening: { icon: Zap, color: "#8B5CF6", label: "Power Awakening" },
  character_growth: { icon: Users, color: "#4ade80", label: "Character Growth" },
  revelation: { icon: Eye, color: "#60a5fa", label: "Revelation" },
  transformation: { icon: Flame, color: "#ef4444", label: "Transformation" },
  default: { icon: Play, color: "#6b7280", label: "Milestone" },
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  party: "bg-purple-500/20 text-purple-400",
  training: "bg-blue-500/20 text-blue-400",
  romantic: "bg-pink-500/20 text-pink-400",
  confrontation: "bg-red-500/20 text-red-400",
  discovery: "bg-yellow-500/20 text-yellow-400",
  ritual: "bg-violet-500/20 text-violet-400",
  transformation: "bg-orange-500/20 text-orange-400",
  default: "bg-gray-500/20 text-gray-400",
};

export function CharacterEvolutionTimeline({
  characterId,
  characterName,
  milestones,
  arcSummary,
  onMilestoneClick,
}: CharacterEvolutionTimelineProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  // Group milestones by episode
  const groupedMilestones = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.episode_id]) {
      acc[milestone.episode_id] = [];
    }
    acc[milestone.episode_id].push(milestone);
    return acc;
  }, {} as Record<string, EvolutionMilestone[]>);

  // Sort episodes
  const sortedEpisodes = Object.keys(groupedMilestones).sort();

  if (milestones.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--color-text-muted)]">
        No evolution data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Arc Summary */}
      {arcSummary && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-4 border-[#D4AF37]">
          <p className="text-sm font-medium text-[#D4AF37] mb-1">Character Arc</p>
          <p className="text-[var(--color-text-secondary)]">{arcSummary}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />

        {/* Episodes */}
        <div className="space-y-8">
          {sortedEpisodes.map((episodeId, episodeIndex) => {
            const episodeMilestones = groupedMilestones[episodeId];
            
            return (
              <div key={episodeId} className="relative">
                {/* Episode header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-sm z-10">
                    {episodeId.replace("s01", "S1").replace("e", "E")}
                  </div>
                  <Link href={`/episodes/${episodeId}`}>
                    <h3 className="font-heading text-lg text-[var(--color-text-primary)] hover:text-[#D4AF37] transition-colors">
                      Episode {episodeId.slice(-2)}
                    </h3>
                  </Link>
                </div>

                {/* Milestones in this episode */}
                <div className="ml-16 space-y-4">
                  {episodeMilestones.map((milestone, index) => {
                    const config = MILESTONE_TYPE_CONFIG[milestone.milestone_type] || MILESTONE_TYPE_CONFIG.default;
                    const Icon = config.icon;
                    const isExpanded = expandedMilestone === milestone.id;
                    const contentTypeColor = CONTENT_TYPE_COLORS[milestone.content_type] || CONTENT_TYPE_COLORS.default;

                    return (
                      <div
                        key={milestone.id}
                        className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                          isExpanded
                            ? "bg-[var(--color-surface-elevated)] border-[#D4AF37]/50"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                        }`}
                        onClick={() => {
                          setExpandedMilestone(isExpanded ? null : milestone.id);
                          onMilestoneClick?.(milestone);
                        }}
                      >
                        {/* Connector to timeline */}
                        <div className="absolute -left-12 top-6 w-8 h-0.5 bg-[var(--color-border)]" />
                        <div
                          className="absolute -left-4 top-4 w-4 h-4 rounded-full border-2"
                          style={{
                            backgroundColor: config.color,
                            borderColor: config.color,
                          }}
                        />

                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${config.color}20` }}
                            >
                              <Icon className="w-4 h-4" color={config.color} />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text-primary)]">
                                {config.label}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {milestone.timestamp}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              variant="soft"
                              className={contentTypeColor}
                            >
                              {milestone.content_type}
                            </Chip>
                            {/* Importance stars */}
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < milestone.importance
                                      ? "text-[#D4AF37] fill-[#D4AF37]"
                                      : "text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className={`mt-3 text-sm text-[var(--color-text-secondary)] ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {milestone.description}
                        </p>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4 animate-fade-in-up">
                            {/* Quote */}
                            {milestone.quote && (
                              <blockquote className="pl-4 border-l-2 border-[#D4AF37] italic text-[var(--color-text-muted)]">
                                "{milestone.quote}"
                              </blockquote>
                            )}

                            {/* Related characters */}
                            {milestone.related_characters.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
                                  Characters in scene:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {milestone.related_characters.map((char) => (
                                    <Chip
                                      key={char}
                                      size="sm"
                                      variant="soft"
                                      className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                                    >
                                      {char.replace(/_/g, " ")}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Intensity indicator */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--color-text-muted)]">
                                Intensity:
                              </span>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-2 rounded-sm ${
                                      i < milestone.intensity
                                        ? i < 3
                                          ? "bg-yellow-500"
                                          : i < 4
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                        : "bg-gray-700"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* View episode link */}
                            <Link
                              href={`/episodes/${milestone.episode_id}`}
                              className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Play className="w-4 h-4" />
                              Watch this moment
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* End cap */}
        <div className="absolute left-6 bottom-0 w-3 h-3 rounded-full bg-[var(--color-border)] -translate-x-1" />
      </div>
    </div>
  );
}
