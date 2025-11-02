import { tool } from "ai";
import { z } from "zod";

const IMDB_API_BASE_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const decadeAnalysis = tool({
	description:
		"Analyze rating trends across decades (1920s-2020s) for movies or TV series. Shows how average ratings, title counts, and popularity have changed over time. Use this when a user wants to understand historical trends or compare different eras.",
	inputSchema: z.object({
		title_type: z
			.enum(["movie", "tvSeries"])
			.default("movie")
			.describe("Type of content to analyze: 'movie' or 'tvSeries'"),
		min_votes: z
			.number()
			.int()
			.default(1000)
			.optional()
			.describe(
				"Minimum votes threshold for titles to include (default: 1000)",
			),
	}),
	execute: async ({ title_type, min_votes }) => {
		const params = new URLSearchParams();
		params.append("title_type", title_type);
		if (min_votes) params.append("min_votes", String(min_votes));

		const response = await fetch(
			`${IMDB_API_BASE_URL}/decade_analysis?${params.toString()}`,
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || "Failed to analyze decades");
		}

		return response.json();
	},
});

