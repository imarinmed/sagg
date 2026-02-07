import type { MythosConnection, MythosElement } from "@/lib/api";

let mythosCache: MythosElement[] | null = null;

/**
 * Lore payload shape from /kb/meta/lore.json
 * Has minimal required fields with extended schema support
 */
interface LoreEntry {
  id: string;
  slug?: string;
  name: string;
  category: string;
  kind?: string;
  tags?: string[];
  aliases?: string[];
  related_ids?: string[];
  description?: string;
  [key: string]: any; // Support additional frontmatter fields
}

/**
 * Normalize LoreEntry or legacy MythosElement to MythosElement
 * Ensures all required keys are present with safe defaults
 */
function normalizeLoreEntry(entry: any): MythosElement {
  return {
    // Required keys
    id: entry.id || "",
    name: entry.name || "",
    category: entry.category || "uncategorized",
    // Standard optional keys with fallbacks
    description: entry.description || undefined,
    short_description: entry.short_description || undefined,
    related_episodes: entry.related_episodes || undefined,
    related_characters: entry.related_characters || undefined,
    media_urls: entry.media_urls || undefined,
    traits: entry.traits || undefined,
    abilities: entry.abilities || undefined,
    weaknesses: entry.weaknesses || undefined,
    significance: entry.significance || undefined,
    dark_variant: entry.dark_variant || undefined,
    erotic_implications: entry.erotic_implications || undefined,
    horror_elements: entry.horror_elements || undefined,
    taboo_potential: entry.taboo_potential || undefined,
    created_at: entry.created_at || undefined,
    updated_at: entry.updated_at || undefined,
  };
}

/**
 * Merge lore payload and legacy mythos with deterministic dedupe
 * Priority: legacy mythos entries override lore entries by id
 * Fallback: if lore fetch fails, return legacy mythos only
 */
async function loadMythosData(): Promise<MythosElement[]> {
  if (mythosCache) {
    return mythosCache;
  }

  try {
    // Fetch expanded lore payload (47 entries currently)
    const loreResponse = await fetch("/kb/meta/lore.json", { cache: "force-cache" });
    const loreData: LoreEntry[] = loreResponse.ok ? await loreResponse.json() : [];

    // Fetch legacy mythos (7 entries currently)
    const mythosResponse = await fetch("/kb/meta/mythos.json", { cache: "force-cache" });
    const mythosData = mythosResponse.ok ? await mythosResponse.json() : [];

    // Merge: create map of lore entries normalized to MythosElement
    const merged = new Map<string, MythosElement>();

    // Add lore entries first (lower priority)
    for (const entry of loreData) {
      const normalized = normalizeLoreEntry(entry);
      if (normalized.id) {
        merged.set(normalized.id, normalized);
      }
    }

    // Override with legacy mythos entries (higher priority)
    for (const entry of mythosData) {
      const normalized = normalizeLoreEntry(entry);
      if (normalized.id) {
        merged.set(normalized.id, normalized);
      }
    }

    // Convert to sorted array for deterministic output
    const result = Array.from(merged.values()).sort((a, b) => a.id.localeCompare(b.id));
    mythosCache = result;
    return result;
  } catch (error) {
    // Graceful fallback: attempt legacy path only
    console.warn("Failed to load lore payload, falling back to legacy mythos", error);
    try {
      const response = await fetch("/kb/meta/mythos.json", { cache: "force-cache" });
      if (!response.ok) {
        throw new Error("Failed to load legacy mythos data");
      }
      const data = (await response.json()) as MythosElement[];
      mythosCache = data;
      return data;
    } catch (fallbackError) {
      throw new Error("Failed to load static mythos data");
    }
  }
}

export async function listMythos(): Promise<MythosElement[]> {
  return loadMythosData();
}

export async function getMythos(id: string): Promise<MythosElement> {
  const items = await loadMythosData();
  const found = items.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Mythos element '${id}' not found`);
  }
  return found;
}

export async function listMythosCategories(): Promise<string[]> {
  const items = await loadMythosData();
  const categories = new Set(
    items
      .map((item) => item.category)
      .filter((category): category is string => Boolean(category))
      .map((category) => category.toLowerCase())
  );
  return Array.from(categories).sort();
}

export async function getMythosElementConnections(
  id: string
): Promise<MythosConnection[]> {
  const items = await loadMythosData();
  const current = items.find((item) => item.id === id);
  if (!current) {
    return [];
  }

  const currentCharacters = new Set(current.related_characters || []);
  if (currentCharacters.size === 0) {
    return [];
  }

  return items
    .filter((candidate) => candidate.id !== id)
    .map((candidate, index) => {
      const overlap = (candidate.related_characters || []).filter((characterId) =>
        currentCharacters.has(characterId)
      );
      if (overlap.length === 0) {
        return null;
      }
      return {
        id: `${id}-${candidate.id}-${index}`,
        from_element_id: id,
        to_element_id: candidate.id,
        connection_type: "related",
        strength: Math.min(1, overlap.length / 3),
      } satisfies MythosConnection;
    })
    .filter((connection): connection is MythosConnection => connection !== null);
}
