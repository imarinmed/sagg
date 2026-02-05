import {
  TemporalCharacterState,
  TemporalRelationship,
  EvolutionRule,
  Episode,
  CharacterMetrics,
  CharacterClassification,
  CharacterPhysical,
  CharacterBloodline,
  CharacterFeat,
  CharacterRole,
  isValidEpisodeId,
  parseEpisodeId,
  createEpisodeId,
} from "./temporalModels";

/**
 * CardEvolutionEngine
 *
 * Calculates character card state at any point in the timeline.
 * Applies evolution rules cumulatively to determine character state.
 */
export class CardEvolutionEngine {
  private baseCharacters: Map<string, any>;
  private evolutionRules: EvolutionRule[];
  private stateCache: Map<string, TemporalCharacterState>;

  constructor(baseCharacters: any[], evolutionRules: EvolutionRule[]) {
    this.baseCharacters = new Map(baseCharacters.map((c) => [c.id, c]));
    this.evolutionRules = evolutionRules;
    this.stateCache = new Map();
  }

  /**
   * Calculate character state at a specific episode
   */
  calculateState(
    characterId: string,
    episodeId: string
  ): TemporalCharacterState {
    const cacheKey = `${characterId}:${episodeId}`;
    if (this.stateCache.has(cacheKey)) {
      return this.stateCache.get(cacheKey)!;
    }

    const baseCharacter = this.baseCharacters.get(characterId);
    if (!baseCharacter) {
      throw new Error(`Character not found: ${characterId}`);
    }

    const parsed = parseEpisodeId(episodeId);
    if (!parsed) {
      throw new Error(`Invalid episode ID format: ${episodeId}`);
    }
    const { season, episode } = parsed;

    // Start with base state
    let state = this.createBaseState(baseCharacter, episodeId, episode);

    // Apply evolution rules up to this episode
    const applicableRules = this.getApplicableRules(characterId, episodeId);
    for (const rule of applicableRules) {
      state = this.applyRule(state, rule);
    }

    // Cache the result
    this.stateCache.set(cacheKey, state);
    return state;
  }

  /**
   * Get state history for a character across all episodes
   */
  getStateHistory(
    characterId: string,
    episodes: string[]
  ): TemporalCharacterState[] {
    return episodes.map((episodeId) =>
      this.calculateState(characterId, episodeId)
    );
  }

  /**
   * Compare two states and return differences
   */
  compareStates(
    stateA: TemporalCharacterState,
    stateB: TemporalCharacterState
  ): StateDiff {
    const diff: StateDiff = {
      characterId: stateA.id,
      fromEpisode: stateA.episodeId,
      toEpisode: stateB.episodeId,
      metricsChanged: {},
      classificationChanged: {},
      featsAdded: [],
      featsRemoved: [],
      traitsAdded: [],
      traitsRemoved: [],
    };

    // Compare metrics
    for (const key of Object.keys(stateA.metrics) as Array<
      keyof CharacterMetrics
    >) {
      if (stateA.metrics[key] !== stateB.metrics[key]) {
        diff.metricsChanged[key] = {
          from: stateA.metrics[key],
          to: stateB.metrics[key],
        };
      }
    }

    // Compare feats
    const featsA = new Set(stateA.feats.map((f) => f.id));
    const featsB = new Set(stateB.feats.map((f) => f.id));
    diff.featsAdded = stateB.feats.filter((f) => !featsA.has(f.id));
    diff.featsRemoved = stateA.feats.filter((f) => !featsB.has(f.id));

    // Compare traits
    const traitsA = new Set(stateA.traits);
    const traitsB = new Set(stateB.traits);
    diff.traitsAdded = stateB.traits.filter((t) => !traitsA.has(t));
    diff.traitsRemoved = stateA.traits.filter((t) => !traitsB.has(t));

    return diff;
  }

  /**
   * Interpolate between two states for smooth animation
   */
  interpolateStates(
    fromState: TemporalCharacterState,
    toState: TemporalCharacterState,
    progress: number
  ): TemporalCharacterState {
    const interpolated: TemporalCharacterState = {
      ...fromState,
      metrics: {
        presencePercentage: lerp(
          fromState.metrics.presencePercentage,
          toState.metrics.presencePercentage,
          progress
        ),
        averageIntensity: lerp(
          fromState.metrics.averageIntensity,
          toState.metrics.averageIntensity,
          progress
        ),
        bondStrength: lerp(
          fromState.metrics.bondStrength,
          toState.metrics.bondStrength,
          progress
        ),
        socialStanding: lerp(
          fromState.metrics.socialStanding,
          toState.metrics.socialStanding,
          progress
        ),
      },
      bloodline: {
        ...fromState.bloodline,
        purity: lerp(
          fromState.bloodline.purity,
          toState.bloodline.purity,
          progress
        ),
      },
    };

    return interpolated;
  }

  /**
   * Clear the state cache
   */
  clearCache(): void {
    this.stateCache.clear();
  }

  // Private helper methods

  private createBaseState(
    baseCharacter: any,
    episodeId: string,
    episodeNumber: number
  ): TemporalCharacterState {
    const isVampire = baseCharacter.canonical?.species === "vampire";

    return {
      episodeId,
      episodeNumber,
      id: baseCharacter.id,
      name: baseCharacter.name,
      species: isVampire ? "vampire" : "human",
      metrics: {
        presencePercentage: this.calculatePresence(baseCharacter, episodeId),
        averageIntensity: 3.0,
        bondStrength: 50,
        socialStanding: 50,
      },
      classification: {
        role: this.inferRole(baseCharacter),
        rank: isVampire ? "Fledgling" : "Human",
        year: 1,
        status: "alive",
      },
      physical: {
        apparentAge: baseCharacter.canonical?.age || 17,
        build: "Slender",
        height: "5'6\"",
        distinguishingMarks: [],
      },
      bloodline: {
        purity: isVampire ? 85 : 0,
        generation: isVampire ? 3 : 0,
        sire: null,
        progeny: [],
      },
      feats: [],
      traits: baseCharacter.canonical?.traits || [],
      visualTier: 1,
      wearLevel: 0,
    };
  }

  private getApplicableRules(
    characterId: string,
    episodeId: string
  ): EvolutionRule[] {
    const targetEpisode = parseEpisodeId(episodeId);
    if (!targetEpisode) return [];

    return this.evolutionRules.filter((rule) => {
      // Check if rule applies to this character
      if (
        rule.trigger.condition.includes("character:") &&
        !rule.trigger.condition.includes(characterId)
      ) {
        return false;
      }

      // Check if rule trigger episode is <= target episode
      if (rule.trigger.type === "episode") {
        const ruleEpisode = parseEpisodeId(rule.trigger.condition);
        if (!ruleEpisode) return false;
        return (
          ruleEpisode.season < targetEpisode.season ||
          (ruleEpisode.season === targetEpisode.season &&
            ruleEpisode.episode <= targetEpisode.episode)
        );
      }

      return true;
    });
  }

  private applyRule(
    state: TemporalCharacterState,
    rule: EvolutionRule
  ): TemporalCharacterState {
    const newState = { ...state };

    switch (rule.effect.operation) {
      case "set":
        this.setAttribute(newState, rule.effect.attribute, rule.effect.value);
        break;
      case "add":
        this.addAttribute(newState, rule.effect.attribute, rule.effect.value as number);
        break;
      case "multiply":
        this.multiplyAttribute(
          newState,
          rule.effect.attribute,
          rule.effect.value as number
        );
        break;
      case "unlock":
        this.unlockFeat(newState, rule.effect.value);
        break;
    }

    return newState;
  }

  private setAttribute(state: any, attribute: string, value: any): void {
    const path = attribute.split(".");
    let current = state;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  private addAttribute(state: any, attribute: string, value: number): void {
    const path = attribute.split(".");
    let current = state;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const key = path[path.length - 1];
    current[key] = (current[key] || 0) + value;
  }

  private multiplyAttribute(
    state: any,
    attribute: string,
    value: number
  ): void {
    const path = attribute.split(".");
    let current = state;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const key = path[path.length - 1];
    current[key] = (current[key] || 0) * value;
  }

  private unlockFeat(state: TemporalCharacterState, feat: any): void {
    if (!state.feats.find((f) => f.id === feat.id)) {
      state.feats.push({
        ...feat,
        episodeUnlocked: state.episodeId,
      });
    }
  }

  private calculatePresence(character: any, episodeId: string): number {
    const appearances = character.appearances || [];
    const targetEpisode = parseEpisodeId(episodeId);
    if (!targetEpisode) return 0;

    // Count appearances up to this episode
    let count = 0;
    for (const ep of appearances) {
      const epParsed = parseEpisodeId(ep);
      if (!epParsed) continue;
      if (
        epParsed.season < targetEpisode.season ||
        (epParsed.season === targetEpisode.season &&
          epParsed.episode <= targetEpisode.episode)
      ) {
        count++;
      }
    }

    // Calculate percentage (assuming 7 episodes in season 1)
    return Math.round((count / 7) * 100);
  }

  private inferRole(character: any): CharacterRole {
    const arc = character.canonical?.arc || "";
    if (arc.includes("protagonist")) return "Protagonist";
    if (arc.includes("love")) return "Love Interest";
    if (arc.includes("friend")) return "Friend";
    if (arc.includes("rival")) return "Rival";
    return "Supporting";
  }
}

/**
 * State difference between two time points
 */
export interface StateDiff {
  characterId: string;
  fromEpisode: string;
  toEpisode: string;
  metricsChanged: Partial<
    Record<keyof CharacterMetrics, { from: number; to: number }>
  >;
  classificationChanged: Partial<Record<string, { from: any; to: any }>>;
  featsAdded: CharacterFeat[];
  featsRemoved: CharacterFeat[];
  traitsAdded: string[];
  traitsRemoved: string[];
}

/**
 * Linear interpolation between two values
 */
export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/**
 * Compare two episode IDs
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 * Throws if either episode ID is invalid
 */
export function compareEpisodes(a: string, b: string): number {
  const parsedA = parseEpisodeId(a);
  const parsedB = parseEpisodeId(b);

  if (!parsedA) throw new Error(`Invalid episode ID: ${a}`);
  if (!parsedB) throw new Error(`Invalid episode ID: ${b}`);

  if (parsedA.season !== parsedB.season) {
    return parsedA.season - parsedB.season;
  }
  return parsedA.episode - parsedB.episode;
}

/**
 * Get episode range between two episodes (inclusive)
 */
export function getEpisodeRange(start: string, end: string): string[] {
  const startParsed = parseEpisodeId(start);
  const endParsed = parseEpisodeId(end);

  if (!startParsed) throw new Error(`Invalid episode ID: ${start}`);
  if (!endParsed) throw new Error(`Invalid episode ID: ${end}`);

  const episodes: string[] = [];

  for (
    let season = startParsed.season;
    season <= endParsed.season;
    season++
  ) {
    const startEp = season === startParsed.season ? startParsed.episode : 1;
    const endEp = season === endParsed.season ? endParsed.episode : 7;

    for (let ep = startEp; ep <= endEp; ep++) {
      episodes.push(createEpisodeId(season, ep));
    }
  }

  return episodes;
}
