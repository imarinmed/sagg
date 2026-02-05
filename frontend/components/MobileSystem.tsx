'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  X,
  GripHorizontal,
  Smartphone
} from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);

  const snapTo = (index: number) => {
    if (index < 0) {
      onClose();
    } else {
      setCurrentSnap(Math.min(index, snapPoints.length - 1));
    }
  };

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    
    if (velocity > 500 || info.offset.y > threshold) {
      snapTo(currentSnap - 1);
    } else if (velocity < -500 || info.offset.y < -threshold) {
      snapTo(currentSnap + 1);
    }
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: `${(1 - snapPoints[currentSnap]) * 100}%` }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-primary)] rounded-t-3xl z-50 shadow-2xl"
            style={{ height: `${snapPoints[snapPoints.length - 1] * 100}vh` }}
          >
            <div className="sticky top-0 bg-[var(--color-bg-primary)] rounded-t-3xl z-10">
              <div className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing">
                <GripHorizontal className="w-6 h-6 text-[var(--color-text-muted)]" />
              </div>

              {title && (
                <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--color-border)]">
                  <h3 className="text-lg font-heading text-[var(--color-text-primary)]">{title}</h3>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface MobileCardStackProps {
  cards: {
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    badge?: string;
    onClick?: () => void;
  }[];
  className?: string;
}

export function MobileCardStack({ cards, className = '' }: MobileCardStackProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {cards.map((card, index) => {
        const isExpanded = expandedId === card.id;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              setExpandedId(isExpanded ? null : card.id);
              card.onClick?.();
            }}
            className={`glass rounded-2xl overflow-hidden cursor-pointer transition-all ${
              isExpanded ? 'ring-2 ring-[var(--color-accent-primary)]' : ''
            }`}
          >
            <div className="flex items-center gap-4 p-4">
              {card.image ? (
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
              )}

              <div className="flex-1">
                <h4 className="font-medium text-[var(--color-text-primary)]">{card.title}</h4>
                {card.subtitle && (
                  <p className="text-sm text-[var(--color-text-muted)]">{card.subtitle}</p>
                )}
              </div>

              {card.badge && (
                <span className="px-2 py-1 text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] rounded-full">
                  {card.badge}
                </span>
              )}

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
              >
                <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
              </motion.div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="p-3 bg-[var(--color-bg-secondary)] rounded-xl">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Klicka för fullständig information
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export interface TouchGestureZoneProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function TouchGestureZone({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  children,
  className = ''
}: TouchGestureZoneProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const LONG_PRESS_DURATION = 500;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    const minSwipeDistance = 50;

    if (deltaTime < LONG_PRESS_DURATION) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          onTap?.();
        }
      } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        } else {
          onTap?.();
        }
      }
    } else {
      onLongPress?.();
    }

    setTouchStart(null);
  };

  return (
    <div
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

export interface MobileFilterChipsProps {
  options: { id: string; label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function MobileFilterChips({ options, selected, onChange, className = '' }: MobileFilterChipsProps) {
  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <motion.button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              isSelected
                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1 ${isSelected ? 'opacity-80' : 'text-[var(--color-text-muted)]'}`}>
                {option.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default { 
  BottomSheet, 
  MobileCardStack, 
  TouchGestureZone,
  MobileFilterChips
};
