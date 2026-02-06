import type { MythosConnection, MythosElement } from "@/lib/api";

let mythosCache: MythosElement[] | null = null;

async function loadMythosData(): Promise<MythosElement[]> {
  if (mythosCache) {
    return mythosCache;
  }

  const response = await fetch("/kb/meta/mythos.json", { cache: "force-cache" });
  if (!response.ok) {
    throw new Error("Failed to load static mythos data");
  }

  const data = (await response.json()) as MythosElement[];
  mythosCache = data;
  return data;
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
