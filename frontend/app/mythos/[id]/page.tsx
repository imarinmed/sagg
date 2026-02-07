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
  Info,
  Share2
} from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { LoreConnectionGraph } from "@/components/LoreConnectionGraph";
import { ForgeButton } from "@/components/ForgeButton";
import { CreativeCompanionPanel } from "@/components/CreativeCompanionPanel";
import { ArchiveLayout, SectionNumber, EntityDataCard } from "@/components/archive";
import { getMythos, listMythos, getMythosElementConnections } from "@/lib/kb";
import { MythosElement, MythosConnection, MythosGraphData } from "@/lib/api";
import { motion } from "framer-motion";

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
          getMythos(mythosId),
          listMythos(),
          getMythosElementConnections(mythosId),
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

  const relatedLore = useMemo(() => {
    if (!element || !connections.length || !elements.length) return [];
    const relatedIds = new Set<string>();
    connections.forEach((c) => {
      if (c.from_element_id !== element.id) relatedIds.add(c.from_element_id);
      if (c.to_element_id !== element.id) relatedIds.add(c.to_element_id);
    });
    return elements.filter((e) => relatedIds.has(e.id));
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
  const categoryColor = CATEGORY_COLORS[element.category?.toLowerCase()] || CATEGORY_COLORS.default;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Left sidebar content - Navigation
  const leftSidebar = (
    <div className="space-y-6">
      <Link href="/mythos">
        <Button variant="ghost" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-full justify-start">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Encyclopedia
        </Button>
      </Link>
      
      <nav className="flex flex-col space-y-1" aria-label="Section navigation">
        <button
          onClick={() => scrollToSection('reference')}
          className="group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
        >
          <span>Reference</span>
          <span className="text-xs font-mono text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100">01</span>
        </button>
        <button
          onClick={() => scrollToSection('narrative')}
          className="group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
        >
          <span>Narrative</span>
          <span className="text-xs font-mono text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100">02</span>
        </button>
        <button
          onClick={() => scrollToSection('connections')}
          className="group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
        >
          <span>Connections</span>
          <span className="text-xs font-mono text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100">03</span>
        </button>
      </nav>
    </div>
  );

  // Right sidebar content - EntityDataCard and Graph
  const rightSidebar = (
    <div className="space-y-6">
      <EntityDataCard
        name={element.name}
        metrics={{
          traits: element.traits?.length || 0,
          abilities: element.abilities?.length || 0,
          weaknesses: element.weaknesses?.length || 0,
        }}
      />
      
      {graphData && graphData.nodes.length > 1 && (
        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
                Lore Network
              </h3>
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
              height={250}
            />
            <p className="text-xs text-[var(--color-text-muted)] text-center mt-4">
              Interactive visualization of related mythos elements
            </p>
          </CardContent>
        </GlassCard>
      )}
    </div>
  );

  // Main content with numbered sections
  const mainContent = (
    <div className="space-y-12">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)]"
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${categoryColor}40, transparent 60%)`
          }}
        />
        
        <div className="relative p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full border uppercase tracking-wider ${categoryStyle}`}>
              {element.category}
            </span>
            {element.related_episodes?.length ? (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--glass-border)]">
                {element.related_episodes.length} Appearances
              </span>
            ) : null}
            <span className="text-xs font-mono text-[var(--color-text-muted)] ml-auto">
              ID: {element.id}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] leading-tight">
              {element.name}
            </h1>
            {element.short_description && (
              <p className="text-lg text-[var(--color-text-secondary)] font-light leading-relaxed">
                {element.short_description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${element.dark_variant ? "bg-red-500" : "bg-emerald-500"}`} />
              <span className="text-sm text-[var(--color-text-muted)]">
                {element.dark_variant ? "Dark Variant" : "Canonical"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button isIconOnly variant="ghost" aria-label="Share" size="sm">
                <Share2 className="w-4 h-4 text-[var(--color-text-muted)]" />
              </Button>
              <ForgeButton onClick={() => setIsPanelOpen(true)} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 01: Reference */}
      <section id="reference" className="scroll-mt-24 space-y-6">
        <SectionNumber number="01" title="Reference" />
        
        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-heading text-2xl text-[var(--color-text-primary)]">
                Lore Overview
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {element.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
                  {element.description}
                </p>
              </div>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-heading text-2xl text-[var(--color-text-primary)]">
                Rules & Mechanics
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(element.traits || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {element.traits?.map((trait) => (
                      <Chip
                        key={trait}
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border border-[var(--glass-border)]"
                      >
                        {trait}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {(element.abilities || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Abilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {element.abilities?.map((ability) => (
                      <Chip
                        key={ability}
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20"
                      >
                        {ability}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {(element.weaknesses || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Weaknesses
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {element.weaknesses?.map((weakness) => (
                      <Chip
                        key={weakness}
                        size="sm"
                        variant="soft"
                        className="bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20"
                      >
                        {weakness}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </GlassCard>
      </section>

      {/* Section 02: Narrative */}
      <section id="narrative" className="scroll-mt-24 space-y-6">
        <SectionNumber number="02" title="Narrative" />

        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-[var(--color-accent-secondary)]/5 blur-3xl rounded-full pointer-events-none" />
          
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              <h3 className="font-heading text-2xl text-[var(--color-text-primary)]">
                Implications & Taboos
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {element.significance && (
              <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--glass-border)]">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Significance</h4>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {element.significance}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {element.dark_variant && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--color-accent-secondary)] uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-3 h-3" /> Dark Variant
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed p-3 rounded-lg bg-[var(--color-accent-secondary)]/5 border border-[var(--color-accent-secondary)]/10">
                    {element.dark_variant}
                  </p>
                </div>
              )}
              
              {element.taboo_potential && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Taboo Potential
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--glass-border)]">
                    {element.taboo_potential}
                  </p>
                </div>
              )}
            </div>

            {element.horror_elements?.length ? (
              <div className="pt-4 border-t border-[var(--glass-border)]">
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
                  Horror Elements
                </p>
                <div className="flex flex-wrap gap-2">
                  {element.horror_elements.map((item) => (
                    <Chip
                      key={item}
                      size="sm"
                      variant="soft"
                      className="bg-red-500/10 text-red-400 border border-red-500/20"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </GlassCard>
      </section>

      {/* Section 03: Connections */}
      <section id="connections" className="scroll-mt-24 space-y-6">
        <SectionNumber number="03" title="Connections" />

        {(element.related_episodes?.length || element.related_characters?.length || relatedLore.length > 0) && (
          <GlassCard>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-heading text-xl text-[var(--color-text-primary)]">
                  Related Context
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {relatedLore.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                    Related Lore
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedLore.map((lore) => (
                      <Link key={lore.id} href={`/mythos/${lore.id}`}>
                        <Chip
                          size="sm"
                          variant="soft"
                          className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors border border-[var(--glass-border)]"
                        >
                          {lore.name}
                        </Chip>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {element.related_episodes?.length ? (
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                    Episodes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {element.related_episodes.map((episodeId) => (
                      <Link key={episodeId} href={`/episodes/${episodeId}`}>
                        <Chip
                          size="sm"
                          variant="soft"
                          className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
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
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                    Characters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {element.related_characters.map((characterId) => (
                      <Link key={characterId} href={`/characters/${characterId}`}>
                        <Chip
                          size="sm"
                          variant="soft"
                          className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
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
      </section>
    </div>
  );

  return (
    <>
      <ArchiveLayout
        leftSidebar={leftSidebar}
        mainContent={mainContent}
        rightSidebar={rightSidebar}
      />
      <CreativeCompanionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        entityId={mythosId}
        entityType="mythos"
      />
    </>
  );
}
