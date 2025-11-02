import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = "http://localhost:8000";

export const rankedMovies = tool({
	description:
		"Get the top-ranked movies by quality score (ln(1+votes)*rating). Returns the highest quality films without any filters. Use this when users ask for 'best movies', 'top films', 'greatest movies of all time', or 'highest-rated movies'.",
	inputSchema: z.object({
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.optional()
			.describe("Number of results to return (default: 20, max: 100)"),
	}),
	execute: async ({ limit }) => {
		try {
			const params = new URLSearchParams();
			if (limit) params.append("limit", limit.toString());

			const response = await fetch(
				`${IMDB_API_URL}/ranked_movies?${params.toString()}`,
			);

			if (!response.ok) {
				return {
					error: `Failed to get ranked movies: ${response.statusText}`,
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

