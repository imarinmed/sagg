from fastapi import APIRouter, HTTPException
from typing import List
from ..models import MythosElement
from ..data import mythos_db

router = APIRouter(prefix="/api/mythos", tags=["mythos"])


@router.get("", response_model=List[MythosElement])
async def list_mythos():
    """Get all mythos elements"""
    return list(mythos_db.values())


@router.get("/{mythos_id}", response_model=MythosElement)
async def get_mythos(mythos_id: str):
    """Get a single mythos element by ID"""
    if mythos_id not in mythos_db:
        raise HTTPException(status_code=404, detail="Mythos element not found")
    return mythos_db[mythos_id]
