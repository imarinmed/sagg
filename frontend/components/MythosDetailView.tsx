"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Zap,
  AlertTriangle,
  Users,
  Film,
  BookOpen,
  Heart,
  Moon,
  Sun,
  ChevronRight,
  Info,
} from "lucide-react";
import { Chip, Tabs, Button } from "@heroui/react";
import Link from "next/link";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { MythosElement } from "@/lib/api";

export interface MythosDetailViewProps {
  element: MythosElement;
  relatedElements?: MythosElement[];
  className?: string;
}

type ViewMode = "combined" | "bst" | "sst";

export function MythosDetailView({
  element,
  relatedElements = [],
  className = "",
}: MythosDetailViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("combined");
  const [activeTab, setActiveTab] = useState("overview");

  const hasBST = element.significance || element.description;
  const hasSST = element.dark_variant || element.erotic_implications || element.taboo_potential;
  const hasBoth = hasBST && hasSST;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      biology: "DNA",
      supernatural: "Sparkles",
      society: "Building",
      psychology: "Brain",
      rules: "Scale",
    };
    return icons[category.toLowerCase()] || "Book";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <GlassCard>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--glass-border)]">
                  {element.category}
                </span>
                {hasBoth && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    BST + SST
                  </span>
                )}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl text-[var(--color-text-primary)] mb-2">
                {element.name}
              </h1>
              {element.short_description && (
                <p className="text-lg text-[var(--color-text-secondary)]">
                  {element.short_description}
                </p>
              )}
            </div>
            
            {hasBoth && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface)]">
                <Button
                  size="sm"
                  variant={viewMode === "bst" ? "secondary" : "ghost"}
                  onPress={() => setViewMode("bst")}
                  className="text-xs"
                >
                  <Sun className="w-3.5 h-3.5 mr-1" />
                  BST
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "combined" ? "secondary" : "ghost"}
                  onPress={() => setViewMode("combined")}
                  className="text-xs"
                >
                  Both
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "sst" ? "secondary" : "ghost"}
                  onPress={() => setViewMode("sst")}
                  className="text-xs"
                >
                  <Moon className="w-3.5 h-3.5 mr-1" />
                  SST
                </Button>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
            <Tabs.List className="glass rounded-lg p-1 mb-6">
              <Tabs.Tab key="overview">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Overview
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="traits">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Traits
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="connections">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Connections
                </div>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel key="overview">
              <div className="space-y-6">
                {(viewMode === "combined" || viewMode === "bst") && element.description && (
                  <GlassCard>
                    <CardHeader className="border-b border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-400" />
                        <h3 className="font-heading text-lg">BST Canon</h3>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {element.description}
                      </p>
                    </CardContent>
                  </GlassCard>
                )}

                {(viewMode === "combined" || viewMode === "sst") && hasSST && (
                  <GlassCard className="border-purple-500/30">
                    <CardHeader className="border-b border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-purple-400" />
                        <h3 className="font-heading text-lg text-purple-400">SST Dark Adaptation</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {element.dark_variant && (
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                          {element.dark_variant}
                        </p>
                      )}
                      {element.erotic_implications && (
                        <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="font-medium text-pink-400">Erotic Implications</span>
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)]">{element.erotic_implications}</p>
                        </div>
                      )}
                    </CardContent>
                  </GlassCard>
                )}
              </div>
            </Tabs.Panel>

            <Tabs.Panel key="traits">
              <div className="grid md:grid-cols-2 gap-6">
                {element.traits && element.traits.length > 0 && (
                  <GlassCard>
                    <CardHeader className="border-b border-[var(--glass-border)]">
                      <h3 className="font-heading text-lg">Traits</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {element.traits.map((trait) => (
                          <Chip key={trait} variant="soft" size="sm" className="bg-[var(--color-surface)]">
                            {trait}
                          </Chip>
                        ))}
                      </div>
                    </CardContent>
                  </GlassCard>
                )}

                {element.abilities && element.abilities.length > 0 && (
                  <GlassCard>
                    <CardHeader className="border-b border-[var(--glass-border)]">
                      <h3 className="font-heading text-lg">Abilities</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {element.abilities.map((ability) => (
                          <li key={ability} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                            <ChevronRight className="w-4 h-4 text-[var(--color-accent-primary)] mt-0.5 shrink-0" />
                            <span>{ability}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </GlassCard>
                )}

                {element.weaknesses && element.weaknesses.length > 0 && (
                  <GlassCard>
                    <CardHeader className="border-b border-[var(--glass-border)]">
                      <h3 className="font-heading text-lg">Weaknesses</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {element.weaknesses.map((weakness) => (
                          <li key={weakness} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                            <AlertTriangle className="w-4 h-4 text-[var(--color-accent-secondary)] mt-0.5 shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </GlassCard>
                )}
              </div>
            </Tabs.Panel>

            <Tabs.Panel key="connections">
              <div className="space-y-6">
                {element.related_characters && element.related_characters.length > 0 && (
                  <GlassCard>
                    <CardHeader className="border-b border-[var(--glass-border)]">
                      <h3 className="font-heading text-lg">Related Characters</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {element.related_characters.map((charId) => (
                          <Link key={charId} href={`/characters/${charId}`}>
                            <div className="p-3 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                              <span className="text-sm text-[var(--color-text-secondary)]">{charId.replace(/_/g, " ")}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </GlassCard>
                )}

                {element.related_episodes && element.related_episodes.length > 0 && (
                  <GlassCard>
                    <CardHeader className="border-b border-[var(--glass-border)]">
                      <h3 className="font-heading text-lg">Appears In</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {element.related_episodes.map((episodeId) => (
                          <Link key={episodeId} href={`/episodes/${episodeId}`}>
                            <Chip variant="soft" size="sm" className="bg-[var(--color-surface)] cursor-pointer">
                              {episodeId.toUpperCase()}
                            </Chip>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </GlassCard>
                )}
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <CardHeader className="border-b border-[var(--glass-border)]">
              <h3 className="font-heading">Quick Info</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-muted)]">Category</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--color-surface)] border border-[var(--glass-border)]">{element.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-muted)]">Traits</span>
                <span className="font-medium">{element.traits?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-muted)]">Abilities</span>
                <span className="font-medium">{element.abilities?.length || 0}</span>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default MythosDetailView;
