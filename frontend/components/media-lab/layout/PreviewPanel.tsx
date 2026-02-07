"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ZoomIn, ZoomOut, Maximize, Download, Share2 } from "lucide-react";

interface PreviewPanelProps {
  children?: React.ReactNode;
  className?: string;
}

export function PreviewPanel({ children, className = "" }: PreviewPanelProps) {
  return (
    <main
      className={`
        flex flex-1 flex-col overflow-hidden bg-[var(--bg-primary)] relative
        ${className}
      `}
      style={{
        // @ts-ignore
        "--bg-primary": "#0a0a0f",
      } as React.CSSProperties}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--glass-bg)] p-1 backdrop-blur-md shadow-lg">
        <Button isIconOnly variant="ghost" size="sm" className="rounded-full" aria-label="Zoom out">
          <ZoomOut size={18} className="text-[var(--text-secondary)]" />
        </Button>
        <span className="px-2 text-xs font-medium text-[var(--text-secondary)]">100%</span>
        <Button isIconOnly variant="ghost" size="sm" className="rounded-full" aria-label="Zoom in">
          <ZoomIn size={18} className="text-[var(--text-secondary)]" />
        </Button>
        <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
        <Button isIconOnly variant="ghost" size="sm" className="rounded-full" aria-label="Fit to screen">
          <Maximize size={18} className="text-[var(--text-secondary)]" />
        </Button>
      </div>

      {/* Action Bar (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center gap-2"
        >
          <Share2 size={16} />
          Share
        </Button>
        <Button 
          size="sm" 
          variant="primary"
          className="shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8">
        {children || (
          <div className="flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
            <div className="w-64 h-64 border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex items-center justify-center mb-4">
              <span className="text-sm">No image generated</span>
            </div>
            <p className="text-sm">Configure parameters and click Generate</p>
          </div>
        )}
      </div>
    </main>
  );
}