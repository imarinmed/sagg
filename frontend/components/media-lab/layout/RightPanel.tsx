"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight, GitBranch, List, Play } from "lucide-react";

interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className = "" }: RightPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative z-40 hidden md:flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)]
        transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${collapsed ? "w-[0px]" : "w-[300px]"}
        ${className}
      `}
      style={{
        // @ts-ignore
        "--bg-secondary": "#12121a",
        "--border-subtle": "rgba(255, 255, 255, 0.08)",
      } as React.CSSProperties}
    >
      {/* Toggle Button (Outside when collapsed) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shadow-md hover:bg-[var(--bg-primary)] hover:text-white transition-colors
          ${collapsed ? "-left-8" : "-left-3"}
        `}
        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Content Container */}
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">DAGGR Graph</span>
          </div>
          <div className="flex gap-1">
            <Button isIconOnly size="sm" variant="ghost" className="rounded-full">
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* DAGGR Visualizer Placeholder */}
        <div className="flex-1 overflow-hidden bg-[var(--bg-primary)] relative">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)]">
            <div className="text-center p-4">
              <GitBranch size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Workflow Graph</p>
              <p className="text-xs opacity-50">Visualizer coming soon</p>
            </div>
          </div>
        </div>

        {/* Queue / Status Section */}
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Queue
            </span>
            <span className="text-xs text-[var(--text-muted)]">0 items</span>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 font-medium text-white flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Process Queue
          </Button>
        </div>
      </div>
    </aside>
  );
}
