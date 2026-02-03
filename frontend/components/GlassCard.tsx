"use client";

import React from "react";
import Link from "next/link";
import { Episode, Character, MythosElement } from "@/lib/api";

// ============================================
// BASE GLASS CARD COMPONENT
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={`
        glass rounded-lg overflow-hidden
        ${hover ? "hover-lift" : ""}
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
}

// ============================================
// CARD SUBCOMPONENTS
// ============================================

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-b border-[var(--glass-border)] ${className || ""}`}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-4 ${className || ""}`}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-t border-[var(--glass-border)] ${className || ""}`}
    >
      {children}
    </div>
  );
}

// ============================================
// EPISODE CARD VARIANT
// ============================================

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Link href={`/episodes/${episode.id}`} className="block h-full">
      <GlassCard className="h-full">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
              Episode {episode.episode_number}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {episode.id.toUpperCase()}
            </span>
          </div>

          <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
            {episode.title}
          </h3>

          {episode.synopsis && (
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
              {episode.synopsis}
            </p>
          )}
        </CardContent>
      </GlassCard>
    </Link>
  );
}

// ============================================
// CHARACTER CARD VARIANT
// ============================================

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link href={`/characters/${character.id}`} className="block h-full">
      <GlassCard className="h-full">
        <CardContent className="space-y-3">
          <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
            {character.name}
          </h3>

          {character.family && (
            <span className="text-xs text-[var(--color-accent-primary)]">
              {character.family}
            </span>
          )}

          {character.canonical_traits && character.canonical_traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {character.canonical_traits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="text-xs px-2 py-1 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </Link>
  );
}

// ============================================
// MYTHOS CARD VARIANT
// ============================================

interface MythosCardProps {
  mythos: MythosElement;
}

export function MythosCard({ mythos }: MythosCardProps) {
  return (
    <Link href={`/mythos/${mythos.id}`} className="block h-full">
      <GlassCard className="h-full">
        <CardContent className="space-y-3">
          <span className="text-xs font-medium tracking-wider text-[var(--color-accent-primary)] uppercase">
            {mythos.category}
          </span>

          <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
            {mythos.name}
          </h3>

          {mythos.description && (
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
              {mythos.description}
            </p>
          )}
        </CardContent>
      </GlassCard>
    </Link>
  );
}

// ============================================
// NAVIGATION CARD VARIANT (for homepage)
// ============================================

interface NavCardProps {
  title: string;
  description: string;
  href: string;
}

export function NavCard({ title, description, href }: NavCardProps) {
  return (
    <Link href={href} className="block h-full">
      <GlassCard className="h-full cursor-pointer">
        <CardHeader>
          <h2 className="font-heading text-lg text-[var(--color-text-primary)]">
            {title}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-text-secondary)]">{description}</p>
        </CardContent>
      </GlassCard>
    </Link>
  );
}

// ============================================
// STATIC CHARACTER CARD (for static data)
// ============================================

interface StaticCharacterCardProps {
  id: string;
  name: string;
  portrayedBy: string;
  species: string;
}

export function StaticCharacterCard({
  id,
  name,
  portrayedBy,
  species,
}: StaticCharacterCardProps) {
  const speciesColors = {
    vampire:
      "bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]/30",
    human:
      "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/30",
  };

  return (
    <Link href={`/characters/${id}`} className="block h-full">
      <GlassCard className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${speciesColors[species as keyof typeof speciesColors] || speciesColors.human}`}
            >
              {species}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
            {name}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Portrayed by {portrayedBy}
          </p>
        </CardContent>
      </GlassCard>
    </Link>
  );
}

// ============================================
// STATIC MYTHOS CARD (for static data)
// ============================================

interface StaticMythosCardProps {
  id: string;
  name: string;
  category: string;
}

const categoryStyles: Record<string, string> = {
  biology:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  supernatural:
    "bg-purple-500/10 text-purple-400 border-purple-500/30",
  society:
    "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export function StaticMythosCard({ id, name, category }: StaticMythosCardProps) {
  const style = categoryStyles[category] || categoryStyles.society;

  return (
    <Link href={`/mythos/${id}`} className="block h-full">
      <GlassCard className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
              {category}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
            {name}
          </h3>
        </CardContent>
      </GlassCard>
    </Link>
  );
}
