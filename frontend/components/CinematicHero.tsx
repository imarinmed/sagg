"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Play, Calendar, Clock, BarChart2 } from "lucide-react";
import { IntensityIndicator } from "./IntensityIndicator";

interface CinematicHeroProps {
  episode: {
    id: string;
    title: string;
    episode_number: number;
    season: number;
    air_date?: string;
    synopsis?: string;
  };
  heroImage?: string;
  intensity?: number;
  duration?: string;
  onPlay?: () => void;
}

export function CinematicHero({
  episode,
  heroImage,
  intensity = 3,
  duration,
  onPlay,
}: CinematicHeroProps) {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{
          backgroundImage: heroImage
            ? `url(${heroImage})`
            : `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)`,
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/40" />
      </div>

      {/* Gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl space-y-6">
          {/* Episode metadata badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
              Season {episode.season}
            </span>
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/10 text-white/80 border border-white/20 rounded-full">
              Episode {episode.episode_number}
            </span>
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-[#8B0000]/30 text-[#ff6b6b] border border-[#8B0000]/50 rounded-full">
              {episode.id.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-tight drop-shadow-2xl">
            {episode.title}
          </h1>

          {/* Synopsis */}
          {episode.synopsis && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed drop-shadow-lg line-clamp-3">
              {episode.synopsis}
            </p>
          )}

          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
            {episode.air_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{episode.air_date}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              <span>Intensity</span>
              <IntensityIndicator intensity={intensity} size="sm" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              onPress={onPlay}
            >
              <Play className="w-5 h-5" />
              Watch Episode
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
            >
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-8 right-8 md:top-12 md:right-12">
        <div className="w-24 h-24 md:w-32 md:h-32 border border-[#D4AF37]/20 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 border border-[#D4AF37]/30 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <span className="text-[#D4AF37] text-xs md:text-sm font-bold">
                {episode.episode_number}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
