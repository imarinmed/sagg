"""Cypher query templates for Neo4j graph operations.

This module contains reusable Cypher query templates for common graph
operations in the Shadow Lore Forge project.
"""

from typing import Any

# ============================================================================
# Node Queries
# ============================================================================

NODE_QUERIES = {
    # Create a node with properties
    "create_node": """
    CREATE (n:{label} $properties)
    RETURN n, id(n) as internal_id
    """,
    # Get node by ID
    "get_node_by_id": """
    MATCH (n:{label} {{id: $node_id}})
    RETURN n, id(n) as internal_id
    """,
    # Update node properties
    "update_node": """
    MATCH (n:{label} {{id: $node_id}})
    SET n += $properties
    RETURN n, id(n) as internal_id
    """,
    # Delete node (with optional detach)
    "delete_node": """
    MATCH (n:{label} {{id: $node_id}})
    DETACH DELETE n
    """,
    # List nodes with pagination
    "list_nodes": """
    MATCH (n:{label})
    RETURN n, id(n) as internal_id
    ORDER BY n.id
    SKIP $skip LIMIT $limit
    """,
    # Count nodes by label
    "count_nodes": """
    MATCH (n:{label})
    RETURN count(n) as count
    """,
    # Find nodes by property
    "find_nodes_by_property": """
    MATCH (n:{label})
    WHERE n.{property} = $value
    RETURN n, id(n) as internal_id
    LIMIT $limit
    """,
}


# ============================================================================
# Relationship Queries
# ============================================================================

RELATIONSHIP_QUERIES = {
    # Create relationship between nodes
    "create_relationship": """
    MATCH (a:{from_label} {{id: $from_id}})
    MATCH (b:{to_label} {{id: $to_id}})
    CREATE (a)-[r:{rel_type} $properties]->(b)
    RETURN r, id(r) as internal_id, type(r) as rel_type
    """,
    # Get outgoing relationships
    "get_outgoing_relationships": """
    MATCH (n {{id: $node_id}})-[r]->(m)
    RETURN r, id(r) as internal_id, type(r) as rel_type,
           n.id as from_id, m.id as to_id, labels(m) as target_labels
    """,
    # Get incoming relationships
    "get_incoming_relationships": """
    MATCH (n {{id: $node_id}})<-[r]-(m)
    RETURN r, id(r) as internal_id, type(r) as rel_type,
           m.id as from_id, n.id as to_id, labels(m) as source_labels
    """,
    # Get all relationships (both directions)
    "get_all_relationships": """
    MATCH (n {{id: $node_id}})-[r]-(m)
    RETURN r, id(r) as internal_id, type(r) as rel_type,
           startNode(r).id as from_id, endNode(r).id as to_id
    """,
    # Delete relationship
    "delete_relationship": """
    MATCH (a {{id: $from_id}})-[r:{rel_type}]->(b {{id: $to_id}})
    DELETE r
    RETURN count(r) as deleted
    """,
    # Count relationships
    "count_relationships": """
    MATCH ()-[r:{rel_type}]->()
    RETURN count(r) as count
    """,
}


# ============================================================================
# Path Finding Queries
# ============================================================================

PATH_QUERIES = {
    # Find shortest path between two nodes
    "shortest_path": """
    MATCH path = shortestPath(
        (start {{id: $start_id}})-[{rel_filter}*1..{max_depth}]-(end {{id: $end_id}})
    )
    RETURN path, length(path) as path_length, 
           [node in nodes(path) | node.id] as node_ids,
           [rel in relationships(path) | type(rel)] as rel_types
    """,
    # Find all paths between two nodes
    "all_paths": """
    MATCH path = (start {{id: $start_id}})-[{rel_filter}*1..{max_depth}]->(end {{id: $end_id}})
    RETURN path, length(path) as path_length,
           [node in nodes(path) | {{id: node.id, labels: labels(node)}}] as nodes,
           [rel in relationships(path) | {{type: type(rel), properties: properties(rel)}}] as relationships
    LIMIT $limit
    """,
    # Find paths with specific relationship types
    "paths_by_rel_types": """
    MATCH path = (start {{id: $start_id}})-[{rel_types}*1..{max_depth}]->(end {{id: $end_id}})
    RETURN path, length(path) as path_length
    LIMIT $limit
    """,
}


# ============================================================================
# Subgraph Queries
# ============================================================================

SUBGRAPH_QUERIES = {
    # Get ego network (neighborhood) around a node
    "ego_network": """
    MATCH path = (center {{id: $center_id}})-[{rel_filter}*1..{depth}]-(neighbor)
    WITH center, neighbor, relationships(path) as rels
    RETURN center, 
           collect(DISTINCT neighbor) as neighbors,
           collect(DISTINCT rels) as all_relationships
    """,
    # Get connected component
    "connected_component": """
    MATCH path = (n {{id: $node_id}})-[*1..{max_depth}]-(connected)
    WITH n, collect(DISTINCT connected) as nodes, 
         collect(DISTINCT relationships(path)) as rel_collections
    RETURN n as center, nodes,
           REDUCE(acc = [], rels IN rel_collections | acc + rels) as relationships
    """,
    # Get subgraph by node labels
    "subgraph_by_labels": """
    MATCH (n:{label1})-[r]-(m:{label2})
    RETURN collect(DISTINCT n) + collect(DISTINCT m) as nodes,
           collect(DISTINCT r) as relationships
    LIMIT $limit
    """,
}


# ============================================================================
# Temporal Queries
# ============================================================================

TEMPORAL_QUERIES = {
    # Get beats in temporal order
    "beats_by_episode": """
    MATCH (b:Beat {{episode_id: $episode_id}})
    RETURN b
    ORDER BY b.start_seconds
    """,
    # Get beats within time range
    "beats_in_range": """
    MATCH (b:Beat {{episode_id: $episode_id}})
    WHERE b.start_seconds >= $start_time AND b.end_seconds <= $end_time
    RETURN b
    ORDER BY b.start_seconds
    """,
    # Get causality chain (beats connected by causality edges)
    "causality_chain": """
    MATCH path = (start:Beat {{beat_id: $start_beat_id}})-[:CAUSES|ENABLES|MOTIVATES*1..{max_depth}]->(end:Beat)
    RETURN path, length(path) as chain_length,
           [b in nodes(path) | b.beat_id] as beat_ids
    ORDER BY chain_length
    LIMIT $limit
    """,
    # Get character presence timeline
    "character_timeline": """
    MATCH (c:Character {{id: $character_id}})-[:APPEARS_IN]->(b:Beat)
    RETURN b.episode_id as episode, b.start_time as timestamp, 
           b.summary as description, b.intensity as intensity
    ORDER BY b.start_seconds
    """,
    # Get episodes in sequence
    "episodes_in_order": """
    MATCH (e:Episode)
    RETURN e
    ORDER BY e.season, e.episode_number
    """,
}


# ============================================================================
# Analysis Queries
# ============================================================================

ANALYSIS_QUERIES = {
    # Get node degree (number of connections)
    "node_degree": """
    MATCH (n {{id: $node_id}})-[r]-()
    RETURN count(r) as degree
    """,
    # Get degree distribution
    "degree_distribution": """
    MATCH (n:{label})-[r]-()
    WITH n, count(r) as degree
    RETURN degree, count(n) as count
    ORDER BY degree
    """,
    # Find central nodes (high degree)
    "central_nodes": """
    MATCH (n:{label})-[r]-()
    WITH n, count(r) as degree
    RETURN n, degree
    ORDER BY degree DESC
    LIMIT $limit
    """,
    # Find isolated nodes (no relationships)
    "isolated_nodes": """
    MATCH (n:{label})
    WHERE NOT (n)-[]-()
    RETURN n
    LIMIT $limit
    """,
    # Get relationship type distribution
    "rel_type_distribution": """
    MATCH ()-[r]->()
    RETURN type(r) as rel_type, count(r) as count
    ORDER BY count DESC
    """,
    # Find cycles
    "find_cycles": """
    MATCH path = (n)-[*3..{max_depth}]->(n)
    RETURN [node in nodes(path) | node.id] as cycle,
           length(path) as cycle_length
    LIMIT $limit
    """,
}


# ============================================================================
# Bulk Import Queries
# ============================================================================

BULK_QUERIES = {
    # Bulk create nodes
    "bulk_create_nodes": """
    UNWIND $nodes as node
    CREATE (n:{label})
    SET n = node
    RETURN count(n) as created
    """,
    # Bulk create relationships
    "bulk_create_relationships": """
    UNWIND $relationships as rel
    MATCH (a {{id: rel.from_id}})
    MATCH (b {{id: rel.to_id}})
    CREATE (a)-[r:{rel_type}]->(b)
    SET r = rel.properties
    RETURN count(r) as created
    """,
    # Merge nodes (create if not exists, update if exists)
    "merge_nodes": """
    UNWIND $nodes as node
    MERGE (n:{label} {{id: node.id}})
    SET n += node
    RETURN count(n) as merged
    """,
    # Merge relationships
    "merge_relationships": """
    UNWIND $relationships as rel
    MATCH (a {{id: rel.from_id}})
    MATCH (b {{id: rel.to_id}})
    MERGE (a)-[r:{rel_type}]->(b)
    SET r += rel.properties
    RETURN count(r) as merged
    """,
}


# ============================================================================
# Domain-Specific Queries (Shadow Lore Forge)
# ============================================================================

DOMAIN_QUERIES = {
    # Get character relationships graph
    "character_relationship_graph": """
    MATCH (c1:Character)-[r:RELATES_TO]->(c2:Character)
    RETURN c1, c2, r
    """,
    # Get character evolution over episodes
    "character_evolution": """
    MATCH (c:Character {{id: $character_id}})-[:APPEARS_IN]->(b:Beat)
    WITH c, b
    ORDER BY b.start_seconds
    RETURN collect({{
        episode: b.episode_id,
        timestamp: b.start_time,
        summary: b.summary,
        intensity: b.intensity,
        content_types: b.content_types
    }}) as evolution
    """,
    # Get mythos connections
    "mythos_connections": """
    MATCH (m1:Mythos)-[r:CONNECTS_TO|PREREQUISITE|CONTRADICTS|EVOLVES_TO|EXPLAINS]->(m2:Mythos)
    RETURN m1, m2, r
    """,
    # Get narrative beats with causality
    "narrative_causality": """
    MATCH (b1:Beat)-[r:CAUSES|ENABLES|MOTIVATES|CONSTRAINS|REVEALS|TRIGGERS]->(b2:Beat)
    WHERE b1.episode_id = $episode_id
    RETURN b1, b2, r
    ORDER BY b1.start_seconds
    """,
    # Get knowledge claims by subject
    "claims_by_subject": """
    MATCH (c:Claim {{subject: $subject}})
    RETURN c
    ORDER BY c.confidence DESC
    """,
    # Get cross-narrative alignments
    "cross_narrative_beats": """
    MATCH (b1:Beat {{version: 'bst'}}), (b2:Beat {{version: 'sst'}})
    WHERE b1.episode_id = b2.episode_id
    AND abs(b1.start_seconds - b2.start_seconds) < $time_threshold
    RETURN b1, b2
    ORDER BY b1.start_seconds
    """,
    # Get intensity timeline
    "intensity_timeline": """
    MATCH (b:Beat {{episode_id: $episode_id}})
    RETURN b.start_time as timestamp, b.start_seconds as seconds,
           b.intensity, b.summary
    ORDER BY b.start_seconds
    """,
}


# ============================================================================
# Query Builder Functions
# ============================================================================


def build_node_query(
    operation: str,
    label: str,
    **kwargs: Any,
) -> str:
    """Build a node query by formatting the template.

    Args:
        operation: Query operation name (e.g., 'create_node', 'get_node_by_id')
        label: Node label
        **kwargs: Additional format parameters

    Returns:
        Formatted Cypher query string
    """
    template = NODE_QUERIES.get(operation)
    if not template:
        raise ValueError(f"Unknown operation: {operation}")

    return template.format(label=label, **kwargs)


def build_relationship_query(
    operation: str,
    from_label: str = "",
    to_label: str = "",
    rel_type: str = "",
    **kwargs: Any,
) -> str:
    """Build a relationship query by formatting the template.

    Args:
        operation: Query operation name
        from_label: Source node label
        to_label: Target node label
        rel_type: Relationship type
        **kwargs: Additional format parameters

    Returns:
        Formatted Cypher query string
    """
    template = RELATIONSHIP_QUERIES.get(operation)
    if not template:
        raise ValueError(f"Unknown operation: {operation}")

    return template.format(
        from_label=from_label,
        to_label=to_label,
        rel_type=rel_type,
        **kwargs,
    )


def build_path_query(
    operation: str,
    rel_filter: str = "",
    max_depth: int = 5,
    **kwargs: Any,
) -> str:
    """Build a path finding query.

    Args:
        operation: Query operation name
        rel_filter: Relationship filter string (e.g., 'CAUSES|ENABLES')
        max_depth: Maximum path depth
        **kwargs: Additional format parameters

    Returns:
        Formatted Cypher query string
    """
    template = PATH_QUERIES.get(operation)
    if not template:
        raise ValueError(f"Unknown operation: {operation}")

    # Format rel_filter for Cypher
    if rel_filter:
        rel_filter = f":{rel_filter}"
    else:
        rel_filter = ""

    return template.format(
        rel_filter=rel_filter,
        max_depth=max_depth,
        **kwargs,
    )


def build_temporal_query(
    operation: str,
    max_depth: int = 10,
    **kwargs: Any,
) -> str:
    """Build a temporal query.

    Args:
        operation: Query operation name
        max_depth: Maximum chain depth
        **kwargs: Additional format parameters

    Returns:
        Formatted Cypher query string
    """
    template = TEMPORAL_QUERIES.get(operation)
    if not template:
        raise ValueError(f"Unknown operation: {operation}")

    return template.format(max_depth=max_depth, **kwargs)


def get_all_query_templates() -> dict[str, dict[str, str]]:
    """Get all query templates organized by category.

    Returns:
        Dictionary of query categories with their templates
    """
    return {
        "nodes": NODE_QUERIES,
        "relationships": RELATIONSHIP_QUERIES,
        "paths": PATH_QUERIES,
        "subgraphs": SUBGRAPH_QUERIES,
        "temporal": TEMPORAL_QUERIES,
        "analysis": ANALYSIS_QUERIES,
        "bulk": BULK_QUERIES,
        "domain": DOMAIN_QUERIES,
    }
