"use client";

import { Calendar, Search, Star, Tv } from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS } from "./imdb-design-tokens";

type SearchResult = {
  tconst: string;
  title: string;
  startYear: number;
  endYear: number | null;
  genres: string;
  avgRating: number | null;
  episodeCount: number;
};

type SearchResultsData = {
  query: string | null;
  filters: {
    genre: string | null;
    start_year: number | null;
    end_year: number | null;
    min_rating: number | null;
  };
  result_count: number;
  series: SearchResult[];
};

export function ImdbSearchResults({ data }: { data: SearchResultsData }) {
  const hasActiveFilters = Object.values(data.filters).some((v) => v !== null);
  const colors = CATEGORY_COLORS.series;

  return (
    <div className="w-full space-y-3">
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Search className={`size-5 ${colors.icon}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              Series Search{data.query && `: "${data.query}"`}
            </h3>
            <p className="text-muted-foreground text-sm">
              {data.result_count} result{data.result_count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 border-b p-4">
            {data.filters.genre && (
              <Badge variant="secondary">Genre: {data.filters.genre}</Badge>
            )}
            {data.filters.start_year && (
              <Badge variant="secondary">From: {data.filters.start_year}</Badge>
            )}
            {data.filters.end_year && (
              <Badge variant="secondary">Until: {data.filters.end_year}</Badge>
            )}
            {data.filters.min_rating && (
              <Badge variant="secondary">
                Rating: {data.filters.min_rating}+
              </Badge>
            )}
          </div>
        )}
      </Card>

      {data.series.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No series found matching your criteria
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.series.map((series) => {
            const genres = series.genres?.split(",") || [];
            const years = series.endYear
              ? `${series.startYear}-${series.endYear}`
              : `${series.startYear}-Present`;

            return (
              <Card
                className="p-4 transition-shadow hover:shadow-md"
                key={series.tconst}
              >
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-lg">{series.title}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{years}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Tv className="size-3" />
                        <span>{series.episodeCount} episodes</span>
                      </div>
                      {series.avgRating && (
                        <div className="flex items-center gap-1">
                          <Star
                            className="size-3 text-amber-500"
                            fill="currentColor"
                          />
                          <span className="font-medium">
                            {series.avgRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {genres.slice(0, 4).map((genre) => (
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
