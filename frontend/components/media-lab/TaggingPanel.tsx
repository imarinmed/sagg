"use client";

import React, { useState, useCallback } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

export interface TaggingPanelProps {
  artifactId: string;
  initialTags?: Record<string, string[]>;
  onTagsChanged?: (tags: Record<string, string[]>) => void;
  isLoading?: boolean;
}

/**
 * TaggingPanel - Component for managing artifact tags
 * Allows tagging generated images with Characters, Episodes, and Mythos elements
 */
export const TaggingPanel: React.FC<TaggingPanelProps> = ({
  artifactId,
  initialTags = {},
  onTagsChanged,
  isLoading = false,
}) => {
  const [tags, setTags] = useState<Record<string, string[]>>(initialTags);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState<"character" | "episode" | "mythos">("character");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search for entities based on query
  const handleSearch = useCallback(
    async (query: string, entityType: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        if (entityType === "character") {
          const response = await api.characters.list();
          const filtered = response.filter((c: any) =>
            c.name?.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(
            filtered.slice(0, 5).map((c: any) => ({
              id: c.id,
              name: c.name,
            }))
          );
        } else if (entityType === "episode") {
          const response = await api.episodes.list();
          const filtered = response.filter((e: any) =>
            e.title?.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(
            filtered.slice(0, 5).map((e: any) => ({
              id: e.id,
              name: `${e.title} (S${e.season}E${e.episode_number})`,
            }))
          );
        } else if (entityType === "mythos") {
          const response = await api.mythos.list();
          const filtered = response.filter((m: any) =>
            m.name?.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(
            filtered.slice(0, 5).map((m: any) => ({
              id: m.id,
              name: m.name,
            }))
          );
        }
      } catch (error) {
        console.error(`Failed to search ${entityType}:`, error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      handleSearch(value, selectedEntityType);
    },
    [selectedEntityType, handleSearch]
  );

  // Add a tag to the artifact
  const handleAddTag = useCallback((entityType: string, entityId: string) => {
    setTags((prev) => {
      const current = prev[entityType] || [];
      if (!current.includes(entityId)) {
        return {
          ...prev,
          [entityType]: [...current, entityId],
        };
      }
      return prev;
    });
    setSearchQuery("");
    setSuggestions([]);
  }, []);

  // Remove a tag from the artifact
  const handleRemoveTag = useCallback((entityType: string, entityId: string) => {
    setTags((prev) => ({
      ...prev,
      [entityType]: (prev[entityType] || []).filter((id) => id !== entityId),
    }));
  }, []);

  // Save tags to backend
  const handleSaveTags = useCallback(async () => {
    setIsSaving(true);
    try {
      await api.mediaLab.updateArtifactTags(artifactId, tags);
      onTagsChanged?.(tags);
    } catch (error) {
      console.error("Failed to save tags:", error);
    } finally {
      setIsSaving(false);
    }
  }, [artifactId, tags, onTagsChanged]);

  // Entity type labels and options
  const entityTypeLabels: Record<string, string> = {
    character: "Characters",
    episode: "Episodes",
    mythos: "Mythos Elements",
  };

  const entityTypeOptions: Array<{ key: "character" | "episode" | "mythos"; label: string }> = [
    { key: "character", label: "Characters" },
    { key: "episode", label: "Episodes" },
    { key: "mythos", label: "Mythos" },
  ];

  return (
    <Card className="bg-gray-800/50 border border-gray-700 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Tag Artifact</h3>
          <p className="text-sm text-gray-400">
            Associate this image with characters, episodes, and mythos elements
          </p>
        </div>

        {/* Search Section */}
        <div className="space-y-2">
          {/* Entity Type Selector */}
          <div className="flex gap-1 flex-wrap">
            {entityTypeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSelectedEntityType(option.key);
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedEntityType === option.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded border border-gray-600">
              {isSearching && <Spinner size="sm" />}
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-500"
              />
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded p-2 space-y-1 max-h-48 overflow-y-auto z-10">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleAddTag(selectedEntityType, suggestion.id)}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-600 text-sm text-gray-100 transition"
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Tags */}
        <div className="space-y-3 min-h-[60px] bg-gray-700/30 rounded p-3">
          {Object.keys(entityTypeLabels).map((entityType) => {
            const entityTags = tags[entityType] || [];
            if (entityTags.length === 0) return null;

            return (
              <div key={entityType} className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">{entityTypeLabels[entityType]}</h4>
                <div className="flex flex-wrap gap-2">
                  {entityTags.map((tagId) => (
                    <div
                      key={`${entityType}-${tagId}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-sm"
                    >
                      <span>{tagId}</span>
                      <button
                        onClick={() => handleRemoveTag(entityType, tagId)}
                        className="hover:text-blue-100 transition"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.values(tags).every((t) => !t || t.length === 0) && (
            <p className="text-sm text-gray-500 italic">No tags yet. Search and add tags above.</p>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveTags}
          isDisabled={isSaving || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? "Saving Tags..." : "Save Tags"}
        </Button>
      </div>
    </Card>
  );
};

export default TaggingPanel;
