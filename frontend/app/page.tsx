"use client"

import Image from "next/image"
import { NavCard } from "@/components/GlassCard"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section with BST Logo and Main Poster */}
      <div className="relative rounded-2xl overflow-hidden min-h-[500px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/posters/poster-main.png"
            alt="Blod, Svett, Tårar"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/60 to-[var(--color-background)]/30" />
        </div>
        
        <div className="relative z-10 py-20 px-8 text-center flex flex-col items-center">
          {/* BST Logo */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
            <Image
              src="/assets/posters/bst-logo.png"
              alt="Blod, Svett, Tårar Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light mb-4">
            Dark Adaptation Knowledge Base
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-2xl mx-auto">
            A comprehensive wiki for the dark, explicit adaptation of the Swedish YA vampire series
          </p>
        </div>
      </div>

      {/* Featured Posters Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden glass">
          <Image
            src="/assets/posters/poster-main.png"
            alt="Blod, Svett, Tårar Main Poster"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden glass">
          <Image
            src="/assets/posters/poster-alt.png"
            alt="Blod, Svett, Tårar Alternative Poster"
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
