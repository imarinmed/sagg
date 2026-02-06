"""Neo4j graph database API endpoints.

Provides REST API endpoints for Neo4j operations including:
- Connection status checks
- Bulk data import from JSON
- Custom Cypher query execution
- Path finding between nodes
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..data import beats_db, causality_edges_db, characters_db, claims_db, episodes_db
from ..models import GraphData, GraphEdge, GraphNode
from .neo4j_adapter import get_adapter
from .queries import build_temporal_query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/graph/neo4j", tags=["neo4j"])


# ============================================================================
# Request/Response Models
# ============================================================================


class Neo4jStatusResponse(BaseModel):
    """Neo4j connection status response."""

    status: str
    connected: bool
    version: str | None = None
    database: str | None = None
    error: str | None = None


class CypherQueryRequest(BaseModel):
    """Custom Cypher query request."""

    query: str = Field(..., description="Cypher query to execute")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Query parameters")
    read_only: bool = Field(default=True, description="Whether query is read-only")


class CypherQueryResponse(BaseModel):
    """Custom Cypher query response."""

    results: list[dict[str, Any]]
    row_count: int
    error: str | None = None


class PathFindRequest(BaseModel):
    """Path finding request."""

    start_id: str = Field(..., description="Starting node ID")
    end_id: str = Field(..., description="Ending node ID")
    max_depth: int = Field(default=5, ge=1, le=10, description="Maximum path depth")
    rel_types: list[str] | None = Field(default=None, description="Relationship types to follow")


class PathFindResponse(BaseModel):
    """Path finding response."""

    paths: list[dict[str, Any]]
    path_count: int
    start_id: str
    end_id: str


class BulkImportResponse(BaseModel):
    """Bulk import response."""

    status: str
    nodes_imported: int = 0
    relationships_imported: int = 0
    errors: list[dict[str, Any]] = []


class ImportStats(BaseModel):
    """Import statistics for a single entity type."""

    label: str
    count: int
    errors: int


# ============================================================================
# Dependency Injection
# ============================================================================


async def get_neo4j_adapter():
    """Get Neo4j adapter instance."""
    adapter = get_adapter()
    try:
        await adapter.connect()
        yield adapter
    except Exception as e:
        logger.error(f"Neo4j connection error: {e}")
        raise HTTPException(status_code=503, detail=f"Neo4j unavailable: {e}")


# ============================================================================
# Status Endpoint
# ============================================================================


@router.get("/status", response_model=Neo4jStatusResponse)
async def get_neo4j_status(
    adapter=Depends(get_neo4j_adapter),
):
    """Check Neo4j connection status.

    Returns connection health, version info, and database name.
    """
    health = await adapter.health_check()

    return Neo4jStatusResponse(
        status=health.get("status", "unknown"),
        connected=health.get("connected", False),
        version=health.get("version"),
        database=health.get("database"),
        error=health.get("error"),
    )


# ============================================================================
# Import Endpoints
# ============================================================================


@router.post("/import", response_model=BulkImportResponse)
async def bulk_import_data(
    clear_existing: bool = Query(default=False, description="Clear database before import"),
    adapter=Depends(get_neo4j_adapter),
):
    """Bulk import all data from JSON files into Neo4j.

    Imports:
    - Characters (nodes)
    - Episodes (nodes)
    - Beats (nodes)
    - Claims (nodes)
    - Character relationships (relationships)
    - Causality edges (relationships)

    Args:
        clear_existing: If True, clears all existing data first

    Returns:
        Import statistics including counts and errors
    """
    nodes_imported = 0
    relationships_imported = 0
    errors = []

    try:
        # Clear existing data if requested
        if clear_existing:
            logger.info("Clearing existing Neo4j data...")
            await adapter.clear_database(confirm=True)

        # Import Characters
        logger.info(f"Importing {len(characters_db)} characters...")
        char_nodes = [
            {
                "id": char.id,
                "name": char.name,
                "role": char.role,
                "family": char.family,
                "description": char.description,
            }
            for char in characters_db.values()
        ]
        char_result = await adapter.bulk_import_nodes("Character", char_nodes)
        nodes_imported += char_result["created"]
        if char_result["errors"]:
            errors.append({"entity": "characters", "details": char_result["error_details"]})

        # Import Episodes
        logger.info(f"Importing {len(episodes_db)} episodes...")
        ep_nodes = [
            {
                "id": ep.id,
                "title": ep.title,
                "episode_number": ep.episode_number,
                "season": ep.season,
                "air_date": ep.air_date,
                "synopsis": ep.synopsis,
            }
            for ep in episodes_db.values()
        ]
        ep_result = await adapter.bulk_import_nodes("Episode", ep_nodes)
        nodes_imported += ep_result["created"]
        if ep_result["errors"]:
            errors.append({"entity": "episodes", "details": ep_result["error_details"]})

        # Import Beats
        logger.info(f"Importing {len(beats_db)} beats...")
        beat_nodes = [
            {
                "id": beat["beat_id"],
                "beat_id": beat["beat_id"],
                "episode_id": beat["episode_id"],
                "start_time": beat["start_time"],
                "end_time": beat["end_time"],
                "start_seconds": beat["start_seconds"],
                "end_seconds": beat["end_seconds"],
                "summary": beat.get("summary", ""),
                "location": beat.get("location", ""),
                "intensity": beat.get("intensity", 1),
                "content_types": beat.get("content_types", []),
                "characters": beat.get("characters", []),
            }
            for beat in beats_db.values()
        ]
        beat_result = await adapter.bulk_import_nodes("Beat", beat_nodes)
        nodes_imported += beat_result["created"]
        if beat_result["errors"]:
            errors.append({"entity": "beats", "details": beat_result["error_details"]})

        # Import Claims
        logger.info(f"Importing {len(claims_db)} claims...")
        claim_nodes = [
            {
                "id": claim["claim_id"],
                "claim_id": claim["claim_id"],
                "type": claim.get("type", ""),
                "subject": claim.get("subject", ""),
                "predicate": claim.get("predicate", ""),
                "object": str(claim.get("object", "")),
                "canon_layer": claim.get("canon_layer", "bst"),
                "confidence": claim.get("confidence", 0.5),
            }
            for claim in claims_db.values()
        ]
        claim_result = await adapter.bulk_import_nodes("Claim", claim_nodes)
        nodes_imported += claim_result["created"]
        if claim_result["errors"]:
            errors.append({"entity": "claims", "details": claim_result["error_details"]})

        # Import Character Relationships
        from ..data import relationships_db

        logger.info(f"Importing {len(relationships_db)} character relationships...")
        rels = [
            {
                "from_id": rel.from_character_id,
                "to_id": rel.to_character_id,
                "properties": {
                    "relationship_type": rel.relationship_type,
                    "description": rel.description,
                },
            }
            for rel in relationships_db.values()
        ]
        rel_result = await adapter.bulk_import_relationships("RELATES_TO", rels)
        relationships_imported += rel_result["created"]
        if rel_result["errors"]:
            errors.append(
                {"entity": "character_relationships", "details": rel_result["error_details"]}
            )

        # Import Causality Edges
        logger.info(f"Importing {len(causality_edges_db)} causality edges...")
        causality_rels = [
            {
                "from_id": edge["from_beat_id"],
                "to_id": edge["to_beat_id"],
                "properties": {
                    "edge_type": edge.get("type", ""),
                    "version": edge.get("version", "bst"),
                    "confidence": edge.get("confidence", 0.5),
                },
            }
            for edge in causality_edges_db.values()
        ]
        causality_result = await adapter.bulk_import_relationships("CAUSES", causality_rels)
        relationships_imported += causality_result["created"]
        if causality_result["errors"]:
            errors.append(
                {"entity": "causality_edges", "details": causality_result["error_details"]}
            )

        logger.info(
            f"Import complete: {nodes_imported} nodes, {relationships_imported} relationships"
        )

        return BulkImportResponse(
            status="success",
            nodes_imported=nodes_imported,
            relationships_imported=relationships_imported,
            errors=errors,
        )

    except Exception as e:
        logger.error(f"Bulk import failed: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {e}")


@router.post("/import/beats-only", response_model=BulkImportResponse)
async def import_beats_only(
    clear_existing: bool = Query(default=False, description="Clear beats before import"),
    adapter=Depends(get_neo4j_adapter),
):
    """Import only narrative beats and causality edges.

    This is a lighter import option for testing.
    """
    try:
        if clear_existing:
            # Only delete Beat nodes and their relationships
            query = "MATCH (b:Beat) DETACH DELETE b"
            await adapter.execute_query(query)

        # Import Beats
        beat_nodes = [
            {
                "id": beat["beat_id"],
                "beat_id": beat["beat_id"],
                "episode_id": beat["episode_id"],
                "start_time": beat["start_time"],
                "end_time": beat["end_time"],
                "start_seconds": beat["start_seconds"],
                "end_seconds": beat["end_seconds"],
                "summary": beat.get("summary", ""),
                "location": beat.get("location", ""),
                "intensity": beat.get("intensity", 1),
                "content_types": beat.get("content_types", []),
                "characters": beat.get("characters", []),
            }
            for beat in beats_db.values()
        ]
        beat_result = await adapter.bulk_import_nodes("Beat", beat_nodes)

        # Import Causality Edges
        causality_rels = [
            {
                "from_id": edge["from_beat_id"],
                "to_id": edge["to_beat_id"],
                "properties": {
                    "edge_type": edge.get("type", ""),
                    "version": edge.get("version", "bst"),
                    "confidence": edge.get("confidence", 0.5),
                },
            }
            for edge in causality_edges_db.values()
        ]
        causality_result = await adapter.bulk_import_relationships("CAUSES", causality_rels)

        return BulkImportResponse(
            status="success",
            nodes_imported=beat_result["created"],
            relationships_imported=causality_result["created"],
            errors=[],
        )

    except Exception as e:
        logger.error(f"Beats import failed: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {e}")


# ============================================================================
# Query Endpoints
# ============================================================================


@router.post("/query", response_model=CypherQueryResponse)
async def execute_cypher_query(
    request: CypherQueryRequest,
    adapter=Depends(get_neo4j_adapter),
):
    """Execute a custom Cypher query.

    Allows running arbitrary Cypher queries against Neo4j.
    Use with caution - read-only queries are recommended.

    Args:
        request: Query request with Cypher string and parameters

    Returns:
        Query results as list of dictionaries
    """
    try:
        if request.read_only:
            results = await adapter.execute_read_query(
                request.query,
                request.parameters,
            )
        else:
            results = await adapter.execute_query(
                request.query,
                request.parameters,
            )

        return CypherQueryResponse(
            results=results,
            row_count=len(results),
            error=None,
        )

    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        return CypherQueryResponse(
            results=[],
            row_count=0,
            error=str(e),
        )


@router.get("/query/beats-by-episode/{episode_id}", response_model=list[dict[str, Any]])
async def get_beats_by_episode(
    episode_id: str,
    adapter=Depends(get_neo4j_adapter),
):
    """Get all beats for an episode in temporal order.

    Args:
        episode_id: Episode ID (e.g., 's01e01')

    Returns:
        List of beats ordered by start time
    """
    query = build_temporal_query("beats_by_episode")

    try:
        results = await adapter.execute_read_query(query, {"episode_id": episode_id})
        return results
    except Exception as e:
        logger.error(f"Failed to get beats: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")


@router.get("/query/causality-chain/{beat_id}", response_model=list[dict[str, Any]])
async def get_causality_chain(
    beat_id: str,
    max_depth: int = Query(default=5, ge=1, le=10),
    adapter=Depends(get_neo4j_adapter),
):
    """Get causality chain starting from a beat.

    Follows CAUSES, ENABLES, MOTIVATES relationships to show
    downstream narrative effects.

    Args:
        beat_id: Starting beat ID
        max_depth: Maximum chain depth

    Returns:
        List of causality chains
    """
    query = build_temporal_query("causality_chain", max_depth=max_depth)

    try:
        results = await adapter.execute_read_query(
            query,
            {"start_beat_id": beat_id, "limit": 10},
        )
        return results
    except Exception as e:
        logger.error(f"Failed to get causality chain: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")


# ============================================================================
# Path Finding Endpoints
# ============================================================================


@router.post("/paths", response_model=PathFindResponse)
async def find_paths(
    request: PathFindRequest,
    adapter=Depends(get_neo4j_adapter),
):
    """Find paths between two nodes.

    Finds all paths up to max_depth between start and end nodes.
    Optionally filter by relationship types.

    Args:
        request: Path finding parameters

    Returns:
        List of paths with nodes and relationships
    """
    try:
        paths = await adapter.find_paths(
            start_id=request.start_id,
            end_id=request.end_id,
            max_depth=request.max_depth,
            rel_types=request.rel_types,
        )

        return PathFindResponse(
            paths=paths,
            path_count=len(paths),
            start_id=request.start_id,
            end_id=request.end_id,
        )

    except Exception as e:
        logger.error(f"Path finding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Path finding failed: {e}")


@router.get("/paths/shortest", response_model=dict[str, Any])
async def find_shortest_path(
    start_id: str = Query(..., description="Starting node ID"),
    end_id: str = Query(..., description="Ending node ID"),
    max_depth: int = Query(default=5, ge=1, le=10),
    adapter=Depends(get_neo4j_adapter),
):
    """Find the shortest path between two nodes.

    Uses Neo4j's shortestPath algorithm to find the most direct
    connection between two nodes.

    Args:
        start_id: Starting node ID
        end_id: Ending node ID
        max_depth: Maximum path length to consider

    Returns:
        Shortest path with nodes and relationships
    """
    query = """
    MATCH path = shortestPath(
        (start {id: $start_id})-[*1..$max_depth]-(end {id: $end_id})
    )
    RETURN path,
           length(path) as path_length,
           [node in nodes(path) | {id: node.id, labels: labels(node)}] as nodes,
           [rel in relationships(path) | {type: type(rel)}] as relationships
    """

    try:
        results = await adapter.execute_read_query(
            query,
            {"start_id": start_id, "end_id": end_id, "max_depth": max_depth},
        )

        if not results:
            return {
                "found": False,
                "message": "No path found between nodes",
                "start_id": start_id,
                "end_id": end_id,
            }

        return {
            "found": True,
            "path": results[0],
            "start_id": start_id,
            "end_id": end_id,
        }

    except Exception as e:
        logger.error(f"Shortest path finding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Path finding failed: {e}")


@router.get("/subgraph/{node_id}", response_model=GraphData)
async def get_subgraph(
    node_id: str,
    depth: int = Query(default=2, ge=1, le=5),
    adapter=Depends(get_neo4j_adapter),
):
    """Get subgraph centered around a node.

    Returns all nodes and relationships within specified depth
    from the center node.

    Args:
        node_id: Center node ID
        depth: How many hops to include (1-5)

    Returns:
        Graph data with nodes and edges
    """
    try:
        subgraph = await adapter.get_subgraph(center_id=node_id, depth=depth)

        # Convert to GraphData format
        nodes = [
            GraphNode(
                id=node.get("id", str(i)),
                label=node.get("name", node.get("beat_id", "Unknown")),
                node_type=node.get("_label", "unknown"),
                metadata={k: v for k, v in node.items() if not k.startswith("_")},
            )
            for i, node in enumerate(subgraph["nodes"])
        ]

        edges = [
            GraphEdge(
                source=rel.get("from_id", ""),
                target=rel.get("to_id", ""),
                edge_type=rel.get("type", "unknown"),
                label=rel.get("type", ""),
            )
            for rel in subgraph["relationships"]
        ]

        return GraphData(nodes=nodes, edges=edges)

    except Exception as e:
        logger.error(f"Subgraph extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Subgraph extraction failed: {e}")


@router.get("/neighbors/{node_id}", response_model=list[dict[str, Any]])
async def get_neighbors(
    node_id: str,
    rel_type: str | None = Query(default=None, description="Filter by relationship type"),
    direction: str = Query(default="both", pattern="^(out|in|both)$"),
    adapter=Depends(get_neo4j_adapter),
):
    """Get immediate neighbors of a node.

    Args:
        node_id: Center node ID
        rel_type: Optional relationship type filter
        direction: 'out', 'in', or 'both'

    Returns:
        List of neighbor nodes with relationship info
    """
    try:
        neighbors = await adapter.get_neighbors(
            node_id=node_id,
            rel_type=rel_type,
            direction=direction,
        )
        return neighbors

    except Exception as e:
        logger.error(f"Failed to get neighbors: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")


# ============================================================================
# Analysis Endpoints
# ============================================================================


@router.get("/analysis/degree/{node_id}", response_model=dict[str, Any])
async def get_node_degree(
    node_id: str,
    adapter=Depends(get_neo4j_adapter),
):
    """Get the degree (number of connections) of a node.

    Args:
        node_id: Node ID

    Returns:
        Degree count and breakdown by relationship type
    """
    query = """
    MATCH (n {id: $node_id})-[r]-()
    RETURN count(r) as total_degree,
           collect(DISTINCT type(r)) as rel_types
    """

    try:
        results = await adapter.execute_read_query(query, {"node_id": node_id})

        if not results:
            raise HTTPException(status_code=404, detail="Node not found")

        return {
            "node_id": node_id,
            "total_degree": results[0].get("total_degree", 0),
            "relationship_types": results[0].get("rel_types", []),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get node degree: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")


@router.get("/analysis/central-nodes", response_model=list[dict[str, Any]])
async def get_central_nodes(
    label: str = Query(default="Beat", description="Node label to analyze"),
    limit: int = Query(default=10, ge=1, le=50),
    adapter=Depends(get_neo4j_adapter),
):
    """Find most connected nodes (highest degree).

    Args:
        label: Node label to analyze
        limit: Number of results to return

    Returns:
        List of nodes sorted by degree
    """
    query = f"""
    MATCH (n:{label})-[r]-()
    WITH n, count(r) as degree
    RETURN n.id as id,
           n.name as name,
           degree
    ORDER BY degree DESC
    LIMIT $limit
    """

    try:
        results = await adapter.execute_read_query(query, {"limit": limit})
        return results

    except Exception as e:
        logger.error(f"Failed to get central nodes: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")
