"use client";

import { StaticCharacter } from "@/lib/characterData";

interface CharacterGalleryProps {
  character: StaticCharacter;
}

const mockGalleryImages = [
  {
    id: "1",
    url: "/images/characters/kiara-hero.jpg",
    alt: "Kiara portrait",
    caption: "Student ID Photo",
    type: "portrait",
  },
  {
    id: "2",
    url: "/images/characters/kiara-action.jpg",
    alt: "Kiara in action",
    caption: "Physical Assessment",
    type: "action",
  },
  {
    id: "3",
    url: "/images/characters/kiara-formal.jpg",
    alt: "Kiara formal",
    caption: "Formal Attire",
    type: "formal",
  },
];

export default function CharacterGallery({ character }: CharacterGalleryProps) {
  const images = mockGalleryImages;

  return (
    <div className="space-y-6">
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden glass group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
        
        <div className="w-full h-full bg-gradient-to-br from-[var(--color-surface-secondary)] to-[var(--color-bg-secondary)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[var(--color-accent-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm">{character.name}</p>
            <p className="text-[var(--color-text-muted)] text-xs mt-1">Hero portrait placeholder</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <span className="text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            Primary Subject
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">{character.name}</h3>
        </div>

        <div className="absolute inset-0 scanline-overlay z-30 pointer-events-none opacity-30" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="aspect-square rounded-lg overflow-hidden glass group cursor-pointer hover:ring-2 hover:ring-[var(--color-accent-primary)] transition-all"
          >
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-surface-secondary)] to-[var(--color-bg-secondary)] flex items-center justify-center relative">
              <svg
                className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white">{image.caption}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-4 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--color-text-muted)]">
            Archive ID: {character.catalog_id?.bst || "N/A"}
          </span>
          <span className="text-[var(--color-text-muted)]">
            {images.length} images catalogued
          </span>
        </div>
      </div>
    </div>
  );
}
