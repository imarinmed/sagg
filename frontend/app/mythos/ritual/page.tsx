"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Spinner, Button, Chip } from "@heroui/react";
import { Flame, ArrowLeft, Plus, X, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import type { MythosElement } from "@/lib/api";

interface Ritual {
  id: string;
  name: string;
  requires: string[];
  description: string;
  effect: string;
  category: string;
}

const RITUALS: Ritual[] = [
  {
    id: "blood_mastery",
    name: "Ritual of Blood Mastery",
    requires: ["vampire_physiology", "blood_bond"],
    description: "An ancient rite combining the fundamental nature of vampire existence with the profound connection of the blood bond.",
    effect: "Grants enhanced blood control abilities",
    category: "biology"
  },
  {
    id: "dark_transformation",
    name: "Ritual of Dark Transformation",
    requires: ["transformation", "dark_magic"],
    description: "By weaving forbidden magical arts through natural shapeshifting abilities, this ritual unlocks transformative powers beyond limits.",
    effect: "Enables supernatural shapeshifting",
    category: "supernatural"
  },
  {
    id: "shadow_walking",
    name: "Ritual of Shadow Walking",
    requires: ["daywalking", "dark_magic"],
    description: "Combining resistance to sunlight with dark sorcery creates the power to move between shadows.",
    effect: "Grants shadow travel abilities",
    category: "supernatural"
  },
  {
    id: "mind_domination",
    name: "Ritual of Mind Domination",
    requires: ["mind_control", "compulsion"],
    description: "When subtle compulsion merges with raw mental control, absolute dominion over another's will becomes possible.",
    effect: "Complete mental control over victims",
    category: "supernatural"
  },
  {
    id: "ancient_hierarchy",
    name: "Ritual of Ancient Hierarchy",
    requires: ["elder_authority", "family_hierarchy"],
    description: "This ceremonial invocation binds the power structures of vampire society, establishing unbreakable bonds of authority.",
    effect: "Establishes permanent hierarchical authority",
    category: "society"
  },
  {
    id: "forbidden_knowledge",
    name: "Ritual of Forbidden Knowledge",
    requires: ["dark_magic", "prophecy"],
    description: "Dark sorcery opens pathways to prophetic visions, revealing secrets of past, present, and future.",
    effect: "Grants prophetic visions",
    category: "supernatural"
  },
  {
    id: "immortal_regeneration",
    name: "Ritual of Immortal Regeneration",
    requires: ["regeneration", "immortality"],
    description: "By combining natural healing with the eternal curse, this ritual achieves perfect bodily restoration.",
    effect: "Accelerated healing and damage resistance",
    category: "biology"
  },
  {
    id: "territorial_dominion",
    name: "Ritual of Territorial Dominion",
    requires: ["territorial_claims", "domain_rights"],
    description: "Ancient customs of territory merge with legal dominion to create absolute control over a region.",
    effect: "Establishes mystical territorial control",
    category: "society"
  }
];

export default function RitualExplorerPage() {
  const [elements, setElements] = useState<MythosElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<string[]>([]);
  const [discoveredRitual, setDiscoveredRitual] = useState<Ritual | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchElements();
  }, []);

  useEffect(() => {
    checkForRitual();
  }, [workspace]);

  const fetchElements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6698'}/api/mythos`);
      if (!response.ok) throw new Error("Failed to fetch mythos elements");
      const data = await response.json();
      setElements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load elements");
    } finally {
      setLoading(false);
    }
  };

  const checkForRitual = () => {
    if (workspace.length < 2) {
      setDiscoveredRitual(null);
      return;
    }
    const ritual = RITUALS.find(r => {
      const required = new Set(r.requires);
      const current = new Set(workspace);
      return required.size === current.size && 
             [...required].every(id => current.has(id));
    });
    setDiscoveredRitual(ritual || null);
  };

  const addToWorkspace = (elementId: string) => {
    if (workspace.length >= 4 || workspace.includes(elementId)) return;
    setWorkspace([...workspace, elementId]);
  };

  const removeFromWorkspace = (elementId: string) => {
    setWorkspace(workspace.filter(id => id !== elementId));
  };

  const clearWorkspace = () => {
    setWorkspace([]);
    setDiscoveredRitual(null);
  };

  const getElement = (id: string) => elements.find(e => e.id === id);

  const filteredElements = elements.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      biology: "bg-red-500/20 text-red-400 border-red-500/30",
      society: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      supernatural: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      psychology: "bg-green-500/20 text-green-400 border-green-500/30",
      rules: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    };
    return colors[category] || "bg-gray-500/20 text-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fog-overlay" aria-hidden="true" />
        <div className="text-center">
          <Spinner size="lg" color="warning" />
          <p className="mt-4 text-lg">Loading ritual components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fog-overlay" aria-hidden="true" />
        <div className="text-center glass p-8 rounded-xl max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-xl mb-4">Error: {error}</p>
          <Button variant="primary" onClick={fetchElements}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="fog-overlay" aria-hidden="true" />
      <div className="fog-overlay-deep" aria-hidden="true" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/mythos">
            <Button variant="ghost" className="text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mythos
            </Button>
          </Link>
        </div>

        <div className="glass p-6 rounded-xl mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-[var(--color-accent-primary)] blood-glow" />
            <h1 className="text-4xl md:text-5xl font-heading text-glow">Ritual Explorer</h1>
          </div>
          <p className="text-lg opacity-80 mb-4">
            Combine mythos elements to discover ancient dark rituals. Select 2-4 elements and witness the
            emergence of forbidden knowledge.
          </p>
          <div className="flex flex-wrap gap-2 text-sm opacity-70">
            <Chip size="sm" variant="soft">8 Rituals</Chip>
            <Chip size="sm" variant="soft">30 Elements</Chip>
            <Chip size="sm" variant="soft">Combine 2-4</Chip>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-heading">Element Library</h2>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-accent-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredElements.map((element) => {
                  const inWorkspace = workspace.includes(element.id);
                  const disabled = inWorkspace || workspace.length >= 4;
                  return (
                    <button
                      key={element.id}
                      onClick={() => addToWorkspace(element.id)}
                      disabled={disabled}
                      className={`
                        glass-enhanced p-4 rounded-lg text-left transition-all
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] card-hover-effect'}
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{element.name}</h3>
                        {!inWorkspace && workspace.length < 4 && (
                          <Plus className="w-5 h-5 text-[var(--color-accent-primary)]" />
                        )}
                        {inWorkspace && <CheckCircle className="w-5 h-5 text-green-400" />}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(element.category)}`}>
                        {element.category}
                      </span>
                      <p className="text-sm opacity-70 line-clamp-2 mt-2">
                        {element.short_description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`glass p-6 rounded-xl sticky top-4 ${discoveredRitual ? 'border-2 border-[var(--color-accent-primary)] blood-glow' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-heading">Workspace</h2>
                {workspace.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearWorkspace}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {workspace.length === 0 && (
                <div className="text-center py-12 opacity-50">
                  <Sparkles className="w-12 h-12 mx-auto mb-3" />
                  <p>Select elements to begin</p>
                </div>
              )}

              {workspace.length > 0 && (
                <div className="space-y-3 mb-6">
                  {workspace.map((elementId) => {
                    const element = getElement(elementId);
                    if (!element) return null;
                    return (
                      <div key={elementId} className="glass-enhanced p-3 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{element.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(element.category)}`}>
                            {element.category}
                          </span>
                        </div>
                        <button onClick={() => removeFromWorkspace(elementId)} className="p-1 hover:bg-red-500/20 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {workspace.length >= 2 && !discoveredRitual && (
                <div className="text-center py-8 opacity-70">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                  <p>No ritual discovered</p>
                  <p className="text-sm mt-2">Try different combinations...</p>
                </div>
              )}

              {discoveredRitual && (
                <div className="animate-fade-in">
                  <div className="bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[var(--color-accent-secondary)]/20 p-6 rounded-lg border-2 border-[var(--color-accent-primary)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-6 h-6" />
                      <h3 className="text-xl font-heading text-glow">Ritual Discovered!</h3>
                    </div>
                    <h4 className="text-2xl font-heading mb-3 text-glow-crimson">{discoveredRitual.name}</h4>
                    <p className="text-sm opacity-90 mb-4">{discoveredRitual.description}</p>
                    <div className="bg-black/30 p-3 rounded-lg mb-4">
                      <p className="text-xs uppercase opacity-70 mb-1">Effect</p>
                      <p className="text-sm font-semibold text-[var(--color-accent-primary)]">{discoveredRitual.effect}</p>
                    </div>
                    <Button variant="primary" className="w-full blood-glow" size="lg">
                      <Flame className="w-5 h-5 mr-2" />
                      Perform Ritual
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
