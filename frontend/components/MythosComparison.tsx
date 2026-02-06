"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, ArrowRight, Check, X, AlertCircle } from "lucide-react";

import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { MythosElement } from "@/lib/api";

export interface MythosComparisonProps {
  element: MythosElement;
  className?: string;
}

export function MythosComparison({ element, className = "" }: MythosComparisonProps) {
  const hasBST = element.description || element.significance;
  const hasSST = element.dark_variant || element.erotic_implications;

  if (!hasBST || !hasSST) {
    return (
      <GlassCard className={className}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
          <p className="text-[var(--color-text-muted)]">No comparison available - element only exists in one version.</p>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* BST Column */}
        <GlassCard className="border-amber-500/30">
          <CardHeader className="border-b border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-heading text-lg text-amber-400">BST Canon</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Original Version</p>
              </div>
            </div>          </CardHeader>          
          <CardContent className="space-y-4">
            {element.description && (
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Description</p>
                <p className="text-[var(--color-text-secondary)]">{element.description}</p>
              </div>            )}
            
            {element.significance && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Significance</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{element.significance}</p>
              </div>            )}
          </CardContent>        </GlassCard>

        {/* SST Column */}
        <GlassCard className="border-purple-500/30">
          <CardHeader className="border-b border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-heading text-lg text-purple-400">SST Dark Adaptation</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Dark Version</p>
              </div>
            </div>          </CardHeader>          
          <CardContent className="space-y-4">
            {element.dark_variant && (
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Dark Variant</p>
                <p className="text-[var(--color-text-secondary)]">{element.dark_variant}</p>
              </div>            )}
            
            {element.erotic_implications && (
              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Erotic Implications</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{element.erotic_implications}</p>
              </div>            )}
            
            {element.taboo_potential && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Taboo Potential</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{element.taboo_potential}</p>
              </div>            )}
          </CardContent>        </GlassCard>      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
          <span>BST Only</span>        </div>        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500/50" />
          <span>SST Only</span>        </div>        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-purple-500" />
          <span>Both Versions</span>        </div>      </div>    </div>  );
}

export default MythosComparison;
