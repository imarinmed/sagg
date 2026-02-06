"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, BookOpen, ArrowUpRight } from "lucide-react";
import { Chip } from "@heroui/react";
import Link from "next/link";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { MythosElement } from "@/lib/api";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MythosCardProps {
  element: MythosElement;
  variant?: "default" | "compact" | "featured";
  showVersionBadge?: boolean;
  onClick?: (element: MythosElement) => void;
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const CATEGORY_CONFIG: Record<string, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  biology: {
    icon: "🧬",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  supernatural: {
    icon: "✨",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  society: {
    icon: "🏛️",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  psychology: {
    icon: "🧠",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  rules: {
    icon: "⚖️",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
};

const VERSION_BADGES = {
  bst: { label: "BST", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  sst: { label: "SST", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  both: { label: "Both", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category.toLowerCase()] || {
    icon: "📖",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  };
}

function determineVersion(element: MythosElement): "bst" | "sst" | "both" {
  const hasBST = element.dark_variant || element.erotic_implications || element.taboo_potential;
  const hasSST = element.significance || element.traits?.length;
  
  if (hasBST && hasSST) return "both";
  if (hasBST) return "sst";
  return "bst";
}

// ============================================
// COMPONENT
// ============================================

export function MythosCard({
  element,
  variant = "default",
  showVersionBadge = true,
  onClick,
  className = "",
}: MythosCardProps) {
  const categoryConfig = getCategoryConfig(element.category);
  const version = determineVersion(element);
  const versionBadge = VERSION_BADGES[version];
  
  const description = element.short_description || element.description || "";
  const mediaUrl = element.media_urls?.[0];
  
  const relatedCount = (element.related_characters?.length || 0) + (element.related_episodes?.length || 0);

  if (variant === "compact") {
    return (
      <Link
        href={`/mythos/${element.id}`}
        className={`block ${className}`}
        onClick={(e) => onClick && (e.preventDefault(), onClick(element))}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass rounded-lg p-4 border border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/50 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${categoryConfig.bgColor} ${categoryConfig.borderColor} border flex items-center justify-center text-lg`}>
              {categoryConfig.icon}
            </div>            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-sm text-[var(--color-text-primary)] truncate">
                  {element.name}
                </h3>                
                {showVersionBadge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${versionBadge.color}`}>
                    {versionBadge.label}
                  </span>
                )}
              </div>              
              <span className={`text-xs ${categoryConfig.color}`}>
                {element.category}
              </span>
            </div>          </div>        </motion.div>      </Link>    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/mythos/${element.id}`}
        className={`block h-full ${className}`}
        onClick={(e) => onClick && (e.preventDefault(), onClick(element))}
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass rounded-xl overflow-hidden border border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/50 transition-all h-full"
        >
          {mediaUrl && (
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${mediaUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />              
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color} ${categoryConfig.borderColor} border`}>
                  <span className="mr-1">{categoryConfig.icon}</span>
                  {element.category}
                </span>
              </div>              
              {showVersionBadge && (
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${versionBadge.color} border`}>
                    {versionBadge.label}
                  </span>
                </div>
              )}
            </div>          )}
          
          <div className="p-6">
            {!mediaUrl && (
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color} ${categoryConfig.borderColor} border`}>
                  <span className="mr-1">{categoryConfig.icon}</span>
                  {element.category}
                </span>
                
                {showVersionBadge && (
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${versionBadge.color} border`}>
                    {versionBadge.label}
                  </span>
                )}
              </div>            )}
            
            <h3 className="font-heading text-2xl text-[var(--color-text-primary)] mb-3">
              {element.name}
            </h3>            
            {description && (
              <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-3">
                {description}
              </p>            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {element.related_characters && element.related_characters.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                    <Users className="w-4 h-4" />
                    <span>{element.related_characters.length}</span>
                  </div>                )}
                {element.related_episodes && element.related_episodes.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                    <BookOpen className="w-4 h-4" />
                    <span>{element.related_episodes.length}</span>
                  </div>                )}
              </div>              
              <ArrowUpRight className="w-5 h-5 text-[var(--color-accent-primary)]" />
            </div>          </div>        </motion.div>      </Link>    );
  }

  // Default variant
  return (
    <Link
      href={`/mythos/${element.id}`}
      className={`block h-full ${className}`}
      onClick={(e) => onClick && (e.preventDefault(), onClick(element))}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="glass rounded-xl overflow-hidden border border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-accent-primary)]/5 transition-all h-full flex flex-col"
      >
        {mediaUrl && (
          <div 
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${mediaUrl})` }}
          />        )}
        
        <div className="p-5 flex-1 flex flex-col">
          <CardHeader className="p-0 mb-3">
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color} ${categoryConfig.borderColor} border`}>
                <span>{categoryConfig.icon}</span>                {element.category}
              </div>              
              {showVersionBadge && (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${versionBadge.color} border`}>
                  {versionBadge.label}
                </span>
              )}
            </div>          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col">
            <h3 className="font-heading text-lg text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
              {element.name}
            </h3>            
            {description && (
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4 flex-1">
                {description}
              </p>            )}
            
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-3">
                {relatedCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Sparkles className="w-3.5 h-3.5" />                    <span>{relatedCount} related</span>
                  </div>                )}
              </div>              
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent-primary)]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-[var(--color-accent-primary)]" />              </div>            </div>          </CardContent>        </div>      </motion.div>    </Link>  );
}

export default MythosCard;
