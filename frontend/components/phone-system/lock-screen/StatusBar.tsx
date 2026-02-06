'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Battery, Signal } from 'lucide-react';

export type GeofenceMode = 'public' | 'student' | 'owner';

export interface StatusBarProps {
  mode?: GeofenceMode;
  variant?: 'lock' | 'home' | 'app';
  className?: string;
  showSurveillance?: boolean;
}

export function StatusBar({
  mode = 'student',
  variant = 'lock',
  className = '',
  showSurveillance = true
}: StatusBarProps) {
  const [time, setTime] = React.useState(new Date());
  const [batteryLevel, setBatteryLevel] = React.useState(87);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  const getSignalStrength = () => {
    switch (mode) {
      case 'public': return { bars: 3, type: 'LTE', color: 'text-white/70' };
      case 'student': return { bars: 4, type: '5G', color: 'text-white/80' };
      case 'owner': return { bars: 5, type: '5G+', color: 'text-emerald-300/80' };
    }
  };

  const signal = getSignalStrength();

  return (
    <div 
      className={`flex items-center justify-between px-5 py-2.5 text-white select-none ${className}`}
      style={{ 
        background: variant === 'lock' 
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)'
          : 'rgba(0,0,0,0.2)'
      }}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold tracking-wider ${signal.color}`}>
          {signal.type}
        </span>
        <div className="flex items-end gap-[2px] h-3">
          {[1, 2, 3, 4, 5].map((bar) => (
            <motion.div
              key={bar}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: bar * 0.05 }}
              className={`w-[3px] rounded-sm ${bar <= signal.bars ? 'bg-white' : 'bg-white/25'}`}
              style={{ height: `${bar * 3}px` }}
            />
          ))}
        </div>
        {showSurveillance && mode === 'owner' && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 ml-1"
            title="Live tracking active"
          />
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {variant === 'lock' && (
          <div className="w-24 h-7 bg-black rounded-full flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            <div className="w-16 h-4 rounded-full bg-black/50" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium text-white/70">{batteryLevel}%</span>
          <div className="relative w-6 h-3">
            <div className="absolute inset-0 border border-white/40 rounded-sm" />
            <div 
              className="absolute left-[1px] top-[1px] bottom-[1px] bg-white/80 rounded-sm transition-all"
              style={{ width: `${Math.max(0, batteryLevel * 0.22 - 2)}px` }}
            />
            <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-[5px] bg-white/40 rounded-r-sm" />
          </div>
        </div>

        <span className="text-sm font-semibold tabular-nums tracking-tight">
          {formatTime(time)}
        </span>
      </div>
    </div>
  );
}

export default StatusBar;
