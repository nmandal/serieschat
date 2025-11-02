"use client";

import {
  Calendar,
  ChevronDown,
  Film,
  TrendingDown,
  TrendingUp,
  Tv,
} from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, getRatingColor } from "./imdb-design-tokens";

type DecadeAnalysis = {
  title_type: string;
  min_votes: number;
  decades: Array<{
    decade: string;
    decade_start: number;
    title_count: number;
    avg_rating: number | null;
    max_rating: number | null;
    total_votes: number;
  }>;
};

export function ImdbDecadeAnalysis({
  data,
}: {
  data: DecadeAnalysis;
}): ReactElement {
  const { title_type, min_votes, decades } = data;
  const [expandedDecade, setExpandedDecade] = useState<string | null>(null);

  const { bestDecade, mostProductive, trend, maxRating, avgRatingOverall } =
    useMemo(() => {
      if (decades.length === 0) {
        return {
          bestDecade: null,
          mostProductive: null,
          trend: "stable" as const,
          maxRating: 10,
          avgRatingOverall: 0,
        };
      }

      const best = [...decades].sort(
        (a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
      )[0];

      const productive = [...decades].sort(
        (a, b) => b.title_count - a.title_count
      )[0];

      const maxRatingValue = Math.max(...decades.map((d) => d.avg_rating ?? 0));
      const avgOverall =
        decades.reduce((sum, d) => sum + (d.avg_rating ?? 0), 0) /
        decades.length;

      const recentDecades = decades
        .slice(0, 3)
        .filter((d) => d.avg_rating)
        .reverse();
      let trendValue: "rising" | "declining" | "stable" = "stable";
      if (recentDecades.length >= 2) {
        const first = recentDecades[0].avg_rating ?? 0;
        const last = recentDecades.at(-1)?.avg_rating ?? 0;
        const diff = last - first;
        trendValue =
          diff > 0.1 ? "rising" : diff < -0.1 ? "declining" : "stable";
      }

      return {
        bestDecade: best,
        mostProductive: productive,
        trend: trendValue,
        maxRating: maxRatingValue,
        avgRatingOverall: avgOverall,
      };
    }, [decades]);

  const Icon = title_type === "movie" ? Film : Tv;
  const colors = CATEGORY_COLORS.analytics;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Calendar className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Decade Analysis</h3>
            <p className="text-muted-foreground text-sm">
              {decades.length} decades
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Icon className="mr-1 size-3" />
              {title_type === "movie" ? "Movies" : "TV Series"}
            </Badge>
            <Badge variant="outline">{min_votes.toLocaleString()}+ votes</Badge>
          </div>
        </div>

        {bestDecade && (
          <div className="grid gap-3 border-b p-4 sm:grid-cols-3">
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Best Decade</div>
              <div className="font-bold text-xl">{bestDecade.decade}</div>
              <div className="text-muted-foreground text-xs">
                {bestDecade.avg_rating?.toFixed(2)} avg rating
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Most Prolific</div>
              <div className="font-bold text-xl">{mostProductive?.decade}</div>
              <div className="text-muted-foreground text-xs">
                {mostProductive?.title_count.toLocaleString()} titles
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Trend</div>
              <div className="flex items-center gap-2">
                {trend === "rising" ? (
                  <TrendingUp className="size-5 text-green-600" />
                ) : trend === "declining" ? (
                  <TrendingDown className="size-5 text-red-600" />
                ) : (
                  <div className="size-5" />
                )}
                <div className="font-bold text-xl capitalize">{trend}</div>
              </div>
              <div className="text-muted-foreground text-xs">Last 30 years</div>
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-2">
        {decades.map((decade) => {
          const isExpanded = expandedDecade === decade.decade;
          const isBest = bestDecade && decade.decade === bestDecade.decade;
          const widthPercent = decade.avg_rating
            ? (decade.avg_rating / maxRating) * 100
            : 0;

          return (
            <div key={decade.decade}>
              <button
                className="w-full text-left"
                onClick={() =>
                  setExpandedDecade(isExpanded ? null : decade.decade)
                }
                type="button"
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-14 shrink-0 items-center justify-center rounded-lg font-bold text-xl ${
                          isBest
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : colors.badge
                        }`}
                      >
                        {decade.decade.replace("s", "")}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xl">{decade.decade}</h4>
                          {isBest && (
                            <Badge
                              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              variant="secondary"
                            >
                              Best
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
                          <span>
                            {decade.title_count.toLocaleString()} titles
                          </span>
                          <span>•</span>
                          <span>
                            {decade.total_votes.toLocaleString()} votes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {decade.avg_rating && (
                        <div className="text-right">
                          <div className="font-bold text-2xl">
                            {decade.avg_rating.toFixed(2)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            average
                          </div>
                        </div>
                      )}
                      <ChevronDown
                        className={`size-5 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {decade.avg_rating && (
                    <div className="mt-3 space-y-2">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${getRatingColor(
                            decade.avg_rating
                          )}`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Rating Progress</span>
                        <span>Peak: {decade.max_rating?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-3">
                      <div className="rounded-lg border p-3">
                        <div className="mb-1 text-muted-foreground text-xs">
                          Average Rating
                        </div>
                        <div className="font-bold text-xl">
                          {decade.avg_rating?.toFixed(2)}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="mb-1 text-muted-foreground text-xs">
                          Peak Rating
                        </div>
                        <div className="font-bold text-xl">
                          {decade.max_rating?.toFixed(2)}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="mb-1 text-muted-foreground text-xs">
                          Total Titles
                        </div>
                        <div className="font-bold text-xl">
                          {decade.title_count.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
