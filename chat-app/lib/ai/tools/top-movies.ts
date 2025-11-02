import { tool } from "ai";
import { z } from "zod";

const IMDB_API_BASE_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const topMovies = tool({
	description:
		"Get the top-rated movies with optional filters for genre, year range, and minimum votes. Returns a ranked list of the highest-rated films. Use this when a user asks for the best movies.",
	inputSchema: z.object({
		genre: z
			.string()
			.optional()
			.describe(
				"Filter by genre (e.g., 'Drama', 'Action', 'Sci-Fi', 'Comedy')",
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
		min_votes: z
			.number()
			.int()
			.default(10000)
			.optional()
			.describe(
				"Minimum votes threshold to ensure reliable ratings (default: 10000)",
			),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.optional()
			.describe("Number of movies to return (default: 20)"),
	}),
	execute: async ({ genre, start_year, end_year, min_votes, limit }) => {
		const params = new URLSearchParams();
		if (genre) params.append("genre", genre);
		if (start_year) params.append("start_year", String(start_year));
		if (end_year) params.append("end_year", String(end_year));
		if (min_votes) params.append("min_votes", String(min_votes));
		if (limit) params.append("limit", String(limit));

		const response = await fetch(
			`${IMDB_API_BASE_URL}/top_movies?${params.toString()}`,
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || "Failed to get top movies");
		}

		return response.json();
	},
});

