from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from ..data import load_entity_versions

router = APIRouter(prefix="/api/narratives", tags=["narratives"])


@router.get("/compare/{entity_type}/{entity_id}")
async def compare_narrative_versions(
    entity_type: Literal["mythos", "character"],
    entity_id: str,
):
    result = load_entity_versions(entity_type, entity_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"{entity_type.capitalize()} '{entity_id}' not found",
        )
    return result


@router.get("/alignment")
async def get_narrative_alignment(
    entity: str | None = Query(None, description="Filter by entity ID"),
    episode: str | None = Query(None, description="Filter by episode ID"),
):
    return {"alignments": [], "message": "Alignment data not yet available"}
