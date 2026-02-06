import React from "react";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { EnhancedGraphView, EnhancedGraphData, GraphNode, GraphEdge } from "@/components/EnhancedGraphView";

const DATA_DIR = path.join(process.cwd(), "../data");

function loadCharacters(): GraphNode[] {
  const charDir = path.join(DATA_DIR, "characters");
  if (!fs.existsSync(charDir)) return [];
  
  const files = fs.readdirSync(charDir).filter(f => f.endsWith(".yaml"));
  return files.map(file => {
    const content = fs.readFileSync(path.join(charDir, file), "utf8");
    const data = yaml.load(content) as any;
    return {
      id: data.id,
      label: data.name,
      type: "character",
      metadata: {
        role: data.role,
        narrative_version: "both",
        description: data.adaptation_notes
      }
    };
  });
}

function loadMythos(): GraphNode[] {
  const mythosDir = path.join(DATA_DIR, "mythos");
  if (!fs.existsSync(mythosDir)) return [];
  
  const files = fs.readdirSync(mythosDir).filter(f => f.endsWith(".yaml"));
  return files.map(file => {
    const content = fs.readFileSync(path.join(mythosDir, file), "utf8");
    const data = yaml.load(content) as any;
    return {
      id: data.id,
      label: data.name,
      type: "mythos",
      metadata: {
        category: data.category,
        description: data.description
      }
    };
  });
}

function loadEpisodes(): GraphNode[] {
  const filePath = path.join(DATA_DIR, "parsed/episodes.json");
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content) as any[];
  return data.map(ep => ({
    id: ep.id,
    label: ep.title,
    type: "episode",
    metadata: {
      season: ep.season,
      episode_number: ep.episode_number
    }
  }));
}

function loadBeats(): { nodes: GraphNode[], edges: GraphEdge[] } {
  const filePath = path.join(DATA_DIR, "narratives/bst/beats.json");
  if (!fs.existsSync(filePath)) return { nodes: [], edges: [] };
  
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content) as any;
  
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  data.beats.forEach((beat: any) => {
    nodes.push({
      id: beat.beat_id,
      label: beat.beat_id,
      type: "beat",
      metadata: {
        narrative_version: "bst",
        description: beat.stac?.situation || "No description"
      }
    });
    
    if (beat.episode_id) {
      edges.push({
        source: beat.beat_id,
        target: beat.episode_id,
        type: "related",
        strength: 1
      });
    }
    
    if (beat.characters) {
      beat.characters.forEach((charId: string) => {
        edges.push({
          source: beat.beat_id,
          target: charId,
          type: "related",
          strength: 0.5
        });
      });
    }
  });
  
  return { nodes, edges };
}

function loadInspiration(): { nodes: GraphNode[], edges: GraphEdge[] } {
  const filePath = path.join(DATA_DIR, "creative/inspiration_graph.json");
  if (!fs.existsSync(filePath)) return { nodes: [], edges: [] };
  
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content) as any;
  
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  if (data.nodes) {
    data.nodes.forEach((node: any) => {
      nodes.push({
        id: node.node_id,
        label: node.title,
        type: "inspiration",
        metadata: {
          description: node.content
        }
      });
      
      if (node.source && node.source.id) {
        edges.push({
          source: node.node_id,
          target: node.source.id,
          type: "inspirational",
          strength: 0.8
        });
      }
    });
  }
  
  if (data.links) {
    data.links.forEach((link: any) => {
      edges.push({
        source: link.source,
        target: link.target,
        type: "inspirational",
        strength: link.value || 1
      });
    });
  }
  
  return { nodes, edges };
}

function loadRelationships(): GraphEdge[] {
  const filePath = path.join(DATA_DIR, "character_relationships.json");
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content) as any;
  
  return data.relationships.map((rel: any) => ({
    source: rel.from_character_id,
    target: rel.to_character_id,
    type: "related",
    label: rel.relationship_type,
    strength: rel.metadata?.co_occurrence_count ? Math.min(5, rel.metadata.co_occurrence_count / 10) : 1
  }));
}

function loadCausalEdges(): GraphEdge[] {
  const filePath = path.join(DATA_DIR, "causality/edges.json");
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content) as any;
  
  return data.edges.map((edge: any) => ({
    source: edge.from_beat_id,
    target: edge.to_beat_id,
    type: "causal",
    label: edge.type,
    strength: edge.confidence ? edge.confidence * 2 : 1
  }));
}

async function getGraphData(): Promise<EnhancedGraphData> {
  const characters = loadCharacters();
  const mythos = loadMythos();
  const episodes = loadEpisodes();
  const beatsData = loadBeats();
  const inspirationData = loadInspiration();
  const relationships = loadRelationships();
  const causalEdges = loadCausalEdges();
  
  const nodes = [
    ...characters,
    ...mythos,
    ...episodes,
    ...beatsData.nodes,
    ...inspirationData.nodes
  ];
  
  const edges = [
    ...beatsData.edges,
    ...inspirationData.edges,
    ...relationships,
    ...causalEdges
  ];
  
  const nodeIds = new Set(nodes.map(n => n.id));
  const validEdges = edges.filter(e => 
    nodeIds.has(e.source as string) && nodeIds.has(e.target as string)
  );
  
  return { nodes, edges: validEdges };
}

export default async function GraphPage() {
  const data = await getGraphData();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            Narrative Graph
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl">
            Explore the interconnected web of characters, mythos, episodes, and narrative beats. 
            Discover hidden causal links and thematic resonances across the Blood, Sweat, Tears universe.
          </p>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <EnhancedGraphView initialData={data} />
        </div>
      </div>
    </div>
  );
}
