import {
  TemporalCharacterState,
  TemporalRelationship,
} from "./temporalModels";
import { CardEvolutionEngine } from "./cardEvolutionEngine";

interface StateCache {
  characters: Map<string, TemporalCharacterState>;
  relationships: Map<string, TemporalRelationship[]>;
  timestamp: number;
}

export class TemporalGraphEngine {
  private evolutionEngine: CardEvolutionEngine;
  private currentEpisode: string;
  private subscribers: Set<() => void>;
  private cache: StateCache;
  private baseCharacters: any[];
  private baseRelationships: any[];

  constructor(
    baseCharacters: any[],
    baseRelationships: any[],
    evolutionRules: any[]
  ) {
    this.baseCharacters = baseCharacters;
    this.baseRelationships = baseRelationships;
    this.evolutionEngine = new CardEvolutionEngine(
      baseCharacters,
      evolutionRules
    );
    this.currentEpisode = "s01e01";
    this.subscribers = new Set();
    this.cache = {
      characters: new Map(),
      relationships: new Map(),
      timestamp: 0,
    };
  }

  getCharacterAtEpisode(
    characterId: string,
    episodeId: string
  ): TemporalCharacterState {
    const cacheKey = `${characterId}:${episodeId}`;

    if (this.cache.characters.has(cacheKey)) {
      return this.cache.characters.get(cacheKey)!;
    }

    const state = this.evolutionEngine.calculateState(characterId, episodeId);
    this.cache.characters.set(cacheKey, state);
    return state;
  }

  getAllCharactersAtEpisode(episodeId: string): TemporalCharacterState[] {
    return this.baseCharacters.map((char) =>
      this.getCharacterAtEpisode(char.id, episodeId)
    );
  }

  getRelationshipsAtEpisode(episodeId: string): TemporalRelationship[] {
    if (this.cache.relationships.has(episodeId)) {
      return this.cache.relationships.get(episodeId)!;
    }

    const relationships = this.baseRelationships.filter((rel) => {
      const startEp = rel.firstAppearanceEpisode || "s01e01";
      const endEp = rel.endEpisode;
      return this.compareEpisodes(startEp, episodeId) <= 0 &&
        (!endEp || this.compareEpisodes(endEp, episodeId) >= 0);
    });

    this.cache.relationships.set(episodeId, relationships);
    return relationships;
  }

  setEpisode(episodeId: string): void {
    this.currentEpisode = episodeId;
    this.notifySubscribers();
  }

  getCurrentEpisode(): string {
    return this.currentEpisode;
  }

  getCurrentState(): {
    characters: TemporalCharacterState[];
    relationships: TemporalRelationship[];
    episode: string;
  } {
    return {
      characters: this.getAllCharactersAtEpisode(this.currentEpisode),
      relationships: this.getRelationshipsAtEpisode(this.currentEpisode),
      episode: this.currentEpisode,
    };
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => cb());
  }

  clearCache(): void {
    this.cache.characters.clear();
    this.cache.relationships.clear();
    this.cache.timestamp = 0;
  }

  private compareEpisodes(a: string, b: string): number {
    const parseEp = (ep: string) => {
      const match = ep.match(/s(\d+)e(\d+)/);
      if (!match) return { season: 0, episode: 0 };
      return { season: parseInt(match[1]), episode: parseInt(match[2]) };
    };

    const epA = parseEp(a);
    const epB = parseEp(b);

    if (epA.season !== epB.season) {
      return epA.season - epB.season;
    }
    return epA.episode - epB.episode;
  }
}
