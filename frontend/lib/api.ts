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
  short_description?: string;
  related_episodes?: string[];
  related_characters?: string[];
  media_urls?: string[];
  traits?: string[];
  abilities?: string[];
  weaknesses?: string[];
  significance?: string;
  dark_variant?: string;
  erotic_implications?: string;
  horror_elements?: string[];
  taboo_potential?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MythosConnection {
  id: string;
  from_element_id: string;
  to_element_id: string;
  connection_type: string;
  description?: string;
  strength: number;
}

export interface MythosGraphNode {
  id: string;
  name: string;
  group: number;
  radius: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface MythosGraphLink {
  source: string;
  target: string;
  type: string;
  value: number;
  color?: string;
}

export interface MythosGraphData {
  nodes: MythosGraphNode[];
  links: MythosGraphLink[];
  total_elements: number;
  total_connections: number;
  categories: string[];
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

// Video Analysis Types
export interface VideoMoment {
  timestamp: string;
  timestamp_seconds: number;
  description: string;
  characters_present: string[];
  content_type: string;
  intensity: number;
  screenshot_path: string | null;
}

export interface NarrativeBeats {
  inciting_incident: string | null;
  inciting_incident_seconds: number | null;
  rising_action_start: string | null;
  rising_action_start_seconds: number | null;
  climax: string | null;
  climax_seconds: number | null;
  falling_action_start: string | null;
  falling_action_start_seconds: number | null;
  resolution: string | null;
  resolution_seconds: number | null;
  act_1_end_seconds: number | null;
  act_2_end_seconds: number | null;
  confidence: number;
}

export interface VideoEpisodeAnalysis {
  episode_id: string;
  episode_number: number;
  title: string;
  duration: string;
  duration_seconds: number;
  key_moments: VideoMoment[];
  narrative_beats?: NarrativeBeats;
}

export interface VideoAnalysisData {
  total_episodes: number;
  episodes: VideoEpisodeAnalysis[];
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const primaryUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(primaryUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (endpoint.startsWith("/api/")) {
      const fallbackResponse = await fetch(endpoint);
      if (!fallbackResponse.ok) {
        throw error;
      }
      return fallbackResponse.json();
    }
    throw error;
  }
}

// Character Presence Types
export interface CharacterPresenceEntry {
  character_id: string;
  character_name: string;
  first_appearance_timestamp: string;
  last_appearance_timestamp: string;
  total_screen_time_seconds: number;
  importance_rating: number;
  moment_count: number;
  avg_intensity: number;
  key_moments: Array<{
    timestamp: string;
    description: string;
    intensity: number;
  }>;
}

export interface CharacterPresenceResponse {
  episode_id: string;
  episode_title: string;
  duration_seconds: number;
  characters: CharacterPresenceEntry[];
  total_characters: number;
}

// Scene Types for SceneBreakdownCards
export interface SceneBreakdown {
  scene_id: string;
  start_timestamp: string;
  end_timestamp: string;
  start_seconds: number;
  end_seconds: number;
  location?: string;
  characters: string[];
  content_summary: string;
  moments_count: number;
  avg_intensity?: number;
  content_types?: string[];
}

// Character Relationship Graph Types
export interface RelationshipGraphNode {
  id: string;
  name: string;
  group: number;
  radius: number;
  color: string;
  metadata?: {
    role?: string;
    family?: string | null;
  };
}

export interface RelationshipGraphLink {
  source: string;
  target: string;
  type: string;
  intensity: number;
  description?: string;
  color: string;
  width: number;
}

export interface RelationshipGraphData {
  nodes: RelationshipGraphNode[];
  links: RelationshipGraphLink[];
}

// Character Evolution Types
export interface EvolutionMilestone {
  id: string;
  character_id: string;
  episode_id: string;
  timestamp: string;
  milestone_type: string;
  description: string;
  importance: number;
  related_characters: string[];
  quote?: string | null;
  intensity: number;
  content_type: string;
  screenshot_path?: string;
}

export interface CharacterEvolutionData {
  character_id: string;
  character_name: string;
  milestones: EvolutionMilestone[];
  arc_summary?: string;
  first_appearance_episode?: string;
  total_milestones: number;
}

// Character Episode Presence Types
export interface CharacterEpisodePresence {
  episode_id: string;
  intensity: number;
  screen_time: number;
  moment_count: number;
}

export interface CharacterEpisodePresenceData {
  character_id: string;
  character_name: string;
  episodes: CharacterEpisodePresence[];
  total_screen_time: number;
  total_episodes: number;
}

export const api = {
  episodes: {
    list: () => fetchApi<Episode[]>("/api/episodes"),
    get: (id: string) => fetchApi<Episode>(`/api/episodes/${id}`),
    getScenes: (id: string) => fetchApi<any[]>(`/api/episodes/${id}/scenes`),
    getCharacterPresence: (id: string) => fetchApi<CharacterPresenceResponse>(`/api/episodes/${id}/character-presence`),
  },
  characters: {
    list: () => fetchApi<Character[]>("/api/characters"),
    get: (id: string) => fetchApi<Character>(`/api/characters/${id}`),
    getRelationships: (id: string) => fetchApi<any[]>(`/api/characters/${id}/relationships`),
    getCharacter: (id: string) => fetchApi<Character>(`/api/characters/${id}`),
    getRelationshipGraph: (id: string) => fetchApi<RelationshipGraphData>(`/api/characters/${id}/relationships/graph`),
    getEvolution: (id: string) => fetchApi<CharacterEvolutionData>(`/api/characters/${id}/evolution`),
    getEpisodePresence: (id: string) => fetchApi<CharacterEpisodePresenceData>(`/api/characters/${id}/episode-presence`),
  },
  mythos: {
    list: () => fetchApi<MythosElement[]>("/api/mythos"),
    get: (id: string) => fetchApi<MythosElement>(`/api/mythos/${id}`),
    categories: () => fetchApi<string[]>("/api/mythos/categories"),
    connections: (params?: {
      connection_type?: string;
      from_element_id?: string;
      to_element_id?: string;
    }) => {
      const search = new URLSearchParams();
      if (params?.connection_type) search.set("connection_type", params.connection_type);
      if (params?.from_element_id) search.set("from_element_id", params.from_element_id);
      if (params?.to_element_id) search.set("to_element_id", params.to_element_id);
      const query = search.toString();
      return fetchApi<MythosConnection[]>(`/api/mythos/connections${query ? `?${query}` : ""}`);
    },
    elementConnections: (id: string) =>
      fetchApi<MythosConnection[]>(`/api/mythos/${id}/connections`),
    graph: () => fetchApi<MythosGraphData>("/api/mythos/graph"),
  },
  graph: {
    getFull: () => fetchApi<GraphData>("/api/graph"),
    getRelated: (id: string) => fetchApi<GraphData>(`/api/graph/related/${id}`),
  },
  search: {
    query: (q: string) => fetchApi<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`),
  },
};
