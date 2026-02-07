import React from 'react';
import { Card } from "@heroui/react";

interface EntityMetrics {
  traits: number;
  abilities: number;
  weaknesses: number;
}

interface EntityDataCardProps {
  name: string;
  imageUrl?: string;
  metrics: EntityMetrics;
  className?: string;
}

export const EntityDataCard = ({
  name,
  imageUrl,
  metrics,
  className = '',
}: EntityDataCardProps) => {
  return (
    <Card className={`glass-archive overflow-hidden rounded-lg border border-[var(--archive-border)] bg-[var(--entity-card-bg)] p-0 ${className}`}>
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface-elevated)]">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
            <span className="font-mono text-xs uppercase tracking-widest">No Visual Data</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent p-4 pt-12">
          <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">{name}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[var(--color-border-subtle)] border-t border-[var(--color-border-subtle)]">
        <div className="flex flex-col items-center py-3">
          <span className="font-mono text-lg font-bold text-[var(--color-section-accent)]">{metrics.traits}</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Traits</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="font-mono text-lg font-bold text-[var(--color-section-accent)]">{metrics.abilities}</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Abilities</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="font-mono text-lg font-bold text-[var(--color-section-accent)]">{metrics.weaknesses}</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Weakness</span>
        </div>
      </div>
    </Card>
  );
};
