import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = "http://localhost:8000";

export const browseTv = tool({
	description:
		"Browse and discover TV series ranked by quality score (ln(1+votes)*rating). Supports advanced filtering by genre, year range, seasons, and rating thresholds. Returns ranked results with position numbers. Perfect for exploring and discovering shows based on quality metrics.",
	inputSchema: z.object({
		genre: z
			.string()
			.optional()
			.describe(
				"Filter by genre (e.g., 'Drama', 'Comedy', 'Thriller', 'Sci-Fi')",
			),
		start_year: z
			.number()
			.int()
			.optional()
			.describe("Minimum start year (e.g., 2010)"),
		end_year: z
			.number()
			.int()
			.optional()
			.describe("Maximum start year (e.g., 2020)"),
		min_rating: z
			.number()
			.optional()
			.describe("Minimum average rating (0-10, e.g., 8.0)"),
		max_rating: z
			.number()
			.optional()
			.describe("Maximum average rating (0-10, e.g., 9.5)"),
		min_votes: z
			.number()
			.int()
			.optional()
			.describe("Minimum votes per episode to ensure quality data"),
		min_seasons: z
			.number()
			.int()
			.optional()
			.describe("Minimum number of seasons"),
		max_seasons: z
			.number()
			.int()
			.optional()
			.describe("Maximum number of seasons"),
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
		min_seasons,
		max_seasons,
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
			if (min_seasons) params.append("min_seasons", min_seasons.toString());
			if (max_seasons) params.append("max_seasons", max_seasons.toString());
			if (offset) params.append("offset", offset.toString());
			if (limit) params.append("limit", limit.toString());

			const response = await fetch(
				`${IMDB_API_URL}/browse_tv?${params.toString()}`,
			);

			if (!response.ok) {
				return {
					error: `Failed to browse TV series: ${response.statusText}`,
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

