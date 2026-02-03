const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  family?: string;
}

export interface MythosElement {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    type: string;
    label: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
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
  },
  mythos: {
    list: () => fetchApi<MythosElement[]>("/api/mythos"),
    get: (id: string) => fetchApi<MythosElement>(`/api/mythos/${id}`),
  },
  graph: {
    getFull: () => fetchApi<GraphData>("/api/graph"),
    getRelated: (id: string) => fetchApi<GraphData>(`/api/graph/related/${id}`),
  },
};
