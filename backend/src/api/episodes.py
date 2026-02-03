from fastapi import APIRouter, HTTPException
from typing import List
from ..models import Episode, Scene
from ..data import episodes_db, scenes_db

router = APIRouter(prefix="/api/episodes", tags=["episodes"])


@router.get("", response_model=List[Episode])
async def list_episodes():
    """Get all episodes"""
    return list(episodes_db.values())


@router.get("/{episode_id}", response_model=Episode)
async def get_episode(episode_id: str):
    """Get a single episode by ID"""
    if episode_id not in episodes_db:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episodes_db[episode_id]


@router.get("/{episode_id}/scenes", response_model=List[Scene])
async def get_episode_scenes(episode_id: str):
    """Get all scenes for a specific episode"""
    if episode_id not in episodes_db:
        raise HTTPException(status_code=404, detail="Episode not found")

    episode_scenes = [scene for scene in scenes_db.values() if scene.episode_id == episode_id]
    return episode_scenes
