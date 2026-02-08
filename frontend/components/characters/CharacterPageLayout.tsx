import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterPageLayoutProps {
  children: [React.ReactNode, React.ReactNode, React.ReactNode];
  catalogId?: string;
  isPremium?: boolean;
}

export function CharacterPageLayout({
  children,
  catalogId,
  isPremium
}: CharacterPageLayoutProps) {
  const [leftSidebar, mainContent, rightSidebar] = children;

  return (
    <div 
      className={cn(
        "w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-6",
        "bg-[var(--color-bg-primary)] min-h-screen",
        isPremium && "border-t-2 border-[var(--color-accent-primary)]"
      )}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-60 shrink-0">
          {leftSidebar}
        </aside>

        <main className="flex-1 min-w-0">
          {mainContent}
        </main>

        <aside className="hidden xl:block w-80 shrink-0">
          {rightSidebar}
        </aside>
      </div>
    </div>
  );
}
