"use client";

import { ChevronDown, Star, TrendingDown, TrendingUp, Tv } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, getRatingColor } from "./imdb-design-tokens";

type Episode = {
  season: number;
  episode: number;
  title: string;
  rating: number;
  votes: number;
  tconst: string;
};

type EpisodesData = {
  series: string;
  tconst: string;
  episode_count: number;
  episodes: Episode[];
};

export function ImdbEpisodes({ data }: { data: EpisodesData }) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const seasonStats = useMemo(() => {
    const seasons = new Map<number, Episode[]>();

    for (const episode of data.episodes) {
      if (!seasons.has(episode.season)) {
        seasons.set(episode.season, []);
      }
      seasons.get(episode.season)?.push(episode);
    }

    return Array.from(seasons.entries())
      .map(([season, episodes]) => {
        const avgRating =
          episodes.reduce((sum, ep) => sum + ep.rating, 0) / episodes.length;
        const maxRating = Math.max(...episodes.map((ep) => ep.rating));
        const minRating = Math.min(...episodes.map((ep) => ep.rating));
        const totalVotes = episodes.reduce((sum, ep) => sum + ep.votes, 0);

        return {
          season,
          episodeCount: episodes.length,
          avgRating,
          maxRating,
          minRating,
          totalVotes,
          episodes,
        };
      })
      .sort((a, b) => a.season - b.season);
  }, [data.episodes]);

  const overallAvg = useMemo(() => {
    const sum = data.episodes.reduce((acc, ep) => acc + ep.rating, 0);
    return sum / data.episodes.length;
  }, [data.episodes]);

  const displayEpisodes = selectedSeason
    ? seasonStats.find((s) => s.season === selectedSeason)?.episodes || []
    : [];

  const colors = CATEGORY_COLORS.series;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Tv className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{data.series}</h3>
            <p className="text-muted-foreground text-sm">All Episodes</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{data.episode_count} episodes</Badge>
            <Badge variant="secondary">{seasonStats.length} seasons</Badge>
          </div>
        </div>

        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" fill="currentColor" />
            <span className="text-muted-foreground text-sm">
              Average rating:
            </span>
            <span className="font-semibold text-sm">
              {overallAvg.toFixed(2)}/10
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {seasonStats.map((season) => {
          const isSelected = selectedSeason === season.season;
          const trend =
            season.season > 1
              ? season.avgRating > seasonStats[season.season - 2].avgRating
              : null;

          return (
            <div key={season.season}>
              <button
                className="w-full text-left"
                onClick={() =>
                  setSelectedSeason(isSelected ? null : season.season)
                }
                type="button"
              >
                <Card className="p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${colors.badge}`}
                      >
                        {season.season}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Season {season.season}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {season.episodeCount} episodes
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star
                              className="size-3 text-amber-500"
                              fill="currentColor"
                            />
                            <span className="font-medium text-sm">
                              {season.avgRating.toFixed(2)}
                            </span>
                          </div>

                          <span className="text-muted-foreground text-xs">
                            {season.minRating.toFixed(1)} -{" "}
                            {season.maxRating.toFixed(1)}
                          </span>

                          {trend !== null && (
                            <div className="flex items-center gap-0.5">
                              {trend ? (
                                <>
                                  <TrendingUp className="size-3 text-green-600" />
                                  <span className="text-green-600 text-xs dark:text-green-400">
                                    Up
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="size-3 text-red-600" />
                                  <span className="text-red-600 text-xs dark:text-red-400">
                                    Down
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${getRatingColor(
                            season.avgRating
                          )}`}
                          style={{ width: `${(season.avgRating / 10) * 100}%` }}
                        />
                      </div>
                      <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform ${
                          isSelected ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </Card>
              </button>

              {isSelected && displayEpisodes.length > 0 && (
                <div
                  className="ml-12 mt-2 space-y-1 rounded-lg border-l-2 p-3"
                  style={{ borderColor: "var(--color-purple-200)" }}
                >
                  {displayEpisodes.map((episode) => (
                    <div
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                      key={episode.tconst}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-muted-foreground text-xs">
                          E{String(episode.episode).padStart(2, "0")}
                        </span>
                        <span className="truncate text-sm">
                          {episode.title}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Star
                          className="size-3 text-amber-500"
                          fill="currentColor"
                        />
                        <span className="font-medium text-sm">
                          {episode.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
