"use client";

import React from "react";

interface ParticleTrailProps {
  path: string;
  color: string;
  particleCount?: number;
  speed?: number;
}

export function ParticleTrail({
  path,
  color,
  particleCount = 5,
  speed = 1,
}: ParticleTrailProps) {
  return (
    <g>
      {Array.from({ length: particleCount }).map((_, i) => (
        <circle
          key={i}
          r={2}
          fill={color}
          opacity={0.6}
        >
          <animateMotion
            dur={`${3 / speed}s`}
            repeatCount="indefinite"
            begin={`${(i * 0.6) / speed}s`}
            path={path}
          />
        </circle>
      ))}
    </g>
  );
}

export function ConnectorHoverEffects() {
  return null;
}
