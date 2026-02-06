'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Dumbbell, BookOpen, Sparkles, AlertCircle, Battery, Zap } from 'lucide-react';

export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

export interface NextActivity {
  type: 'class' | 'training' | 'gym' | 'spa' | 'social' | 'rest';
  name: string;
  location: string;
  timeUntil: string;
  isMandatory: boolean;
}

export interface ClassStatusBarProps {
  timeOfDay?: TimeOfDay;
  nextActivity?: NextActivity;
  batteryLevel?: number;
  isCharging?: boolean;
  className?: string;
}

const timeLabels: Record<TimeOfDay, { label: string; icon: React.ReactNode }> = {
  dawn: { label: 'Dawn', icon: '🌅' },
  morning: { label: 'Morning', icon: '🌄' },
  midday: { label: 'Midday', icon: '☀️' },
  afternoon: { label: 'Afternoon', icon: '🌤️' },
  evening: { label: 'Evening', icon: '🌆' },
  night: { label: 'Night', icon: '🌙' }
};

const activityIcons: Record<NextActivity['type'], React.ReactNode> = {
  class: <BookOpen className="w-3 h-3" />,
  training: <Dumbbell className="w-3 h-3" />,
  gym: <Dumbbell className="w-3 h-3" />,
  spa: <Sparkles className="w-3 h-3" />,
  social: <span className="text-xs">💬</span>,
  rest: <span className="text-xs">😴</span>
};

export function ClassStatusBar({
  timeOfDay = 'morning',
  nextActivity,
  batteryLevel = 100,
  isCharging = false,
  className = ''
}: ClassStatusBarProps) {
  const timeInfo = timeLabels[timeOfDay];
  const isLowBattery = batteryLevel < 20;

  return (
    <div 
      className={`flex flex-col gap-2 px-4 py-3 text-white w-full ${className}`}
      style={{ 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 100%)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg filter drop-shadow-sm">{timeInfo.icon}</span>
          <span className="text-sm font-medium text-white/90 tracking-wide">{timeInfo.label}</span>
        </div>

        <div className="flex items-center gap-2">
          {isLowBattery && !isCharging && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1 text-rose-400"
            >
              <AlertCircle className="w-3 h-3" />
            </motion.div>
          )}
          
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${isLowBattery ? 'text-rose-300' : 'text-white/80'}`}>
              {batteryLevel}%
            </span>
            <div className="relative">
              {isCharging && (
                <Zap className="w-3 h-3 text-yellow-400 absolute -left-3 top-0.5" />
              )}
              <div className={`w-6 h-3 border rounded-[3px] p-[1px] ${isLowBattery ? 'border-rose-400/50' : 'border-white/40'}`}>
                <div 
                  className={`h-full rounded-[1px] transition-all duration-500 ${
                    isLowBattery ? 'bg-rose-500' : 'bg-white/80'
                  }`}
                  style={{ width: `${Math.max(5, batteryLevel)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {nextActivity && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm
            border transition-colors duration-300
            ${nextActivity.isMandatory 
              ? 'bg-amber-500/10 text-amber-100 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
              : 'bg-white/5 text-white/80 border-white/10'
            }
          `}
        >
          <div className={`
            p-1 rounded-md 
            ${nextActivity.isMandatory ? 'bg-amber-500/20 text-amber-200' : 'bg-white/10 text-white'}
          `}>
            {activityIcons[nextActivity.type]}
          </div>
          
          <div className="flex flex-col leading-none gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-wide">{nextActivity.name}</span>
              {nextActivity.isMandatory && (
                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-200 border border-amber-500/20 uppercase tracking-wider">
                  Mandatory
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] opacity-80">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {nextActivity.location}
              </span>
              <span>•</span>
              <span>in {nextActivity.timeUntil}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ClassStatusBar;
