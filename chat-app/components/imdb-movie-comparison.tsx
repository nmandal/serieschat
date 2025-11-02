"use client";

import { AlertCircle, BarChart2, Star, ThumbsUp } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  CATEGORY_COLORS,
  getRatingColor,
  SEMANTIC_COLORS,
} from "./imdb-design-tokens";

type MovieComparison = {
  comparison_count: number;
  movies: Array<{
    title: string;
    found: boolean;
    error?: string;
    tconst?: string;
    year?: number;
    genres?: string;
    rating?: number | null;
    votes?: number;
  }>;
};

export function ImdbMovieComparison({
  data,
}: {
  data: MovieComparison;
}): ReactElement {
  const { movies } = data;

  const rankings = movies
    .filter((m) => m.found && m.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const winner = rankings.length > 0 ? rankings[0] : null;

  const foundCount = movies.filter((m) => m.found).length;
  const notFoundCount = movies.length - foundCount;
  const colors = CATEGORY_COLORS.movies;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <BarChart2 className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Movie Comparison</h3>
            <p className="text-muted-foreground text-sm">
              {data.comparison_count} movies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              variant="secondary"
            >
              {foundCount} found
            </Badge>
            {notFoundCount > 0 && (
              <Badge
                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                variant="secondary"
              >
                {notFoundCount} missing
              </Badge>
            )}
          </div>
        </div>

        {winner && (
          <div className="flex items-center gap-2 border-b p-4">
            <Badge
              className={SEMANTIC_COLORS.success.badge}
              variant="secondary"
            >
              Highest rated
            </Badge>
            <span className="font-medium text-sm">
              {winner.title} ({winner.rating?.toFixed(2)}/10)
            </span>
          </div>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie, idx) => {
          const rank = rankings.findIndex((m) => m.title === movie.title) + 1;
          const isWinner = winner && movie.title === winner.title;

          return (
            <Card
              className={`p-4 ${isWinner ? `ring-2 ${colors.border}` : ""}`}
              key={movie.title}
            >
              {movie.found ? (
                <div className="space-y-3">
                  {rank > 0 && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                          rank <= 3
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : colors.badge
                        }`}
                      >
                        {rank}
                      </div>
                      {isWinner && (
                        <Badge
                          className={SEMANTIC_COLORS.success.badge}
                          variant="secondary"
                        >
                          Top
                        </Badge>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-xl leading-tight">
                      {movie.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      {movie.year && (
                        <Badge variant="outline">{movie.year}</Badge>
                      )}
                    </div>
                  </div>

                  {movie.genres && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres
                        .split(",")
                        .slice(0, 3)
                        .map((genre) => (
                          <Badge
                            className={colors.badge}
                            key={genre}
                            variant="secondary"
                          >
                            {genre.trim()}
                          </Badge>
                        ))}
                    </div>
                  )}

                  {movie.rating ? (
                    <div className="space-y-2 border-t pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star
                            className="size-5 text-amber-500"
                            fill="currentColor"
                          />
                          <span className="font-bold text-2xl">
                            {movie.rating.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            /10
                          </span>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${getRatingColor(
                            movie.rating
                          )}`}
                          style={{ width: `${(movie.rating / 10) * 100}%` }}
                        />
                      </div>

                      {movie.votes && (
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="size-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">
                            {movie.votes.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            votes
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      No rating available
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 py-2">
                  <AlertCircle
                    className={`mt-1 size-6 shrink-0 ${SEMANTIC_COLORS.error.icon}`}
                  />
                  <div>
                    <h4
                      className={`mb-1 font-bold text-lg ${SEMANTIC_COLORS.error.icon}`}
                    >
                      {movie.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {movie.error || "Movie not found in database"}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {rankings.length > 1 && (
        <Card>
          <div className="flex items-center gap-3 border-b p-4">
            <Star className="size-5 text-amber-500" fill="currentColor" />
            <h4 className="font-semibold text-sm">Rankings</h4>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {rankings.map((movie, idx) => (
              <div
                className="flex items-center gap-3 rounded-lg border p-2"
                key={movie.title}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    idx === 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : colors.badge
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">
                    {movie.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {movie.rating?.toFixed(2)}/10
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
