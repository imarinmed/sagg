"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  Users,
  Info,
  X,
  GitBranch,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type RelationshipType =
  | "romantic"
  | "family"
  | "friend"
  | "enemy"
  | "servant"
  | "master"
  | "ally"
  | "rival";

export interface RelationshipNode {
  id: string;
  name: string;
  group: number;
  radius: number;
  color: string;
  metadata?: {
    role?: string;
    family?: string | null;
    portrayed_by?: string;
  };
  // D3 simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Relationship {
  source: string | RelationshipNode;
  target: string | RelationshipNode;
  type: RelationshipType | string;
  intensity: number;
  description?: string;
  color?: string;
  width?: number;
}

export interface RelationshipConstellationProps {
  characterId: string;
  relationships: Relationship[];
  width?: number;
  height?: number;
  onNodeClick?: (characterId: string) => void;
  className?: string;
}

// ============================================
// THEME-AWARE RELATIONSHIP COLORS
// ============================================

const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  romantic: "var(--romantic-crimson, #be185d)",
  family: "var(--familial-gold, #c9a227)",
  friend: "#4ade80",
  enemy: "var(--blood-crimson, #8b0000)",
  servant: "var(--training-purple, #8B5CF6)",
  master: "var(--nordic-gold, #d4af37)",
  ally: "#60a5fa",
  rival: "#f97316",
};

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  romantic: "Romantic",
  family: "Family",
  friend: "Friend",
  enemy: "Enemy",
  servant: "Servant",
  master: "Master",
  ally: "Ally",
  rival: "Rival",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getRelationshipColor(type: string): string {
  return RELATIONSHIP_COLORS[type as RelationshipType] || "var(--color-text-muted, #6b7280)";
}

function getRelationshipLabel(type: string): string {
  return RELATIONSHIP_LABELS[type as RelationshipType] || type;
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

function ConstellationLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)] rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-2 border-2 border-[var(--color-accent-secondary)]/30 rounded-full" />
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">Mapping constellation...</p>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function ConstellationEmpty() {
  return (
    <GlassCard className="flex flex-col items-center justify-center h-[500px]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-surface)] flex items-center justify-center">
          <Users className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
        <div>
          <h3 className="text-lg font-heading text-[var(--color-text-primary)]">
            No Relationships Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            This character has no visible connections in the network.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// FILTER COMPONENT
// ============================================

interface RelationshipFilterProps {
  availableTypes: RelationshipType[];
  selectedTypes: RelationshipType[];
  onToggle: (type: RelationshipType) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function RelationshipFilter({
  availableTypes,
  selectedTypes,
  onToggle,
  onSelectAll,
  onClearAll,
}: RelationshipFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setIsOpen(!isOpen)}
        className={`glass ${isOpen ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-secondary)]"}`}
      >
        <Filter className="w-4 h-4" />
        {selectedTypes.length !== availableTypes.length && (
          <span className="ml-1 text-xs">({selectedTypes.length})</span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-56 glass rounded-xl p-3 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--glass-border)]">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Filter Types
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
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => onToggle(type)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                      selectedTypes.includes(type)
                        ? "bg-[var(--color-accent-primary)]/10"
                        : "hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: getRelationshipColor(type) }}
                    />
                    <span
                      className={`text-sm capitalize ${
                        selectedTypes.includes(type)
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {getRelationshipLabel(type)}
                    </span>
                    {selectedTypes.includes(type) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
                    )}
                  </button>
                ))}
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
  node: RelationshipNode | null;
  relationships: Relationship[];
  onClose: () => void;
  onNodeClick?: (characterId: string) => void;
}

function NodeDetailsPanel({ node, relationships, onClose, onNodeClick }: NodeDetailsPanelProps) {
  if (!node) return null;

  const connectedRelationships = relationships.filter(
    (r) =>
      (typeof r.source === "string" ? r.source : r.source.id) === node.id ||
      (typeof r.target === "string" ? r.target : r.target.id) === node.id
  );

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
            {getInitials(node.name)}
          </div>
          <div>
            <h4 className="font-heading text-[var(--color-text-primary)]">{node.name}</h4>
            {node.metadata?.role && (
              <p className="text-xs text-[var(--color-text-muted)]">{node.metadata.role}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onPress={onClose} className="shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {node.metadata?.family && (
          <div>
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Family</span>
            <p className="text-sm text-[var(--color-text-secondary)]">{node.metadata.family}</p>
          </div>
        )}

        <div>
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Connections ({connectedRelationships.length})
          </span>
          <div className="mt-2 space-y-1.5">
            {connectedRelationships.slice(0, 5).map((rel, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getRelationshipColor(rel.type) }}
                />
                <span className="text-[var(--color-text-secondary)] capitalize">{rel.type}</span>
                <span className="text-[var(--color-text-muted)]">({rel.intensity}/5)</span>
              </div>
            ))}
          </div>
        </div>

        {onNodeClick && (
          <Button
            className="w-full mt-2"
            variant="secondary"
            onPress={() => onNodeClick(node.id)}
          >
            View Character
          </Button>
        )}
      </CardContent>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function RelationshipConstellation({
  characterId,
  relationships,
  width = 800,
  height = 600,
  onNodeClick,
  className = "",
}: RelationshipConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<RelationshipNode, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [dimensions, setDimensions] = useState({ width, height });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<RelationshipNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<Relationship | null>(null);
  const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<RelationshipType[]>([]);

  // Extract unique relationship types
  const availableTypes = useMemo(() => {
    const types = new Set<RelationshipType>();
    relationships.forEach((r) => types.add(r.type as RelationshipType));
    return Array.from(types);
  }, [relationships]);

  // Initialize selected types when available types change
  useEffect(() => {
    if (availableTypes.length > 0 && selectedTypes.length === 0) {
      setSelectedTypes(availableTypes);
    }
  }, [availableTypes, selectedTypes.length]);

  // Filter relationships by selected types
  const filteredRelationships = useMemo(() => {
    return relationships.filter((r) => selectedTypes.includes(r.type as RelationshipType));
  }, [relationships, selectedTypes]);

  // Build nodes from relationships
  const nodes = useMemo(() => {
    const nodeMap = new Map<string, RelationshipNode>();

    filteredRelationships.forEach((rel) => {
      const sourceId = typeof rel.source === "string" ? rel.source : rel.source.id;
      const targetId = typeof rel.target === "string" ? rel.target : rel.target.id;

      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, {
          id: sourceId,
          name: typeof rel.source === "string" ? sourceId : rel.source.name,
          group: sourceId === characterId ? 1 : 2,
          radius: sourceId === characterId ? 35 : 25,
          color:
            sourceId === characterId
              ? "var(--color-accent-primary, #D4AF37)"
              : "var(--color-accent-secondary, #8B0000)",
          metadata: typeof rel.source === "string" ? undefined : rel.source.metadata,
        });
      }

      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, {
          id: targetId,
          name: typeof rel.target === "string" ? targetId : rel.target.name,
          group: targetId === characterId ? 1 : 2,
          radius: targetId === characterId ? 35 : 25,
          color:
            targetId === characterId
              ? "var(--color-accent-primary, #D4AF37)"
              : "var(--color-accent-secondary, #8B0000)",
          metadata: typeof rel.target === "string" ? undefined : rel.target.metadata,
        });
      }
    });

    return Array.from(nodeMap.values());
  }, [filteredRelationships, characterId]);

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
    const nodeData: RelationshipNode[] = nodes.map((n) => ({ ...n }));
    const linkData = filteredRelationships.map((l) => ({
      ...l,
      source: typeof l.source === "string" ? l.source : l.source.id,
      target: typeof l.target === "string" ? l.target : l.target.id,
    }));

    // Fix central node position
    const centralNode = nodeData.find((n) => n.id === characterId);
    if (centralNode) {
      centralNode.fx = w / 2;
      centralNode.fy = h / 2;
    }

    // Create force simulation
    const simulation = d3
      .forceSimulation<RelationshipNode>(nodeData)
      .force(
        "link",
        d3
          .forceLink<RelationshipNode, any>(linkData)
          .id((d) => d.id)
          .distance((d) => 120 + (5 - d.intensity) * 15)
          .strength(0.4)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius((d) => (d as RelationshipNode).radius + 15));

    simulationRef.current = simulation;

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", (d) => d.color || getRelationshipColor(d.type))
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => d.width || Math.max(1, d.intensity))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.9).attr("stroke-width", (d.width || d.intensity) + 3);
        setHoveredLink(d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.5).attr("stroke-width", d.width || Math.max(1, d.intensity));
        setHoveredLink(null);
      });

    // Create nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, RelationshipNode>("g")
      .data(nodeData)
      .join("g")
      .style("cursor", (d) => (d.id === characterId ? "default" : "pointer"))
      .call(
        d3
          .drag<SVGGElement, RelationshipNode>()
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
            if (d.id !== characterId) {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on("mouseover", function (event, d) {
        setHoveredNode(d);
        d3.select(this).select("circle").attr("stroke-width", d.id === characterId ? 4 : 3);
      })
      .on("mouseout", function (event, d) {
        setHoveredNode(null);
        d3.select(this).select("circle").attr("stroke-width", d.id === characterId ? 3 : 2);
      })
      .on("click", (event, d) => {
        if (d.id !== characterId) {
          setSelectedNode(d);
          onNodeClick?.(d.id);
        }
      });

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", "var(--color-bg-primary, #080808)")
      .attr("stroke-width", (d) => (d.id === characterId ? 3 : 2))
      .attr("filter", (d) => (d.id === characterId ? "url(#node-glow)" : null));

    // Node initials
    node
      .append("text")
      .text((d) => getInitials(d.name))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "white")
      .attr("font-size", (d) => (d.id === characterId ? "14px" : "11px"))
      .attr("font-weight", "bold")
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
        .attr("x1", (d: any) => (d.source as RelationshipNode).x || 0)
        .attr("y1", (d: any) => (d.source as RelationshipNode).y || 0)
        .attr("x2", (d: any) => (d.target as RelationshipNode).x || 0)
        .attr("y2", (d: any) => (d.target as RelationshipNode).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Initial zoom
    const initialScale = 0.8;
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate((w * (1 - initialScale)) / 2, (h * (1 - initialScale)) / 2).scale(initialScale)
    );

    return () => {
      simulation.stop();
    };
  }, [nodes, filteredRelationships, characterId, dimensions, isLoading, onNodeClick]);

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
  const handleToggleType = useCallback((type: RelationshipType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTypes(availableTypes);
  }, [availableTypes]);

  const handleClearAll = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  // Render states
  if (isLoading) {
    return (
      <GlassCard className={className}>
        <ConstellationLoading />
      </GlassCard>
    );
  }

  if (relationships.length === 0) {
    return (
      <GlassCard className={className}>
        <ConstellationEmpty />
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`relative overflow-hidden ${className}`}>
      {/* Header */}
      <CardHeader className="flex items-center justify-between border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-[var(--color-accent-primary)]" />
          <div>
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">Relationship Constellation</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {nodes.length} characters • {filteredRelationships.length} connections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RelationshipFilter
            availableTypes={availableTypes}
            selectedTypes={selectedTypes}
            onToggle={handleToggleType}
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
          {selectedTypes.map((type) => (
            <Chip
              key={type}
              size="sm"
              variant="soft"
              className="glass text-xs capitalize"
              style={{
                borderColor: getRelationshipColor(type),
                backgroundColor: `${getRelationshipColor(type)}20`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: getRelationshipColor(type) }}
              />
              {getRelationshipLabel(type)}
            </Chip>
          ))}
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
                  <p className="font-semibold text-[var(--color-text-primary)]">{hoveredNode.name}</p>
                  {hoveredNode.metadata?.role && (
                    <p className="text-sm text-[var(--color-text-muted)]">{hoveredNode.metadata.role}</p>
                  )}
                  {hoveredNode.id !== characterId && (
                    <p className="text-xs text-[var(--color-accent-primary)] mt-1">Click to view</p>
                  )}
                </div>
              )}
              {hoveredLink && !hoveredNode && (
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)] capitalize">
                    {hoveredLink.type} Relationship
                  </p>
                  {hoveredLink.description && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{hoveredLink.description}</p>
                  )}
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Intensity: {hoveredLink.intensity}/5</p>
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
              relationships={filteredRelationships}
              onClose={() => setSelectedNode(null)}
              onNodeClick={onNodeClick}
            />
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

export default RelationshipConstellation;
