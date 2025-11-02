/**
 * Design tokens for IMDb components
 * Provides consistent styling across all IMDb data visualizations
 */

export const CATEGORY_COLORS = {
  movies: {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  series: {
    icon: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  analytics: {
    icon: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
} as const;

export const SEMANTIC_COLORS = {
  success: {
    icon: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  warning: {
    icon: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  error: {
    icon: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
} as const;

export const RATING_COLORS = {
  excellent: "bg-green-500",
  good: "bg-blue-500",
  average: "bg-amber-500",
  poor: "bg-red-500",
} as const;

export function getRatingColor(rating: number): string {
  if (rating >= 8) return RATING_COLORS.excellent;
  if (rating >= 7) return RATING_COLORS.good;
  if (rating >= 6) return RATING_COLORS.average;
  return RATING_COLORS.poor;
}

export const SPACING = {
  cardPadding: "p-4",
  sectionPadding: "p-3",
  mainGap: "space-y-3",
  compactGap: "space-y-2",
  itemGap: "gap-3",
} as const;

export const TYPOGRAPHY = {
  mainTitle: "text-lg font-semibold",
  sectionTitle: "text-sm font-medium",
  subtitle: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground",
} as const;

export const RANK_COLORS = {
  top3: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  top10: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
} as const;

export const SEASON_COLORS = [
  "rgba(99, 102, 241, 0.1)", // indigo
  "rgba(139, 92, 246, 0.1)", // violet
  "rgba(236, 72, 153, 0.1)", // pink
  "rgba(251, 146, 60, 0.1)", // orange
  "rgba(34, 197, 94, 0.1)", // green
  "rgba(14, 165, 233, 0.1)", // sky
  "rgba(168, 85, 247, 0.1)", // purple
  "rgba(244, 63, 94, 0.1)", // rose
  "rgba(234, 179, 8, 0.1)", // yellow
  "rgba(20, 184, 166, 0.1)", // teal
] as const;

export function getRankColor(rank: number): string {
  if (rank <= 3) return RANK_COLORS.top3;
  if (rank <= 10) return RANK_COLORS.top10;
  return RANK_COLORS.default;
}

export function getSeasonColor(seasonIndex: number): string {
  return SEASON_COLORS[seasonIndex % SEASON_COLORS.length];
}

