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
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-[var(--polar-night)] border border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-primary)]/5 via-transparent to-[var(--color-accent-secondary)]/5" />
        <div className="fog-overlay opacity-30" aria-hidden="true" />
        
        <div className="relative z-10 px-8 py-12 md:py-16 space-y-6">
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
            className="font-heading text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] tracking-tight text-glow"
          >
            The Mythos
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--color-text-secondary)] font-light leading-relaxed max-w-3xl"
          >
            Explore the dark knowledge of BST and SSt. A visual encyclopedia of vampire lore, ancient rituals, and the hidden laws that govern the night.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl relative group"
          >
            <div className="absolute inset-0 bg-[var(--color-accent-primary)]/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-primary)] transition-colors" />
            <Input
              placeholder="Search the archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/50 rounded-xl transition-all duration-300 placeholder:text-[var(--color-text-muted)]/50 text-[var(--color-text-primary)] h-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 hover:bg-[var(--color-surface-hover)] rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      {!hasActiveFilters && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-[var(--color-text-primary)]">Curated Entries</h2>
            <div className="h-px flex-1 bg-[var(--glass-border)] ml-6 opacity-50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredElements.map((element, idx) => (
              <motion.div 
                key={element.id} 
                className="h-72 card-hover-effect glass-enhanced"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <MythosCard element={element} variant="featured" showVersionBadge={false} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

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
