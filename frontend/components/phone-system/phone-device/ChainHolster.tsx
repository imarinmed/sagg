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

const materialStyles: Record<HolsterMaterial, { gradient: string; border: string; accent: string; shadow: string }> = {
  silver: {
    gradient: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400',
    border: 'border-slate-400/50',
    accent: 'text-slate-300',
    shadow: 'shadow-slate-500/20'
  },
  gold: {
    gradient: 'bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500',
    border: 'border-amber-400/50',
    accent: 'text-amber-300',
    shadow: 'shadow-amber-500/20'
  },
  obsidian: {
    gradient: 'bg-gradient-to-b from-slate-800 via-slate-900 to-black',
    border: 'border-slate-700/50',
    accent: 'text-slate-700',
    shadow: 'shadow-black/50'
  },
  'rose-gold': {
    gradient: 'bg-gradient-to-b from-rose-100 via-rose-300 to-rose-400',
    border: 'border-rose-300/50',
    accent: 'text-rose-300',
    shadow: 'shadow-rose-500/20'
  }
};

const ChainLink = ({ style, index }: { style: ChainStyle; index: number }) => {
  switch (style) {
    case 'ornate':
      return (
        <g transform={`translate(0, ${index * 18})`}>
          <path
            d="M20 2 C 25 2, 30 6, 30 12 C 30 18, 25 22, 20 22 C 15 22, 10 18, 10 12 C 10 6, 15 2, 20 2 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M20 5 C 22 5, 24 7, 24 10 C 24 13, 22 15, 20 15 C 18 15, 16 13, 16 10 C 16 7, 18 5, 20 5 Z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M20 22 L20 28"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      );
    case 'spiked':
      return (
        <g transform={`translate(0, ${index * 16})`}>
          <path
            d="M15 0 L25 0 L22 12 L18 12 Z"
            fill="currentColor"
          />
          <path
            d="M12 6 L8 8 L12 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M28 6 L32 8 L28 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.5" />
        </g>
      );
    case 'minimal':
      return (
        <g transform={`translate(0, ${index * 10})`}>
          <line x1="20" y1="0" x2="20" y2="10" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="10" r="1.5" fill="currentColor" />
        </g>
      );
    case 'simple':
    default:
      return (
        <g transform={`translate(0, ${index * 14})`}>
          <rect
            x="14"
            y="0"
            width="12"
            height="18"
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <rect
            x="17"
            y="14"
            width="6"
            height="8"
            rx="2"
            fill="currentColor"
            opacity="0.8"
          />
        </g>
      );
  }
};

export function ChainHolster({
  children,
  material = 'silver',
  chainStyle = 'simple',
  isActive = false,
  onChainClick,
  className = ''
}: ChainHolsterProps) {
  const styles = materialStyles[material];
  
  // Calculate number of links based on style
  const linkCount = chainStyle === 'minimal' ? 25 : chainStyle === 'ornate' ? 12 : 15;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Chain Section - Extends upwards */}
      <div className="relative h-32 w-full flex justify-center -mb-4 z-0">
        <motion.div
          className={`w-10 h-full cursor-pointer ${styles.accent}`}
          animate={isActive ? { 
            rotate: [0, 1, -1, 0],
            y: [0, 2, 0] 
          } : {}}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          onClick={onChainClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg viewBox="0 0 40 240" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`chain-grad-${material}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Render Chain Links */}
            <g fill={`url(#chain-grad-${material})`} stroke={`url(#chain-grad-${material})`}>
              {Array.from({ length: linkCount }).map((_, i) => (
                <ChainLink key={i} style={chainStyle} index={i} />
              ))}
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Holster Connector Clip */}
      <div className="relative z-10 w-16 h-8 -mb-4">
        <div className={`w-full h-full rounded-t-lg ${styles.gradient} shadow-lg border-t border-x ${styles.border}`}>
          {/* Leather texture effect */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] mix-blend-overlay" />
          
          {/* Stitching details */}
          <div className="absolute inset-x-2 top-2 border-t border-dashed border-black/20" />
          
          {/* Metal rivet */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-white to-slate-400 shadow-inner border border-slate-500" />
        </div>
      </div>

      {/* Phone Device Frame */}
      <motion.div
        initial={false}
        animate={isActive ? { 
          y: [0, -2, 0],
          rotateX: [0, 1, 0]
        } : {}}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={`
          relative w-[300px] h-[600px] rounded-[3rem] p-1
          ${styles.gradient} ${styles.shadow}
          shadow-2xl transition-all duration-500
          ${isActive ? 'ring-1 ring-white/30' : ''}
        `}
      >
        {/* Device Side Buttons */}
        <div className={`absolute -left-[2px] top-24 w-[3px] h-8 rounded-l-md ${styles.gradient} opacity-80`} /> {/* Volume Up */}
        <div className={`absolute -left-[2px] top-36 w-[3px] h-8 rounded-l-md ${styles.gradient} opacity-80`} /> {/* Volume Down */}
        <div className={`absolute -right-[2px] top-28 w-[3px] h-12 rounded-r-md ${styles.gradient} opacity-80`} /> {/* Power */}

        {/* Inner Bezel (Black Border) */}
        <div className="relative w-full h-full bg-black rounded-[2.8rem] overflow-hidden border-[6px] border-black shadow-inner">
          
          {/* Screen Content */}
          <div className="relative w-full h-full bg-black overflow-hidden">
            {children}
          </div>

          {/* Dynamic Island / Notch Area */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-[1.5rem] z-50 flex justify-center items-center">
            <div className="w-20 h-6 bg-black rounded-full flex items-center justify-center space-x-3">
              {/* Camera Lens */}
              <div className="w-3 h-3 rounded-full bg-[#1a1a1a] ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute top-1 left-1 w-1 h-1 bg-blue-900/50 rounded-full blur-[1px]" />
              </div>
              {/* FaceID Sensors */}
              <div className="w-2 h-2 rounded-full bg-[#111]" />
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-50 backdrop-blur-sm" />
          
          {/* Screen Gloss/Reflection */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30 z-40 rounded-[2.8rem]" />
        </div>
      </motion.div>
    </div>
  );
}

export default ChainHolster;
