'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneLockScreen,
  ChainHolster,
  type GeofenceMode,
  type PhotoContext,
  type StudentData,
  type PhotoItem,
  type TimeOfDay,
  type NextActivity,
  type HolsterMaterial
} from '@/components/phone-system';

type ActivityKey = 'class' | 'gym' | 'meal' | 'sleep' | 'free' | 'transit';

const ACTIVITIES: Record<ActivityKey, NextActivity> = {
  class: {
    type: 'class',
    name: 'Advanced Studies',
    location: 'Lecture Hall A',
    timeUntil: '45 minutes',
    isMandatory: true
  },
  gym: {
    type: 'training',
    name: 'Gym Training',
    location: 'Athletic Complex',
    timeUntil: '2 hours',
    isMandatory: true
  },
  meal: {
    type: 'rest',
    name: 'Meal Time',
    location: 'Dining Hall',
    timeUntil: '30 minutes',
    isMandatory: false
  },
  sleep: {
    type: 'rest',
    name: 'Sleep',
    location: 'Dormitory',
    timeUntil: '8 hours',
    isMandatory: true
  },
  free: {
    type: 'social',
    name: 'Free Time',
    location: 'Campus',
    timeUntil: '1 hour',
    isMandatory: false
  },
  transit: {
    type: 'gym',
    name: 'Transit',
    location: 'Between Locations',
    timeUntil: '15 minutes',
    isMandatory: false
  }
};

const KIARA_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    context: 'portrait',
    contextLabel: 'Official Portrait',
    quality: 'poor',
    unlockedAt: 1,
    allure: 65,
    sensuality: 40
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
    context: 'gym',
    contextLabel: 'Gym Session',
    quality: 'average',
    unlockedAt: 3,
    allure: 75,
    sensuality: 60
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop',
    context: 'school',
    contextLabel: 'Campus Grounds',
    quality: 'good',
    unlockedAt: 6,
    allure: 85,
    sensuality: 70
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop',
    context: 'spa',
    contextLabel: 'Wellness Center',
    quality: 'excellent',
    unlockedAt: 8,
    allure: 95,
    sensuality: 90
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=800&auto=format&fit=crop',
    context: 'class',
    contextLabel: 'Advanced Studies',
    quality: 'excellent',
    unlockedAt: 10,
    allure: 98,
    sensuality: 85
  }
];

const KIARA_DATA: StudentData = {
  id: 'kiara',
  studentId: 'STD-24-KND-001',
  name: 'Kiara',
  family: 'Natt och Dag',
  role: 'protagonist',
  photos: KIARA_PHOTOS,
  isReserved: true,
  reservationDate: '2026-02-14',
  reservedBy: 'Desirée Natt och Dag'
};

const ControlSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-xs uppercase tracking-wider text-white/50 font-medium">{title}</h3>
    {children}
  </div>
);

const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-2">
    {children}
  </div>
);

const ToggleButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-white text-black shadow-lg shadow-white/10' 
        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
    `}
  >
    {children}
  </button>
);

export default function PhoneDemoPage() {
  const [episode, setEpisode] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [mode, setMode] = useState<GeofenceMode>('student');
  const [activityKey, setActivityKey] = useState<ActivityKey>('class');
  const [holsterMaterial, setHolsterMaterial] = useState<HolsterMaterial>('silver');
  const [isChainActive, setIsChainActive] = useState(false);

  const nextActivity = ACTIVITIES[activityKey];

  const currentPhotos = KIARA_PHOTOS.map(p => ({
    ...p,
    quality: episode >= 8 ? 'excellent' : episode >= 5 ? 'good' : episode >= 3 ? 'average' : 'poor'
  })) as PhotoItem[];

  const studentData: StudentData = {
    ...KIARA_DATA,
    photos: currentPhotos
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative bg-gradient-to-br from-neutral-900 to-black">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000
            ${holsterMaterial === 'gold' ? 'bg-amber-500' : 
              holsterMaterial === 'rose-gold' ? 'bg-rose-500' : 
              holsterMaterial === 'obsidian' ? 'bg-blue-900' : 'bg-slate-500'}
          `} />
        </div>

        <div className="relative z-10 scale-90 lg:scale-100">
          <ChainHolster 
            material={holsterMaterial}
            isActive={isChainActive}
            onChainClick={() => setIsChainActive(!isChainActive)}
          >
            <PhoneLockScreen
              student={studentData}
              mode={mode}
              currentEpisode={episode}
              timeOfDay={timeOfDay}
              nextActivity={nextActivity}
              batteryLevel={87}
              onSwipeUp={() => console.log('Swipe Up Triggered')}
              onLongPress={() => console.log('Long Press Triggered')}
            />
          </ChainHolster>
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-neutral-900/50 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col gap-8 overflow-y-auto h-[50vh] lg:h-screen">
        
        <div className="space-y-2">
          <h1 className="text-2xl font-light tracking-tight">Vinterhall Phone System</h1>
          <p className="text-sm text-white/40">Interactive Demo • v1.0</p>
        </div>

        <div className="space-y-8">
          
          <ControlSection title={`Timeline: Episode ${episode}`}>
            <input
              type="range"
              min="1"
              max="10"
              value={episode}
              onChange={(e) => setEpisode(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-xs text-white/30 font-mono">
              <span>EP 01</span>
              <span>EP 05</span>
              <span>EP 10</span>
            </div>
            <p className="text-xs text-white/50 italic">
              Adjusts photo availability, quality, and nickname evolution.
            </p>
          </ControlSection>

          <ControlSection title="Time of Day">
            <ButtonGroup>
              {(['dawn', 'morning', 'midday', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map((t) => (
                <ToggleButton 
                  key={t} 
                  active={timeOfDay === t} 
                  onClick={() => setTimeOfDay(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </ControlSection>

          <ControlSection title="Geofence Mode">
            <div className="flex p-1 bg-white/5 rounded-lg">
              {(['public', 'student', 'owner'] as GeofenceMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    flex-1 py-2 text-sm font-medium rounded-md transition-all
                    ${mode === m 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-white/40 hover:text-white/60'}
                  `}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </ControlSection>

           <ControlSection title="Next Activity">
             <select
               value={activityKey}
               onChange={(e) => setActivityKey(e.target.value as ActivityKey)}
               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
             >
               <option value="class">Class</option>
               <option value="gym">Gym Training</option>
               <option value="meal">Meal Time</option>
               <option value="sleep">Sleep</option>
               <option value="free">Free Time</option>
               <option value="transit">Transit</option>
             </select>
           </ControlSection>

          <ControlSection title="Chain Holster Material">
            <div className="flex gap-4">
              {(['silver', 'gold', 'obsidian', 'rose-gold'] as HolsterMaterial[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setHolsterMaterial(m)}
                  className={`
                    w-12 h-12 rounded-full border-2 transition-all duration-300 relative
                    ${holsterMaterial === m ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}
                  `}
                  title={m}
                >
                  <div className={`
                    absolute inset-1 rounded-full
                    ${m === 'silver' ? 'bg-gradient-to-br from-slate-200 to-slate-400' :
                      m === 'gold' ? 'bg-gradient-to-br from-amber-200 to-amber-500' :
                      m === 'obsidian' ? 'bg-gradient-to-br from-slate-700 to-black' :
                      'bg-gradient-to-br from-rose-200 to-rose-400'}
                  `} />
                </button>
              ))}
            </div>
          </ControlSection>

          <ControlSection title="Physics">
            <button
              onClick={() => setIsChainActive(!isChainActive)}
              className={`
                w-full py-3 rounded-lg text-sm font-medium transition-all
                ${isChainActive 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-white hover:bg-white/10'}
              `}
            >
              {isChainActive ? 'Stop Motion' : 'Simulate Motion'}
            </button>
          </ControlSection>

        </div>
      </div>
    </div>
  );
}
