"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { 
  Button, 
  Card, 
  Chip
} from "@heroui/react";
import { 
  Filter, 
  RefreshCw, 
  Share2, 
  Sparkles,
  Download
} from "lucide-react";

export type NodeType = "character" | "mythos" | "episode" | "beat" | "inspiration";
export type EdgeType = "causal" | "inspirational" | "temporal" | "thematic" | "related" | "connects_to";

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  metadata?: {
    category?: string;
    tags?: string[];
    intensity?: number;
    narrative_version?: "bst" | "sst" | "both";
    season?: number;
    episode_number?: number;
    description?: string;
  };
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: EdgeType;
  strength?: number;
  label?: string;
  id?: string;
}

export interface EnhancedGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface EnhancedGraphViewProps {
  initialData: EnhancedGraphData;
  height?: number | string;
}

const NODE_COLORS: Record<NodeType, string> = {
  character: "var(--color-accent-primary)",
  mythos: "#8b5cf6",
  episode: "#3182ce",
  beat: "#38a169",
  inspiration: "#ff6b9d",
};

const NODE_RADIUS: Record<NodeType, number> = {
  character: 25,
  mythos: 20,
  episode: 30,
  beat: 12,
  inspiration: 15,
};

const EDGE_STYLES: Record<EdgeType, string> = {
  causal: "solid",
  inspirational: "dashed",
  temporal: "dotted",
  thematic: "wavy",
  related: "solid",
  connects_to: "solid",
};

const EDGE_COLORS: Record<EdgeType, string> = {
  causal: "#e53e3e",
  inspirational: "#ff6b9d",
  temporal: "#718096",
  thematic: "#805ad5",
  related: "#a0aec0",
  connects_to: "#cbd5e0",
};

export function EnhancedGraphView({ initialData, height = "85vh" }: EnhancedGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [data] = useState<EnhancedGraphData>(initialData);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  
  const [visibleNodeTypes, setVisibleNodeTypes] = useState<NodeType[]>(["character", "mythos", "episode", "beat", "inspiration"]);
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState<EdgeType[]>(["causal", "inspirational", "temporal", "thematic", "related", "connects_to"]);
  const [minIntensity] = useState(0);
  
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  const filteredGraph = useMemo(() => {
    const nodes = data.nodes.filter(n => {
      if (!visibleNodeTypes.includes(n.type)) return false;
      if (n.metadata?.intensity !== undefined && n.metadata.intensity < minIntensity) return false;
      return true;
    });
    
    const nodeIds = new Set(nodes.map(n => n.id));
    
    const edges = data.edges.filter(e => {
      if (!visibleEdgeTypes.includes(e.type)) return false;
      
      const sourceId = typeof e.source === 'object' ? (e.source as GraphNode).id : e.source;
      const targetId = typeof e.target === 'object' ? (e.target as GraphNode).id : e.target;
      return nodeIds.has(sourceId as string) && nodeIds.has(targetId as string);
    });

    if (isFocusMode && selectedNode) {
      const neighborIds = new Set<string>([selectedNode.id]);
      edges.forEach(e => {
        const sourceId = typeof e.source === 'object' ? (e.source as GraphNode).id : e.source;
        const targetId = typeof e.target === 'object' ? (e.target as GraphNode).id : e.target;
        if (sourceId === selectedNode.id) neighborIds.add(targetId as string);
        if (targetId === selectedNode.id) neighborIds.add(sourceId as string);
      });
      
      const focusNodes = nodes.filter(n => neighborIds.has(n.id));
      const focusEdges = edges.filter(e => {
        const sourceId = typeof e.source === 'object' ? (e.source as GraphNode).id : e.source;
        const targetId = typeof e.target === 'object' ? (e.target as GraphNode).id : e.target;
        return neighborIds.has(sourceId as string) && neighborIds.has(targetId as string);
      });
      
      return { nodes: focusNodes, edges: focusEdges };
    }

    return { nodes, edges };
  }, [data, visibleNodeTypes, visibleEdgeTypes, minIntensity, isFocusMode, selectedNode]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !filteredGraph.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        setTransform(event.transform);
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
    
    if (transform === d3.zoomIdentity) {
       svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.6));
    } else {
       svg.call(zoom.transform, transform);
    }

    const g = svg.append("g");
    g.attr("transform", transform.toString());

    const simulationNodes = filteredGraph.nodes.map(n => ({ ...n }));
    const simulationEdges = filteredGraph.edges.map(e => ({ ...e }));

    const simulation = d3.forceSimulation(simulationNodes)
      .force("link", d3.forceLink(simulationEdges).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide().radius((d: any) => (NODE_RADIUS[d.type as NodeType] || 20) + 10));

    simulationRef.current = simulation;

    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(simulationEdges)
      .join("line")
      .attr("stroke", (d) => EDGE_COLORS[d.type as EdgeType] || "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => (d.strength || 1) * 1.5)
      .attr("stroke-dasharray", (d) => {
        const style = EDGE_STYLES[d.type as EdgeType];
        if (style === "dashed") return "5,5";
        if (style === "dotted") return "2,2";
        return "none";
      });

    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(simulationNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any
      );

    node.append("circle")
      .attr("r", (d) => NODE_RADIUS[d.type as NodeType] || 20)
      .attr("fill", (d) => NODE_COLORS[d.type as NodeType] || "#ccc")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8);

    node.append("text")
      .text((d) => d.label)
      .attr("x", (d) => (NODE_RADIUS[d.type as NodeType] || 20) + 5)
      .attr("y", 5)
      .attr("font-size", "12px")
      .attr("fill", "var(--color-text-primary)")
      .attr("opacity", (d) => (d.type === "beat" || d.type === "inspiration") ? 0 : 1)
      .attr("class", "node-label transition-opacity duration-200");

    node.on("mouseover", (event, d) => {
      setHoveredNode(d);
      d3.select(event.currentTarget).select("circle").attr("stroke", "#fff").attr("stroke-width", 4);
      d3.select(event.currentTarget).select("text").attr("opacity", 1);
      
      link.attr("stroke-opacity", (l) => (l.source === d || l.target === d ? 1 : 0.1));
      link.attr("stroke-width", (l) => (l.source === d || l.target === d ? 3 : 1));
    })
    .on("mouseout", (event, d) => {
      setHoveredNode(null);
      d3.select(event.currentTarget).select("circle").attr("stroke", "#fff").attr("stroke-width", 2);
      if (d.type === "beat" || d.type === "inspiration") {
        d3.select(event.currentTarget).select("text").attr("opacity", 0);
      }
      
      link.attr("stroke-opacity", 0.6);
      link.attr("stroke-width", (l) => (l.strength || 1) * 1.5);
    })
    .on("click", (event, d) => {
      event.stopPropagation();
      setSelectedNode(d === selectedNode ? null : d);
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [filteredGraph, dimensions]);

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(0.6));
    }
    setSelectedNode(null);
    setIsFocusMode(false);
  };

  const handleDiscover = () => {
    const randomNode = filteredGraph.nodes[Math.floor(Math.random() * filteredGraph.nodes.length)];
    if (randomNode) {
      setSelectedNode(randomNode);
      setIsFocusMode(true);
    }
  };

  const handleExport = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "lore-graph.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--color-bg-secondary)]/50 backdrop-blur-md rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--color-accent-primary)]" />
            Lore Graph
          </h2>
          <div className="h-6 w-px bg-[var(--color-border)]" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-text-muted)]">{filteredGraph.nodes.length} Nodes</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-text-muted)]">{filteredGraph.edges.length} Edges</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onPress={handleDiscover}
            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Discover
          </Button>
          <Button size="sm" variant="ghost" isIconOnly onPress={handleExport} aria-label="Export SVG">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" isIconOnly onPress={handleReset} aria-label="Reset View">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[600px]">
        <Card className="w-full lg:w-80 flex-shrink-0 bg-[var(--color-bg-secondary)]/30 backdrop-blur-md border-[var(--color-border)]">
          <div className="p-4 gap-6 flex flex-col">
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Node Types
              </h3>
              <div className="flex flex-col gap-2">
                {(Object.keys(NODE_COLORS) as NodeType[]).map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox"
                        checked={visibleNodeTypes.includes(type)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setVisibleNodeTypes(prev => 
                            checked ? [...prev, type] : prev.filter(t => t !== type)
                          );
                        }}
                        className="rounded border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: NODE_COLORS[type] }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Edge Types</h3>
              <div className="flex flex-col gap-2">
                {(Object.keys(EDGE_COLORS) as EdgeType[]).map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox"
                        checked={visibleEdgeTypes.includes(type)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setVisibleEdgeTypes(prev => 
                            checked ? [...prev, type] : prev.filter(t => t !== type)
                          );
                        }}
                        className="rounded border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                      />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </label>
                    <div 
                      className="w-8 h-0.5" 
                      style={{ 
                        backgroundColor: EDGE_COLORS[type],
                        borderTopStyle: EDGE_STYLES[type] as any,
                        borderTopWidth: 2
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Focus Mode</span>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="checkbox"
                    checked={isFocusMode}
                    onChange={(e) => setIsFocusMode(e.target.checked)}
                    disabled={!selectedNode}
                    className="rounded border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)] disabled:opacity-50"
                  />
                  Enable
                </label>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Select a node to focus on its immediate connections.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex-1 relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
          <div ref={containerRef} className="w-full h-full" style={{ height }}>
            <svg ref={svgRef} width="100%" height="100%" className="touch-none" />
          </div>

          {(hoveredNode || selectedNode) && (
            <div className="absolute top-4 right-4 w-64 pointer-events-none">
              <Card className="bg-black/80 backdrop-blur-md border-white/10">
                <div className="p-3">
                  {(hoveredNode || selectedNode) && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: NODE_COLORS[(hoveredNode || selectedNode)!.type] }} 
                        />
                        <span className="text-xs uppercase tracking-wider opacity-70">
                          {(hoveredNode || selectedNode)!.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-white mb-1">
                        {(hoveredNode || selectedNode)!.label}
                      </h4>
                      {(hoveredNode || selectedNode)!.metadata?.description && (
                        <p className="text-xs text-white/70 line-clamp-3 mb-2">
                          {(hoveredNode || selectedNode)!.metadata!.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(hoveredNode || selectedNode)!.metadata?.tags?.slice(0, 3).map(tag => (
                          <Chip key={tag} size="sm" variant="secondary" className="text-[10px] h-5">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 pointer-events-none">
            <div className="flex gap-2">
              <div className="bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/5 text-[10px] text-white/50">
                Scroll to Zoom • Drag to Pan • Click to Select
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
