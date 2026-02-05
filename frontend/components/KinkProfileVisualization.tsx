"use client";

import React, { useState } from "react";
import { Chip, Accordion } from "@heroui/react";
import { ChevronDown, Lock, Unlock, TrendingUp } from "lucide-react";

interface KinkPreference {
  descriptor: string;
  intensity: number;
  context?: string;
}

interface KinkLimit {
  descriptor: string;
  type: string;
  note?: string;
}

interface KinkEvolution {
  episode_id: string;
  descriptors: Record<string, number>;
}

interface KinkProfileVisualizationProps {
  preferences: KinkPreference[];
  limits: KinkLimit[];
  evolution: KinkEvolution[];
  showEvolution?: boolean;
}

// Category-based color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  consent: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  power_exchange: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  dominance: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  submission: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  physical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  psychological: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  vampire: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  blood: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  sensory: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  relationship: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  default: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
};

function getCategoryFromDescriptor(descriptor: string): string {
  const lowerDesc = descriptor.toLowerCase();
  if (lowerDesc.includes("consent") || lowerDesc.includes("negotiat")) return "consent";
  if (lowerDesc.includes("domin") || lowerDesc.includes("control")) return "dominance";
  if (lowerDesc.includes("submis") || lowerDesc.includes("surrender")) return "submission";
  if (lowerDesc.includes("power") || lowerDesc.includes("exchange")) return "power_exchange";
  if (lowerDesc.includes("blood") || lowerDesc.includes("feed") || lowerDesc.includes("bite")) return "blood";
  if (lowerDesc.includes("vampire") || lowerDesc.includes("immortal")) return "vampire";
  if (lowerDesc.includes("physical") || lowerDesc.includes("impact") || lowerDesc.includes("pain")) return "physical";
  if (lowerDesc.includes("psycho") || lowerDesc.includes("mind") || lowerDesc.includes("mental")) return "psychological";
  if (lowerDesc.includes("sensory") || lowerDesc.includes("sensation")) return "sensory";
  if (lowerDesc.includes("relation") || lowerDesc.includes("bond")) return "relationship";
  return "default";
}

function IntensityMeter({ value, max = 5 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  const color = value <= 2 ? "bg-blue-500" : value <= 3 ? "bg-yellow-500" : value <= 4 ? "bg-orange-500" : "bg-red-500";
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-[var(--color-text-muted)] w-6 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

export function KinkProfileVisualization({
  preferences,
  limits,
  evolution,
  showEvolution = true,
}: KinkProfileVisualizationProps) {
  const [expandedPreferences, setExpandedPreferences] = useState(false);
  const [expandedLimits, setExpandedLimits] = useState(false);

  // Group preferences by intensity
  const highIntensity = preferences.filter((p) => p.intensity >= 4);
  const mediumIntensity = preferences.filter((p) => p.intensity >= 2 && p.intensity < 4);
  const lowIntensity = preferences.filter((p) => p.intensity < 2);

  // Group limits by type
  const hardLimits = limits.filter((l) => l.type === "hard");
  const softLimits = limits.filter((l) => l.type === "soft");

  // Calculate profile summary
  const avgIntensity = preferences.length > 0
    ? Math.round(preferences.reduce((sum, p) => sum + p.intensity, 0) / preferences.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] text-center border border-[var(--color-border)]">
          <p className="text-2xl font-bold text-[#D4AF37]">{preferences.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Preferences
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] text-center border border-[var(--color-border)]">
          <p className="text-2xl font-bold text-[var(--color-accent-secondary)]">{limits.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Limits
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] text-center border border-[var(--color-border)]">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{avgIntensity}</p>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Avg Intensity
          </p>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedPreferences(!expandedPreferences)}
        >
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
              Preferences
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${
              expandedPreferences ? "rotate-180" : ""
            }`} 
          />
        </div>

        {/* Quick Tags */}
        <div className="flex flex-wrap gap-2">
          {preferences.slice(0, expandedPreferences ? undefined : 8).map((pref, idx) => {
            const category = getCategoryFromDescriptor(pref.descriptor);
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
            
            return (
              <Chip
                key={idx}
                size="sm"
                variant="soft"
                className={`${colors.bg} ${colors.text} ${colors.border} border`}
              >
                <span className="capitalize">{pref.descriptor.replace(/_/g, " ")}</span>
                <span className="ml-1 opacity-60">({pref.intensity})</span>
              </Chip>
            );
          })}
          {!expandedPreferences && preferences.length > 8 && (
            <Chip
              size="sm"
              variant="soft"
              className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
            >
              +{preferences.length - 8} more
            </Chip>
          )}
        </div>

        {/* Detailed list when expanded */}
        {expandedPreferences && (
          <div className="space-y-4 pt-2 animate-fade-in-up">
            {/* High Intensity */}
            {highIntensity.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-accent-secondary)] mb-2 uppercase tracking-wider">
                  High Intensity
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {highIntensity.map((pref, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium capitalize text-[var(--color-text-primary)]">
                          {pref.descriptor.replace(/_/g, " ")}
                        </span>
                      </div>
                      <IntensityMeter value={pref.intensity} />
                      {pref.context && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-2">
                          {pref.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Intensity */}
            {mediumIntensity.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#D4AF37] mb-2 uppercase tracking-wider">
                  Moderate Interest
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mediumIntensity.map((pref, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium capitalize text-[var(--color-text-primary)]">
                          {pref.descriptor.replace(/_/g, " ")}
                        </span>
                      </div>
                      <IntensityMeter value={pref.intensity} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Limits Section */}
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedLimits(!expandedLimits)}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--color-accent-secondary)]" />
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
              Limits
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${
              expandedLimits ? "rotate-180" : ""
            }`} 
          />
        </div>

        {/* Limit Tags */}
        <div className="flex flex-wrap gap-2">
          {limits.slice(0, expandedLimits ? undefined : 6).map((limit, idx) => (
            <Chip
              key={idx}
              size="sm"
              variant="soft"
              className={
                limit.type === "hard"
                  ? "bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/30"
                  : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              }
            >
              <span className="capitalize">{limit.descriptor.replace(/_/g, " ")}</span>
              <span className="ml-1 text-xs opacity-60">({limit.type})</span>
            </Chip>
          ))}
          {!expandedLimits && limits.length > 6 && (
            <Chip
              size="sm"
              variant="soft"
              className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
            >
              +{limits.length - 6} more
            </Chip>
          )}
        </div>

        {/* Detailed limits when expanded */}
        {expandedLimits && limits.length > 0 && (
          <div className="space-y-4 pt-2 animate-fade-in-up">
            {hardLimits.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-accent-secondary)] mb-2 uppercase tracking-wider">
                  Hard Limits
                </p>
                <div className="space-y-2">
                  {hardLimits.map((limit, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20"
                    >
                      <span className="font-medium capitalize text-[var(--color-accent-secondary)]">
                        {limit.descriptor.replace(/_/g, " ")}
                      </span>
                      {limit.note && (
                        <p className="text-xs text-[var(--color-accent-secondary)]/80 mt-1">
                          {limit.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {softLimits.length > 0 && (
              <div>
                <p className="text-xs font-medium text-orange-400 mb-2 uppercase tracking-wider">
                  Soft Limits
                </p>
                <div className="space-y-2">
                  {softLimits.map((limit, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
                    >
                      <span className="font-medium capitalize text-orange-400">
                        {limit.descriptor.replace(/_/g, " ")}
                      </span>
                      {limit.note && (
                        <p className="text-xs text-orange-400/80 mt-1">
                          {limit.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Evolution Section */}
      {showEvolution && evolution.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
              Profile Evolution
            </h3>
          </div>
          
          <Accordion>
            {evolution.map((evo) => (
              <Accordion.Item key={evo.episode_id}>
                <Accordion.Heading>
                  <Accordion.Trigger>
                    <span className="font-semibold uppercase text-[var(--color-text-primary)]">
                      {evo.episode_id}
                    </span>
                    <Chip
                      size="sm"
                      variant="soft"
                      className="ml-2 bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                    >
                      {Object.keys(evo.descriptors).length} traits
                    </Chip>
                    <Accordion.Indicator>
                      <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>
                    <div className="space-y-2">
                      {Object.entries(evo.descriptors).map(([descriptor, intensity]) => (
                        <div
                          key={descriptor}
                          className="p-3 rounded-lg bg-[var(--color-surface)]"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium capitalize text-[var(--color-text-primary)]">
                              {descriptor.replace(/_/g, " ")}
                            </span>
                          </div>
                          <IntensityMeter value={intensity} />
                        </div>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
