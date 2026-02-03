"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import {
  GraphVisualization,
  NodeDetailsPanel,
} from "@/components/GraphVisualization";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Relationship Graph
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive visualization of characters, episodes, and mythos elements
          </p>
        </div>
        <Button
          variant="secondary"
          onPress={fetchGraphData}
          isDisabled={loading}
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
        <Card variant="secondary" className="border-red-200 dark:border-red-800">
          <Card.Content className="p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </Card.Content>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Graph Visualization */}
        <div className="flex-1 min-h-[600px]">
          <Card className="h-full">
            <Card.Content className="p-0 h-full">
              {loading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
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
            </Card.Content>
          </Card>
        </div>

        {/* Details Panel */}
        {selectedNode && (
          <div className="lg:w-80">
            <NodeDetailsPanel node={selectedNode} onClose={handleClosePanel} />
          </div>
        )}
      </div>

      {/* Instructions */}
      <Card variant="transparent">
        <Card.Content className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            How to use
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Scroll to zoom in/out</li>
            <li>• Drag to pan the view</li>
            <li>• Click on a node to see details</li>
            <li>• Use the controls on the left to zoom</li>
          </ul>
        </Card.Content>
      </Card>
    </div>
  );
}
