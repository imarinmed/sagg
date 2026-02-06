'use client';

import { useState, useCallback, useEffect } from 'react';

export type ViewMode = 'cards' | 'graph' | 'timeline' | 'split' | 'phone';
export type CardViewMode = 'portrait' | 'compact' | 'list';
export type GraphLayout = 'force' | 'hierarchical' | 'circular' | 'clustered';
export type TimelineZoom = 'episode' | 'season' | 'series';
export type SpoilerLevel = 'hidden' | 'hinted' | 'revealed';

export interface ViewState {
  mode: ViewMode;
  cardMode: CardViewMode;
  graphLayout: GraphLayout;
  timelineZoom: TimelineZoom;
  spoilerLevel: SpoilerLevel;
  selectedCharacterIds: string[];
  selectedEpisodeId: string | null;
  hoveredCharacterId: string | null;
  focusedFamilyId: string | null;
  showConnections: boolean;
  connectionTypes: string[];
  sidebarOpen: boolean;
  detailsPanelOpen: boolean;
}

const STORAGE_KEY = 'blod-character-map-view-state';

const defaultState: ViewState = {
  mode: 'cards',
  cardMode: 'portrait',
  graphLayout: 'clustered',
  timelineZoom: 'episode',
  spoilerLevel: 'hinted',
  selectedCharacterIds: [],
  selectedEpisodeId: null,
  hoveredCharacterId: null,
  focusedFamilyId: null,
  showConnections: true,
  connectionTypes: ['romantic', 'familial', 'training', 'blood-bond'],
  sidebarOpen: true,
  detailsPanelOpen: false,
};

export function useViewState() {
  const [state, setState] = useState<ViewState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      console.warn('Failed to load view state from localStorage');
    }
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.warn('Failed to save view state to localStorage');
    }
  }, [state, isHydrated]);

  const setMode = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setCardMode = useCallback((cardMode: CardViewMode) => {
    setState(prev => ({ ...prev, cardMode }));
  }, []);

  const setGraphLayout = useCallback((graphLayout: GraphLayout) => {
    setState(prev => ({ ...prev, graphLayout }));
  }, []);

  const setTimelineZoom = useCallback((timelineZoom: TimelineZoom) => {
    setState(prev => ({ ...prev, timelineZoom }));
  }, []);

  const setSpoilerLevel = useCallback((spoilerLevel: SpoilerLevel) => {
    setState(prev => ({ ...prev, spoilerLevel }));
  }, []);

  const selectCharacter = useCallback((characterId: string, multiSelect = false) => {
    setState(prev => {
      if (multiSelect) {
        const exists = prev.selectedCharacterIds.includes(characterId);
        if (exists) {
          return {
            ...prev,
            selectedCharacterIds: prev.selectedCharacterIds.filter(id => id !== characterId),
          };
        }
        return {
          ...prev,
          selectedCharacterIds: [...prev.selectedCharacterIds, characterId],
        };
      }
      return {
        ...prev,
        selectedCharacterIds: [characterId],
        detailsPanelOpen: true,
      };
    });
  }, []);

  const clearCharacterSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCharacterIds: [],
      detailsPanelOpen: false,
    }));
  }, []);

  const setHoveredCharacter = useCallback((characterId: string | null) => {
    setState(prev => ({ ...prev, hoveredCharacterId: characterId }));
  }, []);

  const focusFamily = useCallback((familyId: string | null) => {
    setState(prev => ({
      ...prev,
      focusedFamilyId: familyId,
      mode: familyId ? 'graph' : prev.mode,
    }));
  }, []);

  const toggleConnections = useCallback(() => {
    setState(prev => ({ ...prev, showConnections: !prev.showConnections }));
  }, []);

  const setConnectionTypes = useCallback((types: string[]) => {
    setState(prev => ({ ...prev, connectionTypes: types }));
  }, []);

  const toggleConnectionType = useCallback((type: string) => {
    setState(prev => {
      const exists = prev.connectionTypes.includes(type);
      if (exists) {
        return {
          ...prev,
          connectionTypes: prev.connectionTypes.filter(t => t !== type),
        };
      }
      return {
        ...prev,
        connectionTypes: [...prev.connectionTypes, type],
      };
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const toggleDetailsPanel = useCallback(() => {
    setState(prev => ({ ...prev, detailsPanelOpen: !prev.detailsPanelOpen }));
  }, []);

  const selectEpisode = useCallback((episodeId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedEpisodeId: episodeId,
      mode: episodeId ? 'timeline' : prev.mode,
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    state,
    isHydrated,
    setMode,
    setCardMode,
    setGraphLayout,
    setTimelineZoom,
    setSpoilerLevel,
    selectCharacter,
    clearCharacterSelection,
    setHoveredCharacter,
    focusFamily,
    toggleConnections,
    setConnectionTypes,
    toggleConnectionType,
    toggleSidebar,
    toggleDetailsPanel,
    selectEpisode,
    resetToDefaults,
  };
}

export function useKeyboardShortcuts({
  onToggleCommandPalette,
  onToggleSidebar,
  onToggleFilters,
  onResetView,
  onToggleConnections,
}: {
  onToggleCommandPalette: () => void;
  onToggleSidebar: () => void;
  onToggleFilters: () => void;
  onResetView: () => void;
  onToggleConnections: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            onToggleCommandPalette();
            break;
          case 'b':
            e.preventDefault();
            onToggleSidebar();
            break;
          case 'f':
            e.preventDefault();
            onToggleFilters();
            break;
          case '0':
            e.preventDefault();
            onResetView();
            break;
        }
      } else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          onToggleConnections();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCommandPalette, onToggleSidebar, onToggleFilters, onResetView, onToggleConnections]);
}

export default useViewState;
