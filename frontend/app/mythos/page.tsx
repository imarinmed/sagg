"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, Spinner, Button } from "@heroui/react";
import { BookOpen, Network, Calendar, Sparkles } from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { MythosVisualEncyclopedia } from "@/components/MythosVisualEncyclopedia";
import { LoreConnectionGraph } from "@/components/LoreConnectionGraph";
import { MythosTimeline } from "@/components/MythosTimeline";
import { api, MythosElement, MythosGraphData } from "@/lib/api";

export default function MythosPage() {
  const [elements, setElements] = useState<MythosElement[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<MythosGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("encyclopedia");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [elementsData, categoryData, graph] = await Promise.all([
          api.mythos.list(),
          api.mythos.categories(),
          api.mythos.graph(),
        ]);
        setElements(elementsData);
        setCategories(categoryData);
        setGraphData(graph);
      } catch (err) {
        setError("Failed to load mythos data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    return {
      elements: elements.length,
      categories: categories.length,
      connections: graphData?.total_connections || 0,
    };
  }, [elements, categories, graphData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-accent-secondary)]">{error}</p>
        <Button className="mt-4" variant="ghost" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            Mythos
          </h1>
        </div>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          A visual encyclopedia of vampire lore, rituals, and the rules that shape Blod's dark
          mythology.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.elements}</p>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Elements
              </p>
            </CardContent>
          </GlassCard>
          <GlassCard>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.categories}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Categories
              </p>
            </CardContent>
          </GlassCard>
          <GlassCard>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.connections}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Connections
              </p>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tabs.List className="glass rounded-lg p-1 mb-6">
          <Tabs.Tab key="encyclopedia">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Encyclopedia
            </div>
          </Tabs.Tab>
          <Tabs.Tab key="graph">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Lore Graph
            </div>
          </Tabs.Tab>
          <Tabs.Tab key="timeline">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </div>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel key="encyclopedia">
          <MythosVisualEncyclopedia elements={elements} categories={categories} />
        </Tabs.Panel>

        <Tabs.Panel key="graph">
          {graphData ? (
            <GlassCard>
              <CardHeader>
                <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                  Lore Connections
                </h2>
              </CardHeader>
              <CardContent>
                <LoreConnectionGraph
                  data={graphData}
                  onNodeClick={(nodeId) => {
                    window.location.href = `/mythos/${nodeId}`;
                  }}
                />
              </CardContent>
            </GlassCard>
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel key="timeline">
          <GlassCard>
            <CardHeader>
              <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                Lore Timeline
              </h2>
            </CardHeader>
            <CardContent>
              <MythosTimeline elements={elements} />
            </CardContent>
          </GlassCard>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
