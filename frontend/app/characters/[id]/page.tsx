"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Tabs,
  Chip,
  Avatar,
  Skeleton,
  ScrollShadow,
  Accordion,
} from "@heroui/react";
import { User, Heart, TrendingUp, ChevronDown } from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { IntensityBadge } from "@/components/IntensitySlider";
import { api } from "@/lib/api";

interface KinkPreference {
  id: string;
  intensity: number;
  notes: string;
}

interface KinkEvolution {
  [episode: string]: KinkPreference[];
}

interface KinkProfile {
  preferences: KinkPreference[];
  limits: KinkPreference[];
  evolution: KinkEvolution;
}

interface Character {
  id: string;
  name: string;
  portrayed_by?: string;
  role?: string;
  description?: string;
  family?: string | null;
  canonical_traits: string[];
  adaptation_traits: string[];
  adaptation_notes: string;
  kink_profile: {
    preferences: Array<{
      descriptor: string;
      intensity: number;
      context?: string;
    }>;
    limits: Array<{
      descriptor: string;
      type: string;
      note?: string;
    }>;
    evolution: Array<{
      episode_id: string;
      descriptors: Record<string, number>;
    }>;
  };
}

const categoryColors: Record<string, string> = {
  consent_frameworks: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  power_exchange: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  roles: "bg-green-500/20 text-green-400 border-green-500/30",
  physical_acts: "bg-red-500/20 text-red-400 border-red-500/30",
  psychological_dynamics: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  vampire_specific: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  taboo_elements: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  relationship_structures: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  aftercare_safety: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  content_warnings: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const categoryLabels: Record<string, string> = {
  consent_frameworks: "Consent",
  power_exchange: "Power Exchange",
  roles: "Roles",
  physical_acts: "Physical Acts",
  psychological_dynamics: "Psychological",
  vampire_specific: "Vampire",
  taboo_elements: "Taboo",
  relationship_structures: "Relationships",
  aftercare_safety: "Aftercare",
  content_warnings: "Warnings",
};

export default function CharacterDetailPage() {
  const params = useParams();
  const characterId = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const data = await api.characters.get(characterId);
        setCharacter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load character");
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      fetchCharacter();
    }
  }, [characterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-accent-secondary)]">{error || "Character not found"}</p>
      </div>
    );
  }

  // Determine if vampire based on canonical_traits
  const isVampire = character.canonical_traits?.includes("vampire") || false;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <GlassCard>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar
              className={`w-24 h-24 text-2xl ${
                isVampire
                  ? "bg-gradient-to-br from-[var(--color-accent-secondary)] to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-cyan-600"
              }`}
            >
              <Avatar.Fallback className="text-white font-bold">
                {character.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl text-[var(--color-text-primary)]">{character.name}</h1>
                <Chip
                  variant="soft"
                  size="sm"
                  className={isVampire 
                    ? "bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]" 
                    : "bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
                  }
                >
                  {character.role ? "Character" : "Unknown"}
                </Chip>
              </div>
              <p className="text-[var(--color-text-muted)]">
                {character.portrayed_by ? `Portrayed by ${character.portrayed_by}` : "Actor unknown"}
              </p>
              <div className="flex gap-4 mt-4 text-sm text-[var(--color-text-secondary)]">
                {character.description && (
                  <span className="truncate">{character.description}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Main Content */}
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Character sections">
            <Tabs.Tab id="overview">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Overview</span>
              </div>
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="kink-profile">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Kink Profile</span>
              </div>
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="evolution">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Evolution</span>
              </div>
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="overview" className="mt-4">
          <div className="space-y-6">
            {/* Canonical Info */}
            <GlassCard>
              <CardHeader>
                <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Canonical Traits</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {character.canonical_traits.map((trait) => (
                    <Chip 
                      key={trait} 
                      variant="soft" 
                      size="sm"
                      className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                    >
                      {trait}
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
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Adaptation Notes</h4>
                  <p className="text-[var(--color-text-secondary)]">
                    {character.adaptation_notes || "Not yet defined"}
                  </p>
                </div>

                {character.adaptation_traits && character.adaptation_traits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Added Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.adaptation_traits.map((trait) => (
                        <Chip 
                          key={trait} 
                          variant="soft" 
                          size="sm"
                          className="bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]"
                        >
                          {trait}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="kink-profile" className="mt-4">
          <div className="space-y-6">
            {/* Preferences */}
            <GlassCard>
              <CardHeader>
                <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Preferences</h3>
              </CardHeader>
              <CardContent>
                <ScrollShadow className="max-h-[400px]">
                  <div className="space-y-3">
                    {character.kink_profile.preferences.map((pref, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[var(--color-surface-elevated)]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize text-[var(--color-text-primary)]">
                            {pref.descriptor.replace(/_/g, " ")}
                          </span>
                          <IntensityBadge value={pref.intensity} />
                        </div>
                        {pref.context && (
                          <p className="text-sm text-[var(--color-text-muted)]">{pref.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              </CardContent>
            </GlassCard>

            {/* Limits */}
            <GlassCard className="border-[var(--color-accent-secondary)]/30">
              <CardHeader className="border-b border-[var(--color-accent-secondary)]/20">
                <h3 className="font-heading text-lg text-[var(--color-accent-secondary)]">Limits</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {character.kink_profile.limits.map((limit, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize text-[var(--color-accent-secondary)]">
                          {limit.descriptor.replace(/_/g, " ")}
                        </span>
                        <Chip 
                          size="sm" 
                          variant="soft"
                          className="bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]"
                        >
                          Type: {limit.type}
                        </Chip>
                      </div>
                      {limit.note && (
                        <p className="text-sm text-[var(--color-accent-secondary)]/80">{limit.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="evolution" className="mt-4">
          <div className="space-y-6">
            <Accordion>
              {character.kink_profile.evolution.map((evo) => (
                <Accordion.Item key={evo.episode_id}>
                  <Accordion.Heading>
                    <Accordion.Trigger>
                      <span className="font-semibold uppercase text-[var(--color-text-primary)]">{evo.episode_id}</span>
                      <Chip 
                        size="sm" 
                        variant="soft" 
                        className="ml-2 bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {Object.keys(evo.descriptors).length} descriptors
                      </Chip>
                      <Accordion.Indicator>
                        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                      </Accordion.Indicator>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <div className="space-y-3">
                        {Object.entries(evo.descriptors).map(([descriptor, intensity]) => (
                          <div
                            key={descriptor}
                            className="p-3 rounded-lg bg-[var(--color-surface-elevated)]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize text-[var(--color-text-primary)]">
                                {descriptor.replace(/_/g, " ")}
                              </span>
                              <IntensityBadge value={intensity} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </Tabs.Panel>

      </Tabs>
    </div>
  );
}
