"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  Accordion,
  AccordionItem,
  Chip,
  Spinner,
  Button,
  ScrollShadow,
} from "@heroui/react";
import Link from "next/link";
import { ChevronLeft, Clock, Users, MessageCircle } from "lucide-react";
import { api, Episode } from "@/lib/api";

interface DialogueLine {
  index: number;
  start_time: string;
  end_time: string;
  text: string;
  speaker: string | null;
}

interface Scene {
  id: string;
  episode_id: string;
  scene_number: number;
  title: string;
  description?: string;
  characters: string[];
  start_time?: string;
  end_time?: string;
  location?: string;
  dialogue?: DialogueLine[];
}

export default function EpisodeDetailPage() {
  const params = useParams();
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEpisodeData() {
      try {
        setLoading(true);
        const [episodeData, scenesData] = await Promise.all([
          api.episodes.get(episodeId),
          api.episodes.getScenes(episodeId),
        ]);
        setEpisode(episodeData);
        setScenes(scenesData.sort((a: Scene, b: Scene) => a.scene_number - b.scene_number));
      } catch (err) {
        setError("Failed to load episode data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (episodeId) {
      loadEpisodeData();
    }
  }, [episodeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-500">{error || "Episode not found"}</p>
        <Link href="/episodes">
          <Button className="mt-4" variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Episodes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/episodes">
          <Button isIconOnly variant="ghost">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{episode.title}</h1>
          <p className="text-default-500">
            Episode {episode.episode_number} • Season {episode.season}
          </p>
        </div>
      </div>

      {/* Episode Info */}
      <Card>
        <Card.Content className="p-6">
          {episode.synopsis && (
            <p className="text-default-600 mb-4">{episode.synopsis}</p>
          )}
          <div className="flex gap-2">
            <Chip variant="soft" size="sm">
              {scenes.length} scenes
            </Chip>
            <Chip variant="soft" size="sm" color="accent">
              {episode.id.toUpperCase()}
            </Chip>
          </div>
        </Card.Content>
      </Card>

      {/* Scenes */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Scenes</h2>
        </Card.Header>
        <Card.Content>
          <Accordion>
            {scenes.map((scene) => (
              <Accordion.Item key={scene.id}>
                <Accordion.Trigger>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-default-500">
                        Scene {scene.scene_number}
                      </span>
                      <span className="font-medium">
                        {scene.location || scene.title || `Scene ${scene.scene_number}`}
                      </span>
                    </div>
                    {scene.start_time && (
                      <div className="flex items-center gap-1 text-xs text-default-400">
                        <Clock className="w-3 h-3" />
                        {scene.start_time.split(",")[0]}
                      </div>
                    )}
                  </div>
                </Accordion.Trigger>
                <Accordion.Panel>
                  <div className="space-y-4 py-2">
                    {/* Characters */}
                    {scene.characters && scene.characters.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-default-400" />
                          <span className="text-sm font-medium text-default-600">
                            Characters
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {scene.characters.map((char, idx) => (
                            <Chip key={idx} size="sm" variant="soft">
                              {char}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dialogue */}
                    {scene.dialogue && scene.dialogue.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-default-400" />
                          <span className="text-sm font-medium text-default-600">
                            Dialogue
                          </span>
                        </div>
                        <ScrollShadow className="max-h-64 bg-default-50 rounded-lg p-4">
                          <div className="space-y-2">
                            {scene.dialogue.map((line, idx) => (
                              <div key={idx} className="text-sm">
                                {line.speaker ? (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-primary-600 min-w-[100px]">
                                      {line.speaker}:
                                    </span>
                                    <span className="text-default-700">{line.text}</span>
                                  </div>
                                ) : (
                                  <span className="text-default-500 italic">
                                    {line.text}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollShadow>
                      </div>
                    )}

                    {/* Time Range */}
                    {(scene.start_time || scene.end_time) && (
                      <div className="text-xs text-default-400">
                        {scene.start_time} - {scene.end_time}
                      </div>
                    )}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card.Content>
      </Card>
    </div>
  );
}
