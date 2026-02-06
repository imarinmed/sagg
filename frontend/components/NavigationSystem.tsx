'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Map, Users, Clock, Sparkles, Smartphone } from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem) => void;
  className?: string;
}

export function Breadcrumbs({ items, onNavigate, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      <button
        onClick={() => onNavigate?.({ id: 'home', label: 'Hem', href: '/' })}
        className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Hem</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          <motion.button
            onClick={() => onNavigate?.(item)}
            className={`flex items-center gap-1 transition-colors ${
              index === items.length - 1
                ? 'text-[var(--color-accent-primary)] font-medium'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
            whileHover={{ x: 2 }}
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
          </motion.button>
        </React.Fragment>
      ))}
    </nav>
  );
}

export interface MiniMapProps {
  viewport: { x: number; y: number; width: number; height: number };
  worldBounds: { width: number; height: number };
  nodes: { id: string; x: number; y: number; color: string }[];
  onViewportChange?: (x: number, y: number) => void;
  className?: string;
}

export function MiniMap({
  viewport,
  worldBounds,
  nodes,
  onViewportChange,
  className = ''
}: MiniMapProps) {
  const scale = Math.min(150 / worldBounds.width, 100 / worldBounds.height);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * worldBounds.width - viewport.width / 2;
    const y = ((e.clientY - rect.top) / rect.height) * worldBounds.height - viewport.height / 2;
    onViewportChange?.(Math.max(0, Math.min(x, worldBounds.width - viewport.width)), Math.max(0, Math.min(y, worldBounds.height - viewport.height)));
  };

  return (
    <div className={`glass rounded-xl p-2 ${className}`}>
      <div className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
        <Map className="w-3 h-3" />
        Översikt
      </div>

      <div
        className="relative bg-[var(--color-bg-tertiary)] rounded-lg overflow-hidden cursor-crosshair"
        style={{ width: 150, height: 100 }}
        onClick={handleClick}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${(node.x / worldBounds.width) * 100}%`,
              top: `${(node.y / worldBounds.height) * 100}%`,
              backgroundColor: node.color,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        <div
          className="absolute border-2 border-[var(--color-accent-primary)] rounded bg-[var(--color-accent-primary)]/10"
          style={{
            left: `${(viewport.x / worldBounds.width) * 100}%`,
            top: `${(viewport.y / worldBounds.height) * 100}%`,
            width: `${(viewport.width / worldBounds.width) * 100}%`,
            height: `${(viewport.height / worldBounds.height) * 100}%`
          }}
        />
      </div>
    </div>
  );
}

export interface NavigationShortcutsProps {
  onNavigate?: (view: 'cards' | 'graph' | 'timeline' | 'families' | 'phone') => void;
  currentView?: string;
  className?: string;
}

export function NavigationShortcuts({ onNavigate, currentView, className = '' }: NavigationShortcutsProps) {
  const shortcuts = [
    { id: 'cards', label: 'Kort', icon: <Users className="w-4 h-4" />, key: '1' },
    { id: 'phone', label: 'Telefon', icon: <Smartphone className="w-4 h-4" />, key: '2' },
    { id: 'graph', label: 'Graf', icon: <Map className="w-4 h-4" />, key: '3' },
    { id: 'timeline', label: 'Tidslinje', icon: <Clock className="w-4 h-4" />, key: '4' },
    { id: 'families', label: 'Familjer', icon: <Sparkles className="w-4 h-4" />, key: '5' }
  ] as const;

  return (
    <div className={`glass rounded-xl p-2 ${className}`}>
      <div className="text-xs text-[var(--color-text-muted)] mb-2">
        Snabbnavigering
      </div>

      <div className="grid grid-cols-2 gap-1">
        {shortcuts.map((shortcut) => (
          <motion.button
            key={shortcut.id}
            onClick={() => onNavigate?.(shortcut.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
              currentView === shortcut.id
                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {shortcut.icon}
            <span className="flex-1 text-left">{shortcut.label}</span>
            <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-[10px]">
              {shortcut.key}
            </kbd>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export interface ViewStatePersistenceProps {
  currentState: {
    view: string;
    episode?: string;
    filters?: string[];
    zoom?: number;
  };
  savedStates: { name: string; state: object }[];
  onSaveState?: (name: string) => void;
  onLoadState?: (index: number) => void;
  className?: string;
}

export function ViewStatePersistence({
  currentState,
  savedStates,
  onSaveState,
  onLoadState,
  className = ''
}: ViewStatePersistenceProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        Sparade Vyer ({savedStates.length})
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full right-0 mt-2 w-64 glass rounded-xl p-3 z-50"
          >
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedStates.map((saved, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onLoadState?.(index);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="text-sm text-[var(--color-text-primary)]">{saved.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {Object.entries(saved.state).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </div>
                </button>
              ))}

              {savedStates.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  Inga sparade vyer
                </p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Namn på vy..."
                  className="flex-1 px-3 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm outline-none"
                />
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      onSaveState?.(newName.trim());
                      setNewName('');
                    }
                  }}
                  disabled={!newName.trim()}
                  className="px-3 py-2 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg text-sm disabled:opacity-50"
                >
                  Spara
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default { Breadcrumbs, MiniMap, NavigationShortcuts, ViewStatePersistence };
