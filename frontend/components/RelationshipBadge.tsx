"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RelationshipBadgeProps {
  type: string;
  direction: "incoming" | "outgoing" | "bidirectional";
  intensity: number;
  isSecret?: boolean;
  isVisible?: boolean;
  targetName?: string;
}

export function RelationshipBadge({
  type,
  direction,
  intensity,
  isSecret = false,
  isVisible = true,
  targetName,
}: RelationshipBadgeProps) {
  const displayType = type.replace(/-/g, " ");

  const getArrow = () => {
    if (direction === "bidirectional") return "\u003c--- ---\u003e";
    if (direction === "incoming") return "\u003c---";
    return "---\u003e";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            backdrop-blur-md border
            ${isSecret ? "opacity-70 animate-pulse" : ""}
          `}
          style={{
            background: "rgba(0,0,0,0.6)",
            borderColor: isSecret
              ? "rgba(156,163,175,0.5)"
              : "rgba(255,255,255,0.2)",
            color: isSecret ? "#9ca3af" : "#fff",
          }}
        >
          {targetName && <span className="mr-1">{targetName}:</span>}
          {getArrow().replace("---", displayType)}
          {isSecret && " (secret)"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
