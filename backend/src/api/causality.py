from fastapi import APIRouter, Query

from ..data import causality_edges_db

router = APIRouter(prefix="/api/causality", tags=["causality"])


@router.get("/graph")
async def get_causality_graph(
    version: str | None = Query(None, description="Filter by version (bst/sst)"),
    entity: str | None = Query(None, description="Filter by entity ID in beat IDs"),
    episode: str | None = Query(None, description="Filter by episode ID (e.g., s01e01)"),
):
    filtered_edges = []
    node_ids = set()

    for edge_data in causality_edges_db.values():
        if version and edge_data.get("version") != version:
            continue

        from_beat = edge_data.get("from_beat_id", "")
        to_beat = edge_data.get("to_beat_id", "")

        if episode and episode not in from_beat and episode not in to_beat:
            continue

        if entity:
            stac = edge_data.get("stac", {})
            stac_text = " ".join(str(v) for v in stac.values()).lower()
            if entity.lower() not in stac_text:
                continue

        filtered_edges.append(
            {
                "id": edge_data.get("edge_id"),
                "source": from_beat,
                "target": to_beat,
                "type": edge_data.get("type"),
                "confidence": edge_data.get("confidence"),
                "stac": edge_data.get("stac"),
            }
        )
        node_ids.add(from_beat)
        node_ids.add(to_beat)

    nodes = [{"id": node_id, "label": node_id} for node_id in sorted(node_ids)]

    return {
        "nodes": nodes,
        "edges": filtered_edges,
        "total_nodes": len(nodes),
        "total_edges": len(filtered_edges),
    }
