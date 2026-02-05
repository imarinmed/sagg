"use client";

import React from "react";
import {
  Droplets,
  Music,
  Heart,
  Flame,
  PartyPopper,
  MessageCircle,
} from "lucide-react";

// ============================================
// CONTENT TYPE BADGE COMPONENT
// ============================================

interface ContentTypeBadgeProps {
  contentType: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

/**
 * Badge component for displaying content types with color-coding and icons
 * Used to visually categorize scene content (dialogue, vampire feeding, dance, etc.)
 */
export function ContentTypeBadge({
  contentType,
  size = "md",
  showIcon = true,
}: ContentTypeBadgeProps) {
  // Content type styling with Tailwind classes
  // Uses CSS variables for theme-aware colors
  const contentTypeStyles: Record<string, { color: string; icon: React.ReactNode }> = {
    vampire_feeding: {
      color: "bg-red-900/90 text-red-100 border border-red-700/50",
      icon: <Droplets className="w-4 h-4" aria-hidden="true" />,
    },
    dance: {
      color: "bg-amber-700/90 text-amber-100 border border-amber-600/50",
      icon: <Music className="w-4 h-4" aria-hidden="true" />,
    },
    physical_intimacy: {
      color: "bg-rose-900/90 text-rose-100 border border-rose-700/50",
      icon: <Heart className="w-4 h-4" aria-hidden="true" />,
    },
    confrontation: {
      color: "bg-orange-800/90 text-orange-100 border border-orange-700/50",
      icon: <Flame className="w-4 h-4" aria-hidden="true" />,
    },
    party: {
      color: "bg-purple-900/90 text-purple-100 border border-purple-700/50",
      icon: <PartyPopper className="w-4 h-4" aria-hidden="true" />,
    },
    dialogue: {
      color: "bg-gray-700/90 text-gray-100 border border-gray-600/50",
      icon: <MessageCircle className="w-4 h-4" aria-hidden="true" />,
    },
  };

  // Default to dialogue styling if content type not found
  const style = contentTypeStyles[contentType] || contentTypeStyles.dialogue;

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-2",
  };

  // Format content type for display (e.g., "vampire_feeding" → "Vampire Feeding")
  const displayLabel = contentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium font-[var(--font-inter)]
        transition-all duration-200 ease-out
        ${sizeClasses[size]}
        ${style.color}
      `}
    >
      {showIcon && style.icon}
      {displayLabel}
    </span>
  );
}
