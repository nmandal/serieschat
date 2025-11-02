"use client";

import { Film, Star, ThumbsUp, TrendingUp } from "lucide-react";
import type { ReactElement } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
	CATEGORY_COLORS,
	getRankColor,
	getRatingColor,
} from "./imdb-design-tokens";

type BrowseMoviesData = {
	filters: {
		genre: string | null;
		start_year: number | null;
		end_year: number | null;
		min_rating: number | null;
		max_rating: number | null;
		min_votes: number | null;
	};
	total_count: number;
	result_count: number;
	offset: number;
	limit: number;
	movies: Array<{
		rank: number;
		rank_score: number;
		tconst: string;
		title: string;
		year: number;
		genres: string;
		rating: number;
		votes: number;
	}>;
};

export function ImdbBrowseMovies({
	data,
}: {
	data: BrowseMoviesData;
}): ReactElement {
	const { filters, total_count, result_count, movies } = data;
	const colors = CATEGORY_COLORS.movies;

	const hasActiveFilters = Object.values(filters).some((v) => v !== null);

	return (
		<div className="w-full space-y-3">
			<Card>
				<div className="flex items-center gap-3 border-b p-4">
					<Film className={`size-5 ${colors.icon}`} />
					<div className="flex-1">
						<h3 className="font-semibold text-lg">Browse Movies</h3>
						<p className="text-muted-foreground text-sm">
							{result_count} of {total_count.toLocaleString()} movies (ranked
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
								Min Votes: {filters.min_votes.toLocaleString()}
							</Badge>
						)}
					</div>
				)}
			</Card>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{movies.map((movie) => {
					const genres = movie.genres?.split(",") || [];

					return (
						<Card className="p-4" key={movie.tconst}>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div
										className={`flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-xl ${getRankColor(
											movie.rank,
										)}`}
									>
										{movie.rank}
									</div>

									<div className="min-w-0 flex-1">
										<h4 className="line-clamp-2 font-bold text-lg leading-tight">
											{movie.title}
										</h4>
										<div className="mt-1">
											<Badge variant="outline">{movie.year}</Badge>
										</div>
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
												{movie.rating.toFixed(1)}
											</span>
											<span className="text-muted-foreground text-sm">/10</span>
										</div>
										<div className="flex items-center gap-1 text-muted-foreground text-xs">
											<TrendingUp className="size-3" />
											<span>{movie.rank_score.toFixed(1)}</span>
										</div>
									</div>

									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className={`h-full rounded-full ${getRatingColor(
												movie.rating,
											)}`}
											style={{ width: `${(movie.rating / 10) * 100}%` }}
										/>
									</div>

									<div className="flex items-center justify-between border-t pt-2">
										<div className="flex items-center gap-1 text-muted-foreground">
											<ThumbsUp className="size-3" />
											<span className="text-xs">Votes</span>
										</div>
										<span className="font-semibold text-sm">
											{movie.votes.toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{result_count === 0 && (
				<Card className="p-8 text-center">
					<Film className="mx-auto size-12 text-muted-foreground" />
					<p className="mt-3 font-medium text-muted-foreground">
						No movies found
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Try adjusting your filters
					</p>
				</Card>
			)}
		</div>
	);
}

