"use client";

import { Star, TrendingUp, Tv } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
	CATEGORY_COLORS,
	getRankColor,
	getRatingColor,
} from "./imdb-design-tokens";

type BrowseTvData = {
	filters: {
		genre: string | null;
		start_year: number | null;
		end_year: number | null;
		min_rating: number | null;
		max_rating: number | null;
		min_votes: number | null;
		min_seasons: number | null;
		max_seasons: number | null;
	};
	total_count: number;
	result_count: number;
	offset: number;
	limit: number;
	series: Array<{
		rank: number;
		rank_score: number;
		tconst: string;
		title: string;
		years: string;
		genres: string;
		avg_rating: number;
		total_episodes: number;
		total_seasons: number;
		avg_votes_per_episode: number;
	}>;
};

export function ImdbBrowseTv({ data }: { data: BrowseTvData }): ReactElement {
	const { filters, total_count, result_count, series } = data;
	const colors = CATEGORY_COLORS.series;

	const hasActiveFilters = Object.values(filters).some((v) => v !== null);

	return (
		<div className="w-full space-y-3">
			<Card>
				<div className="flex items-center gap-3 border-b p-4">
					<Tv className={`size-5 ${colors.icon}`} />
					<div className="flex-1">
						<h3 className="font-semibold text-lg">Browse TV Series</h3>
						<p className="text-muted-foreground text-sm">
							{result_count} of {total_count.toLocaleString()} series (ranked
							by quality score)
						</p>
					</div>
				</div>

				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2 border-b p-4">
						{filters.genre && (
							<Badge variant="secondary">Genre: {filters.genre}</Badge>
						)}
						{filters.start_year && filters.end_year && (
							<Badge variant="secondary">
								Years: {filters.start_year}-{filters.end_year}
							</Badge>
						)}
						{filters.start_year && !filters.end_year && (
							<Badge variant="secondary">From: {filters.start_year}</Badge>
						)}
						{filters.end_year && !filters.start_year && (
							<Badge variant="secondary">Until: {filters.end_year}</Badge>
						)}
						{filters.min_rating && (
							<Badge variant="secondary">
								Rating: {filters.min_rating}+
							</Badge>
						)}
						{filters.max_rating && (
							<Badge variant="secondary">
								Max Rating: {filters.max_rating}
							</Badge>
						)}
						{filters.min_votes && (
							<Badge variant="secondary">
								Min Votes/Episode: {filters.min_votes.toLocaleString()}
							</Badge>
						)}
						{filters.min_seasons && (
							<Badge variant="secondary">
								Min Seasons: {filters.min_seasons}
							</Badge>
						)}
						{filters.max_seasons && (
							<Badge variant="secondary">
								Max Seasons: {filters.max_seasons}
							</Badge>
						)}
					</div>
				)}
			</Card>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{series.map((show) => {
					const genres = show.genres?.split(",") || [];

					return (
						<Card className="p-4" key={show.tconst}>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div
										className={`flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-xl ${getRankColor(
											show.rank,
										)}`}
									>
										{show.rank}
									</div>

									<div className="min-w-0 flex-1">
										<h4 className="line-clamp-2 font-bold text-lg leading-tight">
											{show.title}
										</h4>
										<p className="text-muted-foreground text-sm">{show.years}</p>
									</div>
								</div>

								{genres.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{genres.slice(0, 3).map((genre) => (
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

								<div className="space-y-2 border-t pt-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Star
												className="size-4 text-amber-500"
												fill="currentColor"
											/>
											<span className="font-bold text-xl">
												{show.avg_rating.toFixed(1)}
											</span>
											<span className="text-muted-foreground text-sm">/10</span>
										</div>
										<div className="flex items-center gap-1 text-muted-foreground text-xs">
											<TrendingUp className="size-3" />
											<span>{show.rank_score.toFixed(1)}</span>
										</div>
									</div>

									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className={`h-full rounded-full ${getRatingColor(
												show.avg_rating,
											)}`}
											style={{ width: `${(show.avg_rating / 10) * 100}%` }}
										/>
									</div>

									<div className="flex justify-between text-muted-foreground text-xs">
										<span>
											{show.total_seasons} season
											{show.total_seasons !== 1 ? "s" : ""}
										</span>
										<span>{show.total_episodes} episodes</span>
									</div>

									<div className="text-center text-muted-foreground text-xs">
										{show.avg_votes_per_episode.toLocaleString()} avg
										votes/episode
									</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{result_count === 0 && (
				<Card className="p-8 text-center">
					<Tv className="mx-auto size-12 text-muted-foreground" />
					<p className="mt-3 font-medium text-muted-foreground">
						No series found
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Try adjusting your filters
					</p>
				</Card>
			)}
		</div>
	);
}

