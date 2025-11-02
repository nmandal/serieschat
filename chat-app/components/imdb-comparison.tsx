"use client";

import {
  BarChart2,
  Star,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, SEMANTIC_COLORS } from "./imdb-design-tokens";

type ComparisonSeries = {
  name: string;
  found: boolean;
  tconst?: string;
  years?: string;
  genres?: string;
  statistics?: {
    total_episodes: number;
    avg_rating: number | null;
    max_rating: number | null;
    min_rating: number | null;
    total_seasons: number;
    total_votes: number;
    rating_range: number | null;
  };
  best_episode?: {
    title: string;
    season: number;
    episode: number;
    rating: number;
    votes: number;
  };
  worst_episode?: {
    title: string;
    season: number;
    episode: number;
    rating: number;
    votes: number;
  };
  error?: string;
};

type ComparisonData = {
  comparison_count: number;
  series: ComparisonSeries[];
};

export function ImdbComparison({ data }: { data: ComparisonData }) {
  const validSeries = data.series.filter((s) => s.found);
  const bestOverall =
    validSeries.length > 0
      ? validSeries.reduce((best, current) =>
          (current.statistics?.avg_rating ?? 0) >
          (best.statistics?.avg_rating ?? 0)
            ? current
            : best
        )
      : null;

  const colors = CATEGORY_COLORS.series;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <BarChart2 className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Series Comparison</h3>
            <p className="text-muted-foreground text-sm">
              {data.comparison_count} series
            </p>
          </div>
        </div>

        {bestOverall && (
          <div className="flex items-center gap-2 border-b p-4">
            <Badge
              className={SEMANTIC_COLORS.success.badge}
              variant="secondary"
            >
              Top rated
            </Badge>
            <span className="font-medium text-sm">
              {bestOverall.name} (
              {bestOverall.statistics?.avg_rating?.toFixed(2)}/10)
            </span>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        {data.series.map((series) => {
          if (!series.found) {
            return (
              <Card
                className={`border p-4 ${SEMANTIC_COLORS.error.border} ${SEMANTIC_COLORS.error.bg}`}
                key={series.name}
              >
                <div className="flex items-center gap-2">
                  <XCircle className={`size-5 ${SEMANTIC_COLORS.error.icon}`} />
                  <span className={`font-medium ${SEMANTIC_COLORS.error.icon}`}>
                    {series.name}
                  </span>
                  <span className={`text-sm ${SEMANTIC_COLORS.error.icon}`}>
                    - {series.error}
                  </span>
                </div>
              </Card>
            );
          }

          const stats = series.statistics!;
          const isBest = series === bestOverall;
          const genres = series.genres?.split(",") || [];

          return (
            <Card
              className={`p-4 ${isBest ? `ring-2 ${colors.border}` : ""}`}
              key={series.tconst}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">{series.name}</h4>
                      {isBest && (
                        <Badge
                          className={SEMANTIC_COLORS.success.badge}
                          variant="secondary"
                        >
                          Top
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {series.years} • {stats.total_seasons} seasons •{" "}
                      {stats.total_episodes} episodes
                    </p>
                  </div>

                  {stats.avg_rating && (
                    <div className="flex shrink-0 flex-col items-end">
                      <div className="flex items-center gap-1">
                        <Star
                          className="size-4 text-amber-500"
                          fill="currentColor"
                        />
                        <span className="font-bold text-2xl">
                          {stats.avg_rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        average
                      </span>
                    </div>
                  )}
                </div>

                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {genres.map((genre) => (
                      <Badge
                        className={colors.badge}
                        key={genre.trim()}
                        variant="secondary"
                      >
                        {genre.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <TrendingUp className="size-3" />
                      <span>Best</span>
                    </div>
                    <div className="font-medium">
                      {stats.max_rating?.toFixed(1)}/10
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <TrendingDown className="size-3" />
                      <span>Worst</span>
                    </div>
                    <div className="font-medium">
                      {stats.min_rating?.toFixed(1)}/10
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-xs">Range</div>
                    <div className="font-medium">
                      {stats.rating_range?.toFixed(1)} pts
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-xs">Votes</div>
                    <div className="font-medium">
                      {(stats.total_votes / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                {(series.best_episode || series.worst_episode) && (
                  <div className="grid gap-2 border-t pt-3 md:grid-cols-2">
                    {series.best_episode && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <TrendingUp className="size-3" />
                          <span>Best Episode</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">
                            {series.best_episode.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              S
                              {String(series.best_episode.season).padStart(
                                2,
                                "0"
                              )}
                              E
                              {String(series.best_episode.episode).padStart(
                                2,
                                "0"
                              )}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Star
                                className="size-2 text-amber-500"
                                fill="currentColor"
                              />
                              {series.best_episode.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {series.worst_episode && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <TrendingDown className="size-3" />
                          <span>Worst Episode</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">
                            {series.worst_episode.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              S
                              {String(series.worst_episode.season).padStart(
                                2,
                                "0"
                              )}
                              E
                              {String(series.worst_episode.episode).padStart(
                                2,
                                "0"
                              )}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Star
                                className="size-2 text-amber-500"
                                fill="currentColor"
                              />
                              {series.worst_episode.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
