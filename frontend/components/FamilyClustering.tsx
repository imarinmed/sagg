'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, Sparkles } from 'lucide-react';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  fitnessLevel: number;
  beautyType: string;
  isAuthority?: boolean;
}

export interface FamilyCluster {
  id: string;
  name: string;
  sector: string;
  color: string;
  crestIcon?: React.ReactNode;
  members: FamilyMember[];
  influence: 'dominant' | 'major' | 'minor' | 'independent';
  establishedYear: number;
}

export interface FamilyClusteringProps {
  families: FamilyCluster[];
  selectedFamilyId?: string | null;
  onFamilySelect?: (familyId: string) => void;
  onMemberSelect?: (memberId: string) => void;
  className?: string;
}

const influenceLabels: Record<FamilyCluster['influence'], string> = {
  dominant: 'Dominerande',
  major: 'Majortet',
  minor: 'Minoritet',
  independent: 'Oberoende'
};

const influenceColors: Record<FamilyCluster['influence'], string> = {
  dominant: 'var(--nordic-gold)',
  major: 'var(--silver)',
  minor: 'var(--bronze-tan)',
  independent: 'var(--color-text-muted)'
};

function FamilyCard({ 
  family, 
  isSelected, 
  onSelect 
}: { 
  family: FamilyCluster; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  const averageFitness = useMemo(() => {
    if (family.members.length === 0) return 0;
    return family.members.reduce((sum, m) => sum + m.fitnessLevel, 0) / family.members.length;
  }, [family.members]);

  const authorityCount = useMemo(() => 
    family.members.filter(m => m.isAuthority).length,
  [family.members]);

  return (
    <motion.div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border transition-all duration-300 ${
        isSelected 
          ? 'border-[var(--nordic-gold)] shadow-lg shadow-[var(--nordic-gold)]/20' 
          : 'border-[var(--color-border)] hover:border-[var(--color-border-accent)]'
      }`}
      style={{ backgroundColor: `${family.color}10` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: `${family.color}30`,
                border: `2px solid ${family.color}`
              }}
            >
              {family.crestIcon || <Users className="w-6 h-6" style={{ color: family.color }} />}
            </div>
            
            <div>
              <h3 className="text-lg font-heading text-[var(--color-text-primary)]">
                {family.name}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {family.sector}
              </p>
            </div>
          </div>

          <div 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${influenceColors[family.influence]}20`,
              color: influenceColors[family.influence]
            }}
          >
            {influenceLabels[family.influence]}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-[var(--color-bg-primary)]/50 rounded-lg">
            <p className="text-2xl font-heading" style={{ color: family.color }}>
              {family.members.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
              Medlemmar
            </p>
          </div>

          <div className="text-center p-2 bg-[var(--color-bg-primary)]/50 rounded-lg">
            <p className="text-2xl font-heading" style={{ color: family.color }}>
              {averageFitness.toFixed(1)}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
              Kondition
            </p>
          </div>

          <div className="text-center p-2 bg-[var(--color-bg-primary)]/50 rounded-lg">
            <p className="text-2xl font-heading" style={{ color: family.color }}>
              {authorityCount}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
              Auktoriteter
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Est. {family.establishedYear}</span>
          <span>{new Date().getFullYear() - family.establishedYear} år av makt</span>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="p-3 bg-[var(--color-bg-secondary)]/50">
          <p className="text-xs text-[var(--color-text-muted)] mb-2">
            Medlemmar:
          </p>
          <div className="flex flex-wrap gap-2">
            {family.members.slice(0, 5).map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${family.color}20` }}
              >
                {member.isAuthority && <Crown className="w-3 h-3" style={{ color: family.color }} />}
                <span className="text-[var(--color-text-secondary)]">{member.name}</span>
              </div>
            ))}
            {family.members.length > 5 && (
              <span className="text-xs text-[var(--color-text-muted)]">
                +{family.members.length - 5} mer
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FamilyClustering({
  families,
  selectedFamilyId,
  onFamilySelect,
  onMemberSelect,
  className = ''
}: FamilyClusteringProps) {
  const sortedFamilies = useMemo(() => {
    const order = { dominant: 0, major: 1, minor: 2, independent: 3 };
    return [...families].sort((a, b) => order[a.influence] - order[b.influence]);
  }, [families]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-heading text-[var(--color-text-primary)]">
            Vampire Familjer
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {families.length} familjer | {families.reduce((sum, f) => sum + f.members.length, 0)} medlemmar
          </p>
        </div>

        <div className="flex items-center gap-4">
          {(Object.keys(influenceLabels) as Array<keyof typeof influenceLabels>).map((influence) => (
            <div key={influence} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: influenceColors[influence] }}
              />
              <span className="text-xs text-[var(--color-text-muted)]">
                {influenceLabels[influence]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFamilies.map((family) => (
          <FamilyCard
            key={family.id}
            family={family}
            isSelected={family.id === selectedFamilyId}
            onSelect={() => onFamilySelect?.(family.id)}
          />
        ))}
      </div>

      {selectedFamilyId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          {(() => {
            const family = families.find(f => f.id === selectedFamilyId);
            if (!family) return null;
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${family.color}30`,
                        border: `2px solid ${family.color}`
                      }}
                    >
                      {family.crestIcon || <Users className="w-5 h-5" style={{ color: family.color }} />}
                    </div>
                    <div>
                      <h4 className="font-heading text-[var(--color-text-primary)]">
                        {family.name} Medlemmar
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Klicka för att se detaljer
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {family.members.map((member) => (
                    <motion.button
                      key={member.id}
                      onClick={() => onMemberSelect?.(member.id)}
                      className="p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-accent)] transition-colors text-left"
                      style={{ backgroundColor: `${family.color}10` }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {member.isAuthority ? (
                          <Crown className="w-4 h-4" style={{ color: family.color }} />
                        ) : (
                          <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
                        )}
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {member.name}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">{member.role}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[var(--nordic-gold)]" />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {member.fitnessLevel}/10
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

export default FamilyClustering;
