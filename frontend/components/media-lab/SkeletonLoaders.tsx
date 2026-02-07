'use client';

/**
 * Skeleton loaders for graceful loading states
 * Provides visual feedback during async operations
 */

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg animate-pulse" />
      <div className="h-10 bg-gradient-to-r from-slate-800 to-slate-700 rounded animate-pulse" />
    </div>
  );
}

export function TaggingPanelSkeleton() {
  return (
    <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-slate-800">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-8 bg-slate-700 rounded"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-700 rounded flex-1"></div>
          ))}
        </div>
        <div className="h-20 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 bg-content1 rounded-lg border border-divider animate-pulse space-y-3">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 bg-slate-700 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
}

export function ArtifactGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700"
        />
      ))}
    </div>
  );
}
