"use client";

import { Star, ThumbsUp, TrendingUp } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  CATEGORY_COLORS,
  getRatingColor,
  SEMANTIC_COLORS,
} from "./imdb-design-tokens";

type TopMovies = {
  filters: {
    genre?: string;
    start_year?: number;
    end_year?: number;
    min_votes: number;
  };
  result_count: number;
  movies: Array<{
    rank: number;
    tconst: string;
    title: string;
    year: number;
    genres: string;
    rating: number;
    votes: number;
  }>;
};

export function ImdbTopMovies({ data }: { data: TopMovies }): ReactElement {
  const { filters, result_count, movies } = data;

  const getYearRangeDisplay = () => {
    if (filters.start_year && filters.end_year) {
      return `${filters.start_year}-${filters.end_year}`;
    }
    if (filters.start_year) {
      return `${filters.start_year}+`;
    }
    if (filters.end_year) {
      return `up to ${filters.end_year}`;
    }
    return "All Time";
  };

  const maxVotes = Math.max(...movies.map((m) => m.votes));
  const colors = CATEGORY_COLORS.movies;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <TrendingUp className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Top Rated Movies</h3>
            <p className="text-muted-foreground text-sm">
              {result_count} movies
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b p-4">
          {filters.genre && (
            <Badge variant="secondary">Genre: {filters.genre}</Badge>
          )}
          <Badge variant="secondary">Years: {getYearRangeDisplay()}</Badge>
          <Badge variant="secondary">
            Min votes: {filters.min_votes.toLocaleString()}
          </Badge>
        </div>
      </Card>

      <div className="space-y-2">
        {movies.map((movie) => (
          <Card className="p-4" key={movie.tconst}>
            <div className="flex items-center gap-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                  movie.rank <= 3 ? SEMANTIC_COLORS.success.badge : colors.badge
                }`}
              >
                {movie.rank}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-1 font-bold text-lg leading-tight">
                      {movie.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{movie.year}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {movie.genres
                          .split(",")
                          .slice(0, 2)
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
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Star
                      className="size-5 text-amber-500"
                      fill="currentColor"
                    />
                    <div className="text-right">
                      <div className="font-bold text-xl">
                        {movie.rating.toFixed(2)}
                      </div>
                      <div className="text-muted-foreground text-xs">/10</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ThumbsUp className="size-3" />
                      <span className="font-medium">
                        {movie.votes.toLocaleString()} votes
                      </span>
                    </div>
                    {movie.rank <= 5 && (
                      <Badge
                        className={SEMANTIC_COLORS.success.badge}
                        variant="secondary"
                      >
                        Top {movie.rank}
                      </Badge>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${getRatingColor(
                        movie.rating
                      )}`}
                      style={{ width: `${(movie.votes / maxVotes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
