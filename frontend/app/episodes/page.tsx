"use client";

import { useEffect, useState, useMemo } from "react";
import { Spinner, Input, Button } from "@heroui/react";
import { Search, Play, Calendar, Grid3X3, List, Filter, Clock } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { ContentIntensityIndicator } from "@/components/ContentIntensityIndicator";
import { api, Episode } from "@/lib/api";
import { TemporalNavigator, TemporalIndex } from "@/components/TemporalNavigator";
import temporalData from "@/../data/derived/temporal_index.json";

// Episode data with intensity ratings
const EPISODE_INTENSITY: Record<string, number> = {
  "s01e01": 2,
  "s01e02": 3,
  "s01e03": 2,
  "s01e04": 4,
  "s01e05": 3,
  "s01e06": 4,
  "s01e07": 5,
};

// Episode thumbnail mapping (using screenshots)
const EPISODE_THUMBNAILS: Record<string, string> = {
  "s01e01": "/screenshots/s01e01/s01e01_moment_000_0-00-03.jpg",
  "s01e02": "/screenshots/s01e02/s01e02_moment_000_0-00-03.jpg",
  "s01e03": "/screenshots/s01e03/s01e03_moment_000_0-00-03.jpg",
  "s01e04": "/screenshots/s01e04/s01e04_moment_000_0-00-03.jpg",
  "s01e05": "/screenshots/s01e05/s01e05_moment_000_0-00-03.jpg",
  "s01e06": "/screenshots/s01e06/s01e06_moment_000_0-00-03.jpg",
  "s01e07": "/screenshots/s01e07/s01e07_moment_000_0-00-03.jpg",
};

interface EpisodeWithMeta extends Episode {
  intensity: number;
  thumbnail?: string;
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<EpisodeWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [filterIntensity, setFilterIntensity] = useState<number | null>(null);

  useEffect(() => {
    async function loadEpisodes() {
      try {
        const data = await api.episodes.list();
        // Enhance episodes with metadata
        const enhanced = data.map((ep) => ({
          ...ep,
          intensity: EPISODE_INTENSITY[ep.id] || 3,
          thumbnail: EPISODE_THUMBNAILS[ep.id],
        }));
        setEpisodes(enhanced);
      } catch (err) {
        setError("Failed to load episodes");
      } finally {
        setLoading(false);
      }
    }
    loadEpisodes();
  }, []);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      const matchesSearch =
        !searchQuery ||
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.synopsis?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIntensity =
        !filterIntensity || ep.intensity >= filterIntensity;
      return matchesSearch && matchesIntensity;
    });
  }, [episodes, searchQuery, filterIntensity]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Premium Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden -mt-24 sm:-mt-28">
        {/* Background with gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 40%, #0a0a0f 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-[#0a0a0f]/70" />
          
          {/* Animated blood drip effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B0000]/60 to-transparent" />
          
          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-64 h-64 border border-[#D4AF37]/10 rounded-full opacity-30" />
          <div className="absolute top-32 right-32 w-48 h-48 border border-[#D4AF37]/20 rounded-full opacity-20" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16 pt-32">
          <div className="max-w-4xl space-y-4">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-[#8B0000]/30 text-[#ff6b6b] border border-[#8B0000]/50 rounded-full">
              <Play className="w-3 h-3" />
              Season 1
            </span>

            {/* Title */}
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white leading-tight drop-shadow-2xl">
              Episodes
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
              Explore the dark journey through all {episodes.length} episodes of Blod, Svett, Tårar.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                <span>{episodes.length} Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Season 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />
      </div>

      {/* Controls Bar */}
      <div className="sticky top-20 z-30 px-4 md:px-8 lg:px-16 py-4 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search episodes..."
              className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-sm text-[var(--color-text-muted)]">Intensity:</span>
            </div>
            <div className="flex gap-1">
              {[null, 3, 4, 5].map((level) => (
                <Button
                  key={level ?? "all"}
                  size="sm"
                  variant={filterIntensity === level ? "secondary" : "ghost"}
                  className={
                    filterIntensity === level
                      ? "bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }
                  onPress={() => setFilterIntensity(level)}
                >
                  {level ? `${level}+` : "All"}
                </Button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 ml-4 border-l border-[var(--color-border)] pl-4">
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                className={viewMode === "grid" ? "text-[var(--color-accent-primary)]" : ""}
                onPress={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                className={viewMode === "list" ? "text-[var(--color-accent-primary)]" : ""}
                onPress={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "timeline" ? "secondary" : "ghost"}
                className={viewMode === "timeline" ? "text-[var(--color-accent-primary)]" : ""}
                onPress={() => setViewMode("timeline")}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === "timeline" ? (
            <TemporalNavigator data={temporalData as unknown as TemporalIndex} />
          ) : filteredEpisodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)]">No episodes found</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredEpisodes.map((episode) => (
                <EpisodeListCard
                  key={episode.id}
                  episode={episode}
                  viewMode={viewMode as "grid" | "list"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Episode Card Component
function EpisodeListCard({
  episode,
  viewMode,
}: {
  episode: EpisodeWithMeta;
  viewMode: "grid" | "list";
}) {
  const isGrid = viewMode === "grid";

  return (
    <Link href={`/episodes/${episode.id}`} className="block group">
      <GlassCard
        className={`overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
          isGrid ? "h-full" : ""
        }`}
      >
        <div className={`flex ${isGrid ? "flex-col" : "flex-row"} h-full`}>
          {/* Thumbnail */}
          <div
            className={`relative overflow-hidden ${
              isGrid ? "h-48 w-full" : "w-48 h-32 shrink-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: episode.thumbnail
                  ? `url(${episode.thumbnail})`
                  : `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Episode number badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-bold bg-[#D4AF37] text-black rounded">
                EP {episode.episode_number}
              </span>
            </div>

            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Play className="w-5 h-5 text-black ml-0.5" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-xl text-[var(--color-text-primary)] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                {episode.title}
              </h3>
              <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                {episode.id.toUpperCase()}
              </span>
            </div>

            {episode.synopsis && (
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                {episode.synopsis}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <ContentIntensityIndicator
                intensity={episode.intensity}
                size="sm"
              />
              <span className="text-xs text-[var(--color-text-muted)]">
                {episode.air_date}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
