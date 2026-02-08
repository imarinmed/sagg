"use client";

import { ReactNode } from "react";

interface CharacterPageLayoutProps {
  children: [ReactNode, ReactNode, ReactNode];
  catalogId?: string;
  isPremium?: boolean;
}

export default function CharacterPageLayout({
  children,
  catalogId,
  isPremium,
}: CharacterPageLayoutProps) {
  const [leftSidebar, mainContent, rightSidebar] = children;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {catalogId && (
        <div className="bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] py-2">
          <div className="max-w-[1800px] mx-auto px-6">
            <span className="font-mono text-sm tracking-[0.2em]">
              CATALOG ID: {catalogId}
            </span>
          </div>
        </div>
      )}

      <div
        className={`max-w-[1800px] mx-auto px-6 py-8 ${
          isPremium ? "border-t-2 border-[var(--color-accent-primary)]" : ""
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24">{leftSidebar}</div>
          </aside>

          <main className="flex-1 min-w-0">{mainContent}</main>

          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-24 space-y-6">{rightSidebar}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
