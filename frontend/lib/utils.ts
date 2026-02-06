/**
 * Utility for merging class names
 * Simplified version since clsx/tailwind-merge are not installed
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
