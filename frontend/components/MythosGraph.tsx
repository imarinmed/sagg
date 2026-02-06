"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  Sparkles,
  Users,
  BookOpen,
  Info,
  X,
  Network,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { MythosElement, Character } from "@/lib/api";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MythosGraphNode {
  id: string;
  name: string;
  type: "mythos" | "character";
  category?: string;
  radius: number;
  color: string;
  metadata?: {
    description?: string;
    relatedCount?: number;
    traits?: string[];
    role?: string;
    family?: string | null;
  };
  // D3 simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface MythosGraphLink {
  source: string | MythosGraphNode;
  target: string | MythosGraphNode;
  type: "related_to" | "appears_in" | "explains" | "contradicts";
  strength: number;
  description?: string;
}

export interface MythosGraphProps {
  mythosElements: MythosElement[];
  characters?: Character[];
  width?: number;
  height?: number;
  onNodeClick?: (mythosId: string) => void;
  filterCategories?: string[];
  className?: string;
}

// ============================================
// CATEGORY CONFIGURATION
// ============================================

const CATEGORY_COLORS: Record<string, string> = {
  biology: "#10b981", // emerald
  society: "#f59e0b", // amber
  supernatural: "#a855f7", // purple
  psychology: "#3b82f6", // blue
  rules: "#f43f5e", // rose
  default: "#6b7280", // gray
};

const CATEGORY_CONFIG: Record<string, { icon: string; label: string }> = {
  biology: { icon: "🧬", label: "Biology" },
  society: { icon: "🏛️", label: "Society" },
  supernatural: { icon: "✨", label: "Supernatural" },
  psychology: { icon: "🧠", label: "Psychology" },
  rules: { icon: "⚖️", label: "Rules" },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default;
}

function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIG[category.toLowerCase()] || {
      icon: "📖",
      label: category,
    }
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// LOADING COMPONENT
// ============================================

function GraphLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)] rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-2 border-2 border-[var(--color-accent-secondary)]/30 rounded-full" />
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">Weaving the mythos...</p>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function GraphEmpty() {
  return (
    <GlassCard className="flex flex-col items-center justify-center h-[500px]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-surface)] flex items-center justify-center">
          <Network className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
        <div>
          <h3 className="text-lg font-heading text-[var(--color-text-primary)]">
            No Mythos Elements Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            The lore network is empty. Add mythos elements to see connections.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// FILTER COMPONENT
// ============================================

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onToggle: (category: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function CategoryFilter({
  categories,
  selectedCategories,
  onToggle,
  onSelectAll,
  onClearAll,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setIsOpen(!isOpen)}
        className={`glass ${
          isOpen ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-secondary)]"
        }`}
      >
        <Filter className="w-4 h-4" />
        {selectedCategories.length !== categories.length && (
          <span className="ml-1 text-xs">({selectedCategories.length})</span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-56 glass rounded-xl p-3 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--glass-border)]">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Categories
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={onSelectAll}
                    className="text-xs text-[var(--color-accent-primary)] hover:underline"
                  >
                    All
                  </button>
                  <span className="text-[var(--color-text-muted)]">|</span>
                  <button
                    onClick={onClearAll}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {categories.map((category) => {
                  const config = getCategoryConfig(category);
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => onToggle(category)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-[var(--color-accent-primary)]/10"
                          : "hover:bg-[var(--color-surface)]"
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      />
                      <span className="text-lg">{config.icon}</span>
                      <span
                        className={`text-sm capitalize ${
                          isSelected
                            ? "text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {config.label}
                      </span>
                      {isSelected && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// NODE DETAILS PANEL
// ============================================

interface NodeDetailsPanelProps {
  node: MythosGraphNode | null;
  onClose: () => void;
  onNodeClick?: (mythosId: string) => void;
}

function NodeDetailsPanel({ node, onClose, onNodeClick }: NodeDetailsPanelProps) {
  if (!node) return null;

  const isMythos = node.type === "mythos";
  const config = node.category ? getCategoryConfig(node.category) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-72 glass rounded-xl overflow-hidden z-20"
    >
      <CardHeader className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: node.color }}
          >
            {isMythos ? config?.icon || "📖" : getInitials(node.name)}
          </div>
          <div>
            <h4 className="font-heading text-[var(--color-text-primary)]">{node.name}</h4>
            {node.category && (
              <p className="text-xs text-[var(--color-text-muted)] capitalize">
                {config?.label || node.category}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onPress={onClose} className="shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {node.metadata?.description && (
          <div>
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              Description
            </span>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-3">
              {node.metadata.description}
            </p>
          </div>
        )}

        {node.metadata?.traits && node.metadata.traits.length > 0 && (
          <div>
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              Traits
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {node.metadata.traits.slice(0, 5).map((trait, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-surface)] border border-[var(--glass-border)]">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.metadata?.relatedCount && node.metadata.relatedCount > 0 && (
          <div>
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              Connections
            </span>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {node.metadata.relatedCount} related elements
            </p>
          </div>
        )}

        {isMythos && onNodeClick && (
          <Button className="w-full mt-2" variant="secondary" onPress={() => onNodeClick(node.id)}>
            View Details
          </Button>
        )}
      </CardContent>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MythosGraph({
  mythosElements,
  characters = [],
  width = 800,
  height = 600,
  onNodeClick,
  filterCategories,
  className = "",
}: MythosGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<MythosGraphNode, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [dimensions, setDimensions] = useState({ width, height });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<MythosGraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<MythosGraphLink | null>(null);
  const [selectedNode, setSelectedNode] = useState<MythosGraphNode | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Extract unique categories
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    mythosElements.forEach((el) => {
      if (el.category) categories.add(el.category.toLowerCase());
    });
    return Array.from(categories);
  }, [mythosElements]);

  // Initialize selected categories
  useEffect(() => {
    if (filterCategories && filterCategories.length > 0) {
      setSelectedCategories(filterCategories.map((c) => c.toLowerCase()));
    } else if (availableCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(availableCategories);
    }
  }, [availableCategories, filterCategories, selectedCategories.length]);

  // Build nodes and links
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, MythosGraphNode>();
    const linkList: MythosGraphLink[] = [];

    // Create mythos nodes
    mythosElements
      .filter((el) => selectedCategories.includes(el.category?.toLowerCase() || ""))
      .forEach((el) => {
        nodeMap.set(el.id, {
          id: el.id,
          name: el.name,
          type: "mythos",
          category: el.category?.toLowerCase(),
          radius: 28,
          color: getCategoryColor(el.category || ""),
          metadata: {
            description: el.short_description || el.description,
            relatedCount: (el.related_characters?.length || 0) + (el.related_episodes?.length || 0),
            traits: el.traits,
          },
        });
      });

    // Create character nodes and links
    const characterMap = new Map<string, Character>();
    characters.forEach((char) => characterMap.set(char.id, char));

    mythosElements.forEach((el) => {
      if (!nodeMap.has(el.id)) return;

      el.related_characters?.forEach((charId) => {
        const char = characterMap.get(charId);
        if (!char) return;

        if (!nodeMap.has(charId)) {
          nodeMap.set(charId, {
            id: charId,
            name: char.name,
            type: "character",
            radius: 18,
            color: "var(--color-accent-secondary, #8B0000)",
            metadata: {
              role: char.role,
              family: char.family,
            },
          });
        }

        linkList.push({
          source: el.id,
          target: charId,
          type: "related_to",
          strength: 3,
        });
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: linkList,
    };
  }, [mythosElements, characters, selectedCategories]);

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || width,
          height: Math.min(rect.width * 0.75, height),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [width, height]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize D3 graph
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width: w, height: h } = dimensions;

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Create glow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "node-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Prepare data
    const nodeData: MythosGraphNode[] = nodes.map((n) => ({ ...n }));
    const linkData = links.map((l) => ({
      ...l,
      source: typeof l.source === "string" ? l.source : l.source.id,
      target: typeof l.target === "string" ? l.target : l.target.id,
    }));

    // Create force simulation
    const simulation = d3
      .forceSimulation<MythosGraphNode>(nodeData)
      .force(
        "link",
        d3
          .forceLink<MythosGraphNode, any>(linkData)
          .id((d) => d.id)
          .distance((d) => 100 + (5 - d.strength) * 15)
          .strength(0.4)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius((d) => (d as MythosGraphNode).radius + 15));

    simulationRef.current = simulation;

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", "var(--color-text-muted, #6b7280)")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => Math.max(1, d.strength * 0.8))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.8).attr("stroke-width", d.strength + 2);
        setHoveredLink(d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.4).attr("stroke-width", Math.max(1, d.strength * 0.8));
        setHoveredLink(null);
      });

    // Create nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, MythosGraphNode>("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, MythosGraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("mouseover", function (event, d) {
        setHoveredNode(d);
        d3.select(this).select("circle").attr("stroke-width", 3);
      })
      .on("mouseout", function (event, d) {
        setHoveredNode(null);
        d3.select(this).select("circle").attr("stroke-width", 2);
      })
      .on("click", (event, d) => {
        setSelectedNode(d);
        if (d.type === "mythos") {
          onNodeClick?.(d.id);
        }
      });

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", "var(--color-bg-primary, #080808)")
      .attr("stroke-width", 2)
      .attr("filter", (d) => (d.type === "mythos" ? "url(#node-glow)" : null));

    // Node icons/initials
    node
      .append("text")
      .text((d) => {
        if (d.type === "mythos") {
          const config = d.category ? getCategoryConfig(d.category) : null;
          return config?.icon || "📖";
        }
        return getInitials(d.name);
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "white")
      .attr("font-size", (d) => (d.type === "mythos" ? "16px" : "11px"))
      .style("pointer-events", "none");

    // Node labels
    node
      .append("text")
      .text((d) => d.name.split(" ")[0])
      .attr("text-anchor", "middle")
      .attr("y", (d) => d.radius + 16)
      .attr("fill", "var(--color-text-secondary, #B0B0B0)")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .style("pointer-events", "none");

    // Update positions
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as MythosGraphNode).x || 0)
        .attr("y1", (d: any) => (d.source as MythosGraphNode).y || 0)
        .attr("x2", (d: any) => (d.target as MythosGraphNode).x || 0)
        .attr("y2", (d: any) => (d.target as MythosGraphNode).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Initial zoom
    const initialScale = 0.85;
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate((w * (1 - initialScale)) / 2, (h * (1 - initialScale)) / 2).scale(initialScale)
    );

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, isLoading, onNodeClick]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy as any, 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy as any, 0.7);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomRef.current.transform as any, d3.zoomIdentity);
  }, []);

  // Filter handlers
  const handleToggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCategories(availableCategories);
  }, [availableCategories]);

  const handleClearAll = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  // Render states
  if (isLoading) {
    return (
      <GlassCard className={className}>
        <GraphLoading />
      </GlassCard>
    );
  }

  if (mythosElements.length === 0) {
    return (
      <GlassCard className={className}>
        <GraphEmpty />
      </GlassCard>
    );
  }

  const mythosCount = nodes.filter((n) => n.type === "mythos").length;
  const characterCount = nodes.filter((n) => n.type === "character").length;

  return (
    <GlassCard className={`relative overflow-hidden ${className}`}>
      {/* Header */}
      <CardHeader className="flex items-center justify-between border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-[var(--color-accent-primary)]" />
          <div>
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Mythos Network</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {mythosCount} elements • {characterCount} characters • {links.length} connections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CategoryFilter
            categories={availableCategories}
            selectedCategories={selectedCategories}
            onToggle={handleToggleCategory}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onPress={handleZoomIn}
              className="glass text-[var(--color-text-secondary)]"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onPress={handleZoomOut}
              className="glass text-[var(--color-text-secondary)]"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onPress={handleResetZoom}
              className="glass text-[var(--color-text-secondary)]"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Graph Container */}
      <div ref={containerRef} className="relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full bg-[var(--color-bg-secondary)]/30"
          style={{ minHeight: "500px" }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
          {selectedCategories.map((category) => {
            const config = getCategoryConfig(category);
            return (
              <Chip
                key={category}
                size="sm"
                variant="soft"
                className="glass text-xs capitalize"
                style={{
                  borderColor: getCategoryColor(category),
                  backgroundColor: `${getCategoryColor(category)}20`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                {config.label}
              </Chip>
            );
          })}
          {characterCount > 0 && (
            <Chip
              size="sm"
              variant="soft"
              className="glass text-xs"
              style={{
                borderColor: "var(--color-accent-secondary)",
                backgroundColor: "var(--color-accent-secondary)20",
              }}
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: "var(--color-accent-secondary)" }}
              />
              Characters
            </Chip>
          )}
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {(hoveredNode || hoveredLink) && !selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 right-4 glass rounded-lg p-3 max-w-xs z-10"
            >
              {hoveredNode && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {hoveredNode.type === "mythos"
                        ? getCategoryConfig(hoveredNode.category || "")?.icon || "📖"
                        : getInitials(hoveredNode.name)}
                    </span>
                    <p className="font-semibold text-[var(--color-text-primary)]">{hoveredNode.name}</p>
                  </div>
                  {hoveredNode.category && (
                    <p className="text-xs text-[var(--color-text-muted)] capitalize">
                      {getCategoryConfig(hoveredNode.category).label}
                    </p>
                  )}
                  {hoveredNode.type === "mythos" && (
                    <p className="text-xs text-[var(--color-accent-primary)] mt-1">Click to view details</p>
                  )}
                </div>
              )}
              {hoveredLink && !hoveredNode && (
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)] capitalize">
                    {hoveredLink.type.replace("_", " ")}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Strength: {hoveredLink.strength}/5
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected node panel */}
        <AnimatePresence>
          {selectedNode && (
            <NodeDetailsPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onNodeClick={onNodeClick}
            />
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

export default MythosGraph;
