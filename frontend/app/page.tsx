"use client"

import { useState, useRef, MouseEvent, PointerEvent } from "react"
import { NavCard } from "@/components/GlassCard"

interface Poster {
  id: string
  src: string
  alt: string
  title: string
  subtitle?: string
}

interface PosterCardProps {
  poster: Poster
  isMain?: boolean
}

function PosterCard({ poster, isMain = false }: PosterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [debugHit, setDebugHit] = useState({ active: false, x: 0, y: 0 })

  const handlePointerMove = (
    e: PointerEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>
  ) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -16
    const rotateY = ((x - centerX) / centerX) * 16

    setTransform({ rotateX, rotateY, scale: isMain ? 1.08 : 1.05 })
    setIsHovered(true)
    setDebugHit({ active: true, x: Math.round(x), y: Math.round(y) })

    const shineX = (x / rect.width) * 100
    const shineY = (y / rect.height) * 100
    setShine({ x: shineX, y: shineY, opacity: 0.55 })
  }

  const handlePointerLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
    setShine({ x: 50, y: 50, opacity: 0 })
    setIsHovered(false)
    setDebugHit({ active: false, x: 0, y: 0 })
  }

  const handlePointerEnter = () => {
    setIsHovered(true)
  }

  return (
      <div
        ref={cardRef}
        className="relative group cursor-pointer z-10 pointer-events-auto"
        style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
        onPointerMoveCapture={handlePointerMove}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={handlePointerEnter}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onMouseEnter={handlePointerEnter}
      >
        {debugHit.active && (
          <div className="absolute -top-6 left-0 z-20 px-2 py-1 text-[10px] rounded bg-[rgba(0,0,0,0.7)] text-white pointer-events-none">
            hover {debugHit.x},{debugHit.y}
          </div>
        )}
      {/* Cast Shadow on Background */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-12 rounded-[100%] transition-all duration-300 pointer-events-none"
        style={{
          background: isHovered
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(0, 0, 0, 0.35)",
          filter: "blur(20px)",
          transform: `
            translateX(-50%)
            scaleX(${isHovered ? 1.1 : 1})
            scaleY(${isHovered ? 1.3 : 1})
          `,
          transformOrigin: "center bottom",
        }}
      />

      <div
        className="relative transition-all duration-300 ease-out"
        style={{
          transform: `
            rotateX(${transform.rotateX}deg)
            rotateY(${transform.rotateY}deg)
            scale(${transform.scale})
            translateZ(${isHovered ? "90px" : "0px"})
          `,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
          <div className="relative overflow-hidden rounded-lg shadow-2xl">
            <div
              className={`relative overflow-hidden ${isMain ? "aspect-[2/3]" : "aspect-[2/3]"}`}
              style={{ transformStyle: "preserve-3d" }}
              onPointerMove={handlePointerMove}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              onMouseMove={handlePointerMove}
              onMouseEnter={handlePointerEnter}
              onMouseLeave={handlePointerLeave}
            >
              <img
                src={poster.src}
                alt={poster.alt}
                className="w-full h-full object-cover"
                style={{
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  transition: "transform 300ms ease",
                  backfaceVisibility: "hidden",
                }}
              />

            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `
                  radial-gradient(
                    circle at ${shine.x}% ${shine.y}%,
                    rgba(255, 255, 255, ${shine.opacity}) 0%,
                    rgba(255, 255, 255, 0) 65%
                  )
                `,
                mixBlendMode: "soft-light",
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    105deg,
                    transparent 40%,
                    rgba(255, 255, 255, 0.08) 45%,
                    rgba(255, 255, 255, 0.12) 50%,
                    rgba(255, 255, 255, 0.08) 55%,
                    transparent 60%
                  )
                `,
                transform: `translateX(${isHovered ? "100%" : "-100%"})`,
                transition: "transform 1.2s ease-out",
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(
                    ellipse at center,
                    rgba(0, 0, 0, 0.15) 0%,
                    rgba(0, 0, 0, 0.6) 100%
                  )
                `,
              }}
            />
          </div>

          <div
            className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-300"
            style={{
              boxShadow: isHovered
                ? `
                  0 0 0 2px rgba(212, 175, 55, 0.6),
                  0 0 40px rgba(212, 175, 55, 0.4),
                  0 30px 60px rgba(0, 0, 0, 0.6),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.15)
                `
                : `
                  0 0 0 1px rgba(212, 175, 55, 0.3),
                  0 15px 40px rgba(0, 0, 0, 0.5),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.08)
                `,
            }}
          />
        </div>

        <div
          className="mt-4 text-center transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            opacity: isHovered ? 1 : 0.9,
          }}
        >
          <h3 className={`font-heading text-[var(--color-text-primary)] tracking-wide ${isMain ? "text-2xl" : "text-lg"}`}>
            {poster.title}
          </h3>
          {poster.subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {poster.subtitle}
            </p>
          )}
        </div>
      </div>

      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-8 rounded-[100%] transition-all duration-300 blur-xl"
        style={{
          background: isHovered
            ? "rgba(0, 0, 0, 0.7)"
            : "rgba(0, 0, 0, 0.4)",
          transform: `
            translateX(-50%)
            scale(${isHovered ? 1.15 : 1})
            translateY(${isHovered ? "15px" : "0"})
          `,
        }}
      />
    </div>
  )
}

export default function Home() {

  const mainPoster: Poster = {
    id: "main",
    src: "/assets/posters/poster-main.png",
    alt: "Blod, Svett, Tårar - Main Poster",
    title: "Blod, Svett, Tårar",
    subtitle: "Original Series",
  }

  const secondaryPosters: Poster[] = [
    {
      id: "skaraborg",
      src: "/assets/posters/skaraborgbats.poster.png",
      alt: "Skaraborg Bats Cheerleaders",
      title: "Skaraborg Bats",
      subtitle: "The Cheerleaders",
    },
    {
      id: "alt",
      src: "/assets/posters/poster-alt.png",
      alt: "Blod, Svett, Tårar - Alternative Poster",
      title: "The Coven",
      subtitle: "Alternative Art",
    },
  ]

  return (
    <div className="w-full pt-24">
      {/* Full-Width Poster Showcase */}
      <section className="relative min-h-[calc(100vh-6rem)] w-full flex items-center pointer-events-auto">
        {/* Content Container */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div
                className="absolute inset-0 blur-3xl opacity-40"
                style={{
                  background:
                    "radial-gradient(circle, rgba(212, 175, 55, 0.6) 0%, transparent 70%)",
                }}
              />
              <img
                src="/assets/posters/bst-logo.png"
                alt="Blod, Svett, Tårar"
                className="relative w-48 md:w-64 h-auto drop-shadow-2xl mx-auto"
                style={{
                  filter: "drop-shadow(0 0 40px rgba(212, 175, 55, 0.4))",
                }}
              />
            </div>
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] font-light tracking-widest uppercase">
              Dark Adaptation Knowledge Base
            </p>
          </div>

          {/* Posters Layout - Main + Secondary */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16">
            {/* Secondary Poster 1 */}
            <div className="w-full max-w-[280px] lg:max-w-[320px] xl:max-w-[360px]">
              <PosterCard poster={secondaryPosters[0]} />
            </div>

            {/* Main Poster - Larger */}
            <div className="w-full max-w-[380px] lg:max-w-[480px] xl:max-w-[520px]">
              <PosterCard poster={mainPoster} isMain={true} />
            </div>

            {/* Secondary Poster 2 */}
            <div className="w-full max-w-[280px] lg:max-w-[320px] xl:max-w-[360px]">
              <PosterCard poster={secondaryPosters[1]} />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
            <a
              href="/episodes"
              className="group relative px-8 py-4 overflow-hidden rounded-lg font-heading text-lg tracking-wider transition-all duration-300 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139, 0, 0, 0.9) 0%, rgba(74, 4, 4, 0.95) 100%)",
                border: "1px solid rgba(139, 0, 0, 0.6)",
                boxShadow: "0 0 30px rgba(139, 0, 0, 0.4)",
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
              className="group relative px-8 py-4 overflow-hidden rounded-lg font-heading text-lg tracking-wider transition-all duration-300 text-center"
              style={{
                background: "rgba(20, 20, 20, 0.7)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="relative z-10 text-[var(--color-accent-primary)]">
                Meet the Characters
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "rgba(212, 175, 55, 0.15)",
                }}
              />
            </a>
          </div>
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(8, 8, 8, 1) 0%,
                rgba(15, 15, 15, 1) 100%
              )
            `,
          }}
        />

        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-text-primary)] mb-4">
            Explore the Universe
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Navigate through the dark world of Blod, Svett, Tårar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
      </section>

      {/* Project Status Section */}
      <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="font-heading text-2xl md:text-3xl text-[var(--color-text-primary)] mb-8 text-center">
              Project Status
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Episodes", count: 7 },
                { label: "Characters", count: 10 },
                { label: "Mythos Elements", count: 7 },
                { label: "Visualizations", count: 1 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center p-4 rounded-lg text-center"
                  style={{
                    background: "rgba(212, 175, 55, 0.05)",
                    border: "1px solid rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <span className="text-3xl font-heading text-[var(--color-accent-primary)] mb-1">
                    {item.count}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
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
