"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Menu, Bell, Settings, User } from "lucide-react";
import Link from "next/link";

export function MediaLabHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[56px] px-4 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]"
      style={{
        // @ts-ignore - CSS variables from globals.css
        "--glass-border": "rgba(255, 255, 255, 0.08)",
        "--glass-bg": "rgba(18, 18, 26, 0.85)",
        "--glass-blur": "12px",
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-4">
        <Link href="/media-lab" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="font-bold text-white">M</span>
          </div>
          <span className="font-heading text-xl font-semibold text-[var(--color-text-primary)]">
            Media Lab
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1 ml-8">
          <Button variant="ghost" size="sm" className="text-[var(--color-text-secondary)]">
            Generate
          </Button>
          <Button variant="ghost" size="sm" className="text-[var(--color-text-secondary)]">
            Assets
          </Button>
          <Button variant="ghost" size="sm" className="text-[var(--color-text-secondary)]">
            Workflows
          </Button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Button isIconOnly variant="ghost" size="sm" aria-label="Notifications">
          <Bell size={20} className="text-[var(--color-text-secondary)]" />
        </Button>
        <Button isIconOnly variant="ghost" size="sm" aria-label="Settings">
          <Settings size={20} className="text-[var(--color-text-secondary)]" />
        </Button>
        <div className="w-px h-6 bg-[var(--color-border-subtle)] mx-2" />
        <Button isIconOnly variant="ghost" size="sm" aria-label="User profile">
          <User size={20} className="text-[var(--color-text-secondary)]" />
        </Button>
      </div>
    </header>
  );
}