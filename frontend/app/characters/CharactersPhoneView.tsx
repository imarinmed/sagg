"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Signal, Sparkles, X } from "lucide-react";
import { IPhoneMockup } from "@/components/phone-system";
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
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterFamily, setFilterFamily] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "role" | "episode">("name");

  const uniqueSpecies = useMemo(() => ["all", ...Array.from(new Set(characters.map(c => c.species)))], [characters]);
  const uniqueRoles = useMemo(() => ["all", ...Array.from(new Set(characters.map(c => c.role)))], [characters]);
  const uniqueFamilies = useMemo(() => {
    const families = characters
      .map(c => c.canonical_traits.find(t => t.includes("family"))?.replace("_family", "").replace(/_/g, " ") || "Unknown")
      .filter(f => f !== "Unknown");
    return ["all", ...Array.from(new Set(families))].sort();
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    const filtered = characters.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecies = filterSpecies === "all" || c.species === filterSpecies;
      const matchesRole = filterRole === "all" || c.role === filterRole;
      
      const charFamily = c.canonical_traits.find(t => t.includes("family"))?.replace("_family", "").replace(/_/g, " ") || "Unknown";
      const matchesFamily = filterFamily === "all" || charFamily === filterFamily;

      return matchesSearch && matchesSpecies && matchesRole && matchesFamily;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "role") return a.role.localeCompare(b.role);
      if (sortBy === "episode") return 0;
      return 0;
    });
  }, [characters, searchQuery, filterSpecies, filterRole, filterFamily, sortBy]);

  const selectedCharacter = useMemo(() => {
    return characters.find(c => c.id === selectedId);
  }, [characters, selectedId]);

  const selectedStudentData = useMemo(() => {
    if (!selectedCharacter) return null;
    return mapToStudentData(selectedCharacter);
  }, [selectedCharacter]);

  // Active filters logic
  const activeFilters = useMemo(() => {
    const filters = [];
    if (filterSpecies !== "all") filters.push({ type: "species", value: filterSpecies, label: filterSpecies });
    if (filterRole !== "all") filters.push({ type: "role", value: filterRole, label: filterRole });
    if (filterFamily !== "all") filters.push({ type: "family", value: filterFamily, label: filterFamily });
    if (sortBy !== "name") filters.push({ type: "sort", value: sortBy, label: `Sort: ${sortBy}` });
    return filters;
  }, [filterSpecies, filterRole, filterFamily, sortBy]);

  const clearFilter = (type: string) => {
    if (type === "species") setFilterSpecies("all");
    if (type === "role") setFilterRole("all");
    if (type === "family") setFilterFamily("all");
    if (type === "sort") setSortBy("name");
  };

  const clearAllFilters = () => {
    setFilterSpecies("all");
    setFilterRole("all");
    setFilterFamily("all");
    setSortBy("name");
  };

  // Extract episode number from ID (s01e01 -> 1)
  const episodeNum = parseInt(currentEpisode.replace(/[^0-9]/g, '').substring(2)) || 1;

  const [viewEpisode, setViewEpisode] = useState(episodeNum);

  useEffect(() => {
    setViewEpisode(episodeNum);
  }, [episodeNum]);

  // Autocomplete Logic
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return characters
      .filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.role.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);
  }, [characters, searchQuery]);

  const handleSuggestionClick = (char: CharacterData) => {
    setSearchQuery(char.name);
    setSelectedId(char.id);
    onCharacterSelect(char.id);
    setShowSuggestions(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-visible p-4 w-full lg:grid lg:grid-cols-[280px_1fr_280px] lg:px-8 lg:py-4 xl:grid-cols-[320px_1fr_320px]">
      
      {/* Left Panel: Character List */}
      <div className="flex flex-col gap-6 z-10 h-full relative">
        {/* Search Bar */}
        <div className="relative group shrink-0 z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#8B0000]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-1 flex items-center">
            <Search className="w-5 h-5 text-white/40 ml-3" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-transparent border-none text-white placeholder-white/30 focus:ring-0 px-4 py-2"
            />
          </div>

          <AnimatePresence>
            {showSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
              >
                {searchSuggestions.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleSuggestionClick(char)}
                    className="w-full text-left p-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-none group/item"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 group-hover/item:bg-[#D4AF37] group-hover/item:text-black transition-colors">
                      {char.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium group-hover/item:text-[#D4AF37] transition-colors">{char.name}</div>
                      <div className="text-[10px] text-white/40 uppercase">{char.role}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-2 shrink-0">
          {[
            { value: filterSpecies, setter: setFilterSpecies, options: uniqueSpecies, placeholder: "SPECIES" },
            { value: filterRole, setter: setFilterRole, options: uniqueRoles, placeholder: "ROLE" },
            { value: filterFamily, setter: setFilterFamily, options: uniqueFamilies, placeholder: "FAMILY" }
          ].map((filter, i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-[#8B0000]/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <select
                value={filter.value}
                onChange={(e) => filter.setter(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white/60 uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
              >
                <option value="all">{filter.placeholder}</option>
                {filter.options.filter(o => o !== "all").map(opt => (
                  <option key={opt} value={opt} className="bg-black text-white">
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end shrink-0 mt-2">
          <div className="relative group w-1/3">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-[#8B0000]/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "role" | "episode")}
              className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white/60 uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors text-right"
            >
              <option value="name" className="bg-black text-white">SORT: NAME</option>
              <option value="role" className="bg-black text-white">SORT: ROLE</option>
              <option value="episode" className="bg-black text-white">SORT: EPISODE</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 shrink-0 mt-2"
            >
              {activeFilters.map((filter) => (
                <motion.button
                  key={`${filter.type}-${filter.value}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => clearFilter(filter.type)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[9px] uppercase tracking-wider text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors group"
                >
                  <span>{filter.label.toUpperCase()}</span>
                  <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </motion.button>
              ))}
              
              {activeFilters.length >= 2 && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  CLEAR ALL
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
      <div className="flex items-center justify-center relative z-10 overflow-visible">
        {/* Ambient Glow Behind Phone */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#8B0000]/20 via-transparent to-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[400px] h-16 rounded-full bg-black/45 blur-3xl" />
        
        {selectedStudentData && (
          <motion.div
            className="relative perspective-1000 origin-bottom scale-[1.02] xl:scale-[1.1]"
          >
            {(() => {
              const isFemaleChar = isFemale(selectedStudentData.id);
              const isAuthority = selectedCharacter?.variant === 'authority';
              const frameTone = isAuthority
                ? isFemaleChar
                  ? "rose-gold"
                  : "obsidian"
                : isFemaleChar
                  ? "gold"
                  : "silver";

              const showChain = isFemaleChar && !isAuthority;

              const chainColorClass = isAuthority
                ? "bg-gradient-to-b from-rose-100 via-rose-300 to-rose-400"
                : "bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500";

              return (
                <div className="relative transform hover:scale-[1.02] transition-transform duration-500">
                  {showChain && (
                    <motion.div
                      className="absolute left-1/2 top-0 z-20 -translate-x-1/2"
                      animate={{ y: [0, 2, 0], rotate: [0, 0.8, -0.8, 0] }}
                      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="relative flex flex-col items-center">
                        <div className="absolute bottom-full mb-1 flex flex-col gap-1">
                          {Array.from({ length: 22 }).map((_, idx) => (
                            <span
                              key={`chain-${idx}`}
                              className={`h-2.5 w-1 rounded-full border border-white/25 ${chainColorClass}`}
                            />
                          ))}
                        </div>
                        <div
                          className={`h-6 w-14 -translate-y-1/2 rounded-t-md border border-white/20 shadow-lg ${chainColorClass}`}
                        >
                          <div className="mx-auto mt-2 h-2 w-2 rounded-full bg-white/50" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <IPhoneMockup
                    frameTone={frameTone}
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
            })()}
          </motion.div>
        )}
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
