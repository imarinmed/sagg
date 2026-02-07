"use client";

import React from "react";
import { MediaLabHeader } from "./MediaLabHeader";
import { LeftSidebar } from "./LeftSidebar";
import { RightPanel } from "./RightPanel";
import { PreviewPanel } from "./PreviewPanel";

interface MediaLabLayoutProps {
  children?: React.ReactNode;
}

export function MediaLabLayout({ children }: MediaLabLayoutProps) {
  return (
    <div 
      className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"
      style={{
        // @ts-ignore
        "--bg-primary": "#0a0a0f",
        "--bg-secondary": "#12121a",
        "--bg-tertiary": "#1a1a25",
        "--text-primary": "#ffffff",
        "--text-secondary": "rgba(255, 255, 255, 0.7)",
        "--text-muted": "rgba(255, 255, 255, 0.5)",
        "--border-subtle": "rgba(255, 255, 255, 0.08)",
      } as React.CSSProperties}
    >
      <MediaLabHeader />
      
      <div className="flex flex-1 pt-[56px] overflow-hidden">
        <LeftSidebar />
        <PreviewPanel>
          {children}
        </PreviewPanel>
        <RightPanel />
      </div>
    </div>
  );
}