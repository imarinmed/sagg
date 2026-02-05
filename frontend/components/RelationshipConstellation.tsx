"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { Tooltip } from "@heroui/react";
import Link from "next/link";

interface GraphNode {
  id: string;
  name: string;
  group: number;
  radius: number;
  color: string;
  metadata?: {
    role?: string;
    family?: string | null;
  };
  // D3 force simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  intensity: number;
  description?: string;
  color: string;
  width: number;
}

interface RelationshipConstellationProps {
  characterId: string;
  nodes: GraphNode[];
  links: GraphLink[];
  centralCharacterName: string;
  onNodeClick?: (characterId: string) => void;
  width?: number;
  height?: number;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  romantic: "#ff6b9d",
  family: "#D4AF37",
  friend: "#4ade80",
  antagonist: "#ef4444",
  sire: "#8B5CF6",
  progeny: "#a78bfa",
  ally: "#60a5fa",
  rival: "#f97316",
  default: "#6b7280",
};

export function RelationshipConstellation({
  characterId,
  nodes,
  links,
  centralCharacterName,
  onNodeClick,
  width = 600,
  height = 500,
}: RelationshipConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || width,
          height: Math.min(rect.width * 0.8, height),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [width, height]);

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width: w, height: h } = dimensions;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Prepare data - clone to avoid mutation
    const nodeData: GraphNode[] = nodes.map((n) => ({ ...n }));
    const linkData: GraphLink[] = links.map((l) => ({
      ...l,
      source: typeof l.source === "string" ? l.source : l.source.id,
      target: typeof l.target === "string" ? l.target : l.target.id,
    }));

    // Find central node and fix its position
    const centralNode = nodeData.find((n) => n.id === characterId);
    if (centralNode) {
      centralNode.fx = w / 2;
      centralNode.fy = h / 2;
      centralNode.group = 1;
      centralNode.radius = 35;
      centralNode.color = "#D4AF37";
    }

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodeData)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(linkData)
          .id((d) => d.id)
          .distance((d) => 100 + (5 - d.intensity) * 20)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius((d) => (d as GraphNode).radius + 10));

    // Create gradient definitions for links
    const defs = svg.append("defs");

    // Glow filter for central node
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", (d) => d.color || RELATIONSHIP_COLORS[d.type] || RELATIONSHIP_COLORS.default)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => d.width || Math.max(1, d.intensity))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-opacity", 1).attr("stroke-width", (d.width || d.intensity) + 2);
        setHoveredLink(d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.6).attr("stroke-width", d.width || Math.max(1, d.intensity));
        setHoveredLink(null);
      });

    // Create node groups
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
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
        d3.select(this).select("circle").attr("stroke-width", 3);
      })
      .on("mouseout", function (event, d) {
        setHoveredNode(null);
        d3.select(this).select("circle").attr("stroke-width", d.id === characterId ? 3 : 2);
      })
      .on("click", (event, d) => {
        if (onNodeClick && d.id !== characterId) {
          onNodeClick(d.id);
        }
      });

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => (d.id === characterId ? "#D4AF37" : "rgba(255,255,255,0.3)"))
      .attr("stroke-width", (d) => (d.id === characterId ? 3 : 2))
      .attr("filter", (d) => (d.id === characterId ? "url(#glow)" : null));

    // Node initials
    node
      .append("text")
      .text((d) =>
        d.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "white")
      .attr("font-size", (d) => (d.id === characterId ? "14px" : "11px"))
      .attr("font-weight", "bold")
      .style("pointer-events", "none");

    // Node labels (name below)
    node
      .append("text")
      .text((d) => d.name.split(" ")[0])
      .attr("text-anchor", "middle")
      .attr("y", (d) => d.radius + 14)
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", "10px")
      .style("pointer-events", "none");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x || 0)
        .attr("y1", (d) => (d.source as GraphNode).y || 0)
        .attr("x2", (d) => (d.target as GraphNode).x || 0)
        .attr("y2", (d) => (d.target as GraphNode).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Initial zoom to fit
    const initialScale = 0.85;
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(w * (1 - initialScale) / 2, h * (1 - initialScale) / 2).scale(initialScale)
    );

    return () => {
      simulation.stop();
    };
  }, [nodes, links, characterId, dimensions, onNodeClick]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">
        No relationship data available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Legend */}
      <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-2 text-xs">
        {Object.entries(RELATIONSHIP_COLORS)
          .filter(([key]) => key !== "default")
          .map(([type, color]) => (
            <div
              key={type}
              className="flex items-center gap-1 px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-white/70 capitalize">{type}</span>
            </div>
          ))}
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-[var(--color-surface)]/50 rounded-lg"
        style={{ minHeight: "400px" }}
      />

      {/* Hover info panel */}
      {(hoveredNode || hoveredLink) && (
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
          {hoveredNode && (
            <div>
              <p className="font-semibold text-white">{hoveredNode.name}</p>
              {hoveredNode.metadata?.role && (
                <p className="text-sm text-white/60 mt-1 line-clamp-2">
                  {hoveredNode.metadata.role}
                </p>
              )}
              {hoveredNode.id !== characterId && (
                <p className="text-xs text-[#D4AF37] mt-2">
                  Click to view character
                </p>
              )}
            </div>
          )}
          {hoveredLink && !hoveredNode && (
            <div>
              <p className="font-semibold text-white capitalize">
                {hoveredLink.type} Relationship
              </p>
              {hoveredLink.description && (
                <p className="text-sm text-white/60 mt-1">
                  {hoveredLink.description}
                </p>
              )}
              <p className="text-xs text-white/40 mt-1">
                Intensity: {hoveredLink.intensity}/5
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-xs text-white/40">
        Drag to rearrange • Scroll to zoom • Click node to view
      </div>
    </div>
  );
}
