"use client";

import { StaticCharacterCard } from "@/components/GlassCard";

const characters = [
  { id: "kiara", name: "Kiara Natt och Dag", portrayedBy: "Filippa Kavalic", species: "vampire" },
  { id: "alfred", name: "Alfred", portrayedBy: "Aaron Holgersson", species: "human" },
  { id: "elise", name: "Elise", portrayedBy: "Elsa Östlind", species: "human" },
  { id: "chloe", name: "Chloe", portrayedBy: "Laura Maik", species: "human" },
  { id: "henry", name: "Henry Natt och Dag", portrayedBy: "Olle Sarri", species: "vampire" },
  { id: "jacques", name: "Jacques Natt och Dag", portrayedBy: "Åke Bremer Wold", species: "vampire" },
  { id: "desiree", name: "Desirée Natt och Dag", portrayedBy: "Katarina Macli", species: "vampire" },
  { id: "eric", name: "Eric", portrayedBy: "Pontus Bennemyr", species: "human" },
];

export default function CharactersPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 text-[var(--color-text-primary)]">Characters</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <StaticCharacterCard
            key={character.id}
            id={character.id}
            name={character.name}
            portrayedBy={character.portrayedBy}
            species={character.species}
          />
        ))}
      </div>
    </div>
  );
}
