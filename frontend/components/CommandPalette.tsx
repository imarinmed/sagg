'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Film, Map, ChevronRight, Command, Sparkles } from 'lucide-react';

export interface CommandItem {
  id: string;
  type: 'character' | 'episode' | 'action' | 'view';
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  metadata?: {
    family?: string;
    class?: string;
    episodeNumber?: string;
  };
}

interface CommandPaletteProps {
  items: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: CommandItem) => void;
  placeholder?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  character: <User className="w-4 h-4" />,
  episode: <Film className="w-4 h-4" />,
  action: <Sparkles className="w-4 h-4" />,
  view: <Map className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  character: 'Elev',
  episode: 'Avsnitt',
  action: 'Åtgärd',
  view: 'Vy',
};

export function CommandPalette({
  items,
  isOpen,
  onClose,
  onSelect,
  placeholder = 'Sök efter elev, avsnitt eller vy...',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>(items);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filterItems = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return items;
    
    const normalizedQuery = searchQuery.toLowerCase();
    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
      const subtitleMatch = item.subtitle?.toLowerCase().includes(normalizedQuery);
      const typeMatch = typeLabels[item.type].toLowerCase().includes(normalizedQuery);
      return titleMatch || subtitleMatch || typeMatch;
    });
  }, [items]);

  useEffect(() => {
    const filtered = filterItems(query);
    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [query, filterItems]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => prev < filteredItems.length - 1 ? prev + 1 : prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleSelect(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleSelect = (item: CommandItem) => {
    onSelect(item);
    item.action();
    onClose();
  };

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const groupOrder: Array<keyof typeof typeLabels> = ['character', 'episode', 'view', 'action'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
                <Search className="w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-lg outline-none font-body"
                />
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs bg-[var(--color-bg-tertiary)] rounded text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    ESC
                  </kbd>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </button>
                </div>
              </div>

              <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-[var(--color-text-muted)]">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Inga resultat hittades</p>
                    <p className="text-sm mt-1">Försök med en annan sökterm</p>
                  </div>
                ) : (
                  groupOrder.map((type) => {
                    const groupItems = groupedItems[type];
                    if (!groupItems || groupItems.length === 0) return null;

                    return (
                      <div key={type} className="mb-4">
                        <div className="px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                          {typeLabels[type]} ({groupItems.length})
                        </div>
                        {groupItems.map((item) => {
                          const globalIndex = filteredItems.findIndex(i => i.id === item.id);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-150 ${
                                isSelected
                                  ? 'bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30'
                                  : 'hover:bg-[var(--color-surface-hover)]'
                              }`}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`p-2 rounded-lg ${
                                isSelected 
                                  ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]'
                                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                              }`}>
                                {item.icon || typeIcons[item.type]}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium truncate ${
                                    isSelected ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'
                                  }`}>
                                    {item.title}
                                  </span>
                                  {item.metadata?.class && (
                                    <span className="px-2 py-0.5 text-xs bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] rounded-full">
                                      Klass {item.metadata.class}
                                    </span>
                                  )}
                                </div>
                                {item.subtitle && (
                                  <p className="text-sm text-[var(--color-text-muted)] truncate">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>

                              {item.metadata?.family && (
                                <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                                  {item.metadata.family}
                                </span>
                              )}

                              {item.shortcut && (
                                <kbd className="px-2 py-1 text-xs bg-[var(--color-bg-tertiary)] rounded text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                  {item.shortcut}
                                </kbd>
                              )}

                              <ChevronRight className={`w-4 h-4 transition-transform ${
                                isSelected ? 'text-[var(--color-accent-primary)] translate-x-1' : 'text-[var(--color-text-muted)]'
                              }`} />
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)]">↓</kbd>
                    <span className="ml-1">Navigera</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)]">↵</kbd>
                    <span className="ml-1">Välj</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Command className="w-3 h-3" />
                  <span>St. Cecilia Akademi</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useCommandPalette(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}

export default CommandPalette;
