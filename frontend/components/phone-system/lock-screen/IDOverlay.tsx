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
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div className="text-center">
          <p className="text-white/50 text-xs tracking-[0.4em] uppercase font-light">
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
      className={`px-6 pb-10 pt-20 ${className}`}
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)'
      }}
    >
      <div className="flex justify-center gap-[3px] mb-6 opacity-40">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.02 }}
            className="w-[5px] h-[5px] rotate-45 bg-white/50"
          />
        ))}
      </div>

      {studentId && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-white/60 text-[10px] tracking-[0.35em] text-center font-mono mb-2"
        >
          {studentId}
        </motion.p>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white text-3xl font-heading text-center mb-1 tracking-wide drop-shadow-lg"
      >
        {name}
      </motion.h2>

      {family && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-white/40 text-sm text-center italic tracking-wider mb-4"
        >
          {family}
        </motion.p>
      )}

      {isReserved && reservationDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mt-5"
        >
          <div className="w-[4px] h-[4px] rotate-45 bg-amber-400/50" />
          <p className="text-amber-100/40 text-[10px] tracking-[0.2em] uppercase">
            Reserved until {reservationDate}
          </p>
          <div className="w-[4px] h-[4px] rotate-45 bg-amber-400/50" />
        </motion.div>
      )}

      {mode === 'owner' && reservedBy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center mt-3"
        >
          <p className="text-white/30 text-[10px] tracking-wider">
            Property of {reservedBy}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default IDOverlay;
