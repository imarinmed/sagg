"use client";

import { StaticCharacter } from "@/lib/characterData";

interface CharacterStatsPanelProps {
  character: StaticCharacter;
}

export default function CharacterStatsPanel({ character }: CharacterStatsPanelProps) {
  const metrics = character.performance_metrics;
  const vitals = character.vitals;
  const physical = character.physical_profile;

  const renderStatBar = (label: string, value: number, max: number = 10) => {
    const percentage = (value / max) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--color-text-muted)]">{label}</span>
          <span className="text-[var(--color-accent-primary)] font-mono">{value}/{max}</span>
        </div>
        <div className="h-1.5 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--blood-crimson)] to-[var(--color-accent-primary)] rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="glass rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-3">
        Physical Specifications
      </h3>

      {physical && (
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
            <span className="text-[var(--color-text-muted)] text-sm">Height</span>
            <span className="text-[var(--color-text-primary)] font-mono">{physical.height}</span>
          </div>
          {physical.measurements && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-muted)] text-sm">Bust</span>
                <span className="text-[var(--color-text-primary)] font-mono">{physical.measurements.bust}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-muted)] text-sm">Waist</span>
                <span className="text-[var(--color-text-primary)] font-mono">{physical.measurements.waist}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-muted)] text-sm">Hips</span>
                <span className="text-[var(--color-text-primary)] font-mono">{physical.measurements.hips}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-[var(--color-text-muted)] text-sm">Build</span>
            <span className="text-[var(--color-text-primary)] capitalize">{physical.build}</span>
          </div>
        </div>
      )}

      {metrics && (
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
            Performance Metrics
          </h4>
          {renderStatBar("Stamina", metrics.stamina)}
          {renderStatBar("Flexibility", metrics.flexibility)}
          {renderStatBar("Pain Tolerance", metrics.pain_tolerance)}
          {renderStatBar("Recovery Rate", metrics.recovery_rate)}
        </div>
      )}

      {vitals && (
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            Vitals
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass p-3 rounded text-center">
              <div className="text-xs text-[var(--color-text-muted)] mb-1">Blood Type</div>
              <div className="text-lg font-mono text-[var(--blood-crimson)]">{vitals.blood_type}</div>
            </div>
            <div className="glass p-3 rounded text-center">
              <div className="text-xs text-[var(--color-text-muted)] mb-1">Heart Rate</div>
              <div className="text-lg font-mono text-[var(--color-accent-primary)]">
                {vitals.heart_rate_resting}
                <span className="text-xs text-[var(--color-text-muted)]">bpm</span>
              </div>
            </div>
          </div>
          <div className="mt-3 glass p-3 rounded text-center">
            <div className="text-xs text-[var(--color-text-muted)] mb-1">Body Temperature</div>
            <div className="text-lg font-mono text-[var(--color-text-primary)]">{vitals.body_temperature}</div>
          </div>
        </div>
      )}

      {physical?.distinguishing_features && physical.distinguishing_features.length > 0 && (
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            Distinguishing Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {physical.distinguishing_features.map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-xs rounded capitalize"
              >
                {feature.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
