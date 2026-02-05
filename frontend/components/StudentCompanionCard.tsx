'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Unlock, User, ChevronRight } from 'lucide-react';

export type BeautyType = 'nata-lee' | 'helga-lovekaty-fit' | 'alexis-ren' | 'annabel-lucinda' | 'madison-beer' | 'sydney-sweeney';
export type CompanionClass = 'A' | 'B' | 'C';
export type TrainingModule = {
  name: string;
  rating: number;
  maxRating?: number;
};

export interface StudentCompanionCardProps {
  id: string;
  name: string;
  studentId: string;
  trainingGroup: string;
  fitnessLevel: number;
  danceStyles: string[];
  beautyType: BeautyType;
  unintentionalEroticism: number;
  companionClass: CompanionClass;
  companionId: string;
  placementValue: number;
  trainingModules: TrainingModule[];
  clientSuitability: {
    elite: number;
    ancient: number;
    noble: number;
    experimental: number;
  };
  establishedYear: number;
  status: 'active' | 'training' | 'placed';
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

const beautyTypeLabels: Record<BeautyType, string> = {
  'nata-lee': 'Nata Lee - Perfektion',
  'helga-lovekaty-fit': 'Helga Lovekaty - Fit Kurvor',
  'alexis-ren': 'Alexis Ren - Dans',
  'annabel-lucinda': 'Annabel Lucinda - Extrem',
  'madison-beer': 'Madison Beer - Seduktion',
  'sydney-sweeney': 'Sydney Sweeney - Oskuld'
};

const beautyTypeGradients: Record<BeautyType, string> = {
  'nata-lee': 'from-yellow-200 via-yellow-400 to-orange-500',
  'helga-lovekaty-fit': 'from-pink-300 via-rose-400 to-red-500',
  'alexis-ren': 'from-amber-200 via-orange-300 to-amber-400',
  'annabel-lucinda': 'from-cyan-200 via-blue-400 to-indigo-500',
  'madison-beer': 'from-purple-200 via-pink-400 to-rose-400',
  'sydney-sweeney': 'from-blue-100 via-indigo-200 to-purple-300'
};

function StarRating({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < rating 
              ? 'text-[var(--nordic-gold)] fill-[var(--nordic-gold)]' 
              : 'text-[var(--color-text-muted)]'
          }`}
        />
      ))}
    </div>
  );
}

function FitnessBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level * 10}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${
            level >= 9 ? 'bg-gradient-to-r from-[var(--nordic-gold)] to-[var(--blood-crimson)]' :
            level >= 7 ? 'bg-[var(--nordic-gold)]' :
            'bg-[var(--color-text-muted)]'
          }`}
        />
      </div>
      <span className="text-xs font-medium text-[var(--color-text-secondary)] w-6">{level}</span>
    </div>
  );
}

function ProgressBar({ value, color = 'var(--nordic-gold)' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-[var(--color-text-muted)] w-8">{value}%</span>
    </div>
  );
}

export function StudentCompanionCard({
  id,
  name,
  studentId,
  trainingGroup,
  fitnessLevel,
  danceStyles,
  beautyType,
  unintentionalEroticism,
  companionClass,
  companionId,
  placementValue,
  trainingModules,
  clientSuitability,
  establishedYear,
  status,
  onFlip,
  className = ''
}: StudentCompanionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  const gradientClass = beautyTypeGradients[beautyType];

  return (
    <div 
      className={`relative w-[300px] h-[520px] perspective-1000 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
        onClick={handleFlip}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="glass rounded-2xl overflow-hidden h-full border border-[var(--color-border)] shadow-2xl">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-muted)] tracking-wider">
                  ST. CECILIA AKADEMI
                </span>
                <Lock className="w-4 h-4 text-[var(--color-text-muted)]" />
              </div>
            </div>

            <div className="relative h-[280px] overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className={`w-48 h-56 rounded-2xl bg-gradient-to-br ${gradientClass} p-0.5`}>
                    <div className="w-full h-full rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                      <User className="w-20 h-20 text-[var(--color-text-muted)] opacity-30" />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-[var(--color-accent-primary)] rounded-full text-xs font-bold text-[var(--color-text-inverse)]">
                    {fitnessLevel}/10
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 text-xs bg-[var(--color-bg-primary)]/80 backdrop-blur-sm rounded-full text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  {beautyTypeLabels[beautyType]}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xl font-heading text-[var(--color-text-primary)] leading-tight">
                  {name}
                </h3>
                <div className="h-px bg-gradient-to-r from-[var(--color-accent-primary)] to-transparent mt-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">ELEV-ID</span>
                  <span className="text-[var(--color-text-secondary)] font-mono">{studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">TRÄNINGSGRUPP</span>
                  <span className="text-[var(--color-text-secondary)]">{trainingGroup}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">KONDITION</span>
                  <FitnessBar level={fitnessLevel} />
                </div>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">DANS</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {danceStyles.map((style) => (
                    <span 
                      key={style}
                      className="px-2 py-0.5 text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--color-text-muted)]">OAVSIKTLIG EROTISM</span>
                  <span className="text-xs text-[var(--blush-rose)]">{unintentionalEroticism}/10</span>
                </div>
                <div className="h-1 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${unintentionalEroticism * 10}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-[var(--blush-rose)] to-[var(--neon-pink)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  status === 'active' ? 'bg-green-500/20 text-green-400' :
                  status === 'training' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {status === 'active' ? 'Aktiv' : status === 'training' ? 'Träning' : 'Placerad'}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  ETABLERAD {establishedYear}
                </span>
              </div>
            </div>

            <motion.div 
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-[var(--color-text-muted)]"
              animate={{ opacity: isHovered ? 1 : 0.5 }}
            >
              <span>Klicka för bedömning</span>
              <ChevronRight className="w-3 h-3" />
            </motion.div>
          </div>
        </div>

        <div 
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="glass rounded-2xl overflow-hidden h-full border border-[var(--blood-crimson)]/30 shadow-2xl bg-[var(--midnight-velvet)]/90">
            <div className="px-4 py-3 border-b border-[var(--blood-crimson)]/30 bg-[var(--blood-crimson)]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-[var(--blood-crimson)]" />
                  <span className="text-xs font-medium text-[var(--blood-crimson)] tracking-wider">
                    KONFIDENTIELL
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{companionId}</span>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
              <div>
                <h4 className="text-lg font-heading text-[var(--color-text-primary)]">
                  FÖLJESLAGARE KANDIDAT
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">UTVÄRDERINGSPROTOKOLL</p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  companionClass === 'A' ? 'bg-[var(--nordic-gold)] text-[var(--choker-black)]' :
                  companionClass === 'B' ? 'bg-[var(--color-text-muted)] text-[var(--color-bg-primary)]' :
                  'bg-[var(--bronze-tan)] text-[var(--color-bg-primary)]'
                }`}>
                  {companionClass}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Klass {companionClass} {companionClass === 'A' && '[ELIT]'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {companionClass === 'A' ? 'Premium placering' : 
                     companionClass === 'B' ? 'Avancerad placering' : 
                     'Standard placering'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--nordic-gold)]/30">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">PLACERINGS VÄRDE</p>
                <p className="text-2xl font-heading text-[var(--nordic-gold)]">
                  €{placementValue.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  TRÄNINGSMODULER
                </p>
                <div className="space-y-2">
                  {trainingModules.map((module) => (
                    <div key={module.name} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">{module.name}</span>
                      <StarRating rating={module.rating} maxRating={module.maxRating} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  KLIENT LÄMPLIGHET
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-secondary)]">Elit</span>
                    </div>
                    <ProgressBar value={clientSuitability.elite} color="var(--nordic-gold)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-secondary)]">Forntida</span>
                    </div>
                    <ProgressBar value={clientSuitability.ancient} color="var(--blood-crimson)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-secondary)]">Ädel</span>
                    </div>
                    <ProgressBar value={clientSuitability.noble} color="var(--training-purple)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-secondary)]">Experimentell</span>
                    </div>
                    <ProgressBar value={clientSuitability.experimental} color="var(--neon-pink)" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-center text-[var(--color-text-muted)]">
                  EGENDOM AV ESTATEN
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default StudentCompanionCard;
