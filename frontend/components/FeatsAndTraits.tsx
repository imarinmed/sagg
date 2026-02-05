"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeatsAndTraitsProps {
  feats: {
    id: string;
    name: string;
    episodeUnlocked: string;
    icon: string;
    category?: "blood" | "romance" | "power" | "knowledge";
    isNew?: boolean;
  }[];
  traits: string[];
  previousTraits?: string[];
  className?: string;
}

export function FeatsAndTraits({
  feats,
  traits,
  previousTraits = [],
  className = "",
}: FeatsAndTraitsProps) {
  const newFeats = feats.filter((f) => f.isNew);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Feats */}
      {feats.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          <AnimatePresence>
            {feats.map((feat) => (
              <motion.div
                key={feat.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  background: getCategoryColor(feat.category || "blood"),
                  color: "#fff",
                }}
              >
                <span className="mr-1">{feat.icon}</span>
                {feat.name}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Traits */}
      <div className="flex flex-wrap gap-1">
        <AnimatePresence mode="popLayout">
          {traits.map((trait) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="px-2 py-0.5 text-xs rounded border border-white/20 text-gray-300"
            >
              {trait}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "blood":
      return "#7f1d1d";
    case "romance":
      return "#be185d";
    case "power":
      return "#c9a227";
    case "knowledge":
      return "#4f46e5";
    default:
      return "#4b5563";
  }
}
