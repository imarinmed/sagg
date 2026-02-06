"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import {
  Radar,
  List,
  Lock,
  Unlock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BarChart3,
  AlertTriangle,
  Heart,
  Zap,
  Info,
} from "lucide-react";
import { Chip, Button, Tabs } from "@heroui/react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface KinkPreference {
  id: string;
  descriptor: string;
  intensity: number;
  context?: string;
  category?: string;
}

export interface KinkLimit {
  id: string;
  descriptor: string;
  type: "hard" | "soft";
  note?: string;
}

export interface KinkEvolution {
  episode_id: string;
  preferences: KinkPreference[];
}

export interface KinkProfileVisualizationProps {
  characterId: string;
  preferences: KinkPreference[];
  limits: KinkLimit[];
  evolution?: KinkEvolution[];
  className?: string;
}

// ============================================
// CONSTANTS & CONFIG
// ============================================

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; radar: string }
> = {
  consent: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    radar: "#10b981",
  },
  power_exchange: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    radar: "#a855f7",
  },
  dominance: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    radar: "#9333ea",
  },
  submission: {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    border: "border-pink-500/30",
    radar: "#ec4899",
  },
  physical: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    radar: "#ef4444",
  },
  psychological: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    radar: "#f97316",
  },
  vampire: {
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    border: "border-rose-500/30",
    radar: "#f43f5e",
  },
  blood: {
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    border: "border-rose-500/30",
    radar: "#e11d48",
  },
  sensory: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    radar: "#06b6d4",
  },
  relationship: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    radar: "#3b82f6",
  },
  default: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    radar: "#6b7280",
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getCategoryFromDescriptor(descriptor: string): string {
  const lowerDesc = descriptor.toLowerCase();
  if (lowerDesc.includes("consent") || lowerDesc.includes("negotiat")) return "consent";
  if (lowerDesc.includes("domin") || lowerDesc.includes("control")) return "dominance";
  if (lowerDesc.includes("submis") || lowerDesc.includes("surrender")) return "submission";
  if (lowerDesc.includes("power") || lowerDesc.includes("exchange")) return "power_exchange";
  if (lowerDesc.includes("blood") || lowerDesc.includes("feed") || lowerDesc.includes("bite")) return "blood";
  if (lowerDesc.includes("vampire") || lowerDesc.includes("immortal")) return "vampire";
  if (lowerDesc.includes("physical") || lowerDesc.includes("impact") || lowerDesc.includes("pain"))
    return "physical";
  if (lowerDesc.includes("psycho") || lowerDesc.includes("mind") || lowerDesc.includes("mental"))
    return "psychological";
  if (lowerDesc.includes("sensory") || lowerDesc.includes("sensation")) return "sensory";
  if (lowerDesc.includes("relation") || lowerDesc.includes("bond")) return "relationship";
  return "default";
}

function getIntensityColor(intensity: number): string {
  if (intensity >= 5) return "#ef4444";
  if (intensity >= 4) return "#f97316";
  if (intensity >= 3) return "#eab308";
  if (intensity >= 2) return "#22c55e";
  return "#3b82f6";
}

// ============================================
// RADAR CHART COMPONENT
// ============================================

interface RadarChartProps {
  data: Array<{ axis: string; value: number; category: string }>;
  width?: number;
  height?: number;
}

function RadarChart({ data, width = 400, height = 400 }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create scales
    const angleScale = d3.scaleLinear().domain([0, data.length]).range([0, 2 * Math.PI]);
    const radiusScale = d3.scaleLinear().domain([0, 5]).range([0, radius]);

    // Draw grid circles
    const gridLevels = [1, 2, 3, 4, 5];
    gridLevels.forEach((level) => {
      svg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", radiusScale(level))
        .attr("fill", "none")
        .attr("stroke", "var(--color-border)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");
    });

    // Draw axis lines
    data.forEach((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      svg
        .append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "var(--color-border)")
        .attr("stroke-width", 1);

      // Draw labels
      const labelRadius = radius + 25;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);

      svg
        .append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "11px")
        .attr("fill", "var(--color-text-secondary)")
        .text(d.axis.length > 12 ? d.axis.slice(0, 12) + "..." : d.axis);
    });

    // Draw data polygon
    const lineGenerator = d3
      .line<{ axis: string; value: number; category: string }>()
      .x((d, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        return centerX + radiusScale(d.value) * Math.cos(angle);
      })
      .y((d, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        return centerY + radiusScale(d.value) * Math.sin(angle);
      })
      .curve(d3.curveLinearClosed);

    // Draw filled area
    svg
      .append("path")
      .datum(data)
      .attr("d", lineGenerator)
      .attr("fill", "var(--color-accent-primary)")
      .attr("fill-opacity", 0.2)
      .attr("stroke", "var(--color-accent-primary)")
      .attr("stroke-width", 2);

    // Draw data points
    data.forEach((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const x = centerX + radiusScale(d.value) * Math.cos(angle);
      const y = centerY + radiusScale(d.value) * Math.sin(angle);
      const color = CATEGORY_COLORS[d.category]?.radar || CATEGORY_COLORS.default.radar;

      svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "var(--color-bg-primary)")
        .attr("stroke-width", 2);
    });
  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="mx-auto"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}

// ============================================
// INTENSITY METER COMPONENT
// ============================================

interface IntensityMeterProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

function IntensityMeter({ value, max = 5, size = "md", showValue = true }: IntensityMeterProps) {
  const percentage = (value / max) * 100;
  const color = getIntensityColor(value);

  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${heightClass} bg-[var(--color-surface)] rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-medium text-[var(--color-text-muted)] w-8 text-right">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

// ============================================
// PREFERENCE CARD COMPONENT
// ============================================

interface PreferenceCardProps {
  preference: KinkPreference;
  index: number;
}

function PreferenceCard({ preference, index }: PreferenceCardProps) {
  const category = getCategoryFromDescriptor(preference.descriptor);
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 rounded-xl bg-[var(--color-surface)] border ${colors.border} hover-lift`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Chip size="sm" variant="soft" className={`${colors.bg} ${colors.text} ${colors.border} border text-xs`}>
              {category.replace(/_/g, " ")}
            </Chip>
            <span className="text-xs text-[var(--color-text-muted)]">Intensity: {preference.intensity}/5</span>
          </div>

          <h4 className="font-medium text-[var(--color-text-primary)] capitalize mb-2">
            {preference.descriptor.replace(/_/g, " ")}
          </h4>

          <IntensityMeter value={preference.intensity} size="sm" showValue={false} />

          {preference.context && (
            <p className="text-sm text-[var(--color-text-muted)] mt-2 line-clamp-2">{preference.context}</p>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${colors.radar}20` }}
        >
          <Heart className="w-5 h-5" style={{ color: colors.radar }} />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// LIMIT CARD COMPONENT
// ============================================

interface LimitCardProps {
  limit: KinkLimit;
  index: number;
}

function LimitCard({ limit, index }: LimitCardProps) {
  const isHard = limit.type === "hard";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 rounded-xl border ${
        isHard
          ? "bg-red-500/10 border-red-500/30"
          : "bg-orange-500/10 border-orange-500/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isHard ? "bg-red-500/20" : "bg-orange-500/20"
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${isHard ? "text-red-400" : "text-orange-400"}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium capitalize text-[var(--color-text-primary)]">
              {limit.descriptor.replace(/_/g, " ")}
            </span>
            <Chip
              size="sm"
              variant="soft"
              className={
                isHard
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-orange-500/20 text-orange-400 border-orange-500/30"
              }
            >
              {limit.type}
            </Chip>
          </div>

          {limit.note && (
            <p className={`text-sm ${isHard ? "text-red-400/80" : "text-orange-400/80"}`}>{limit.note}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// EVOLUTION TIMELINE COMPONENT
// ============================================

interface EvolutionTimelineProps {
  evolution: KinkEvolution[];
}

function EvolutionTimeline({ evolution }: EvolutionTimelineProps) {
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {evolution.map((evo, idx) => (
        <motion.div
          key={evo.episode_id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
        >
          <button
            onClick={() => setExpandedEpisode(expandedEpisode === evo.episode_id ? null : evo.episode_id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--color-accent-primary)]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[var(--color-text-primary)]">{evo.episode_id.toUpperCase()}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{evo.preferences.length} preferences tracked</p>
              </div>
            </div>

            {expandedEpisode === evo.episode_id ? (
              <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
            )}
          </button>

          <AnimatePresence>
            {expandedEpisode === evo.episode_id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 border-t border-[var(--color-border)]">
                  {evo.preferences.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)] capitalize">
                        {pref.descriptor.replace(/_/g, " ")}
                      </span>
                      <IntensityMeter value={pref.intensity} size="sm" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function KinkProfileVisualization({
  characterId,
  preferences,
  limits,
  evolution,
  className = "",
}: KinkProfileVisualizationProps) {
  const [activeView, setActiveView] = useState<"chart" | "list">("chart");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const avgIntensity =
      preferences.length > 0
        ? preferences.reduce((sum, p) => sum + p.intensity, 0) / preferences.length
        : 0;

    const highIntensityCount = preferences.filter((p) => p.intensity >= 4).length;
    const hardLimitsCount = limits.filter((l) => l.type === "hard").length;

    return { avgIntensity, highIntensityCount, hardLimitsCount };
  }, [preferences, limits]);

  // Prepare radar chart data (top 8 preferences by intensity)
  const radarData = useMemo(() => {
    return preferences
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 8)
      .map((p) => ({
        axis: p.descriptor.replace(/_/g, " ").slice(0, 15),
        value: p.intensity,
        category: getCategoryFromDescriptor(p.descriptor),
      }));
  }, [preferences]);

  // Filter preferences by category
  const filteredPreferences = useMemo(() => {
    if (!selectedCategory) return preferences;
    return preferences.filter((p) => getCategoryFromDescriptor(p.descriptor) === selectedCategory);
  }, [preferences, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(preferences.map((p) => getCategoryFromDescriptor(p.descriptor)));
    return Array.from(cats);
  }, [preferences]);

  if (preferences.length === 0 && limits.length === 0) {
    return (
      <GlassCard className={className}>
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
            <Info className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <div>
            <h3 className="text-lg font-heading text-[var(--color-text-primary)]">No Profile Data</h3>
            <p className="text-sm text-[var(--color-text-muted)]">No kink profile data is available for this character.</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <GlassCard>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <p className="text-2xl font-bold text-[var(--color-accent-primary)]">{preferences.length}</p>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Preferences</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              <p className="text-2xl font-bold text-[var(--color-accent-secondary)]">{limits.length}</p>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Limits</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-[var(--color-text-primary)]" />
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.avgIntensity.toFixed(1)}</p>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Avg Intensity</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-[var(--color-surface)]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <p className="text-2xl font-bold text-[var(--color-accent-primary)]">{stats.highIntensityCount}</p>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">High Intensity</p>
          </div>
        </CardContent>
      </GlassCard>

      {/* View Toggle */}
      <GlassCard>
        <CardHeader className="flex items-center justify-between border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <Radar className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Preference Profile</h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeView === "chart" ? "secondary" : "ghost"}
              size="sm"
              onPress={() => setActiveView("chart")}
              className={activeView === "chart" ? "" : "text-[var(--color-text-muted)]"}
            >
              <Radar className="w-4 h-4 mr-1" />
              Chart
            </Button>
            <Button
              variant={activeView === "list" ? "secondary" : "ghost"}
              size="sm"
              onPress={() => setActiveView("list")}
              className={activeView === "list" ? "" : "text-[var(--color-text-muted)]"}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {activeView === "chart" ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {radarData.length > 0 ? (
                  <>
                    <div className="flex justify-center">
                      <RadarChart data={radarData} width={400} height={400} />
                    </div>

                    {/* Category Legend */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.map((cat) => {
                        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
                        return (
                          <Chip
                            key={cat}
                            size="sm"
                            variant="soft"
                            className={`${colors.bg} ${colors.text} ${colors.border} border cursor-pointer`}
                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                          >
                            {cat.replace(/_/g, " ")}
                          </Chip>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-[var(--color-text-muted)]">No preference data available for chart.</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {filteredPreferences.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredPreferences.map((pref, idx) => (
                      <PreferenceCard key={pref.id} preference={pref} index={idx} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[var(--color-text-muted)]">No preferences in this category.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </GlassCard>

      {/* Limits Section */}
      {limits.length > 0 && (
        <GlassCard>
          <CardHeader className="flex items-center gap-3 border-b border-[var(--glass-border)]">
            <Lock className="w-5 h-5 text-[var(--color-accent-secondary)]" />
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Limits & Boundaries</h3>
            <Chip size="sm" variant="soft" className="ml-auto bg-red-500/20 text-red-400">
              {stats.hardLimitsCount} Hard
            </Chip>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {limits.map((limit, idx) => (
                <LimitCard key={limit.id} limit={limit} index={idx} />
              ))}
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Evolution Section */}
      {evolution && evolution.length > 0 && (
        <GlassCard>
          <CardHeader className="flex items-center gap-3 border-b border-[var(--glass-border)]">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Profile Evolution</h3>
          </CardHeader>

          <CardContent className="pt-6">
            <EvolutionTimeline evolution={evolution} />
          </CardContent>
        </GlassCard>
      )}
    </div>
  );
}

export default KinkProfileVisualization;
