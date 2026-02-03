"use client"

import Image from "next/image"
import { NavCard } from "@/components/GlassCard"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section with Poster */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/posters/poster-3.jpg"
            alt="Blod, Svett, Tårar"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 py-16 px-8 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4 tracking-wide">
            Blod, Svett, Tårar
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light">
            Dark Adaptation Knowledge Base
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-4 max-w-2xl mx-auto">
            A comprehensive wiki for the dark, explicit adaptation of the Swedish YA vampire series
          </p>
        </div>
      </div>

      {/* Featured Posters Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden glass">
          <Image
            src="/assets/posters/poster-1.jpg"
            alt="Official Poster 1"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden glass">
          <Image
            src="/assets/posters/poster-2.jpg"
            alt="Official Poster 2"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden glass">
          <Image
            src="/assets/posters/poster-3.jpg"
            alt="Official Poster 3"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NavCard
          title="Episodes"
          description="Browse all 7 episodes with scene breakdowns and character appearances"
          href="/episodes"
        />

        <NavCard
          title="Characters"
          description="Character profiles with canonical and adaptation tracking"
          href="/characters"
        />

        <NavCard
          title="Mythos"
          description="Vampire lore, blood bonds, and world-building elements"
          href="/mythos"
        />

        <NavCard
          title="Graph"
          description="Visual relationship graph connecting all entities"
          href="/graph"
        />
      </div>

      {/* Behind the Scenes */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="relative h-64 w-full">
          <Image
            src="/assets/posters/behind-scenes.jpg"
            alt="Behind the Scenes"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/90 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <h2 className="font-heading text-2xl text-[var(--color-text-primary)] mb-2">
                Behind the Scenes
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Production photos and exclusive content from the series
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="glass rounded-lg p-6">
        <h2 className="font-heading text-xl text-[var(--color-text-primary)] mb-4">
          Project Status
        </h2>
        <ul className="space-y-2 text-[var(--color-text-secondary)]">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 7 episodes parsed and indexed
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 10 character profiles created
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 7 mythos elements cataloged
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Interactive graph visualization
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Full-text search across all content
          </li>
        </ul>
      </div>
    </div>
  )
}
