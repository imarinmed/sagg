const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6666";

export interface Episode {
  id: string;
  title: string;
  episode_number: number;
  season: number;
  air_date?: string;
  description?: string;
  synopsis?: string;
}

export interface Character {
  id: string;
  name: string;
  portrayed_by?: string;
  role?: string;
  description?: string;
  family?: string | null;
  canonical_traits: string[];
  adaptation_traits: string[];
  adaptation_notes: string;
  kink_profile: {
    preferences: Array<{
      descriptor: string;
      intensity: number;
      context?: string;
    }>;
    limits: Array<{
      descriptor: string;
      type: string;
      note?: string;
    }>;
    evolution: Array<{
      episode_id: string;
      descriptors: Record<string, number>;
    }>;
  };
}

export interface MythosElement {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface GraphNode {
  id: string;
  node_type: "episode" | "character" | "mythos";
  label: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  edge_type: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SearchResult {
  id: string;
  type: "episode" | "character" | "scene" | "mythos";
  title: string;
  snippet: string;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const api = {
  episodes: {
    list: () => fetchApi<Episode[]>("/api/episodes"),
    get: (id: string) => fetchApi<Episode>(`/api/episodes/${id}`),
    getScenes: (id: string) => fetchApi<any[]>(`/api/episodes/${id}/scenes`),
  },
  characters: {
    list: () => fetchApi<Character[]>("/api/characters"),
    get: (id: string) => fetchApi<Character>(`/api/characters/${id}`),
    getRelationships: (id: string) => fetchApi<any[]>(`/api/characters/${id}/relationships`),
    getCharacter: (id: string) => fetchApi<Character>(`/api/characters/${id}`),
  },
  mythos: {
    list: () => fetchApi<MythosElement[]>("/api/mythos"),
    get: (id: string) => fetchApi<MythosElement>(`/api/mythos/${id}`),
  },
  graph: {
    getFull: () => fetchApi<GraphData>("/api/graph"),
    getRelated: (id: string) => fetchApi<GraphData>(`/api/graph/related/${id}`),
  },
  search: {
    query: (q: string) => fetchApi<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`),
  },
};
