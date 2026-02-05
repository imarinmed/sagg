'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Sparkles,
  ChevronDown,
  Shield
} from 'lucide-react';

export type SpoilerLevel = 'hidden' | 'hinted' | 'revealed';

export interface SpoilerContent {
  id: string;
  level: SpoilerLevel;
  title: string;
  hint?: string;
  content: React.ReactNode;
  severity: 'minor' | 'major' | 'critical';
  episodeThreshold?: string;
}

export interface SpoilerManagerProps {
  globalLevel: SpoilerLevel;
  onGlobalLevelChange: (level: SpoilerLevel) => void;
  className?: string;
}

export function SpoilerManager({ 
  globalLevel, 
  onGlobalLevelChange,
  className = '' 
}: SpoilerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const levels: { id: SpoilerLevel; label: string; description: string; icon: React.ReactNode }[] = [
    { 
      id: 'hidden', 
      label: 'Dold', 
      description: 'Inga spoilers visas',
      icon: <EyeOff className="w-4 h-4" />
    },
    { 
      id: 'hinted', 
      label: 'Hintad', 
      description: 'Vaga ledtrådar utan avslöjanden',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      id: 'revealed', 
      label: 'Avslöjad', 
      description: 'Alla spoilers visas',
      icon: <Eye className="w-4 h-4" />
    }
  ];

  const currentLevel = levels.find(l => l.id === globalLevel);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          globalLevel === 'revealed' 
            ? 'bg-[var(--blood-crimson)]/10 border-[var(--blood-crimson)]/30 text-[var(--blood-crimson)]' 
            : globalLevel === 'hinted'
            ? 'bg-[var(--nordic-gold)]/10 border-[var(--nordic-gold)]/30 text-[var(--nordic-gold)]'
            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
        }`}
      >
        {currentLevel?.icon}
        <span className="font-medium">{currentLevel?.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-72 glass rounded-xl p-3 z-50"
            >
              <div className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                Spoiler-nivå
              </div>

              <div className="space-y-2">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      onGlobalLevelChange(level.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      globalLevel === level.id
                        ? 'bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30'
                        : 'hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      globalLevel === level.id 
                        ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' 
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                    }`}>
                      {level.icon}
                    </div>

                    <div>
                      <div className={`font-medium ${
                        globalLevel === level.id 
                          ? 'text-[var(--color-accent-primary)]' 
                          : 'text-[var(--color-text-primary)]'
                      }`}>
                        {level.label}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {level.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface SpoilerBlockProps {
  content: SpoilerContent;
  currentEpisode?: string;
  className?: string;
}

export function SpoilerBlock({ content, currentEpisode, className = '' }: SpoilerBlockProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [userLevel, setUserLevel] = useState<SpoilerLevel>('hidden');

  useEffect(() => {
    const stored = localStorage.getItem('blod-spoiler-level') as SpoilerLevel;
    if (stored) setUserLevel(stored);
  }, []);

  const effectiveLevel = isRevealed ? 'revealed' : userLevel;
  const isLocked = content.level === 'hidden' && effectiveLevel !== 'revealed';
  const isHinted = content.level === 'hinted' && effectiveLevel === 'hinted';

  if (isLocked) {
    return (
      <motion.div
        className={`glass rounded-xl p-6 border border-[var(--color-border)] ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
              <Lock className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-muted)]">
              Låst innehåll
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Avslöjas i {content.episodeThreshold || 'senare avsnitt'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`glass rounded-xl overflow-hidden border ${
        content.severity === 'critical' 
          ? 'border-[var(--blood-crimson)]/30' 
          : content.severity === 'major'
          ? 'border-[var(--nordic-gold)]/30'
          : 'border-[var(--color-border)]'
      } ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`px-4 py-3 flex items-center justify-between ${
        content.severity === 'critical' 
          ? 'bg-[var(--blood-crimson)]/10' 
          : content.severity === 'major'
          ? 'bg-[var(--nordic-gold)]/10'
          : 'bg-[var(--color-bg-secondary)]'
      }`}>
        <div className="flex items-center gap-2">
          {content.severity === 'critical' && <Shield className="w-4 h-4 text-[var(--blood-crimson)]" />}
          {content.severity === 'major' && <AlertTriangle className="w-4 h-4 text-[var(--nordic-gold)]" />}
          {content.severity === 'minor' && <Sparkles className="w-4 h-4 text-[var(--color-text-muted)]" />}
          <span className={`font-medium ${
            content.severity === 'critical' 
              ? 'text-[var(--blood-crimson)]' 
              : content.severity === 'major'
              ? 'text-[var(--nordic-gold)]'
              : 'text-[var(--color-text-primary)]'
          }`}>
            {content.title}
          </span>
        </div>

        {effectiveLevel !== 'revealed' && content.level !== 'hidden' && (
          <button
            onClick={() => setIsRevealed(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-surface-hover)] rounded-full transition-colors"
          >
            <Unlock className="w-3 h-3" />
            Avslöja
          </button>
        )}
      </div>

      <div className="p-4">
        {isHinted && !isRevealed && content.hint ? (
          <div className="text-[var(--color-text-muted)] italic">
            {content.hint}
          </div>
        ) : (
          <div className="text-[var(--color-text-secondary)]">
            {content.content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export interface SecretRevealerProps {
  secrets: {
    id: string;
    condition: () => boolean;
    content: React.ReactNode;
    teaser: string;
  }[];
  className?: string;
}

export function SecretRevealer({ secrets, className = '' }: SecretRevealerProps) {
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkSecrets = () => {
      const newlyRevealed = new Set(revealedSecrets);
      secrets.forEach(secret => {
        if (secret.condition() && !revealedSecrets.has(secret.id)) {
          newlyRevealed.add(secret.id);
        }
      });
      if (newlyRevealed.size !== revealedSecrets.size) {
        setRevealedSecrets(newlyRevealed);
      }
    };

    checkSecrets();
    const interval = setInterval(checkSecrets, 1000);
    return () => clearInterval(interval);
  }, [secrets, revealedSecrets]);

  return (
    <div className={`space-y-4 ${className}`}>
      {secrets.map((secret) => {
        const isRevealed = revealedSecrets.has(secret.id);

        return (
          <motion.div
            key={secret.id}
            className={`glass rounded-xl p-4 border ${
              isRevealed 
                ? 'border-[var(--nordic-gold)]/30 bg-[var(--nordic-gold)]/5' 
                : 'border-[var(--color-border)]'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {isRevealed ? (
                <Unlock className="w-5 h-5 text-[var(--nordic-gold)]" />
              ) : (
                <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
              )}
              <span className={`font-medium ${
                isRevealed ? 'text-[var(--nordic-gold)]' : 'text-[var(--color-text-muted)]'
              }`}>
                {isRevealed ? 'Avslöjad Hemlighet' : 'Låst Hemlighet'}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isRevealed ? (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[var(--color-text-secondary)]"
                >
                  {secret.content}
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[var(--color-text-muted)] italic"
                >
                  {secret.teaser}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export default { SpoilerManager, SpoilerBlock, SecretRevealer };
