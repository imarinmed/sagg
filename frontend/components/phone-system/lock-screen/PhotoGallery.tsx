'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Dumbbell, GraduationCap, Sparkles, Users } from 'lucide-react';
import type { PhotoContext } from '../lock-screen/PhoneLockScreen';

export interface PhotoGalleryProps {
  photos: {
    id: string;
    url: string;
    context: PhotoContext;
    contextLabel: string;
    quality: 'poor' | 'average' | 'good' | 'excellent';
    unlockedAt: number;
  }[];
  currentContext: PhotoContext;
  onContextChange: (context: PhotoContext) => void;
  currentEpisode: number;
  className?: string;
}

const contextConfig: Record<PhotoContext, { icon: React.ReactNode; label: string; color: string }> = {
  portrait: {
    icon: <Camera className="w-4 h-4" />,
    label: 'Portrait',
    color: 'from-rose-500/20 to-purple-500/20'
  },
  gym: {
    icon: <Dumbbell className="w-4 h-4" />,
    label: 'Gym',
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  school: {
    icon: <GraduationCap className="w-4 h-4" />,
    label: 'School',
    color: 'from-blue-500/20 to-indigo-500/20'
  },
  spa: {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Spa',
    color: 'from-amber-500/20 to-orange-500/20'
  },
  class: {
    icon: <Users className="w-4 h-4" />,
    label: 'Class',
    color: 'from-violet-500/20 to-pink-500/20'
  }
};

const contextOrder: PhotoContext[] = ['portrait', 'gym', 'school', 'spa', 'class'];

export function PhotoGallery({
  photos,
  currentContext,
  onContextChange,
  currentEpisode,
  className = ''
}: PhotoGalleryProps) {
  const unlockedContexts = contextOrder.filter(ctx =>
    photos.some(p => p.context === ctx && p.unlockedAt <= currentEpisode)
  );

  const currentIndex = unlockedContexts.indexOf(currentContext);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 relative">
        {unlockedContexts.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex justify-center gap-2 z-10">
            {unlockedContexts.map((ctx, idx) => (
              <motion.button
                key={ctx}
                onClick={() => onContextChange(ctx)}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30'}
                `}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {
            photos
              .filter(p => p.context === currentContext && p.unlockedAt <= currentEpisode)
              .map(photo => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <img
                    src={photo.url}
                    alt={photo.contextLabel}
                    className={`w-full h-full object-cover ${getQualityFilter(photo.quality)}`}
                    draggable={false}
                  />
                </motion.div>
              ))[0]
          }
        </AnimatePresence>
      </div>

      {unlockedContexts.length > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-gradient-to-t from-black/80 to-transparent"
        >
          <div className="flex justify-center gap-3">
            {unlockedContexts.map(ctx => {
              const config = contextConfig[ctx];
              const isActive = ctx === currentContext;

              return (
                <motion.button
                  key={ctx}
                  onClick={() => onContextChange(ctx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                    transition-all
                    ${isActive
                      ? `bg-gradient-to-br ${config.color} text-white`
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }
                  `}
                >
                  {config.icon}
                  <span className="text-[10px] font-medium">{config.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getQualityFilter(quality: 'poor' | 'average' | 'good' | 'excellent'): string {
  switch (quality) {
    case 'poor':
      return 'contrast-75 brightness-90 grayscale-[20%]';
    case 'average':
      return 'contrast-90 brightness-95';
    case 'good':
      return 'contrast-100 brightness-100';
    case 'excellent':
      return 'contrast-105 brightness-105 saturate-110';
  }
}

export default PhotoGallery;
