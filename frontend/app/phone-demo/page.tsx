'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneLockScreen,
  ChainHolster,
  type GeofenceMode,
  type PhotoContext,
  type StudentData
} from '@/components/phone-system';
import { MapPin, Building2, Crown, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';

const demoStudent: StudentData = {
  id: 'kiara',
  studentId: 'STD-24-KND-001',
  name: 'Kiara',
  family: 'Natt och Dag',
  role: 'protagonist',
  photos: [
    {
      id: 'p1',
      url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
      context: 'portrait',
      contextLabel: 'Portrait',
      quality: 'average',
      unlockedAt: 1
    },
    {
      id: 'p2',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      context: 'gym',
      contextLabel: 'Gym Training',
      quality: 'good',
      unlockedAt: 3
    },
    {
      id: 'p3',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
      context: 'school',
      contextLabel: 'School Uniform',
      quality: 'excellent',
      unlockedAt: 6
    },
    {
      id: 'p4',
      url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      context: 'spa',
      contextLabel: 'Spa Day',
      quality: 'excellent',
      unlockedAt: 8
    },
    {
      id: 'p5',
      url: 'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=800&q=80',
      context: 'class',
      contextLabel: 'Companion Class',
      quality: 'good',
      unlockedAt: 10
    }
  ],
  isReserved: true,
  reservationDate: 'Oct 15',
  reservedBy: 'Desirée Natt och Dag'
};

const geofenceModes: { id: GeofenceMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'public',
    label: 'Public',
    icon: <MapPin className="w-4 h-4" />,
    description: 'In town - minimal info shown'
  },
  {
    id: 'student',
    label: 'Student',
    icon: <Building2 className="w-4 h-4" />,
    description: 'On campus - full profile visible'
  },
  {
    id: 'owner',
    label: 'Owner',
    icon: <Crown className="w-4 h-4" />,
    description: 'Full access - live tracking active'
  }
];

const chainMaterials = ['silver', 'gold', 'obsidian', 'rose-gold'] as const;
const chainStyles = ['simple', 'ornate', 'spiked', 'minimal'] as const;

export default function PhoneSystemDemoPage() {
  const [mode, setMode] = useState<GeofenceMode>('student');
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [material, setMaterial] = useState('silver');
  const [chainStyle, setChainStyle] = useState('simple');
  const [isHolsterActive, setIsHolsterActive] = useState(false);

  const incrementEpisode = () => setCurrentEpisode(prev => Math.min(prev + 1, 10));
  const decrementEpisode = () => setCurrentEpisode(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <header className="sticky top-0 z-30 glass border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading text-[var(--color-text-primary)]">
            Vinterhall Phone System Demo
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Testing the 95% photo, 5% overlay layout
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <ChainHolster
              material={material as any}
              chainStyle={chainStyle as any}
              isActive={isHolsterActive}
              onChainClick={() => setIsHolsterActive(!isHolsterActive)}
              className="w-[320px]"
            >
              <div className="aspect-[9/19.5] bg-black">
                <PhoneLockScreen
                  student={demoStudent}
                  mode={mode}
                  currentEpisode={currentEpisode}
                  onSwipeUp={() => console.log('Unlock phone')}
                  onLongPress={() => console.log('Emergency mode')}
                />
              </div>
            </ChainHolster>
          </div>

          <div className="space-y-6">
            <section className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading text-[var(--color-text-primary)] mb-4">
                Geofence Mode
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {geofenceModes.map((gmode) => (
                  <motion.button
                    key={gmode.id}
                    onClick={() => setMode(gmode.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl transition-all
                      ${mode === gmode.id
                        ? 'bg-[var(--color-accent-primary)] text-white'
                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                      }
                    `}
                  >
                    {gmode.icon}
                    <span className="text-sm font-medium">{gmode.label}</span>
                    <span className="text-[10px] opacity-70 text-center">{gmode.description}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading text-[var(--color-text-primary)] mb-4">
                Episode Progression
              </h2>
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={decrementEpisode}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  disabled={currentEpisode <= 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex-1 text-center">
                  <p className="text-3xl font-heading text-[var(--color-text-primary)]">
                    Episode {currentEpisode}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {currentEpisode === 1 && 'Fresh start, poor photos'}
                    {currentEpisode >= 2 && currentEpisode < 5 && 'Improving quality'}
                    {currentEpisode >= 5 && currentEpisode < 8 && 'Good quality unlocked'}
                    {currentEpisode >= 8 && 'Excellent photos available'}
                  </p>
                </div>

                <motion.button
                  onClick={incrementEpisode}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  disabled={currentEpisode >= 10}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mt-4">
                <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--color-accent-primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentEpisode / 10) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
                  <span>Ep 1</span>
                  <span>Ep 10</span>
                </div>
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading text-[var(--color-text-primary)] mb-4">
                Holster Customization
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">Material</p>
                  <div className="flex gap-2">
                    {chainMaterials.map((mat) => (
                      <motion.button
                        key={mat}
                        onClick={() => setMaterial(mat)}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          px-4 py-2 rounded-lg text-sm capitalize transition-all
                          ${material === mat
                            ? 'bg-[var(--color-accent-primary)] text-white'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                          }
                        `}
                      >
                        {mat.replace('-', ' ')}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">Chain Style</p>
                  <div className="flex gap-2">
                    {chainStyles.map((style) => (
                      <motion.button
                        key={style}
                        onClick={() => setChainStyle(style)}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          px-4 py-2 rounded-lg text-sm capitalize transition-all
                          ${chainStyle === style
                            ? 'bg-[var(--color-accent-primary)] text-white'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                          }
                        `}
                      >
                        {style}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading text-[var(--color-text-primary)] mb-4">
                Phone Behaviors
              </h2>
              <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                <p><strong>Swipe Left/Right:</strong> Change photo context (Portrait → Gym → School → Spa → Class)</p>
                <p><strong>Swipe Up:</strong> Unlock phone to access home screen</p>
                <p><strong>Long Press:</strong> Emergency override / SOS</p>
                <p><strong>Click Chain:</strong> Animate holster</p>
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading text-[var(--color-text-primary)] mb-4">
                Features
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  95% photo, 5% overlay layout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Progressive photo quality (poor → excellent)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Name degradation (Kiara → Kia → Kiki → KK)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Geofence modes (Public/Student/Owner)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Subtle reservation badges
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Customizable chain holster materials
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
