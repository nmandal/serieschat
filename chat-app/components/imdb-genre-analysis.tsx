"use client";

import { BarChart3, Film, Tv } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, getRatingColor } from "./imdb-design-tokens";

type GenreAnalysis = {
  title_type: string;
  min_votes: number;
  genre_count: number;
  genres: Array<{
    genres: string;
    title_count: number;
    avg_rating: number | null;
    max_rating: number | null;
    min_rating: number | null;
    total_votes: number;
  }>;
};

export function ImdbGenreAnalysis({
  data,
}: {
  data: GenreAnalysis;
}): ReactElement {
  const { title_type, min_votes, genre_count, genres } = data;

  const sortedGenres = [...genres].sort(
    (a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
  );

  const topRating = Math.max(...sortedGenres.map((g) => g.avg_rating ?? 0), 10);

  const Icon = title_type === "movie" ? Film : Tv;
  const colors = CATEGORY_COLORS.analytics;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <BarChart3 className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Genre Analysis</h3>
            <p className="text-muted-foreground text-sm">
              {genre_count} genres
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
      </Card>

      <div className="space-y-2">
        {sortedGenres.slice(0, 20).map((genre, idx) => (
          <Card className="p-4" key={genre.genres}>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground text-sm">
                    #{idx + 1}
                  </span>
                  <h4 className="font-semibold">{genre.genres}</h4>
                </div>
                {genre.avg_rating && (
                  <Badge
                    className={
                      idx < 3
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : ""
                    }
                    variant={idx < 3 ? "secondary" : "secondary"}
                  >
                    {genre.avg_rating.toFixed(2)}
                  </Badge>
                )}
              </div>

              {genre.avg_rating && (
                <div className="space-y-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${getRatingColor(
                        genre.avg_rating
                      )}`}
                      style={{
                        width: `${(genre.avg_rating / topRating) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>
                      Range: {genre.min_rating?.toFixed(1)} -{" "}
                      {genre.max_rating?.toFixed(1)}
                    </span>
                    <span>{genre.title_count.toLocaleString()} titles</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">Total Votes</span>
                <span className="font-medium">
                  {genre.total_votes.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {genre_count > 20 && (
        <p className="pt-2 text-center text-muted-foreground text-sm">
          Showing top 20 of {genre_count} genres
        </p>
      )}
    </div>
  );
}
