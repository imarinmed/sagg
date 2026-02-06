"use client";

import React from "react";
import { Card } from "@heroui/react";
import { GitCompare } from "lucide-react";

interface VersionData {
  description: string;
  traits?: string[];
  abilities?: string[];
  weaknesses?: string[];
}

interface SideBySideComparisonProps {
  entityId: string;
  entityName: string;
  bstVersion: VersionData;
  sstVersion: VersionData;
  divergences: Array<{
    kind: string;
    bst: string;
    sst: string;
  }>;
}

export function SideBySideComparison({
  entityId,
  entityName,
  bstVersion,
  sstVersion,
  divergences,
}: SideBySideComparisonProps) {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-[var(--color-accent-primary)]" />
          {entityName} - BST vs SST Comparison
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400">BST (Canon)</span>
          <span className="px-3 py-1 rounded bg-red-500/20 text-red-400">SST (Dark)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BST Column */}
        <Card className="p-6 bg-blue-500/5 border-blue-500/20">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">BST - Canonical</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">{bstVersion.description}</p>
          
          {bstVersion.traits && bstVersion.traits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">Traits</h4>
              <ul className="list-disc list-inside space-y-1">
                {bstVersion.traits.map((trait, i) => (
                  <li key={i} className="text-[var(--color-text-secondary)]">{trait}</li>
                ))}
              </ul>
            </div>
          )}

          {bstVersion.abilities && bstVersion.abilities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">Abilities</h4>
              <ul className="list-disc list-inside space-y-1">
                {bstVersion.abilities.map((ability, i) => (
                  <li key={i} className="text-[var(--color-text-secondary)]">{ability}</li>
                ))}
              </ul>
            </div>
          )}

          {bstVersion.weaknesses && bstVersion.weaknesses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">Weaknesses</h4>
              <ul className="list-disc list-inside space-y-1">
                {bstVersion.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-[var(--color-text-secondary)]">{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* SST Column */}
        <Card className="p-6 bg-red-500/5 border-red-500/20">
          <h3 className="text-lg font-semibold mb-4 text-red-400">SST - Dark Adaptation</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">{sstVersion.description}</p>
          
          {sstVersion.traits && sstVersion.traits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">Traits</h4>
              <ul className="list-disc list-inside space-y-1">
                {sstVersion.traits.map((trait, i) => (
                  <li key={i} className="text-[var(--color-text-secondary)]">{trait}</li>
                ))}
              </ul>
            </div>
          )}

          {sstVersion.abilities && sstVersion.abilities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">Abilities</h4>
              <ul className="list-disc list-inside space-y-1">
                {sstVersion.abilities.map((ability, i) => (
                  <li key={i} className="text-[var(--color-text-secondary)]">{ability}</li>
                ))}
              </ul>
            </div>
          )}

          {sstVersion.weaknesses && sstVersion.weaknesses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">Weaknesses</h4>
              <ul className="list-disc list-inside space-y-1">
                {sstVersion.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-[var(--color-text-secondary)]">{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Divergences Section */}
      {divergences.length > 0 && (
        <Card className="p-6 bg-[var(--color-bg-secondary)]/50">
          <h3 className="text-lg font-semibold mb-4">Key Divergences</h3>
          <div className="space-y-4">
            {divergences.map((div, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--color-bg-primary)]">
                <div className="col-span-1">
                  <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                    {div.kind}
                  </span>
                </div>
                <div className="col-span-1 text-blue-400">{div.bst}</div>
                <div className="col-span-1 text-red-400">{div.sst}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default SideBySideComparison;
