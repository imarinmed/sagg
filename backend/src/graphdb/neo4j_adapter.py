"""Neo4j graph database adapter for Shadow Lore Forge.

Provides async connection management, CRUD operations, and query execution
for the Neo4j graph database backend.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from neo4j import AsyncDriver, AsyncGraphDatabase, AsyncSession
from neo4j.exceptions import Neo4jError, ServiceUnavailable

logger = logging.getLogger(__name__)


class Neo4jAdapter:
    """Async Neo4j adapter with connection pooling and CRUD operations.

    This adapter provides a high-level interface for interacting with Neo4j,
    following the same patterns as the file-based data loading in data.py.
    """

    _instance: Neo4jAdapter | None = None

    def __new__(cls, *args, **kwargs):
        """Singleton pattern to ensure single connection pool."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(
        self,
        uri: str = "bolt://localhost:7687",
        user: str = "neo4j",
        password: str = "password",
        database: str = "neo4j",
        max_connection_pool_size: int = 50,
    ):
        if self._initialized:
            return

        self.uri = uri
        self.user = user
        self.password = password
        self.database = database
        self.max_connection_pool_size = max_connection_pool_size
        self._driver: AsyncDriver | None = None
        self._initialized = True

    async def connect(self) -> None:
        """Initialize the Neo4j driver connection pool."""
        if self._driver is not None:
            return

        try:
            self._driver = AsyncGraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
                max_connection_pool_size=self.max_connection_pool_size,
            )
            # Verify connectivity
            await self._driver.verify_connectivity()
            logger.info(f"Connected to Neo4j at {self.uri}")
        except ServiceUnavailable as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise

    async def close(self) -> None:
        """Close the Neo4j driver and connection pool."""
        if self._driver is not None:
            await self._driver.close()
            self._driver = None
            logger.info("Neo4j connection closed")

    @asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        """Get a session from the connection pool."""
        if self._driver is None:
            await self.connect()

        session = self._driver.session(database=self.database)
        try:
            yield session
        finally:
            await session.close()

    async def health_check(self) -> dict[str, Any]:
        """Check Neo4j connection health."""
        try:
            if self._driver is None:
                return {"status": "disconnected", "connected": False}

            await self._driver.verify_connectivity()

            async with self.session() as session:
                result = await session.run("CALL dbms.components() YIELD name, versions")
                record = await result.single()

                return {
                    "status": "healthy",
                    "connected": True,
                    "version": record["versions"][0] if record else "unknown",
                    "database": self.database,
                }
        except ServiceUnavailable as e:
            return {"status": "unavailable", "connected": False, "error": str(e)}
        except Neo4jError as e:
            return {"status": "error", "connected": False, "error": str(e)}

    # =========================================================================
    # Node CRUD Operations
    # =========================================================================

    async def create_node(
        self,
        label: str,
        properties: dict[str, Any],
        node_id: str | None = None,
    ) -> dict[str, Any]:
        """Create a node with the given label and properties.

        Args:
            label: Node label (e.g., 'Character', 'Episode', 'Beat')
            properties: Node properties
            node_id: Optional unique identifier (sets 'id' property)

        Returns:
            Created node data with internal Neo4j ID
        """
        if node_id:
            properties = {**properties, "id": node_id}

        # Build dynamic Cypher query
        props_str = ", ".join(f"{k}: ${k}" for k in properties.keys())
        query = f"""
        CREATE (n:{label} {{{props_str}}})
        RETURN n, id(n) as internal_id
        """

        async with self.session() as session:
            result = await session.run(query, **properties)
            record = await result.single()

            if record is None:
                raise Neo4jError("Failed to create node")

            node_data = dict(record["n"])
            node_data["_internal_id"] = record["internal_id"]
            return node_data

    async def get_node(
        self,
        label: str,
        node_id: str,
    ) -> dict[str, Any] | None:
        """Get a node by its ID property.

        Args:
            label: Node label
            node_id: Value of the 'id' property

        Returns:
            Node data or None if not found
        """
        query = f"""
        MATCH (n:{label} {{id: $node_id}})
        RETURN n, id(n) as internal_id
        """

        async with self.session() as session:
            result = await session.run(query, node_id=node_id)
            record = await result.single()

            if record is None:
                return None

            node_data = dict(record["n"])
            node_data["_internal_id"] = record["internal_id"]
            return node_data

    async def update_node(
        self,
        label: str,
        node_id: str,
        properties: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Update a node's properties.

        Args:
            label: Node label
            node_id: Value of the 'id' property
            properties: New properties to set (merges with existing)

        Returns:
            Updated node data or None if not found
        """
        # Build SET clause dynamically
        set_clauses = [f"n.{k} = ${k}" for k in properties]
        set_str = ", ".join(set_clauses)

        query = f"""
        MATCH (n:{label} {{id: $node_id}})
        SET {set_str}
        RETURN n, id(n) as internal_id
        """

        params = {"node_id": node_id, **properties}

        async with self.session() as session:
            result = await session.run(query, **params)
            record = await result.single()

            if record is None:
                return None

            node_data = dict(record["n"])
            node_data["_internal_id"] = record["internal_id"]
            return node_data

    async def delete_node(
        self,
        label: str,
        node_id: str,
        detach: bool = True,
    ) -> bool:
        """Delete a node.

        Args:
            label: Node label
            node_id: Value of the 'id' property
            detach: If True, also delete all relationships

        Returns:
            True if deleted, False if not found
        """
        detach_clause = "DETACH" if detach else ""
        query = f"""
        MATCH (n:{label} {{id: $node_id}})
        {detach_clause} DELETE n
        RETURN count(n) as deleted_count
        """

        async with self.session() as session:
            result = await session.run(query, node_id=node_id)
            record = await result.single()
            return record["deleted_count"] > 0 if record else False

    async def list_nodes(
        self,
        label: str,
        limit: int = 100,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        """List all nodes of a given label.

        Args:
            label: Node label
            limit: Maximum number of nodes to return
            skip: Number of nodes to skip (for pagination)

        Returns:
            List of node data
        """
        query = f"""
        MATCH (n:{label})
        RETURN n, id(n) as internal_id
        ORDER BY n.id
        SKIP $skip LIMIT $limit
        """

        async with self.session() as session:
            result = await session.run(query, skip=skip, limit=limit)
            records = await result.data()

            nodes = []
            for record in records:
                node_data = dict(record["n"])
                node_data["_internal_id"] = record["internal_id"]
                nodes.append(node_data)
            return nodes

    # =========================================================================
    # Relationship CRUD Operations
    # =========================================================================

    async def create_relationship(
        self,
        from_label: str,
        from_id: str,
        to_label: str,
        to_id: str,
        rel_type: str,
        properties: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Create a relationship between two nodes.

        Args:
            from_label: Label of source node
            from_id: ID of source node
            to_label: Label of target node
            to_id: ID of target node
            rel_type: Relationship type (e.g., 'CAUSES', 'RELATES_TO')
            properties: Optional relationship properties

        Returns:
            Relationship data
        """
        props = properties or {}

        if props:
            props_str = ", ".join(f"{k}: ${k}" for k in props.keys())
            create_clause = f"CREATE (a)-[r:{rel_type} {{{props_str}}}]->(b)"
        else:
            create_clause = f"CREATE (a)-[r:{rel_type}]->(b)"

        query = f"""
        MATCH (a:{from_label} {{id: $from_id}})
        MATCH (b:{to_label} {{id: $to_id}})
        {create_clause}
        RETURN r, id(r) as internal_id, a.id as from_id, b.id as to_id
        """

        params = {"from_id": from_id, "to_id": to_id, **props}

        async with self.session() as session:
            result = await session.run(query, **params)
            record = await result.single()

            if record is None:
                raise Neo4jError("Failed to create relationship - nodes may not exist")

            rel_data = dict(record["r"])
            rel_data["_internal_id"] = record["internal_id"]
            rel_data["from_id"] = record["from_id"]
            rel_data["to_id"] = record["to_id"]
            rel_data["type"] = rel_type
            return rel_data

    async def get_relationships(
        self,
        node_id: str,
        direction: str = "both",  # 'out', 'in', 'both'
        rel_type: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get all relationships for a node.

        Args:
            node_id: ID of the node
            direction: 'out' (outgoing), 'in' (incoming), 'both'
            rel_type: Optional relationship type filter

        Returns:
            List of relationship data with connected node info
        """
        type_filter = f":{rel_type}" if rel_type else ""

        if direction == "out":
            pattern = f"(n)-[r{type_filter}]->(m)"
        elif direction == "in":
            pattern = f"(n)<-[r{type_filter}]-(m)"
        else:  # both
            pattern = f"(n)-[r{type_filter}]-(m)"

        query = f"""
        MATCH (n {{id: $node_id}}){pattern[4:]}  # Remove '(n)' prefix
        RETURN r, id(r) as internal_id, type(r) as rel_type,
               n.id as source_id, m.id as target_id,
               labels(n) as source_labels, labels(m) as target_labels
        """

        async with self.session() as session:
            result = await session.run(query, node_id=node_id)
            records = await result.data()

            relationships = []
            for record in records:
                rel_data = dict(record["r"])
                rel_data["_internal_id"] = record["internal_id"]
                rel_data["type"] = record["rel_type"]
                rel_data["from_id"] = record["source_id"]
                rel_data["to_id"] = record["target_id"]
                rel_data["from_label"] = (
                    record["source_labels"][0] if record["source_labels"] else None
                )
                rel_data["to_label"] = (
                    record["target_labels"][0] if record["target_labels"] else None
                )
                relationships.append(rel_data)
            return relationships

    async def delete_relationship(
        self,
        from_id: str,
        to_id: str,
        rel_type: str | None = None,
    ) -> bool:
        """Delete a relationship between two nodes.

        Args:
            from_id: Source node ID
            to_id: Target node ID
            rel_type: Optional relationship type filter

        Returns:
            True if deleted, False if not found
        """
        type_filter = f":{rel_type}" if rel_type else ""

        query = f"""
        MATCH (a {{id: $from_id}})-[r{type_filter}]->(b {{id: $to_id}})
        DELETE r
        RETURN count(r) as deleted_count
        """

        async with self.session() as session:
            result = await session.run(query, from_id=from_id, to_id=to_id)
            record = await result.single()
            return record["deleted_count"] > 0 if record else False

    # =========================================================================
    # Graph Traversal Queries
    # =========================================================================

    async def find_paths(
        self,
        start_id: str,
        end_id: str,
        max_depth: int = 5,
        rel_types: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Find all paths between two nodes.

        Args:
            start_id: Starting node ID
            end_id: Ending node ID
            max_depth: Maximum path length
            rel_types: Optional list of relationship types to follow

        Returns:
            List of paths, each containing nodes and relationships
        """
        rel_filter = ""
        if rel_types:
            rel_filter = "|".join(rel_types)
            rel_filter = f"[{rel_filter}]"
        else:
            rel_filter = f"[*1..{max_depth}]"

        query = f"""
        MATCH path = (start {{id: $start_id}})-{rel_filter}->(end {{id: $end_id}})
        WHERE length(path) <= $max_depth
        RETURN path, length(path) as path_length
        LIMIT 10
        """

        async with self.session() as session:
            result = await session.run(query, start_id=start_id, end_id=end_id, max_depth=max_depth)
            records = await result.data()

            paths = []
            for record in records:
                path = record["path"]
                path_data = {
                    "length": record["path_length"],
                    "nodes": [dict(node) for node in path.nodes],
                    "relationships": [dict(rel) for rel in path.relationships],
                }
                paths.append(path_data)
            return paths

    async def get_subgraph(
        self,
        center_id: str,
        depth: int = 2,
        rel_types: list[str] | None = None,
    ) -> dict[str, list]:
        """Get a subgraph centered around a node.

        Args:
            center_id: Center node ID
            depth: How many hops to include
            rel_types: Optional relationship type filter

        Returns:
            Dictionary with 'nodes' and 'relationships' lists
        """
        rel_filter = ""
        if rel_types:
            rel_filter = "|".join(rel_types)
            rel_filter = f"r:{rel_filter}"
        else:
            rel_filter = "r"

        query = f"""
        MATCH path = (center {{id: $center_id}})-[{rel_filter}*1..{depth}]-(connected)
        WITH center, connected, relationships(path) as rels
        RETURN center, collect(DISTINCT connected) as nodes, 
               collect(DISTINCT rels) as rel_collections
        """

        async with self.session() as session:
            result = await session.run(query, center_id=center_id, depth=depth)
            record = await result.single()

            if record is None:
                return {"nodes": [], "relationships": []}

            # Flatten relationships (they come as list of lists)
            all_rels = []
            for rel_list in record["rel_collections"]:
                all_rels.extend(rel_list)

            # Deduplicate relationships
            seen_rels = set()
            unique_rels = []
            for rel in all_rels:
                rel_id = rel.id
                if rel_id not in seen_rels:
                    seen_rels.add(rel_id)
                    rel_data = dict(rel)
                    rel_data["_internal_id"] = rel_id
                    unique_rels.append(rel_data)

            nodes = [dict(record["center"])]
            for node in record["nodes"]:
                node_data = dict(node)
                nodes.append(node_data)

            return {
                "nodes": nodes,
                "relationships": unique_rels,
            }

    async def get_neighbors(
        self,
        node_id: str,
        rel_type: str | None = None,
        direction: str = "both",
    ) -> list[dict[str, Any]]:
        """Get immediate neighbors of a node.

        Args:
            node_id: Center node ID
            rel_type: Optional relationship type filter
            direction: 'out', 'in', or 'both'

        Returns:
            List of neighbor nodes with relationship info
        """
        type_filter = f":{rel_type}" if rel_type else ""

        if direction == "out":
            pattern = f"(n)-[r{type_filter}]->(m)"
        elif direction == "in":
            pattern = f"(n)<-[r{type_filter}]-(m)"
        else:
            pattern = f"(n)-[r{type_filter}]-(m)"

        query = f"""
        MATCH {pattern}
        WHERE n.id = $node_id
        RETURN m as neighbor, r as relationship, type(r) as rel_type,
               startNode(r).id as from_id, endNode(r).id as to_id
        """

        async with self.session() as session:
            result = await session.run(query, node_id=node_id)
            records = await result.data()

            neighbors = []
            for record in records:
                neighbor_data = dict(record["neighbor"])
                neighbor_data["_relationship"] = dict(record["relationship"])
                neighbor_data["_relationship_type"] = record["rel_type"]
                neighbor_data["_from_id"] = record["from_id"]
                neighbor_data["_to_id"] = record["to_id"]
                neighbors.append(neighbor_data)
            return neighbors

    # =========================================================================
    # Bulk Import Operations
    # =========================================================================

    async def bulk_import_nodes(
        self,
        label: str,
        nodes: list[dict[str, Any]],
        batch_size: int = 1000,
    ) -> dict[str, Any]:
        """Bulk import nodes using UNWIND for efficiency.

        Args:
            label: Node label
            nodes: List of node property dictionaries
            batch_size: Number of nodes per batch

        Returns:
            Import statistics
        """
        total_created = 0
        errors = []

        query = f"""
        UNWIND $nodes as node
        CREATE (n:{label})
        SET n = node
        RETURN count(n) as created
        """

        for i in range(0, len(nodes), batch_size):
            batch = nodes[i : i + batch_size]

            try:
                async with self.session() as session:
                    result = await session.run(query, nodes=batch)
                    record = await result.single()
                    total_created += record["created"] if record else 0
            except Neo4jError as e:
                logger.error(f"Error importing batch {i // batch_size}: {e}")
                errors.append({"batch": i // batch_size, "error": str(e)})

        return {
            "total": len(nodes),
            "created": total_created,
            "errors": len(errors),
            "error_details": errors,
        }

    async def bulk_import_relationships(
        self,
        rel_type: str,
        relationships: list[dict[str, Any]],
        batch_size: int = 1000,
    ) -> dict[str, Any]:
        """Bulk import relationships using UNWIND.

        Args:
            rel_type: Relationship type
            relationships: List of relationship dicts with 'from_id', 'to_id', and properties
            batch_size: Number of relationships per batch

        Returns:
            Import statistics
        """
        total_created = 0
        errors = []

        query = f"""
        UNWIND $relationships as rel
        MATCH (a {{id: rel.from_id}})
        MATCH (b {{id: rel.to_id}})
        CREATE (a)-[r:{rel_type}]->(b)
        SET r = rel.properties
        RETURN count(r) as created
        """

        for i in range(0, len(relationships), batch_size):
            batch = relationships[i : i + batch_size]

            try:
                async with self.session() as session:
                    result = await session.run(query, relationships=batch)
                    record = await result.single()
                    total_created += record["created"] if record else 0
            except Neo4jError as e:
                logger.error(f"Error importing relationship batch {i // batch_size}: {e}")
                errors.append({"batch": i // batch_size, "error": str(e)})

        return {
            "total": len(relationships),
            "created": total_created,
            "errors": len(errors),
            "error_details": errors,
        }

    async def clear_database(self, confirm: bool = False) -> dict[str, Any]:
        """Clear all nodes and relationships from the database.

        DANGER: This deletes all data!

        Args:
            confirm: Must be True to actually delete

        Returns:
            Deletion statistics
        """
        if not confirm:
            return {"error": "Must pass confirm=True to clear database"}

        query = """
        MATCH (n)
        DETACH DELETE n
        RETURN count(n) as deleted_nodes
        """

        async with self.session() as session:
            result = await session.run(query)
            record = await result.single()
            return {
                "deleted_nodes": record["deleted_nodes"] if record else 0,
                "status": "cleared",
            }

    # =========================================================================
    # Custom Query Execution
    # =========================================================================

    async def execute_query(
        self,
        query: str,
        parameters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """Execute a custom Cypher query.

        Args:
            query: Cypher query string
            parameters: Query parameters

        Returns:
            List of record dictionaries
        """
        params = parameters or {}

        async with self.session() as session:
            result = await session.run(query, **params)
            records = await result.data()
            return records

    async def execute_read_query(
        self,
        query: str,
        parameters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """Execute a read-only Cypher query.

        Args:
            query: Cypher query string (should be read-only)
            parameters: Query parameters

        Returns:
            List of record dictionaries
        """
        params = parameters or {}

        async with self.session() as session:
            result = await session.run(query, **params)
            records = await result.data()
            return records


# Global adapter instance
_adapter: Neo4jAdapter | None = None


def get_adapter(
    uri: str = "bolt://localhost:7687",
    user: str = "neo4j",
    password: str = "password",
    database: str = "neo4j",
) -> Neo4jAdapter:
    """Get or create the global Neo4j adapter instance.

    This follows the same pattern as the database dictionaries in data.py,
    providing a singleton adapter that can be imported throughout the app.
    """
    global _adapter
    if _adapter is None:
        _adapter = Neo4jAdapter(
            uri=uri,
            user=user,
            password=password,
            database=database,
        )
    return _adapter


async def init_adapter() -> Neo4jAdapter:
    """Initialize the adapter and connect to Neo4j.

    Call this during application startup.
    """
    adapter = get_adapter()
    await adapter.connect()
    return adapter


async def close_adapter() -> None:
    """Close the adapter connection.

    Call this during application shutdown.
    """
    global _adapter
    if _adapter is not None:
        await _adapter.close()
        _adapter = None
