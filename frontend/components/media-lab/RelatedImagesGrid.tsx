'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArtifactData } from '@/lib/api';

interface RelatedImagesGridProps {
  entityType: 'character' | 'episode' | 'mythos';
  entityId: string;
  entityName: string;
  onArtifactSelect?: (artifact: ArtifactData) => void;
}

export function RelatedImagesGrid({
  entityType,
  entityId,
  entityName,
  onArtifactSelect,
}: RelatedImagesGridProps) {
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { api } = await import('@/lib/api');
        let response;
        
        switch (entityType) {
          case 'character':
            response = await api.mediaLab.getCharacterRelatedImages(entityId);
            break;
          case 'episode':
            response = await api.mediaLab.getEpisodeRelatedImages(entityId);
            break;
          case 'mythos':
            response = await api.mediaLab.getMythosRelatedImages(entityId);
            break;
        }
        
        setArtifacts(response.artifacts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load related images');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedImages();
  }, [entityType, entityId]);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Related Artifacts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square bg-slate-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Related Artifacts</h3>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  if (artifacts.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Related Artifacts</h3>
        <p className="text-xs text-slate-500">
          No artifacts tagged with this {entityType} yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-slate-800">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Related Artifacts ({artifacts.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-700 hover:border-slate-500 cursor-pointer transition-all duration-200"
            onClick={() => onArtifactSelect?.(artifact)}
          >
            {/* Try to display image if available */}
            {artifact.file_path && (
              <div className="relative w-full h-full">
                <Image
                  src={artifact.file_path}
                  alt={`${entityName} artifact`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              </div>
            )}
            
            {/* Fallback artifact info */}
            {!artifact.file_path && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-xs text-slate-400 font-medium">
                    {artifact.artifact_type}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay with artifact info */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-end justify-end p-3">
              <p className="text-xs text-slate-300 text-right font-mono">
                {artifact.artifact_type}
              </p>
              {artifact.file_size_bytes && (
                <p className="text-xs text-slate-400 text-right">
                  {(artifact.file_size_bytes / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
