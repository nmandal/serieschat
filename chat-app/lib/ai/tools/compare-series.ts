import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const compareSeries = tool({
  description: "Compare multiple TV series side by side with detailed statistics. Shows average ratings, total episodes, seasons, best/worst episodes, and more. Perfect for 'which is better' questions or comparing similar shows. Provide a comma-separated list of series names.",
  inputSchema: z.object({
    seriesNames: z.string().describe("Comma-separated list of series names to compare (e.g., 'Breaking Bad,The Wire,The Sopranos'). Maximum 10 series."),
  }),
  execute: async ({ seriesNames }) => {
    try {
      const response = await fetch(
        `${IMDB_API_URL}/compare_series?series_names=${encodeURIComponent(seriesNames)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            error: `One or more series not found. Please check the spelling of: ${seriesNames}`,
          };
        }
        return {
          error: `Failed to compare series: ${response.statusText}`,
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

