"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Flame,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";
import { Chip, Button } from "@heroui/react";
import Link from "next/link";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TraitEvolution {
  id: string;
  name: string;
  intensity: number;
  notes?: string;
}

export interface EpisodeEvolution {
  episode_id: string;
  episode_number: number;
  episode_title: string;
  traits: TraitEvolution[];
  arc_progression: "improving" | "declining" | "stable" | "transforming";
  key_moments: string[];
  overall_intensity: number;
  screenshot_path?: string;
}

export interface CharacterEvolutionTimelineProps {
  characterId: string;
  characterName: string;
  evolution: EpisodeEvolution[];
  milestones?: Array<{
    id: string;
    episode_id: string;
    milestone_type: string;
    description: string;
    importance: number;
    timestamp?: string;
  }>;
  traits?: string[];
  showAllTraits?: boolean;
  arcSummary?: string;
  onEpisodeClick?: (episodeId: string) => void;
  className?: string;
}

// ============================================
// CONSTANTS & CONFIG
// ============================================

const ARC_PROGRESSION_CONFIG = {
  improving: {
    icon: TrendingUp,
    color: "#4ade80",
    label: "Improving",
    description: "Character is growing and developing positively",
  },
  declining: {
    icon: TrendingDown,
    color: "#ef4444",
    label: "Declining",
    description: "Character is facing challenges or deterioration",
  },
  stable: {
    icon: Minus,
    color: "#6b7280",
    label: "Stable",
    description: "Character maintains current state",
  },
  transforming: {
    icon: Sparkles,
    color: "#8B5CF6",
    label: "Transforming",
    description: "Major character transformation occurring",
  },
};

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  first_appearance: Star,
  power_awakening: Zap,
  transformation: Flame,
  character_growth: TrendingUp,
  revelation: Sparkles,
  default: Target,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getEpisodeColor(episodeNumber: number): string {
  const colors = [
    "#D4AF37",
    "#C5A059",
    "#B76E79",
    "#8B5CF6",
    "#60a5fa",
    "#4ade80",
    "#f97316",
  ];
  return colors[(episodeNumber - 1) % colors.length];
}

function calculateTraitTrajectory(
  traitId: string,
  episodes: EpisodeEvolution[]
): "up" | "down" | "stable" {
  const values = episodes
    .map((ep) => ep.traits.find((t) => t.id === traitId)?.intensity || 0)
    .filter((v) => v > 0);

  if (values.length < 2) return "stable";

  const first = values[0];
  const last = values[values.length - 1];
  const diff = last - first;

  if (diff > 0.5) return "up";
  if (diff < -0.5) return "down";
  return "stable";
}

// ============================================
// LOADING COMPONENT
// ============================================

function TimelineLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-3 border-[var(--color-accent-primary)]/20 rounded-full" />
        <div className="absolute inset-0 border-3 border-[var(--color-accent-primary)] rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">Loading evolution data...</p>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function TimelineEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-[var(--color-text-muted)]" />
      </div>
      <div>
        <h3 className="text-lg font-heading text-[var(--color-text-primary)]">No Evolution Data</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Character evolution data is not available for this character.
        </p>
      </div>
    </div>
  );
}

// ============================================
// TRAIT BAR COMPONENT
// ============================================

interface TraitBarProps {
  name: string;
  intensity: number;
  maxIntensity?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

function TraitBar({
  name,
  intensity,
  maxIntensity = 5,
  color,
  showLabel = true,
  size = "md",
}: TraitBarProps) {
  const percentage = (intensity / maxIntensity) * 100;
  const barColor =
    color ||
    (intensity >= 4 ? "#ef4444" : intensity >= 3 ? "#f97316" : intensity >= 2 ? "#D4AF37" : "#6b7280");

  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-secondary)] capitalize">{name.replace(/_/g, " ")}</span>
          <span className="text-[var(--color-text-muted)]">{intensity.toFixed(1)}</span>
        </div>
      )}
      <div className={`w-full ${heightClass} bg-[var(--color-surface)] rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// ============================================
// EPISODE NODE COMPONENT
// ============================================

interface EpisodeNodeProps {
  episode: EpisodeEvolution;
  isSelected: boolean;
  onClick: () => void;
  milestones?: Array<{
    id: string;
    episode_id: string;
    milestone_type: string;
    importance: number;
  }>;
}

function EpisodeNode({ episode, isSelected, onClick, milestones }: EpisodeNodeProps) {
  const progression = ARC_PROGRESSION_CONFIG[episode.arc_progression];
  const ProgressionIcon = progression.icon;
  const episodeColor = getEpisodeColor(episode.episode_number);

  const episodeMilestones =
    milestones?.filter((m) => m.episode_id === episode.episode_id) || [];

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 min-w-[140px] ${
        isSelected
          ? "bg-[var(--color-accent-primary)]/10 border-2 border-[var(--color-accent-primary)]"
          : "bg-[var(--color-surface)] border-2 border-transparent hover:border-[var(--color-border)]"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Episode number badge */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3"
        style={{ backgroundColor: episodeColor }}
      >
        {episode.episode_number}
      </div>

      {/* Episode title */}
      <p className="text-sm font-medium text-[var(--color-text-primary)] text-center line-clamp-2 mb-2">
        {episode.episode_title}
      </p>

      {/* Arc progression indicator */}
      <div className="flex items-center gap-1.5 text-xs mb-2">
        <ProgressionIcon className="w-3.5 h-3.5" style={{ color: progression.color }} />
        <span style={{ color: progression.color }}>{progression.label}</span>
      </div>

      {/* Intensity meter */}
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Intensity</span>
          <span>{episode.overall_intensity}/5</span>
        </div>
        <div className="h-1.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(episode.overall_intensity / 5) * 100}%`,
              backgroundColor:
                episode.overall_intensity >= 4
                  ? "#ef4444"
                  : episode.overall_intensity >= 3
                  ? "#f97316"
                  : "#D4AF37",
            }}
          />
        </div>
      </div>

      {/* Milestone dots */}
      {episodeMilestones.length > 0 && (
        <div className="flex items-center gap-1 mt-3">
          {episodeMilestones.slice(0, 3).map((milestone, idx) => {
            const Icon = MILESTONE_ICONS[milestone.milestone_type] || MILESTONE_ICONS.default;
            return (
              <div
                key={milestone.id}
                className="w-5 h-5 rounded-full bg-[var(--color-accent-primary)]/20 flex items-center justify-center"
                title={milestone.milestone_type}
              >
                <Icon className="w-3 h-3 text-[var(--color-accent-primary)]" />
              </div>
            );
          })}
          {episodeMilestones.length > 3 && (
            <span className="text-xs text-[var(--color-text-muted)]">+{episodeMilestones.length - 3}</span>
          )}
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--color-accent-primary)] rounded-full"
        />
      )}
    </motion.button>
  );
}

// ============================================
// TRAIT EVOLUTION CHART
// ============================================

interface TraitEvolutionChartProps {
  traitName: string;
  episodes: EpisodeEvolution[];
  color?: string;
}

function TraitEvolutionChart({ traitName, episodes, color = "#D4AF37" }: TraitEvolutionChartProps) {
  const data = useMemo(() => {
    return episodes.map((ep) => ({
      episode: ep.episode_number,
      intensity: ep.traits.find((t) => t.id === traitName || t.name === traitName)?.intensity || 0,
    }));
  }, [episodes, traitName]);

  const maxValue = 5;
  const chartHeight = 60;
  const barWidth = 24;
  const gap = 8;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)] capitalize">
          {traitName.replace(/_/g, " ")}
        </span>
        <div className="flex items-center gap-1">
          {calculateTraitTrajectory(traitName, episodes) === "up" && (
            <TrendingUp className="w-4 h-4 text-green-500" />
          )}
          {calculateTraitTrajectory(traitName, episodes) === "down" && (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          {calculateTraitTrajectory(traitName, episodes) === "stable" && (
            <Minus className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      <div className="flex items-end gap-2 h-[60px]">
        {data.map((point, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: (point.intensity / maxValue) * chartHeight }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="w-6 rounded-t-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--color-text-muted)]">E{point.episode}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CharacterEvolutionTimeline({
  characterId,
  characterName,
  evolution,
  milestones,
  traits,
  showAllTraits = false,
  arcSummary,
  onEpisodeClick,
  className = "",
}: CharacterEvolutionTimelineProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Sort episodes by number
  const sortedEpisodes = useMemo(() => {
    return [...evolution].sort((a, b) => a.episode_number - b.episode_number);
  }, [evolution]);

  // Get all unique traits
  const allTraits = useMemo(() => {
    const traitSet = new Set<string>();
    evolution.forEach((ep) => {
      ep.traits.forEach((trait) => {
        traitSet.add(trait.id || trait.name);
      });
    });
    return Array.from(traitSet);
  }, [evolution]);

  // Filter traits if specified
  const displayedTraits = useMemo(() => {
    if (showAllTraits) return allTraits;
    if (traits && traits.length > 0) return traits;
    return allTraits.slice(0, 4); // Default to first 4 traits
  }, [allTraits, traits, showAllTraits]);

  // Get selected episode data
  const selectedEpisodeData = useMemo(() => {
    if (!selectedEpisode) return sortedEpisodes[0];
    return sortedEpisodes.find((ep) => ep.episode_id === selectedEpisode) || sortedEpisodes[0];
  }, [selectedEpisode, sortedEpisodes]);

  // Calculate overall trajectory
  const overallTrajectory = useMemo(() => {
    const firstEpisode = sortedEpisodes[0];
    const lastEpisode = sortedEpisodes[sortedEpisodes.length - 1];

    if (!firstEpisode || !lastEpisode) return "stable";

    const firstIntensity = firstEpisode.overall_intensity;
    const lastIntensity = lastEpisode.overall_intensity;

    if (lastIntensity - firstIntensity > 1) return "improving";
    if (firstIntensity - lastIntensity > 1) return "declining";
    return "stable";
  }, [sortedEpisodes]);

  const trajectoryConfig = ARC_PROGRESSION_CONFIG[overallTrajectory];
  const TrajectoryIcon = trajectoryConfig.icon;

  // Handle scroll
  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("timeline-scroll-container");
    if (container) {
      const scrollAmount = 200;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  if (evolution.length === 0) {
    return (
      <GlassCard className={className}>
        <TimelineEmpty />
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with arc summary */}
      <GlassCard>
        <CardHeader className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${trajectoryConfig.color}20` }}
              >
                <TrajectoryIcon className="w-5 h-5" style={{ color: trajectoryConfig.color }} />
              </div>
              <div>
                <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
                  Character Evolution
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {sortedEpisodes.length} episodes • {allTraits.length} tracked traits
                </p>
              </div>
            </div>

            {arcSummary && (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
                {arcSummary}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Overall Trajectory</p>
            <p className="text-lg font-medium" style={{ color: trajectoryConfig.color }}>
              {trajectoryConfig.label}
            </p>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Timeline Navigation */}
      <GlassCard>
        <CardHeader className="flex items-center justify-between border-b border-[var(--glass-border)]">
          <h4 className="font-heading text-lg text-[var(--color-text-primary)]">Episode Timeline</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleScroll("left")}
              className="glass"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleScroll("right")}
              className="glass"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            id="timeline-scroll-container"
            className="flex gap-4 overflow-x-auto p-6 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sortedEpisodes.map((episode) => (
              <EpisodeNode
                key={episode.episode_id}
                episode={episode}
                isSelected={selectedEpisodeData?.episode_id === episode.episode_id}
                onClick={() => {
                  setSelectedEpisode(episode.episode_id);
                  onEpisodeClick?.(episode.episode_id);
                }}
                milestones={milestones}
              />
            ))}
          </div>
        </CardContent>
      </GlassCard>

      {/* Selected Episode Details */}
      <AnimatePresence mode="wait">
        {selectedEpisodeData && (
          <motion.div
            key={selectedEpisodeData.episode_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard>
              <CardHeader className="border-b border-[var(--glass-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getEpisodeColor(selectedEpisodeData.episode_number) }}
                    >
                      {selectedEpisodeData.episode_number}
                    </div>
                    <div>
                      <h4 className="font-heading text-lg text-[var(--color-text-primary)]">
                        {selectedEpisodeData.episode_title}
                      </h4>
                      <Link
                        href={`/episodes/${selectedEpisodeData.episode_id}`}
                        className="text-sm text-[var(--color-accent-primary)] hover:underline"
                      >
                        View Episode →
                      </Link>
                    </div>
                  </div>

                  <Chip
                    variant="soft"
                    className="capitalize"
                    style={{
                      backgroundColor: `${ARC_PROGRESSION_CONFIG[selectedEpisodeData.arc_progression].color}20`,
                      color: ARC_PROGRESSION_CONFIG[selectedEpisodeData.arc_progression].color,
                    }}
                  >
                    {ARC_PROGRESSION_CONFIG[selectedEpisodeData.arc_progression].label}
                  </Chip>
                </div>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-6">
                {/* Traits Section */}
                <div className="space-y-4">
                  <h5 className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Trait Intensities
                  </h5>

                  {selectedEpisodeData.traits.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEpisodeData.traits.map((trait) => (
                        <TraitBar
                          key={trait.id || trait.name}
                          name={trait.name || trait.id}
                          intensity={trait.intensity}
                          showLabel={true}
                          size="md"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">No trait data for this episode.</p>
                  )}
                </div>

                {/* Key Moments Section */}
                <div className="space-y-4">
                  <h5 className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Key Moments
                  </h5>

                  {selectedEpisodeData.key_moments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEpisodeData.key_moments.map((moment, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface)]"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-primary)]/20 flex items-center justify-center text-xs text-[var(--color-accent-primary)] font-medium">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-[var(--color-text-secondary)]">{moment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">No key moments recorded.</p>
                  )}
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trait Evolution Charts */}
      {displayedTraits.length > 0 && (
        <GlassCard>
          <CardHeader className="border-b border-[var(--glass-border)]">
            <h4 className="font-heading text-lg text-[var(--color-text-primary)]">Trait Evolution Over Time</h4>
          </CardHeader>

          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTraits.map((traitName, idx) => (
              <TraitEvolutionChart
                key={traitName}
                traitName={traitName}
                episodes={sortedEpisodes}
                color={getEpisodeColor(idx + 1)}
              />
            ))}
          </CardContent>
        </GlassCard>
      )}
    </div>
  );
}

export default CharacterEvolutionTimeline;
