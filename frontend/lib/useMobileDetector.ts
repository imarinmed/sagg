'use client';

import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  orientation: Orientation;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}

function getBreakpoint(width: number): MobileState['breakpoint'] {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

export function useMobileDetector(): MobileState {
  const [state, setState] = useState<MobileState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        orientation: 'landscape',
        isTouch: false,
        screenWidth: 1920,
        screenHeight: 1080,
        breakpoint: 'xl',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);

    return {
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      deviceType,
      orientation: getOrientation(width, height),
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: width,
      screenHeight: height,
      breakpoint: getBreakpoint(width),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = getDeviceType(width);

      setState({
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        deviceType,
        orientation: getOrientation(width, height),
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenWidth: width,
        screenHeight: height,
        breakpoint: getBreakpoint(width),
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (locked) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [locked]);
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > threshold) {
        if (distanceX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    } else {
      if (Math.abs(distanceY) > threshold) {
        if (distanceY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

export function useLongPress({
  onLongPress,
  onClick,
  ms = 500,
}: {
  onLongPress: () => void;
  onClick?: () => void;
  ms?: number;
}) {
  const [startLongPress, setStartLongPress] = useState<number | null>(null);

  const start = useCallback(() => {
    setStartLongPress(Date.now());
  }, []);

  const stop = useCallback(() => {
    if (startLongPress) {
      const duration = Date.now() - startLongPress;
      if (duration < ms) {
        onClick?.();
      } else {
        onLongPress();
      }
    }
    setStartLongPress(null);
  }, [startLongPress, ms, onLongPress, onClick]);

  const cancel = useCallback(() => {
    setStartLongPress(null);
  }, []);

  useEffect(() => {
    if (startLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setStartLongPress(null);
      }, ms);

      return () => clearTimeout(timer);
    }
  }, [startLongPress, ms, onLongPress]);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}

export function useBottomSheet({
  isOpen,
  onClose,
  snapPoints = [0.25, 0.5, 0.85],
}: {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[];
}) {
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const snapTo = useCallback((index: number) => {
    if (index < 0) {
      onClose();
    } else if (index >= snapPoints.length) {
      setCurrentSnap(snapPoints.length - 1);
    } else {
      setCurrentSnap(index);
    }
  }, [snapPoints.length, onClose]);

  const expand = useCallback(() => {
    snapTo(snapPoints.length - 1);
  }, [snapPoints.length, snapTo]);

  const collapse = useCallback(() => {
    snapTo(0);
  }, [snapTo]);

  const toggle = useCallback(() => {
    if (currentSnap === 0) {
      expand();
    } else {
      collapse();
    }
  }, [currentSnap, expand, collapse]);

  return {
    currentSnap,
    snapPoints,
    isDragging,
    setIsDragging,
    snapTo,
    expand,
    collapse,
    toggle,
    currentHeight: snapPoints[currentSnap] || snapPoints[0],
  };
}

export default useMobileDetector;
