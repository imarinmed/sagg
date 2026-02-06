"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, Button } from "@heroui/react";
import { GitBranch, Clock, ArrowRight } from "lucide-react";

interface TimelineNode {
  id: string;
  label: string;
  timestamp: string;
  episode: string;
  type: "bst" | "sst" | "branch" | "merge";
  description: string;
  children?: string[];
  parent?: string;
}

interface BranchingTimelineProps {
  nodes: TimelineNode[];
  height?: number;
}

export function BranchingTimeline({ nodes, height = 600 }: BranchingTimelineProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showBranches, setShowBranches] = useState(true);

  const { bstNodes, sstNodes, branchPoints } = useMemo(() => {
    const bst = nodes.filter((n) => n.type === "bst" || n.type === "branch");
    const sst = nodes.filter((n) => n.type === "sst" || n.type === "branch");
    const branches = nodes.filter((n) => n.type === "branch" || n.type === "merge");
    return { bstNodes: bst, sstNodes: sst, branchPoints: branches };
  }, [nodes]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "bst":
        return "#3b82f6"; // blue
      case "sst":
        return "#ef4444"; // red
      case "branch":
        return "#8b5cf6"; // purple
      case "merge":
        return "#10b981"; // green
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-[var(--color-accent-primary)]" />
          <h2 className="text-xl font-bold font-heading">Branching Timeline</h2>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setShowBranches(!showBranches)}
        >
          {showBranches ? "Hide Branches" : "Show Branches"}
        </Button>
      </div>

      <Card
        className="relative overflow-hidden"
        style={{ height }}
      >
        <div className="absolute inset-0 p-6 overflow-auto">
          {/* Main Timeline Track */}
          <div className="relative">
            {/* BST Timeline */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                BST Timeline (Canonical)
              </h3>
              <div className="space-y-3">
                {bstNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === node.id
                        ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50"
                    }`}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getNodeColor(node.type) }}
                        />
                        <div>
                          <p className="font-medium">{node.label}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {node.episode} • {node.timestamp}
                          </p>
                        </div>
                      </div>
                      {node.children && node.children.length > 0 && showBranches && (
                        <ArrowRight className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      )}
                    </div>                    
                    {selectedNode === node.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-[var(--color-border)]"
                      >
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {node.description}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Branch Points */}
            {showBranches && branchPoints.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-4 text-purple-400 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Branch Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {branchPoints.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5"
                    >
                      <p className="font-medium">{node.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {node.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SST Timeline */}
            {showBranches && (
              <div>
                <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  SST Timeline (Dark Adaptation)
                </h3>
                <div className="space-y-3">
                  {sstNodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedNode === node.id
                          ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10"
                          : "border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50"
                      }`}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getNodeColor(node.type) }}
                        />
                        <div>
                          <p className="font-medium">{node.label}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {node.episode} • {node.timestamp}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BranchingTimeline;
