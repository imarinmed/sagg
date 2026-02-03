"use client";

import { StaticMythosCard } from "@/components/GlassCard";

const mythosElements = [
  { id: "vampire-physiology", name: "Vampire Physiology", category: "biology" },
  { id: "blood-bond", name: "The Blood Bond", category: "supernatural" },
  { id: "feeding", name: "Feeding", category: "biology" },
  { id: "family-hierarchy", name: "Vampire Family Hierarchy", category: "society" },
  { id: "vampire-human-relations", name: "Vampire-Human Relations", category: "society" },
  { id: "transformation", name: "Vampire Transformation", category: "biology" },
  { id: "daywalking", name: "Daywalking", category: "biology" },
];

export default function MythosPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 text-[var(--color-text-primary)]">Mythos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mythosElements.map((element) => (
          <StaticMythosCard
            key={element.id}
            id={element.id}
            name={element.name}
            category={element.category}
          />
        ))}
      </div>
    </div>
  );
}
