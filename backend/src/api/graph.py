from fastapi import APIRouter, HTTPException

from ..data import characters_db, episodes_db, mythos_db, relationships_db
from ..models import GraphData, GraphEdge, GraphNode

router = APIRouter(prefix="/api/graph", tags=["graph"])


def build_full_graph() -> GraphData:
    """Build complete graph with all nodes and edges"""
    nodes = []
    edges = []

    # Add episode nodes
    for episode in episodes_db.values():
        nodes.append(
            GraphNode(
                id=episode.id,
                label=episode.title,
                node_type="episode",
                metadata={"season": episode.season, "episode_number": episode.episode_number},
            )
        )

    # Add character nodes
    for character in characters_db.values():
        nodes.append(
            GraphNode(
                id=character.id,
                label=character.name,
                node_type="character",
                metadata={"role": character.role},
            )
        )

    # Add mythos nodes
    for mythos in mythos_db.values():
        nodes.append(
            GraphNode(
                id=mythos.id,
                label=mythos.name,
                node_type="mythos",
                metadata={"category": mythos.category},
            )
        )

    # Add relationship edges
    for rel in relationships_db.values():
        edges.append(
            GraphEdge(
                source=rel.from_character_id,
                target=rel.to_character_id,
                edge_type=rel.relationship_type,
                label=rel.relationship_type,
            )
        )

    # Add character-mythos connections
    for mythos in mythos_db.values():
        if mythos.related_characters:
            for char_id in mythos.related_characters:
                edges.append(
                    GraphEdge(
                        source=char_id,
                        target=mythos.id,
                        edge_type="connects_to",
                        label="connects to",
                    )
                )

    return GraphData(nodes=nodes, edges=edges)


@router.get("", response_model=GraphData)
async def get_full_graph():
    """Get all nodes and edges for graph visualization"""
    return build_full_graph()


@router.get("/related/{entity_id}", response_model=GraphData)
async def get_related_entities(entity_id: str):
    """Get related entities for a specific entity"""
    # Find all direct connections
    full_graph = build_full_graph()

    related_ids = {entity_id}

    # Find connected nodes
    for edge in full_graph.edges:
        if edge.source == entity_id:
            related_ids.add(edge.target)
        elif edge.target == entity_id:
            related_ids.add(edge.source)

    # Filter nodes and edges
    filtered_nodes = [n for n in full_graph.nodes if n.id in related_ids]
    filtered_edges = [
        e for e in full_graph.edges if e.source in related_ids and e.target in related_ids
    ]

    if not filtered_nodes:
        raise HTTPException(status_code=404, detail="Entity not found")

    return GraphData(nodes=filtered_nodes, edges=filtered_edges)
