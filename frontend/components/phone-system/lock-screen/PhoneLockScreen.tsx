'use client';

import React, { useState } from 'react';
import { ClassStatusBar, TimeOfDay, NextActivity } from './ClassStatusBar';
import { PhotoGallery, PhotoContext, PhotoItem } from './PhotoGallery';
import { IDOverlay, GeofenceMode } from './IDOverlay';

export interface StudentData {
  id: string;
  studentId: string;
  name: string;
  nickname?: string;
  family?: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  photos: PhotoItem[];
  isReserved?: boolean;
  reservationDate?: string;
  reservedBy?: string;
}

export interface PhoneLockScreenProps {
  student: StudentData;
  mode?: GeofenceMode;
  currentEpisode?: number;
  timeOfDay?: TimeOfDay;
  nextActivity?: NextActivity;
  batteryLevel?: number;
  onSwipeUp?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export function PhoneLockScreen({
  student,
  mode = 'student',
  currentEpisode = 1,
  timeOfDay = 'morning',
  nextActivity,
  batteryLevel = 87,
  onSwipeUp,
  onLongPress,
  className = ''
}: PhoneLockScreenProps) {
  const [currentContext, setCurrentContext] = useState<PhotoContext>('portrait');

  const getDisplayName = () => {
    if (student.nickname) return student.nickname;
    
    if (currentEpisode >= 10) return "KK";
    if (currentEpisode >= 6) return "Kiki";
    if (currentEpisode >= 3) return "Kia";
    
    return student.name;
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <ClassStatusBar 
          timeOfDay={timeOfDay}
          nextActivity={nextActivity}
          batteryLevel={batteryLevel}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <PhotoGallery
          photos={student.photos}
          currentContext={currentContext}
          onContextChange={setCurrentContext}
          currentEpisode={currentEpisode}
          onSwipeUp={onSwipeUp}
          onLongPress={onLongPress}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <IDOverlay
          studentId={student.studentId}
          name={getDisplayName()}
          family={student.family}
          isReserved={student.isReserved}
          reservationDate={student.reservationDate}
          reservedBy={student.reservedBy}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default PhoneLockScreen;
