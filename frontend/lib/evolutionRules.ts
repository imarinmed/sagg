import { EvolutionRule } from "./temporalModels";

/**
 * Evolution Rules System
 *
 * Defines how characters evolve over the course of the story.
 * Each rule specifies a trigger condition and an effect to apply.
 */

// ============================================================================
// KIARA NATT OCH DAG - Protagonist Vampire
// ============================================================================

export const kiaraEvolutionRules: EvolutionRule[] = [
  // Episode-based rules
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "metrics.presencePercentage",
      operation: "set",
      value: 85,
    },
  },
  {
    trigger: { type: "episode", condition: "s01e02" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "rebellious", name: "Rebellious", icon: "⚡" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e03" },
    effect: {
      attribute: "feats",
      operation: "unlock",
      value: {
        id: "first_feeding",
        name: "First Feeding",
        icon: "🩸",
        category: "blood",
      },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e03" },
    effect: {
      attribute: "bloodline.purity",
      operation: "add",
      value: 5,
    },
  },
  {
    trigger: { type: "episode", condition: "s01e04" },
    effect: {
      attribute: "metrics.bondStrength",
      operation: "add",
      value: 15,
    },
  },
  {
    trigger: { type: "episode", condition: "s01e05" },
    effect: {
      attribute: "feats",
      operation: "unlock",
      value: {
        id: "uncle_attraction",
        name: "Forbidden Attraction",
        icon: "💋",
        category: "romance",
      },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e06" },
    effect: {
      attribute: "classification.status",
      operation: "set",
      value: "transformed",
    },
  },
  {
    trigger: { type: "episode", condition: "s01e07" },
    effect: {
      attribute: "feats",
      operation: "unlock",
      value: {
        id: "blood_bond_complete",
        name: "Blood Bond Sealed",
        icon: "🔗",
        category: "blood",
      },
    },
  },
  // Milestone rules
  {
    trigger: { type: "milestone", condition: "blood_bond_formed" },
    effect: {
      attribute: "metrics.bondStrength",
      operation: "add",
      value: 20,
    },
  },
  {
    trigger: { type: "milestone", condition: "first_romantic_encounter" },
    effect: {
      attribute: "metrics.socialStanding",
      operation: "add",
      value: 10,
    },
  },
];

// ============================================================================
// ALFRED - Human Love Interest
// ============================================================================

export const alfredEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "metrics.presencePercentage",
      operation: "set",
      value: 75,
    },
  },
  {
    trigger: { type: "episode", condition: "s01e02" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "protective", name: "Protective", icon: "🛡️" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e03" },
    effect: {
      attribute: "feats",
      operation: "unlock",
      value: {
        id: "first_bite",
        name: "First Bite",
        icon: "🩸",
        category: "blood",
      },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e04" },
    effect: {
      attribute: "metrics.bondStrength",
      operation: "add",
      value: 20,
    },
  },
  {
    trigger: { type: "episode", condition: "s01e05" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "possessive", name: "Possessive", icon: "🔒" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e07" },
    effect: {
      attribute: "classification.role",
      operation: "set",
      value: "Love Interest",
    },
  },
];

// ============================================================================
// HENRY NATT OCH DAG - Vampire Father
// ============================================================================

export const henryEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "classification.rank",
      operation: "set",
      value: "Elder",
    },
  },
  {
    trigger: { type: "episode", condition: "s01e03" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "authoritarian", name: "Authoritarian", icon: "👑" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e06" },
    effect: {
      attribute: "feats",
      operation: "unlock",
      value: {
        id: "father_confrontation",
        name: "Father's Wrath",
        icon: "⚡",
        category: "power",
      },
    },
  },
  {
    trigger: { type: "milestone", condition: "family_conflict" },
    effect: {
      attribute: "bloodline.purity",
      operation: "add",
      value: -2,
    },
  },
];

// ============================================================================
// DESIRÉE NATT OCH DAG - Vampire Mother
// ============================================================================

export const desireeEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "classification.rank",
      operation: "set",
      value: "Noble",
    },
  },
  {
    trigger: { type: "episode", condition: "s01e02" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "controlling", name: "Controlling", icon: "🎭" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e05" },
    effect: {
      attribute: "metrics.socialStanding",
      operation: "add",
      value: 5,
    },
  },
];

// ============================================================================
// JACQUES NATT OCH DAG - Vampire Uncle
// ============================================================================

export const jacquesEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "mysterious", name: "Mysterious", icon: "🌙" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e03" },
    effect: {
      attribute: "metrics.averageIntensity",
      operation: "add",
      value: 0.5,
    },
  },
  {
    trigger: { type: "episode", condition: "s01e05" },
    effect: {
      attribute: "feats",
      operation: "unlock",
      value: {
        id: "seductive_uncle",
        name: "Seductive Influence",
        icon: "💋",
        category: "romance",
      },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e05" },
    effect: {
      attribute: "metrics.bondStrength",
      operation: "add",
      value: 25,
    },
  },
];

// ============================================================================
// ELISE - Human Friend
// ============================================================================

export const eliseEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "classification.role",
      operation: "set",
      value: "Friend",
    },
  },
  {
    trigger: { type: "episode", condition: "s01e02" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "loyal", name: "Loyal", icon: "🤝" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e04" },
    effect: {
      attribute: "metrics.socialStanding",
      operation: "add",
      value: 8,
    },
  },
];

// ============================================================================
// CHLOE - Human Rival
// ============================================================================

export const chloeEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "classification.role",
      operation: "set",
      value: "Rival",
    },
  },
  {
    trigger: { type: "episode", condition: "s01e02" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "competitive", name: "Competitive", icon: "⚔️" },
    },
  },
  {
    trigger: { type: "milestone", condition: "social_competition_won" },
    effect: {
      attribute: "metrics.socialStanding",
      operation: "add",
      value: 15,
    },
  },
];

// ============================================================================
// ERIC - Human Friend
// ============================================================================

export const ericEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "supportive", name: "Supportive", icon: "🤗" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e03" },
    effect: {
      attribute: "metrics.presencePercentage",
      operation: "add",
      value: 10,
    },
  },
];

// ============================================================================
// FELICIA - Human Follower
// ============================================================================

export const feliciaEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "follower", name: "Follower", icon: "👥" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e04" },
    effect: {
      attribute: "metrics.socialStanding",
      operation: "add",
      value: 5,
    },
  },
];

// ============================================================================
// DIDDE - Human Jock
// ============================================================================

export const diddeEvolutionRules: EvolutionRule[] = [
  {
    trigger: { type: "episode", condition: "s01e01" },
    effect: {
      attribute: "traits",
      operation: "unlock",
      value: { id: "athletic", name: "Athletic", icon: "💪" },
    },
  },
  {
    trigger: { type: "episode", condition: "s01e02" },
    effect: {
      attribute: "physical.build",
      operation: "set",
      value: "Athletic",
    },
  },
];

// ============================================================================
// ALL EVOLUTION RULES
// ============================================================================

export const evolutionRules: EvolutionRule[] = [
  ...kiaraEvolutionRules,
  ...alfredEvolutionRules,
  ...henryEvolutionRules,
  ...desireeEvolutionRules,
  ...jacquesEvolutionRules,
  ...eliseEvolutionRules,
  ...chloeEvolutionRules,
  ...ericEvolutionRules,
  ...feliciaEvolutionRules,
  ...diddeEvolutionRules,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getRulesForCharacter(characterId: string): EvolutionRule[] {
  const ruleMap: Record<string, EvolutionRule[]> = {
    kiara_natt_och_dag: kiaraEvolutionRules,
    alfred: alfredEvolutionRules,
    henry_natt_och_dag: henryEvolutionRules,
    desiree_natt_och_dag: desireeEvolutionRules,
    jacques_natt_och_dag: jacquesEvolutionRules,
    elise: eliseEvolutionRules,
    chloe: chloeEvolutionRules,
    eric: ericEvolutionRules,
    felicia: feliciaEvolutionRules,
    didde: diddeEvolutionRules,
  };
  return ruleMap[characterId] || [];
}

export function getRulesForEpisode(episodeId: string): EvolutionRule[] {
  return evolutionRules.filter(
    (rule) =>
      rule.trigger.type === "episode" &&
      rule.trigger.condition === episodeId
  );
}

export function getAllCharacterIds(): string[] {
  return [
    "kiara_natt_och_dag",
    "alfred",
    "henry_natt_och_dag",
    "desiree_natt_och_dag",
    "jacques_natt_och_dag",
    "elise",
    "chloe",
    "eric",
    "felicia",
    "didde",
  ];
}

export const EVOLUTION_RULES_COUNT = evolutionRules.length;
