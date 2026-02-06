'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type GeofenceMode = 'public' | 'student' | 'owner';

export interface IDOverlayProps {
  studentId?: string;
  name: string;
  family?: string;
  isReserved?: boolean;
  reservationDate?: string;
  reservedBy?: string;
  mode?: GeofenceMode;
  className?: string;
}

export function IDOverlay({
  studentId,
  name,
  family,
  isReserved,
  reservationDate,
  reservedBy,
  mode = 'student',
  className = ''
}: IDOverlayProps) {
  if (mode === 'public') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`px-6 pb-10 pt-16 ${className}`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div className="text-center">
          <p className="text-white/30 text-xs tracking-[0.4em] uppercase font-light">
            Vinterhall Student
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={`px-6 pb-12 pt-24 w-full ${className}`}
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 100%)'
      }}
    >
      <div className="flex justify-center gap-[4px] mb-6 opacity-40">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
            className="w-[4px] h-[4px] rotate-45 bg-white/60"
          />
        ))}
      </div>

      {studentId && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/30 text-[10px] tracking-[0.35em] text-center font-mono mb-3 uppercase"
        >
          {studentId}
        </motion.p>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-white text-4xl font-heading text-center mb-1 tracking-wide drop-shadow-2xl"
      >
        {name}
      </motion.h2>

      {family && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/40 text-sm text-center italic tracking-wider mb-6 font-light"
        >
          {family}
        </motion.p>
      )}

      {isReserved && reservationDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-3 mt-2"
        >
          <div className="w-[3px] h-[3px] rotate-45 bg-amber-400/60" />
          <p className="text-amber-100/50 text-[9px] tracking-[0.25em] uppercase font-medium">
            Reserved until {reservationDate}
          </p>
          <div className="w-[3px] h-[3px] rotate-45 bg-amber-400/60" />
        </motion.div>
      )}

      {mode === 'owner' && reservedBy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-center mt-3"
        >
          <p className="text-white/20 text-[9px] tracking-widest uppercase">
            Property of {reservedBy}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default IDOverlay;
