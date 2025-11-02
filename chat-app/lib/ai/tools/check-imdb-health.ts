import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const checkImdbHealth = tool({
  description: "Check if the IMDb database and API are available and functioning. Returns database statistics. Use this to verify system status before making other queries.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const response = await fetch(`${IMDB_API_URL}/health`);

      if (!response.ok) {
        return {
          error: `IMDb API is unhealthy: ${response.statusText}`,
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

