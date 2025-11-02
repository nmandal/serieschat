import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const seriesAnalytics = tool({
  description: "Get comprehensive analytics and insights for a TV series. Includes overall statistics, season-by-season trends, rating distribution, rating consistency, and season finale analysis. Use this for deep dives into show quality patterns and trends.",
  inputSchema: z.object({
    series: z.string().describe("The name of the TV series to analyze (e.g., 'Breaking Bad', 'Game of Thrones')"),
  }),
  execute: async ({ series }) => {
    try {
      const response = await fetch(
        `${IMDB_API_URL}/series_analytics?series=${encodeURIComponent(series)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            error: `Series not found: "${series}". Please check the spelling or try a different name.`,
          };
        }
        return {
          error: `Failed to get analytics: ${response.statusText}`,
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

