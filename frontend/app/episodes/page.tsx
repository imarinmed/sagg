"use client";

import { Card } from "@heroui/react";
import Link from "next/link";

const episodes = [
  { id: "s01e01", title: "Kallblodig skolstart", titleEn: "Cold-blooded School Start", number: 1 },
  { id: "s01e02", title: "Audition till Batgirls", titleEn: "Audition for the Batgirls", number: 2 },
  { id: "s01e03", title: "Lunch hos Natt och Dag", titleEn: "Lunch at Natt och Dag's", number: 3 },
  { id: "s01e04", title: "En oväntad fest", titleEn: "An Unexpected Party", number: 4 },
  { id: "s01e05", title: "Nödvamp och nördar", titleEn: "Vampires in Distress and Nerds", number: 5 },
  { id: "s01e06", title: "Blåljus och blod", titleEn: "Blue Lights and Blood", number: 6 },
  { id: "s01e07", title: "Försonas i en kyss", titleEn: "Reconciled in a Kiss", number: 7 },
];

export default function EpisodesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Episodes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map((episode) => (
          <Link key={episode.id} href={`/episodes/${episode.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Header>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Episode {episode.number}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {episode.id}
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {episode.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {episode.titleEn}
                </p>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
