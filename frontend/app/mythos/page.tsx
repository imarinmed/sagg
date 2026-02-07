"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner, Button, Input, Chip } from "@heroui/react";
import {
  BookOpen,
  Network,
  Share2,
  Calendar,
  Sparkles,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Filter,
  Users,
  ArrowRight,
  Brain,
  Flame
} from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { MythosCard } from "@/components/MythosCard";
import { 
  MythosCategoryFilter, 
  DEFAULT_MYTHOS_CATEGORIES,
  getCategoryMetadata 
} from "@/components/MythosCategoryFilter";
import { listMythos, listMythosCategories } from "@/lib/kb";
import { MythosElement, MythosConnection, api } from "@/lib/api";
import Link from "next/link";
import "@/styles/mythos-atmosphere.css";

// ============================================
// TYPE DEFINITIONS
// ============================================

type ViewMode = "grid" | "list";
type SortOption = "name" | "category" | "recent";

const KEY_CHARACTERS = [
  { id: "kiara", name: "Kiara", role: "Protagonist", color: "primary" },
  { id: "alfred", name: "Alfred", role: "Love Interest", color: "secondary" },
  { id: "henry", name: "Henry", role: "Patriarch", color: "danger" },
  { id: "desiree", name: "Desirée", role: "Matriarch", color: "warning" },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sortElements(elements: MythosElement[], sortBy: SortOption): MythosElement[] {
  const sorted = [...elements];
  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "category":
      return sorted.sort((a, b) => {
        const catCompare = (a.category || "").localeCompare(b.category || "");
        return catCompare !== 0 ? catCompare : a.name.localeCompare(b.name);
      });
    case "recent":
      return sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    default:
      return sorted;
  }
}

function filterElements(
  elements: MythosElement[],
  searchQuery: string,
  activeCategory: string | null,
  activeCharacter: string | null
): MythosElement[] {
  return elements.filter((el) => {
    const matchesSearch =
      !searchQuery ||
      el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (el.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (el.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !activeCategory || el.category?.toLowerCase() === activeCategory.toLowerCase();

    const matchesCharacter =
      !activeCharacter || 
      (el.related_characters && el.related_characters.includes(activeCharacter));

    return matchesSearch && matchesCategory && matchesCharacter;
  });
}

function getCategoryCounts(elements: MythosElement[]): Record<string, number> {
  const counts: Record<string, number> = {};
  elements.forEach((el) => {
    const category = el.category?.toLowerCase() || "unknown";
    counts[category] = (counts[category] || 0) + 1;
  });
  return counts;
}

// ============================================
// LOADING STATE
// ============================================

function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)] rounded-full border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[var(--color-accent-primary)]" />
      </div>
      <p className="text-[var(--color-text-muted)] font-heading tracking-wider">Summoning the mythos...</p>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function MythosPage() {
  // Data state
  const [elements, setElements] = useState<MythosElement[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [connections, setConnections] = useState<MythosConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [elementsData, connectionsData] = await Promise.all([
          listMythos(),
          api.mythos.connections()
        ]);
        // Derive unique categories from elements
        const uniqueCategories = [...new Set(elementsData.map(e => e.category))].sort();
        setElements(elementsData);
        setCategories(uniqueCategories);
        setConnections(connectionsData);
      } catch (err) {
        setError("Failed to load mythos data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Derived data
  const categoryCounts = useMemo(() => getCategoryCounts(elements), [elements]);

  const categoryList = useMemo(() => {
    // Get all unique categories present in the data
    const presentCategories = Object.keys(categoryCounts);
    
    // Map to full category objects
    const allCategories = presentCategories.map(id => {
      const metadata = getCategoryMetadata(id);
      return {
        ...metadata,
        count: categoryCounts[id]
      };
    });

    // Sort: Default categories first (in defined order), then others alphabetically
    return allCategories.sort((a, b) => {
      const indexA = DEFAULT_MYTHOS_CATEGORIES.findIndex(c => c.id === a.id);
      const indexB = DEFAULT_MYTHOS_CATEGORIES.findIndex(c => c.id === b.id);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.label.localeCompare(b.label);
    });
  }, [categoryCounts]);

  const filteredElements = useMemo(() => {
    const filtered = filterElements(elements, searchQuery, activeCategory, activeCharacter);
    return sortElements(filtered, sortBy);
  }, [elements, searchQuery, activeCategory, activeCharacter, sortBy]);

  const featuredElements = useMemo(() => {
    // Select 3 elements with the most connections to feature
    return [...elements]
      .sort((a, b) => {
        const connA = (a.related_characters?.length || 0) + (a.related_episodes?.length || 0);
        const connB = (b.related_characters?.length || 0) + (b.related_episodes?.length || 0);
        return connB - connA;
      })
      .slice(0, 3);
  }, [elements]);

  // Handlers
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveCategory(null);
    setActiveCharacter(null);
    setSortBy("name");
  }, []);

  // Loading state
  if (loading) {
    return <PageLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 rounded-full bg-[var(--color-accent-secondary)]/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-[var(--color-accent-secondary)]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-heading text-[var(--color-text-primary)] mb-2">
            Failed to Load Mythos
          </h2>
          <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
          <Button variant="secondary" onPress={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchQuery || activeCategory || activeCharacter || sortBy !== "name";

  return (
    <div className="min-h-screen pb-20 space-y-12 animate-fade-in-up">
      <div className="fog-overlay" aria-hidden="true" />
      <div className="fog-overlay-deep" aria-hidden="true" />
      
      {/* Encyclopedia Shell / Hero */}
      <section 
        className="relative pt-8 pb-12 md:pt-12 md:pb-16 px-4"
        data-testid="mythos-encyclopedia-shell"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] text-xs font-medium tracking-wider uppercase blood-glow"
            >
              <BookOpen className="w-3 h-3" />
              <span>Dark Adaptation Knowledge Base</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text-primary)] tracking-tight text-glow"
            >
              The Mythos
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-[var(--color-text-secondary)] font-light leading-relaxed"
            >
              A visual encyclopedia of vampire lore, ancient rituals, and the hidden laws that govern the night.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Taxonomy Index & Controls */}
      <section 
        className="sticky top-0 md:top-16 z-30 bg-[var(--polar-night)]/95 backdrop-blur-xl border-b border-[var(--glass-border)] shadow-2xl shadow-black/20 transition-all duration-300"
        data-testid="mythos-taxonomy-index"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="w-full lg:w-1/3 relative group" data-testid="mythos-search">
              <div className="absolute inset-0 bg-[var(--color-accent-primary)]/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-primary)] transition-colors" />
              <Input
                placeholder="Search the archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/50 rounded-xl transition-all duration-300 placeholder:text-[var(--color-text-muted)]/50 text-[var(--color-text-primary)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 hover:bg-[var(--color-surface-hover)] rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar mask-linear-fade">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 whitespace-nowrap border ${
                    !activeCategory
                      ? "bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-[var(--polar-night)] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/50 hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  All Lore
                </button>
                {categoryList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-2 border ${
                      activeCategory === cat.id
                        ? "bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-[var(--polar-night)] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/50 hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                    <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeCategory === cat.id 
                        ? "bg-[var(--polar-night)]/20 text-[var(--polar-night)]" 
                        : "bg-[var(--polar-night)]/50 text-[var(--color-text-muted)]"
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Controls: Lore Anchors & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2 border-t border-[var(--glass-border)]/50">
            
            {/* Lore Anchors */}
            <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest whitespace-nowrap">
                Lore Anchors
              </span>
              <div className="h-4 w-px bg-[var(--glass-border)]" />
              {KEY_CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setActiveCharacter(activeCharacter === char.id ? null : char.id)}
                  className={`group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-300 border ${
                    activeCharacter === char.id
                      ? "bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                      : "bg-transparent border-transparent hover:bg-[var(--glass-bg)] hover:border-[var(--glass-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform duration-300 group-hover:scale-110 ${
                    activeCharacter === char.id 
                      ? "bg-[var(--color-accent-primary)] text-[var(--polar-night)] shadow-lg" 
                      : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--color-text-muted)]"
                  }`}>
                    {char.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium tracking-wide">{char.name}</span>
                </button>
              ))}
            </div>

            {/* View & Sort & Count */}
            <div className="flex items-center gap-4 ml-auto w-full sm:w-auto justify-between sm:justify-end">
              
              {/* Result Count (Moved here for visibility) */}
              <div className="flex items-center gap-2" data-testid="mythos-result-count">
                <span className="text-[var(--color-accent-primary)] font-heading text-lg font-bold">
                  {filteredElements.length}
                </span>
                <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider hidden sm:inline">
                  Entries
                </span>
              </div>

              <div className="h-4 w-px bg-[var(--glass-border)]" />

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[var(--glass-bg)] rounded-lg p-1 border border-[var(--glass-border)]">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-[var(--color-accent-primary)] text-[var(--polar-night)] shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-[var(--color-accent-primary)] text-[var(--polar-night)] shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg pl-3 pr-9 py-1.5 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] cursor-pointer hover:border-[var(--color-accent-primary)]/50 transition-colors uppercase tracking-wider"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="recent">Recent</option>
                  </select>
                  <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)] pointer-events-none group-hover:text-[var(--color-accent-primary)] transition-colors" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Filters Bar (Conditional) */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 pt-2 overflow-hidden"
              >
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">Active:</span>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                      Search: {searchQuery}
                    </Chip>
                  )}
                  {activeCategory && (
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                      Cat: {activeCategory}
                    </Chip>
                  )}
                  {activeCharacter && (
                    <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                      Char: {KEY_CHARACTERS.find(c => c.id === activeCharacter)?.name}
                    </Chip>
                  )}
                  <button 
                    onClick={handleClearFilters}
                    className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-accent-secondary)] underline decoration-dotted underline-offset-2 transition-colors ml-2"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Featured Strip */}
      <section className="max-w-7xl mx-auto px-4 pt-8 animate-fade-in animate-delay-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">Curated Entries</h2>
          <div className="h-px flex-1 bg-[var(--glass-border)] ml-6 opacity-50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {featuredElements.map((element, idx) => (
            <motion.div 
              key={element.id} 
              className="h-80 md:h-96 card-hover-effect glass-enhanced"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <MythosCard element={element} variant="featured" showVersionBadge={false} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 pt-12 animate-fade-in animate-delay-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">The Archives</h2>
          <div className="h-px flex-1 bg-[var(--glass-border)] ml-6 opacity-50" />
        </div>
        
        {/* Grid/List View */}
        {filteredElements.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-2xl font-heading text-[var(--color-text-primary)] mb-3">
              No Entries Found
            </h3>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
              Your search for forbidden knowledge yielded no results. Try adjusting your terms or clearing the filters.
            </p>
            <Button variant="secondary" onPress={handleClearFilters}>
              Clear All Filters
            </Button>
          </GlassCard>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredElements.map((element, index) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
                className="card-hover-effect glass-enhanced"
              >
                <MythosCard element={element} variant="default" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredElements.map((element, index) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                layout
                className="card-hover-effect glass-enhanced"
              >
                <MythosCard element={element} variant="compact" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Connections Section */}
      <section className="max-w-7xl mx-auto px-4 pt-12 animate-fade-in animate-delay-300">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
              <Network className="w-5 h-5 text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">
                Mythos Connections
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {connections.length} relationships between elements
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {connections.slice(0, 12).map((connection) => {
              const fromElement = elements.find(e => e.id === connection.from_element_id);
              const toElement = elements.find(e => e.id === connection.to_element_id);
              
              return (
                <div
                  key={connection.id}
                  className="p-3 rounded-lg bg-[var(--color-surface)]/30 border border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-glow-animate">
                      {connection.connection_type}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Strength: {connection.strength}/5
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-[var(--color-text-primary)] font-medium">
                      {fromElement?.name || connection.from_element_id}
                    </span>
                    <ArrowRight className="w-3 h-3 inline mx-1 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text-primary)] font-medium">
                      {toElement?.name || connection.to_element_id}
                    </span>
                  </div>
                  {connection.description && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {connection.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {connections.length > 12 && (
            <div className="mt-4 text-center">
              <Link href="/graph">
                <Button
                  variant="ghost"
                  className="text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10"
                >
                  View All {connections.length} Connections
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </GlassCard>
      </section>

      {/* Onward Exploration (Footer-ish) */}
      <section className="max-w-7xl mx-auto px-4 pt-12 border-t border-[var(--glass-border)] animate-fade-in animate-delay-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/mythos/quiz" className="group">
            <GlassCard className="p-6 h-full hover:border-[var(--color-accent-primary)]/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="w-24 h-24 text-[var(--color-accent-primary)]" />
              </div>
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[var(--color-accent-primary)]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
              </div>
              <h3 className="font-heading text-xl text-[var(--color-text-primary)] mb-2 relative z-10">
                Test Your Knowledge
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm relative z-10">
                Challenge yourself with the trials of the night. Prove your mastery over the vampire mythos.
              </p>
            </GlassCard>
          </Link>

          <Link href="/mythos/explorer" className="group">
            <GlassCard className="p-6 h-full hover:border-[var(--color-accent-primary)]/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Network className="w-24 h-24 text-[var(--color-accent-primary)]" />
              </div>
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
                  <Network className="w-6 h-6 text-[var(--color-accent-primary)]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
              </div>
              <h3 className="font-heading text-xl text-[var(--color-text-primary)] mb-2 relative z-10">
                Lore Tree Explorer
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm relative z-10">
                Interactive visualization of mythos elements and their connections. Explore the hierarchy of the night.
              </p>
            </GlassCard>
          </Link>

          <Link href="/mythos/ritual" className="group">
            <GlassCard className="p-6 h-full hover:border-[var(--color-accent-primary)]/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Flame className="w-24 h-24 text-[var(--color-accent-primary)]" />
              </div>
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[var(--color-accent-primary)]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
              </div>
              <h3 className="font-heading text-xl text-[var(--color-text-primary)] mb-2 relative z-10">
                Ritual Explorer
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm relative z-10">
                Combine mythos elements to discover ancient rituals. Unveil the forbidden rites of the vampire world.
              </p>
            </GlassCard>
          </Link>

          <Link href="/graph" className="group">
            <GlassCard className="p-6 h-full hover:border-[var(--color-accent-secondary)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-secondary)]/10 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-[var(--color-accent-secondary)]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-secondary)] transition-colors" />
              </div>
              <h3 className="font-heading text-xl text-[var(--color-text-primary)] mb-2">
                Full Network Graph
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                Visualize the complex web of relationships between characters, episodes, and mythos elements.
              </p>
            </GlassCard>
          </Link>

          <div className="group cursor-not-allowed opacity-70">
            <GlassCard className="p-6 h-full border-dashed">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-text-muted)]/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-heading text-xl text-[var(--color-text-primary)] mb-2">
                Lore Timeline
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                Trace the chronological evolution of vampire history and key events across the centuries.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
