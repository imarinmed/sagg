from fastapi import APIRouter, HTTPException, Query

from ..data import mythos_connections_db, mythos_db
from ..models import (
    CONNECTION_TYPES,
    D3GraphLink,
    D3GraphNode,
    MythosConnection,
    MythosElement,
    MythosGraphResponse,
)

router = APIRouter(prefix="/api/mythos", tags=["mythos"])

CATEGORY_GROUPS = {
    "biology": 1,
    "society": 2,
    "supernatural": 3,
    "psychology": 4,
    "rules": 5,
}

CATEGORY_COLORS = {
    "biology": "#e53e3e",
    "society": "#805ad5",
    "supernatural": "#3182ce",
    "psychology": "#38a169",
    "rules": "#d69e2e",
}

CONNECTION_TYPE_STRENGTHS = {
    "prerequisite": 5,
    "evolves_to": 4,
    "explains": 3,
    "related": 2,
    "contradicts": 1,
}


@router.get("", response_model=list[MythosElement])
async def list_mythos(
    category: str | None = Query(None, description="Filter by category"),
):
    elements = list(mythos_db.values())
    if category:
        elements = [e for e in elements if e.category == category]
    return elements


@router.get("/categories", response_model=list[str])
async def list_categories():
    categories = {e.category for e in mythos_db.values()}
    return sorted(categories)


@router.get("/connections", response_model=list[MythosConnection])
async def list_connections(
    connection_type: str | None = Query(None, description="Filter by connection type"),
    from_element_id: str | None = Query(None, description="Filter by source element"),
    to_element_id: str | None = Query(None, description="Filter by target element"),
):
    connections = list(mythos_connections_db.values())
    if connection_type:
        if connection_type not in CONNECTION_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid connection type. Must be one of: {CONNECTION_TYPES}",
            )
        connections = [c for c in connections if c.connection_type == connection_type]
    if from_element_id:
        connections = [c for c in connections if c.from_element_id == from_element_id]
    if to_element_id:
        connections = [c for c in connections if c.to_element_id == to_element_id]
    return connections


@router.get("/connections/types", response_model=list[str])
async def list_connection_types():
    return CONNECTION_TYPES


@router.get("/graph", response_model=MythosGraphResponse)
async def get_mythos_graph():
    nodes = []
    for element in mythos_db.values():
        category = element.category.lower()
        nodes.append(
            D3GraphNode(
                id=element.id,
                name=element.name,
                group=CATEGORY_GROUPS.get(category, 1),
                radius=25,
                color=CATEGORY_COLORS.get(category, "#718096"),
                metadata={
                    "category": element.category,
                    "short_description": element.short_description,
                    "horror_elements": element.horror_elements,
                },
            )
        )

    links = []
    for connection in mythos_connections_db.values():
        conn_type = connection.connection_type.lower()
        links.append(
            D3GraphLink(
                source=connection.from_element_id,
                target=connection.to_element_id,
                type=connection.connection_type,
                value=CONNECTION_TYPE_STRENGTHS.get(conn_type, 2),
                color="#c9a227" if conn_type == "prerequisite" else "#6b7280",
            )
        )

    categories = sorted({e.category for e in mythos_db.values()})

    return MythosGraphResponse(
        nodes=nodes,
        links=links,
        total_elements=len(nodes),
        total_connections=len(links),
        categories=categories,
    )


@router.get("/{mythos_id}", response_model=MythosElement)
async def get_mythos(mythos_id: str):
    if mythos_id not in mythos_db:
        raise HTTPException(status_code=404, detail="Mythos element not found")
    return mythos_db[mythos_id]


@router.get("/{mythos_id}/connections", response_model=list[MythosConnection])
async def get_element_connections(mythos_id: str):
    if mythos_id not in mythos_db:
        raise HTTPException(status_code=404, detail="Mythos element not found")

    connections = [
        c
        for c in mythos_connections_db.values()
        if c.from_element_id == mythos_id or c.to_element_id == mythos_id
    ]
    return connections
