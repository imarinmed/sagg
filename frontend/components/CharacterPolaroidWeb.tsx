"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, X, Check, Plus, Trash2, Heart, Droplets, Flame } from "lucide-react";
import Link from "next/link";

// Relationship types with their visual properties
const RELATIONSHIP_TYPES = {
  romantic: { 
    label: "Romantic", 
    color: "#ff6b9d", 
    icon: Heart,
    dashArray: "0",
    width: 3
  },
  familial: { 
    label: "Family", 
    color: "#D4AF37", 
    icon: Droplets,
    dashArray: "5,5",
    width: 2
  },
  antagonistic: { 
    label: "Rivalry", 
    color: "#ef4444", 
    icon: Flame,
    dashArray: "10,5,2,5",
    width: 2
  },
  friendship: { 
    label: "Friendship", 
    color: "#4ade80", 
    icon: Heart,
    dashArray: "0",
    width: 2
  },
  alliance: { 
    label: "Alliance", 
    color: "#60a5fa", 
    icon: Heart,
    dashArray: "0",
    width: 2
  },
  obsession: { 
    label: "Obsession", 
    color: "#a855f7", 
    icon: Flame,
    dashArray: "0",
    width: 4
  },
  blood_bond: { 
    label: "Blood Bond", 
    color: "#8B0000", 
    icon: Droplets,
    dashArray: "0",
    width: 5
  },
};

interface Character {
  id: string;
  name: string;
  portrayed_by: string;
  species: "vampire" | "human";
  role: string;
  description: string;
  canonical_traits: string[];
  adaptation_traits: string[];
  adaptation_notes: string;
  kink_profile?: {
    preferences: string[];
    limits: string[];
    evolution: string[];
  };
  avatar_url?: string;
  polaroid_style?: {
    rotation: number;
    tape_color: string;
  };
}

interface Relationship {
  id: string;
  from_character_id: string;
  to_character_id: string;
  relationship_type: keyof typeof RELATIONSHIP_TYPES;
  intensity: number; // 1-5
  description: string;
  is_canon: boolean;
  is_edited: boolean;
}

interface CharacterPolaroidWebProps {
  characters: Character[];
  relationships: Relationship[];
  onRelationshipUpdate?: (relationship: Relationship) => void;
  onRelationshipCreate?: (relationship: Omit<Relationship, "id">) => void;
  onRelationshipDelete?: (relationshipId: string) => void;
  editable?: boolean;
}

export function CharacterPolaroidWeb({
  characters,
  relationships,
  onRelationshipUpdate,
  onRelationshipCreate,
  onRelationshipDelete,
  editable = true,
}: CharacterPolaroidWebProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [hoveredRelationship, setHoveredRelationship] = useState<Relationship | null>(null);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipStart, setRelationshipStart] = useState<string | null>(null);
  const [characterPositions, setCharacterPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Calculate positions for characters in a web layout
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 50; // percentage
    const centerY = 50; // percentage
    const radius = 35; // percentage

    characters.forEach((char, index) => {
      if (char.polaroid_style) {
        // Use predefined position with some randomness for organic feel
        const angle = (index / characters.length) * 2 * Math.PI;
        const variance = (Math.random() - 0.5) * 10; // ±5% variance
        positions[char.id] = {
          x: centerX + radius * Math.cos(angle) + variance,
          y: centerY + radius * Math.sin(angle) + variance,
        };
      } else {
        // Default circular layout
        const angle = (index / characters.length) * 2 * Math.PI;
        positions[char.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }
    });

    setCharacterPositions(positions);
  }, [characters]);

  const getRelationshipPath = (rel: Relationship) => {
    const from = characterPositions[rel.from_character_id];
    const to = characterPositions[rel.to_character_id];
    if (!from || !to) return "";

    // Calculate control point for curved line
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const curvature = 10 + (5 - rel.intensity) * 5; // More intense = less curve
    
    // Perpendicular offset for curve
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / dist * curvature;
    const perpY = dx / dist * curvature;

    const controlX = midX + perpX;
    const controlY = midY + perpY;

    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  };

  const handleCharacterClick = (char: Character) => {
    if (isCreatingRelationship && relationshipStart) {
      if (relationshipStart !== char.id) {
        // Create new relationship
        onRelationshipCreate?.({
          from_character_id: relationshipStart,
          to_character_id: char.id,
          relationship_type: "romantic",
          intensity: 3,
          description: "",
          is_canon: false,
          is_edited: true,
        });
        setIsCreatingRelationship(false);
        setRelationshipStart(null);
      }
    } else {
      setSelectedCharacter(char);
    }
  };

  const startCreatingRelationship = (charId: string) => {
    setIsCreatingRelationship(true);
    setRelationshipStart(charId);
    setSelectedCharacter(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[800px] overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1a] to-[#0a0a0f]"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B0000]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px]" />
      </div>

        {/* SVG Layer for relationship strings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Glow filter for strings */}
          <filter id="stringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for blood bond */}
          <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="50%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#8B0000" />
          </linearGradient>
        </defs>

        {/* Relationship strings */}
        {relationships.map((rel) => {
          const type = RELATIONSHIP_TYPES[rel.relationship_type];
          const isHovered = hoveredRelationship?.id === rel.id;
          const path = getRelationshipPath(rel);
          
          return (
            <g key={rel.id}>
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={2}
                className="pointer-events-auto cursor-pointer"
                onMouseEnter={() => setHoveredRelationship(rel)}
                onMouseLeave={() => setHoveredRelationship(null)}
                onClick={() => editable && setEditingRelationship(rel)}
              />
              
              
              <motion.path
                d={path}
                fill="none"
                stroke={rel.relationship_type === "blood_bond" ? "url(#bloodGradient)" : type.color}
                strokeWidth={isHovered ? 0.4 : 0.25}
                strokeDasharray={type.dashArray}
                filter={isHovered ? "url(#stringGlow)" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {/* Intensity indicators along the string */}
              {Array.from({ length: rel.intensity }).map((_, i) => {
                const t = (i + 1) / (rel.intensity + 1);
                // Calculate point on quadratic bezier
                const from = characterPositions[rel.from_character_id];
                const to = characterPositions[rel.to_character_id];
                if (!from || !to) return null;
                
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const curvature = 10 + (5 - rel.intensity) * 5;
                const perpX = -dy / dist * curvature;
                const perpY = dx / dist * curvature;
                const controlX = midX + perpX;
                const controlY = midY + perpY;
                
                const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * controlX + t * t * to.x;
                const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * controlY + t * t * to.y;
                
                return (
                  <motion.circle
                    key={i}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={isHovered ? 0.35 : 0.25}
                    fill={type.color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  />
                );
              })}

              <AnimatePresence>
                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <rect
                      x={`${(characterPositions[rel.from_character_id]?.x + characterPositions[rel.to_character_id]?.x) / 2 - 4}%`}
                      y={`${(characterPositions[rel.from_character_id]?.y + characterPositions[rel.to_character_id]?.y) / 2 - 2}%`}
                      width="8%"
                      height="4%"
                      rx="0.5"
                      fill="rgba(10, 10, 15, 0.95)"
                      stroke={type.color}
                      strokeWidth={0.2}
                    />
                    <text
                      x={`${(characterPositions[rel.from_character_id]?.x + characterPositions[rel.to_character_id]?.x) / 2}%`}
                      y={`${(characterPositions[rel.from_character_id]?.y + characterPositions[rel.to_character_id]?.y) / 2}%`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={type.color}
                      fontSize="1.5"
                      fontWeight="bold"
                    >
                      {type.label}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* Temporary line when creating relationship */}
        {isCreatingRelationship && relationshipStart && (
          <line
            x1={`${characterPositions[relationshipStart]?.x}%`}
            y1={`${characterPositions[relationshipStart]?.y}%`}
            x2="50%"
            y2="50%"
            stroke="#D4AF37"
            strokeWidth={0.3}
            strokeDasharray="5,5"
            opacity={0.5}
          />
        )}
      </svg>

      {/* Character Polaroid Cards */}
      {characters.map((char) => {
        const pos = characterPositions[char.id];
        if (!pos) return null;
        
        const isSelected = selectedCharacter?.id === char.id;
        const isVampire = char.species === "vampire";
        
        return (
          <motion.div
            key={char.id}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isSelected ? 50 : 10,
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: char.polaroid_style?.rotation || 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
          >
            <PolaroidCard
              character={char}
              isSelected={isSelected}
              onClick={() => handleCharacterClick(char)}
              onCreateRelationship={() => startCreatingRelationship(char.id)}
              editable={editable}
            />
          </motion.div>
        );
      })}

      {/* Selected Character Detail Panel */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetailPanel
            character={selectedCharacter}
            relationships={relationships.filter(
              r => r.from_character_id === selectedCharacter.id || r.to_character_id === selectedCharacter.id
            )}
            onClose={() => setSelectedCharacter(null)}
            editable={editable}
          />
        )}
      </AnimatePresence>

      {/* Edit Relationship Modal */}
      <AnimatePresence>
        {editingRelationship && editable && (
          <EditRelationshipModal
            relationship={editingRelationship}
            characters={characters}
            onSave={(updated) => {
              onRelationshipUpdate?.(updated);
              setEditingRelationship(null);
            }}
            onDelete={() => {
              onRelationshipDelete?.(editingRelationship.id);
              setEditingRelationship(null);
            }}
            onClose={() => setEditingRelationship(null)}
          />
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-[var(--color-text-muted)] bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p>Click character to view details • Click string to edit relationship</p>
        {editable && <p className="mt-1">Click "+" on character to create new relationship</p>}
      </div>
    </div>
  );
}

// Individual Polaroid Card Component
function PolaroidCard({
  character,
  isSelected,
  onClick,
  onCreateRelationship,
  editable,
}: {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
  onCreateRelationship: () => void;
  editable: boolean;
}) {
  const isVampire = character.species === "vampire";
  
  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-300
        ${isSelected ? "ring-4 ring-[#D4AF37] ring-opacity-50" : ""}
      `}
      onClick={onClick}
    >
      {/* Tape at top */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 z-20 opacity-80"
        style={{
          background: character.polaroid_style?.tape_color || (isVampire ? "#8B0000" : "#D4AF37"),
          transform: "translateX(-50%) rotate(-2deg)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      />

      {/* Polaroid frame */}
      <div 
        className={`
          w-48 bg-white p-3 pb-16 shadow-2xl
          ${isVampire 
            ? "bg-gradient-to-br from-[#f5f0e8] to-[#e8e0d5]" 
            : "bg-gradient-to-br from-[#f8f8f8] to-[#e8e8e8]"
          }
        `}
        style={{
          boxShadow: isVampire 
            ? "0 10px 40px rgba(139, 0, 0, 0.3), 0 0 0 1px rgba(139, 0, 0, 0.1)" 
            : "0 10px 40px rgba(212, 175, 55, 0.2), 0 0 0 1px rgba(212, 175, 55, 0.1)",
        }}
      >
        {/* Photo area */}
        <div 
          className={`
            w-full h-40 relative overflow-hidden
            ${isVampire ? "bg-gradient-to-br from-[#1a0a0a] to-[#2d1a1a]" : "bg-gradient-to-br from-[#0a0a1a] to-[#1a2a3a]"}
          `}
        >
          {character.avatar_url ? (
            <img 
              src={character.avatar_url} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span 
                className="text-5xl font-bold opacity-30"
                style={{ color: isVampire ? "#8B0000" : "#D4AF37" }}
              >
                {character.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Vampire/Human badge */}
          <div 
            className={`
              absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
              ${isVampire 
                ? "bg-[#8B0000] text-white" 
                : "bg-[#D4AF37] text-black"
              }
            `}
          >
            {character.species}
          </div>

          {/* Add relationship button */}
          {editable && (
            <button
              className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                onCreateRelationship();
              }}
              title="Create relationship"
            >
              <Plus className="w-3 h-3 text-black" />
            </button>
          )}
        </div>

        {/* Name caption */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-serif text-sm text-black text-center truncate">
            {character.name}
          </p>
          <p className="text-[10px] text-gray-500 text-center mt-0.5">
            {character.role}
          </p>
        </div>
      </div>
    </div>
  );
}

// Character Detail Panel
function CharacterDetailPanel({
  character,
  relationships,
  onClose,
  editable,
}: {
  character: Character;
  relationships: Relationship[];
  onClose: () => void;
  editable: boolean;
}) {
  const isVampire = character.species === "vampire";
  
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 bottom-0 w-96 bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-[var(--color-border)] overflow-y-auto z-50"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div 
            className={`
              w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4
              ${isVampire 
                ? "bg-gradient-to-br from-[#8B0000] to-[#4a0404] text-white" 
                : "bg-gradient-to-br from-[#D4AF37] to-[#8B7355] text-black"
              }
            `}
          >
            {character.name.charAt(0)}
          </div>
          
          <h2 className="font-heading text-2xl text-white">{character.name}</h2>
          <p className="text-[#D4AF37] text-sm mt-1">{character.role}</p>
          <p className="text-gray-400 text-xs mt-1">Portrayed by {character.portrayed_by}</p>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-sm text-gray-300 leading-relaxed">{character.description}</p>
        </div>

        {/* Traits */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Canonical Traits</h3>
          <div className="flex flex-wrap gap-2">
            {character.canonical_traits.map((trait) => (
              <span 
                key={trait}
                className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 capitalize"
              >
                {trait.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Adaptation */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs uppercase tracking-wider text-[#8B0000] mb-3">Dark Adaptation</h3>
          <p className="text-sm text-gray-400 mb-3">{character.adaptation_notes}</p>
          <div className="flex flex-wrap gap-2">
            {character.adaptation_traits.map((trait) => (
              <span 
                key={trait}
                className="px-3 py-1 bg-[#8B0000]/20 border border-[#8B0000]/40 rounded-full text-xs text-[#ff6b6b] capitalize"
              >
                {trait.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Kink Profile */}
        {character.kink_profile && (
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-xs uppercase tracking-wider text-[#ff6b9d] mb-3">Profile</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Preferences</p>
                <div className="flex flex-wrap gap-1">
                  {character.kink_profile.preferences.map((pref) => (
                    <span key={pref} className="px-2 py-0.5 bg-[#ff6b9d]/20 rounded text-xs text-[#ff6b9d]">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Limits</p>
                <div className="flex flex-wrap gap-1">
                  {character.kink_profile.limits.map((limit) => (
                    <span key={limit} className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-400">
                      {limit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relationships */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Relationships ({relationships.length})</h3>
          <div className="space-y-2">
            {relationships.map((rel) => {
              const type = RELATIONSHIP_TYPES[rel.relationship_type];
              const isOutgoing = rel.from_character_id === character.id;
              
              return (
                <div 
                  key={rel.id}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">
                      {type.label} {isOutgoing ? "→" : "←"}
                    </p>
                    <p className="text-xs text-gray-500">{rel.description || "No description"}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: rel.intensity }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View full profile link */}
        <Link 
          href={`/characters/${character.id}`}
          className="block w-full py-3 text-center bg-[#D4AF37] text-black font-medium rounded-lg hover:bg-[#C5A059] transition-colors"
        >
          View Full Profile
        </Link>
      </div>
    </motion.div>
  );
}

// Edit Relationship Modal
function EditRelationshipModal({
  relationship,
  characters,
  onSave,
  onDelete,
  onClose,
}: {
  relationship: Relationship;
  characters: Character[];
  onSave: (rel: Relationship) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [type, setType] = useState(relationship.relationship_type);
  const [intensity, setIntensity] = useState(relationship.intensity);
  const [description, setDescription] = useState(relationship.description);

  const fromChar = characters.find(c => c.id === relationship.from_character_id);
  const toChar = characters.find(c => c.id === relationship.to_character_id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a0a0f] border border-[var(--color-border)] rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-heading text-white mb-4">Edit Relationship</h3>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B0000] to-[#4a0404] flex items-center justify-center text-white font-bold">
              {fromChar?.name.charAt(0)}
            </div>
            <p className="text-xs text-gray-400 mt-1">{fromChar?.name}</p>
          </div>
          
          <div className="text-2xl text-[#D4AF37]">→</div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center text-black font-bold">
              {toChar?.name.charAt(0)}
            </div>
            <p className="text-xs text-gray-400 mt-1">{toChar?.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Relationship Type</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.entries(RELATIONSHIP_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setType(key as keyof typeof RELATIONSHIP_TYPES)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-all
                    ${type === key 
                      ? "ring-2 ring-offset-2 ring-offset-[#0a0a0f]" 
                      : "opacity-50 hover:opacity-75"
                    }
                  `}
                  style={{ 
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                    ['--tw-ring-color' as string]: type === key ? config.color : undefined
                  }}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Intensity</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${intensity >= i 
                      ? "bg-[#D4AF37] text-black" 
                      : "bg-white/10 text-gray-500 hover:bg-white/20"
                    }
                  `}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              rows={3}
              placeholder="Describe the nature of this relationship..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={() => onSave({ ...relationship, relationship_type: type, intensity, description })}
            className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#C5A059] transition-colors font-medium"
          >
            <Check className="w-4 h-4 inline mr-1" /> Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
