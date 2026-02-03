"use client";

import React, { useState, useMemo } from "react";
import {
  Chip,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  ScrollShadow,
} from "@heroui/react";
import { Search, X, Check } from "lucide-react";

interface KinkDescriptor {
  id: string;
  name: string;
  description: string;
  intensity: number;
  category: string;
}

interface KinkTagSelectorProps {
  descriptors: KinkDescriptor[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  categoryFilter?: string;
}

const categoryColors: Record<string, string> = {
  consent_frameworks: "bg-blue-100 text-blue-800",
  power_exchange: "bg-purple-100 text-purple-800",
  roles: "bg-green-100 text-green-800",
  physical_acts: "bg-red-100 text-red-800",
  psychological_dynamics: "bg-orange-100 text-orange-800",
  vampire_specific: "bg-violet-100 text-violet-800",
  taboo_elements: "bg-rose-100 text-rose-800",
  relationship_structures: "bg-cyan-100 text-cyan-800",
  aftercare_safety: "bg-emerald-100 text-emerald-800",
  content_warnings: "bg-amber-100 text-amber-800",
};

const categoryLabels: Record<string, string> = {
  consent_frameworks: "Consent",
  power_exchange: "Power Exchange",
  roles: "Roles",
  physical_acts: "Physical Acts",
  psychological_dynamics: "Psychological",
  vampire_specific: "Vampire",
  taboo_elements: "Taboo",
  relationship_structures: "Relationships",
  aftercare_safety: "Aftercare",
  content_warnings: "Warnings",
};

export function KinkTagSelector({
  descriptors,
  selectedIds,
  onChange,
  placeholder = "Search kink descriptors...",
  maxSelections,
  categoryFilter,
}: KinkTagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredDescriptors = useMemo(() => {
    let filtered = descriptors;

    if (categoryFilter) {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [descriptors, searchQuery, categoryFilter]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, KinkDescriptor[]> = {};
    filteredDescriptors.forEach((d) => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    });
    return groups;
  }, [filteredDescriptors]);

  const selectedDescriptors = useMemo(
    () => descriptors.filter((d) => selectedIds.includes(d.id)),
    [descriptors, selectedIds]
  );

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else if (!maxSelections || selectedIds.length < maxSelections) {
      onChange([...selectedIds, id]);
    }
  };

  const removeSelection = (id: string) => {
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  return (
    <div className="w-full space-y-3">
      {/* Selected Tags */}
      {selectedDescriptors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDescriptors.map((descriptor) => (
            <Chip
              key={descriptor.id}
              className={`${categoryColors[descriptor.category]} cursor-pointer`}
              onClose={() => removeSelection(descriptor.id)}
              variant="flat"
              size="sm"
            >
              {descriptor.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Selector Popover */}
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
        <PopoverTrigger>
          <Button
            variant="bordered"
            className="w-full justify-start text-left h-auto min-h-[40px] py-2"
            endContent={<Search className="w-4 h-4 text-default-400" />}
          >
            {selectedIds.length > 0 ? (
              <span className="text-default-600">
                {selectedIds.length} selected
              </span>
            ) : (
              <span className="text-default-400">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <div className="w-full">
            {/* Search Input */}
            <div className="p-3 border-b border-default-200">
              <Input
                placeholder="Search descriptors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                endContent={
                  searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-default-400 hover:text-default-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )
                }
                size="sm"
              />
            </div>

            {/* Results */}
            <ScrollShadow className="max-h-[300px] overflow-y-auto">
              {Object.keys(groupedByCategory).length === 0 ? (
                <div className="p-4 text-center text-default-400">
                  No descriptors found
                </div>
              ) : (
                Object.entries(groupedByCategory).map(([category, items]) => (
                  <div key={category} className="border-b border-default-100 last:border-0">
                    <div className="px-3 py-2 bg-default-100 text-xs font-semibold text-default-600 uppercase tracking-wider">
                      {categoryLabels[category] || category}
                    </div>
                    <div className="p-2">
                      {items.map((descriptor) => {
                        const isSelected = selectedIds.includes(descriptor.id);
                        return (
                          <button
                            key={descriptor.id}
                            onClick={() => toggleSelection(descriptor.id)}
                            disabled={
                              !isSelected &&
                              maxSelections &&
                              selectedIds.length >= maxSelections
                            }
                            className={`
                              w-full text-left px-3 py-2 rounded-lg mb-1
                              flex items-start gap-3
                              transition-colors
                              ${
                                isSelected
                                  ? "bg-primary-100 text-primary-800"
                                  : "hover:bg-default-100"
                              }
                              ${
                                !isSelected &&
                                maxSelections &&
                                selectedIds.length >= maxSelections
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                            `}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <Check className="w-4 h-4 text-primary-600" />
                              ) : (
                                <div className="w-4 h-4 rounded border-2 border-default-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {descriptor.name}
                              </div>
                              <div className="text-xs text-default-500 line-clamp-2">
                                {descriptor.description}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`
                                    text-[10px] px-1.5 py-0.5 rounded
                                    ${
                                      descriptor.intensity >= 4
                                        ? "bg-danger-100 text-danger-700"
                                        : descriptor.intensity >= 3
                                        ? "bg-warning-100 text-warning-700"
                                        : "bg-success-100 text-success-700"
                                    }
                                  `}
                                >
                                  Intensity: {descriptor.intensity}/5
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </ScrollShadow>

            {/* Footer */}
            <div className="p-3 border-t border-default-200 bg-default-50 text-xs text-default-500 flex justify-between">
              <span>{filteredDescriptors.length} descriptors</span>
              {maxSelections && (
                <span>
                  {selectedIds.length} / {maxSelections} selected
                </span>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
