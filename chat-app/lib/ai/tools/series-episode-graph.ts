import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = "http://localhost:8000";

export const seriesEpisodeGraph = tool({
	description:
		"Get detailed episode-by-episode rating data for interactive visualization of a TV series. Includes per-season statistics, trendlines for quality analysis over time, and rating ranges. Use this when users want to 'graph', 'visualize', 'chart', or 'see the episode ratings' for a show, or understand quality trends across seasons.",
	inputSchema: z.object({
		series: z
			.string()
			.describe(
				"The name of the TV series to graph (e.g., 'Breaking Bad', 'Game of Thrones')",
			),
		scale: z
			.enum(["auto", "0-10", "autoscale"])
			.optional()
			.describe(
				"Scale mode for the graph: 'auto' (smart range), '0-10' (full scale), 'autoscale' (tight fit)",
			),
	}),
	execute: async ({ series, scale }) => {
		try {
			const params = new URLSearchParams({
				series,
				...(scale && { scale }),
			});

			const response = await fetch(
				`${IMDB_API_URL}/series_episode_graph?${params.toString()}`,
			);

			if (!response.ok) {
				if (response.status === 404) {
					const errorData = await response.json();
					return {
						error: errorData.detail || `Series not found: "${series}"`,
					};
				}
				return {
					error: `Failed to get episode graph: ${response.statusText}`,
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

