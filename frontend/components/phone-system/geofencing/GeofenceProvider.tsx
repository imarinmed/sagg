"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type GeofenceMode = 'public' | 'student' | 'owner';
export type GeofenceLocation = 'town' | 'campus' | 'private';

interface GeofenceContextType {
  mode: GeofenceMode;
  setMode: (mode: GeofenceMode) => void;
  location: GeofenceLocation;
  isRestricted: boolean;
  canViewPhotos: boolean; // If true, allows access to full gallery/private photos
  canViewID: boolean;
  canViewSchedule: boolean;
  canTrackLocation: boolean;
}

const GeofenceContext = createContext<GeofenceContextType | undefined>(undefined);

const STORAGE_KEY = 'blod-geofence-mode';

export function GeofenceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<GeofenceMode>('public');
  const [location, setLocation] = useState<GeofenceLocation>('town');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'public' || stored === 'student' || stored === 'owner')) {
        setModeState(stored as GeofenceMode);
      }
    } catch (e) {
      console.warn('Failed to load geofence mode from storage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setMode = (newMode: GeofenceMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('Failed to save geofence mode to storage', e);
    }
  };

  useEffect(() => {
    switch (mode) {
      case 'public':
        setLocation('town');
        break;
      case 'student':
        setLocation('campus');
        break;
      case 'owner':
        setLocation('private');
        break;
    }
  }, [mode]);

  const permissions = useMemo(() => {
    const isPublic = mode === 'public';
    const isOwner = mode === 'owner';

    return {
      isRestricted: isPublic,
      canViewPhotos: !isPublic,
      canViewID: !isPublic,
      canViewSchedule: !isPublic,
      canTrackLocation: isOwner,
    };
  }, [mode]);

  const value = {
    mode,
    setMode,
    location,
    ...permissions
  };
  
  return (
    <GeofenceContext.Provider value={value}>
      {children}
    </GeofenceContext.Provider>
  );
}

export function useGeofence() {
  const context = useContext(GeofenceContext);
  if (context === undefined) {
    throw new Error('useGeofence must be used within a GeofenceProvider');
  }
  return context;
}
