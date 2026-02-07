"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  DEFAULT_MYTHOS_CATEGORIES,
  getCategoryMetadata 
} from "@/components/MythosCategoryFilter";
import { ArchiveLayout, CategoryNav } from "@/components/archive";
import { listMythos } from "@/lib/kb";
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

function MythosPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  // Data state
  const [elements, setElements] = useState<MythosElement[]>([]);
  const [connections, setConnections] = useState<MythosConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
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
        setElements(elementsData);
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

  const navCategories = useMemo(() => {
    // Get all unique categories present in the data
    const presentCategories = Object.keys(categoryCounts);
    
    // Map to full category objects
    const allCategories = presentCategories.map(id => {
      const metadata = getCategoryMetadata(id);
      return {
        id: metadata.id,
        label: metadata.label,
        count: categoryCounts[id],
        href: `/mythos?category=${metadata.id}`
      };
    });

    // Sort: Default categories first (in defined order), then others alphabetically
    const sorted = allCategories.sort((a, b) => {
      const indexA = DEFAULT_MYTHOS_CATEGORIES.findIndex(c => c.id === a.id);
      const indexB = DEFAULT_MYTHOS_CATEGORIES.findIndex(c => c.id === b.id);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.label.localeCompare(b.label);
    });

    // Add "All" category at the beginning
    return [
      {
        id: "all",
        label: "All Mythos",
        count: elements.length,
        href: "/mythos"
      },
      ...sorted
    ];
  }, [categoryCounts, elements.length]);

  const filteredElements = useMemo(() => {
    const filtered = filterElements(elements, searchQuery, categoryParam, activeCharacter);
    return sortElements(filtered, sortBy);
  }, [elements, searchQuery, categoryParam, activeCharacter, sortBy]);

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
    setActiveCharacter(null);
    setSortBy("name");
    router.push("/mythos");
  }, [router]);

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

  const hasActiveFilters = searchQuery || categoryParam || activeCharacter || sortBy !== "name";

  // Sidebar Content
  const SidebarContent = (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 px-2">
          Categories
        </h3>
        <CategoryNav 
          categories={navCategories} 
          activeCategoryId={categoryParam || "all"} 
        />
      </div>

      <div>
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 px-2">
          Lore Anchors
        </h3>
        <div className="space-y-1">
          {KEY_CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => setActiveCharacter(activeCharacter === char.id ? null : char.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                activeCharacter === char.id
                  ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeCharacter === char.id 
                  ? "bg-[var(--color-accent-primary)] text-[var(--polar-night)]" 
                  : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--color-text-muted)]"
              }`}>
                {char.name.charAt(0)}
              </div>
              <span>{char.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Main Content
  const MainContent = (
    <div className="space-y-12 pb-20">
      {/* Hero Section - Kiara Character Showcase */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden" style={{background: 'linear-gradient(to bottom, #2a2420 0%, #1a1510 50%, #0a0a0a 100%)'}}>
        {/* Atmospheric Background with subtle texture */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-16 pt-32">
          <div className="max-w-3xl">
            {/* Female Protagonists Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-amber-500/80" style={{fontFamily: 'var(--font-geist-mono)'}}>
                Female Protagonists
              </span>
              <div className="h-px w-12 bg-amber-500/30" />
            </motion.div>
            
            {/* Kiara - Main Feature */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-medium text-white mb-6 leading-[0.9] tracking-tight"
              style={{fontFamily: 'var(--font-geist-sans)'}}
            >
              Kiara
            </motion.h1>
            
            {/* Quote */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl text-white/50 mb-4 max-w-2xl leading-relaxed italic font-light"
            >
              "I don't know what I am anymore."
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-base text-white/40 mb-10 max-w-xl"
            >
              A young vampire struggling with her identity in a world that demands she choose a side. The heart of the Natt och Dag family's transformation.
            </motion.p>
            
            {/* Other Female Protagonists */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="text-xs uppercase tracking-wider text-white/30" style={{fontFamily: 'var(--font-geist-mono)'}}>
                Explore:
              </span>
              {[
                { name: 'Desirée', role: 'The Matriarch' },
                { name: 'Celina', role: 'The Outsider' },
                { name: 'Nora', role: 'The Rebel' },
                { name: 'Mia', role: 'The Dreamer' }
              ].map((char) => (
                <button 
                  key={char.name}
                  className="group flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded-full transition-all duration-300 bg-white/5 hover:bg-amber-500/10"
                >
                  <span>{char.name}</span>
                  <span className="text-xs text-white/30 group-hover:text-amber-400/70">{char.role}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* Archive Grid Controls */}
      <div className="sticky top-[5.5rem] z-20 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl py-4 border-b border-[var(--glass-border)] -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-none md:static">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">
              {categoryParam ? getCategoryMetadata(categoryParam).label : "All Archives"}
            </h2>
            <span className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded-full">
              {filteredElements.length}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
             {/* Active Filters Display */}
             <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 mr-2"
                >
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onPress={handleClearFilters}
                    className="text-xs text-[var(--color-accent-secondary)] hover:bg-[var(--color-accent-secondary)]/10 h-8"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

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
                className="appearance-none bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg pl-3 pr-9 py-1.5 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] cursor-pointer hover:border-[var(--color-accent-primary)]/50 transition-colors uppercase tracking-wider h-9"
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

      {/* Archive Grid */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredElements.map((element, index) => (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
              className="card-hover-effect glass-archive"
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
              className="card-hover-effect glass-archive"
            >
              <MythosCard element={element} variant="compact" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Connections Section */}
      <section className="pt-8 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-3 mb-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.slice(0, 6).map((connection) => {
            const fromElement = elements.find(e => e.id === connection.from_element_id);
            const toElement = elements.find(e => e.id === connection.to_element_id);
            
            return (
              <div
                key={connection.id}
                className="p-4 rounded-lg bg-[var(--color-surface)]/30 border border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-glow-animate">
                    {connection.connection_type}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                    Strength: {connection.strength}/5
                  </span>
                </div>
                <div className="text-sm flex items-center justify-between">
                  <span className="text-[var(--color-text-primary)] font-medium truncate max-w-[40%]">
                    {fromElement?.name || connection.from_element_id}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                  <span className="text-[var(--color-text-primary)] font-medium truncate max-w-[40%] text-right">
                    {toElement?.name || connection.to_element_id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/graph">
            <Button
              variant="ghost"
              className="text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10"
            >
              View All Connections
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );

  return (
    <ArchiveLayout
      leftSidebar={SidebarContent}
      mainContent={MainContent}
      className="animate-fade-in-up"
    />
  );
}

export default function MythosPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MythosPageContent />
    </Suspense>
  );
}
