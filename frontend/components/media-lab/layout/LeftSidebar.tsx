"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight, Layers, Image as ImageIcon, Wand2, History, FolderOpen } from "lucide-react";

interface LeftSidebarProps {
  className?: string;
}

export function LeftSidebar({ className = "" }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative z-40 hidden md:flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]
        transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${collapsed ? "w-[64px]" : "w-[320px]"}
        ${className}
      `}
      style={{
        // @ts-ignore
        "--bg-secondary": "#12121a",
        "--border-subtle": "rgba(255, 255, 255, 0.08)",
      } as React.CSSProperties}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shadow-md hover:bg-[var(--bg-primary)] hover:text-white transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Content Container */}
      <div className="flex h-full flex-col overflow-hidden">
        {/* Tools Navigation */}
        <div className="flex flex-col gap-2 p-2">
          <SidebarItem icon={<Wand2 size={20} />} label="Generator" active collapsed={collapsed} />
          <SidebarItem icon={<Layers size={20} />} label="Layers" collapsed={collapsed} />
          <SidebarItem icon={<ImageIcon size={20} />} label="Assets" collapsed={collapsed} />
          <SidebarItem icon={<History size={20} />} label="History" collapsed={collapsed} />
          <SidebarItem icon={<FolderOpen size={20} />} label="Projects" collapsed={collapsed} />
        </div>

        {/* Parameters Area (Placeholder) */}
        <div className={`flex-1 overflow-y-auto p-4 ${collapsed ? "hidden" : "block"}`}>
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Parameters
            </h3>
            <div className="h-32 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 p-4 text-center text-sm text-[var(--text-secondary)]">
              Parameter controls will go here
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ icon, label, active, collapsed }: SidebarItemProps) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`
        justify-start gap-3 font-medium
        ${collapsed ? "min-w-0 px-0 justify-center" : "px-3"}
        ${active ? "bg-[var(--bg-tertiary)] text-white" : "text-[var(--text-secondary)] hover:text-white"}
      `}
      isIconOnly={collapsed}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Button>
  );
}