"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type NarrativeVersion = "bst" | "sst";

interface NarrativeContextType {
  version: NarrativeVersion;
  setVersion: (v: NarrativeVersion) => void;
  toggleVersion: () => void;
  isBST: boolean;
  isSST: boolean;
}

const NarrativeContext = createContext<NarrativeContextType | undefined>(undefined);

const STORAGE_KEY = "blod-narrative-version";
const CONSENT_KEY = "blod-sst-consent";

export function NarrativeProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<NarrativeVersion>("bst");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "bst" || stored === "sst") {
        setVersionState(stored as NarrativeVersion);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const setVersion = (v: NarrativeVersion) => {
    setVersionState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleVersion = () => {
    const newVersion = version === "bst" ? "sst" : "bst";
    
    if (newVersion === "sst") {
      try {
        const hasConsent = localStorage.getItem(CONSENT_KEY);
        if (!hasConsent) {
          return; 
        }
      } catch (e) {
        console.warn(e);
        return;
      }
    }
    
    setVersion(newVersion);
  };

  const value = {
    version,
    setVersion,
    toggleVersion,
    isBST: version === "bst",
    isSST: version === "sst",
  };

  return (
    <NarrativeContext.Provider value={value}>
      {children}
    </NarrativeContext.Provider>
  );
}

export function useNarrative() {
  const context = useContext(NarrativeContext);
  if (context === undefined) {
    throw new Error("useNarrative must be used within a NarrativeProvider");
  }
  return context;
}

export function getStoredConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

export function setStoredConsent(consent: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (consent) {
      localStorage.setItem(CONSENT_KEY, "true");
    } else {
      localStorage.removeItem(CONSENT_KEY);
    }
  } catch (e) {
    console.warn("Failed to save consent", e);
  }
}
