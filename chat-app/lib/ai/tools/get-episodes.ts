import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const getEpisodes = tool({
  description: "Retrieve all episodes with ratings for a TV series. Returns season numbers, episode numbers, titles, ratings, and vote counts. Use this to analyze episode data, find patterns, or answer questions about specific episodes.",
  inputSchema: z.object({
    series: z.string().describe("The name of the TV series (e.g., 'Breaking Bad', 'Game of Thrones')"),
  }),
  execute: async ({ series }) => {
    try {
      const response = await fetch(
        `${IMDB_API_URL}/episodes?series=${encodeURIComponent(series)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            error: `Series or episodes not found for: "${series}". Please check the spelling or try a different name.`,
          };
        }
        return {
          error: `Failed to get episodes: ${response.statusText}`,
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

