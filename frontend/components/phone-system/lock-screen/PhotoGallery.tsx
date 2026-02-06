'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TouchGestureZone } from '../../MobileSystem';

export type PhotoContext = 'portrait' | 'gym' | 'school' | 'spa' | 'class';

export interface PhotoItem {
  id: string;
  url: string;
  context: PhotoContext;
  contextLabel: string;
  quality: 'poor' | 'average' | 'good' | 'excellent';
  unlockedAt: number;
  allure?: number;
  sensuality?: number;
}

export interface PhotoGalleryProps {
  photos: PhotoItem[];
  currentContext: PhotoContext;
  onContextChange: (context: PhotoContext) => void;
  currentEpisode: number;
  className?: string;
}

const CONTEXT_ORDER: PhotoContext[] = ['portrait', 'gym', 'school', 'spa', 'class'];

export function PhotoGallery({
  photos,
  currentContext,
  onContextChange,
  currentEpisode,
  className = ''
}: PhotoGalleryProps) {
  const unlockedContexts = CONTEXT_ORDER.filter(ctx =>
    photos.some(p => p.context === ctx && p.unlockedAt <= currentEpisode)
  );

  const currentIndex = unlockedContexts.indexOf(currentContext);

  const handleSwipeLeft = () => {
    if (currentIndex < unlockedContexts.length - 1) {
      onContextChange(unlockedContexts[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      onContextChange(unlockedContexts[currentIndex - 1]);
    }
  };

  const currentPhoto = photos
    .filter(p => p.context === currentContext && p.unlockedAt <= currentEpisode)
    .sort((a, b) => b.unlockedAt - a.unlockedAt)[0];

  return (
    <TouchGestureZone
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {unlockedContexts.length > 1 && (
        <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-20">
          {unlockedContexts.map((ctx, idx) => (
            <motion.button
              key={ctx}
              onClick={(e) => {
                e.stopPropagation();
                onContextChange(ctx);
              }}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}
              `}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentPhoto ? (
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentPhoto.url}
              alt={currentPhoto.contextLabel}
              className={`
                w-full h-full object-cover
                ${getQualityFilter(currentPhoto.quality)}
              `}
              draggable={false}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white/40">
            <p>No photos available</p>
          </div>
        )}
      </AnimatePresence>
    </TouchGestureZone>
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
    default:
      return '';
  }
}

export default PhotoGallery;
