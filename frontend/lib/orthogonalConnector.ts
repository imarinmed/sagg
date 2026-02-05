import { RelationshipType } from "./temporalModels";

interface GridPoint {
  x: number;
  y: number;
}

export function generateOrthogonalRoundedPath(
  source: GridPoint,
  target: GridPoint,
  cornerRadius: number = 10
): string {
  const midX = source.x + (target.x - source.x) / 2;

  return `
    M ${source.x} ${source.y}
    L ${midX - cornerRadius} ${source.y}
    Q ${midX} ${source.y} ${midX} ${
      source.y + (target.y > source.y ? cornerRadius : -cornerRadius)
    }
    L ${midX} ${target.y - (target.y > source.y ? cornerRadius : -cornerRadius)}
    Q ${midX} ${target.y} ${
      midX + (target.x > midX ? cornerRadius : -cornerRadius)
    } ${target.y}
    L ${target.x} ${target.y}
  `;
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function getConnectorColor(type: RelationshipType): string {
  const colors: Record<RelationshipType, string> = {
    romantic: "#be185d",
    familial: "#c9a227",
    antagonistic: "#dc2626",
    friendship: "#059669",
    professional: "#8B5CF6",
    mentor: "#6366f1",
    sire: "#7f1d1d",
    blood_bond: "#991b1b",
    rival: "#ea580c",
  };
  return colors[type] || "#6b7280";
}

export function getConnectorWidth(intensity: number): number {
  return 2 + intensity * 0.5;
}

export function getConnectorDashArray(type: RelationshipType): string {
  if (type === "familial") return "5,5";
  if (type === "antagonistic") return "3,3";
  return "none";
}
