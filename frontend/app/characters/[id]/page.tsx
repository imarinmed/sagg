"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import CharacterPageLayout from "@/components/characters/CharacterPageLayout";
import CharacterNavSidebar from "@/components/characters/CharacterNavSidebar";
import CharacterCatalogHeader from "@/components/characters/CharacterCatalogHeader";
import CharacterStatsPanel from "@/components/characters/CharacterStatsPanel";
import StudentCalendarWidget from "@/components/characters/StudentCalendarWidget";
import CharacterGallery from "@/components/characters/CharacterGallery";
import { CreativeCompanionPanel } from "@/components/CreativeCompanionPanel";
import { ForgeButton } from "@/components/ForgeButton";
import Link from "next/link";
import {
  getCharacterById,
  getMockRelationshipGraph,
  getMockEvolutionData,
  getMockEpisodePresence,
  StaticCharacter,
} from "@/lib/characterData";

type SectionId = "overview" | "connections" | "evolution" | "presence" | "schedule" | "profile";

interface NavSection {
  id: SectionId;
  label: string;
}

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

function formatScreenTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

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

function PageError({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 px-4">
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

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<StaticCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const navSections: NavSection[] = useMemo(() => {
    const sections: NavSection[] = [
      { id: "overview", label: "Overview" },
      { id: "connections", label: "Connections" },
      { id: "evolution", label: "Evolution" },
      { id: "presence", label: "Presence" },
    ];
    
    if (character?.student_profile) {
      sections.push({ id: "schedule", label: "Schedule" });
    }
    
    if (character?.adult_profile) {
      sections.push({ id: "profile", label: "SST Profile" });
    }
    
    return sections;
  }, [character]);

  useEffect(() => {
    const savedState = localStorage.getItem("creative-panel-open");
    if (savedState === "true") setIsPanelOpen(true);
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

  const relationshipGraph = useMemo(() => getMockRelationshipGraph(characterId), [characterId]);
  const evolutionData = useMemo(() => getMockEvolutionData(characterId), [characterId]);
  const episodePresence = useMemo(() => getMockEpisodePresence(characterId), [characterId]);

  const canonicalTraits = character?.canonical_traits ?? [];
  const adaptationTraits = character?.adaptation_traits ?? [];
  
  const isVampire = useMemo(() => canonicalTraits.includes("vampire"), [canonicalTraits]);
  
  const isSST = useMemo(() => {
    return !!(adaptationTraits.length > 0 || character?.adaptation_notes);
  }, [adaptationTraits, character?.adaptation_notes]);

  const heroStats = useMemo(() => ({
    episodesAppeared: episodePresence?.total_episodes || 0,
    relationships: relationshipGraph?.nodes ? relationshipGraph.nodes.length - 1 : 0,
    totalScreenTime: episodePresence ? formatScreenTime(episodePresence.total_screen_time) : "0m",
  }), [episodePresence, relationshipGraph]);

  if (loading) return <PageLoading />;
  if (error || !character) return <PageError error={error || "Character not found"} onBack={() => router.push('/characters')} />;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen"
    >
      <div className="fixed top-4 right-4 z-50">
        <ForgeButton onClick={() => setIsPanelOpen(true)} />
      </div>

      <motion.div variants={sectionVariants} className="fixed top-4 left-4 z-40">
        <Link href="/characters">
          <Button variant="ghost" className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <ChevronLeft className="w-4 h-4 mr-2" />
            All Characters
          </Button>
        </Link>
      </motion.div>

      <CharacterPageLayout catalogId={character.catalog_id?.bst} isPremium={isSST}>
        <CharacterNavSidebar sections={navSections} />
        <div className="space-y-8">
          <CharacterCatalogHeader character={character} />

          <CharacterGallery character={character} />

          <div className="space-y-12">
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">Overview</h2>
              <div className="glass rounded-xl p-6">
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {character.description || "No description available."}
                </p>
                {character.adaptation_notes && (
                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <h3 className="text-lg font-heading text-[var(--color-accent-secondary)] mb-2">Dark Adaptation</h3>
                    <p className="text-[var(--color-text-secondary)]">{character.adaptation_notes}</p>
                  </div>
                )}
              </div>
            </section>

            <section id="connections" className="scroll-mt-24">
              <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">Connections</h2>
              <div className="glass rounded-xl p-6">
                {relationshipGraph && relationshipGraph.nodes && relationshipGraph.nodes.length > 1 ? (
                  <div className="space-y-4">
                    {relationshipGraph.links.slice(0, 5).map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-0">
                        <span className="text-[var(--color-text-secondary)]">{link.description}</span>
                        <span className="text-sm text-[var(--color-accent-primary)]">{link.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)]">No relationship data available.</p>
                )}
              </div>
            </section>

            <section id="evolution" className="scroll-mt-24">
              <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">Evolution</h2>
              <div className="glass rounded-xl p-6">
                {evolutionData?.milestones && evolutionData.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {evolutionData.milestones.slice(0, 5).map((milestone, idx) => (
                      <div key={idx} className="flex items-start gap-4 py-2 border-b border-[var(--glass-border)] last:border-0">
                        <div className="text-sm text-[var(--color-accent-primary)] font-mono">{milestone.episode_id}</div>
                        <div>
                          <p className="text-[var(--color-text-primary)]">{milestone.description}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">{milestone.milestone_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)]">No evolution data available.</p>
                )}
              </div>
            </section>

            <section id="presence" className="scroll-mt-24">
              <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">Episode Presence</h2>
              <div className="glass rounded-xl p-6">
                {episodePresence?.episodes && episodePresence.episodes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {episodePresence.episodes.slice(0, 8).map((ep, idx) => (
                      <div key={idx} className="text-center p-3 rounded-lg bg-[var(--color-surface)]">
                        <div className="text-lg font-bold text-[var(--color-accent-primary)]">{ep.episode_id}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{formatScreenTime(ep.screen_time)}</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">Intensity: {ep.intensity}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)]">No episode presence data available.</p>
                )}
              </div>
            </section>

            {character.student_profile && (
              <section id="schedule" className="scroll-mt-24">
                <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">Weekly Schedule</h2>
                <div className="glass rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
{character.student_profile.class_schedule.slice(0, 3).map((daySchedule, idx) => (
                        <div key={idx} className="col-span-2 md:col-span-3">
                          <div className="text-sm text-[var(--color-accent-primary)] font-medium mb-2">{daySchedule.day}</div>
                          <div className="space-y-2">
                            {daySchedule.periods.slice(0, 2).map((period, pidx) => (
                              <div key={pidx} className="p-3 rounded-lg bg-[var(--color-surface)]">
                                <div className="text-[var(--color-text-primary)]">{period.subject}</div>
                                <div className="text-xs text-[var(--color-text-muted)]">{period.time} • {period.location}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}

            {character.adult_profile && (
              <section id="profile" className="scroll-mt-24">
                <div className="border border-[var(--color-accent-secondary)]/30 rounded-xl overflow-hidden">
                  <div className="bg-[var(--color-accent-secondary)]/10 px-6 py-3 border-b border-[var(--color-accent-secondary)]/30">
                    <h2 className="text-xl font-heading text-[var(--color-accent-secondary)] flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider">SST Restricted</span>
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {character.adult_profile.occupation && (
                      <div>
                        <h3 className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Occupation</h3>
                        <p className="text-[var(--color-text-primary)]">{character.adult_profile.occupation}</p>
                      </div>
                    )}
                    {character.adult_profile.social_status && (
                      <div>
                        <h3 className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Social Status</h3>
                        <p className="text-[var(--color-text-primary)]">{character.adult_profile.social_status}</p>
                      </div>
                    )}
                    {character.adult_profile.obligations && character.adult_profile.obligations.length > 0 && (
                      <div>
                        <h3 className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Obligations</h3>
                        <div className="flex flex-wrap gap-2">
                          {character.adult_profile.obligations.map((obligation, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] text-sm">
                              {obligation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
        <CharacterStatsPanel character={character} />
      </CharacterPageLayout>

      <CreativeCompanionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        entityId={characterId}
        entityType="character"
      />
    </motion.div>
  );
}
