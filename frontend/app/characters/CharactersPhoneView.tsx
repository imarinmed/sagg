"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Signal, Sparkles } from "lucide-react";
import { ChainHolster, IPhoneMockup } from "@/components/phone-system";
import { PhoneLockScreen, StudentData } from "@/components/phone-system/lock-screen/PhoneLockScreen";
import { PhotoItem } from "@/components/phone-system/lock-screen/PhotoGallery";

// Types from page.tsx (redefined here to avoid circular deps or complex exports)
interface CharacterData {
  id: string;
  name: string;
  role: string;
  species: "vampire" | "human";
  variant: "student" | "authority";
  canonical_traits: string[];
}

interface CharactersPhoneViewProps {
  characters: CharacterData[];
  currentEpisode: string;
  onCharacterSelect: (id: string) => void;
}

// Helper to identify female characters for styling logic
const FEMALE_NAMES = ['kiara', 'elise', 'chloe', 'desiree', 'isabella', 'sophia', 'ava', 'mia', 'emma', 'olivia', 'lilith', 'carmilla', 'drusilla'];
const isFemale = (id: string) => FEMALE_NAMES.some(name => id.toLowerCase().includes(name));

// Helper to generate mock photos
const generatePhotos = (character: CharacterData): PhotoItem[] => {
  const seed = character.id;
  return [
    {
      id: `${seed}-portrait`,
      url: `https://placehold.co/400x800/1a0a1a/D4AF37?text=${encodeURIComponent(character.name)}`,
      context: 'portrait',
      contextLabel: 'School ID',
      quality: 'good',
      unlockedAt: 1,
      allure: 8,
      sensuality: 5
    },
    {
      id: `${seed}-gym`,
      url: `https://placehold.co/400x800/0a1a0a/white?text=Gym+Class`,
      context: 'gym',
      contextLabel: 'Gym Class',
      quality: 'average',
      unlockedAt: 2,
      allure: 6,
      sensuality: 7
    },
    {
      id: `${seed}-class`,
      url: `https://placehold.co/400x800/0a0a1a/white?text=Classroom`,
      context: 'class',
      contextLabel: 'Classroom',
      quality: 'excellent',
      unlockedAt: 1,
      allure: 4,
      sensuality: 3
    }
  ];
};

// Helper to map character data to student data
const mapToStudentData = (char: CharacterData): StudentData => {
  const isVampire = char.species === "vampire";
  const familyName = char.canonical_traits.find(t => t.includes("family"))?.replace("_family", "").replace(/_/g, " ") || "Unknown";
  
  return {
    id: char.id,
    studentId: `VA-${2026}-${char.id.substring(0, 3).toUpperCase()}`,
    name: char.name,
    family: familyName !== "Unknown" ? familyName : undefined,
    role: char.role.toLowerCase().includes("protagonist") ? "protagonist" : 
          char.role.toLowerCase().includes("antagonist") ? "antagonist" : "supporting",
    photos: generatePhotos(char),
    isReserved: isVampire, // Mock logic: vampires are "reserved" by their nature/family
    reservationDate: isVampire ? "PERMANENT" : undefined,
    reservedBy: isVampire ? "The Academy" : undefined
  };
};

export function CharactersPhoneView({ characters, currentEpisode, onCharacterSelect }: CharactersPhoneViewProps) {
  const [selectedId, setSelectedId] = useState<string>(characters[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharacters = useMemo(() => {
    return characters.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [characters, searchQuery]);

  const selectedCharacter = useMemo(() => {
    return characters.find(c => c.id === selectedId);
  }, [characters, selectedId]);

  const selectedStudentData = useMemo(() => {
    if (!selectedCharacter) return null;
    return mapToStudentData(selectedCharacter);
  }, [selectedCharacter]);

  // Extract episode number from ID (s01e01 -> 1)
  const episodeNum = parseInt(currentEpisode.replace(/[^0-9]/g, '').substring(2)) || 1;

  const [viewEpisode, setViewEpisode] = useState(episodeNum);

  useEffect(() => {
    setViewEpisode(episodeNum);
  }, [episodeNum]);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] h-[800px] w-full gap-6 p-4 lg:p-8 overflow-hidden">
      
      {/* Left Panel: Character List */}
      <div className="flex flex-col gap-6 z-10 h-full overflow-hidden">
        {/* Search Bar */}
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#8B0000]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-1 flex items-center">
            <Search className="w-5 h-5 text-white/40 ml-3" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-white placeholder-white/30 focus:ring-0 px-4 py-2"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredCharacters.map((char) => (
            <motion.button
              key={char.id}
              onClick={() => {
                setSelectedId(char.id);
                onCharacterSelect(char.id);
              }}
              className={`
                w-full text-left relative group p-3 rounded-xl border transition-all duration-300
                ${selectedId === char.id 
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                  : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                }
              `}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0
                  ${selectedId === char.id ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white/40'}
                `}>
                  {char.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-heading text-base truncate ${selectedId === char.id ? 'text-[#D4AF37]' : 'text-white'}`}>
                    {char.name}
                  </h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">{char.role}</p>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {char.species === 'vampire' && (
                    <Sparkles className="w-3 h-3 text-[#8B0000]" />
                  )}
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedId === char.id ? 'bg-[#D4AF37] animate-pulse' : 'bg-white/20'}`} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Center Panel: Phone Display */}
      <div className="flex items-center justify-center relative z-10">
        {/* Ambient Glow Behind Phone */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#8B0000]/20 via-transparent to-[#D4AF37]/10 blur-3xl" />
        
        <AnimatePresence mode="wait">
          {selectedStudentData && (
            <motion.div
              key={selectedStudentData.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1.25, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="perspective-1000 origin-center"
            >
              {(() => {
                const isFemaleChar = isFemale(selectedStudentData.id);
                const isAuthority = selectedCharacter?.variant === 'authority';

                if (isFemaleChar) {
                  return (
                    <ChainHolster
                      material={isAuthority ? 'rose-gold' : 'gold'}
                      chainStyle={isAuthority ? 'ornate' : 'simple'}
                      isActive={true}
                      className="transform hover:scale-[1.02] transition-transform duration-500"
                    >
                      <PhoneLockScreen
                        student={selectedStudentData}
                        currentEpisode={episodeNum}
                        timeOfDay="evening"
                        batteryLevel={Math.floor(Math.random() * 40) + 60}
                        mode="student"
                      />
                    </ChainHolster>
                  );
                } else {
                  return (
                    <div className="transform hover:scale-[1.02] transition-transform duration-500">
                      <IPhoneMockup
                        frameTone={isAuthority ? 'obsidian' : 'silver'}
                        className="!w-[300px] !h-[600px]"
                      >
                        <PhoneLockScreen
                          student={selectedStudentData}
                          currentEpisode={episodeNum}
                          timeOfDay="evening"
                          batteryLevel={Math.floor(Math.random() * 40) + 60}
                          mode="student"
                        />
                      </IPhoneMockup>
                    </div>
                  );
                }
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel: Lifeline Timeline */}
      <div className="hidden lg:flex flex-col gap-6 z-10 h-full overflow-hidden opacity-60 hover:opacity-100 transition-opacity duration-300">
        {/* Header */}
        <div className="relative group shrink-0">
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center justify-between">
            <span className="text-white/60 font-heading text-sm uppercase tracking-widest">Lifeline • E{viewEpisode}</span>
            <Signal className={`w-4 h-4 ${viewEpisode === episodeNum ? 'text-[#D4AF37]' : 'text-white/40'}`} />
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-6 relative flex flex-col items-center overflow-hidden">
          {/* Vertical Line */}
          <div className="absolute top-10 bottom-10 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

          {/* Nodes */}
          <div className="flex flex-col justify-between h-full w-full z-10 py-2">
            {[...Array(10)].map((_, i) => {
              const ep = i + 1;
              const isActive = ep === viewEpisode;
              const isPast = ep < viewEpisode;

              return (
                <button
                  key={ep}
                  onClick={() => setViewEpisode(ep)}
                  className="group relative flex items-center justify-center w-full outline-none"
                >
                  {/* Label Left */}
                  <span className={`
                    absolute right-[calc(50%+24px)] text-[10px] font-mono transition-all duration-300
                    ${isActive 
                      ? 'text-[#D4AF37] opacity-100 translate-x-0' 
                      : 'text-white/20 opacity-0 group-hover:opacity-100 translate-x-2'
                    }
                  `}>
                    EPISODE {ep}
                  </span>

                  {/* Node */}
                  <div className="relative flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute w-8 h-8 rounded-full bg-[#D4AF37]/20 blur-md"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <motion.div
                      layout
                      className={`
                        rounded-full border backdrop-blur-sm transition-all duration-300 z-10
                        ${isActive 
                          ? 'w-4 h-4 bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                          : isPast 
                            ? 'w-2 h-2 bg-white/40 border-white/20 group-hover:bg-white/60' 
                            : 'w-2 h-2 bg-black/40 border-white/10 group-hover:border-white/30'
                        }
                      `}
                    />
                  </div>

                  {/* Label Right (Date/Status placeholder) */}
                  <span className={`
                    absolute left-[calc(50%+24px)] text-[9px] uppercase tracking-wider transition-all duration-300
                    ${isActive 
                      ? 'text-white/60 opacity-100 translate-x-0' 
                      : 'text-white/10 opacity-0 group-hover:opacity-50 -translate-x-2'
                    }
                  `}>
                    {isActive ? 'CURRENT' : 'VIEW'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B0000]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>
    </div>
  );
}
