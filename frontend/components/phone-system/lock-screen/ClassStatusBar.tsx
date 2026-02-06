'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Dumbbell, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

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
  dawn: { label: 'Dawn', icon: <span>🌅</span> },
  morning: { label: 'Morning', icon: <span>🌄</span> },
  midday: { label: 'Midday', icon: <span>☀️</span> },
  afternoon: { label: 'Afternoon', icon: <span>🌤️</span> },
  evening: { label: 'Evening', icon: <span>🌆</span> },
  night: { label: 'Night', icon: <span>🌙</span> }
};

const activityIcons: Record<NextActivity['type'], React.ReactNode> = {
  class: <BookOpen className="w-3 h-3" />,
  training: <Dumbbell className="w-3 h-3" />,
  gym: <Dumbbell className="w-3 h-3" />,
  spa: <Sparkles className="w-3 h-3" />,
  social: <span>💬</span>,
  rest: <span>😴</span>
};

export function ClassStatusBar({
  timeOfDay = 'morning',
  nextActivity,
  batteryLevel = 45,
  isCharging = false,
  className = ''
}: ClassStatusBarProps) {
  const timeInfo = timeLabels[timeOfDay];

  return (
    <div 
      className={`flex flex-col gap-2 px-4 py-3 text-white ${className}`}
      style={{ 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{timeInfo.icon}</span>
          <span className="text-sm font-medium text-white/90">{timeInfo.label}</span>
        </div>

        <div className="flex items-center gap-2">
          {batteryLevel < 20 && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 text-rose-400"
            >
              <AlertCircle className="w-3 h-3" />
              <span className="text-[10px]">Low</span>
            </motion.div>
          )}
          <div className="w-5 h-2.5 border border-white/40 rounded-sm relative">
            <div 
              className={`absolute left-[1px] top-[1px] bottom-[1px] rounded-sm ${
                batteryLevel < 20 ? 'bg-rose-400' : 'bg-white/60'
              }`}
              style={{ width: `${Math.max(0, batteryLevel * 0.18)}px` }}
            />
          </div>
        </div>
      </div>

      {nextActivity && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
            ${nextActivity.isMandatory 
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' 
              : 'bg-white/10 text-white/70'
            }
          `}
        >
          {activityIcons[nextActivity.type]}
          <span className="font-medium">{nextActivity.name}</span>
          <span className="text-white/50">•</span>
          <MapPin className="w-3 h-3 opacity-70" />
          <span className="opacity-70">{nextActivity.location}</span>
          <span className="ml-auto text-white/50">{nextActivity.timeUntil}</span>
        </motion.div>
      )}
    </div>
  );
}

export default ClassStatusBar;
