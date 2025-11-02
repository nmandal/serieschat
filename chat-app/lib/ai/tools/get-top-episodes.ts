import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const getTopEpisodes = tool({
  description: "Get the highest-rated episodes for a TV series using IMDb's weighted rating formula. This prevents episodes with few votes from dominating rankings. Use this when users ask for 'best episodes', 'top rated', or 'must-watch episodes'.",
  inputSchema: z.object({
    series: z.string().describe("The name of the TV series (e.g., 'Breaking Bad', 'Game of Thrones')"),
    minVotes: z.number().optional().describe("Minimum number of votes required for an episode to be included (default: 1000). Higher values ensure more reliable ratings."),
    limit: z.number().optional().describe("Maximum number of episodes to return (default: 10)"),
    m: z.number().optional().describe("Weight parameter for the ranking formula (default: 1000). Higher values give more weight to the series average."),
  }),
  execute: async ({ series, minVotes, limit, m }) => {
    try {
      const params = new URLSearchParams({
        series,
        ...(minVotes !== undefined && { min_votes: minVotes.toString() }),
        ...(limit !== undefined && { limit: limit.toString() }),
        ...(m !== undefined && { m: m.toString() }),
      });

      const response = await fetch(
        `${IMDB_API_URL}/top_episodes?${params.toString()}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json();
          return {
            error: errorData.detail || `No episodes found for: "${series}"`,
          };
        }
        return {
          error: `Failed to get top episodes: ${response.statusText}`,
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

