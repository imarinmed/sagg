"use client";

import React from "react";
import { motion } from "framer-motion";
import { TemporalCharacterState } from "../lib/temporalModels";
import { EvolvingMetrics } from "./EvolvingMetrics";
import { FeatsAndTraits } from "./FeatsAndTraits";

interface TemporalCharacterCardProps {
  character: TemporalCharacterState;
  variant: "student" | "authority";
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TemporalCharacterCard({
  character,
  variant,
  isActive = false,
  onClick,
  className = "",
}: TemporalCharacterCardProps) {
  const isVampire = character.species === "vampire";
  const accentColor = variant === "student" ? "#7f1d1d" : "#c9a227";

  return (
    <motion.div
      className={`relative w-[360px] h-[240px] rounded-xl overflow-hidden cursor-pointer ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(13,13,18,0.85) 0%, rgba(20,18,25,0.75) 100%)`,
        backdropFilter: "blur(40px) saturate(200%)",
        border: `1px solid ${accentColor}40`,
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.08),
          0 0 60px ${accentColor}10
        `,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      animate={{
        boxShadow: isActive
          ? `0 0 40px ${accentColor}30, 0 8px 32px rgba(0,0,0,0.4)`
          : `0 8px 32px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Inner glow overlay */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-xs font-bold rounded"
            style={{ background: accentColor, color: "#fff" }}
          >
            {variant === "student" ? "STUDENT" : "AUTHORITY"}
          </span>
          <span className="text-xs text-gray-400">
            {character.id.toUpperCase().replace(/_/g, "-")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{character.episodeId}</span>
          {isVampire ? (
            <span className="text-xs">🦇</span>
          ) : (
            <span className="text-xs">👤</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 p-4">
        {/* Photo placeholder */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
            border: `2px solid ${accentColor}`,
          }}
        >
          {character.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-bold truncate"
            style={{ fontFamily: "Cormorant, serif" }}
          >
            {character.name}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {character.classification.role} | Year {character.classification.year} |{" "}
            {character.classification.rank}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div
              className="h-1.5 rounded-full flex-1"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #742a2a, ${accentColor})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${character.bloodline.purity}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {character.bloodline.purity}%
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4">
        <EvolvingMetrics
          metrics={character.metrics}
          isAnimating={isActive}
        />
      </div>

      {/* Feats & Traits */}
      <div className="px-4 mt-2">
        <FeatsAndTraits
          feats={character.feats}
          traits={character.traits}
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-gray-500">
        <span>Tier {character.visualTier}</span>
        <span>Since {character.episodeId}</span>
      </div>
    </motion.div>
  );
}
