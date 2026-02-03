/**
 * Theme System for Blod Visual Redesign
 * Three selectable themes: Gothic, Luxury, Nordic
 */

export type Theme = 'gothic' | 'luxury' | 'nordic';

export const THEMES: Record<Theme, { name: string; description: string }> = {
  gothic: {
    name: 'Classic Gothic',
    description: 'Deep blacks with antique gold and crimson accents',
  },
  luxury: {
    name: 'Modern Luxury',
    description: 'Charcoal elegance with champagne gold and burgundy',
  },
  nordic: {
    name: 'Nordic Noir',
    description: 'Blue-black depths with rose gold and dried blood',
  },
};

export const DEFAULT_THEME: Theme = 'gothic';
export const THEME_STORAGE_KEY = 'blod-theme';

/**
 * Get the current theme from localStorage
 * Returns default theme if none stored or invalid
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && (stored === 'gothic' || stored === 'luxury' || stored === 'nordic')) {
    return stored as Theme;
  }
  return DEFAULT_THEME;
}

/**
 * Set the theme in localStorage and apply to document
 * Uses smooth transition unless reduced motion is preferred
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', theme);

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Apply theme immediately without React (for script injection)
 * This prevents flash of wrong theme on page load
 */
export function applyThemeImmediately(): void {
  if (typeof window === 'undefined') return;
  
  const theme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Get all available themes for UI display
 */
export function getAvailableThemes(): Array<{ id: Theme; name: string; description: string }> {
  return Object.entries(THEMES).map(([id, config]) => ({
    id: id as Theme,
    name: config.name,
    description: config.description,
  }));
}

/**
 * Theme script to inject in <head> to prevent flash
 * This runs before React hydration
 */
export const THEME_SCRIPT = `
  (function() {
    try {
      const theme = localStorage.getItem('${THEME_STORAGE_KEY}') || '${DEFAULT_THEME}';
      if (theme === 'gothic' || theme === 'luxury' || theme === 'nordic') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
    }
  })();
`;
