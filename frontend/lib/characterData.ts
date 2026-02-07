// Static character data for the frontend
// This mirrors the structure expected from the API

export interface CatalogId {
  bst: string;
  sst: string;
}

export interface Measurements {
  bust: string;
  waist: string;
  hips: string;
}

export interface PhysicalProfile {
  height: string;
  measurements: Measurements;
  build: string;
  distinguishing_features: string[];
}

export interface PerformanceMetrics {
  stamina: number;      // 1-10
  flexibility: number;
  pain_tolerance: number;
  recovery_rate: number;
}

export interface Vitals {
  blood_type: string;
  heart_rate_resting: number;
  body_temperature: string;
}

export interface SexualActivity {
  encounters_total?: number;
  encounters_by_episode?: Record<string, number>;
  partners_unique?: number;
  intensity_average?: number;
  preferences_satisfied?: string[];
}

export interface ClassPeriod {
  time: string;
  subject: string;
  location: string;
}

export interface DaySchedule {
  day: string;
  periods: ClassPeriod[];
}

export interface Obligation {
  type: string;
  role: string;
  schedule: string;
}

export interface LoanEvent {
  episode: string;
  lender: string;
  duration: string;
  context: string;
  restrictions: string[];
}

export interface Extracurricular {
  name: string;
  schedule: string;
  role: string;
}

export interface StudentProfile {
  school: string;
  grade: string;
  class_schedule: DaySchedule[];
  obligations: Obligation[];
  loan_schedule: LoanEvent[];
  extracurriculars: Extracurricular[];
}

export interface AdultProfile {
  occupation: string;
  social_status: string;
  political_role?: string;
  obligations: string[];
}

export interface StaticCharacter {
  id: string;
  name: string;
  portrayed_by: string;
  species: "vampire" | "human";
  role?: string;
  description?: string;
  canonical_traits: string[];
  adaptation_traits: string[];
  adaptation_notes?: string;
  catalog_id?: CatalogId;
  physical_profile?: PhysicalProfile;
  performance_metrics?: PerformanceMetrics;
  vitals?: Vitals;
  sexual_activity?: SexualActivity;
  student_profile?: StudentProfile;
  adult_profile?: AdultProfile;
  kink_profile?: {
    preferences: string[];
    limits: string[];
    evolution: string[];
  };
}

export const staticCharacters: StaticCharacter[] = [
  {
    id: "kiara",
    name: "Kiara Natt och Dag",
    portrayed_by: "Filippa Kavalic",
    species: "vampire",
    role: "Protagonist",
    description: "A young vampire navigating the complexities of high school life while hiding her true nature from her human classmates.",
    canonical_traits: ["vampire", "teenager", "student", "natt_och_dag_family"],
    adaptation_traits: ["bloodlust_control", "daywalker", "empathic"],
    adaptation_notes: "In this dark adaptation, Kiara struggles with intense bloodlust during moments of emotional vulnerability, particularly around her human love interest.",
    kink_profile: {
      preferences: ["biting", "blood_play", "dominance"],
      limits: ["permanent_harm", "non_consensual"],
      evolution: ["discovers_blood_bond", "explores_vampire_instincts"],
    },
  },
  {
    id: "alfred",
    name: "Alfred",
    portrayed_by: "Aaron Holgersson",
    species: "human",
    role: "Love Interest",
    description: "A human student who becomes entangled in Kiara's world, unaware of the dangers that come with loving a vampire.",
    canonical_traits: ["human", "teenager", "student"],
    adaptation_traits: ["fascinated_by_darkness", "willing_prey"],
    adaptation_notes: "Alfred's fascination with the supernatural leads him to willingly enter dangerous situations with Kiara.",
    kink_profile: {
      preferences: ["submission", "vampire_fetish", "danger"],
      limits: ["permanent_harm"],
      evolution: ["discovers_kiaras_nature", "accepts_vampire_world"],
    },
  },
  {
    id: "elise",
    name: "Elise",
    portrayed_by: "Elsa Östlind",
    species: "human",
    role: "Friend",
    description: "Kiara's loyal friend and confidante who provides grounding support in her chaotic supernatural life.",
    canonical_traits: ["human", "teenager", "student"],
    adaptation_traits: ["secret_keeper", "protective"],
    adaptation_notes: "Elise becomes Kiara's secret keeper, learning to navigate the dangerous world of vampires while maintaining her humanity.",
    kink_profile: {
      preferences: [],
      limits: ["supernatural_involvement"],
      evolution: ["learns_secret", "becomes_confidante"],
    },
  },
  {
    id: "chloe",
    name: "Chloe",
    portrayed_by: "Laura Maik",
    species: "human",
    role: "Rival",
    description: "A popular student with her own secrets who becomes both rival and unexpected ally to Kiara.",
    canonical_traits: ["human", "teenager", "student", "popular"],
    adaptation_traits: ["hidden_vulnerability", "complex_motivations"],
    adaptation_notes: "Chloe's antagonism masks her own hidden vulnerabilities and secret knowledge of the supernatural world.",
    kink_profile: {
      preferences: ["manipulation", "power_games"],
      limits: [],
      evolution: ["reveals_hidden_depths", "uneasy_alliance"],
    },
  },
  {
    id: "henry",
    name: "Henry Natt och Dag",
    portrayed_by: "Olle Sarri",
    species: "vampire",
    role: "Family",
    description: "Kiara's vampire father, protective and traditional, who struggles with his daughter's modern attitudes toward humans.",
    canonical_traits: ["vampire", "adult", "natt_och_dag_family", "parent"],
    adaptation_traits: ["traditionalist", "protective", "ancient"],
    adaptation_notes: "Henry represents the old ways of vampire society, viewing humans as prey rather than equals, creating tension with Kiara's more progressive views.",
    kink_profile: {
      preferences: ["traditional_hunting", "authority"],
      limits: ["family_harm"],
      evolution: ["protects_family", "confronts_changing_times"],
    },
  },
  {
    id: "jacques",
    name: "Jacques Natt och Dag",
    portrayed_by: "Åke Bremer Wold",
    species: "vampire",
    role: "Family",
    description: "Kiara's vampire uncle with mysterious connections to the darker underbelly of vampire society.",
    canonical_traits: ["vampire", "adult", "natt_och_dag_family"],
    adaptation_traits: ["shadowy_connections", "morally_ambiguous"],
    adaptation_notes: "Jacques operates in the gray areas of vampire society, engaging in activities that blur the lines between predator and monster.",
    kink_profile: {
      preferences: ["power", "control", "dark_rituals"],
      limits: [],
      evolution: ["reveals_dark_connections", "tests_family_loyalty"],
    },
  },
  {
    id: "desiree",
    name: "Desirée Natt och Dag",
    portrayed_by: "Katarina Macli",
    species: "vampire",
    role: "Family",
    description: "Kiara's vampire mother, elegant and ancient, who balances maternal love with the harsh realities of vampire existence.",
    canonical_traits: ["vampire", "adult", "natt_och_dag_family", "parent"],
    adaptation_traits: ["ancient_wisdom", "elegant_predator"],
    adaptation_notes: "Desirée embodies the dual nature of vampires - capable of profound love for family while being a terrifying predator to others.",
    kink_profile: {
      preferences: ["elegant_hunting", "sophisticated_tastes"],
      limits: ["family_harm"],
      evolution: ["guides_daughter", "protects_legacy"],
    },
  },
  {
    id: "eric",
    name: "Eric",
    portrayed_by: "Pontus Bennemyr",
    species: "human",
    role: "Friend",
    description: "A human friend caught between two worlds, struggling to maintain his humanity while surrounded by supernatural dangers.",
    canonical_traits: ["human", "teenager", "student"],
    adaptation_traits: ["reluctant_involvement", "moral_compass"],
    adaptation_notes: "Eric serves as the moral compass, questioning the morality of vampire existence while forming unexpected bonds.",
    kink_profile: {
      preferences: [],
      limits: ["supernatural_involvement"],
      evolution: ["discovers_truth", "chooses_side"],
    },
  },
];

// Helper function to get a character by ID
export function getCharacterById(id: string): StaticCharacter | undefined {
  return staticCharacters.find((char) => char.id === id);
}

// Helper function to get all characters
export function getAllCharacters(): StaticCharacter[] {
  return staticCharacters;
}

// Mock relationship graph data
export function getMockRelationshipGraph(characterId: string) {
  const character = getCharacterById(characterId);
  if (!character) return null;

  const isVampire = character.species === "vampire";
  const familyMembers = staticCharacters.filter(
    (c) => c.id !== characterId && c.species === "vampire" && c.id.includes("natt")
  );
  const loveInterests = staticCharacters.filter(
    (c) => c.id !== characterId && (c.role === "Love Interest" || c.id === "alfred")
  );
  const friends = staticCharacters.filter(
    (c) => c.id !== characterId && c.role === "Friend"
  );

  const nodes = [
    {
      id: characterId,
      name: character.name,
      group: isVampire ? 1 : 2,
      radius: 35,
      color: isVampire ? "#8B0000" : "#D4AF37",
      metadata: { role: character.role, family: character.species },
    },
    ...familyMembers.map((c) => ({
      id: c.id,
      name: c.name,
      group: 1,
      radius: 25,
      color: "#8B0000",
      metadata: { role: c.role, family: "vampire" },
    })),
    ...loveInterests.map((c) => ({
      id: c.id,
      name: c.name,
      group: 2,
      radius: 25,
      color: "#D4AF37",
      metadata: { role: c.role, family: c.species },
    })),
    ...friends.map((c) => ({
      id: c.id,
      name: c.name,
      group: 3,
      radius: 20,
      color: "#6b7280",
      metadata: { role: c.role, family: c.species },
    })),
  ];

  const links = [
    ...familyMembers.map((c) => ({
      source: characterId,
      target: c.id,
      type: "familial",
      intensity: 5,
      description: "Family bond",
      color: "#8B0000",
      width: 3,
    })),
    ...loveInterests.map((c) => ({
      source: characterId,
      target: c.id,
      type: "romantic",
      intensity: 4,
      description: "Romantic interest",
      color: "#D4AF37",
      width: 2,
    })),
    ...friends.map((c) => ({
      source: characterId,
      target: c.id,
      type: "friendship",
      intensity: 3,
      description: "Friendship",
      color: "#6b7280",
      width: 2,
    })),
  ];

  return { nodes, links };
}

// Mock evolution data
export function getMockEvolutionData(characterId: string) {
  const character = getCharacterById(characterId);
  if (!character) return null;

  const milestones = [
    {
      id: `${characterId}-m1`,
      character_id: characterId,
      episode_id: "s01e01",
      timestamp: "0:15:00",
      milestone_type: "first_appearance",
      description: `First appearance of ${character.name}`,
      importance: 5,
      related_characters: [],
      quote: character.species === "vampire" 
        ? "The hunger is always there, just beneath the surface."
        : "I never believed in monsters until I met one.",
      intensity: 3,
      content_type: "party",
    },
    {
      id: `${characterId}-m2`,
      character_id: characterId,
      episode_id: "s01e03",
      timestamp: "0:22:00",
      milestone_type: "relationship_change",
      description: "Key relationship development",
      importance: 4,
      related_characters: ["kiara", "alfred"],
      quote: "Some bonds are written in blood.",
      intensity: 4,
      content_type: "romantic",
    },
    {
      id: `${characterId}-m3`,
      character_id: characterId,
      episode_id: "s01e05",
      timestamp: "0:30:00",
      milestone_type: "power_awakening",
      description: "Character discovers new abilities",
      importance: 5,
      related_characters: [],
      quote: "I am more than I thought I could be.",
      intensity: 5,
      content_type: "transformation",
    },
    {
      id: `${characterId}-m4`,
      character_id: characterId,
      episode_id: "s01e07",
      timestamp: "0:45:00",
      milestone_type: "character_growth",
      description: "Major character growth",
      importance: 5,
      related_characters: [],
      quote: "This is who I choose to be.",
      intensity: 5,
      content_type: "confrontation",
    },
  ];

  return {
    character_id: characterId,
    milestones,
    arc_summary: `${character.name} undergoes a transformative journey from ${character.species === "vampire" ? "hiding their true nature" : "ignorance of the supernatural"} to embracing their place in a world of darkness and blood.`,
  };
}

// Mock episode presence data
export function getMockEpisodePresence(characterId: string) {
  const character = getCharacterById(characterId);
  if (!character) return null;

  const episodes = [
    { episode_id: "s01e01", intensity: 3, screen_time: 890, moment_count: 12 },
    { episode_id: "s01e02", intensity: 2, screen_time: 740, moment_count: 8 },
    { episode_id: "s01e03", intensity: 4, screen_time: 950, moment_count: 15 },
    { episode_id: "s01e04", intensity: 3, screen_time: 780, moment_count: 10 },
    { episode_id: "s01e05", intensity: 5, screen_time: 1000, moment_count: 18 },
    { episode_id: "s01e06", intensity: 3, screen_time: 830, moment_count: 11 },
    { episode_id: "s01e07", intensity: 5, screen_time: 1030, moment_count: 20 },
  ];

  const totalScreenTime = episodes.reduce((sum, ep) => sum + ep.screen_time, 0);

  return {
    character_id: characterId,
    character_name: character.name,
    total_episodes: episodes.length,
    total_screen_time: totalScreenTime,
    episodes,
  };
}
