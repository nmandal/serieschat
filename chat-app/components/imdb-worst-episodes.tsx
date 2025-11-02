"use client";

import { AlertTriangle, Star, TrendingDown, Users } from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, SEMANTIC_COLORS } from "./imdb-design-tokens";

type Episode = {
  rank: number;
  season: number;
  episode: number;
  title: string;
  rating: number;
  votes: number;
  tconst: string;
};

type WorstEpisodesData = {
  series: string;
  tconst: string;
  min_votes: number;
  episodes: Episode[];
};

export function ImdbWorstEpisodes({ data }: { data: WorstEpisodesData }) {
  const minRating = Math.min(...data.episodes.map((ep) => ep.rating));
  const colors = CATEGORY_COLORS.series;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <TrendingDown className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Lowest Rated Episodes</h3>
            <p className="text-muted-foreground text-sm">{data.series}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`size-4 ${SEMANTIC_COLORS.warning.icon}`}
            />
            <span className="text-muted-foreground text-sm">Lowest:</span>
            <span className="font-semibold text-sm">
              {minRating.toFixed(1)}/10
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Min votes:</span>
            <span className="font-semibold text-sm">
              {data.min_votes.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {data.episodes.map((episode) => {
          const isLowest = episode.rating === minRating;

          return (
            <Card className="p-4" key={episode.tconst}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${colors.badge}`}
                  >
                    {episode.rank}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{episode.title}</h4>
                      <span className="text-muted-foreground text-xs">
                        S{String(episode.season).padStart(2, "0")}E
                        {String(episode.episode).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star
                          className="size-3 text-amber-500"
                          fill="currentColor"
                        />
                        <span className="font-semibold text-sm">
                          {episode.rating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          /10
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">
                          {episode.votes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isLowest && (
                  <Badge
                    className={SEMANTIC_COLORS.warning.badge}
                    variant="secondary"
                  >
                    Lowest
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
