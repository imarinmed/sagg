"use client";

import { Card } from "@heroui/react";

const mythosElements = [
  { id: "vampire-physiology", name: "Vampire Physiology", category: "biology" },
  { id: "blood-bond", name: "The Blood Bond", category: "supernatural" },
  { id: "feeding", name: "Feeding", category: "biology" },
  { id: "family-hierarchy", name: "Vampire Family Hierarchy", category: "society" },
  { id: "vampire-human-relations", name: "Vampire-Human Relations", category: "society" },
  { id: "transformation", name: "Vampire Transformation", category: "biology" },
  { id: "daywalking", name: "Daywalking", category: "biology" },
];

const categoryColors: Record<string, string> = {
  biology: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  supernatural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  society: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export default function MythosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Mythos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mythosElements.map((element) => (
          <Card key={element.id} className="hover:shadow-lg transition-shadow">
            <Card.Header>
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[element.category] || "bg-gray-100 text-gray-800"}`}>
                  {element.category}
                </span>
              </div>
            </Card.Header>
            <Card.Content>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {element.name}
              </h3>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}
