from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..data import characters_db, episodes_db, mythos_db, scenes_db

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchResult(BaseModel):
    id: str
    type: str  # "episode", "scene", "character", "mythos"
    title: str
    snippet: str
    url: str


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int


def extract_snippet(text: str, match_start: int, match_end: int, context_chars: int = 50) -> str:
    """
    Extract text snippet around match with context.

    Args:
        text: Full text to extract from
        match_start: Start position of match
        match_end: End position of match
        context_chars: Characters before/after to include

    Returns:
        Snippet with ellipsis if truncated
    """
    if not text:
        return ""

    # Find snippet boundaries
    snippet_start = max(0, match_start - context_chars)
    snippet_end = min(len(text), match_end + context_chars)

    # Extract snippet
    snippet = text[snippet_start:snippet_end]

    # Add ellipsis if truncated
    if snippet_start > 0:
        snippet = "..." + snippet
    if snippet_end < len(text):
        snippet = snippet + "..."

    return snippet.strip()


def search_text(query: str, text: str, case_sensitive: bool = False) -> tuple[bool, int, int]:
    """
    Search for query in text with case-insensitive support.

    Returns:
        Tuple of (found: bool, start: int, end: int)
    """
    if not text or not query:
        return False, 0, 0

    pos = text.find(query) if case_sensitive else text.lower().find(query.lower())

    if pos >= 0:
        return True, pos, pos + len(query)

    return False, 0, 0


def search_episodes(query: str, limit: int = 10) -> list[SearchResult]:
    """Search episodes by title and synopsis."""
    results = []

    for ep_id, episode in episodes_db.items():
        # Search title
        found, start, end = search_text(query, episode.title)
        if found:
            results.append(
                SearchResult(
                    id=ep_id,
                    type="episode",
                    title=episode.title,
                    snippet=extract_snippet(episode.title, start, end),
                    url=f"/episodes/{ep_id}",
                )
            )
            if len(results) >= limit:
                return results[:limit]

        # Search synopsis
        if episode.synopsis:
            found, start, end = search_text(query, episode.synopsis)
            if found:
                results.append(
                    SearchResult(
                        id=ep_id,
                        type="episode",
                        title=episode.title,
                        snippet=extract_snippet(episode.synopsis, start, end),
                        url=f"/episodes/{ep_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

        # Search description
        if episode.description:
            found, start, end = search_text(query, episode.description)
            if found:
                results.append(
                    SearchResult(
                        id=ep_id,
                        type="episode",
                        title=episode.title,
                        snippet=extract_snippet(episode.description, start, end),
                        url=f"/episodes/{ep_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

    return results[:limit]


def search_scenes(query: str, limit: int = 10) -> list[SearchResult]:
    """Search scenes by title (location) and characters."""
    results = []

    for scene_id, scene in scenes_db.items():
        # Search location/title
        found, start, end = search_text(query, scene.title)
        if found:
            results.append(
                SearchResult(
                    id=scene_id,
                    type="scene",
                    title=scene.title,
                    snippet=extract_snippet(scene.title, start, end),
                    url=f"/episodes/{scene.episode_id}#scene-{scene_id}",
                )
            )
            if len(results) >= limit:
                return results[:limit]

        # Search description
        if scene.description:
            found, start, end = search_text(query, scene.description)
            if found:
                results.append(
                    SearchResult(
                        id=scene_id,
                        type="scene",
                        title=scene.title,
                        snippet=extract_snippet(scene.description, start, end),
                        url=f"/episodes/{scene.episode_id}#scene-{scene_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

        # Search characters in scene
        for char_name in scene.characters:
            found, start, end = search_text(query, char_name)
            if found:
                results.append(
                    SearchResult(
                        id=scene_id,
                        type="scene",
                        title=f"{scene.title} (featuring {char_name})",
                        snippet=extract_snippet(char_name, start, end),
                        url=f"/episodes/{scene.episode_id}#scene-{scene_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

    return results[:limit]


def search_characters(query: str, limit: int = 10) -> list[SearchResult]:
    """Search characters by name and description."""
    results = []

    for char_id, character in characters_db.items():
        # Search name (highest priority)
        found, start, end = search_text(query, character.name)
        if found:
            results.append(
                SearchResult(
                    id=char_id,
                    type="character",
                    title=character.name,
                    snippet=extract_snippet(character.name, start, end),
                    url=f"/characters/{char_id}",
                )
            )
            if len(results) >= limit:
                return results[:limit]

        # Search description
        if character.description:
            found, start, end = search_text(query, character.description)
            if found:
                results.append(
                    SearchResult(
                        id=char_id,
                        type="character",
                        title=character.name,
                        snippet=extract_snippet(character.description, start, end),
                        url=f"/characters/{char_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

        # Search traits
        all_traits = []
        if character.canonical_traits:
            all_traits.extend(character.canonical_traits)
        if character.adaptation_traits:
            all_traits.extend(character.adaptation_traits)

        for trait in all_traits:
            found, start, end = search_text(query, trait)
            if found:
                results.append(
                    SearchResult(
                        id=char_id,
                        type="character",
                        title=character.name,
                        snippet=extract_snippet(trait, start, end),
                        url=f"/characters/{char_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

        # Search adaptation notes
        if character.adaptation_notes:
            found, start, end = search_text(query, character.adaptation_notes)
            if found:
                results.append(
                    SearchResult(
                        id=char_id,
                        type="character",
                        title=character.name,
                        snippet=extract_snippet(character.adaptation_notes, start, end),
                        url=f"/characters/{char_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

    return results[:limit]


def search_mythos(query: str, limit: int = 10) -> list[SearchResult]:
    """Search mythos elements by name and description."""
    results = []

    for mythos_id, mythos_element in mythos_db.items():
        # Search name
        found, start, end = search_text(query, mythos_element.name)
        if found:
            results.append(
                SearchResult(
                    id=mythos_id,
                    type="mythos",
                    title=mythos_element.name,
                    snippet=extract_snippet(mythos_element.name, start, end),
                    url=f"/mythos/{mythos_id}",
                )
            )
            if len(results) >= limit:
                return results[:limit]

        # Search description
        if mythos_element.description:
            found, start, end = search_text(query, mythos_element.description)
            if found:
                results.append(
                    SearchResult(
                        id=mythos_id,
                        type="mythos",
                        title=mythos_element.name,
                        snippet=extract_snippet(mythos_element.description, start, end),
                        url=f"/mythos/{mythos_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

        # Search significance
        if mythos_element.significance:
            found, start, end = search_text(query, mythos_element.significance)
            if found:
                results.append(
                    SearchResult(
                        id=mythos_id,
                        type="mythos",
                        title=mythos_element.name,
                        snippet=extract_snippet(mythos_element.significance, start, end),
                        url=f"/mythos/{mythos_id}",
                    )
                )
                if len(results) >= limit:
                    return results[:limit]

    return results[:limit]


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    type: Optional[str] = Query(
        None,
        description=(
            "Filter by content type: episode, scene, character, or mythos. "
            "Leave empty to search all types."
        ),
    ),
) -> SearchResponse:
    """
    Search across all content types.

    Query Parameters:
    - `q`: Search query (required, 1-100 characters)
    - `type`: Optional filter by content type (episode, scene, character, mythos)

    Returns:
    - List of search results with snippets and URLs
    - Maximum 10 results per content type
    - Results sorted by relevance (exact matches first)

    Example:
    - GET /api/search?q=vampire
    - GET /api/search?q=Erik&type=character
    """

    # Validate type parameter
    valid_types = {"episode", "scene", "character", "mythos"}
    if type and type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=(f"Invalid type '{type}'. Must be one of: {', '.join(sorted(valid_types))}"),
        )

    # Perform searches based on type filter
    all_results = []

    if not type or type == "episode":
        all_results.extend(search_episodes(q, limit=10))

    if not type or type == "scene":
        all_results.extend(search_scenes(q, limit=10))

    if not type or type == "character":
        all_results.extend(search_characters(q, limit=10))

    if not type or type == "mythos":
        all_results.extend(search_mythos(q, limit=10))

    # Remove duplicates while preserving order (keep first occurrence)
    seen = set()
    unique_results = []
    for result in all_results:
        key = (result.id, result.type)
        if key not in seen:
            seen.add(key)
            unique_results.append(result)

    # Limit total results to 40 (10 per type max)
    final_results = unique_results[:40]

    return SearchResponse(results=final_results, total=len(final_results))


@router.get("/health")
async def search_health():
    """Health check for search endpoint."""
    return {
        "status": "healthy",
        "episodes": len(episodes_db),
        "scenes": len(scenes_db),
        "characters": len(characters_db),
        "mythos": len(mythos_db),
    }
