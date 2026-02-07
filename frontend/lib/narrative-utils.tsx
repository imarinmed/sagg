"use client";

import { useNarrative, type NarrativeVersion } from './narrative-context';
import type { ReactNode } from 'react';

// Re-export hook for convenience
export { useNarrative, type NarrativeVersion };

// Helper functions
export const isBSTMode = (version: NarrativeVersion): boolean => version === 'bst';
export const isSSTMode = (version: NarrativeVersion): boolean => version === 'sst';

// Conditional rendering wrapper (opt-in)
interface ShowInVersionProps {
  version: NarrativeVersion | 'both';
  children: ReactNode;
}

export function ShowInVersion({ version, children }: ShowInVersionProps) {
  const { version: currentVersion } = useNarrative();

  if (version === 'both') return <>{children}</>;
  if (currentVersion === version) return <>{children}</>;

  return null;
}

// Inverse conditional wrapper (opt-in)
interface HideInVersionProps {
  version: NarrativeVersion;
  children: ReactNode;
}

export function HideInVersion({ version, children }: HideInVersionProps) {
  const { version: currentVersion } = useNarrative();

  if (currentVersion !== version) return <>{children}</>;

  return null;
}
