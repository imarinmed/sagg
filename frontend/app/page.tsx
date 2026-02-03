"use client"

import { NavCard } from "@/components/GlassCard"
import { PosterShowcase } from "@/components/PosterShowcase"

export default function Home() {
  return (
    <div className="space-y-0">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          {/* Base Texture */}
          <img
            src="/assets/backgrounds/background.texture.png"
            alt=""
            className="w-full h-full object-cover"
          />

          {/* Animated Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  ellipse at 30% 50%,
                  rgba(139, 0, 0, 0.3) 0%,
                  transparent 50%
                ),
                radial-gradient(
                  ellipse at 70% 50%,
                  rgba(212, 175, 55, 0.1) 0%,
                  transparent 50%
                ),
                linear-gradient(
                  to bottom,
                  rgba(8, 8, 8, 0.3) 0%,
                  rgba(8, 8, 8, 0.7) 50%,
                  rgba(8, 8, 8, 0.95) 100%
                )
              `,
            }}
          />

          {/* Floating Particles Effect (CSS-based) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[var(--color-accent-primary)] rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Logo with Glow */}
          <div className="relative mb-8 inline-block">
            <div
              className="absolute inset-0 blur-3xl opacity-30"
              style={{
                background:
                  "radial-gradient(circle, rgba(212, 175, 55, 0.5) 0%, transparent 70%)",
              }}
            />
            <img
              src="/assets/posters/bst-logo.png"
              alt="Blod, Svett, Tårar"
              className="relative w-64 md:w-96 h-auto drop-shadow-2xl mx-auto"
              style={{
                filter: "drop-shadow(0 0 30px rgba(212, 175, 55, 0.3))",
              }}
            />
          </div>

          {/* Tagline */}
          <div className="space-y-6">
            <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light tracking-widest uppercase">
              Dark Adaptation Knowledge Base
            </p>

            <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
              A comprehensive wiki for the dark, explicit adaptation of the
              Swedish YA vampire series. Explore the seductive, dangerous world
              of Skaraborg.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href="/episodes"
                className="group relative px-8 py-4 overflow-hidden rounded-lg font-heading text-lg tracking-wider transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139, 0, 0, 0.8) 0%, rgba(74, 4, 4, 0.9) 100%)",
                  border: "1px solid rgba(139, 0, 0, 0.5)",
                  boxShadow: "0 0 20px rgba(139, 0, 0, 0.3)",
                }}
              >
                <span className="relative z-10 text-[var(--color-text-primary)]">
                  Explore Episodes
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139, 0, 0, 1) 0%, rgba(100, 0, 0, 1) 100%)",
                  }}
                />
              </a>

              <a
                href="/characters"
                className="group relative px-8 py-4 overflow-hidden rounded-lg font-heading text-lg tracking-wider transition-all duration-300"
                style={{
                  background: "rgba(20, 20, 20, 0.6)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span className="relative z-10 text-[var(--color-accent-primary)]">
                  Meet the Characters
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "rgba(212, 175, 55, 0.1)",
                  }}
                />
              </a>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-[var(--color-accent-primary)] opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Poster Showcase Section */}
      <section className="relative py-24">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(8, 8, 8, 0.95) 0%,
                rgba(20, 20, 20, 1) 50%,
                rgba(8, 8, 8, 0.95) 100%
              )
            `,
          }}
        />

        <PosterShowcase />
      </section>

      {/* Navigation Cards Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-text-primary)] mb-4">
              Explore the Universe
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Navigate through the dark world of Blod, Svett, Tårar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </section>

      {/* Project Status Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="font-heading text-2xl md:text-3xl text-[var(--color-text-primary)] mb-8 text-center">
              Project Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Episodes parsed and indexed", count: 7 },
                { label: "Character profiles created", count: 10 },
                { label: "Mythos elements cataloged", count: 7 },
                { label: "Interactive visualizations", count: 1 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{
                    background: "rgba(212, 175, 55, 0.05)",
                    border: "1px solid rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <span className="text-2xl font-heading text-[var(--color-accent-primary)]">
                    {item.count}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
