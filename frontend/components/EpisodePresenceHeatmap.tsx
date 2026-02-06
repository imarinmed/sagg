"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Film,
  Grid3X3,
  TrendingUp,
  Calendar,
  Eye,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Chip, Button } from "@heroui/react";
import Link from "next/link";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ImportanceLevel = "major" | "supporting" | "minor" | "background";

export interface EpisodePresence {
  episode_id: string;
  episode_number?: number;
  episode_title?: string;
  season?: number;
  presence_level: number; // 0-5
  screen_time_minutes?: number;
  screen_time_seconds?: number;
  key_scenes?: string[];
  importance: ImportanceLevel;
  intensity?: number;
  moment_count?: number;
  thumbnail_url?: string;
}

export interface Episode {
  id: string;
  title: string;
  episode_number: number;
  season: number;
  air_date?: string;
}

export interface EpisodePresenceHeatmapProps {
  characterId: string;
  characterName: string;
  presence: EpisodePresence[];
  episodes?: Episode[];
  season?: number;
  onEpisodeClick?: (episodeId: string) => void;
  className?: string;
}

// ============================================
// CONSTANTS & CONFIG
// ============================================

const IMPORTANCE_CONFIG: Record<ImportanceLevel, { color: string; label: string; priority: number }> = {
  major: { color: "#ef4444", label: "Major", priority: 4 },
  supporting: { color: "#f97316", label: "Supporting", priority: 3 },
  minor: { color: "#eab308", label: "Minor", priority: 2 },
  background: { color: "#6b7280", label: "Background", priority: 1 },
};

const PRESENCE_COLORS = {
  0: { bg: "rgba(75, 85, 99, 0.15)", border: "rgba(75, 85, 99, 0.3)", glow: "transparent" },
  1: { bg: "rgba(59, 130, 246, 0.25)", border: "rgba(59, 130, 246, 0.5)", glow: "rgba(59, 130, 246, 0.2)" },
  2: { bg: "rgba(34, 197, 94, 0.3)", border: "rgba(34, 197, 94, 0.5)", glow: "rgba(34, 197, 94, 0.2)" },
  3: { bg: "rgba(234, 179, 8, 0.4)", border: "rgba(234, 179, 8, 0.6)", glow: "rgba(234, 179, 8, 0.3)" },
  4: { bg: "rgba(249, 115, 22, 0.5)", border: "rgba(249, 115, 22, 0.6)", glow: "rgba(249, 115, 22, 0.3)" },
  5: { bg: "rgba(220, 38, 38, 0.6)", border: "rgba(220, 38, 38, 0.7)", glow: "rgba(220, 38, 38, 0.4)" },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatScreenTime(seconds: number): string {
  if (!seconds || seconds === 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatScreenTimeMinutes(minutes: number): string {
  if (!minutes || minutes === 0) return "0m";
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  return `${Math.round(minutes * 10) / 10}m`;
}

function getPresenceColor(level: number) {
  return PRESENCE_COLORS[level as keyof typeof PRESENCE_COLORS] || PRESENCE_COLORS[0];
}

function getImportanceColor(importance: ImportanceLevel): string {
  return IMPORTANCE_CONFIG[importance]?.color || "#6b7280";
}

function getEpisodeNumber(episodeId: string): number {
  const match = episodeId.match(/e(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function getSeasonFromId(episodeId: string): number {
  const match = episodeId.match(/s(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

// ============================================
// LOADING COMPONENT
// ============================================

function HeatmapLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-[var(--color-accent-primary)] animate-spin" />
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">Loading presence data...</p>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function HeatmapEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
        <Grid3X3 className="w-8 h-8 text-[var(--color-text-muted)]" />
      </div>
      <div>
        <h3 className="text-lg font-heading text-[var(--color-text-primary)]">No Episode Data</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">No episode presence data is available for this character.</p>
      </div>
    </div>
  );
}

// ============================================
// EPISODE CELL COMPONENT
// ============================================

interface EpisodeCellProps {
  presence: EpisodePresence;
  isHovered: boolean;
  onHover: (presence: EpisodePresence | null) => void;
  onClick: () => void;
  maxScreenTime: number;
}

function EpisodeCell({ presence, isHovered, onHover, onClick, maxScreenTime }: EpisodeCellProps) {
  const colors = getPresenceColor(presence.presence_level);
  const episodeNum = presence.episode_number || getEpisodeNumber(presence.episode_id);
  const importanceColor = getImportanceColor(presence.importance);

  const sizeRatio = maxScreenTime > 0 
    ? ((presence.screen_time_seconds || presence.screen_time_minutes || 0) / maxScreenTime) 
    : 0;

  return (
    <motion.div
      className="relative aspect-square rounded-xl cursor-pointer overflow-hidden group"
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        boxShadow: isHovered ? `0 0 20px ${colors.glow}` : "none",
      }}
      onMouseEnter={() => onHover(presence)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Episode number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white drop-shadow-lg">
          {episodeNum}
        </span>
        <span className="text-xs text-white/70 uppercase">
          {presence.episode_id.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Importance indicator */}
      <div
        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-white/30"
        style={{ backgroundColor: importanceColor }}
      />

      {/* Screen time indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
        <motion.div
          className="h-full bg-white/80"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(sizeRatio * 100, 5)}%` }}
          transition={{ duration: 0.5, delay: episodeNum * 0.05 }}
        />
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <Eye className="w-6 h-6 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// HOVER DETAIL CARD
// ============================================

interface HoverDetailCardProps {
  presence: EpisodePresence;
}

function HoverDetailCard({ presence }: HoverDetailCardProps) {
  const importanceConfig = IMPORTANCE_CONFIG[presence.importance];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute z-50 w-72 glass rounded-xl overflow-hidden shadow-2xl"
      style={{ pointerEvents: "none" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--glass-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading text-lg text-[var(--color-text-primary)]">
              {presence.episode_title || `Episode ${presence.episode_number || getEpisodeNumber(presence.episode_id)}`}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {presence.episode_id.toUpperCase()}
            </p>
          </div>
          <Chip
            size="sm"
            variant="soft"
            style={{
              backgroundColor: `${importanceConfig.color}20`,
              color: importanceConfig.color,
            }}
          >
            {importanceConfig.label}
          </Chip>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        {/* Presence level */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-muted)]">Presence Level</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      level <= presence.presence_level
                        ? getPresenceColor(level).border
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {presence.presence_level}/5
            </span>
          </div>
        </div>

        {/* Screen time */}
        {(presence.screen_time_seconds || presence.screen_time_minutes) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Screen Time</span>
            <span className="text-sm text-[var(--color-text-primary)]">
              {presence.screen_time_seconds
                ? formatScreenTime(presence.screen_time_seconds)
                : formatScreenTimeMinutes(presence.screen_time_minutes || 0)}
            </span>
          </div>
        )}

        {/* Key moments */}
        {presence.moment_count !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Key Moments</span>
            <span className="text-sm text-[var(--color-text-primary)]">{presence.moment_count}</span>
          </div>
        )}

        {/* Intensity */}
        {presence.intensity !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Intensity</span>
            <span className="text-sm text-[var(--color-text-primary)]">{presence.intensity}/5</span>
          </div>
        )}
      </div>

      {/* Key scenes */}
      {presence.key_scenes && presence.key_scenes.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Key Scenes</p>
          <div className="space-y-1">
            {presence.key_scenes.slice(0, 3).map((scene, idx) => (
              <p key={idx} className="text-sm text-[var(--color-text-secondary)] truncate">
                • {scene}
              </p>
            ))}
            {presence.key_scenes.length > 3 && (
              <p className="text-xs text-[var(--color-text-muted)]">
                +{presence.key_scenes.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EpisodePresenceHeatmap({
  characterId,
  characterName,
  presence,
  episodes,
  season,
  onEpisodeClick,
  className = "",
}: EpisodePresenceHeatmapProps) {
  const [hoveredPresence, setHoveredPresence] = useState<EpisodePresence | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(season || null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique seasons
  const availableSeasons = useMemo(() => {
    const seasons = new Set<number>();
    presence.forEach((p) => {
      const s = p.season || getSeasonFromId(p.episode_id);
      seasons.add(s);
    });
    return Array.from(seasons).sort();
  }, [presence]);

  // Filter by season
  const filteredPresence = useMemo(() => {
    if (!selectedSeason) return presence;
    return presence.filter((p) => {
      const episodeSeason = p.season || getSeasonFromId(p.episode_id);
      return episodeSeason === selectedSeason;
    });
  }, [presence, selectedSeason]);

  // Sort episodes by number
  const sortedPresence = useMemo(() => {
    return [...filteredPresence].sort((a, b) => {
      const numA = a.episode_number || getEpisodeNumber(a.episode_id);
      const numB = b.episode_number || getEpisodeNumber(b.episode_id);
      return numA - numB;
    });
  }, [filteredPresence]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEpisodes = sortedPresence.length;
    const totalScreenTime = sortedPresence.reduce((sum, p) => {
      return sum + (p.screen_time_seconds || (p.screen_time_minutes || 0) * 60 || 0);
    }, 0);
    const totalMoments = sortedPresence.reduce((sum, p) => sum + (p.moment_count || 0), 0);
    const avgPresence =
      totalEpisodes > 0
        ? sortedPresence.reduce((sum, p) => sum + p.presence_level, 0) / totalEpisodes
        : 0;
    const maxScreenTime = Math.max(
      ...sortedPresence.map((p) =>
        p.screen_time_seconds || (p.screen_time_minutes || 0) * 60 || 0
      ),
      1
    );

    return { totalEpisodes, totalScreenTime, totalMoments, avgPresence, maxScreenTime };
  }, [sortedPresence]);

  // Count by importance
  const importanceCounts = useMemo(() => {
    const counts: Record<ImportanceLevel, number> = {
      major: 0,
      supporting: 0,
      minor: 0,
      background: 0,
    };
    sortedPresence.forEach((p) => {
      counts[p.importance]++;
    });
    return counts;
  }, [sortedPresence]);

  if (isLoading) {
    return (
      <GlassCard className={className}>
        <HeatmapLoading />
      </GlassCard>
    );
  }

  if (presence.length === 0) {
    return (
      <GlassCard className={className}>
        <HeatmapEmpty />
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <GlassCard>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <p className="text-2xl font-bold text-[var(--color-accent-primary)]">{stats.totalEpisodes}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Episodes</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatScreenTime(stats.totalScreenTime)}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Screen Time</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalMoments}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Moments</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <p className="text-2xl font-bold text-[var(--color-accent-secondary)]">{stats.avgPresence.toFixed(1)}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Avg Presence</p>
          </div>
        </CardContent>
      </GlassCard>

      {/* Season Filter */}
      {availableSeasons.length > 1 && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Season:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedSeason === null ? "secondary" : "ghost"}
              size="sm"
              onPress={() => setSelectedSeason(null)}
              className={selectedSeason === null ? "" : "text-[var(--color-text-muted)]"}
            >
              All
            </Button>
            {availableSeasons.map((s) => (
              <Button
                key={s}
                variant={selectedSeason === s ? "secondary" : "ghost"}
                size="sm"
                onPress={() => setSelectedSeason(s)}
                className={selectedSeason === s ? "" : "text-[var(--color-text-muted)]"}
              >
                S{s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap Grid */}
      <GlassCard className="relative">
        <CardHeader className="flex items-center justify-between border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Episode Presence</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Hover for details, click to view episode</p>
            </div>
          </div>

          {/* Importance legend */}
          <div className="hidden md:flex items-center gap-3">
            {(Object.keys(IMPORTANCE_CONFIG) as ImportanceLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: IMPORTANCE_CONFIG[level].color }}
                />
                <span className="text-xs text-[var(--color-text-muted)] capitalize">{level}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {sortedPresence.map((p, idx) => (
              <Link
                key={p.episode_id}
                href={`/episodes/${p.episode_id}`}
                onClick={(e) => {
                  if (onEpisodeClick) {
                    e.preventDefault();
                    onEpisodeClick(p.episode_id);
                  }
                }}
              >
                <EpisodeCell
                  presence={p}
                  isHovered={hoveredPresence?.episode_id === p.episode_id}
                  onHover={setHoveredPresence}
                  onClick={() => {}}
                  maxScreenTime={stats.maxScreenTime}
                />
              </Link>
            ))}
          </div>

          {/* Hover detail card */}
          <AnimatePresence>
            {hoveredPresence && (
              <div className="absolute top-4 right-4">
                <HoverDetailCard presence={hoveredPresence} />
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </GlassCard>

      {/* Presence Level Legend */}
      <GlassCard>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Presence Level:</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">None</span>
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className="w-8 h-8 rounded-lg border-2 flex items-center justify-center"
                style={{
                  backgroundColor: getPresenceColor(level).bg,
                  borderColor: getPresenceColor(level).border,
                }}
              >
                <span className="text-xs font-medium text-white/80">{level}</span>
              </div>
            ))}
            <span className="text-xs text-[var(--color-text-muted)]">High</span>
          </div>
        </CardContent>
      </GlassCard>

      {/* Importance Breakdown */}
      <GlassCard>
        <CardHeader className="border-b border-[var(--glass-border)]">
          <h4 className="font-heading text-[var(--color-text-primary)]">Role Breakdown</h4>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(IMPORTANCE_CONFIG) as ImportanceLevel[]).map((level) => (
              <div
                key={level}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface)]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: IMPORTANCE_CONFIG[level].color }}
                  />
                  <span className="text-sm text-[var(--color-text-secondary)] capitalize">{level}</span>
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {importanceCounts[level]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

export default EpisodePresenceHeatmap;
