"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import {
  GraphVisualization,
  NodeDetailsPanel,
} from "@/components/GraphVisualization";
import { GlassCard, CardContent } from "@/components/GlassCard";
import { api, type GraphNode, type GraphData } from "@/lib/api";

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.graph.getFull();
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load graph data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-[var(--color-text-primary)]">
            Relationship Graph
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Interactive visualization of characters, episodes, and mythos elements
          </p>
        </div>
        <Button
          variant="ghost"
          onPress={fetchGraphData}
          isDisabled={loading}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <GlassCard className="border-[var(--color-accent-secondary)]/30">
          <CardContent>
            <p className="text-[var(--color-accent-secondary)]">{error}</p>
          </CardContent>
        </GlassCard>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Graph Visualization */}
        <div className="flex-1 min-h-[600px]">
          <GlassCard className="h-full" hover={false}>
            <CardContent className="p-0 h-full">
              {loading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-text-muted)]" />
                    <p className="text-[var(--color-text-muted)]">
                      Loading graph data...
                    </p>
                  </div>
                </div>
              ) : (
                <GraphVisualization
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  selectedNode={selectedNode}
                />
              )}
            </CardContent>
          </GlassCard>
        </div>

        {/* Details Panel */}
        {selectedNode && (
          <div className="lg:w-80">
            <NodeDetailsPanel node={selectedNode} onClose={handleClosePanel} />
          </div>
        )}
      </div>

      {/* Instructions */}
      <GlassCard>
        <CardContent>
          <h3 className="font-heading text-sm text-[var(--color-text-primary)] mb-2">
            How to use
          </h3>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
            <li>• Scroll to zoom in/out</li>
            <li>• Drag to pan the view</li>
            <li>• Click on a node to see details</li>
            <li>• Use the controls on the left to zoom</li>
          </ul>
        </CardContent>
      </GlassCard>
    </div>
  );
}
