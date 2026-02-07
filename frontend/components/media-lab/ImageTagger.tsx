"use client";

import React, { useState, useMemo } from "react";
import { Chip, Input, Card, Button } from "@heroui/react";
import { Search, X, User, Film, Book } from "lucide-react";

export interface ImageTag {
  id: string;
  entityType: "character" | "episode" | "mythos";
  entityId: string;
  entityName: string;
}

interface Entity {
  id: string;
  name: string;
  type: "character" | "episode" | "mythos";
}

interface ImageTaggerProps {
  imagePath: string;
  existingTags?: ImageTag[];
  entities: Entity[];
  onAddTag: (entityType: string, entityId: string) => void;
  onRemoveTag: (tagId: string) => void;
  className?: string;
}

export function ImageTagger({
  imagePath,
  existingTags = [],
  entities,
  onAddTag,
  onRemoveTag,
  className = "",
}: ImageTaggerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredEntities = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return entities
      .filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !existingTags.some((t) => t.entityId === e.id)
      )
      .slice(0, 10);
  }, [searchQuery, entities, existingTags]);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "character":
        return <User size={14} />;
      case "episode":
        return <Film size={14} />;
      case "mythos":
        return <Book size={14} />;
      default:
        return null;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case "character":
        return "primary";
      case "episode":
        return "secondary";
      case "mythos":
        return "success";
      default:
        return "default";
    }
  };

  const handleSelectEntity = (entity: Entity) => {
    onAddTag(entity.type, entity.id);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <Card className={`p-4 ${className}`}>
      <h4 className="text-sm font-medium mb-3">Tags</h4>

      {/* Existing Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {existingTags.length === 0 && (
          <span className="text-sm text-default-400">No tags yet</span>
        )}
        {existingTags.map((tag) => (
          <Chip
            key={tag.id}
            color={getEntityColor(tag.entityType) as any}
            // @ts-ignore - onClose is not in types but works in runtime or needs update
            onClose={() => onRemoveTag(tag.id)}
            startContent={getEntityIcon(tag.entityType)}
          >
            {tag.entityName}
          </Chip>
        ))}
      </div>

      {/* Add Tag Input */}
      <div className="relative">
        <Input
          placeholder="Search characters, episodes, mythos..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length >= 2) setShowResults(true);
          }}
          // @ts-ignore - startContent is not in types but works in runtime or needs update
          startContent={<Search size={16} />}
        />

        {/* Search Results */}
        {showResults && filteredEntities.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
            <div className="p-2">
              {filteredEntities.map((entity) => (
                <Button
                  key={entity.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onPress={() => handleSelectEntity(entity)}
                >
                  {getEntityIcon(entity.type)}
                  <span className="ml-2">{entity.name}</span>
                  <span className="ml-auto text-xs text-default-400 capitalize">
                    {entity.type}
                  </span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {showResults &&
          searchQuery.length >= 2 &&
          filteredEntities.length === 0 && (
            <div className="absolute z-10 w-full mt-1 p-3 bg-default-100 rounded-lg text-sm text-default-500">
              No entities found
            </div>
          )}
      </div>
    </Card>
  );
}
