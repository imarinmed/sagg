"use client";

import React, { useState, useMemo, useCallback } from "react";
import { VideoMoment } from "@/lib/api";
import { ScreenshotCard } from "./ScreenshotCard";
import { Tabs, Chip, Button, Slider, Label } from "@heroui/react";
import { Filter, X } from "lucide-react";

interface ScreenshotGalleryProps {
  moments: VideoMoment[];
  episodeId: string;
  onMomentSelect?: (moment: VideoMoment) => void;
}

const CONTENT_TYPES = [
  { key: "all", label: "All" },
  { key: "dance", label: "Dance" },
  { key: "training", label: "Training" },
  { key: "physical_intimacy", label: "Intimate" },
  { key: "vampire_feeding", label: "Vampire" },
  { key: "confrontation", label: "Conflict" },
  { key: "party", label: "Party" },
  { key: "dialogue", label: "Dialogue" },
];

export function ScreenshotGallery({
  moments,
  episodeId,
  onMomentSelect,
}: ScreenshotGalleryProps) {
  const [contentFilter, setContentFilter] = useState("all");
  const [intensityRange, setIntensityRange] = useState<[number, number]>([1, 5]);
  const [characterFilter, setCharacterFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allCharacters = useMemo(() => {
    const chars = new Set<string>();
    moments.forEach((m) => m.characters_present.forEach((c) => chars.add(c)));
    return Array.from(chars).sort();
  }, [moments]);

  const filteredMoments = useMemo(() => {
    return moments.filter((m) => {
      if (!m.screenshot_path) return false;

      if (contentFilter !== "all" && m.content_type !== contentFilter) {
        return false;
      }

      if (m.intensity < intensityRange[0] || m.intensity > intensityRange[1]) {
        return false;
      }

      if (
        characterFilter.length > 0 &&
        !characterFilter.some((c) => m.characters_present.includes(c))
      ) {
        return false;
      }

      return true;
    });
  }, [moments, contentFilter, intensityRange, characterFilter]);

  const toggleCharacter = useCallback((char: string) => {
    setCharacterFilter((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setContentFilter("all");
    setIntensityRange([1, 5]);
    setCharacterFilter([]);
  }, []);

  const hasActiveFilters =
    contentFilter !== "all" ||
    intensityRange[0] > 1 ||
    intensityRange[1] < 5 ||
    characterFilter.length > 0;

  const availableContentTypes = useMemo(() => {
    const types = new Set(moments.filter((m) => m.screenshot_path).map((m) => m.content_type));
    return CONTENT_TYPES.filter((t) => t.key === "all" || types.has(t.key));
  }, [moments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "primary" : "tertiary"}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>

          {hasActiveFilters && (
            <Button variant="tertiary" onPress={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <span className="text-sm text-[var(--color-text-muted)]">
          {filteredMoments.length} of {moments.filter((m) => m.screenshot_path).length} screenshots
        </span>
      </div>

      {showFilters && (
        <div className="glass rounded-lg p-4 space-y-4 animate-fade-in-up">
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
              Content Type
            </label>
            <Tabs
              selectedKey={contentFilter}
              onSelectionChange={(key) => setContentFilter(key as string)}
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Content type filter">
                  {availableContentTypes.map((type) => (
                    <Tabs.Tab key={type.key} id={type.key}>
                      {type.label}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>

          <div>
            <Slider
              value={intensityRange}
              onChange={(val) => {
                if (Array.isArray(val)) {
                  setIntensityRange([val[0], val[1]]);
                }
              }}
              minValue={1}
              maxValue={5}
              step={1}
              className="w-full max-w-md"
            >
              <Label>Intensity Range: {intensityRange[0]} - {intensityRange[1]}</Label>
              <Slider.Output />
              <Slider.Track>
                {({ state }) => (
                  <>
                    <Slider.Fill />
                    {state.values.map((_, i) => (
                      <Slider.Thumb key={i} index={i} />
                    ))}
                  </>
                )}
              </Slider.Track>
            </Slider>
          </div>

          {allCharacters.length > 0 && (
            <div>
              <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
                Characters
              </label>
              <div className="flex flex-wrap gap-2">
                {allCharacters.map((char) => (
                  <Chip
                    key={char}
                    variant={characterFilter.includes(char) ? "primary" : "soft"}
                    onClick={() => toggleCharacter(char)}
                    className={`cursor-pointer capitalize transition-all ${
                      characterFilter.includes(char)
                        ? "bg-[var(--color-accent-primary)] text-black"
                        : ""
                    }`}
                  >
                    {char}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredMoments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMoments.map((moment, idx) => (
            <ScreenshotCard
              key={`${moment.timestamp_seconds}-${idx}`}
              moment={moment}
              episodeId={episodeId}
              onClick={() => onMomentSelect?.(moment)}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-lg p-8 text-center">
          <p className="text-[var(--color-text-muted)]">
            No screenshots match the current filters.
          </p>
          {hasActiveFilters && (
            <Button
              variant="tertiary"
              onPress={clearFilters}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
