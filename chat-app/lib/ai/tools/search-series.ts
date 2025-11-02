import { tool } from "ai";
import { z } from "zod";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const searchSeries = tool({
  description: "Advanced search for TV series with multiple filters. Search by name, genre (Drama, Comedy, Thriller, etc.), year range, and minimum rating. Perfect for finding shows that match specific criteria or discovering new series.",
  inputSchema: z.object({
    query: z.string().optional().describe("Search query for series name (partial matches supported)"),
    genre: z.string().optional().describe("Filter by genre (e.g., 'Drama', 'Comedy', 'Sci-Fi', 'Thriller')"),
    startYear: z.number().optional().describe("Minimum start year (e.g., 2010)"),
    endYear: z.number().optional().describe("Maximum start year (e.g., 2020)"),
    minRating: z.number().optional().describe("Minimum average rating (0-10, e.g., 8.5)"),
    limit: z.number().optional().describe("Maximum number of results to return (default: 20, max: 50)"),
  }),
  execute: async ({ query, genre, startYear, endYear, minRating, limit }) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (genre) params.append("genre", genre);
      if (startYear) params.append("start_year", startYear.toString());
      if (endYear) params.append("end_year", endYear.toString());
      if (minRating) params.append("min_rating", minRating.toString());
      if (limit) params.append("limit", Math.min(limit, 50).toString());

      const response = await fetch(
        `${IMDB_API_URL}/search_series?${params.toString()}`
      );

      if (!response.ok) {
        return {
          error: `Failed to search series: ${response.statusText}`,
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

