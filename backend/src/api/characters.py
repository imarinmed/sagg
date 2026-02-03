from fastapi import APIRouter, HTTPException
from typing import List
from ..models import Character, Relationship
from ..data import characters_db, relationships_db

router = APIRouter(prefix="/api/characters", tags=["characters"])


@router.get("", response_model=List[Character])
async def list_characters():
    """Get all characters"""
    return list(characters_db.values())


@router.get("/{character_id}", response_model=Character)
async def get_character(character_id: str):
    """Get a single character by ID"""
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")
    return characters_db[character_id]


@router.get("/{character_id}/relationships", response_model=List[Relationship])
async def get_character_relationships(character_id: str):
    """Get all relationships for a specific character"""
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    character_relationships = [
        rel
        for rel in relationships_db.values()
        if rel.from_character_id == character_id or rel.to_character_id == character_id
    ]
    return character_relationships
