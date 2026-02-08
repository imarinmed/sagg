"use client";

import { StaticCharacter } from "@/lib/characterData";

interface CharacterCatalogHeaderProps {
  character: StaticCharacter;
}

export default function CharacterCatalogHeader({ character }: CharacterCatalogHeaderProps) {
  const isFemaleStudent = character.id === "kiara-natt-och-dag" || 
                         character.id === "elise" || 
                         character.id === "chloe";

  return (
    <section id="overview" className="scroll-mt-24">
      <div className="glass-catalog rounded-lg p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[var(--color-accent-primary)] rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[var(--color-accent-primary)] rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[var(--color-accent-primary)] rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[var(--color-accent-primary)] rounded-br-lg" />

        {character.catalog_id && (
          <div className="flex gap-3 mb-6">
            <span className="font-mono text-xs px-3 py-1 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] rounded border border-[var(--color-border-subtle)]">
              BST: {character.catalog_id.bst}
            </span>
            {isFemaleStudent && (
              <span className="font-mono text-xs px-3 py-1 bg-red-900/50 text-red-200 rounded border border-red-700">
                SST: {character.catalog_id.sst}
              </span>
            )}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[var(--color-text-primary)] via-[var(--color-accent-primary)] to-[var(--color-text-primary)] bg-clip-text text-transparent">
            {character.name}
          </h1>
          <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
            <span className="font-mono text-sm">{character.role}</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="capitalize">{character.species}</span>
          </div>
        </div>

        {character.description && (
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed max-w-3xl">
            {character.description}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)]">
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Portrayed by
          </span>
          <p className="text-[var(--color-text-primary)] font-medium">
            {character.portrayed_by}
          </p>
        </div>
      </div>
    </section>
  );
}
