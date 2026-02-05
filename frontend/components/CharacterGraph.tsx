'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export type RelationshipType = 'romantic' | 'familial' | 'training' | 'blood-bond' | 'desires' | 'serves';

export interface CharacterNode {
  id: string;
  name: string;
  x: number;
  y: number;
  fitnessLevel: number;
  danceSkill: number;
  beautyRating: number;
  family: string;
  beautyType: string;
  color: string;
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
}

export interface CharacterGraphProps {
  nodes: CharacterNode[];
  edges: RelationshipEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  className?: string;
}

const relationshipColors: Record<RelationshipType, string> = {
  romantic: '#be185d',
  familial: '#c9a227',
  training: '#8B5CF6',
  'blood-bond': '#991b1b',
  desires: '#ff6b9d',
  serves: '#a0a0a0'
};

const relationshipLabels: Record<RelationshipType, string> = {
  romantic: 'Romantisk',
  familial: 'Familjär',
  training: 'Träning',
  'blood-bond': 'Blod-Bindning',
  desires: 'Begär',
  serves: 'Tjänar'
};

function getNodeRadius(node: CharacterNode): number {
  const score = node.fitnessLevel + node.danceSkill + node.beautyRating;
  if (score >= 28) return 60;
  if (score >= 24) return 50;
  if (score >= 20) return 40;
  return 30;
}

export function CharacterGraph({
  nodes,
  edges,
  width = 800,
  height = 600,
  onNodeClick,
  onNodeHover,
  className = ''
}: CharacterGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const pulsePhaseRef = useRef(0);

  const drawCurve = useCallback((ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, isHovered: boolean) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const controlX = midX + (y2 - y1) * 0.2;
    const controlY = midY - (x2 - x1) * 0.2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(controlX, controlY, x2, y2);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = isHovered ? 3 : 1.5;
    ctx.globalAlpha = isHovered ? 1 : 0.6;
    
    if (isHovered) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }, []);

  const drawNode = useCallback((ctx: CanvasRenderingContext2D, node: CharacterNode, isHovered: boolean, isConnected: boolean) => {
    const radius = getNodeRadius(node);
    const x = node.x * scale + offset.x;
    const y = node.y * scale + offset.y;

    const isDimmed = hoveredNode && !isHovered && !isConnected;
    const alpha = isDimmed ? 0.2 : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (isHovered) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, node.color + '40');
    gradient.addColorStop(0.7, node.color + '20');
    gradient.addColorStop(1, node.color + '10');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = node.color + '60';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(10, radius / 3)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, x, y);

    const badgeY = y + radius + 15;
    ctx.fillStyle = node.color + '30';
    ctx.fillRect(x - 20, badgeY - 8, 40, 16);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 20, badgeY - 8, 40, 16);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter';
    ctx.fillText(`${node.fitnessLevel}`, x, badgeY);

    ctx.restore();
  }, [scale, offset, hoveredNode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    pulsePhaseRef.current += 0.02;

    const connectedNodes = new Set<string>();
    if (hoveredNode) {
      edges.forEach(edge => {
        if (edge.source === hoveredNode) connectedNodes.add(edge.target);
        if (edge.target === hoveredNode) connectedNodes.add(edge.source);
      });
    }

    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const isConnectedToHover = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
      const isDimmed = hoveredNode && !isConnectedToHover;

      if (!isDimmed) {
        const sx = source.x * scale + offset.x;
        const sy = source.y * scale + offset.y;
        const tx = target.x * scale + offset.x;
        const ty = target.y * scale + offset.y;

        const pulseIntensity = Math.sin(pulsePhaseRef.current + edge.strength) * 0.3 + 0.7;
        const color = relationshipColors[edge.type];
        const finalColor = isConnectedToHover 
          ? color 
          : color + Math.floor(pulseIntensity * 255).toString(16).padStart(2, '0');

        drawCurve(ctx, sx, sy, tx, ty, color, !!isConnectedToHover);
      }
    });

    nodes.forEach(node => {
      const isHovered = node.id === hoveredNode;
      const isConnected = connectedNodes.has(node.id);
      drawNode(ctx, node, isHovered, isConnected);
    });

    animationRef.current = requestAnimationFrame(draw);
  }, [nodes, edges, scale, offset, hoveredNode, width, height, drawCurve, drawNode]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    const hovered = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const radius = getNodeRadius(node);
      return dx * dx + dy * dy < radius * radius;
    });

    if (hovered?.id !== hoveredNode) {
      setHoveredNode(hovered?.id || null);
      onNodeHover?.(hovered?.id || null);
    }
  }, [nodes, scale, offset, isDragging, dragStart, hoveredNode, onNodeHover]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  }, [offset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredNode && !isDragging) {
      setSelectedNode(hoveredNode);
      onNodeClick?.(hoveredNode);
    }
  }, [hoveredNode, isDragging, onNodeClick]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="cursor-move"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          imageRendering: 'crisp-edges'
        }}
      />
      
      <div className="absolute top-4 left-4 glass rounded-lg p-3 space-y-2">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          Relationstyper
        </p>
        {(Object.keys(relationshipColors) as RelationshipType[]).map(type => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: relationshipColors[type] }}
            />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {relationshipLabels[type]}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 glass rounded-lg p-3 space-y-2">
        <p className="text-xs text-[var(--color-text-muted)]">
          {nodes.length} karaktärer | {edges.length} relationer
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Zoom: {Math.round(scale * 100)}%
        </p>
      </div>

      {selectedNode && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 glass rounded-lg p-4 max-w-xs"
        >
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            return (
              <>
                <h4 className="font-heading text-[var(--color-text-primary)] mb-2">{node.name}</h4>
                <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <p>Familj: {node.family}</p>
                  <p>Kondition: {node.fitnessLevel}/10</p>
                  <p>Dans: {node.danceSkill}/10</p>
                  <p>Skönhet: {node.beautyRating}/10</p>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

export default CharacterGraph;
