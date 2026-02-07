"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StudioLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

export function StudioLayout({ 
  leftPanel, 
  centerPanel, 
  rightPanel,
  className 
}: StudioLayoutProps) {
  return (
    <div className={cn("flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full min-h-0 transition-all duration-300 ease-in-out", className)}>
      {/* Left Panel - Parameters */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto min-h-[300px] lg:min-h-0 transition-all duration-300 ease-in-out">
        {leftPanel}
      </div>

      {/* Center Panel - Preview */}
      <div className={cn(
        "flex flex-col gap-4 min-h-[400px] lg:min-h-0 transition-all duration-300 ease-in-out",
        rightPanel ? "lg:col-span-6" : "lg:col-span-9"
      )}>
        {centerPanel}
      </div>

      {/* Right Panel - History (Optional) */}
      {rightPanel && (
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto min-h-[300px] lg:min-h-0 transition-all duration-300 ease-in-out">
          {rightPanel}
        </div>
      )}
    </div>
  );
}
