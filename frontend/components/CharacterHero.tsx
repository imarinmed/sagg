"use client";

import React from "react";
import { Button, Chip, Avatar } from "@heroui/react";
import {
  Users,
  Film,
  Clock,
  ChevronLeft,
  Heart,
  TrendingUp,
  Sparkles,
  Dna,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CharacterHeroStats {
  episodesAppeared: number;
  relationships: number;
  totalScreenTime: string;
  avgIntensity?: number;
  evolutionMilestones?: number;
}

export interface CharacterHeroProps {
  character: {
    id: string;
    name: string;
    portrayed_by?: string;
    role?: string;
    description?: string;
    family?: string | null;
    species?: "vampire" | "human" | string;
    canonical_traits?: string[];
    adaptation_traits?: string[];
    arc_description?: string;
  };
  portraitUrl?: string;
  stats: CharacterHeroStats;
  actions?: {
    onViewRelationships?: () => void;
    onViewEvolution?: () => void;
    onViewMythos?: () => void;
  };
  className?: string;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
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

function getRoleDisplay(role?: string): string {
  if (!role) return "Character";
  return role.split(" ").slice(0, 3).join(" ");
}

function getSpeciesDisplay(species?: string): { label: string; isVampire: boolean } {
  const isVampire = species?.toLowerCase() === "vampire";
  return {
    label: isVampire ? "Vampire" : species ? species.charAt(0).toUpperCase() + species.slice(1) : "Human",
    isVampire,
  };
}

// ============================================
// SUBCOMPONENTS
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delay?: number;
}

function StatCard({ icon, value, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={statCardVariants}
      className="flex items-center gap-3 px-4 py-3 rounded-xl glass hover-lift cursor-default"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="p-2 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
        {icon}
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
          {value}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

function ActionButton({ icon, label, onClick, variant = "secondary" }: ActionButtonProps) {
  const baseClasses = "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200";
  
  const variantClasses = {
    primary: "bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-primary)]/90",
    secondary: "glass border border-[var(--glass-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)]/10 hover:border-[var(--color-accent-primary)]/30",
    ghost: "text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/5",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CharacterHero({
  character,
  portraitUrl,
  stats,
  actions,
  className = "",
}: CharacterHeroProps) {
  const { label: speciesLabel, isVampire } = getSpeciesDisplay(character.species);
  const initials = getInitials(character.name);
  const roleDisplay = getRoleDisplay(character.role);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`relative w-full min-h-[60vh] overflow-hidden ${className}`}
    >
      {/* ============================================
          BACKGROUND LAYERS
          ============================================ */}
      
      {/* Base gradient background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: portraitUrl
            ? `url(${portraitUrl})`
            : isVampire
            ? `linear-gradient(135deg, var(--midnight-velvet) 0%, #2d1a1a 50%, var(--polar-night) 100%)`
            : `linear-gradient(135deg, var(--polar-night) 0%, #1a2a3a 50%, var(--polar-night) 100%)`,
        }}
      >
        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)]/95 via-[var(--color-bg-primary)]/50 to-[var(--color-bg-primary)]/70" />
        
        {/* Vampire-specific atmospheric accent */}
        {isVampire && (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--blood-crimson)]/10 via-transparent to-[var(--nordic-gold)]/5" />
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent opacity-40" />
      
      {isVampire && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--blood-crimson)] to-transparent opacity-30" />
      )}

      {/* Animated ambient glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-accent-primary)]/10 rounded-full blur-3xl animate-pulse" />
      {isVampire && (
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--blood-crimson)]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      )}

      {/* ============================================
          BACK NAVIGATION
          ============================================ */}
      <motion.div variants={itemVariants} className="absolute top-4 left-4 z-20">
        <Link href="/characters">
          <Button
            variant="ghost"
            className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)]/10"
          >
            <ChevronLeft className="w-4 h-4" />
            All Characters
          </Button>
        </Link>
      </motion.div>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-12 lg:p-16 pt-28 md:pt-32">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Top section: Portrait + Name + Badges */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10 mb-8">
            
            {/* Portrait Avatar */}
            <motion.div variants={itemVariants} className="relative">
              <div
                className={`
                  w-36 h-36 md:w-48 md:h-48 rounded-2xl flex items-center justify-center text-5xl md:text-6xl font-bold 
                  border-4 shadow-2xl overflow-hidden
                  ${isVampire
                    ? "bg-gradient-to-br from-[var(--blood-crimson)] to-purple-900 border-[var(--blood-crimson)]/50"
                    : "bg-gradient-to-br from-blue-600 to-cyan-700 border-blue-500/50"
                  }
                `}
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
                {!portraitUrl && (
                  <span className="text-white drop-shadow-lg">{initials}</span>
                )}
              </div>
              
              {/* Status indicator */}
              <div className={`
                absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-[var(--color-bg-primary)]
                ${isVampire ? "bg-[var(--blood-crimson)]" : "bg-green-500"}
              `} />
            </motion.div>

            {/* Name and badges */}
            <motion.div variants={itemVariants} className="flex-1 space-y-4">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  size="sm"
                  className={`
                    ${isVampire
                      ? "bg-[var(--blood-crimson)]/20 text-[var(--blush-rose)] border-[var(--blood-crimson)]/50"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    }
                    border backdrop-blur-sm
                  `}
                >
                  {speciesLabel}
                </Chip>
                
                {character.role && (
                  <Chip
                    size="sm"
                    className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/30 border backdrop-blur-sm"
                  >
                    {roleDisplay}
                  </Chip>
                )}
                
                {character.family && (
                  <Chip
                    size="sm"
                    className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] border backdrop-blur-sm"
                  >
                    {character.family}
                  </Chip>
                )}
              </div>

              {/* Character name */}
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[var(--color-text-primary)] leading-tight drop-shadow-2xl">
                {character.name}
              </h1>

              {/* Portrayed by */}
              {character.portrayed_by && (
                <p className="text-lg md:text-xl text-[var(--color-text-secondary)]">
                  Portrayed by{" "}
                  <span className="text-[var(--color-accent-primary)] font-medium">
                    {character.portrayed_by}
                  </span>
                </p>
              )}
            </motion.div>
          </div>

          {/* Arc description */}
          {character.arc_description && (
            <motion.div variants={itemVariants} className="mb-8 max-w-3xl">
              <div className="glass rounded-xl p-6 border-l-4 border-[var(--color-accent-primary)]">
                <div className="flex items-center gap-2 mb-2 text-[var(--color-accent-primary)]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Character Arc</span>
                </div>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  {character.arc_description}
                </p>
              </div>
            </motion.div>
          )}

          {/* Description fallback */}
          {!character.arc_description && character.description && (
            <motion.p variants={itemVariants} className="text-lg text-[var(--color-text-secondary)] max-w-3xl mb-8 leading-relaxed">
              {character.description}
            </motion.p>
          )}

          {/* Stats row */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-8">
            <StatCard
              icon={<Film className="w-5 h-5" />}
              value={stats.episodesAppeared}
              label="Episodes"
              delay={0}
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              value={stats.relationships}
              label="Relationships"
              delay={100}
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              value={stats.totalScreenTime}
              label="Screen Time"
              delay={200}
            />
            {stats.avgIntensity !== undefined && (
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                value={stats.avgIntensity.toFixed(1)}
                label="Avg Intensity"
                delay={300}
              />
            )}
            {stats.evolutionMilestones !== undefined && (
              <StatCard
                icon={<Dna className="w-5 h-5" />}
                value={stats.evolutionMilestones}
                label="Milestones"
                delay={400}
              />
            )}
          </motion.div>

          {/* Action buttons */}
          {(actions?.onViewRelationships || actions?.onViewEvolution || actions?.onViewMythos) && (
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
              {actions.onViewRelationships && (
                <ActionButton
                  icon={<Users className="w-4 h-4" />}
                  label="View Relationships"
                  onClick={actions.onViewRelationships}
                  variant="secondary"
                />
              )}
              {actions.onViewEvolution && (
                <ActionButton
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="View Evolution"
                  onClick={actions.onViewEvolution}
                  variant="secondary"
                />
              )}
              {actions.onViewMythos && (
                <ActionButton
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Mythos Connection"
                  onClick={actions.onViewMythos}
                  variant="secondary"
                />
              )}
            </motion.div>
          )}

          {/* Traits preview */}
          {(character.canonical_traits?.length || character.adaptation_traits?.length) && (
            <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex flex-wrap items-center gap-2">
                {character.canonical_traits?.slice(0, 4).map((trait) => (
                  <Chip
                    key={trait}
                    size="sm"
                    variant="soft"
                    className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                  >
                    {trait.replace(/_/g, " ")}
                  </Chip>
                ))}
                {character.adaptation_traits?.slice(0, 3).map((trait) => (
                  <Chip
                    key={trait}
                    size="sm"
                    variant="soft"
                    className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20"
                  >
                    {trait.replace(/_/g, " ")}
                  </Chip>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ============================================
          DECORATIVE ELEMENTS
          ============================================ */}
      
      {/* Corner rings */}
      <div className="absolute top-24 right-8 md:top-28 md:right-12 opacity-20">
        <div
          className={`w-24 h-24 md:w-32 md:h-32 border rounded-full ${
            isVampire ? "border-[var(--blood-crimson)]/40" : "border-[var(--color-accent-primary)]/40"
          }`}
        />
        <div
          className={`absolute top-3 left-3 w-18 h-18 md:w-24 md:h-24 border rounded-full ${
            isVampire ? "border-[var(--nordic-gold)]/30" : "border-blue-500/30"
          }`}
          style={{ width: "4.5rem", height: "4.5rem" }}
        />
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent opacity-60" />
    </motion.div>
  );
}

// ============================================
// SKELETON LOADING STATE
// ============================================

export function CharacterHeroSkeleton() {
  return (
    <div className="relative w-full min-h-[60vh] overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]" />
      
      <div className="relative h-full flex flex-col justify-end p-6 md:p-12 lg:p-16 pt-28">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10 mb-8">
            {/* Skeleton avatar */}
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl bg-[var(--color-surface)] animate-pulse" />
            
            {/* Skeleton text */}
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <div className="w-20 h-6 rounded-full bg-[var(--color-surface)] animate-pulse" />
                <div className="w-24 h-6 rounded-full bg-[var(--color-surface)] animate-pulse" />
              </div>
              <div className="w-64 md:w-96 h-12 md:h-16 rounded-lg bg-[var(--color-surface)] animate-pulse" />
              <div className="w-48 h-6 rounded-lg bg-[var(--color-surface)] animate-pulse" />
            </div>
          </div>
          
          {/* Skeleton stats */}
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-32 h-16 rounded-xl bg-[var(--color-surface)] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterHero;
