"""
Collaborative Editing with CRDT (Conflict-free Replicated Data Types).
Enables real-time collaborative editing of narrative content.
"""

from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, field
from enum import Enum
import time
import hashlib
import json
from collections import defaultdict


class OperationType(Enum):
    """Types of collaborative operations."""

    INSERT = "insert"
    DELETE = "delete"
    UPDATE = "update"
    MOVE = "move"


@dataclass
class CRDTOperation:
    """A single CRDT operation."""

    op_id: str
    op_type: OperationType
    target_id: str
    field: str
    value: Any
    timestamp: float
    user_id: str
    vector_clock: Dict[str, int] = field(default_factory=dict)
    parent_ops: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "op_id": self.op_id,
            "op_type": self.op_type.value,
            "target_id": self.target_id,
            "field": self.field,
            "value": self.value,
            "timestamp": self.timestamp,
            "user_id": self.user_id,
            "vector_clock": self.vector_clock,
            "parent_ops": self.parent_ops,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "CRDTOperation":
        """Create from dictionary."""
        return cls(
            op_id=data["op_id"],
            op_type=OperationType(data["op_type"]),
            target_id=data["target_id"],
            field=data["field"],
            value=data["value"],
            timestamp=data["timestamp"],
            user_id=data["user_id"],
            vector_clock=data.get("vector_clock", {}),
            parent_ops=data.get("parent_ops", []),
        )


@dataclass
class CRDTNode:
    """A node in a CRDT document tree."""

    node_id: str
    node_type: str  # 'element', 'text', 'attribute'
    content: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    children: List[str] = field(default_factory=list)
    parent: Optional[str] = None
    created_by: str = ""
    created_at: float = 0.0
    version: int = 1
    deleted: bool = False

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "node_id": self.node_id,
            "node_type": self.node_type,
            "content": self.content,
            "attributes": self.attributes,
            "children": self.children,
            "parent": self.parent,
            "created_by": self.created_by,
            "created_at": self.created_at,
            "version": self.version,
            "deleted": self.deleted,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "CRDTNode":
        """Create from dictionary."""
        return cls(
            node_id=data["node_id"],
            node_type=data["node_type"],
            content=data["content"],
            attributes=data.get("attributes", {}),
            children=data.get("children", []),
            parent=data.get("parent"),
            created_by=data.get("created_by", ""),
            created_at=data.get("created_at", 0.0),
            version=data.get("version", 1),
            deleted=data.get("deleted", False),
        )


class CRDTDocument:
    """
    A CRDT-based document for collaborative editing.

    Supports concurrent editing without conflicts using operation-based CRDTs.
    """

    def __init__(self, doc_id: str, doc_type: str = "narrative"):
        """
        Initialize a CRDT document.

        Args:
            doc_id: Unique document identifier
            doc_type: Type of document (narrative, character, etc.)
        """
        self.doc_id = doc_id
        self.doc_type = doc_type
        self.nodes: Dict[str, CRDTNode] = {}
        self.operations: List[CRDTOperation] = []
        self.vector_clock: Dict[str, int] = defaultdict(int)
        self.root_id: Optional[str] = None
        self.users: Set[str] = set()

    def create_node(
        self,
        node_type: str,
        content: str,
        user_id: str,
        parent: Optional[str] = None,
        attributes: Optional[Dict] = None,
    ) -> str:
        """
        Create a new node in the document.

        Args:
            node_type: Type of node
            content: Node content
            user_id: ID of creating user
            parent: Parent node ID (optional)
            attributes: Node attributes (optional)

        Returns:
            ID of created node
        """
        node_id = self._generate_id()

        node = CRDTNode(
            node_id=node_id,
            node_type=node_type,
            content=content,
            attributes=attributes or {},
            parent=parent,
            created_by=user_id,
            created_at=time.time(),
        )

        self.nodes[node_id] = node

        # Add to parent's children if parent exists
        if parent and parent in self.nodes:
            self.nodes[parent].children.append(node_id)

        # Set as root if no root exists
        if self.root_id is None:
            self.root_id = node_id

        # Create operation
        self._create_operation(OperationType.INSERT, node_id, "content", content, user_id)

        self.users.add(user_id)

        return node_id

    def update_node(self, node_id: str, field: str, value: Any, user_id: str) -> bool:
        """
        Update a node's field.

        Args:
            node_id: ID of node to update
            field: Field to update
            value: New value
            user_id: ID of updating user

        Returns:
            True if successful
        """
        if node_id not in self.nodes:
            return False

        node = self.nodes[node_id]

        if field == "content":
            node.content = value
        elif field == "attributes":
            node.attributes.update(value)
        elif field == "parent":
            # Update parent relationship
            old_parent = node.parent
            if old_parent and old_parent in self.nodes:
                self.nodes[old_parent].children.remove(node_id)

            node.parent = value
            if value and value in self.nodes:
                self.nodes[value].children.append(node_id)

        node.version += 1

        self._create_operation(OperationType.UPDATE, node_id, field, value, user_id)

        self.users.add(user_id)

        return True

    def delete_node(self, node_id: str, user_id: str) -> bool:
        """
        Soft-delete a node (CRDT tombstone).

        Args:
            node_id: ID of node to delete
            user_id: ID of deleting user

        Returns:
            True if successful
        """
        if node_id not in self.nodes:
            return False

        self.nodes[node_id].deleted = True

        self._create_operation(OperationType.DELETE, node_id, "deleted", True, user_id)

        self.users.add(user_id)

        return True

    def get_node(self, node_id: str) -> Optional[CRDTNode]:
        """Get a node by ID."""
        return self.nodes.get(node_id)

    def get_children(self, node_id: str, include_deleted: bool = False) -> List[CRDTNode]:
        """Get children of a node."""
        if node_id not in self.nodes:
            return []

        children = []
        for child_id in self.nodes[node_id].children:
            if child_id in self.nodes:
                child = self.nodes[child_id]
                if not child.deleted or include_deleted:
                    children.append(child)

        return children

    def get_tree(self, include_deleted: bool = False) -> Dict:
        """Get document as tree structure."""
        if not self.root_id:
            return {}

        def build_tree(node_id: str) -> Dict:
            if node_id not in self.nodes:
                return {}

            node = self.nodes[node_id]
            if node.deleted and not include_deleted:
                return {}

            return {
                **node.to_dict(),
                "children": [build_tree(child_id) for child_id in node.children],
            }

        return build_tree(self.root_id)

    def merge_operations(self, remote_ops: List[CRDTOperation]) -> List[CRDTOperation]:
        """
        Merge remote operations into this document.

        Implements CRDT merge logic for conflict resolution.

        Args:
            remote_ops: Operations from another replica

        Returns:
            List of applied operations
        """
        applied = []

        for op in remote_ops:
            # Check if we've already seen this operation
            if any(o.op_id == op.op_id for o in self.operations):
                continue

            # Update vector clock
            self.vector_clock[op.user_id] = max(
                self.vector_clock[op.user_id], op.vector_clock.get(op.user_id, 0)
            )

            # Apply operation
            self._apply_operation(op)
            self.operations.append(op)
            applied.append(op)

        return applied

    def _create_operation(
        self, op_type: OperationType, target_id: str, field: str, value: Any, user_id: str
    ) -> CRDTOperation:
        """Create and track a new operation."""
        # Increment vector clock
        self.vector_clock[user_id] += 1

        op = CRDTOperation(
            op_id=self._generate_op_id(),
            op_type=op_type,
            target_id=target_id,
            field=field,
            value=value,
            timestamp=time.time(),
            user_id=user_id,
            vector_clock=dict(self.vector_clock),
            parent_ops=[o.op_id for o in self.operations[-5:]],  # Last 5 ops
        )

        self.operations.append(op)

        return op

    def _apply_operation(self, op: CRDTOperation):
        """Apply an operation to the document."""
        if op.op_type == OperationType.INSERT:
            # Node already created, just ensure it exists
            if op.target_id not in self.nodes:
                self.nodes[op.target_id] = CRDTNode(
                    node_id=op.target_id,
                    node_type="element",
                    content=op.value,
                    created_by=op.user_id,
                    created_at=op.timestamp,
                )

        elif op.op_type == OperationType.UPDATE:
            if op.target_id in self.nodes:
                node = self.nodes[op.target_id]
                if op.field == "content":
                    node.content = op.value
                elif op.field == "attributes":
                    node.attributes.update(op.value)
                node.version += 1

        elif op.op_type == OperationType.DELETE:
            if op.target_id in self.nodes:
                self.nodes[op.target_id].deleted = True

    def _generate_id(self) -> str:
        """Generate unique node ID."""
        return f"node_{hashlib.md5(str(time.time()).encode()).hexdigest()[:12]}"

    def _generate_op_id(self) -> str:
        """Generate unique operation ID."""
        return f"op_{hashlib.md5(str(time.time()).encode()).hexdigest()[:12]}"

    def get_pending_operations(self, since_vector_clock: Dict[str, int]) -> List[CRDTOperation]:
        """
        Get operations that are new relative to a vector clock.

        Args:
            since_vector_clock: Vector clock to compare against

        Returns:
            List of new operations
        """
        pending = []

        for op in self.operations:
            # Check if this operation is newer than the given clock
            op_time = op.vector_clock.get(op.user_id, 0)
            known_time = since_vector_clock.get(op.user_id, 0)

            if op_time > known_time:
                pending.append(op)

        return pending

    def to_dict(self) -> Dict:
        """Convert document to dictionary."""
        return {
            "doc_id": self.doc_id,
            "doc_type": self.doc_type,
            "root_id": self.root_id,
            "nodes": {k: v.to_dict() for k, v in self.nodes.items()},
            "operations": [o.to_dict() for o in self.operations],
            "vector_clock": dict(self.vector_clock),
            "users": list(self.users),
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "CRDTDocument":
        """Create document from dictionary."""
        doc = cls(data["doc_id"], data.get("doc_type", "narrative"))
        doc.root_id = data.get("root_id")
        doc.nodes = {k: CRDTNode.from_dict(v) for k, v in data.get("nodes", {}).items()}
        doc.operations = [CRDTOperation.from_dict(o) for o in data.get("operations", [])]
        doc.vector_clock = defaultdict(int, data.get("vector_clock", {}))
        doc.users = set(data.get("users", []))
        return doc


class CollaborationSession:
    """
    Manages a collaborative editing session.

    Coordinates multiple users editing the same document.
    """

    def __init__(self, session_id: str, document: CRDTDocument):
        """
        Initialize collaboration session.

        Args:
            session_id: Unique session identifier
            document: CRDT document to collaborate on
        """
        self.session_id = session_id
        self.document = document
        self.connected_users: Dict[str, Dict] = {}
        self.last_sync: Dict[str, float] = {}

    def join(self, user_id: str, user_info: Optional[Dict] = None):
        """User joins the session."""
        self.connected_users[user_id] = user_info or {}
        self.last_sync[user_id] = time.time()
        self.document.users.add(user_id)

    def leave(self, user_id: str):
        """User leaves the session."""
        if user_id in self.connected_users:
            del self.connected_users[user_id]
        if user_id in self.last_sync:
            del self.last_sync[user_id]

    def apply_operation(self, op: CRDTOperation) -> bool:
        """Apply an operation from a user."""
        if op.user_id not in self.connected_users:
            return False

        self.document._apply_operation(op)
        self.document.operations.append(op)
        self.last_sync[op.user_id] = time.time()

        return True

    def sync_for_user(self, user_id: str) -> List[CRDTOperation]:
        """Get operations to sync to a specific user."""
        if user_id not in self.connected_users:
            return []

        # Get operations since last sync
        user_clock = {user_id: self.document.vector_clock.get(user_id, 0)}

        return self.document.get_pending_operations(user_clock)

    def get_active_users(self) -> List[str]:
        """Get list of currently active users."""
        return list(self.connected_users.keys())

    def get_user_cursors(self) -> Dict[str, str]:
        """Get current cursor positions for all users."""
        return {
            user_id: info.get("cursor_position", "")
            for user_id, info in self.connected_users.items()
        }
