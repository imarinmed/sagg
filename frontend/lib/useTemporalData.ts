/**
 * useTemporalData Hook
 *
 * React hook for accessing temporal graph data (characters, relationships, episodes).
 * Provides playback controls, keyboard shortcuts, and episode navigation.
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  TemporalCharacterState,
  TemporalRelationship,
  Episode,
  parseEpisodeId,
  createEpisodeId,
  CharacterMetrics,
  CharacterClassification,
  CharacterPhysical,
  CharacterBloodline,
} from "./temporalModels";
import { api, Character } from "./api";

// ============================================================================
// CONSTANTS
// ============================================================================

const PLAYBACK_INTERVAL_BASE_MS = 3000;
const LOCALSTORAGE_KEY_PLAYBACK_SPEED = "bats_playback_speed";
const LOCALSTORAGE_KEY_CURRENT_EPISODE = "bats_current_episode";

// ============================================================================
// CACHE
// ============================================================================

interface DataCache {
  characters: Character[] | null;
  relationships: TemporalRelationship[] | null;
  episodes: Episode[] | null;
  lastFetched: number | null;
}

const cache: DataCache = {
  characters: null,
  relationships: null,
  episodes: null,
  lastFetched: null,
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return cache.lastFetched !== null && Date.now() - cache.lastFetched < CACHE_TTL_MS;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Compare two episode IDs for sorting (returns -1, 0, 1).
 */
function compareEpisodeIds(a: string, b: string): number {
  const parsedA = parseEpisodeId(a);
  const parsedB = parseEpisodeId(b);
  if (!parsedA || !parsedB) return 0;

  if (parsedA.season !== parsedB.season) {
    return parsedA.season - parsedB.season;
  }
  return parsedA.episode - parsedB.episode;
}

/**
 * Converts an API Character to a TemporalCharacterState for a given episode.
 */
function characterToTemporalState(
  character: Character,
  episodeId: string,
  episodeNumber: number
): TemporalCharacterState {
  const metrics: CharacterMetrics = {
    presencePercentage: 50,
    averageIntensity: 3,
    bondStrength: 50,
    socialStanding: 50,
  };

  const classification: CharacterClassification = {
    role: (character.role as CharacterClassification["role"]) || "Supporting",
    rank: "Human",
    year: 1,
    status: "alive",
  };

  const physical: CharacterPhysical = {
    apparentAge: 20,
    build: "average",
    height: "average",
    distinguishingMarks: [],
  };

  const bloodline: CharacterBloodline = {
    purity: 0,
    generation: 0,
    sire: null,
    progeny: [],
  };

  return {
    episodeId,
    episodeNumber,
    id: character.id,
    name: character.name,
    species: "human",
    metrics,
    classification,
    physical,
    bloodline,
    feats: [],
    traits: character.canonical_traits || [],
    visualTier: 1,
    wearLevel: 0,
  };
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UseTemporalDataReturn {
  // Current state
  characters: TemporalCharacterState[];
  relationships: TemporalRelationship[];
  episodes: Episode[];
  currentEpisode: string;

  // Timeline control
  setEpisode: (episode: string) => void;
  nextEpisode: () => void;
  previousEpisode: () => void;

  // Playback
  isPlaying: boolean;
  togglePlayPause: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  // Loading states
  isLoading: boolean;
  error: Error | null;

  // Utilities
  getCharacterAtEpisode: (characterId: string, episode: string) => TemporalCharacterState | null;
  compareEpisodes: (episodeA: string, episodeB: string) => number;
  
  // Additional helpers
  episodeCount: number;
  currentEpisodeIndex: number;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useTemporalData(): UseTemporalDataReturn {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const [rawCharacters, setRawCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<TemporalRelationship[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<string>("s01e01");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const currentEpisodeRef = useRef(currentEpisode);
  const episodesRef = useRef(episodes);

  useEffect(() => {
    currentEpisodeRef.current = currentEpisode;
  }, [currentEpisode]);

  useEffect(() => {
    episodesRef.current = episodes;
  }, [episodes]);

  // ---------------------------------------------------------------------------
  // DERIVED STATE
  // ---------------------------------------------------------------------------

  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => compareEpisodeIds(a.id, b.id));
  }, [episodes]);

  const currentEpisodeIndex = useMemo(() => {
    const index = sortedEpisodes.findIndex((ep) => ep.id === currentEpisode);
    return index >= 0 ? index : 0;
  }, [sortedEpisodes, currentEpisode]);

  const episodeCount = sortedEpisodes.length;

  const characters = useMemo<TemporalCharacterState[]>(() => {
    return rawCharacters.map((char) =>
      characterToTemporalState(char, currentEpisode, currentEpisodeIndex + 1)
    );
  }, [rawCharacters, currentEpisode, currentEpisodeIndex]);

  // ---------------------------------------------------------------------------
  // PERSISTENCE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedSpeed = localStorage.getItem(LOCALSTORAGE_KEY_PLAYBACK_SPEED);
      if (savedSpeed) {
        const speed = parseFloat(savedSpeed);
        if (!isNaN(speed) && speed > 0 && speed <= 4) {
          setPlaybackSpeedState(speed);
        }
      }

      const savedEpisode = localStorage.getItem(LOCALSTORAGE_KEY_CURRENT_EPISODE);
      if (savedEpisode && /^s\d{2}e\d{2}$/.test(savedEpisode)) {
        setCurrentEpisode(savedEpisode);
      }
    } catch {
    }
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.25, Math.min(4, speed));
    setPlaybackSpeedState(clampedSpeed);
    try {
      localStorage.setItem(LOCALSTORAGE_KEY_PLAYBACK_SPEED, clampedSpeed.toString());
    } catch {
    }
  }, []);

  const setEpisode = useCallback((episode: string) => {
    setCurrentEpisode(episode);
    setIsPlaying(false);
    try {
      localStorage.setItem(LOCALSTORAGE_KEY_CURRENT_EPISODE, episode);
    } catch {
    }
  }, []);

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    if (isCacheValid() && cache.characters && cache.episodes) {
      setRawCharacters(cache.characters);
      setRelationships(cache.relationships || []);
      setEpisodes(
        cache.episodes.map((ep) => ({
          id: ep.id,
          season: ep.season,
          episodeNumber: ep.episodeNumber,
          title: ep.title,
          keyMoments: ep.keyMoments || [],
        }))
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [charactersData, episodesData] = await Promise.all([
        api.characters.list(),
        api.episodes.list(),
      ]);

      const transformedEpisodes: Episode[] = episodesData.map((ep) => ({
        id: ep.id,
        season: ep.season,
        episodeNumber: ep.episode_number,
        title: ep.title,
        keyMoments: [],
      }));

      let relationshipsData: TemporalRelationship[] = [];
      try {
        const response = await fetch("/api/characters/relationships");
        if (response.ok) {
          const data = await response.json();
          relationshipsData = data.map((rel: Record<string, unknown>) => ({
            id: rel.id as string,
            fromCharacterId: (rel.from_character_id || rel.fromCharacterId) as string,
            toCharacterId: (rel.to_character_id || rel.toCharacterId) as string,
            relationshipType: (rel.relationship_type || rel.relationshipType || "friendship") as TemporalRelationship["relationshipType"],
            intensity: (rel.intensity as number) || 3,
            firstAppearanceEpisode: (rel.first_appearance_episode || rel.firstAppearanceEpisode || "s01e01") as string,
            endEpisode: (rel.end_episode || rel.endEpisode || null) as string | null,
            isSecret: (rel.is_secret || rel.isSecret || false) as boolean,
            evolution: [],
          }));
        }
      } catch {
      }

      cache.characters = charactersData;
      cache.relationships = relationshipsData;
      cache.episodes = transformedEpisodes;
      cache.lastFetched = Date.now();

      setRawCharacters(charactersData);
      setRelationships(relationshipsData);
      setEpisodes(transformedEpisodes);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch temporal data");
      setError(error);
      console.error("useTemporalData fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  const nextEpisode = useCallback(() => {
    const eps = episodesRef.current;
    if (eps.length === 0) return;

    const sorted = [...eps].sort((a, b) => compareEpisodeIds(a.id, b.id));
    const currentIdx = sorted.findIndex((ep) => ep.id === currentEpisodeRef.current);

    if (currentIdx < sorted.length - 1) {
      const nextEp = sorted[currentIdx + 1];
      setCurrentEpisode(nextEp.id);
      try {
        localStorage.setItem(LOCALSTORAGE_KEY_CURRENT_EPISODE, nextEp.id);
      } catch {
      }
    } else {
      setIsPlaying(false);
    }
  }, []);

  const previousEpisode = useCallback(() => {
    const eps = episodesRef.current;
    if (eps.length === 0) return;

    const sorted = [...eps].sort((a, b) => compareEpisodeIds(a.id, b.id));
    const currentIdx = sorted.findIndex((ep) => ep.id === currentEpisodeRef.current);

    if (currentIdx > 0) {
      const prevEp = sorted[currentIdx - 1];
      setCurrentEpisode(prevEp.id);
      setIsPlaying(false);
      try {
        localStorage.setItem(LOCALSTORAGE_KEY_CURRENT_EPISODE, prevEp.id);
      } catch {
      }
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // ---------------------------------------------------------------------------
  // PLAYBACK INTERVAL
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = PLAYBACK_INTERVAL_BASE_MS / playbackSpeed;

    const interval = setInterval(() => {
      nextEpisode();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, nextEpisode]);

  // ---------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          previousEpisode();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextEpisode();
          break;
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
          e.preventDefault();
          const episodeNum = parseInt(e.key, 10);
          const episodeId = createEpisodeId(1, episodeNum);
          setEpisode(episodeId);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousEpisode, nextEpisode, togglePlayPause, setEpisode]);

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------

  const getCharacterAtEpisode = useCallback(
    (characterId: string, episode: string): TemporalCharacterState | null => {
      const char = rawCharacters.find((c) => c.id === characterId);
      if (!char) return null;

      const episodeIndex = sortedEpisodes.findIndex((ep) => ep.id === episode);
      if (episodeIndex < 0) return null;

      return characterToTemporalState(char, episode, episodeIndex + 1);
    },
    [rawCharacters, sortedEpisodes]
  );

  // ---------------------------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------------------------

  return {
    // Current state
    characters,
    relationships,
    episodes: sortedEpisodes,
    currentEpisode,

    // Timeline control
    setEpisode,
    nextEpisode,
    previousEpisode,

    // Playback
    isPlaying,
    togglePlayPause,
    playbackSpeed,
    setPlaybackSpeed,

    // Loading states
    isLoading,
    error,

    // Utilities
    getCharacterAtEpisode,
    compareEpisodes: compareEpisodeIds,

    // Additional helpers
    episodeCount,
    currentEpisodeIndex,
    refetch: fetchData,
  };
}

export default useTemporalData;
