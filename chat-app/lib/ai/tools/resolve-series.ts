import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const resolveSeries = tool({
  description: "Find a TV series in the IMDb database by name. Returns series metadata including title, ID (tconst), years, and genres. Use this first when a user asks about any TV show.",
  inputSchema: z.object({
    name: z.string().describe("The name of the TV series to search for (e.g., 'Breaking Bad', 'Game of Thrones')"),
  }),
  execute: async ({ name }) => {
    try {
      const response = await fetch(
        `${IMDB_API_URL}/resolve_series?name=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            error: `Series not found: "${name}". Please check the spelling or try a different name.`,
          };
        }
        return {
          error: `Failed to resolve series: ${response.statusText}`,
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

