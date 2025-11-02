"use client";

import { Film, Star, ThumbsUp } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS, getRatingColor } from "./imdb-design-tokens";

type MovieDetails = {
  tconst: string;
  title: string;
  year: number;
  genres: string;
  rating: number | null;
  votes: number;
};

export function ImdbMovieDetails({
  data,
}: {
  data: MovieDetails;
}): ReactElement {
  const { title, year, genres, rating, votes } = data;
  const colors = CATEGORY_COLORS.movies;

  return (
    <Card className="w-full">
      <div className="flex items-center gap-3 border-b p-4">
        <Film className={`size-5 ${colors.icon}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline">{year}</Badge>
            <span className="text-muted-foreground text-sm">{genres}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {rating ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-amber-500" fill="currentColor" />
                <span className="font-bold text-2xl">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">/10</span>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${getRatingColor(rating)}`}
                style={{ width: `${(rating / 10) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ThumbsUp className="size-4" />
                <span className="text-sm">Total Votes</span>
              </div>
              <span className="font-semibold text-sm">
                {votes.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No rating information available
          </div>
        )}
      </div>
    </Card>
  );
}
