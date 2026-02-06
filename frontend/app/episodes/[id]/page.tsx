"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  Chip,
  Spinner,
  Button,
  ScrollShadow,
  Tabs,
  Avatar,
} from "@heroui/react";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Users,
  MessageCircle,
  Camera,
  Film,
  BarChart2,
  Play,
  User,
} from "lucide-react";
import { GlassCard, CardHeader, CardContent } from "@/components/GlassCard";
import { TimelineVisualization } from "@/components/TimelineVisualization";
import { NarrativeArcVisualization } from "@/components/NarrativeArcVisualization";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { ScreenshotModal } from "@/components/ScreenshotModal";
import { CinematicHero } from "@/components/CinematicHero";
import { CharacterPresenceTimeline } from "@/components/CharacterPresenceTimeline";
import { ContentIntensityIndicator } from "@/components/ContentIntensityIndicator";
import { SceneBreakdownCards } from "@/components/SceneBreakdownCards";
import { ForgeButton } from "@/components/ForgeButton";
import { CreativeCompanionPanel } from "@/components/CreativeCompanionPanel";
import { api, Episode, VideoMoment, VideoAnalysisData } from "@/lib/api";

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

interface CharacterPresence {
  character_id: string;
  character_name: string;
  first_appearance_timestamp: string;
  last_appearance_timestamp: string;
  total_screen_time_seconds: number;
  importance_rating: number;
  moment_count: number;
}

interface VideoScene {
  scene_id: string;
  start_timestamp: string;
  end_timestamp: string;
  start_seconds: number;
  end_seconds: number;
  location?: string;
  characters: string[];
  content_summary: string;
  moments_count: number;
}

export default function EpisodeDetailPage() {
  const params = useParams();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisData | null>(null);
  const [characterPresence, setCharacterPresence] = useState<CharacterPresence[]>([]);
  const [videoScenes, setVideoScenes] = useState<VideoScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMoment, setSelectedMoment] = useState<VideoMoment | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("creative-panel-open");
    if (savedState === "true") {
      setIsPanelOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("creative-panel-open", String(isPanelOpen));
  }, [isPanelOpen]);

  const episodeAnalysis = useMemo(() => {
    if (!videoAnalysis) return null;
    return videoAnalysis.episodes.find((e) => e.episode_id === episodeId);
  }, [videoAnalysis, episodeId]);

  const screenshotMoments = useMemo(() => {
    if (!episodeAnalysis) return [];
    return episodeAnalysis.key_moments.filter((m) => m.screenshot_path);
  }, [episodeAnalysis]);

  const heroImage = useMemo(() => {
    if (screenshotMoments.length > 0) {
      return `/screenshots/${episodeId}/${screenshotMoments[0].screenshot_path}`;
    }
    return undefined;
  }, [screenshotMoments, episodeId]);

  const selectedMomentIndex = useMemo(() => {
    if (!selectedMoment || !screenshotMoments.length) return -1;
    return screenshotMoments.findIndex(
      (m) => m.timestamp_seconds === selectedMoment.timestamp_seconds
    );
  }, [selectedMoment, screenshotMoments]);

  const avgIntensity = useMemo(() => {
    if (!episodeAnalysis) return 3;
    const avg =
      episodeAnalysis.key_moments.reduce((sum, m) => sum + m.intensity, 0) /
      episodeAnalysis.key_moments.length;
    return Math.round(avg);
  }, [episodeAnalysis]);

  const handlePreviousMoment = useCallback(() => {
    if (selectedMomentIndex > 0) {
      setSelectedMoment(screenshotMoments[selectedMomentIndex - 1]);
    }
  }, [selectedMomentIndex, screenshotMoments]);

  const handleNextMoment = useCallback(() => {
    if (selectedMomentIndex < screenshotMoments.length - 1) {
      setSelectedMoment(screenshotMoments[selectedMomentIndex + 1]);
    }
  }, [selectedMomentIndex, screenshotMoments]);

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

        // Load video analysis
        try {
          const analysisResponse = await fetch("/api/video-analysis");
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            setVideoAnalysis(analysisData);

            // Extract scenes from analysis
            const epAnalysis = analysisData.episodes.find(
              (e: { episode_id: string }) => e.episode_id === episodeId
            );
            if (epAnalysis?.scenes) {
              setVideoScenes(epAnalysis.scenes);
            }
          }
        } catch (analysisError) {
          // Video analysis data is optional
        }

        // Load character presence
        try {
          const presenceResponse = await fetch(`/api/episodes/${episodeId}/character-presence`);
          if (presenceResponse.ok) {
            const presenceData = await presenceResponse.json();
            setCharacterPresence(presenceData.presences || []);
          }
        } catch (presenceError) {
          // Character presence is optional
        }
      } catch (err) {
        setError("Failed to load episode data");
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
        <p className="text-[var(--color-accent-secondary)]">
          {error || "Episode not found"}
        </p>
        <Link href="/episodes">
          <Button className="mt-4" variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Episodes
          </Button>
        </Link>
      </div>
    );
  }

  const stats = episodeAnalysis
    ? {
        totalMoments: episodeAnalysis.key_moments.length,
        screenshots: screenshotMoments.length,
        avgIntensity: avgIntensity,
        duration: episodeAnalysis.duration,
        durationSeconds: episodeAnalysis.duration_seconds,
      }
    : null;

  return (
    <div className="space-y-0 animate-fade-in-up">
      <div className="absolute top-4 right-4 z-50">
        <ForgeButton onClick={() => setIsPanelOpen(true)} />
      </div>

      {/* Cinematic Hero */}
      <CinematicHero
        episode={episode}
        heroImage={heroImage}
        intensity={avgIntensity}
        duration={stats?.duration}
        onPlay={() => {
          // TODO: Implement video playback
          console.log("Play episode", episodeId);
        }}
      />

      {/* Content Intensity Indicator */}
      {stats && (
        <div className="px-4 md:px-8 lg:px-16 py-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <ContentIntensityIndicator intensity={avgIntensity} size="md" />
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                {stats.screenshots} screenshots
              </span>
              <span className="flex items-center gap-1">
                <BarChart2 className="w-4 h-4" />
                {stats.totalMoments} moments
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Narrative Arc Visualization */}
          {episodeAnalysis && episodeAnalysis.narrative_beats && (
            <GlassCard>
              <CardHeader>
                <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                  Narrative Structure
                </h2>
              </CardHeader>
              <CardContent>
                <NarrativeArcVisualization
                  narrativeBeats={episodeAnalysis.narrative_beats}
                  durationSeconds={episodeAnalysis.duration_seconds}
                />
              </CardContent>
            </GlassCard>
          )}

          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tabs.List className="glass rounded-lg p-1 mb-4">
              <Tabs.Tab key="overview">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Overview
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="scenes">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Scenes
                  <span className="text-xs bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] px-1.5 rounded">
                    {scenes.length}
                  </span>
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="characters">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Characters
                  {characterPresence.length > 0 && (
                    <span className="text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] px-1.5 rounded">
                      {characterPresence.length}
                    </span>
                  )}
                </div>
              </Tabs.Tab>
              <Tabs.Tab key="gallery">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Gallery
                  {screenshotMoments.length > 0 && (
                    <span className="text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] px-1.5 rounded">
                      {screenshotMoments.length}
                    </span>
                  )}
                </div>
              </Tabs.Tab>
            </Tabs.List>

            {/* Overview Tab */}
            <Tabs.Panel key="overview">
              <div className="space-y-6">
                {/* Episode Timeline */}
                {episodeAnalysis && episodeAnalysis.key_moments.length > 0 && (
                  <GlassCard>
                    <CardHeader>
                      <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                        Episode Timeline
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <TimelineVisualization
                        moments={episodeAnalysis.key_moments}
                        durationSeconds={episodeAnalysis.duration_seconds}
                        narrativeBeats={episodeAnalysis.narrative_beats}
                        onMomentClick={(moment) => {
                          if (moment.screenshot_path) {
                            setSelectedMoment(moment);
                          }
                        }}
                        selectedTimestamp={selectedMoment?.timestamp_seconds}
                      />
                    </CardContent>
                  </GlassCard>
                )}

                {/* Synopsis */}
                {episode.synopsis && (
                  <GlassCard>
                    <CardHeader>
                      <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                        Synopsis
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {episode.synopsis}
                      </p>
                    </CardContent>
                  </GlassCard>
                )}
              </div>
            </Tabs.Panel>

            {/* Scenes Tab */}
            <Tabs.Panel key="scenes">
              <div className="space-y-6">
                {/* Scene Breakdown Cards */}
                {videoScenes.length > 0 && (
                  <GlassCard>
                    <CardHeader>
                      <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                        Scene Breakdown
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <SceneBreakdownCards
                        scenes={videoScenes}
                        activeSceneId={activeSceneId}
                        onSceneClick={(scene) => setActiveSceneId(scene.scene_id)}
                      />
                    </CardContent>
                  </GlassCard>
                )}

                {/* Detailed Scene List */}
                <GlassCard>
                  <CardContent>
                    {scenes.length > 0 ? (
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
                                                <span className="text-[var(--color-text-secondary)]">
                                                  {line.text}
                                                </span>
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
                    ) : (
                      <div className="text-center py-8">
                        <Film className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
                        <p className="text-[var(--color-text-muted)]">
                          No scene data available for this episode.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>
              </div>
            </Tabs.Panel>

            {/* Characters Tab */}
            <Tabs.Panel key="characters">
              {characterPresence.length > 0 && stats ? (
                <GlassCard>
                  <CardHeader>
                    <h2 className="font-heading text-xl text-[var(--color-text-primary)]">
                      Character Presence
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <CharacterPresenceTimeline
                      presences={characterPresence}
                      episodeDuration={stats.durationSeconds}
                    />
                  </CardContent>
                </GlassCard>
              ) : (
                <GlassCard>
                  <CardContent className="text-center py-8">
                    <User className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
                    <p className="text-[var(--color-text-muted)]">
                      No character presence data available.
                    </p>
                  </CardContent>
                </GlassCard>
              )}
            </Tabs.Panel>

            {/* Gallery Tab */}
            <Tabs.Panel key="gallery">
              {episodeAnalysis && screenshotMoments.length > 0 ? (
                <ScreenshotGallery
                  moments={episodeAnalysis.key_moments}
                  episodeId={episodeId}
                  onMomentSelect={setSelectedMoment}
                />
              ) : (
                <GlassCard>
                  <CardContent className="text-center py-8">
                    <Camera className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
                    <p className="text-[var(--color-text-muted)]">
                      No screenshots available for this episode.
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      Run the video analysis script to generate screenshots.
                    </p>
                  </CardContent>
                </GlassCard>
              )}
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>

      {/* Screenshot Modal */}
      <ScreenshotModal
        moment={selectedMoment}
        episodeId={episodeId}
        onClose={() => setSelectedMoment(null)}
        onPrevious={handlePreviousMoment}
        onNext={handleNextMoment}
        hasPrevious={selectedMomentIndex > 0}
        hasNext={selectedMomentIndex < screenshotMoments.length - 1}
      />

      <CreativeCompanionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        entityId={episodeId}
        entityType="episode"
      />
    </div>
  );
}
