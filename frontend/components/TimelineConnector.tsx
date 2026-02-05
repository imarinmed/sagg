"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  generateOrthogonalRoundedPath,
  getConnectorColor,
  getConnectorWidth,
  getConnectorDashArray,
} from "../lib/orthogonalConnector";
import { RelationshipType } from "../lib/temporalModels";

interface ConnectorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TimelineConnectorProps {
  source: ConnectorPosition;
  target: ConnectorPosition;
  relationshipType: RelationshipType;
  intensity: number;
  isActive?: boolean;
  onHover?: (isHovered: boolean) => void;
}

export function TimelineConnector({
  source,
  target,
  relationshipType,
  intensity,
  isActive = true,
  onHover,
}: TimelineConnectorProps) {
  const path = useMemo(() => {
    const sourceCenter = {
      x: source.x + source.width / 2,
      y: source.y + source.height / 2,
    };
    const targetCenter = {
      x: target.x + target.width / 2,
      y: target.y + target.height / 2,
    };
    return generateOrthogonalRoundedPath(sourceCenter, targetCenter, 12);
  }, [source, target]);

  const color = getConnectorColor(relationshipType);
  const width = getConnectorWidth(intensity);
  const dashArray = getConnectorDashArray(relationshipType);

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashArray}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: isActive ? 1 : 0,
        opacity: isActive ? 0.6 : 0.1,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        filter: isActive ? `drop-shadow(0 0 ${intensity}px ${color})` : "none",
        cursor: "pointer",
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="connector-hover-effect"
    />
  );
}

interface TimelineConnectorContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineConnectorContainer({
  children,
  className = "",
}: TimelineConnectorContainerProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
