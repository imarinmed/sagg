/**
 * Temporal Character Relationship System Types
 *
 * These interfaces define the structure for tracking character state,
 * relationships, and evolution across episodes in the vampire wiki.
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/** Species classification for characters */
export type Species = "vampire" | "human";

/** Character role in the narrative */
export type CharacterRole =
  | "Protagonist"
  | "Antagonist"
  | "Love Interest"
  | "Family"
  | "Friend"
  | "Rival"
  | "Supporting";

/** Character social rank within vampire society */
export type CharacterRank =
  | "Elder"
  | "Noble"
  | "Fledgling"
  | "Outcast"
  | "Human";

/** Character status at a given point */
export type CharacterStatus =
  | "alive"
  | "deceased"
  | "undead"
  | "missing"
  | "transformed";

/** Relationship type between characters */
export type RelationshipType =
  | "romantic"
  | "familial"
  | "friendship"
  | "antagonistic"
  | "professional"
  | "mentor"
  | "sire"
  | "blood_bond"
  | "rival";

/** Trigger types for evolution rules */
export type EvolutionTriggerType =
  | "episode"
  | "event"
  | "milestone"
  | "relationship";

/** Operation types for evolution effects */
export type EvolutionOperation = "set" | "add" | "multiply" | "unlock";

// ============================================================================
// CHARACTER METRICS
// ============================================================================

/**
 * Quantitative metrics for character analysis at a point in time.
 */
export interface CharacterMetrics {
  /** Percentage of episode screen time (0-100) */
  presencePercentage: number;
  /** Average intensity of scenes (1-5) */
  averageIntensity: number;
  /** Strength of bonds with other characters (0-100) */
  bondStrength: number;
  /** Standing in social hierarchy (0-100) */
  socialStanding: number;
}

// ============================================================================
// CHARACTER CLASSIFICATION
// ============================================================================

/**
 * Narrative and social classification for a character.
 */
export interface CharacterClassification {
  /** Narrative role (Protagonist, Antagonist, etc.) */
  role: CharacterRole;
  /** Social rank in vampire society */
  rank: CharacterRank;
  /** Year/season the character first appears */
  year: number;
  /** Current status */
  status: CharacterStatus;
}

// ============================================================================
// PHYSICAL ATTRIBUTES
// ============================================================================

/**
 * Physical description of a character.
 */
export interface CharacterPhysical {
  /** Apparent age (vampires don't age) */
  apparentAge: number;
  /** Body build description */
  build: string;
  /** Height description or measurement */
  height: string;
  /** Notable physical features */
  distinguishingMarks: string[];
}

// ============================================================================
// BLOODLINE (VAMPIRE-SPECIFIC)
// ============================================================================

/**
 * Vampire bloodline information.
 * Only applicable to vampire characters.
 */
export interface CharacterBloodline {
  /** Blood purity percentage (0-100) */
  purity: number;
  /** Generation from the original vampire */
  generation: number;
  /** ID of the sire (vampire who turned them), null for originals */
  sire: string | null;
  /** IDs of progeny (vampires they've turned) */
  progeny: string[];
}

// ============================================================================
// CHARACTER FEATS
// ============================================================================

/**
 * Achievement or feat unlocked by a character.
 */
export interface CharacterFeat {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Episode ID where this feat was unlocked (e.g., 's01e03') */
  episodeUnlocked: string;
  /** Icon identifier for UI display */
  icon: string;
}

// ============================================================================
// TEMPORAL CHARACTER STATE
// ============================================================================

/**
 * Complete character state at a specific point in time (episode).
 *
 * This interface captures everything about a character at a given episode,
 * enabling temporal navigation through their development.
 */
export interface TemporalCharacterState {
  /** Episode ID (e.g., 's01e03') */
  episodeId: string;
  /** Numeric episode for ordering (1, 2, 3...) */
  episodeNumber: number;
  /** Character's unique identifier */
  id: string;
  /** Character's display name */
  name: string;
  /** Species classification */
  species: Species;
  /** Quantitative metrics at this point */
  metrics: CharacterMetrics;
  /** Narrative and social classification */
  classification: CharacterClassification;
  /** Physical description */
  physical: CharacterPhysical;
  /** Bloodline info (meaningful for vampires) */
  bloodline: CharacterBloodline;
  /** Feats/achievements unlocked up to this point */
  feats: CharacterFeat[];
  /** Character traits active at this point */
  traits: string[];
  /** Visual tier for UI rendering (0-5, higher = more prominent) */
  visualTier: number;
  /** Wear level for aged/battle-worn appearance (0-100) */
  wearLevel: number;
}

// ============================================================================
// RELATIONSHIP EVOLUTION ENTRY
// ============================================================================

/**
 * Single entry in relationship intensity evolution timeline.
 */
export interface RelationshipEvolutionEntry {
  /** Episode ID where change occurred */
  episodeId: string;
  /** Intensity level at this point (1-5) */
  intensity: number;
  /** Optional description of the change */
  description?: string;
  /** Timestamp within episode (HH:MM:SS) */
  timestamp?: string;
}

// ============================================================================
// TEMPORAL RELATIONSHIP
// ============================================================================

/**
 * Relationship state between two characters at a point in time.
 *
 * Tracks how relationships form, evolve, and potentially end across episodes.
 */
export interface TemporalRelationship {
  /** Unique relationship identifier */
  id: string;
  /** Source character ID */
  fromCharacterId: string;
  /** Target character ID */
  toCharacterId: string;
  /** Type of relationship */
  relationshipType: RelationshipType;
  /** Current intensity (1-5) */
  intensity: number;
  /** Episode ID where relationship first appears */
  firstAppearanceEpisode: string;
  /** Episode ID where relationship ends (null if ongoing) */
  endEpisode: string | null;
  /** Whether the relationship is hidden from other characters */
  isSecret: boolean;
  /** Timeline of intensity changes */
  evolution: RelationshipEvolutionEntry[];
}

// ============================================================================
// EVOLUTION RULE
// ============================================================================

/**
 * Trigger condition for character evolution.
 */
export interface EvolutionTrigger {
  /** Type of trigger */
  type: EvolutionTriggerType;
  /** Condition expression (e.g., 'episode >= s01e05', 'relationship.alfred.intensity >= 4') */
  condition: string;
}

/**
 * Effect to apply when evolution is triggered.
 */
export interface EvolutionEffect {
  /** Target attribute path (e.g., 'metrics.bondStrength', 'traits', 'bloodline.generation') */
  attribute: string;
  /** Operation to perform */
  operation: EvolutionOperation;
  /** Value to apply (type depends on operation and attribute) */
  value: unknown;
}

/**
 * Rule defining how characters evolve over time.
 *
 * Rules are evaluated per-episode to compute character states.
 */
export interface EvolutionRule {
  /** Trigger condition */
  trigger: EvolutionTrigger;
  /** Effect to apply when triggered */
  effect: EvolutionEffect;
}

// ============================================================================
// KEY MOMENT
// ============================================================================

/**
 * Significant moment within an episode.
 */
export interface KeyMoment {
  /** Timestamp within episode (HH:MM:SS) */
  timestamp: string;
  /** Timestamp in seconds for sorting/seeking */
  timestampSeconds: number;
  /** Description of the moment */
  description: string;
  /** Characters present in this moment */
  charactersPresent: string[];
  /** Type of content */
  contentType: string;
  /** Intensity rating (1-5) */
  intensity: number;
}

// ============================================================================
// EPISODE
// ============================================================================

/**
 * Episode metadata for timeline navigation.
 */
export interface Episode {
  /** Episode ID (e.g., 's01e03') */
  id: string;
  /** Season number */
  season: number;
  /** Episode number within season */
  episodeNumber: number;
  /** Episode title */
  title: string;
  /** Key moments/timestamps in the episode */
  keyMoments: KeyMoment[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Species.
 */
export function isSpecies(value: unknown): value is Species {
  return value === "vampire" || value === "human";
}

/**
 * Type guard to check if a value is a valid RelationshipType.
 */
export function isRelationshipType(value: unknown): value is RelationshipType {
  const validTypes: RelationshipType[] = [
    "romantic",
    "familial",
    "friendship",
    "antagonistic",
    "professional",
    "mentor",
    "sire",
    "blood_bond",
    "rival",
  ];
  return typeof value === "string" && validTypes.includes(value as RelationshipType);
}

/**
 * Type guard to check if a value is a valid EvolutionTriggerType.
 */
export function isEvolutionTriggerType(
  value: unknown
): value is EvolutionTriggerType {
  const validTypes: EvolutionTriggerType[] = [
    "episode",
    "event",
    "milestone",
    "relationship",
  ];
  return typeof value === "string" && validTypes.includes(value as EvolutionTriggerType);
}

/**
 * Type guard to check if a value is a valid EvolutionOperation.
 */
export function isEvolutionOperation(
  value: unknown
): value is EvolutionOperation {
  const validOps: EvolutionOperation[] = ["set", "add", "multiply", "unlock"];
  return typeof value === "string" && validOps.includes(value as EvolutionOperation);
}

/**
 * Type guard for TemporalCharacterState.
 */
export function isTemporalCharacterState(
  value: unknown
): value is TemporalCharacterState {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.episodeId === "string" &&
    typeof obj.episodeNumber === "number" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    isSpecies(obj.species) &&
    typeof obj.metrics === "object" &&
    typeof obj.classification === "object" &&
    typeof obj.physical === "object" &&
    typeof obj.bloodline === "object" &&
    Array.isArray(obj.feats) &&
    Array.isArray(obj.traits) &&
    typeof obj.visualTier === "number" &&
    typeof obj.wearLevel === "number"
  );
}

/**
 * Type guard for TemporalRelationship.
 */
export function isTemporalRelationship(
  value: unknown
): value is TemporalRelationship {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.fromCharacterId === "string" &&
    typeof obj.toCharacterId === "string" &&
    typeof obj.relationshipType === "string" &&
    typeof obj.intensity === "number" &&
    typeof obj.firstAppearanceEpisode === "string" &&
    (obj.endEpisode === null || typeof obj.endEpisode === "string") &&
    typeof obj.isSecret === "boolean" &&
    Array.isArray(obj.evolution)
  );
}

/**
 * Type guard for Episode.
 */
export function isEpisode(value: unknown): value is Episode {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.season === "number" &&
    typeof obj.episodeNumber === "number" &&
    typeof obj.title === "string" &&
    Array.isArray(obj.keyMoments)
  );
}

/**
 * Type guard for EvolutionRule.
 */
export function isEvolutionRule(value: unknown): value is EvolutionRule {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.trigger !== "object" || obj.trigger === null) return false;
  if (typeof obj.effect !== "object" || obj.effect === null) return false;
  const trigger = obj.trigger as Record<string, unknown>;
  const effect = obj.effect as Record<string, unknown>;
  return (
    isEvolutionTriggerType(trigger.type) &&
    typeof trigger.condition === "string" &&
    typeof effect.attribute === "string" &&
    isEvolutionOperation(effect.operation)
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Partial temporal state for incremental updates.
 */
export type PartialTemporalCharacterState = Partial<TemporalCharacterState> &
  Pick<TemporalCharacterState, "id" | "episodeId">;

/**
 * Character state diff between two episodes.
 */
export interface TemporalCharacterDiff {
  characterId: string;
  fromEpisodeId: string;
  toEpisodeId: string;
  changes: {
    attribute: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
}

/**
 * Timeline of character states across all episodes.
 */
export interface CharacterTimeline {
  characterId: string;
  characterName: string;
  states: TemporalCharacterState[];
}

/**
 * Timeline of relationship evolution.
 */
export interface RelationshipTimeline {
  relationshipId: string;
  fromCharacterId: string;
  toCharacterId: string;
  relationshipType: RelationshipType;
  snapshots: {
    episodeId: string;
    intensity: number;
    isActive: boolean;
  }[];
}

/**
 * Episode ID format pattern for validation.
 * Format: s{season}e{episode} e.g., 's01e03'
 */
export const EPISODE_ID_PATTERN = /^s\d{2}e\d{2}$/;

/**
 * Validates an episode ID format.
 */
export function isValidEpisodeId(id: string): boolean {
  return EPISODE_ID_PATTERN.test(id);
}

/**
 * Parses episode ID into season and episode numbers.
 */
export function parseEpisodeId(
  id: string
): { season: number; episode: number } | null {
  const match = id.match(/^s(\d{2})e(\d{2})$/);
  if (!match) return null;
  return {
    season: parseInt(match[1], 10),
    episode: parseInt(match[2], 10),
  };
}

/**
 * Creates an episode ID from season and episode numbers.
 */
export function createEpisodeId(season: number, episode: number): string {
  return `s${season.toString().padStart(2, "0")}e${episode.toString().padStart(2, "0")}`;
}
