"use client";

import React, { ReactNode } from "react";

interface StudioLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export function StudioLayout({ leftPanel, centerPanel, rightPanel }: StudioLayoutProps) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full min-h-0">
      {/* Left Panel - Parameters */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
        {leftPanel}
      </div>

      {/* Center Panel - Preview */}
      <div className="lg:col-span-6 flex flex-col gap-4 min-h-0">
        {centerPanel}
      </div>

      {/* Right Panel - History */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
        {rightPanel}
      </div>
    </div>
  );
}
