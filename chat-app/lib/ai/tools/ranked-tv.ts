import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = "http://localhost:8000";

export const rankedTv = tool({
	description:
		"Get the top-ranked TV series by quality score (ln(1+votes)*rating). Returns the highest quality shows without any filters. Use this when users ask for 'best TV shows', 'top series', or 'highest-rated shows of all time'.",
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
			console.log("[rankedTv] IMDB_API_URL:", IMDB_API_URL);
			const params = new URLSearchParams();
			if (limit) params.append("limit", limit.toString());

			const url = `${IMDB_API_URL}/ranked_tv?${params.toString()}`;
			console.log("[rankedTv] Fetching:", url);
			
			const response = await fetch(url);

			if (!response.ok) {
				return {
					error: `Failed to get ranked TV series: ${response.statusText}`,
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

