/**
 * Animation System for Blod Visual Redesign
 * Utilities for theme transitions, hover effects, and page load orchestration
 * Respects prefers-reduced-motion
 */

// ============================================
// ANIMATION TIMING CONSTANTS
// ============================================

export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const EASING = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const STAGGER = {
  delay: 50,
  maxDelay: 500,
} as const;

// ============================================
// REDUCED MOTION DETECTION
// ============================================

/**
 * Check if user prefers reduced motion
 * Returns true if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subscribe to reduced motion preference changes
 * Returns unsubscribe function
 */
export function onReducedMotionChange(callback: (prefersReduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

// ============================================
// THEME TRANSITION UTILITIES
// ============================================

/**
 * Apply theme with smooth transition
 * Handles reduced motion preference automatically
 */
export function applyThemeWithTransition(theme: string): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (prefersReducedMotion()) {
    // Apply immediately without transition
    root.setAttribute('data-theme', theme);
    return;
  }
  
  // Add transitioning class for smooth color changes
  root.classList.add('theme-transitioning');
  
  // Apply theme
  root.setAttribute('data-theme', theme);
  
  // Remove transitioning class after animation completes
  setTimeout(() => {
    root.classList.remove('theme-transitioning');
  }, DURATION.normal);
}

// ============================================
// STAGGER ANIMATION UTILITIES
// ============================================

/**
 * Calculate stagger delay for an item
 * Respects reduced motion preference
 */
export function getStaggerDelay(index: number, baseDelay: number = STAGGER.delay): number {
  if (prefersReducedMotion()) return 0;
  return Math.min(index * baseDelay, STAGGER.maxDelay);
}

/**
 * Generate stagger class names for CSS animations
 */
export function getStaggerClass(index: number): string {
  if (prefersReducedMotion()) return '';
  return `stagger-${Math.min(index + 1, 10)}`;
}

// ============================================
// SCROLL-TRIGGERED ANIMATION
// ============================================

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Create intersection observer for scroll-triggered animations
 * Automatically respects reduced motion preference
 */
export function createScrollObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: ScrollAnimationOptions = {}
): IntersectionObserver {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  
  if (prefersReducedMotion()) {
    return {
      observe: (el: Element) => {
        callback({
          isIntersecting: true,
          target: el,
          boundingClientRect: el.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: el.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry);
      },
      unobserve: () => {},
      disconnect: () => {},
      takeRecords: () => [],
      root: null,
      rootMargin: '0px',
      thresholds: [0],
    } as unknown as IntersectionObserver;
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold, rootMargin }
  );
  return observer;
}

// ============================================
// PAGE LOAD ORCHESTRATION
// ============================================

/**
 * Initialize page load animations
 * Adds animation classes to elements with data-animate attribute
 */
export function initPageLoadAnimations(): void {
  if (typeof document === 'undefined') return;
  
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  animatedElements.forEach((el, index) => {
    const delay = getStaggerDelay(index);
    (el as HTMLElement).style.animationDelay = `${delay}ms`;
    el.classList.add('animate-fade-in-up');
  });
}

/**
 * Hook for React components to trigger animations on mount
 * Returns animation class and style props
 */
export function useLoadAnimation(index: number = 0) {
  const delay = prefersReducedMotion() ? 0 : getStaggerDelay(index);
  
  return {
    className: prefersReducedMotion() ? '' : 'animate-fade-in-up',
    style: { animationDelay: `${delay}ms` },
  };
}

// ============================================
// HOVER ANIMATION UTILITIES
// ============================================

/**
 * Apply hover lift effect to element
 * Uses CSS classes for performance
 */
export function applyHoverLift(element: HTMLElement): void {
  if (prefersReducedMotion()) return;
  element.classList.add('hover-lift');
}

// ============================================
// CSS CUSTOM PROPERTIES HELPERS
// ============================================

/**
 * Get CSS custom property value
 */
export function getCssVar(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Set CSS custom property value
 */
export function setCssVar(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(name, value);
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Request animation frame wrapper with fallback
 */
export function raf(callback: FrameRequestCallback): number {
  if (typeof window === 'undefined') return 0;
  return requestAnimationFrame(callback);
}

/**
 * Cancel animation frame wrapper
 */
export function cancelRaf(id: number): void {
  if (typeof window === 'undefined') return;
  cancelAnimationFrame(id);
}

/**
 * Debounce function for resize/scroll handlers
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================
// ANIMATION PRESETS
// ============================================

export const ANIMATION_PRESETS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: DURATION.normal, ease: EASING.out },
  },
  fadeInUp: {
    initial: { opacity: 0, transform: 'translateY(20px)' },
    animate: { opacity: 1, transform: 'translateY(0)' },
    transition: { duration: DURATION.normal, ease: EASING.out },
  },
  scaleIn: {
    initial: { opacity: 0, transform: 'scale(0.95)' },
    animate: { opacity: 1, transform: 'scale(1)' },
    transition: { duration: DURATION.fast, ease: EASING.spring },
  },
  slideIn: {
    initial: { opacity: 0, transform: 'translateX(-20px)' },
    animate: { opacity: 1, transform: 'translateX(0)' },
    transition: { duration: DURATION.normal, ease: EASING.out },
  },
} as const;
