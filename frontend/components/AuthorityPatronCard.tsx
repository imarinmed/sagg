'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Lock, Sparkles, Hexagon } from 'lucide-react';

export type AuthorityLevel = 'alfa' | 'beta' | 'gamma' | 'delta';
export type Bloodline = 'Ren' | 'Blandad' | 'Oklar';

export interface AuthorityPatronCardProps {
  id: string;
  name: string;
  title: string;
  authorityLevel: AuthorityLevel;
  family: string;
  sector: string;
  generation: number;
  bloodline: Bloodline;
  memberSince: number;
  clearance: string;
  influence: string;
  assets: string;
  companionPrivileges: string;
  currentCompanion?: string;
  isCompanionSecret?: boolean;
  className?: string;
}

const authorityLevelLabels: Record<AuthorityLevel, string> = {
  alfa: 'Nivå Alfa',
  beta: 'Nivå Beta',
  gamma: 'Nivå Gamma',
  delta: 'Nivå Delta'
};

const authorityLevelColors: Record<AuthorityLevel, string> = {
  alfa: 'var(--nordic-gold)',
  beta: 'var(--silver)',
  gamma: 'var(--bronze)',
  delta: 'var(--color-text-muted)'
};

export function AuthorityPatronCard({
  id,
  name,
  title,
  authorityLevel,
  family,
  sector,
  generation,
  bloodline,
  memberSince,
  clearance,
  influence,
  assets,
  companionPrivileges,
  currentCompanion,
  isCompanionSecret = true,
  className = ''
}: AuthorityPatronCardProps) {
  const levelColor = authorityLevelColors[authorityLevel];

  return (
    <motion.div
      className={`relative w-[400px] h-[260px] ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass rounded-2xl overflow-hidden h-full border border-[var(--nordic-gold)]/30 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--midnight-velvet)] via-[var(--color-bg-secondary)] to-[var(--shadow-purple)]" />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--nordic-gold)] to-transparent" />
        
        <div className="relative h-full p-5 flex flex-col">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4" style={{ color: levelColor }} />
              <span className="text-xs font-medium tracking-wider" style={{ color: levelColor }}>
                ✦ EVIGA RÅDET ✦
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[var(--nordic-gold)]" />
                <span className="text-[10px] text-[var(--nordic-gold)]">HOLOGRAM</span>
              </motion.div>
            </div>
          </div>

          
          <div className="text-[10px] text-[var(--color-text-muted)] mb-3 tracking-wider">
            {family.toUpperCase()} ESTATEN | PRIVAT MEDLEMSKAP
          </div>

          
          <div className="flex gap-4 mb-4">
            
            <div className="relative">
              <div className="w-20 h-20 relative">
                <Hexagon 
                  className="w-full h-full absolute" 
                  style={{ color: levelColor }}
                  strokeWidth={1.5}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${levelColor}20, ${levelColor}40)`,
                      border: `2px solid ${levelColor}`
                    }}
                  >
                    <Crown className="w-8 h-8" style={{ color: levelColor }} />
                  </div>
                </div>
                
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1px solid ${levelColor}` }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--color-bg-primary)] rounded-full text-[8px] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                Looks 18
              </div>
            </div>

            
            <div className="flex-1">
              <h3 className="text-lg font-heading text-[var(--color-text-primary)] leading-tight mb-1">
                {name}
              </h3>
              <div className="h-px bg-gradient-to-r from-[var(--nordic-gold)] to-transparent mb-2" />
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-muted)]">{title}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <span>Generation: {generation}nd</span>
                  <span>|</span>
                  <span>Blodlinje: {bloodline}</span>
                </div>
                <div className="text-[var(--color-text-muted)]">
                  Medlem Sedan: {memberSince} ({new Date().getFullYear() - memberSince} år)
                </div>
              </div>
            </div>
          </div>

          
          <div className="flex-1 p-3 bg-[var(--color-bg-primary)]/50 rounded-lg border border-[var(--color-border)] mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[var(--color-text-muted)]">CLEARANCE: </span>
                <span style={{ color: levelColor }}>{clearance}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">SEKT: </span>
                <span className="text-[var(--color-text-secondary)]">{sector}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">INFLUENCE: </span>
                <span className="text-[var(--color-text-secondary)]">{influence}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">TILLGÅNGAR: </span>
                <span className="text-[var(--color-text-secondary)]">{assets}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-muted)]">FÖLJESLAGARE PRIVILEGIER: </span>
                <span style={{ color: levelColor }}>{companionPrivileges}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-muted)]">NUVARANDE FÖLJESLAGARE: </span>
                {isCompanionSecret ? (
                  <span className="flex items-center gap-1 text-[var(--blood-crimson)]">
                    <Lock className="w-3 h-3" />
                    [Hemlig]
                  </span>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">{currentCompanion}</span>
                )}
              </div>
            </div>
          </div>

          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-[var(--blood-crimson)]/20 flex items-center justify-center border border-[var(--blood-crimson)]/50">
                  <Shield className="w-3 h-3 text-[var(--blood-crimson)]" />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">SIGILL</span>
              </div>
              
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 rounded-full bg-[var(--nordic-gold)]/20 flex items-center justify-center border border-[var(--nordic-gold)]/50"
                >
                  <Sparkles className="w-3 h-3 text-[var(--nordic-gold)]" />
                </motion.div>
                <span className="text-[10px] text-[var(--color-text-muted)]">HOLOGRAM</span>
              </div>
              
              <div className="flex items-center gap-1">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center border"
                  style={{ 
                    backgroundColor: `${levelColor}20`,
                    borderColor: `${levelColor}50`
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: levelColor }} />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">CHIP</span>
              </div>
            </div>
          </div>

          
          <div className="mt-auto pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
              <span>AUKTORISERAD PERSONAL ENDAST</span>
              <span>KLIENT PRIVILEGIER</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AuthorityPatronCard;
