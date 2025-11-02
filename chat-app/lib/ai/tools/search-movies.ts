import { tool } from "ai";
import { z } from "zod";

const IMDB_API_BASE_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const searchMovies = tool({
	description:
		"Search for movies with advanced filters including title, genre, year range, minimum rating, and vote count. Use this when a user asks to find movies based on multiple criteria or wants to discover films.",
	inputSchema: z.object({
		query: z
			.string()
			.optional()
			.describe(
				"Search query for movie title (e.g., 'Godfather', 'Dark Knight')",
			),
		genre: z
			.string()
			.optional()
			.describe(
				"Filter by genre (e.g., 'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror')",
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
			.min(0)
			.max(10)
			.optional()
			.describe("Minimum average rating (e.g., 8.0)"),
		min_votes: z
			.number()
			.int()
			.optional()
			.describe("Minimum number of votes (e.g., 10000 for popular films)"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(50)
			.default(20)
			.optional()
			.describe("Maximum number of movies to return (default: 20)"),
	}),
	execute: async ({
		query,
		genre,
		start_year,
		end_year,
		min_rating,
		min_votes,
		limit,
	}) => {
		const params = new URLSearchParams();
		if (query) params.append("query", query);
		if (genre) params.append("genre", genre);
		if (start_year) params.append("start_year", String(start_year));
		if (end_year) params.append("end_year", String(end_year));
		if (min_rating) params.append("min_rating", String(min_rating));
		if (min_votes) params.append("min_votes", String(min_votes));
		if (limit) params.append("limit", String(limit));

		const response = await fetch(
			`${IMDB_API_BASE_URL}/search_movies?${params.toString()}`,
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || "Failed to search movies");
		}

		return response.json();
	},
});

