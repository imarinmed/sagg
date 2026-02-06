"use client";

import { motion } from "framer-motion";
import { CharactersPhoneView } from "./CharactersPhoneView";

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


export default function CharactersPage() {
  const currentEpisode = "s01e01";

  return (
    <div className="-mt-24 h-[100svh] overflow-hidden pt-24 sm:-mt-28 sm:pt-28">
      <div className="h-full px-6 pt-2 pb-0 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="h-full w-full"
        >
          <CharactersPhoneView
            characters={charactersData}
            currentEpisode={currentEpisode}
            onCharacterSelect={() => {}}
          />
        </motion.div>
      </div>
    </div>
  );
}
