'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type HolsterMaterial = 'silver' | 'gold' | 'obsidian' | 'rose-gold';
export type ChainStyle = 'simple' | 'ornate' | 'spiked' | 'minimal';

export interface ChainHolsterProps {
  children: React.ReactNode;
  material?: HolsterMaterial;
  chainStyle?: ChainStyle;
  isActive?: boolean;
  onChainClick?: () => void;
  className?: string;
}

const materialStyles: Record<HolsterMaterial, string> = {
  silver: 'from-slate-300 via-slate-400 to-slate-300 border-slate-400/50',
  gold: 'from-amber-200 via-amber-400 to-amber-200 border-amber-400/50',
  obsidian: 'from-slate-700 via-slate-900 to-slate-700 border-slate-800/50',
  'rose-gold': 'from-rose-200 via-rose-400 to-rose-200 border-rose-400/50'
};

const chainPatterns: Record<ChainStyle, React.ReactNode> = {
  simple: (
    <svg viewBox="0 0 40 200" className="w-full h-full" preserveAspectRatio="none">
      <path
        d="M20 0 L20 200"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {Array.from({ length: 20 }).map((_, i) => (
        <circle
          key={i}
          cx="20"
          cy={i * 10 + 5}
          r="2"
          fill="currentColor"
          opacity={0.6}
        />
      ))}
    </svg>
  ),
  ornate: (
    <svg viewBox="0 0 40 200" className="w-full h-full" preserveAspectRatio="none">
      {Array.from({ length: 25 }).map((_, i) => (
        <g key={i} transform={`translate(0, ${i * 8})`}>
          <circle cx="20" cy="0" r="3" fill="currentColor" />
          <path
            d="M20 3 L10 6 M20 3 L30 6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="10" cy="6" r="2" fill="currentColor" opacity={0.7} />
          <circle cx="30" cy="6" r="2" fill="currentColor" opacity={0.7} />
        </g>
      ))}
    </svg>
  ),
  spiked: (
    <svg viewBox="0 0 40 200" className="w-full h-full" preserveAspectRatio="none">
      {Array.from({ length: 15 }).map((_, i) => (
        <g key={i} transform={`translate(20, ${i * 13 + 6})`}>
          <polygon
            points="0,-6 -4,4 4,4"
            fill="currentColor"
          />
          <circle cx="0" cy="0" r="2" fill="currentColor" opacity={0.5} />
        </g>
      ))}
    </svg>
  ),
  minimal: (
    <svg viewBox="0 0 40 200" className="w-full h-full" preserveAspectRatio="none">
      <path
        d="M20 0 L20 200"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
        opacity={0.6}
      />
    </svg>
  )
};

export function ChainHolster({
  children,
  material = 'silver',
  chainStyle = 'simple',
  isActive = false,
  onChainClick,
  className = ''
}: ChainHolsterProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-[60%] -z-10">
        <motion.div
          animate={isActive ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-slate-400 ${material === 'gold' ? 'text-amber-400' : ''} ${material === 'obsidian' ? 'text-slate-600' : ''} ${material === 'rose-gold' ? 'text-rose-400' : ''}`}
          onClick={onChainClick}
        >
          {chainPatterns[chainStyle]}
        </motion.div>
      </div>

      <div
        className={`
          relative rounded-[2.5rem] p-1.5 bg-gradient-to-b ${materialStyles[material]}
          shadow-2xl
          ${isActive ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-black' : ''}
        `}
      >
        <div className="absolute inset-1.5 rounded-[2.25rem] bg-gradient-to-b from-slate-800 to-slate-900"
        />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20"
        />

        <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-emerald-500/30 z-20"
        />

        <div className="relative rounded-[2rem] overflow-hidden bg-black">
          {children}
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-slate-700/50 z-20"
        />
      </div>
    </div>
  );
}

export default ChainHolster;
