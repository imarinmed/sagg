'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Keyboard, 
  Eye, 
  Volume2, 
  Focus,
  AlertCircle
} from 'lucide-react';

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface AccessibilitySettings {
  keyboardNavigation: boolean;
  screenReaderAnnouncements: boolean;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  colorblindMode: ColorblindMode;
}

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  settings?: AccessibilitySettings;
}

const defaultSettings: AccessibilitySettings = {
  keyboardNavigation: true,
  screenReaderAnnouncements: true,
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  colorblindMode: 'none'
};

export function AccessibilityProvider({ 
  children, 
  settings = defaultSettings 
}: AccessibilityProviderProps) {
  useEffect(() => {
    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.colorblindMode !== 'none') {
      document.documentElement.classList.add(`colorblind-${settings.colorblindMode}`);
    }

    return () => {
      document.documentElement.classList.remove(
        'reduce-motion',
        'large-text',
        'high-contrast',
        `colorblind-${settings.colorblindMode}`
      );
    };
  }, [settings]);

  return (
    <div 
      role="application"
      aria-label="Blod Wiki Character Map"
      className={settings.largeText ? 'text-lg' : ''}
    >
      {children}
    </div>
  );
}

export interface KeyboardNavigationProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onEscape?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function KeyboardNavigation({
  onNavigate,
  onSelect,
  onEscape,
  children,
  className = ''
}: KeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate?.('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate?.('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate?.('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate?.('right');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.();
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onSelect, onEscape]);

  return (
    <div 
      role="region"
      aria-label="Keyboard navigation area"
      tabIndex={0}
      className={`outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] ${className}`}
    >
      {children}
    </div>
  );
}

export interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite' 
}: ScreenReaderAnnouncementProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  className?: string;
}

export function AccessibilityPanel({ 
  settings, 
  onSettingsChange,
  className = '' 
}: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const colorblindOptions: { value: ColorblindMode; label: string }[] = [
    { value: 'none', label: 'Normal' },
    { value: 'protanopia', label: 'Protanopi (röd)' },
    { value: 'deuteranopia', label: 'Deuteranopi (grön)' },
    { value: 'tritanopia', label: 'Tritanopi (blå)' },
    { value: 'achromatopsia', label: 'Akromatopsi (ingen färg)' }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Tillgänglighetsinställningar"
        aria-expanded={isOpen}
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">Tillgänglighet</span>
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
            className="absolute top-full right-0 mt-2 w-80 glass rounded-xl p-4 z-50 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-label="Tillgänglighetsinställningar"
          >
            <h3 className="text-lg font-heading text-[var(--color-text-primary)] mb-4">
              Tillgänglighet
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm">Tangentbordsnavigering</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={() => toggleSetting('keyboardNavigation')}
                    className="w-4 h-4 accent-[var(--color-accent-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm">Skärmläsarannonsering</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.screenReaderAnnouncements}
                    onChange={() => toggleSetting('screenReaderAnnouncements')}
                    className="w-4 h-4 accent-[var(--color-accent-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm">Hög kontrast</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={() => toggleSetting('highContrast')}
                    className="w-4 h-4 accent-[var(--color-accent-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm">Stor text</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.largeText}
                    onChange={() => toggleSetting('largeText')}
                    className="w-4 h-4 accent-[var(--color-accent-primary)]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Focus className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm">Minska rörelse</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={() => toggleSetting('reduceMotion')}
                    className="w-4 h-4 accent-[var(--color-accent-primary)]"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Färgblindhetsläge
                </label>
                <select
                  value={settings.colorblindMode}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    colorblindMode: e.target.value as ColorblindMode
                  })}
                  className="w-full px-3 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm outline-none border border-[var(--color-border)] focus:border-[var(--color-accent-primary)]"
                >
                  {colorblindOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

export interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, isActive, onEscape }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    firstElement?.focus();
    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscape);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscape);
    };
  }, [isActive, onEscape]);

  if (!isActive) return <>{children}</>;

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}

export default { 
  AccessibilityProvider, 
  KeyboardNavigation, 
  ScreenReaderAnnouncement,
  AccessibilityPanel,
  FocusTrap
};
