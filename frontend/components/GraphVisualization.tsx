"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { Button } from "@heroui/react";
import { ZoomIn, ZoomOut, Maximize, X } from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import type { GraphNode, GraphEdge, GraphData } from "@/lib/api";

interface SimulationNode extends GraphNode, d3.SimulationNodeDatum {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationEdge {
  source: SimulationNode | string;
  target: SimulationNode | string;
  edge_type: string;
  label?: string;
}

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  selectedNode?: GraphNode | null;
}

const NODE_COLORS = {
  episode: "var(--color-accent-primary)",
  character: "var(--color-accent-secondary)",
  mythos: "#B76E79", // Rose gold for mythos
};

const NODE_SIZES = {
  episode: 25,
  character: 20,
  mythos: 18,
};

export function GraphVisualization({
  data,
  onNodeClick,
  selectedNode,
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize D3 graph
  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Create main group for zoom
    const g = svg.append("g");

    // Create arrow marker for edges
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "var(--color-text-muted)");

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.edges)
      .enter()
      .append("line")
      .attr("stroke", "var(--color-text-muted)")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrowhead)");

    // Create nodes group
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => NODE_SIZES[d.node_type])
      .attr("fill", (d) => NODE_COLORS[d.node_type])
      .attr("stroke", "var(--color-bg-primary)")
      .attr("stroke-width", 2)
      .attr("class", "transition-all duration-200");

    // Add labels to nodes
    node
      .append("text")
      .text((d) => d.label)
      .attr("x", 0)
      .attr("y", (d) => NODE_SIZES[d.node_type] + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("fill", "var(--color-text-primary)");

    // Add click handler
    node.on("click", (event, d) => {
      event.stopPropagation();
      onNodeClick?.(d);
    });

    // Add hover effects
    node
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", NODE_SIZES[d.node_type] * 1.2)
          .attr("stroke-width", 3);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", NODE_SIZES[d.node_type])
          .attr("stroke-width", 2);
      });

    // Create simulation
    const simulation = d3
      .forceSimulation<SimulationNode>(data.nodes as SimulationNode[])
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationEdge>(data.edges as SimulationEdge[])
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    simulationRef.current = simulation;

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (typeof d.source === "object" ? d.source.x : 0))
        .attr("y1", (d: any) => (typeof d.source === "object" ? d.source.y : 0))
        .attr("x2", (d: any) => (typeof d.target === "object" ? d.target.x : 0))
        .attr("y2", (d: any) => (typeof d.target === "object" ? d.target.y : 0));

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom as any);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick]);

  // Update selected node styling
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    svg
      .selectAll(".node circle")
      .attr("stroke", (d: any) =>
        selectedNode?.id === d.id ? "var(--color-accent-primary)" : "var(--color-bg-primary)"
      )
      .attr("stroke-width", (d: any) =>
        selectedNode?.id === d.id ? 4 : 2
      );
  }, [selectedNode]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy as any, 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy as any, 0.7);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(500)
      .call(zoomRef.current.transform as any, d3.zoomIdentity);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden"
    >
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          onPress={handleZoomIn}
          className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleZoomOut}
          className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleResetZoom}
          className="glass text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]"
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <GlassCard className="absolute top-4 right-4 z-10" hover={false}>
        <CardContent className="p-3 space-y-2">
          <h4 className="text-sm font-heading text-[var(--color-text-primary)]">
            Legend
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: NODE_COLORS.episode }}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Episodes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: NODE_COLORS.character }}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: NODE_COLORS.mythos }}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Mythos
              </span>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-10 text-xs text-[var(--color-text-muted)] glass px-3 py-2 rounded-lg">
        <div>Nodes: {data.nodes.length}</div>
        <div>Edges: {data.edges.length}</div>
      </div>

      {/* SVG */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
}

interface NodeDetailsPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  if (!node) return null;

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case "episode":
        return "Episode";
      case "character":
        return "Character";
      case "mythos":
        return "Mythos Element";
      default:
        return type;
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "episode":
        return "bg-[var(--color-accent-primary)]";
      case "character":
        return "bg-[var(--color-accent-secondary)]";
      case "mythos":
        return "bg-rose-400";
      default:
        return "bg-[var(--color-text-muted)]";
    }
  };

  return (
    <GlassCard className="w-full lg:w-80 h-fit">
      <CardHeader className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getNodeTypeColor(node.node_type)}`} />
          <div>
            <h3 className="font-heading text-lg text-[var(--color-text-primary)]">{node.label}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{getNodeTypeLabel(node.node_type)}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onPress={onClose} 
          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-heading text-[var(--color-text-primary)]">
              Details
            </h4>
            <div className="space-y-1.5">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)] capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {node.node_type === "character" && node.metadata?.role && (
          <div className="space-y-2">
            <h4 className="text-sm font-heading text-[var(--color-text-primary)]">
              Role
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {node.metadata.role}
            </p>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
