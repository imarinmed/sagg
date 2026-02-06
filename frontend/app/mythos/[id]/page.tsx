"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Chip, Spinner } from "@heroui/react";
import {
  ChevronLeft,
  BookOpen,
  Link as LinkIcon,
  Sparkles,
  Shield,
  Flame,
  Eye,
} from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { LoreConnectionGraph } from "@/components/LoreConnectionGraph";
import { ForgeButton } from "@/components/ForgeButton";
import { CreativeCompanionPanel } from "@/components/CreativeCompanionPanel";
import { api, MythosElement, MythosConnection, MythosGraphData } from "@/lib/api";

const CATEGORY_STYLES: Record<string, string> = {
  biology: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  supernatural: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  society: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  psychology: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  rules: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  biology: "#e53e3e",
  society: "#805ad5",
  supernatural: "#3182ce",
  psychology: "#38a169",
  rules: "#d69e2e",
  default: "#6b7280",
};

function buildLocalGraph(
  element: MythosElement,
  connections: MythosConnection[],
  elements: MythosElement[]
): MythosGraphData {
  const elementMap = new Map(elements.map((e) => [e.id, e]));
  elementMap.set(element.id, element);

  const nodeIds = new Set<string>([element.id]);
  connections.forEach((c) => {
    nodeIds.add(c.from_element_id);
    nodeIds.add(c.to_element_id);
  });

  const nodes = Array.from(nodeIds).map((id) => {
    const data = elementMap.get(id);
    const category = data?.category?.toLowerCase() || "rules";
    return {
      id,
      name: data?.name || id,
      group: 1,
      radius: id === element.id ? 32 : 22,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
      metadata: {
        category: data?.category,
        short_description: data?.short_description,
      },
    };
  });

  const links = connections.map((c) => ({
    source: c.from_element_id,
    target: c.to_element_id,
    type: c.connection_type,
    value: c.strength,
    color: c.connection_type === "prerequisite" ? "#D4AF37" : "#6b7280",
  }));

  const categories = Array.from(
    new Set(
      nodes
        .map((node) => (node.metadata?.category || "").toString())
        .filter(Boolean)
    )
  );

  return {
    nodes,
    links,
    total_elements: nodes.length,
    total_connections: links.length,
    categories,
  };
}

export default function MythosDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mythosId = params.id as string;

  const [element, setElement] = useState<MythosElement | null>(null);
  const [connections, setConnections] = useState<MythosConnection[]>([]);
  const [elements, setElements] = useState<MythosElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("creative-panel-open");
    if (savedState === "true") {
      setIsPanelOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("creative-panel-open", String(isPanelOpen));
  }, [isPanelOpen]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [elementData, listData, connectionData] = await Promise.all([
          api.mythos.get(mythosId),
          api.mythos.list(),
          api.mythos.elementConnections(mythosId),
        ]);
        setElement(elementData);
        setElements(listData);
        setConnections(connectionData);
      } catch (err) {
        setError("Failed to load mythos element");
      } finally {
        setLoading(false);
      }
    };

    if (mythosId) {
      load();
    }
  }, [mythosId]);

  const graphData = useMemo(() => {
    if (!element) return null;
    return buildLocalGraph(element, connections, elements);
  }, [element, connections, elements]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !element) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-accent-secondary)]">
          {error || "Mythos element not found"}
        </p>
        <Link href="/mythos">
          <Button className="mt-4" variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Mythos
          </Button>
        </Link>
      </div>
    );
  }

  const categoryStyle = CATEGORY_STYLES[element.category?.toLowerCase()] || CATEGORY_STYLES.society;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <Link href="/mythos">
          <Button variant="ghost" className="text-[var(--color-text-secondary)]">
            <ChevronLeft className="w-4 h-4" />
            Mythos
          </Button>
        </Link>
        <ForgeButton onClick={() => setIsPanelOpen(true)} />
      </div>

      <GlassCard className="overflow-hidden">
        <CardContent className="p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full border ${categoryStyle}`}>
              {element.category}
            </span>
            {element.related_episodes?.length ? (
              <Chip
                size="sm"
                variant="soft"
                className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
              >
                {element.related_episodes.length} related episodes
              </Chip>
            ) : null}
          </div>

          <h1 className="font-heading text-3xl md:text-4xl text-[var(--color-text-primary)]">
            {element.name}
          </h1>

          {element.short_description && (
            <p className="text-lg text-[var(--color-text-secondary)]">
              {element.short_description}
            </p>
          )}

          {element.description && (
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              {element.description}
            </p>
          )}
        </CardContent>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                Core Traits
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {(element.traits || []).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Traits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {element.traits?.map((trait) => (
                    <Chip
                      key={trait}
                      size="sm"
                      variant="soft"
                      className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                    >
                      {trait}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {(element.abilities || []).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Abilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {element.abilities?.map((ability) => (
                    <Chip
                      key={ability}
                      size="sm"
                      variant="soft"
                      className="bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
                    >
                      {ability}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {(element.weaknesses || []).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Weaknesses
                </h3>
                <div className="flex flex-wrap gap-2">
                  {element.weaknesses?.map((weakness) => (
                    <Chip
                      key={weakness}
                      size="sm"
                      variant="soft"
                      className="bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]"
                    >
                      {weakness}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                Significance
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {element.significance && (
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[var(--color-text-muted)] mt-1" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {element.significance}
                </p>
              </div>
            )}
            {element.dark_variant && (
              <div className="flex items-start gap-2">
                <Flame className="w-4 h-4 text-[var(--color-accent-secondary)] mt-1" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {element.dark_variant}
                </p>
              </div>
            )}
            {element.horror_elements?.length ? (
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Horror Elements
                </p>
                <div className="flex flex-wrap gap-2">
                  {element.horror_elements.map((item) => (
                    <Chip
                      key={item}
                      size="sm"
                      variant="soft"
                      className="bg-red-500/10 text-red-300"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
            {element.taboo_potential && (
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-[var(--color-text-muted)] mt-1" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {element.taboo_potential}
                </p>
              </div>
            )}
          </CardContent>
        </GlassCard>
      </div>

      {(element.related_episodes?.length || element.related_characters?.length) && (
        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                Related Links
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {element.related_episodes?.length ? (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Episodes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {element.related_episodes.map((episodeId) => (
                    <Link key={episodeId} href={`/episodes/${episodeId}`}>
                      <Chip
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {episodeId.toUpperCase()}
                      </Chip>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {element.related_characters?.length ? (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Characters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {element.related_characters.map((characterId) => (
                    <Link key={characterId} href={`/characters/${characterId}`}>
                      <Chip
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {characterId.replace(/_/g, " ")}
                      </Chip>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </GlassCard>
      )}

      {graphData && graphData.nodes.length > 1 && (
        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                Lore Connections
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <LoreConnectionGraph
              data={graphData}
              onNodeClick={(nodeId) => {
                if (nodeId !== element.id) {
                  router.push(`/mythos/${nodeId}`);
                }
              }}
              height={420}
            />
          </CardContent>
        </GlassCard>
      )}

      <CreativeCompanionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        entityId={mythosId}
        entityType="mythos"
      />
    </div>
  );
}
