"use client";

import { BarChart3, Star, Target, TrendingUp } from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, getRatingColor } from "./imdb-design-tokens";

type AnalyticsData = {
  series: string;
  tconst: string;
  overall_statistics: {
    total_episodes: number;
    average_rating: number | null;
    rating_consistency: number | null;
    max_rating: number | null;
    min_rating: number | null;
    rating_range: number | null;
    average_votes: number | null;
    total_seasons: number;
  };
  season_trends: Array<{
    season: number;
    episode_count: number;
    avg_rating: number | null;
    best_rating: number | null;
    worst_rating: number | null;
  }>;
  rating_distribution: Array<{
    rating_bracket: string;
    episode_count: number;
  }>;
  season_finales: Array<{
    season: number;
    episode: number;
    title: string;
    rating: number;
    votes: number;
  }>;
};

export function ImdbAnalytics({ data }: { data: AnalyticsData }) {
  const stats = data.overall_statistics;
  const maxSeasonRating = Math.max(
    ...data.season_trends.map((s) => s.avg_rating ?? 0)
  );
  const minSeasonRating = Math.min(
    ...data.season_trends
      .filter((s) => s.avg_rating !== null)
      .map((s) => s.avg_rating!)
  );

  const maxDistribution = Math.max(
    ...data.rating_distribution.map((d) => d.episode_count)
  );

  const colors = CATEGORY_COLORS.analytics;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <BarChart3 className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Series Analytics</h3>
            <p className="text-muted-foreground text-sm">{data.series}</p>
          </div>
        </div>

        <div className="grid gap-4 border-b p-4 md:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Star className="size-3 text-amber-500" fill="currentColor" />
              <span>Average</span>
            </div>
            <div className="font-bold text-2xl">
              {stats.average_rating?.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Target className="size-3" />
              <span>Consistency</span>
            </div>
            <div className="font-bold text-2xl">
              {stats.rating_consistency?.toFixed(2)}
            </div>
            <div className="text-muted-foreground text-xs">
              {(stats.rating_consistency ?? 0) < 0.5 ? "Very consistent" : ""}
              {(stats.rating_consistency ?? 0) >= 0.5 &&
              (stats.rating_consistency ?? 0) < 1
                ? "Consistent"
                : ""}
              {(stats.rating_consistency ?? 0) >= 1 ? "Variable" : ""}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Range</div>
            <div className="font-bold text-2xl">
              {stats.rating_range?.toFixed(1)}
            </div>
            <div className="text-muted-foreground text-xs">
              {stats.min_rating?.toFixed(1)} - {stats.max_rating?.toFixed(1)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Total Episodes</div>
            <div className="font-bold text-2xl">{stats.total_episodes}</div>
            <div className="text-muted-foreground text-xs">
              {stats.total_seasons} seasons
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <TrendingUp className={`size-4 ${colors.icon}`} />
          <h4 className="font-semibold text-sm">Season Trends</h4>
        </div>

        <div className="space-y-2 p-4">
          {data.season_trends.map((season) => {
            const widthPercent =
              maxSeasonRating > 0
                ? ((season.avg_rating ?? 0) / maxSeasonRating) * 100
                : 0;
            const isHighest = season.avg_rating === maxSeasonRating;
            const isLowest = season.avg_rating === minSeasonRating;

            return (
              <div className="space-y-1" key={season.season}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Season {season.season}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {season.avg_rating?.toFixed(2)}
                    </span>
                    {isHighest && (
                      <Badge
                        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        variant="secondary"
                      >
                        Best
                      </Badge>
                    )}
                    {isLowest && (
                      <Badge
                        className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        variant="secondary"
                      >
                        Worst
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${getRatingColor(
                      season.avg_rating ?? 0
                    )}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>{season.episode_count} episodes</span>
                  <span>
                    {season.worst_rating?.toFixed(1)} -{" "}
                    {season.best_rating?.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3 border-b p-4">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Rating Distribution</h4>
          </div>

          <div className="space-y-2 p-4">
            {data.rating_distribution.map((bracket) => {
              const widthPercent =
                (bracket.episode_count / maxDistribution) * 100;

              return (
                <div
                  className="flex items-center gap-3"
                  key={bracket.rating_bracket}
                >
                  <span className="w-10 shrink-0 text-muted-foreground text-xs">
                    {bracket.rating_bracket}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full rounded bg-indigo-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs">
                    {bracket.episode_count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 border-b p-4">
            <Star className="size-4 text-amber-500" fill="currentColor" />
            <h4 className="font-semibold text-sm">Season Finales</h4>
          </div>

          <div className="space-y-2 p-4">
            {data.season_finales.map((finale) => (
              <div
                className="flex items-center justify-between rounded-lg border p-2"
                key={`${finale.season}-${finale.episode}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm">
                    S{String(finale.season).padStart(2, "0")} Finale
                  </div>
                  <div className="truncate text-muted-foreground text-xs">
                    {finale.title}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Star className="size-3 text-amber-500" fill="currentColor" />
                  <span className="font-medium text-sm">
                    {finale.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
