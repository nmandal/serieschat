"use client";

import { Film, Search, Star, ThumbsUp } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, getRatingColor } from "./imdb-design-tokens";

type MovieSearchResults = {
  query?: string;
  filters: {
    genre?: string;
    start_year?: number;
    end_year?: number;
    min_rating?: number;
    min_votes?: number;
  };
  result_count: number;
  movies: Array<{
    tconst: string;
    title: string;
    year: number;
    genres: string;
    rating: number | null;
    votes: number;
  }>;
};

export function ImdbMovieSearch({
  data,
}: {
  data: MovieSearchResults;
}): ReactElement {
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
    return null;
  };

  const topRating = Math.max(...movies.map((m) => m.rating ?? 0));
  const colors = CATEGORY_COLORS.movies;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Search className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Movie Search</h3>
            <p className="text-muted-foreground text-sm">
              {result_count} result{result_count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {(filters.genre ||
          filters.start_year ||
          filters.end_year ||
          filters.min_rating ||
          filters.min_votes) && (
          <div className="flex flex-wrap gap-2 border-b p-4">
            {filters.genre && (
              <Badge variant="secondary">Genre: {filters.genre}</Badge>
            )}
            {getYearRangeDisplay() && (
              <Badge variant="secondary">Years: {getYearRangeDisplay()}</Badge>
            )}
            {filters.min_rating && (
              <Badge variant="secondary">
                Rating: {filters.min_rating.toFixed(1)}+
              </Badge>
            )}
            {filters.min_votes && (
              <Badge variant="secondary">
                Votes: {filters.min_votes.toLocaleString()}+
              </Badge>
            )}
          </div>
        )}
      </Card>

      {result_count === 0 ? (
        <Card className="p-8 text-center">
          <Film className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 font-medium text-muted-foreground">
            No movies found
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            Try adjusting your filters
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => {
            const isTop = movie.rating === topRating && topRating >= 8;

            return (
              <Card className="p-4" key={movie.tconst}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="line-clamp-2 flex-1 font-semibold text-lg leading-tight">
                      {movie.title}
                    </h4>
                    <Badge className="shrink-0" variant="outline">
                      {movie.year}
                    </Badge>
                  </div>

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

                  {movie.rating ? (
                    <div className="space-y-2 border-t pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star
                            className="size-4 text-amber-500"
                            fill="currentColor"
                          />
                          <span className="font-bold text-xl">
                            {movie.rating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            /10
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <ThumbsUp className="size-3" />
                          <span className="text-sm">
                            {movie.votes >= 1_000_000
                              ? `${(movie.votes / 1_000_000).toFixed(1)}M`
                              : movie.votes >= 1000
                              ? `${(movie.votes / 1000).toFixed(1)}K`
                              : movie.votes}
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

                      {isTop && (
                        <Badge
                          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          variant="secondary"
                        >
                          Top rated
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-muted-foreground text-sm">
                      No rating available
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
