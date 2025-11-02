import { tool } from "ai";
import { z } from "zod";

const IMDB_API_BASE_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const compareMovies = tool({
	description:
		"Compare multiple movies side by side, showing their ratings, years, genres, and vote counts. Use this when a user wants to compare films or determine which is better rated.",
	inputSchema: z.object({
		movie_titles: z
			.string()
			.describe(
				"Comma-separated list of movie titles to compare (e.g., 'The Godfather, The Godfather Part II, The Godfather Part III'). Maximum 10 movies.",
			),
	}),
	execute: async ({ movie_titles }) => {
		const params = new URLSearchParams();
		params.append("movie_titles", movie_titles);

		const response = await fetch(
			`${IMDB_API_BASE_URL}/compare_movies?${params.toString()}`,
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || "Failed to compare movies");
		}

		return response.json();
	},
});

