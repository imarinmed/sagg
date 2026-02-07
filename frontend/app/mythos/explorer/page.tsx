"use client";

import { useState, useEffect } from "react";
import { Spinner, Button, Chip } from "@heroui/react";
import { Network, ArrowLeft, Info, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import { LoreConnectionGraph } from "@/components/LoreConnectionGraph";
import { api, type MythosGraphData } from "@/lib/api";

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

export default function LoreTreeExplorerPage() {
  const [data, setData] = useState<MythosGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const graphData = await api.mythos.graph();
      setData(graphData);
    } catch (err) {
      console.error("Failed to fetch mythos graph:", err);
      setError("Failed to load the lore tree. The archives are currently inaccessible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNodeClick = (nodeId: string) => {
    console.log("Clicked node:", nodeId);
  };

  return (
    <div className="min-h-screen pb-8 relative overflow-hidden">
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] -z-20" />
      <div className="fog-overlay fixed inset-0 -z-10 opacity-50 pointer-events-none" aria-hidden="true" />
      <div className="fog-overlay-deep fixed inset-0 -z-10 opacity-30 pointer-events-none" aria-hidden="true" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/mythos">
            <Button 
              variant="ghost" 
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mythos
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onPress={fetchData}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] min-w-10 px-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="glass p-6 rounded-xl mb-6 animate-fade-in border border-[var(--color-border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Network className="w-32 h-32 text-[var(--color-accent-primary)]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-text-primary)] mb-2 text-glow">
                  Lore Tree Explorer
                </h1>
                <p className="text-[var(--color-text-secondary)] max-w-2xl">
                  Visualize the intricate web of connections between mythos elements. 
                  Explore how biology, society, and supernatural forces intertwine to shape the world.
                </p>
              </div>
              
              {data && (
                <div className="flex gap-4 text-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-[var(--color-accent-primary)]">{data.total_elements}</span>
                    <span className="text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Elements</span>
                  </div>
                  <div className="w-px bg-[var(--color-border)]" />
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-[var(--color-accent-secondary)]">{data.total_connections}</span>
                    <span className="text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Connections</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex flex-wrap gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== 'default').map(([category, color]) => (
                    <div key={category} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs capitalize text-[var(--color-text-secondary)]">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Connections</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CONNECTION_COLORS).filter(([k]) => k !== 'default').map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5" style={{ backgroundColor: color }} />
                      <span className="text-xs capitalize text-[var(--color-text-secondary)]">{type.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-[calc(100vh-340px)] min-h-[500px]">
        {loading ? (
          <div className="w-full h-full glass rounded-xl flex flex-col items-center justify-center gap-4 border border-[var(--color-border)]">
            <Spinner size="lg" color="warning" />
            <p className="text-[var(--color-text-muted)] animate-pulse">Summoning the archives...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full glass rounded-xl flex flex-col items-center justify-center gap-4 border border-red-900/30 bg-red-950/10">
            <Info className="w-12 h-12 text-red-500" />
            <p className="text-red-400 max-w-md text-center">{error}</p>
            <Button variant="ghost" onPress={fetchData} className="text-red-500 hover:bg-red-500/10">
              Try Again
            </Button>
          </div>
        ) : data ? (
          <div className="w-full h-full glass rounded-xl p-1 border border-[var(--color-border)] shadow-2xl shadow-black/50 overflow-hidden">
            <LoreConnectionGraph 
              data={data} 
              onNodeClick={handleNodeClick}
              height={800}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
