"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Tabs,
  Chip,
  Spinner,
  ScrollShadow,
} from "@heroui/react";
import {
  User,
  Heart,
  TrendingUp,
  Network,
  Grid3X3,
  Quote,
  Sparkles,
} from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { CharacterHero } from "@/components/CharacterHero";
import { RelationshipConstellation } from "@/components/RelationshipConstellation";
import { CharacterEvolutionTimeline } from "@/components/CharacterEvolutionTimeline";
import { EpisodePresenceHeatmap } from "@/components/EpisodePresenceHeatmap";
import { KinkProfileVisualization } from "@/components/KinkProfileVisualization";
import { QuoteCarousel, extractQuotesFromEvolution } from "@/components/QuoteCarousel";
import { ForgeButton } from "@/components/ForgeButton";
import { CreativeCompanionPanel } from "@/components/CreativeCompanionPanel";
import {
  getCharacterById,
  getMockRelationshipGraph,
  getMockEvolutionData,
  getMockEpisodePresence,
  StaticCharacter,
} from "@/lib/characterData";

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<StaticCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("creative-panel-open");
    if (savedState === "true") {
      setIsPanelOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("creative-panel-open", String(isPanelOpen));
  }, [isPanelOpen]);

  useEffect(() => {
    const loadCharacter = () => {
      try {
        setLoading(true);
        setError(null);

        const charData = getCharacterById(characterId);
        if (!charData) {
          setError("Character not found");
        } else {
          setCharacter(charData);
        }
      } catch (err) {
        setError("Failed to load character");
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      loadCharacter();
    }
  }, [characterId]);

  // Get mock data
  const relationshipGraph = useMemo(() => {
    return getMockRelationshipGraph(characterId);
  }, [characterId]);

  const evolutionData = useMemo(() => {
    return getMockEvolutionData(characterId);
  }, [characterId]);

  const episodePresence = useMemo(() => {
    return getMockEpisodePresence(characterId);
  }, [characterId]);

  const canonicalTraits = character?.canonical_traits ?? [];
  const adaptationTraits = character?.adaptation_traits ?? [];
  const kinkProfile = character?.kink_profile ?? {
    preferences: [],
    limits: [],
    evolution: [],
  };

  // Determine if vampire based on canonical_traits
  const isVampire = useMemo(() => {
    return canonicalTraits.includes("vampire");
  }, [canonicalTraits]);

  // Calculate stats for hero
  const heroStats = useMemo(() => {
    return {
      episodesAppeared: episodePresence?.total_episodes || 0,
      relationships: relationshipGraph?.nodes ? relationshipGraph.nodes.length - 1 : 0,
      totalScreenTime: episodePresence
        ? formatScreenTime(episodePresence.total_screen_time)
        : "0m",
    };
  }, [episodePresence, relationshipGraph]);

  // Extract quotes from evolution milestones
  const quotes = useMemo(() => {
    if (!evolutionData?.milestones) return [];
    return extractQuotesFromEvolution(evolutionData.milestones);
  }, [evolutionData]);

  const handleNodeClick = (nodeId: string) => {
    router.push(`/characters/${nodeId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-accent-secondary)]">
          {error || "Character not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 animate-fade-in-up">
      <div className="absolute top-4 right-4 z-50">
        <ForgeButton onClick={() => setIsPanelOpen(true)} />
      </div>

      {/* Character Hero */}
      <CharacterHero
        character={{
          id: character.id,
          name: character.name,
          portrayed_by: character.portrayed_by,
          role: character.role,
          description: character.description,
        }}
        stats={heroStats}
        isVampire={isVampire}
      />

      {/* Quotes Carousel (if quotes available) */}
      {quotes.length > 0 && (
        <div className="px-4 md:px-8 lg:px-16 py-6 bg-[var(--color-bg-secondary)]">
          <div className="max-w-4xl mx-auto">
            <QuoteCarousel
              quotes={quotes}
              characterName={character.name}
              autoRotate={true}
              autoRotateInterval={8000}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tabs.List className="glass rounded-lg p-1 mb-6">
              <Tabs.Tab key="overview">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Overview
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="relationships">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Relationships
                  {relationshipGraph && relationshipGraph.nodes.length > 1 && (
                    <span className="text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] px-1.5 rounded">
                      {relationshipGraph.nodes.length - 1}
                    </span>
                  )}
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="evolution">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Evolution
                  {evolutionData && evolutionData.milestones.length > 0 && (
                    <span className="text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] px-1.5 rounded">
                      {evolutionData.milestones.length}
                    </span>
                  )}
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="episodes">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Episodes
                  {episodePresence && (
                    <span className="text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] px-1.5 rounded">
                      {episodePresence.total_episodes}
                    </span>
                  )}
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="kink-profile">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Profile
                </div>
              </Tabs.Tab>
            </Tabs.List>

            {/* Overview Tab */}
            <Tabs.Panel key="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Canonical Info */}
                <GlassCard>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
                        Canonical Traits
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {canonicalTraits.map((trait) => (
                        <Chip
                          key={trait}
                          variant="soft"
                          size="sm"
                          className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] capitalize"
                        >
                          {trait.replace(/_/g, " ")}
                        </Chip>
                      ))}
                    </div>
                  </CardContent>
                </GlassCard>

                {/* Dark Adaptation */}
                <GlassCard className="border-[var(--color-accent-secondary)]/30">
                  <CardHeader className="border-b border-[var(--color-accent-secondary)]/20">
                    <h3 className="font-heading text-lg text-[var(--color-accent-secondary)]">
                      Dark Adaptation
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                        Adaptation Notes
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {character.adaptation_notes || "Not yet defined"}
                      </p>
                    </div>

                    {adaptationTraits.length > 0 && (
                      <div>
                        <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                          Added Traits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {adaptationTraits.map((trait) => (
                            <Chip
                              key={trait}
                              variant="soft"
                              size="sm"
                              className="bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] capitalize"
                            >
                              {trait.replace(/_/g, " ")}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>

                {/* Quick Episode Presence (mini heatmap) */}
                {episodePresence && episodePresence.episodes.length > 0 && (
                  <GlassCard className="lg:col-span-2">
                    <CardHeader>
                      <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
                        Episode Appearances
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <EpisodePresenceHeatmap
                        characterId={characterId}
                        characterName={character.name}
                        episodes={episodePresence.episodes}
                      />
                    </CardContent>
                  </GlassCard>
                )}
              </div>
            </Tabs.Panel>

            {/* Relationships Tab */}
            <Tabs.Panel key="relationships">
              <GlassCard>
                <CardHeader>
                  <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                    Relationship Constellation
                  </h2>
                </CardHeader>
                <CardContent>
                  {relationshipGraph && relationshipGraph.nodes.length > 0 ? (
                    <RelationshipConstellation
                      characterId={characterId}
                      nodes={relationshipGraph.nodes}
                      links={relationshipGraph.links}
                      centralCharacterName={character.name}
                      onNodeClick={handleNodeClick}
                      height={550}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-muted)]">
                      <Network className="w-12 h-12 mb-3 opacity-50" />
                      <p>No relationship data available</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </Tabs.Panel>

            {/* Evolution Tab */}
            <Tabs.Panel key="evolution">
              <GlassCard>
                <CardHeader>
                  <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                    Character Evolution
                  </h2>
                </CardHeader>
                <CardContent>
                  {evolutionData && evolutionData.milestones.length > 0 ? (
                    <ScrollShadow className="max-h-[600px]">
                      <CharacterEvolutionTimeline
                        characterId={characterId}
                        characterName={character.name}
                        milestones={evolutionData.milestones}
                        arcSummary={evolutionData.arc_summary}
                      />
                    </ScrollShadow>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-muted)]">
                      <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
                      <p>No evolution data available</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </Tabs.Panel>

            {/* Episodes Tab */}
            <Tabs.Panel key="episodes">
              <GlassCard>
                <CardHeader>
                  <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                    Episode Presence
                  </h2>
                </CardHeader>
                <CardContent>
                  {episodePresence && episodePresence.episodes.length > 0 ? (
                    <EpisodePresenceHeatmap
                      characterId={characterId}
                      characterName={character.name}
                      episodes={episodePresence.episodes}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-muted)]">
                      <Grid3X3 className="w-12 h-12 mb-3 opacity-50" />
                      <p>No episode presence data available</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </Tabs.Panel>

            {/* Kink Profile Tab */}
            <Tabs.Panel key="kink-profile">
              <GlassCard>
                <CardHeader>
                  <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                    Character Profile
                  </h2>
                </CardHeader>
                <CardContent>
                  <ScrollShadow className="max-h-[600px]">
                    <div className="space-y-6">
                      {/* Preferences */}
                      <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Preferences</h4>
                        <div className="flex flex-wrap gap-2">
                          {kinkProfile.preferences.map((pref: string) => (
                            <Chip key={pref} variant="soft" size="sm" className="bg-[#ff6b9d]/20 text-[#ff6b9d]">
                              {pref}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      
                      {/* Limits */}
                      <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Limits</h4>
                        <div className="flex flex-wrap gap-2">
                          {kinkProfile.limits.map((limit: string) => (
                            <Chip key={limit} variant="soft" size="sm" className="bg-red-500/20 text-red-400">
                              {limit}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      
                      {/* Evolution */}
                      <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Evolution</h4>
                        <div className="flex flex-wrap gap-2">
                          {kinkProfile.evolution.map((evo: string) => (
                            <Chip key={evo} variant="soft" size="sm" className="bg-[#D4AF37]/20 text-[#D4AF37]">
                              {evo}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollShadow>
                </CardContent>
              </GlassCard>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>

      <CreativeCompanionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        entityId={characterId}
        entityType="character"
      />
    </div>
  );
}

// Utility function to format screen time
function formatScreenTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
