"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Users, Film, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface CharacterHeroProps {
  character: {
    id: string;
    name: string;
    portrayed_by?: string;
    role?: string;
    description?: string;
  };
  portraitUrl?: string;
  stats: {
    episodesAppeared: number;
    relationships: number;
    totalScreenTime: string;
  };
  isVampire?: boolean;
}

export function CharacterHero({
  character,
  portraitUrl,
  stats,
  isVampire = false,
}: CharacterHeroProps) {
  // Generate initials for fallback
  const initials = character.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative w-full min-h-[50vh] overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: portraitUrl
            ? `url(${portraitUrl})`
            : isVampire
            ? `linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 50%, #0a0a0f 100%)`
            : `linear-gradient(135deg, #0a0a1a 0%, #1a2a3a 50%, #0a0a0f 100%)`,
        }}
      >
        {/* Dramatic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-[#0a0a0f]/60" />
        
        {/* Vampire-specific accent */}
        {isVampire && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/10 via-transparent to-[#D4AF37]/5" />
        )}
      </div>

      {/* Blood drip accent for vampires */}
      {isVampire && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B0000] to-transparent opacity-60" />
      )}

      {/* Gold accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

      {/* Back navigation */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/characters">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            All Characters
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16 pt-24">
        <div className="max-w-4xl space-y-6">
          {/* Character type badge */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full border ${
                isVampire
                  ? "bg-[#8B0000]/30 text-[#ff6b6b] border-[#8B0000]/50"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }`}
            >
              {isVampire ? "Vampire" : "Human"}
            </span>
            {character.role && (
              <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/10 text-white/80 border border-white/20 rounded-full">
                {character.role.split(" ").slice(0, 3).join(" ")}
              </span>
            )}
          </div>

          {/* Name and portrait */}
          <div className="flex items-end gap-8">
            {/* Portrait circle */}
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold border-4 shadow-2xl ${
                isVampire
                  ? "bg-gradient-to-br from-[#8B0000] to-purple-900 border-[#8B0000]/50 text-white"
                  : "bg-gradient-to-br from-blue-600 to-cyan-700 border-blue-500/50 text-white"
              }`}
              style={
                portraitUrl
                  ? {
                      backgroundImage: `url(${portraitUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              {!portraitUrl && initials}
            </div>

            <div className="flex-1">
              {/* Name */}
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-tight drop-shadow-2xl">
                {character.name}
              </h1>

              {/* Portrayed by */}
              {character.portrayed_by && (
                <p className="text-lg md:text-xl text-white/60 mt-2">
                  Portrayed by{" "}
                  <span className="text-[#D4AF37]">{character.portrayed_by}</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {character.description && (
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed line-clamp-2">
              {character.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <Film className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.episodesAppeared}
                </p>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Episodes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.relationships}
                </p>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Relationships
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalScreenTime}
                </p>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Screen Time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner element */}
      <div className="absolute top-20 right-8 md:top-24 md:right-12 opacity-30">
        <div
          className={`w-20 h-20 md:w-24 md:h-24 border rounded-full ${
            isVampire ? "border-[#8B0000]/40" : "border-blue-500/40"
          }`}
        />
        <div
          className={`absolute top-2 left-2 w-16 h-16 md:w-20 md:h-20 border rounded-full ${
            isVampire ? "border-[#D4AF37]/30" : "border-cyan-500/30"
          }`}
        />
      </div>
    </div>
  );
}
