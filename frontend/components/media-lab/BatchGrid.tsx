"use client";

import React, { useState, useCallback } from "react";
import { Card, Button, Checkbox } from "@heroui/react";
import { Download, Trash2, Eye, CheckSquare, Square } from "lucide-react";
import { ArtifactData } from "../../lib/api";

// Alias ArtifactData as ImageArtifact as per requirements
export type ImageArtifact = ArtifactData;

interface BatchGridProps {
  artifacts: ImageArtifact[];
  onSelect?: (selectedIds: string[]) => void;
  onDownload?: (artifact: ImageArtifact) => void;
  onDelete?: (artifact: ImageArtifact) => void;
  onView?: (artifact: ImageArtifact) => void;
}

export function BatchGrid({
  artifacts,
  onSelect,
  onDownload,
  onDelete,
  onView,
}: BatchGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelect = useCallback(
    (id: string, selected: boolean) => {
      const newSelected = new Set(selectedIds);
      if (selected) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      setSelectedIds(newSelected);
      onSelect?.(Array.from(newSelected));
    },
    [selectedIds, onSelect]
  );

  const handleSelectAll = useCallback(() => {
    const newSelected = new Set(artifacts.map((a) => a.id));
    setSelectedIds(newSelected);
    onSelect?.(Array.from(newSelected));
  }, [artifacts, onSelect]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
    onSelect?.([]);
  }, [onSelect]);

  const handleBulkDownload = useCallback(() => {
    if (!onDownload) return;
    artifacts
      .filter((a) => selectedIds.has(a.id))
      .forEach((a) => onDownload(a));
  }, [artifacts, selectedIds, onDownload]);

  const handleBulkDelete = useCallback(() => {
    if (!onDelete) return;
    artifacts
      .filter((a) => selectedIds.has(a.id))
      .forEach((a) => onDelete(a));
  }, [artifacts, selectedIds, onDelete]);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-content1 rounded-lg border border-default-200">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onPress={
              selectedIds.size === artifacts.length
                ? handleDeselectAll
                : handleSelectAll
            }
          >
            {selectedIds.size === artifacts.length ? (
              <CheckSquare size={16} className="mr-2" />
            ) : (
              <Square size={16} className="mr-2" />
            )}
            {selectedIds.size === artifacts.length
              ? "Deselect All"
              : "Select All"}
          </Button>
          <span className="text-small text-default-500">
            {selectedIds.size} selected
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                size="sm"
                variant="ghost"
                className="text-primary"
                onPress={handleBulkDownload}
              >
                <Download size={16} className="mr-2" />
                Download Selected
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onPress={handleBulkDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {artifacts.map((artifact) => (
          <Card
            key={artifact.id}
            className={`group relative aspect-square overflow-hidden border-2 transition-all ${
              selectedIds.has(artifact.id)
                ? "border-primary"
                : "border-transparent hover:border-default-300"
            }`}
            onClick={() => onView?.(artifact)}
          >
            {/* Image */}
            <div className="w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artifact.file_path}
                alt={`Artifact ${artifact.id}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
              <div className="flex justify-between items-start">
                <div className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {artifact.metadata_json?.seed || "No Seed"}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    isSelected={selectedIds.has(artifact.id)}
                    onChange={(isSelected: boolean) =>
                      handleSelect(artifact.id, isSelected)
                    }
                    className="bg-white/90 backdrop-blur-sm rounded-md"
                  />
                </div>
              </div>

              <div
                className="flex justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {onView && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="bg-white/90 text-black hover:bg-white"
                    onPress={() => onView(artifact)}
                  >
                    <Eye size={16} />
                  </Button>
                )}
                {onDownload && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="bg-white/90 text-black hover:bg-white"
                    onPress={() => onDownload(artifact)}
                  >
                    <Download size={16} />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="bg-danger/90 text-white hover:bg-danger"
                    onPress={() => onDelete(artifact)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
