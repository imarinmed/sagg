"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, Droplets, Play, Pause, Clock } from "lucide-react";
import { TemporalCharacterCard } from "@/components/TemporalCharacterCard";
import { EpisodeTimeline } from "@/components/EpisodeTimeline";
import { RelationshipBadge } from "@/components/RelationshipBadge";
import { TemporalGraphEngine } from "@/lib/temporalGraphEngine";
import { evolutionRules } from "@/lib/evolutionRules";
import {
  TemporalCharacterState,
  TemporalRelationship,
} from "@/lib/temporalModels";

// Extended character data with all the deep information
const charactersData = [
  {
    id: "kiara",
    name: "Kiara Natt och Dag",
    portrayed_by: "Filippa Kavalic",
    species: "vampire" as const,
    role: "Protagonist",
    description: "A young vampire navigating the complexities of high school life while hiding her true nature from her human classmates. Struggles with intense bloodlust during moments of emotional vulnerability.",
    canonical_traits: ["vampire", "teenager", "student", "natt_och_dag_family", "daywalker"],
    adaptation_traits: ["bloodlust_control", "empathic_connection", "modern_morality"],
    adaptation_notes: "In this dark adaptation, Kiara's bloodlust is tied to her emotions, creating intense moments of vulnerability and desire. Her connection to Alfred awakens dormant predatory instincts.",
    kink_profile: {
      preferences: ["biting", "blood_play", "dominance", "sensual_feeding"],
      limits: ["permanent_harm", "non_consensual", "innocent_victims"],
      evolution: ["discovers_blood_bond", "explores_vampire_instincts", "embraces_dual_nature"],
    },
    variant: "student" as const,
  },
  {
    id: "alfred",
    name: "Alfred",
    portrayed_by: "Aaron Holgersson",
    species: "human" as const,
    role: "Love Interest",
    description: "A human student who becomes entangled in Kiara's world. His fascination with darkness leads him to willingly enter dangerous situations.",
    canonical_traits: ["human", "teenager", "student", "fascinated_by_supernatural"],
    adaptation_traits: ["willing_prey", "dark_curiosity", "protective_instinct"],
    adaptation_notes: "Alfred's attraction to Kiara is complicated by his growing awareness of the danger she represents. He finds himself drawn to the very thing that could destroy him.",
    kink_profile: {
      preferences: ["submission", "vampire_fetish", "danger", "trust_games"],
      limits: ["permanent_harm", "loss_of_autonomy"],
      evolution: ["discovers_kiaras_nature", "accepts_vampire_world", "tests_boundaries"],
    },
    variant: "student" as const,
  },
  {
    id: "elise",
    name: "Elise",
    portrayed_by: "Elsa Östlind",
    species: "human" as const,
    role: "Friend & Confidante",
    description: "Kiara's loyal friend who becomes her secret keeper. Provides grounding support while navigating the dangerous world of vampires.",
    canonical_traits: ["human", "teenager", "student", "loyal"],
    adaptation_traits: ["secret_keeper", "moral_anchor", "protective"],
    adaptation_notes: "Elise represents the voice of reason and humanity in Kiara's increasingly supernatural life. Her friendship becomes a lifeline to Kiara's humanity.",
    kink_profile: {
      preferences: [],
      limits: ["supernatural_involvement", "physical_danger"],
      evolution: ["learns_secret", "becomes_confidante", "navigates_danger"],
    },
    variant: "student" as const,
  },
  {
    id: "chloe",
    name: "Chloe",
    portrayed_by: "Laura Maik",
    species: "human" as const,
    role: "Rival",
    description: "A popular student with hidden depths. Her antagonism masks secret knowledge of the supernatural world.",
    canonical_traits: ["human", "teenager", "student", "popular", "secretive"],
    adaptation_traits: ["hidden_knowledge", "complex_motivations", "survivor"],
    adaptation_notes: "Chloe's rivalry with Kiara stems from her own hidden connection to the vampire world. She knows more than she lets on.",
    kink_profile: {
      preferences: ["manipulation", "power_games", "secrets"],
      limits: [],
      evolution: ["reveals_hidden_depths", "uneasy_alliance", "tests_loyalties"],
    },
    variant: "student" as const,
  },
  {
    id: "eric",
    name: "Eric",
    portrayed_by: "Pontus Bennemyr",
    species: "human" as const,
    role: "Moral Compass",
    description: "A human friend caught between worlds. Questions vampire morality while forming unexpected bonds.",
    canonical_traits: ["human", "teenager", "student", "ethical"],
    adaptation_traits: ["reluctant_involvement", "moral_questioning", "bridge_builder"],
    adaptation_notes: "Eric's ethical questioning forces both humans and vampires to confront the morality of their existence. He becomes an unexpected bridge between worlds.",
    kink_profile: {
      preferences: [],
      limits: ["supernatural_involvement", "moral_compromise"],
      evolution: ["discovers_truth", "questions_morality", "chooses_path"],
    },
    variant: "student" as const,
  },
  {
    id: "henry",
    name: "Henry Natt och Dag",
    portrayed_by: "Olle Sarri",
    species: "vampire" as const,
    role: "Patriarch",
    description: "Kiara's vampire father. Protective and traditional, he struggles with his daughter's modern attitudes toward humans.",
    canonical_traits: ["vampire", "adult", "natt_och_dag_family", "parent", "ancient"],
    adaptation_traits: ["traditionalist", "protective", "hunter_instinct"],
    adaptation_notes: "Henry represents the old ways of vampire society. His traditional views on humans as prey create generational conflict with Kiara.",
    kink_profile: {
      preferences: ["traditional_hunting", "authority", "power_dynamics"],
      limits: ["family_harm", "exposure_risk"],
      evolution: ["protects_family_legacy", "confronts_changing_times", "tests_daughter"],
    },
    variant: "authority" as const,
  },
  {
    id: "desiree",
    name: "Desirée Natt och Dag",
    portrayed_by: "Katarina Macli",
    species: "vampire" as const,
    role: "Matriarch",
    description: "Kiara's mother. Elegant and ancient, she balances maternal love with the harsh realities of vampire existence.",
    canonical_traits: ["vampire", "adult", "natt_och_dag_family", "parent", "ancient"],
    adaptation_traits: ["ancient_wisdom", "elegant_predator", "nurturing_hunter"],
    adaptation_notes: "Desirée embodies the dual nature of vampires - capable of profound love for family while being terrifying to others. She teaches Kiara the art of controlled predation.",
    kink_profile: {
      preferences: ["elegant_hunting", "sophisticated_tastes", "aesthetic_pleasure"],
      limits: ["family_harm", "crude_behavior"],
      evolution: ["guides_daughter", "protects_legacy", "demonstrates_control"],
    },
    variant: "authority" as const,
  },
  {
    id: "jacques",
    name: "Jacques Natt och Dag",
    portrayed_by: "Åke Bremer Wold",
    species: "vampire" as const,
    role: "Shadow Broker",
    description: "Kiara's uncle with mysterious connections to the darker underbelly of vampire society. Operates in moral gray areas.",
    canonical_traits: ["vampire", "adult", "natt_och_dag_family", "connected"],
    adaptation_traits: ["shadowy_connections", "morally_ambiguous", "information_broker"],
    adaptation_notes: "Jacques introduces Kiara to the darker aspects of vampire existence. His activities blur predator and monster.",
    kink_profile: {
      preferences: ["power", "control", "dark_rituals", "manipulation"],
      limits: [],
      evolution: ["reveals_dark_connections", "tests_family_loyalty", "offers_temptation"],
    },
    variant: "authority" as const,
  },
];

// Episode definitions
const episodes = [
  { id: "s01e01", title: "The Awakening" },
  { id: "s01e02", title: "First Blood" },
  { id: "s01e03", title: "The Hunger" },
  { id: "s01e04", title: "Blood Bonds" },
  { id: "s01e05", title: "Dark Desires" },
  { id: "s01e06", title: "The Hunt" },
  { id: "s01e07", title: "Revelations" },
];

type RelationshipType = "familial" | "romantic" | "friendship" | "antagonistic" | "alliance" | "obsession" | "blood_bond";

interface Relationship {
  id: string;
  from_character_id: string;
  to_character_id: string;
  relationship_type: RelationshipType;
  intensity: number;
  description: string;
  is_canon: boolean;
  is_edited: boolean;
  firstAppearanceEpisode: string;
  endEpisode: string | null;
}

// Initial relationships with temporal data
const initialRelationships: Relationship[] = [
  // Family bonds
  { id: "r1", from_character_id: "henry", to_character_id: "kiara", relationship_type: "familial", intensity: 5, description: "Father-daughter bond, protective but traditional", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
  { id: "r2", from_character_id: "desiree", to_character_id: "kiara", relationship_type: "familial", intensity: 5, description: "Mother-daughter bond, teaches vampire ways", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
  { id: "r3", from_character_id: "jacques", to_character_id: "kiara", relationship_type: "familial", intensity: 3, description: "Uncle-niece, introduces dark vampire world", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
  
  // Romantic
  { id: "r4", from_character_id: "kiara", to_character_id: "alfred", relationship_type: "romantic", intensity: 4, description: "Intense attraction complicated by predator-prey dynamic", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
  
  // Blood bond (special vampire connection)
  { id: "r5", from_character_id: "kiara", to_character_id: "alfred", relationship_type: "blood_bond", intensity: 3, description: "Kiara's feeding creates supernatural connection", is_canon: false, is_edited: true, firstAppearanceEpisode: "s01e03", endEpisode: null },
  
  // Friendships
  { id: "r6", from_character_id: "kiara", to_character_id: "elise", relationship_type: "friendship", intensity: 4, description: "Trust and secret-keeping", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
  { id: "r7", from_character_id: "elise", to_character_id: "eric", relationship_type: "friendship", intensity: 3, description: "Shared concern for Kiara", is_canon: false, is_edited: true, firstAppearanceEpisode: "s01e02", endEpisode: null },
  
  // Antagonistic
  { id: "r8", from_character_id: "kiara", to_character_id: "chloe", relationship_type: "antagonistic", intensity: 3, description: "Rivalry masking secret knowledge", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
  
  // Obsession
  { id: "r9", from_character_id: "jacques", to_character_id: "kiara", relationship_type: "obsession", intensity: 2, description: "Wants to corrupt his niece", is_canon: false, is_edited: true, firstAppearanceEpisode: "s01e04", endEpisode: null },
  
  // Alliance
  { id: "r10", from_character_id: "henry", to_character_id: "desiree", relationship_type: "alliance", intensity: 5, description: "United in protecting family", is_canon: true, is_edited: false, firstAppearanceEpisode: "s01e01", endEpisode: null },
];

export default function CharactersPage() {
  const [currentEpisode, setCurrentEpisode] = useState("s01e01");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [relationships] = useState(initialRelationships);

  // Initialize temporal graph engine
  const graphEngine = useMemo(() => {
    return new TemporalGraphEngine(charactersData, relationships, evolutionRules);
  }, [relationships]);

  // Get current state
  const currentState = useMemo(() => {
    return graphEngine.getCurrentState();
  }, [graphEngine, currentEpisode]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode);
      if (currentIndex < episodes.length - 1) {
        const nextEpisode = episodes[currentIndex + 1].id;
        setCurrentEpisode(nextEpisode);
        graphEngine.setEpisode(nextEpisode);
      } else {
        setIsPlaying(false);
      }
    }, 2000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentEpisode, playbackSpeed, graphEngine]);

  // Update engine when episode changes
  useEffect(() => {
    graphEngine.setEpisode(currentEpisode);
  }, [currentEpisode, graphEngine]);

  const handleEpisodeChange = useCallback((episode: string) => {
    setCurrentEpisode(episode);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const vampireCount = charactersData.filter((c) => c.species === "vampire").length;
  const humanCount = charactersData.filter((c) => c.species === "human").length;

  // Get active relationships for current episode
  const activeRelationships = useMemo(() => {
    return relationships.filter((rel) => {
      const startEp = rel.firstAppearanceEpisode;
      const endEp = rel.endEpisode;
      const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode);
      const startIndex = episodes.findIndex((ep) => ep.id === startEp);
      const endIndex = endEp ? episodes.findIndex((ep) => ep.id === endEp) : episodes.length;
      return currentIndex >= startIndex && currentIndex <= endIndex;
    });
  }, [relationships, currentEpisode]);

  return (
    <div className="space-y-0 min-h-screen bg-[#0a0a0f]">
      {/* Premium Hero Section */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden -mt-24 sm:-mt-28">
        {/* Background with gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, #0f0a1a 0%, #1a0a2e 40%, #0a0a0f 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-[#0a0a0f]/70" />

          {/* Ambient glow effects */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B0000]/60 to-transparent" />
          <div className="absolute top-20 left-20 w-32 h-32 border border-[#8B0000]/10 rounded-full opacity-30" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-[#D4AF37]/10 rounded-full opacity-20" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16 pt-32">
          <div className="max-w-4xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 rounded-full">
              <Sparkles className="w-3 h-3" />
              The Constellation
            </span>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white leading-tight drop-shadow-2xl">
              Characters
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
              A web of desires, blood bonds, and dangerous connections. Explore how relationships evolve through time.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{charactersData.length} Characters</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#8B0000]" />
                <span>{vampireCount} Vampires</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">{humanCount} Humans</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ff6b9d]">{activeRelationships.length} Active Connections</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentEpisode}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />
      </div>

      {/* Timeline Control Panel */}
      <div className="px-8 py-6">
        <EpisodeTimeline
          episodes={episodes}
          currentEpisode={currentEpisode}
          onEpisodeChange={handleEpisodeChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
        />
      </div>

      {/* Character Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {currentState.characters.map((character: TemporalCharacterState) => {
              const baseChar = charactersData.find((c) => c.id === character.id);
              return (
                <motion.div
                  key={character.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <TemporalCharacterCard
                    character={character}
                    variant={baseChar?.variant || "student"}
                    isActive={selectedCharacter === character.id}
                    onClick={() => setSelectedCharacter(character.id)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Relationship Visualization */}
      {selectedCharacter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="px-8 py-6"
        >
          <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Active Relationships</h3>
            <div className="flex flex-wrap gap-3">
              {activeRelationships
                .filter(
                  (rel) =>
                    rel.from_character_id === selectedCharacter ||
                    rel.to_character_id === selectedCharacter
                )
                .map((rel) => {
                  const isOutgoing = rel.from_character_id === selectedCharacter;
                  const otherCharId = isOutgoing
                    ? rel.to_character_id
                    : rel.from_character_id;
                  const otherChar = charactersData.find((c) => c.id === otherCharId);

                  return (
                    <RelationshipBadge
                      key={rel.id}
                      type={rel.relationship_type as any}
                      direction={isOutgoing ? "outgoing" : "incoming"}
                      intensity={rel.intensity}
                      targetName={otherChar?.name || "Unknown"}
                    />
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="px-8 py-6 text-center">
        <p className="text-sm text-gray-500">
          Use the timeline to explore character evolution. Click a character to see their relationships. 
          Press space to play/pause, arrow keys to navigate episodes.
        </p>
      </div>
    </div>
  );
}
