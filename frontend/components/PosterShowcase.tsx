"use client"

import { useState, useRef, MouseEvent } from "react"

interface Poster {
  id: string
  src: string
  alt: string
  title: string
  subtitle?: string
}

interface PosterCardProps {
  poster: Poster
  index: number
}

function PosterCard({ poster, index }: PosterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate rotation (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -15
    const rotateY = ((x - centerX) / centerX) * 15

    setTransform({ rotateX, rotateY, scale: 1.05 })

    // Calculate shine position
    const shineX = (x / rect.width) * 100
    const shineY = (y / rect.height) * 100
    setShine({ x: shineX, y: shineY, opacity: 0.4 })
  }

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
    setShine({ x: 50, y: 50, opacity: 0 })
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      className="relative group cursor-pointer"
      style={{
        perspective: "1000px",
        animationDelay: `${index * 150}ms`,
      }}
    >
      <div
        ref={cardRef}
        className="relative transition-all duration-300 ease-out animate-fade-in-up"
        style={{
          transform: `
            rotateX(${transform.rotateX}deg)
            rotateY(${transform.rotateY}deg)
            scale(${transform.scale})
            translateZ(${isHovered ? "50px" : "0px"})
          `,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Poster Frame */}
        <div className="relative overflow-hidden rounded-lg shadow-2xl">
          {/* Main Poster Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={poster.src}
              alt={poster.alt}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            />

            {/* Gloss/Shine Overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `
                  radial-gradient(
                    circle at ${shine.x}% ${shine.y}%,
                    rgba(255, 255, 255, ${shine.opacity}) 0%,
                    rgba(255, 255, 255, 0) 50%
                  )
                `,
                mixBlendMode: "overlay",
              }}
            />

            {/* Edge Reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    105deg,
                    transparent 40%,
                    rgba(255, 255, 255, 0.1) 45%,
                    rgba(255, 255, 255, 0.2) 50%,
                    rgba(255, 255, 255, 0.1) 55%,
                    transparent 60%
                  )
                `,
                transform: `translateX(${isHovered ? "100%" : "-100%"})`,
                transition: "transform 0.6s ease-out",
              }}
            />

            {/* Vignette Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(
                    ellipse at center,
                    transparent 0%,
                    rgba(0, 0, 0, 0.4) 100%
                  )
                `,
              }}
            />
          </div>

          {/* Poster Border/Glow */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-300"
            style={{
              boxShadow: isHovered
                ? `
                  0 0 0 1px rgba(212, 175, 55, 0.5),
                  0 0 30px rgba(212, 175, 55, 0.3),
                  0 25px 50px rgba(0, 0, 0, 0.5),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                `
                : `
                  0 0 0 1px rgba(212, 175, 55, 0.2),
                  0 10px 30px rgba(0, 0, 0, 0.4),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.05)
                `,
            }}
          />
        </div>

        {/* Title Below Poster */}
        <div
          className="mt-4 text-center transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            opacity: isHovered ? 1 : 0.8,
          }}
        >
          <h3 className="font-heading text-lg text-[var(--color-text-primary)] tracking-wide">
            {poster.title}
          </h3>
          {poster.subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {poster.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Drop Shadow */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 rounded-[100%] transition-all duration-300 blur-xl"
        style={{
          background: isHovered
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(0, 0, 0, 0.3)",
          transform: `
            translateX(-50%)
            scale(${isHovered ? 1.1 : 1})
            translateY(${isHovered ? "10px" : "0"})
          `,
        }}
      />
    </div>
  )
}

export function PosterShowcase() {
  const posters: Poster[] = [
    {
      id: "main",
      src: "/assets/posters/poster-main.png",
      alt: "Blod, Svett, Tårar - Main Poster",
      title: "Blod, Svett, Tårar",
      subtitle: "Original Series",
    },
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
    <div className="relative py-16 px-4">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-text-primary)] mb-4 tracking-wider">
          Enter the World
        </h2>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
          Explore the dark, sensual universe of Blod, Svett, Tårar
        </p>
      </div>

      {/* Posters Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center justify-items-center">
          {posters.map((poster, index) => (
            <PosterCard key={poster.id} poster={poster} index={index} />
          ))}
        </div>
      </div>

      {/* Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(
              ellipse at 50% 50%,
              rgba(139, 0, 0, 0.15) 0%,
              transparent 70%
            )
          `,
        }}
      />
    </div>
  )
}
