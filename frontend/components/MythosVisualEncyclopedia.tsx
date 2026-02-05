"use client";

import React, { useMemo, useState } from "react";
import { Input, Chip, Button } from "@heroui/react";
import { Search, Filter, Grid3X3 } from "lucide-react";
import Link from "next/link";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { MythosElement } from "@/lib/api";

interface MythosVisualEncyclopediaProps {
  elements: MythosElement[];
  categories: string[];
  onSelectElement?: (element: MythosElement) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  biology: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  supernatural: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  society: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  psychology: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  rules: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

function getCategoryStyle(category: string): string {
  return CATEGORY_STYLES[category] || "bg-slate-500/10 text-slate-400 border-slate-500/30";
}

export function MythosVisualEncyclopedia({
  elements,
  categories,
  onSelectElement,
}: MythosVisualEncyclopediaProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const normalizedCategories = useMemo(() => {
    const unique = new Set(categories.map((c) => c.toLowerCase()));
    return ["all", ...Array.from(unique)];
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return elements.filter((element) => {
      if (activeCategory !== "all" && element.category.toLowerCase() !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        element.name,
        element.description,
        element.short_description,
        ...(element.traits || []),
        ...(element.abilities || []),
        ...(element.weaknesses || []),
        ...(element.horror_elements || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [elements, activeCategory, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">
            {filtered.length} elements
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative md:w-72">
            <Search
              className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mythos elements"
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
            <div className="flex flex-wrap gap-2">
              {normalizedCategories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={activeCategory === category ? "secondary" : "ghost"}
                  className={
                    activeCategory === category
                      ? "bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }
                  onPress={() => setActiveCategory(category)}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((element) => {
          const style = getCategoryStyle(element.category.toLowerCase());
          const mediaUrl = element.media_urls?.[0];
          const description = element.short_description || element.description || "";

          return (
            <Link
              key={element.id}
              href={`/mythos/${element.id}`}
              className="block h-full"
              onClick={(event) => {
                if (onSelectElement) {
                  event.preventDefault();
                  onSelectElement(element);
                }
              }}
            >
              <GlassCard className="h-full overflow-hidden">
                {mediaUrl && (
                  <div
                    className="h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url(${mediaUrl})` }}
                  />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
                      {element.category}
                    </span>
                    {element.related_episodes?.length ? (
                      <Chip
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {element.related_episodes.length} episodes
                      </Chip>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
                    {element.name}
                  </h3>
                  {description && (
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
                      {description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(element.traits || []).slice(0, 3).map((trait) => (
                      <Chip
                        key={trait}
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {trait}
                      </Chip>
                    ))}
                    {(element.traits || []).length > 3 && (
                      <Chip
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                      >
                        +{(element.traits || []).length - 3} more
                      </Chip>
                    )}
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
