"use client";

import { Calendar, Tag, Tv } from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { CATEGORY_COLORS } from "./imdb-design-tokens";

type SeriesInfo = {
  tconst: string;
  title: string;
  startYear: number;
  endYear: number | null;
  genres: string;
};

export function ImdbSeriesInfo({ seriesInfo }: { seriesInfo: SeriesInfo }) {
  const years = seriesInfo.endYear
    ? `${seriesInfo.startYear} - ${seriesInfo.endYear}`
    : `${seriesInfo.startYear} - Present`;

  const genres = seriesInfo.genres?.split(",") || [];
  const colors = CATEGORY_COLORS.series;

  return (
    <Card className="w-full">
      <div className="flex items-center gap-3 border-b p-4">
        <Tv className={`size-5 ${colors.icon}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{seriesInfo.title}</h3>
          <p className="text-muted-foreground text-sm">
            ID: {seriesInfo.tconst}
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-sm">{years}</span>
        </div>

        {genres.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="size-4 shrink-0 text-muted-foreground" />
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
          </div>
        )}
      </div>
    </Card>
  );
}
