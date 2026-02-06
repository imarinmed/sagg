'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Calendar, Battery, Signal, Wifi } from 'lucide-react';
import ChainHolster from '@/components/phone-system/phone-device/ChainHolster';
import PhoneLockScreen, { StudentData } from '@/components/phone-system/lock-screen/PhoneLockScreen';
import { PhotoItem } from '@/components/phone-system/lock-screen/PhotoGallery';
import { GeofenceMode } from '@/components/phone-system/lock-screen/IDOverlay';
import { TimeOfDay } from '@/components/phone-system/lock-screen/ClassStatusBar';

// Mock photos for the demo
const MOCK_PHOTOS: Record<string, PhotoItem[]> = {
  kiara: [
    {
      id: 'k1',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      context: 'portrait',
      contextLabel: 'Profilbild',
      quality: 'excellent',
      unlockedAt: 1
    },
    {
      id: 'k2',
      url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop',
      context: 'gym',
      contextLabel: 'Morgonträning',
      quality: 'good',
      unlockedAt: 2
    },
    {
      id: 'k3',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
      context: 'school',
      contextLabel: 'Lektion',
      quality: 'average',
      unlockedAt: 1
    }
  ],
  elise: [
    {
      id: 'e1',
      url: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop',
      context: 'portrait',
      contextLabel: 'Profilbild',
      quality: 'excellent',
      unlockedAt: 1
    },
    {
      id: 'e2',
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
      context: 'gym',
      contextLabel: 'Gym',
      quality: 'good',
      unlockedAt: 2
    }
  ],
  chloe: [
    {
      id: 'c1',
      url: 'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?q=80&w=1000&auto=format&fit=crop',
      context: 'portrait',
      contextLabel: 'Profilbild',
      quality: 'good',
      unlockedAt: 1
    }
  ],
  sophie: [
    {
      id: 's1',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop',
      context: 'portrait',
      contextLabel: 'Profilbild',
      quality: 'average',
      unlockedAt: 1
    }
  ]
};

interface PhoneViewProps {
  students: any[]; // Using any here to avoid circular deps with page.tsx types, but ideally should be shared
}

export default function PhoneView({ students }: PhoneViewProps) {
  const [selectedId, setSelectedId] = useState<string>('kiara');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [geofenceMode, setGeofenceMode] = useState<GeofenceMode>('student');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Get selected student data formatted for PhoneLockScreen
  const selectedStudent = useMemo((): StudentData | null => {
    const student = students.find(s => s.id === selectedId);
    if (!student) return null;

    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      nickname: student.id === 'kiara' ? 'Kiki' : undefined,
      family: 'Natt och Dag', // Mock data
      role: student.id === 'kiara' ? 'protagonist' : 'supporting',
      photos: MOCK_PHOTOS[student.id] || [],
      isReserved: student.id === 'elise',
      reservationDate: student.id === 'elise' ? '2024-05-20' : undefined,
      reservedBy: student.id === 'elise' ? 'Henry Vinter' : undefined
    };
  }, [students, selectedId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px]">
      {/* Left Column: Phone Mockup (60%) */}
      <div className="lg:col-span-7 flex items-center justify-center bg-[var(--color-bg-secondary)]/30 rounded-3xl p-8 border border-[var(--color-border)]">
        {selectedStudent ? (
          <ChainHolster 
            material={selectedStudent.id === 'kiara' ? 'gold' : 'silver'}
            chainStyle={selectedStudent.id === 'kiara' ? 'ornate' : 'simple'}
            isActive={true}
            className="scale-90 sm:scale-100"
          >
            <PhoneLockScreen
              student={selectedStudent}
              mode={geofenceMode}
              currentEpisode={currentEpisode}
              timeOfDay={timeOfDay}
              batteryLevel={87}
            />
          </ChainHolster>
        ) : (
          <div className="text-[var(--color-text-secondary)]">Välj en elev</div>
        )}
      </div>

      {/* Right Column: Controls (40%) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Sök elev..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--nordic-gold)]/50 transition-all"
          />
        </div>

        {/* Character List */}
        <div className="bg-[var(--color-bg-secondary)]/50 rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Tillgängliga Enheter
            </h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedId(student.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedId === student.id
                    ? 'bg-[var(--nordic-gold)]/10 border border-[var(--nordic-gold)]/30'
                    : 'hover:bg-[var(--color-bg-secondary)] border border-transparent'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  student.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 text-left">
                  <div className={`font-medium ${
                    selectedId === student.id ? 'text-[var(--nordic-gold)]' : 'text-[var(--color-text-primary)]'
                  }`}>
                    {student.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                    <span>{student.studentId}</span>
                    <span>•</span>
                    <span>Klass {student.companionClass}</span>
                  </div>
                </div>
                {selectedId === student.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--nordic-gold)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4 bg-[var(--color-bg-secondary)]/30 p-4 rounded-xl border border-[var(--color-border)]">
          
          {/* Episode Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Tidslinje</span>
              <span className="font-mono text-[var(--nordic-gold)]">Avsnitt {currentEpisode}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={currentEpisode}
              onChange={(e) => setCurrentEpisode(parseInt(e.target.value))}
              className="w-full accent-[var(--nordic-gold)]"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] font-mono">
              <span>S01E01</span>
              <span>S01E10</span>
            </div>
          </div>

          {/* Geofence Mode */}
          <div className="space-y-2">
            <span className="text-sm text-[var(--color-text-secondary)] block">Geofence Läge</span>
            <div className="grid grid-cols-3 gap-2">
              {(['public', 'student', 'owner'] as GeofenceMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGeofenceMode(mode)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    geofenceMode === mode
                      ? 'bg-[var(--nordic-gold)]/20 border-[var(--nordic-gold)] text-[var(--nordic-gold)]'
                      : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div className="space-y-2">
            <span className="text-sm text-[var(--color-text-secondary)] block">Tid på dygnet</span>
            <div className="grid grid-cols-4 gap-2">
              {(['morning', 'day', 'evening', 'night'] as TimeOfDay[]).map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeOfDay(time)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                    timeOfDay === time
                      ? 'bg-[var(--nordic-gold)]/20 border-[var(--nordic-gold)] text-[var(--nordic-gold)]'
                      : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                  }`}
                >
                  {time === 'dawn' && <span className="text-lg">🌅</span>}
                  {time === 'morning' && <span className="text-lg">🌄</span>}
                  {time === 'midday' && <span className="text-lg">☀️</span>}
                  {time === 'afternoon' && <span className="text-lg">🌤️</span>}
                  {time === 'evening' && <span className="text-lg">🌆</span>}
                  {time === 'night' && <span className="text-lg">🌙</span>}
                  <span className="text-[10px] mt-1 capitalize">{time}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
