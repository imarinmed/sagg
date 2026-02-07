"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tabs,
  Chip,
  Spinner,
  ScrollShadow,
  Button,
} from "@heroui/react";
import {
  User,
  Heart,
  TrendingUp,
  Network,
  Grid3X3,
  ChevronLeft,
  Sparkles,
  Clock,
  Users,
  Activity,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { CharacterHero } from "@/components/CharacterHero";
import { KiaraCharacterHero } from "@/components/characters/KiaraCharacterHero";
import { RelationshipConstellation } from "@/components/RelationshipConstellation";
import { CharacterEvolutionTimeline } from "@/components/CharacterEvolutionTimeline";
import { EpisodePresenceHeatmap } from "@/components/EpisodePresenceHeatmap";
import { KinkProfileVisualization } from "@/components/KinkProfileVisualization";
import { QuoteCarousel, extractQuotesFromEvolution } from "@/components/QuoteCarousel";
import { ForgeButton } from "@/components/ForgeButton";
import { CreativeCompanionPanel } from "@/components/CreativeCompanionPanel";
import Link from "next/link";
import {
  getCharacterById,
  getMockRelationshipGraph,
  getMockEvolutionData,
  getMockEpisodePresence,
  StaticCharacter,
} from "@/lib/characterData";

// ============================================
// TYPE DEFINITIONS
// ============================================

type TabKey = "overview" | "relationships" | "evolution" | "presence" | "profile";

// ============================================
// ANIMATION VARIANTS
// ============================================

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.1 }
  },
  exit: { opacity: 0 }
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatScreenTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ============================================
// QUICK STATS BAR COMPONENT
// ============================================

interface QuickStatsBarProps {
  episodes: number;
  relationships: number;
  screenTime: string;
  milestones: number;
  avgIntensity: number;
}

function QuickStatsBar({ episodes, relationships, screenTime, milestones, avgIntensity }: QuickStatsBarProps) {
  const stats = [
    { icon: Grid3X3, label: "Episodes", value: episodes, color: "text-[var(--color-accent-primary)]" },
    { icon: Users, label: "Relationships", value: relationships, color: "text-[var(--color-accent-secondary)]" },
    { icon: Clock, label: "Screen Time", value: screenTime, color: "text-[var(--color-text-primary)]" },
    { icon: Activity, label: "Milestones", value: milestones, color: "text-[var(--color-accent-primary)]" },
    { icon: TrendingUp, label: "Avg Intensity", value: avgIntensity.toFixed(1), color: "text-[var(--color-accent-secondary)]" },
  ];

  return (
    <motion.div 
      variants={sectionVariants}
      className="w-full glass border-y border-[var(--glass-border)] py-4"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// LOADING STATE
// ============================================

function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)] rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-[var(--color-text-muted)]">Loading character profile...</p>
    </div>
  );
}

// ============================================
// ERROR STATE
// ============================================

function PageError({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-full bg-[var(--color-accent-secondary)]/10 flex items-center justify-center">
        <BookOpen className="w-10 h-10 text-[var(--color-accent-secondary)]" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-heading text-[var(--color-text-primary)] mb-2">Character Not Found</h1>
        <p className="text-[var(--color-text-muted)]">{error}</p>
      </div>
      <Button variant="secondary" onPress={onBack} className="glass">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Characters
      </Button>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<StaticCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load creative panel state
  useEffect(() => {
    const savedState = localStorage.getItem("creative-panel-open");
    if (savedState === "true") setIsPanelOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("creative-panel-open", String(isPanelOpen));
  }, [isPanelOpen]);

  // Load character data
  useEffect(() => {
    const loadCharacter = () => {
      try {
        setLoading(true);
        setError(null);
        const charData = getCharacterById(characterId);
        if (!charData) {
          setError("Character not found in database");
        } else {
          setCharacter(charData);
        }
      } catch (err) {
        setError("Failed to load character data");
      } finally {
        setLoading(false);
      }
    };

    if (characterId) loadCharacter();
  }, [characterId]);

  // Get mock data
  const relationshipGraph = useMemo(() => getMockRelationshipGraph(characterId), [characterId]);
  const evolutionData = useMemo(() => getMockEvolutionData(characterId), [characterId]);
  const episodePresence = useMemo(() => getMockEpisodePresence(characterId), [characterId]);

  // Derived data
  const canonicalTraits = character?.canonical_traits ?? [];
  const adaptationTraits = character?.adaptation_traits ?? [];
  const kinkProfile = character?.kink_profile ?? { preferences: [], limits: [], evolution: [] };
  
  const isVampire = useMemo(() => canonicalTraits.includes("vampire"), [canonicalTraits]);
  
  const isSST = useMemo(() => {
    return adaptationTraits.length > 0 || character?.adaptation_notes;
  }, [adaptationTraits, character?.adaptation_notes]);

  // Calculate stats
  const heroStats = useMemo(() => ({
    episodesAppeared: episodePresence?.total_episodes || 0,
    relationships: relationshipGraph?.nodes ? relationshipGraph.nodes.length - 1 : 0,
    totalScreenTime: episodePresence ? formatScreenTime(episodePresence.total_screen_time) : "0m",
  }), [episodePresence, relationshipGraph]);

  const avgIntensity = useMemo(() => {
    if (!episodePresence?.episodes?.length) return 0;
    return episodePresence.episodes.reduce((acc, ep) => acc + ep.intensity, 0) / episodePresence.episodes.length;
  }, [episodePresence]);

  // Extract quotes
  const quotes = useMemo(() => {
    if (!evolutionData?.milestones) return [];
    return extractQuotesFromEvolution(evolutionData.milestones, character?.name || "", characterId);
  }, [evolutionData, character?.name, characterId]);

  // Convert data for components
  const presenceData = useMemo(() => {
    if (!episodePresence?.episodes) return [];
    return episodePresence.episodes.map(ep => ({
      episode_id: ep.episode_id,
      episode_number: parseInt(ep.episode_id.replace('s01e', '')),
      presence_level: ep.intensity,
      screen_time_seconds: ep.screen_time,
      moment_count: ep.moment_count,
      importance: ep.intensity >= 4 ? 'major' as const : ep.intensity >= 3 ? 'supporting' as const : ep.intensity >= 2 ? 'minor' as const : 'background' as const,
      intensity: ep.intensity,
    }));
  }, [episodePresence]);

  const relationshipData = useMemo(() => {
    if (!relationshipGraph?.links) return [];
    return relationshipGraph.links.map(link => ({
      source: {
        id: link.source,
        name: relationshipGraph.nodes.find(n => n.id === link.source)?.name || link.source,
        group: link.source === characterId ? 1 : 2,
        radius: link.source === characterId ? 35 : 25,
        color: link.source === characterId ? "#D4AF37" : link.color,
        metadata: {
          role: relationshipGraph.nodes.find(n => n.id === link.source)?.metadata?.role,
          family: relationshipGraph.nodes.find(n => n.id === link.source)?.metadata?.family,
        },
      },
      target: {
        id: link.target,
        name: relationshipGraph.nodes.find(n => n.id === link.target)?.name || link.target,
        group: link.target === characterId ? 1 : 2,
        radius: link.target === characterId ? 35 : 25,
        color: link.target === characterId ? "#D4AF37" : link.color,
        metadata: {
          role: relationshipGraph.nodes.find(n => n.id === link.target)?.metadata?.role,
          family: relationshipGraph.nodes.find(n => n.id === link.target)?.metadata?.family,
        },
      },
      type: link.type,
      intensity: link.intensity,
      description: link.description,
      color: link.color,
      width: link.width,
    }));
  }, [relationshipGraph, characterId]);

  const evolutionTimelineData = useMemo(() => {
    if (!evolutionData?.milestones) return [];
    const episodeMap = new Map();
    
    evolutionData.milestones.forEach(milestone => {
      if (!episodeMap.has(milestone.episode_id)) {
        episodeMap.set(milestone.episode_id, {
          episode_id: milestone.episode_id,
          episode_number: parseInt(milestone.episode_id.replace('s01e', '')),
          episode_title: `Episode ${milestone.episode_id.slice(-2)}`,
          traits: [],
          arc_progression: milestone.importance > 3 ? 'transforming' as const : milestone.importance > 2 ? 'improving' as const : 'stable' as const,
          key_moments: [],
          overall_intensity: milestone.intensity,
        });
      }
      const ep = episodeMap.get(milestone.episode_id);
      ep.key_moments.push(milestone.description);
      ep.traits.push({
        id: milestone.milestone_type,
        name: milestone.milestone_type,
        intensity: milestone.intensity,
        notes: milestone.description,
      });
    });
    
    return Array.from(episodeMap.values());
  }, [evolutionData]);

  // Navigation handler
  const handleNodeClick = (nodeId: string) => router.push(`/characters/${nodeId}`);

  if (loading) return <PageLoading />;
  if (error || !character) return <PageError error={error || "Character not found"} onBack={() => router.push('/characters')} />;

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen pb-20"
    >
      {/* Forge Button */}
      <div className="fixed top-4 right-4 z-50">
        <ForgeButton onClick={() => setIsPanelOpen(true)} />
      </div>

      {/* Back Navigation */}
      <motion.div variants={sectionVariants} className="absolute top-4 left-4 z-40">
        <Link href="/characters">
          <Button variant="ghost" className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <ChevronLeft className="w-4 h-4 mr-2" />
            All Characters
          </Button>
        </Link>
      </motion.div>

      {/* Character Hero - Special handling for Kiara */}
      {character.id.includes("kiara") ? (
        <KiaraCharacterHero
          stats={{
            episodesAppeared: heroStats.episodesAppeared,
            relationships: heroStats.relationships,
            totalScreenTime: heroStats.totalScreenTime,
          }}
        />
      ) : (
        <CharacterHero
          character={{
            id: character.id,
            name: character.name,
            portrayed_by: character.portrayed_by,
            role: character.role,
            description: character.description,
            species: isVampire ? "vampire" : "human",
            canonical_traits: canonicalTraits,
            adaptation_traits: adaptationTraits,
            arc_description: character.adaptation_notes,
          }}
          stats={{
            ...heroStats,
            avgIntensity,
            evolutionMilestones: evolutionData?.milestones?.length ?? 0,
          }}
          actions={{
            onViewRelationships: () => setActiveTab("relationships"),
            onViewEvolution: () => setActiveTab("evolution"),
          }}
        />
      )}

      {/* Quick Stats Bar */}
      <QuickStatsBar
        episodes={heroStats.episodesAppeared}
        relationships={heroStats.relationships}
        screenTime={heroStats.totalScreenTime}
        milestones={evolutionData?.milestones?.length ?? 0}
        avgIntensity={avgIntensity}
      />

      {/* Quote Carousel */}
      {quotes.length > 0 && (
        <motion.div variants={sectionVariants} className="px-4 md:px-8 lg:px-16 py-8">
          <div className="max-w-4xl mx-auto">
            <QuoteCarousel
              quotes={quotes}
              autoPlay={true}
              interval={8000}
              variant="featured"
            />
          </div>
        </motion.div>
      )}

      {/* Main Content with Tabs */}
      <motion.div variants={sectionVariants} className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as TabKey)}
            className="w-full"
          >
            {/* Tab List */}
            <Tabs.List className="glass rounded-xl p-1.5 mb-8 flex flex-wrap gap-1">
              <Tabs.Tab key="overview" className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-center gap-2 py-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Info</span>
                </div>
              </Tabs.Tab>
              
              <Tabs.Tab key="relationships" className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-center gap-2 py-2">
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline">Connections</span>
                  <span className="sm:hidden">Links</span>
                  {relationshipGraph && relationshipGraph.nodes && relationshipGraph.nodes.length > 1 && (
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] text-xs">
                      {(relationshipGraph?.nodes?.length ?? 0) - 1}
                    </Chip>
                  )}
                </div>
              </Tabs.Tab>
              
              <Tabs.Tab key="evolution" className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-center gap-2 py-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Evolution</span>
                  <span className="sm:hidden">Growth</span>
                  {evolutionData && evolutionData.milestones && evolutionData.milestones.length > 0 && (
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] text-xs">
                      {evolutionData?.milestones?.length ?? 0}
                    </Chip>
                  )}
                </div>
              </Tabs.Tab>
              
              <Tabs.Tab key="presence" className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-center gap-2 py-2">
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Presence</span>
                  <span className="sm:hidden">Episodes</span>
                  {episodePresence && episodePresence.total_episodes && episodePresence.total_episodes > 0 && (
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] text-xs">
                      {episodePresence?.total_episodes ?? 0}
                    </Chip>
                  )}
                </div>
              </Tabs.Tab>
              
              {isSST && (
                <Tabs.Tab key="profile" className="flex-1 min-w-[120px]">
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Heart className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">SST</span>
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] text-xs">
                      SST
                    </Chip>
                  </div>
                </Tabs.Tab>
              )}
            </Tabs.List>

            {/* Overview Tab */}
            <Tabs.Panel key="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Character Info Card */}
                <GlassCard>
                  <CardHeader className="border-b border-[var(--glass-border)]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" />
                      <h3 className="font-heading text-xl text-[var(--color-text-primary)]">Character Profile</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Role */}
                    {character.role && (
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Role</p>
                        <p className="text-lg text-[var(--color-text-primary)]">{character.role}</p>
                      </div>
                    )}
                    
                    {/* Description */}
                    {character.description && (
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Description</p>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{character.description}</p>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>

                {/* Traits Card */}
                <GlassCard>
                  <CardHeader className="border-b border-[var(--glass-border)]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[var(--color-accent-primary)]" />
                      <h3 className="font-heading text-xl text-[var(--color-text-primary)]">Traits</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Canonical Traits */}
                    {canonicalTraits.length > 0 && (
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Canonical</p>
                        <div className="flex flex-wrap gap-2">
                          {canonicalTraits.map(trait => (
                            <Chip key={trait} variant="soft" size="sm" className="bg-[var(--color-surface)] text-[var(--color-text-secondary)] capitalize">
                              {trait.replace(/_/g, " ")}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Adaptation Traits */}
                    {adaptationTraits.length > 0 && (
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Dark Adaptation</p>
                        <div className="flex flex-wrap gap-2">
                          {adaptationTraits.map(trait => (
                            <Chip key={trait} variant="soft" size="sm" className="bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] capitalize">
                              {trait.replace(/_/g, " ")}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>

                {/* Quick Presence Preview */}
                {presenceData.length > 0 && (
                  <GlassCard className="lg:col-span-2">
                    <CardHeader className="border-b border-[var(--glass-border)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-5 h-5 text-[var(--color-accent-primary)]" />
                        <h3 className="font-heading text-xl text-[var(--color-text-primary)]">Episode Presence</h3>
                      </div>
                      <Button variant="ghost" size="sm" onPress={() => setActiveTab("presence")} className="text-[var(--color-accent-primary)]">
                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <EpisodePresenceHeatmap
                        characterId={characterId}
                        characterName={character.name}
                        presence={presenceData.slice(0, 7)}
                      />
                    </CardContent>
                  </GlassCard>
                )}
              </div>
            </Tabs.Panel>

            {/* Relationships Tab */}
            <Tabs.Panel key="relationships">
              <GlassCard>
                <CardHeader className="border-b border-[var(--glass-border)]">
                  <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">Relationship Constellation</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Visualize connections and dynamics with other characters
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {relationshipData.length > 0 ? (
                    <RelationshipConstellation
                      characterId={characterId}
                      relationships={relationshipData}
                      onNodeClick={handleNodeClick}
                      height={600}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-[var(--color-text-muted)]">
                      <Network className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-lg">No relationship data available</p>
                      <p className="text-sm mt-2">This character has no recorded connections</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </Tabs.Panel>

            {/* Evolution Tab */}
            <Tabs.Panel key="evolution">
              <GlassCard>
                <CardHeader className="border-b border-[var(--glass-border)]">
                  <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">Character Evolution</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Track character growth and transformation across episodes
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {evolutionTimelineData.length > 0 ? (
                    <ScrollShadow className="max-h-[800px]">
                      <CharacterEvolutionTimeline
                        characterId={characterId}
                        characterName={character.name}
                        evolution={evolutionTimelineData}
                        milestones={evolutionData?.milestones}
                        arcSummary={evolutionData?.arc_summary}
                      />
                    </ScrollShadow>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-[var(--color-text-muted)]">
                      <TrendingUp className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-lg">No evolution data available</p>
                      <p className="text-sm mt-2">Character progression has not been recorded</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </Tabs.Panel>

            {/* Presence Tab */}
            <Tabs.Panel key="presence">
              <GlassCard>
                <CardHeader className="border-b border-[var(--glass-border)]">
                  <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">Episode Presence</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Screen time and importance across all episodes
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {presenceData.length > 0 ? (
                    <EpisodePresenceHeatmap
                      characterId={characterId}
                      characterName={character.name}
                      presence={presenceData}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-[var(--color-text-muted)]">
                      <Grid3X3 className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-lg">No episode presence data</p>
                      <p className="text-sm mt-2">This character has not appeared in any episodes</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </Tabs.Panel>

            {/* Profile Tab (SST Only) */}
            {isSST && (
              <Tabs.Panel key="profile">
                <KinkProfileVisualization
                  characterId={characterId}
                  preferences={kinkProfile.preferences.map((p: any, idx: number) => ({
                    id: `pref-${idx}`,
                    descriptor: typeof p === 'string' ? p : p.descriptor,
                    intensity: typeof p === 'string' ? 3 : p.intensity || 3,
                    context: typeof p === 'string' ? undefined : p.context,
                  }))}
                  limits={kinkProfile.limits.map((l: any, idx: number) => ({
                    id: `limit-${idx}`,
                    descriptor: typeof l === 'string' ? l : l.descriptor,
                    type: typeof l === 'string' ? 'hard' : l.type || 'hard',
                    note: typeof l === 'string' ? undefined : l.note,
                  }))}
                  evolution={kinkProfile.evolution?.map((e: any, idx: number) => ({
                    episode_id: e.episode_id,
                    preferences: Object.entries(e.descriptors || {}).map(([key, value]) => ({
                      id: `evo-${idx}-${key}`,
                      descriptor: key,
                      intensity: value as number,
                    })),
                  }))}
                />
              </Tabs.Panel>
            )}
          </Tabs>
        </div>
      </motion.div>

      {/* Creative Companion Panel */}
      <CreativeCompanionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        entityId={characterId}
        entityType="character"
      />
    </motion.div>
  );
}
