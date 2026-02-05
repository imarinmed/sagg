"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@heroui/react";
import { Filter } from "lucide-react";
import type { MythosGraphData, MythosGraphNode, MythosGraphLink } from "@/lib/api";

interface LoreConnectionGraphProps {
  data: MythosGraphData;
  onNodeClick?: (nodeId: string) => void;
  height?: number;
}

interface SimulationNode extends MythosGraphNode, d3.SimulationNodeDatum {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: SimulationNode | string;
  target: SimulationNode | string;
  type: string;
  value: number;
  color?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  biology: "#e53e3e",
  society: "#805ad5",
  supernatural: "#3182ce",
  psychology: "#38a169",
  rules: "#d69e2e",
  default: "#6b7280",
};

const CONNECTION_COLORS: Record<string, string> = {
  prerequisite: "#D4AF37",
  evolves_to: "#8B5CF6",
  explains: "#60a5fa",
  related: "#94a3b8",
  contradicts: "#ef4444",
  default: "#6b7280",
};

export function LoreConnectionGraph({ data, onNodeClick, height = 560 }: LoreConnectionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeConnectionType, setActiveConnectionType] = useState("all");
  const [hoveredNode, setHoveredNode] = useState<MythosGraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<MythosGraphLink | null>(null);

  const categories = useMemo(() => {
    const base = data.categories?.length
      ? data.categories
      : data.nodes.map((n) => n.metadata?.category || "unknown");
    const unique = Array.from(new Set(base.map((c) => String(c).toLowerCase())));
    return ["all", ...unique.filter((c) => c && c !== "unknown")];
  }, [data]);

  const connectionTypes = useMemo(() => {
    const unique = Array.from(new Set(data.links.map((l) => l.type.toLowerCase())));
    return ["all", ...unique];
  }, [data]);

  const filteredData = useMemo(() => {
    const filteredNodes = data.nodes.filter((node) => {
      if (activeCategory === "all") return true;
      const category = (node.metadata?.category || "").toString().toLowerCase();
      return category === activeCategory;
    });

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = data.links.filter((link) => {
      const type = link.type.toLowerCase();
      const passType = activeConnectionType === "all" || type === activeConnectionType;
      return passType && nodeIds.has(link.source) && nodeIds.has(link.target);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [data, activeCategory, activeConnectionType]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [height]);

  useEffect(() => {
    if (!svgRef.current || filteredData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height: h } = dimensions;
    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const nodeData: SimulationNode[] = filteredData.nodes.map((n) => ({ ...n }));
    const linkData: SimulationLink[] = filteredData.links.map((l) => ({
      ...l,
      source: l.source,
      target: l.target,
    }));

    const simulation = d3
      .forceSimulation<SimulationNode>(nodeData)
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationLink>(linkData)
          .id((d) => d.id)
          .distance((d) => 100 + (5 - d.value) * 15)
          .strength(0.4)
      )
      .force("charge", d3.forceManyBody().strength(-240))
      .force("center", d3.forceCenter(width / 2, h / 2))
      .force("collision", d3.forceCollide<SimulationNode>().radius((d) => (d.radius || 18) + 10));

    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", (d) => d.color || CONNECTION_COLORS[d.type] || CONNECTION_COLORS.default)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.max(1, d.value))
      .on("mouseover", function (_, d) {
        d3.select(this).attr("stroke-opacity", 1);
        setHoveredLink({
          source: typeof d.source === "string" ? d.source : d.source.id,
          target: typeof d.target === "string" ? d.target : d.target.id,
          type: d.type,
          value: d.value,
          color: d.color,
        });
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", 0.6);
        setHoveredLink(null);
      });

    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, SimulationNode>("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .on("mouseover", (_, d) => {
        setHoveredNode(d);
      })
      .on("mouseout", () => {
        setHoveredNode(null);
      })
      .on("click", (_, d) => {
        onNodeClick?.(d.id);
      });

    node
      .append("circle")
      .attr("r", (d) => d.radius || 20)
      .attr("fill", (d) => d.color || CATEGORY_COLORS[(d.metadata?.category || "").toString().toLowerCase()] || CATEGORY_COLORS.default)
      .attr("stroke", "rgba(255,255,255,0.25)")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("y", (d) => (d.radius || 20) + 14)
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", "10px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimulationNode).x || 0)
        .attr("y1", (d) => (d.source as SimulationNode).y || 0)
        .attr("x2", (d) => (d.target as SimulationNode).x || 0)
        .attr("y2", (d) => (d.target as SimulationNode).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData, dimensions, onNodeClick]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
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
          {connectionTypes.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={activeConnectionType === type ? "secondary" : "ghost"}
              className={
                activeConnectionType === type
                  ? "bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]"
                  : "text-[var(--color-text-muted)]"
              }
              onPress={() => setActiveConnectionType(type)}
            >
              {type === "all" ? "All Links" : type}
            </Button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full min-h-[420px] bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden border border-[var(--color-border)]"
      >
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />

        {(hoveredNode || hoveredLink) && (
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            {hoveredNode && (
              <div>
                <p className="font-semibold text-white">{hoveredNode.name}</p>
                {hoveredNode.metadata?.category && (
                  <p className="text-xs text-white/60 mt-1 capitalize">
                    {hoveredNode.metadata.category}
                  </p>
                )}
              </div>
            )}
            {hoveredLink && !hoveredNode && (
              <div>
                <p className="font-semibold text-white capitalize">{hoveredLink.type}</p>
                <p className="text-xs text-white/60 mt-1">Strength: {hoveredLink.value}/5</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
