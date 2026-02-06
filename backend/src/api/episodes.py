
from fastapi import APIRouter, HTTPException

from ..data import character_presence_db, characters_db, episodes_db, scenes_db, video_analysis_db
from ..models import (
    CharacterHeatmapData,
    Episode,
    EpisodeCharacterPresenceResponse,
    EpisodeHeatmapResponse,
    EpisodePresenceEntry,
    Scene,
    VideoAnalysis,
    VideoMoment,
    VideoScene,
)

router = APIRouter(prefix="/api/episodes", tags=["episodes"])


@router.get("", response_model=list[Episode])
async def list_episodes():
    return list(episodes_db.values())


@router.get("/{episode_id}", response_model=Episode)
async def get_episode(episode_id: str):
    if episode_id not in episodes_db:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episodes_db[episode_id]


@router.get("/{episode_id}/scenes", response_model=list[Scene])
async def get_episode_scenes(episode_id: str):
    if episode_id not in episodes_db:
        raise HTTPException(status_code=404, detail="Episode not found")

    episode_scenes = [scene for scene in scenes_db.values() if scene.episode_id == episode_id]
    return episode_scenes


@router.get("/{episode_id}/video-analysis", response_model=VideoAnalysis)
async def get_video_analysis(episode_id: str):
    if episode_id not in video_analysis_db:
        raise HTTPException(status_code=404, detail="Video analysis not found for this episode")
    return video_analysis_db[episode_id]


@router.get("/{episode_id}/video-analysis/moments", response_model=list[VideoMoment])
async def get_video_analysis_moments(episode_id: str):
    if episode_id not in video_analysis_db:
        raise HTTPException(status_code=404, detail="Video analysis not found for this episode")
    return video_analysis_db[episode_id].key_moments


@router.get("/{episode_id}/video-analysis/scenes", response_model=list[VideoScene])
async def get_video_analysis_scenes(episode_id: str):
    if episode_id not in video_analysis_db:
        raise HTTPException(status_code=404, detail="Video analysis not found for this episode")
    return video_analysis_db[episode_id].scenes


@router.get("/{episode_id}/character-presence", response_model=EpisodeCharacterPresenceResponse)
async def get_episode_character_presence(episode_id: str):
    if episode_id not in episodes_db:
        raise HTTPException(status_code=404, detail="Episode not found")

    presences = [p for p in character_presence_db.values() if p.episode_id == episode_id]
    presences_sorted = sorted(presences, key=lambda x: (-x.importance_rating, -x.moment_count))

    episode = episodes_db[episode_id]
    return EpisodeCharacterPresenceResponse(
        episode_id=episode_id,
        episode_title=episode.title,
        total_characters=len(presences_sorted),
        presences=presences_sorted,
    )


@router.get("/{episode_id}/character-presence/heatmap", response_model=EpisodeHeatmapResponse)
async def get_episode_character_presence_heatmap(episode_id: str):
    if episode_id not in episodes_db:
        raise HTTPException(status_code=404, detail="Episode not found")

    episode = episodes_db[episode_id]
    presences = [p for p in character_presence_db.values() if p.episode_id == episode_id]
    presences_sorted = sorted(presences, key=lambda x: (-x.importance_rating, -x.moment_count))

    characters_data = []
    for presence in presences_sorted:
        char = characters_db.get(presence.character_id)
        char_name = char.name if char else presence.character_id

        characters_data.append(
            CharacterHeatmapData(
                character_id=presence.character_id,
                character_name=char_name,
                episodes=[
                    EpisodePresenceEntry(
                        episode_id=episode_id,
                        intensity=presence.importance_rating,
                        screen_time=presence.total_screen_time_seconds,
                        moment_count=presence.moment_count,
                    )
                ],
                total_screen_time=presence.total_screen_time_seconds,
                total_appearances=presence.moment_count,
            )
        )

    return EpisodeHeatmapResponse(
        episode_id=episode_id,
        episode_title=episode.title,
        characters=characters_data,
    )
