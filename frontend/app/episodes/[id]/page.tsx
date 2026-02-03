"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  Chip,
  Spinner,
  Button,
  ScrollShadow,
} from "@heroui/react";
import Link from "next/link";
import { ChevronLeft, Clock, Users, MessageCircle } from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
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
        <p className="text-[var(--color-accent-secondary)]">{error || "Episode not found"}</p>
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/episodes">
          <Button isIconOnly variant="ghost" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-[var(--color-text-primary)]">{episode.title}</h1>
          <p className="text-[var(--color-text-muted)]">
            Episode {episode.episode_number} • Season {episode.season}
          </p>
        </div>
      </div>

      {/* Episode Info */}
      <GlassCard>
        <CardContent>
          {episode.synopsis && (
            <p className="text-[var(--color-text-secondary)] mb-4">{episode.synopsis}</p>
          )}
          <div className="flex gap-2">
            <Chip 
              variant="soft" 
              size="sm"
              className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
            >
              {scenes.length} scenes
            </Chip>
            <Chip 
              variant="soft" 
              size="sm"
              className="bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
            >
              {episode.id.toUpperCase()}
            </Chip>
          </div>
        </CardContent>
      </GlassCard>

      {/* Scenes */}
      <GlassCard>
        <CardHeader>
          <h2 className="font-heading text-xl text-[var(--color-text-primary)]">Scenes</h2>
        </CardHeader>
        <CardContent>
          <Accordion>
            {scenes.map((scene) => (
              <AccordionItem key={scene.id}>
                <Accordion.Trigger>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-muted)]">
                        Scene {scene.scene_number}
                      </span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {scene.location || scene.title || `Scene ${scene.scene_number}`}
                      </span>
                    </div>
                    {scene.start_time && (
                      <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
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
                          <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            Characters
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {scene.characters.map((char, idx) => (
                            <Chip 
                              key={idx} 
                              size="sm" 
                              variant="soft"
                              className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                            >
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
                          <MessageCircle className="w-4 h-4 text-[var(--color-text-muted)]" />
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            Dialogue
                          </span>
                        </div>
                        <ScrollShadow className="max-h-64 bg-[var(--color-bg-secondary)] rounded-lg p-4">
                          <div className="space-y-2">
                            {scene.dialogue.map((line, idx) => (
                              <div key={idx} className="text-sm">
                                {line.speaker ? (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-[var(--color-accent-primary)] min-w-[100px]">
                                      {line.speaker}:
                                    </span>
                                    <span className="text-[var(--color-text-secondary)]">{line.text}</span>
                                  </div>
                                ) : (
                                  <span className="text-[var(--color-text-muted)] italic">
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
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {scene.start_time} - {scene.end_time}
                      </div>
                    )}
                  </div>
                </Accordion.Panel>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </GlassCard>
    </div>
  );
}
