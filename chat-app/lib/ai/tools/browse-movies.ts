import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = "http://localhost:8000";

export const browseMovies = tool({
	description:
		"Browse and discover movies ranked by quality score (ln(1+votes)*rating). Supports advanced filtering by genre, year range, and rating thresholds. Returns ranked results with position numbers showing the highest quality films. Perfect for exploring and discovering movies based on quality metrics.",
	inputSchema: z.object({
		genre: z
			.string()
			.optional()
			.describe(
				"Filter by genre (e.g., 'Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror')",
			),
		start_year: z
			.number()
			.int()
			.optional()
			.describe("Minimum release year (e.g., 1990)"),
		end_year: z
			.number()
			.int()
			.optional()
			.describe("Maximum release year (e.g., 2020)"),
		min_rating: z
			.number()
			.optional()
			.describe("Minimum average rating (0-10, e.g., 7.5)"),
		max_rating: z
			.number()
			.optional()
			.describe("Maximum average rating (0-10, e.g., 9.0)"),
		min_votes: z
			.number()
			.int()
			.optional()
			.describe("Minimum number of votes to ensure quality data"),
		offset: z
			.number()
			.int()
			.default(0)
			.optional()
			.describe("Pagination offset (default: 0)"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.optional()
			.describe("Number of results to return (default: 20, max: 100)"),
	}),
	execute: async ({
		genre,
		start_year,
		end_year,
		min_rating,
		max_rating,
		min_votes,
		offset,
		limit,
	}) => {
		try {
			const params = new URLSearchParams();
			if (genre) params.append("genre", genre);
			if (start_year) params.append("start_year", start_year.toString());
			if (end_year) params.append("end_year", end_year.toString());
			if (min_rating) params.append("min_rating", min_rating.toString());
			if (max_rating) params.append("max_rating", max_rating.toString());
			if (min_votes) params.append("min_votes", min_votes.toString());
			if (offset) params.append("offset", offset.toString());
			if (limit) params.append("limit", limit.toString());

			const response = await fetch(
				`${IMDB_API_URL}/browse_movies?${params.toString()}`,
			);

			if (!response.ok) {
				return {
					error: `Failed to browse movies: ${response.statusText}`,
				};
			}

			const data = await response.json();
			return data;
		} catch (error) {
			return {
				error: `Failed to connect to IMDb API. Make sure the API server is running at ${IMDB_API_URL}`,
			};
		}
	},
});

