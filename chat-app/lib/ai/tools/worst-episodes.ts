import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const worstEpisodes = tool({
  description: "Get the lowest-rated episodes for a TV series (opposite of top episodes). Useful for finding episodes to skip, understanding quality dips, or analyzing what went wrong in a series. Shows the worst episodes with ratings and vote counts.",
  inputSchema: z.object({
    series: z.string().describe("The name of the TV series (e.g., 'Breaking Bad', 'Game of Thrones')"),
    minVotes: z.number().optional().describe("Minimum number of votes required (default: 1000). Higher values ensure more reliable ratings."),
    limit: z.number().optional().describe("Maximum number of episodes to return (default: 10)"),
  }),
  execute: async ({ series, minVotes, limit }) => {
    try {
      const params = new URLSearchParams({
        series,
        ...(minVotes !== undefined && { min_votes: minVotes.toString() }),
        ...(limit !== undefined && { limit: limit.toString() }),
      });

      const response = await fetch(
        `${IMDB_API_URL}/worst_episodes?${params.toString()}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json();
          return {
            error: errorData.detail || `No episodes found for: "${series}"`,
          };
        }
        return {
          error: `Failed to get worst episodes: ${response.statusText}`,
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

