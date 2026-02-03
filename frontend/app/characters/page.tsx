"use client";

import { Card } from "@heroui/react";
import Link from "next/link";

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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Characters</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Link key={character.id} href={`/characters/${character.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Header>
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    character.species === "vampire" 
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}>
                    {character.species}
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {character.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Portrayed by {character.portrayedBy}
                </p>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
