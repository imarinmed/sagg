"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight, Quote, Play, Pause } from "lucide-react";
import Link from "next/link";

interface CharacterQuote {
  text: string;
  episodeId: string;
  timestamp?: string;
  context?: string;
}

interface QuoteCarouselProps {
  quotes: CharacterQuote[];
  characterName: string;
  autoRotate?: boolean;
  autoRotateInterval?: number;
}

export function QuoteCarousel({
  quotes,
  characterName,
  autoRotate = true,
  autoRotateInterval = 6000,
}: QuoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  }, [quotes.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, [quotes.length]);

  // Auto-rotate effect
  useEffect(() => {
    if (!isPlaying || isHovered || quotes.length <= 1) return;

    const interval = setInterval(goToNext, autoRotateInterval);
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, quotes.length, autoRotateInterval, goToNext]);

  if (quotes.length === 0) {
    return null;
  }

  const currentQuote = quotes[currentIndex];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main quote container */}
      <div className="relative px-8 py-6 rounded-xl bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
        {/* Decorative quote marks */}
        <Quote className="absolute top-4 left-4 w-12 h-12 text-[#D4AF37]/20 transform -rotate-12" />
        <Quote className="absolute bottom-4 right-4 w-12 h-12 text-[#D4AF37]/20 transform rotate-180 translate-x-2" />

        {/* Quote content */}
        <div className="relative z-10 min-h-[120px] flex flex-col justify-center">
          <blockquote className="text-lg md:text-xl italic text-[var(--color-text-primary)] leading-relaxed text-center px-8">
            "{currentQuote.text}"
          </blockquote>

          {/* Attribution */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-[var(--color-text-muted)]">
            <span className="font-medium text-[#D4AF37]">— {characterName}</span>
            {currentQuote.episodeId && (
              <>
                <span>•</span>
                <Link
                  href={`/episodes/${currentQuote.episodeId}`}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Episode {currentQuote.episodeId.slice(-2)}
                </Link>
              </>
            )}
            {currentQuote.timestamp && (
              <>
                <span>•</span>
                <span>{currentQuote.timestamp}</span>
              </>
            )}
          </div>

          {/* Context if available */}
          {currentQuote.context && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)] text-center italic">
              {currentQuote.context}
            </p>
          )}
        </div>

        {/* Gold accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      </div>

      {/* Navigation controls */}
      {quotes.length > 1 && (
        <>
          {/* Previous button */}
          <Button
            isIconOnly
            variant="ghost"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm border border-[var(--color-border)] hover:border-[#D4AF37]/50 transition-all opacity-0 group-hover:opacity-100"
            onPress={goToPrevious}
            aria-label="Previous quote"
            style={{ opacity: isHovered ? 1 : 0.3 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Next button */}
          <Button
            isIconOnly
            variant="ghost"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm border border-[var(--color-border)] hover:border-[#D4AF37]/50 transition-all"
            onPress={goToNext}
            aria-label="Next quote"
            style={{ opacity: isHovered ? 1 : 0.3 }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Dots indicator */}
        {quotes.length > 1 && (
          <div className="flex items-center gap-2">
            {quotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-[#D4AF37] w-6"
                    : "bg-[var(--color-border)] hover:bg-[var(--color-border-hover)]"
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Play/Pause button */}
        {quotes.length > 1 && (
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="text-[var(--color-text-muted)] hover:text-[#D4AF37]"
            onPress={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause auto-rotation" : "Play auto-rotation"}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </Button>
        )}

        {/* Counter */}
        <span className="text-xs text-[var(--color-text-muted)]">
          {currentIndex + 1} / {quotes.length}
        </span>
      </div>
    </div>
  );
}

// Extract quotes from evolution/transcript data
export function extractQuotesFromEvolution(
  milestones: Array<{
    episode_id: string;
    timestamp: string;
    description: string;
    quote?: string | null;
  }>
): CharacterQuote[] {
  const quotes: CharacterQuote[] = [];

  for (const milestone of milestones) {
    // If there's an explicit quote, use it
    if (milestone.quote) {
      quotes.push({
        text: milestone.quote,
        episodeId: milestone.episode_id,
        timestamp: milestone.timestamp,
      });
    }
    // Otherwise, check if description contains dialogue
    else if (
      milestone.description.includes("–") ||
      milestone.description.includes('"')
    ) {
      // Extract dialogue from description
      const match = milestone.description.match(/[–"]([^"–]+)[–"]/);
      if (match && match[1] && match[1].length > 10) {
        quotes.push({
          text: match[1].trim(),
          episodeId: milestone.episode_id,
          timestamp: milestone.timestamp,
          context: "From scene dialogue",
        });
      }
    }
  }

  // Remove duplicates and limit
  const uniqueQuotes = quotes.filter(
    (quote, index, self) =>
      index === self.findIndex((q) => q.text === quote.text)
  );

  return uniqueQuotes.slice(0, 10);
}
