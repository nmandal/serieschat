import { tool } from "ai";
import { z } from "zod";

const IMDB_API_BASE_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const movieDetails = tool({
	description:
		"Get detailed information about a specific movie including title, year, genres, rating, and vote count. Use this when a user asks about a specific movie.",
	inputSchema: z.object({
		title: z
			.string()
			.optional()
			.describe("Movie title (e.g., 'The Godfather')"),
		tconst: z
			.string()
			.optional()
			.describe("IMDb ID starting with 'tt' (e.g., 'tt0068646')"),
	}),
	execute: async ({ title, tconst }) => {
		const params = new URLSearchParams();
		if (title) params.append("title", title);
		if (tconst) params.append("tconst", tconst);

		const response = await fetch(
			`${IMDB_API_BASE_URL}/movie_details?${params.toString()}`,
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || "Failed to get movie details");
		}

		return response.json();
	},
});

