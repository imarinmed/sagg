"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Filter, X } from "lucide-react";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MythosCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface MythosCategoryFilterProps {
  categories: MythosCategory[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  showCounts?: boolean;
  allowClear?: boolean;
  variant?: "horizontal" | "vertical" | "compact";
  className?: string;
}

// ============================================
// DEFAULT CATEGORIES
// ============================================

export const DEFAULT_MYTHOS_CATEGORIES: MythosCategory[] = [
  {
    id: "biology",
    label: "Biology",
    icon: "🧬",
    count: 0,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "supernatural",
    label: "Supernatural",
    icon: "✨",
    count: 0,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: "society",
    label: "Society",
    icon: "🏛️",
    count: 0,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    id: "psychology",
    label: "Psychology",
    icon: "🧠",
    count: 0,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "rules",
    label: "Rules",
    icon: "⚖️",
    count: 0,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
];

// ============================================
// COMPONENT
// ============================================

export function MythosCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  showCounts = true,
  allowClear = true,
  variant = "horizontal",
  className = "",
}: MythosCategoryFilterProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };

  const handleClear = () => {
    onCategoryChange(null);
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? `${category.bgColor} ${category.color} ${category.borderColor} border-2`
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--glass-border)] hover:border-[var(--color-border-hover)]"
                }`}
              >
                <span>{category.icon}</span>                <span className="hidden sm:inline">{category.label}</span>                {showCounts && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[var(--color-surface-elevated)]'}`}>
                    {category.count}
                  </span>
                )}
              </motion.button>            );
          })}
        </div>        
        {allowClear && activeCategory && (
          <Button
            size="sm"
            variant="ghost"
            onPress={handleClear}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
          >
            <X className="w-4 h-4 mr-1" />            Clear
          </Button>        )}
      </div>    );
  }

  if (variant === "vertical") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Filter className="w-4 h-4" />            <span className="text-sm font-medium">Categories</span>          </div>          
          {allowClear && activeCategory && (
            <Button
              size="sm"
              variant="ghost"
              onPress={handleClear}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >              Clear
            </Button>          )}
        </div>        
        <div className="space-y-2">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                  isActive
                    ? `${category.bgColor} ${category.color} ${category.borderColor} border`
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--glass-border)] hover:border-[var(--color-border-hover)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>                  <span className="font-medium">{category.label}</span>                </div>                
                {showCounts && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[var(--color-surface-elevated)]'}`}
                  >
                    {category.count}
                  </span>
                )}
              </motion.button>            );
          })}
        </div>      </div>    );
  }

  // Horizontal variant (default)
  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] mr-2">
          <Filter className="w-4 h-4" />          <span className="text-sm font-medium hidden sm:inline">Filter by:</span>        </div>        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? `${category.bgColor} ${category.color} ${category.borderColor} border-2`
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--glass-border)] hover:border-[var(--color-border-hover)]"
                }`}
              >
                <span className="text-lg">{category.icon}</span>                <span>{category.label}</span>                {showCounts && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[var(--color-surface-elevated)]'}`}
                  >
                    {category.count}
                  </span>
                )}
              </motion.button>            );
          })}
        </div>        
        {allowClear && activeCategory && (
          <Button
            size="sm"
            variant="ghost"
            onPress={handleClear}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >            <X className="w-4 h-4 mr-1" />            Clear Filter
          </Button>        )}
      </div>    </div>  );
}

export default MythosCategoryFilter;
