"use client";

import { useEffect, useState } from "react";
import { Card, Spinner } from "@heroui/react";
import Link from "next/link";
import { api, Episode } from "@/lib/api";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEpisodes() {
      try {
        const data = await api.episodes.list();
        setEpisodes(data);
      } catch (err) {
        setError("Failed to load episodes");
      } finally {
        setLoading(false);
      }
    }
    loadEpisodes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Episodes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map((episode) => (
          <Link key={episode.id} href={`/episodes/${episode.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Header>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Episode {episode.episode_number}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {episode.id}
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {episode.title}
                </h3>
                {episode.synopsis && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {episode.synopsis}
                  </p>
                )}
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
