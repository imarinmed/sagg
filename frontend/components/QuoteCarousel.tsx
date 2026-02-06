"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Play,
  Pause,
  User,
  Clock,
  Tag,
  Film,
} from "lucide-react";
import { Button, Chip, Avatar } from "@heroui/react";
import Link from "next/link";
import { GlassCard, CardContent } from "@/components/GlassCard";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Quote {
  id: string;
  text: string;
  character_id: string;
  character_name: string;
  episode_id?: string;
  episode_title?: string;
  context?: string;
  timestamp?: string;
  tags?: string[];
  avatar_url?: string;
}

export type QuoteCarouselVariant = "default" | "minimal" | "featured";

export interface QuoteCarouselProps {
  quotes: Quote[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showDots?: boolean;
  variant?: QuoteCarouselVariant;
  className?: string;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const fadeVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return "";
  // Format: "0:15:30" → "15:30"
  const parts = timestamp.split(":");
  if (parts.length === 3) {
    return `${parts[1]}:${parts[2]}`;
  }
  return timestamp;
}

// ============================================
// QUOTE CARD COMPONENTS
// ============================================

interface QuoteCardProps {
  quote: Quote;
  variant: QuoteCarouselVariant;
}

function DefaultQuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="relative px-8 py-8 md:px-12 md:py-10">
      {/* Decorative quote marks */}
      <Quote className="absolute top-4 left-4 w-10 h-10 md:w-12 md:h-12 text-[var(--color-accent-primary)]/20 transform -rotate-12" />
      <Quote className="absolute bottom-4 right-4 w-10 h-10 md:w-12 md:h-12 text-[var(--color-accent-primary)]/20 transform rotate-180" />

      {/* Quote text */}
      <blockquote className="relative z-10 text-lg md:text-xl lg:text-2xl italic text-[var(--color-text-primary)] leading-relaxed text-center font-heading">
        "{quote.text}"
      </blockquote>

      {/* Attribution */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {quote.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={quote.avatar_url} alt={quote.character_name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--color-accent-primary)]" />
            </div>
          )}
          <div className="text-center">
            <p className="font-medium text-[var(--color-accent-primary)]">{quote.character_name}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              {quote.episode_id && (
                <>
                  <Link
                    href={`/episodes/${quote.episode_id}`}
                    className="hover:text-[var(--color-accent-primary)] transition-colors flex items-center gap-1"
                  >
                    <Film className="w-3 h-3" />
                    {quote.episode_title || quote.episode_id.toUpperCase()}
                  </Link>
                </>
              )}
              {quote.timestamp && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(quote.timestamp)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Context */}
        {quote.context && (
          <p className="text-sm text-[var(--color-text-muted)] italic max-w-lg text-center">
            {quote.context}
          </p>
        )}

        {/* Tags */}
        {quote.tags && quote.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {quote.tags.map((tag) => (
              <Chip key={tag} size="sm" variant="soft" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalQuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="px-6 py-6">
      <blockquote className="text-base md:text-lg italic text-[var(--color-text-primary)] leading-relaxed text-center">
        "{quote.text}"
      </blockquote>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <span className="text-[var(--color-accent-primary)]">— {quote.character_name}</span>
        {quote.episode_id && (
          <>
            <span className="text-[var(--color-text-muted)]">•</span>
            <Link
              href={`/episodes/${quote.episode_id}`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors"
            >
              {quote.episode_id.toUpperCase()}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedQuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="relative px-8 py-10 md:px-16 md:py-12">
      {/* Large decorative quotes */}
      <Quote className="absolute top-2 left-2 w-16 h-16 md:w-24 md:h-24 text-[var(--color-accent-primary)]/10 transform -rotate-12" />
      <Quote className="absolute bottom-2 right-2 w-16 h-16 md:w-24 md:h-24 text-[var(--color-accent-primary)]/10 transform rotate-180" />

      <div className="relative z-10">
        {/* Character avatar and name - top */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {quote.avatar_url ? (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
              <img src={quote.avatar_url} alt={quote.character_name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-white">{getInitials(quote.character_name)}</span>
            </div>
          )}
          <div className="text-left">
            <p className="text-lg md:text-xl font-medium text-[var(--color-accent-primary)]">{quote.character_name}</p>
            {quote.episode_id && (
              <Link
                href={`/episodes/${quote.episode_id}`}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors flex items-center gap-1"
              >
                <Film className="w-4 h-4" />
                {quote.episode_title || quote.episode_id.toUpperCase()}
                {quote.timestamp && (
                  <span className="ml-1">• {formatTimestamp(quote.timestamp)}</span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Featured quote text */}
        <blockquote className="text-xl md:text-2xl lg:text-3xl italic text-[var(--color-text-primary)] leading-relaxed text-center font-heading">
          "{quote.text}"
        </blockquote>

        {/* Context and tags */}
        {(quote.context || (quote.tags && quote.tags.length > 0)) && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {quote.context && (
              <p className="text-sm text-[var(--color-text-muted)] italic max-w-2xl text-center">
                {quote.context}
              </p>
            )}
            {quote.tags && quote.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {quote.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant="soft"
                    className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function QuoteCarousel({
  quotes,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showDots = true,
  variant = "default",
  className = "",
}: QuoteCarouselProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const paginate = useCallback(
    (newDirection: number) => {
      const newIndex = (currentIndex + newDirection + quotes.length) % quotes.length;
      setCurrentIndex([newIndex, newDirection]);
    },
    [currentIndex, quotes.length]
  );

  const goToSlide = useCallback(
    (index: number) => {
      const direction = index > currentIndex ? 1 : -1;
      setCurrentIndex([index, direction]);
    },
    [currentIndex]
  );

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || isHovered || quotes.length <= 1) return;

    const timer = setInterval(() => {
      paginate(1);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, quotes.length, interval, paginate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  if (quotes.length === 0) {
    return null;
  }

  const currentQuote = quotes[currentIndex];
  const variants = variant === "minimal" ? fadeVariants : slideVariants;

  return (
    <div
      ref={containerRef}
      className={`glass rounded-lg overflow-hidden relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main content area */}
      <CardContent className="relative min-h-[200px] md:min-h-[250px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            {variant === "default" && <DefaultQuoteCard quote={currentQuote} variant={variant} />}
            {variant === "minimal" && <MinimalQuoteCard quote={currentQuote} variant={variant} />}
            {variant === "featured" && <FeaturedQuoteCard quote={currentQuote} variant={variant} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {showControls && quotes.length > 1 && (
          <>
            <Button
              isIconOnly
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 glass opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ opacity: isHovered ? 1 : 0.3 }}
              onPress={() => paginate(-1)}
              aria-label="Previous quote"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              isIconOnly
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 glass opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ opacity: isHovered ? 1 : 0.3 }}
              onPress={() => paginate(1)}
              aria-label="Next quote"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </CardContent>

      {/* Bottom controls */}
      {(showDots || quotes.length > 1) && (
        <div className="px-6 pb-6 pt-2 flex items-center justify-center gap-4">
          {/* Dots indicator */}
          {showDots && quotes.length > 1 && (
            <div className="flex items-center gap-2">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-[var(--color-accent-primary)] w-6"
                      : "bg-[var(--color-border)] hover:bg-[var(--color-border-hover)] w-2"
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
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)]"
              onPress={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause auto-rotation" : "Play auto-rotation"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}

          {/* Counter */}
          <span className="text-xs text-[var(--color-text-muted)]">
            {currentIndex + 1} / {quotes.length}
          </span>
        </div>
      )}

      {/* Keyboard hint */}
      <div className="absolute bottom-2 right-2 text-[10px] text-[var(--color-text-muted)] opacity-50">
        Use ← → keys
      </div>
    </div>
  );
}

// ============================================
// EXTRACT QUOTES HELPER
// ============================================

export function extractQuotesFromEvolution(
  milestones: Array<{
    id: string;
    episode_id: string;
    timestamp?: string;
    description: string;
    quote?: string | null;
    related_characters?: string[];
  }>,
  characterName: string,
  characterId: string
): Quote[] {
  const quotes: Quote[] = [];

  for (const milestone of milestones) {
    // If there's an explicit quote, use it
    if (milestone.quote) {
      quotes.push({
        id: `quote-${milestone.id}`,
        text: milestone.quote,
        character_id: characterId,
        character_name: characterName,
        episode_id: milestone.episode_id,
        timestamp: milestone.timestamp,
        context: milestone.description.slice(0, 100),
      });
    }
    // Otherwise, check if description contains dialogue
    else if (milestone.description.includes('"') || milestone.description.includes("–")) {
      const match = milestone.description.match(/[–"]([^"–]{20,200})[–"]/);
      if (match && match[1]) {
        quotes.push({
          id: `dialogue-${milestone.id}`,
          text: match[1].trim(),
          character_id: characterId,
          character_name: characterName,
          episode_id: milestone.episode_id,
          timestamp: milestone.timestamp,
          context: "From scene dialogue",
          tags: ["dialogue"],
        });
      }
    }
  }

  // Remove duplicates
  const uniqueQuotes = quotes.filter(
    (quote, index, self) => index === self.findIndex((q) => q.text === quote.text)
  );

  return uniqueQuotes.slice(0, 10);
}

export default QuoteCarousel;
