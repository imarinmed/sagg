import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-[var(--color-surface-hover)] rounded";
  
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const computedStyle = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={computedStyle}
      {...props}
    />
  );
}
