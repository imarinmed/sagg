'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Calendar, 
  BarChart3, 
  MessageCircle, 
  Map, 
  AlertCircle, 
  BookOpen, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { ClassStatusBar, TimeOfDay } from '../lock-screen/ClassStatusBar';
import { TouchGestureZone } from '../../MobileSystem';

export interface PhoneHomeScreenProps {
  timeOfDay: TimeOfDay;
  onAppOpen: (appId: string) => void;
  onLockScreen: () => void;
}

const SCHOOL_APPS = [
  { id: 'portal', name: 'Portal', icon: Building, color: 'bg-blue-500', description: 'Student profile & assessments' },
  { id: 'schedule', name: 'Schedule', icon: Calendar, color: 'bg-green-500', description: 'Daily training schedule' },
  { id: 'stats', name: 'Stats', icon: BarChart3, color: 'bg-purple-500', description: 'Rankings & analytics' },
  { id: 'social', name: 'Social', icon: MessageCircle, color: 'bg-pink-500', description: 'Messages' },
  { id: 'map', name: 'Map', icon: Map, color: 'bg-orange-500', description: 'Campus navigation' },
  { id: 'sos', name: 'SOS', icon: AlertCircle, color: 'bg-red-500', description: 'Emergency' },
  { id: 'library', name: 'Library', icon: BookOpen, color: 'bg-amber-500', description: 'Academic resources' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-gray-500', description: 'Phone settings' },
];

export function PhoneHomeScreen({
  timeOfDay,
  onAppOpen,
  onLockScreen
}: PhoneHomeScreenProps) {
  return (
    <TouchGestureZone 
      onSwipeDown={onLockScreen}
      className="h-full w-full bg-black text-white flex flex-col relative overflow-hidden"
    >
      <div className="z-10">
        <ClassStatusBar timeOfDay={timeOfDay} />
      </div>

      <div className="flex-1 flex flex-col p-6 pt-12 gap-8">
        
        <div className="grid grid-cols-4 gap-x-4 gap-y-8">
          {SCHOOL_APPS.map((app, index) => (
            <motion.button
              key={app.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAppOpen(app.id)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`
                w-14 h-14 rounded-2xl ${app.color} 
                flex items-center justify-center 
                shadow-lg shadow-black/50
                group-hover:brightness-110 transition-all
              `}>
                <app.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-medium text-white/90 tracking-wide text-center leading-tight">
                {app.name}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mt-auto mb-8 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1 opacity-40">
            <ChevronDown className="w-5 h-5 animate-bounce" />
            <span className="text-[10px] font-medium tracking-wider uppercase">Swipe to lock</span>
          </div>

          <div className="px-4 py-2 rounded-full bg-red-950/30 border border-red-900/30 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-200/70 font-medium tracking-wider uppercase">
              Monitored by Academy AI
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-900/50 to-black z-0" />
    </TouchGestureZone>
  );
}

export default PhoneHomeScreen;
