'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TouchGestureZone } from '../../MobileSystem';

export type PhotoContext = 'portrait' | 'gym' | 'school' | 'spa' | 'class';
export type GeofenceMode = 'public' | 'student' | 'owner';

export interface PhotoItem {
  id: string;
  url: string;
  context: PhotoContext;
  contextLabel: string;
  quality: 'poor' | 'average' | 'good' | 'excellent';
  unlockedAt: number;
}

export interface StudentData {
  id: string;
  studentId: string;
  name: string;
  nickname?: string;
  family?: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  photos: PhotoItem[];
  isReserved?: boolean;
  reservationDate?: string;
  reservedBy?: string;
}

export interface PhoneLockScreenProps {
  student: StudentData;
  mode?: GeofenceMode;
  currentEpisode?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onLongPress?: () => void;
  className?: string;
}

const contextOrder: PhotoContext[] = ['portrait', 'gym', 'school', 'spa', 'class'];

export function PhoneLockScreen({
  student,
  mode = 'student',
  currentEpisode = 1,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onLongPress,
  className = ''
}: PhoneLockScreenProps) {
  const [currentContextIndex, setCurrentContextIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const unlockedPhotos = student.photos.filter(p => p.unlockedAt <= currentEpisode);
  const currentContext = contextOrder[currentContextIndex];
  const currentPhoto = unlockedPhotos.find(p => p.context === currentContext) || unlockedPhotos[0];

  const handleSwipeLeft = useCallback(() => {
    if (currentContextIndex < contextOrder.length - 1) {
      setDirection(1);
      setCurrentContextIndex(prev => prev + 1);
      onSwipeLeft?.();
    }
  }, [currentContextIndex, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (currentContextIndex > 0) {
      setDirection(-1);
      setCurrentContextIndex(prev => prev - 1);
      onSwipeRight?.();
    }
  }, [currentContextIndex, onSwipeRight]);

  const getDisplayName = () => {
    if (student.nickname) return student.nickname;
    const name = student.name;
    if (currentEpisode >= 10) return name.substring(0, 2).toUpperCase();
    if (currentEpisode >= 6) return name.substring(0, 4);
    if (currentEpisode >= 3) return name.substring(0, 3);
    return name;
  };

  const getPhotoQualityClass = (quality: PhotoItem['quality']) => {
    switch (quality) {
      case 'poor': return 'contrast-75 brightness-90 grayscale-[20%]';
      case 'average': return 'contrast-90 brightness-95';
      case 'good': return 'contrast-100 brightness-100';
      case 'excellent': return 'contrast-105 brightness-105 saturate-110';
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      <StatusBar mode={mode} className="absolute top-0 left-0 right-0 z-20" />

      <TouchGestureZone
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSwipeUp={onSwipeUp}
        onLongPress={onLongPress}
        className="w-full h-full"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {currentPhoto && (
            <motion.div
              key={currentPhoto.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={currentPhoto.url}
                alt={`${student.name} - ${currentPhoto.contextLabel}`}
                className={`w-full h-full object-cover ${getPhotoQualityClass(currentPhoto.quality)}`}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </TouchGestureZone>

      <IDOverlay
        studentId={mode === 'public' ? undefined : student.studentId}
        name={getDisplayName()}
        family={mode === 'public' ? undefined : student.family}
        isReserved={student.isReserved}
        reservationDate={student.reservationDate}
        mode={mode}
        className="absolute bottom-0 left-0 right-0 z-10"
      />
    </div>
  );
}


interface StatusBarProps {
  mode: GeofenceMode;
  className?: string;
}

function StatusBar({ mode, className = '' }: StatusBarProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  const getBatteryLevel = () => 87;

  const getSignalStrength = () => {
    switch (mode) {
      case 'public': return 3;
      case 'student': return 4;
      case 'owner': return 5;
    }
  };

  const batteryLevel = getBatteryLevel();
  const signalStrength = getSignalStrength();

  return (
    <div 
      className={`flex items-center justify-between px-6 py-3 text-white ${className}`}
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)' }}
    >
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium opacity-80">{signalStrength === 5 ? '5G' : 'LTE'}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-sm ${bar <= signalStrength ? 'bg-white' : 'bg-white/30'}`}
              style={{ height: `${8 + bar * 2}px` }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-6 h-3 border border-white/60 rounded-sm relative flex items-center px-0.5">
            <div 
              className="h-2 bg-white rounded-sm transition-all"
              style={{ width: `${batteryLevel * 0.2}px` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium tabular-nums">{formatTime(time)}</span>
      </div>
    </div>
  );
}


interface IDOverlayProps {
  studentId?: string;
  name: string;
  family?: string;
  isReserved?: boolean;
  reservationDate?: string;
  mode: GeofenceMode;
  className?: string;
}

function IDOverlay({ 
  studentId, 
  name, 
  family, 
  isReserved, 
  reservationDate,
  mode,
  className = '' 
}: IDOverlayProps) {
  if (mode === 'public') {
    return (
      <div 
        className={`px-6 pb-8 pt-12 ${className}`}
        style={{ 
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)' 
        }}
      >
        <div className="text-center">
          <p className="text-white/60 text-sm tracking-wider uppercase">Vinterhall Student</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`px-6 pb-8 pt-16 ${className}`}
      style={{ 
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' 
      }}
    >
      <div className="flex justify-center gap-1 mb-4 opacity-50">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rotate-45 bg-white/40" />
        ))}
      </div>

      {studentId && (
        <p className="text-white/70 text-xs tracking-[0.3em] text-center font-mono mb-1">
          {studentId}
        </p>
      )}

      <h2 className="text-white text-2xl font-heading text-center mb-1 tracking-wide">
        {name}
      </h2>

      {family && (
        <p className="text-white/50 text-sm text-center italic mb-3">
          {family}
        </p>
      )}

      {isReserved && reservationDate && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rotate-45 bg-amber-400/60" />
          <p className="text-amber-200/60 text-xs tracking-wider">
            Reserved until {reservationDate}
          </p>
          <div className="w-1.5 h-1.5 rotate-45 bg-amber-400/60" />
        </div>
      )}
    </div>
  );
}

export default PhoneLockScreen;
