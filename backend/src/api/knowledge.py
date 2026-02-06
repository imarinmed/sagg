from fastapi import APIRouter, Query

from ..data import claims_db

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


@router.get("/claims")
async def get_knowledge_claims(
    entity: str | None = Query(None, description="Filter by subject entity"),
    claim_type: str | None = Query(
        None, alias="type", description="Filter by claim type (rule/fact/event)"
    ),
    canon_layer: str | None = Query(None, description="Filter by canon layer (bst/sst)"),
    limit: int = Query(100, ge=1, le=500, description="Maximum claims to return"),
):
    filtered_claims = []

    for claim_data in claims_db.values():
        if entity and entity.lower() not in claim_data.get("subject", "").lower():
            continue

        if claim_type and claim_data.get("type") != claim_type:
            continue

        if canon_layer and claim_data.get("canon_layer") != canon_layer:
            continue

        filtered_claims.append(claim_data)

        if len(filtered_claims) >= limit:
            break

    return {
        "claims": filtered_claims,
        "total": len(filtered_claims),
        "limit": limit,
    }
