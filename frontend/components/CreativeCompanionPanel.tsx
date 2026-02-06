"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Waves,
  Lightbulb,
  Network,
  Shuffle,
  X,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  Zap,
  BrainCircuit,
} from "lucide-react";
import {
  Tabs,
  Button,
  Chip,
  Card,
} from "@heroui/react";

import mutationCardsData from "@/../data/creative/mutation_cards.json";
import ripplePreviewsData from "@/../data/creative/ripple_previews.json";
import promptDeckData from "@/../data/creative/prompt_deck.json";
import inspirationGraphData from "@/../data/creative/inspiration_graph.json";
import serendipityIndexData from "@/../data/derived/serendipity_index.json";

interface MutationCard {
  card_id: string;
  title: string;
  hook: string;
  source_element: string;
  mutation_type: "intensify" | "transform" | "complicate" | "expose" | "merge";
  bst_signature: string[];
  constraints: string[];
  possibilities: string[];
  intensity_increase: number;
  taboo_potential: string[];
}

interface RipplePreview {
  ripple_id: string;
  source_card: string;
  change_summary: string;
  ripples: Array<{
    order: number;
    type: "character_arc" | "relationship_web" | "mythos_evolution" | "atmosphere_shift" | "plot_divergence";
    target: string;
    effect: string;
    magnitude: "subtle" | "moderate" | "significant" | "dramatic";
  }>;
}

interface PromptCard {
  prompt_id: string;
  type: "what_if" | "yes_and" | "tell_from" | "without" | "combine";
  title: string;
  prompt: string;
  source_elements: string[];
  tags: string[];
  constraints: string[];
  variations: Array<{ twist: string; focus: string }>;
  difficulty: "easy" | "medium" | "hard";
  creative_potential: number;
}

interface InspirationNode {
  node_id: string;
  type: string;
  title: string;
  content: string;
  source: {
    type: string;
    id: string;
  };
  activation_keys: string[];
}

interface SerendipitySuggestion {
  suggestion_id: string;
  from_entity: string;
  to_entity: string;
  type: string;
  reason: string;
  surprise_factor: number;
  explanation: string;
  discovery_path: string[];
}

interface CreativeCompanionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "mythos" | "character" | "episode";
}

type TabKey = "mutations" | "ripples" | "prompts" | "inspiration" | "serendipity";

const mutationTypeColors: Record<string, string> = {
  intensify: "#ff6b9d",
  transform: "#8b5cf6",
  complicate: "#f59e0b",
  expose: "#10b981",
  merge: "#3b82f6",
};

const promptTypeIcons: Record<string, React.ReactNode> = {
  what_if: <BrainCircuit className="w-4 h-4" />,
  yes_and: <Sparkles className="w-4 h-4" />,
  tell_from: <ExternalLink className="w-4 h-4" />,
  without: <X className="w-4 h-4" />,
  combine: <Shuffle className="w-4 h-4" />,
};

export function CreativeCompanionPanel({
  isOpen,
  onClose,
  entityId,
  entityType,
}: CreativeCompanionPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("mutations");
  const [isExpanded, setIsExpanded] = useState(false);

  // Load persisted state
  useEffect(() => {
    const savedTab = localStorage.getItem("creative-panel-tab") as TabKey;
    if (savedTab && ["mutations", "ripples", "prompts", "inspiration", "serendipity"].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Persist tab state
  useEffect(() => {
    localStorage.setItem("creative-panel-tab", activeTab);
  }, [activeTab]);

  // Filter mutation cards by entity
  const relevantMutations = useMemo(() => {
    return (mutationCardsData as { cards: MutationCard[] }).cards.filter(
      (card) => card.source_element === entityId
    );
  }, [entityId]);

  // Filter ripple previews by mutation cards
  const relevantRipples = useMemo(() => {
    const mutationIds = relevantMutations.map((m) => m.card_id);
    return (ripplePreviewsData as { previews: RipplePreview[] }).previews.filter((r) =>
      mutationIds.includes(r.source_card)
    );
  }, [relevantMutations]);

  // Filter prompts by entity
  const relevantPrompts = useMemo(() => {
    return (promptDeckData as { prompts: PromptCard[] }).prompts.filter(
      (p) => p.source_elements.includes(entityId) || p.source_elements.length === 0
    ).slice(0, 10);
  }, [entityId]);

  // Filter inspiration nodes by entity
  const relevantInspiration = useMemo(() => {
    return (inspirationGraphData as { nodes: InspirationNode[] }).nodes.filter(
      (n) => n.source.id === entityId || n.activation_keys.some((k) => entityId.includes(k))
    ).slice(0, 7);
  }, [entityId]);

  // Filter serendipity by entity
  const relevantSerendipity = useMemo(() => {
    return (serendipityIndexData as { suggestions: SerendipitySuggestion[] }).suggestions.filter(
      (s) => s.from_entity === entityId || s.to_entity === entityId
    ).slice(0, 5);
  }, [entityId]);

  const panelVariants = {
    closed: { x: "100%", opacity: 0 },
    open: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      }
    },
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 h-full bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 overflow-hidden flex flex-col"
            style={{ width: isExpanded ? "800px" : "450px", maxWidth: "100vw" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Creative Companion
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => setIsExpanded(!isExpanded)}
                  className="text-[var(--color-text-muted)]"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={onClose}
                  className="text-[var(--color-text-muted)]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-4">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as TabKey)}
                variant="secondary"
              >
                <Tabs.List className="w-full">
                  <Tabs.Tab key="mutations">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mutations</span>
                      <span className="sm:hidden">Mut</span>
                    </div>
                  </Tabs.Tab>
                  <Tabs.Tab key="ripples">
                    <div className="flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ripples</span>
                      <span className="sm:hidden">Rip</span>
                    </div>
                  </Tabs.Tab>
                  <Tabs.Tab key="prompts">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prompts</span>
                      <span className="sm:hidden">Prm</span>
                    </div>
                  </Tabs.Tab>
                  <Tabs.Tab key="inspiration">
                    <div className="flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Inspiration</span>
                      <span className="sm:hidden">Ins</span>
                    </div>
                  </Tabs.Tab>
                  <Tabs.Tab key="serendipity">
                    <div className="flex items-center gap-1.5">
                      <Shuffle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Serendipity</span>
                      <span className="sm:hidden">Srn</span>
                    </div>
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Mutations Tab */}
                  {activeTab === "mutations" && (
                    <div className="space-y-3">
                      {relevantMutations.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No mutation cards for this entity yet.</p>
                        </div>
                      ) : (
                        relevantMutations.map((card) => (
                          <Card
                            key={card.card_id}
                            className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-[var(--color-text-primary)]">
                                {card.title}
                              </h3>
                              <Chip
                                size="sm"
                                variant="secondary"
                                style={{ 
                                  backgroundColor: mutationTypeColors[card.mutation_type] + "30",
                                  color: mutationTypeColors[card.mutation_type]
                                }}
                              >
                                {card.mutation_type}
                              </Chip>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                              {card.hook}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <Zap className="w-3 h-3 text-[var(--color-accent-primary)]" />
                                <span className="text-[var(--color-text-muted)]">
                                  Intensity +{card.intensity_increase}
                                </span>
                              </div>
                              {card.taboo_potential.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {card.taboo_potential.map((taboo) => (
                                    <Chip key={taboo} size="sm" variant="secondary">
                                      {taboo}
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {/* Ripples Tab */}
                  {activeTab === "ripples" && (
                    <div className="space-y-4">
                      {relevantRipples.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                          <Waves className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No ripple effects calculated yet.</p>
                        </div>
                      ) : (
                        relevantRipples.map((ripple) => (
                          <Card
                            key={ripple.ripple_id}
                            className="bg-white/5 border-white/10 p-4"
                          >
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                              {ripple.change_summary}
                            </p>
                            <div className="space-y-2">
                              {ripple.ripples.map((r) => (
                                <div
                                  key={r.order}
                                  className="flex items-start gap-3 p-2 rounded bg-white/5"
                                >
                                  <span className="text-xs font-mono text-[var(--color-accent-primary)]">
                                    {r.order}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-[var(--color-text-primary)]">
                                      {r.effect}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Chip size="sm" variant="secondary">
                                        {r.type}
                                      </Chip>
                                      <span className="text-xs text-[var(--color-text-muted)]">
                                        {r.magnitude}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {/* Prompts Tab */}
                  {activeTab === "prompts" && (
                    <div className="space-y-3">
                      {relevantPrompts.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No prompts available for this entity.</p>
                        </div>
                      ) : (
                        relevantPrompts.map((prompt) => (
                          <Card
                            key={prompt.prompt_id}
                            className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className="text-[var(--color-accent-primary)]">
                                {promptTypeIcons[prompt.type] || <Lightbulb className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-[var(--color-text-primary)]">
                                  {prompt.title}
                                </h3>
                                <p className="text-xs text-[var(--color-text-muted)] capitalize">
                                  {prompt.type.replace("_", " ")} • {prompt.difficulty}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                              {prompt.prompt}
                            </p>
                            {prompt.variations.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-[var(--color-text-muted)]">Variations:</p>
                                {prompt.variations.slice(0, 2).map((v, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <ChevronRight className="w-3 h-3 text-[var(--color-accent-primary)]" />
                                    <span className="text-[var(--color-text-secondary)]">
                                      {v.twist}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {/* Inspiration Tab */}
                  {activeTab === "inspiration" && (
                    <div className="space-y-3">
                      {relevantInspiration.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                          <Network className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No inspiration nodes activated for this entity.</p>
                        </div>
                      ) : (
                        relevantInspiration.map((node) => (
                          <Card
                            key={node.node_id}
                            className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Chip size="sm" variant="secondary">
                                {node.type}
                              </Chip>
                              <span className="text-xs text-[var(--color-text-muted)]">
                                from {node.source.type}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                              {node.title}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {node.content}
                            </p>
                            {node.activation_keys.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {node.activation_keys.map((key) => (
                                  <Chip key={key} size="sm" variant="secondary">
                                    {key}
                                  </Chip>
                                ))}
                              </div>
                            )}
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {/* Serendipity Tab */}
                  {activeTab === "serendipity" && (
                    <div className="space-y-3">
                      {relevantSerendipity.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                          <Shuffle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No serendipitous connections found yet.</p>
                        </div>
                      ) : (
                        relevantSerendipity.map((suggestion) => (
                          <Card
                            key={suggestion.suggestion_id}
                            className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Chip
                                size="sm"
                                variant="secondary"
                                style={{
                                  backgroundColor: suggestion.surprise_factor > 0.7 ? "#ff6b9d30" : "var(--color-bg-tertiary)",
                                  color: suggestion.surprise_factor > 0.7 ? "#ff6b9d" : "var(--color-text-secondary)"
                                }}
                              >
                                {suggestion.type}
                              </Chip>
                              <span className="text-xs text-[var(--color-text-muted)]">
                                surprise: {(suggestion.surprise_factor * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-sm text-[var(--color-text-primary)] mb-2">
                              {suggestion.reason}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {suggestion.explanation}
                            </p>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>Shadow Lore Forge</span>
                <span>{entityType}: {entityId}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreativeCompanionPanel;
