'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock,
  Calendar,
  Heart,
  Dumbbell,
  Sparkles,
  Zap
} from 'lucide-react';

export type TrackType = 'episode' | 'presence' | 'intimacy' | 'fitness' | 'training' | 'moments';

export interface TimelineEvent {
  id: string;
  episode: string;
  timestamp: string;
  type: TrackType;
  title: string;
  description?: string;
  intensity?: number;
  characters: string[];
}

export interface TimelineTrack {
  id: TrackType;
  label: string;
  icon: React.ReactNode;
  color: string;
  events: TimelineEvent[];
}

export interface MultiTrackTimelineProps {
  tracks: TimelineTrack[];
  episodes: { id: string; title: string; number: number }[];
  currentEpisode: string;
  onEpisodeChange: (episodeId: string) => void;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

const trackLabels: Record<TrackType, string> = {
  episode: 'Avsnitt',
  presence: 'Närvaro',
  intimacy: 'Intimitet',
  fitness: 'Kondition',
  training: 'Träning',
  moments: 'Nyckelögonblick'
};

export function MultiTrackTimeline({
  tracks,
  episodes,
  currentEpisode,
  onEpisodeChange,
  onEventClick,
  className = ''
}: MultiTrackTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentEpisodeIndex = episodes.findIndex(ep => ep.id === currentEpisode);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const nextIndex = currentEpisodeIndex + 1;
        if (nextIndex < episodes.length) {
          onEpisodeChange(episodes[nextIndex].id);
        } else {
          setIsPlaying(false);
        }
      }, 2000 / playbackSpeed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentEpisodeIndex, episodes, onEpisodeChange, playbackSpeed]);

  const handlePrevious = () => {
    if (currentEpisodeIndex > 0) {
      onEpisodeChange(episodes[currentEpisodeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      onEpisodeChange(episodes[currentEpisodeIndex + 1].id);
    }
  };

  const getTrackIcon = (trackId: TrackType) => {
    switch (trackId) {
      case 'episode': return <Calendar className="w-4 h-4" />;
      case 'presence': return <Clock className="w-4 h-4" />;
      case 'intimacy': return <Heart className="w-4 h-4" />;
      case 'fitness': return <Dumbbell className="w-4 h-4" />;
      case 'training': return <Zap className="w-4 h-4" />;
      case 'moments': return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className={`glass rounded-2xl overflow-hidden ${className}`}>
      
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                disabled={currentEpisodeIndex === 0}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-[var(--color-text-inverse)]" />
                ) : (
                  <Play className="w-5 h-5 text-[var(--color-text-inverse)]" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                disabled={currentEpisodeIndex === episodes.length - 1}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-muted)]">Hastighet:</span>
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 text-xs rounded ${
                    playbackSpeed === speed
                      ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-heading text-[var(--color-text-primary)]">
              {currentEpisode}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {episodes[currentEpisodeIndex]?.title}
            </p>
          </div>

          <div className="text-sm text-[var(--color-text-muted)]">
            {currentEpisodeIndex + 1} / {episodes.length}
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-accent-primary)]"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentEpisodeIndex + 1) / episodes.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => onEpisodeChange(ep.id)}
                className={`text-xs transition-colors ${
                  idx === currentEpisodeIndex
                    ? 'text-[var(--color-accent-primary)] font-medium'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {ep.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      
      <div ref={timelineRef} className="p-4 space-y-3">
        {tracks.map((track) => (
          <div 
            key={track.id}
            className={`relative rounded-lg border transition-all ${
              selectedTrack === track.id
                ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-accent)]'
            }`}
            onClick={() => setSelectedTrack(selectedTrack === track.id ? null : track.id)}
          >
            <div className="flex items-center gap-3 p-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${track.color}20`, color: track.color }}
              >
                {track.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {trackLabels[track.id]}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {track.events.length} händelser
                  </span>
                </div>

                <div className="mt-2 relative h-8 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  {track.events.map((event) => {
                    const episodeIdx = episodes.findIndex(ep => ep.id === event.episode);
                    const position = (episodeIdx / (episodes.length - 1)) * 100;
                    const isCurrent = event.episode === currentEpisode;
                    const isHovered = hoveredEvent === event.id;

                    return (
                      <motion.button
                        key={event.id}
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[var(--color-bg-primary)] transition-all"
                        style={{
                          left: `${position}%`,
                          backgroundColor: isCurrent ? track.color : `${track.color}80`,
                          transform: `translateY(-50%) scale(${isHovered || isCurrent ? 1.5 : 1})`,
                          zIndex: isHovered || isCurrent ? 10 : 1
                        }}
                        onMouseEnter={() => setHoveredEvent(event.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        whileHover={{ scale: 1.5 }}
                      />
                    );
                  })}

                  <div
                    className="absolute top-0 bottom-0 w-px bg-[var(--color-accent-primary)]"
                    style={{
                      left: `${(currentEpisodeIndex / (episodes.length - 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedTrack === track.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2">
                    {track.events
                      .filter(e => e.episode === currentEpisode)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="p-3 bg-[var(--color-bg-secondary)] rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {event.title}
                            </span>
                            {event.intensity && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" style={{ color: track.color }} />
                                <span className="text-xs text-[var(--color-text-muted)]">
                                  {event.intensity}/10
                                </span>
                              </div>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.characters.map((char) => (
                              <span
                                key={char}
                                className="px-2 py-0.5 text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full"
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                    {track.events.filter(e => e.episode === currentEpisode).length === 0 && (
                      <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                        Inga händelser i detta avsnitt
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MultiTrackTimeline;
