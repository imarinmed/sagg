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
  stamina: number;
  flexibility: number;
  pain_tolerance: number;
  recovery_rate: number;
}

export interface Vitals {
  blood_type: string;
  heart_rate_resting: number;
  body_temperature: string;
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
  kink_profile?: {
    preferences: string[];
    limits: string[];
    evolution: string[];
  };
}

const staticCharacters: StaticCharacter[] = [
  {
    id: "kiara-natt-och-dag",
    name: "Kiara Natt och Dag",
    portrayed_by: "Filippa Kavalic",
    species: "vampire",
    role: "Female Protagonist",
    description: "A 16-year-old vampire struggling with her identity",
    canonical_traits: ["curious", "rebellious", "protective", "conflicted"],
    adaptation_traits: ["sexually_awakening", "rebellious", "curious", "hungry"],
    adaptation_notes: "Kiara is the central protagonist of the series. In the dark adaptation (SST), her sexual awakening parallels her vampire awakening.",
    catalog_id: {
      bst: "BST-001-KND",
      sst: "SST-001-KND"
    },
    physical_profile: {
      height: "168 cm",
      measurements: { bust: "86 cm", waist: "61 cm", hips: "89 cm" },
      build: "slender",
      distinguishing_features: ["pale_skin", "sharp_canines", "cold_to_touch"]
    },
    performance_metrics: {
      stamina: 7, flexibility: 8, pain_tolerance: 6, recovery_rate: 9
    },
    vitals: {
      blood_type: "O-", heart_rate_resting: 45, body_temperature: "28°C"
    },
    kink_profile: {
      preferences: ["blood_bond", "predator_prey", "brat", "age_gap"],
      limits: ["degradation", "abandonment"],
      evolution: ["episode_1", "episode_3", "episode_7"]
    }
  },
  {
    id: "elise",
    name: "Elise",
    portrayed_by: "Elsa Östlind",
    species: "human",
    role: "Antagonist",
    description: "Popular queen bee, manipulative and dominant",
    canonical_traits: ["popular", "manipulative", "dominant", "controlling"],
    adaptation_traits: ["sexually_aggressive", "dominant", "alpha", "strategic"],
    adaptation_notes: "Top of her class. Bottom of the hierarchy. Elise maintains a facade of control while secretly being controlled by her desires.",
    catalog_id: {
      bst: "BST-002-EL",
      sst: "SST-002-EL"
    },
    physical_profile: {
      height: "171 cm",
      measurements: { bust: "85 cm", waist: "62 cm", hips: "88 cm" },
      build: "athletic",
      distinguishing_features: ["blonde_hair", "confident_posture", "commanding_presence"]
    },
    performance_metrics: {
      stamina: 8, flexibility: 4, pain_tolerance: 7, recovery_rate: 8
    },
    vitals: {
      blood_type: "A+", heart_rate_resting: 72, body_temperature: "37.0°C"
    },
    kink_profile: {
      preferences: ["dominance", "group", "voyeurism", "control"],
      limits: ["submission", "humiliation"],
      evolution: ["episode_1", "episode_4", "episode_6"]
    }
  },
  {
    id: "chloe",
    name: "Chloe",
    portrayed_by: "Laura Maik",
    species: "human",
    role: "Supporting",
    description: "Loyal friend, secretly attracted to Kiara",
    canonical_traits: ["loyal", "supportive", "observant", "conflicted"],
    adaptation_traits: ["voyeur", "submissive", "secretly_attracted", "conflicted"],
    adaptation_notes: "Watching from the shadows she helped create. Chloe's unrequited feelings create a complex dynamic of desire and friendship.",
    catalog_id: {
      bst: "BST-003-CM",
      sst: "SST-003-CM"
    },
    physical_profile: {
      height: "162 cm",
      measurements: { bust: "84 cm", waist: "64 cm", hips: "88 cm" },
      build: "slender",
      distinguishing_features: ["dark_hair", "pale_complexion", "expressive_eyes"]
    },
    performance_metrics: {
      stamina: 5, flexibility: 8, pain_tolerance: 4, recovery_rate: 7
    },
    vitals: {
      blood_type: "B+", heart_rate_resting: 68, body_temperature: "37.0°C"
    },
    kink_profile: {
      preferences: ["voyeurism", "observation", "submission"],
      limits: ["exposure", "humiliation"],
      evolution: ["episode_2", "episode_5"]
    }
  }
];

export function getCharacterById(id: string): StaticCharacter | undefined {
  return staticCharacters.find((char) => char.id === id);
}

export function getAllCharacters(): StaticCharacter[] {
  return staticCharacters;
}
