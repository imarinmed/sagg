"use client";

import React from "react";
import { Button } from "@heroui/react";
import {
  Users,
  Film,
  Clock,
  ChevronLeft,
  Play,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export interface KiaraCharacterHeroProps {
  stats?: {
    episodesAppeared: number;
    relationships: number;
    totalScreenTime: string;
  };
  className?: string;
}

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
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const galleryVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.6,
    },
  },
};

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] backdrop-blur-sm">
      <div className="text-[var(--nordic-gold)]">{icon}</div>
      <div>
        <div className="text-lg font-bold text-[var(--color-text-primary)] leading-none">{value}</div>
        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

export function KiaraCharacterHero({
  stats = {
    episodesAppeared: 8,
    relationships: 12,
    totalScreenTime: "4h 15m",
  },
  className = "",
}: KiaraCharacterHeroProps) {
  // Placeholder images for the gallery - using the hero image as placeholder since others don't exist yet
  const galleryImages = [
    { src: "/screenshots/characters/kiara/s01e01/kiara-hero.png", alt: "Kiara in S01E01 - Scene 1" },
    { src: "/screenshots/characters/kiara/s01e01/kiara-hero.png", alt: "Kiara in S01E01 - Scene 2" },
    { src: "/screenshots/characters/kiara/s01e01/kiara-hero.png", alt: "Kiara in S01E01 - Scene 3" },
    { src: "/screenshots/characters/kiara/s01e01/kiara-hero.png", alt: "Kiara in S01E01 - Scene 4" },
  ];

  return (
    <div className={`relative w-full flex flex-col ${className}`}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full min-h-[85vh] flex flex-col justify-end overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/screenshots/characters/kiara/s01e01/kiara-hero.png"
            alt="Kiara Hero"
            fill
            className="object-cover object-top"
            priority
            quality={100}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)]/90 via-[var(--color-bg-primary)]/30 to-transparent" />
          <div className="absolute inset-0 bg-[var(--nordic-gold)]/5 mix-blend-overlay" />
        </div>

        <motion.div variants={itemVariants} className="absolute top-6 left-6 z-20">
          <Link href="/characters">
            <Button
              variant="ghost"
              className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)]/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Characters
            </Button>
          </Link>
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
          <div className="max-w-3xl">
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-[var(--nordic-gold)]/30 bg-[var(--nordic-gold)]/10 text-[var(--nordic-gold)] text-xs font-mono uppercase tracking-[0.2em] backdrop-blur-md">
                Female Protagonist
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="font-heading text-7xl md:text-8xl lg:text-9xl font-bold text-[var(--color-text-primary)] leading-none mb-6 tracking-tight drop-shadow-2xl"
            >
              Kiara
            </motion.h1>

            <motion.div variants={itemVariants} className="mb-8 pl-6 border-l-2 border-[var(--nordic-gold)]">
              <p className="font-heading text-2xl md:text-3xl text-[var(--color-text-primary)] italic leading-relaxed opacity-90">
                &ldquo;I don't know what I am anymore.&rdquo;
              </p>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed max-w-2xl"
            >
              The heart of the narrative, caught between two worlds. Her journey of self-discovery unravels the ancient bloodlines that bind the city's fate.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex flex-wrap gap-4">
                <StatItem icon={<Film size={20} />} value={stats.episodesAppeared} label="Episodes" />
                <StatItem icon={<Users size={20} />} value={stats.relationships} label="Connections" />
                <StatItem icon={<Clock size={20} />} value={stats.totalScreenTime} label="Screen Time" />
              </div>
              
              <Button 
                className="bg-[var(--nordic-gold)] text-[var(--color-bg-primary)] font-semibold px-8 py-6 rounded-lg hover:bg-[var(--nordic-gold)]/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Explore Character Arc <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 bg-[var(--color-bg-primary)] pt-12 pb-24 px-6 md:px-12 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-3xl text-[var(--color-text-primary)]">Key Moments: S01E01</h2>
            <Button variant="ghost" className="text-[var(--nordic-gold)] hover:bg-[var(--nordic-gold)]/10">
              View All Gallery <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={galleryVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {galleryImages.map((img, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 rounded-full bg-[var(--nordic-gold)]/90 flex items-center justify-center text-[var(--color-bg-primary)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play fill="currentColor" className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default KiaraCharacterHero;
