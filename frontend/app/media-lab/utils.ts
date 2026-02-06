import { MediaJobStatusEnum } from "@/lib/api";

export function getStatusColor(status: string) {
  switch (status) {
    case MediaJobStatusEnum.SUCCEEDED:
      return "bg-green-500";
    case MediaJobStatusEnum.RUNNING:
      return "bg-blue-500 animate-pulse";
    case MediaJobStatusEnum.QUEUED:
      return "bg-yellow-500";
    case MediaJobStatusEnum.FAILED:
      return "bg-red-500";
    case MediaJobStatusEnum.CANCELLED:
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}

export function getStatusBadgeStyles(status: string) {
  switch (status) {
    case MediaJobStatusEnum.SUCCEEDED:
      return "border-green-500/30 text-green-400 bg-green-500/10";
    case MediaJobStatusEnum.RUNNING:
      return "border-blue-500/30 text-blue-400 bg-blue-500/10";
    case MediaJobStatusEnum.QUEUED:
      return "border-yellow-500/30 text-yellow-400 bg-yellow-500/10";
    case MediaJobStatusEnum.FAILED:
      return "border-red-500/30 text-red-400 bg-red-500/10";
    case MediaJobStatusEnum.CANCELLED:
      return "border-gray-500/30 text-gray-400 bg-gray-500/10";
    default:
      return "border-gray-500/30 text-gray-400 bg-gray-500/10";
  }
}

export function formatDate(dateString: string) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
