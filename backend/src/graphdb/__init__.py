"""Neo4j graph database module for Shadow Lore Forge.

This module provides Neo4j integration for the Shadow Lore Forge project,
including connection management, CRUD operations, and graph queries.
"""

from .neo4j_adapter import Neo4jAdapter, close_adapter, get_adapter, init_adapter
from .queries import (
    ANALYSIS_QUERIES,
    BULK_QUERIES,
    DOMAIN_QUERIES,
    NODE_QUERIES,
    PATH_QUERIES,
    RELATIONSHIP_QUERIES,
    SUBGRAPH_QUERIES,
    TEMPORAL_QUERIES,
    build_node_query,
    build_path_query,
    build_relationship_query,
    build_temporal_query,
    get_all_query_templates,
)
from .routes import router

__all__ = [
    # Adapter
    "Neo4jAdapter",
    "get_adapter",
    "init_adapter",
    "close_adapter",
    # Query templates
    "NODE_QUERIES",
    "RELATIONSHIP_QUERIES",
    "PATH_QUERIES",
    "SUBGRAPH_QUERIES",
    "TEMPORAL_QUERIES",
    "ANALYSIS_QUERIES",
    "BULK_QUERIES",
    "DOMAIN_QUERIES",
    # Query builders
    "build_node_query",
    "build_relationship_query",
    "build_path_query",
    "build_temporal_query",
    "get_all_query_templates",
    # Routes
    "router",
]
