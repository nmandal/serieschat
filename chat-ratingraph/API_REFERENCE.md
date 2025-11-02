# API Reference - IMDb TV API

Complete documentation for all API endpoints in the IMDb TV API.

**Base URL**: `http://127.0.0.1:8000` (local) or `https://your-app.fly.dev` (production)

**Version**: 2.0.0

## Table of Contents

- [System Endpoints](#system-endpoints)
- [TV Series Endpoints](#tv-series-endpoints)
- [Movie Endpoints](#movie-endpoints)
- [Analysis Endpoints](#analysis-endpoints)
- [Browse Endpoints](#browse-endpoints)
- [Error Responses](#error-responses)

---

## System Endpoints

### GET `/health`

Health check endpoint to verify API and database status.

**Response 200 (Success)**
```json
{
  "status": "healthy",
  "database": "/data/imdb.duckdb",
  "titles_count": 12000000
}
```

**Response 503 (Unhealthy)**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

**Example**
```bash
curl http://127.0.0.1:8000/health
```

### GET `/`

Root endpoint returning API information and available endpoints.

**Response 200**
```json
{
  "name": "IMDb Movies & TV Series API",
  "version": "2.0.0",
  "description": "Comprehensive IMDb data analysis for movies and TV series",
  "tv_endpoints": {...},
  "movie_endpoints": {...},
  "analysis_endpoints": {...},
  "browse_endpoints": {...},
  "system_endpoints": {...},
  "total_endpoints": 19
}
```

---

## TV Series Endpoints

### GET `/resolve_series`

Find a TV series by name and return metadata.

**Query Parameters**
- `name` (required) - Series name to search for

**Response 200**
```json
{
  "tconst": "tt0903747",
  "title": "Breaking Bad",
  "startYear": 2008,
  "endYear": 2013,
  "genres": "Crime,Drama,Thriller"
}
```

**Response 404** - Series not found

**Example**
```bash
curl "http://127.0.0.1:8000/resolve_series?name=Breaking%20Bad"
```

---

### GET `/episodes`

Get all episodes with ratings for a TV series.

**Query Parameters**
- `series` (required) - Series name

**Response 200**
```json
{
  "series": "Breaking Bad",
  "tconst": "tt0903747",
  "total_episodes": 62,
  "episodes": [
    {
      "episodeTconst": "tt0959621",
      "seasonNumber": 1,
      "episodeNumber": 1,
      "title": "Pilot",
      "averageRating": 8.9,
      "numVotes": 45000
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/episodes?series=Breaking%20Bad"
```

---

### GET `/top_episodes`

Get top-ranked episodes using IMDb weighted rating formula.

**Query Parameters**
- `series` (required) - Series name
- `min_votes` (optional, default: 1000) - Minimum votes threshold
- `limit` (optional, default: 10) - Number of results
- `m` (optional, default: 1000) - Weighting parameter for formula

**Formula**: `WR = (v/(v+m)) * R + (m/(v+m)) * C`
- `v` = votes for episode
- `m` = minimum votes required
- `R` = average rating
- `C` = mean rating across series

**Response 200**
```json
{
  "series": "Breaking Bad",
  "tconst": "tt0903747",
  "parameters": {
    "min_votes": 1000,
    "limit": 10,
    "m": 1000
  },
  "mean_rating": 8.95,
  "top_episodes": [
    {
      "episodeTconst": "tt2301451",
      "seasonNumber": 5,
      "episodeNumber": 14,
      "title": "Ozymandias",
      "averageRating": 10.0,
      "numVotes": 267735,
      "weightedRating": 9.998,
      "rank": 1
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/top_episodes?series=Breaking%20Bad&min_votes=1000&limit=10"
```

---

### GET `/worst_episodes`

Get worst-rated episodes for a TV series.

**Query Parameters**
- `series` (required) - Series name
- `min_votes` (optional, default: 1000) - Minimum votes threshold
- `limit` (optional, default: 10) - Number of results

**Response 200**
```json
{
  "series": "Game of Thrones",
  "tconst": "tt0944947",
  "worst_episodes": [
    {
      "episodeTconst": "tt6027920",
      "seasonNumber": 8,
      "episodeNumber": 6,
      "title": "The Iron Throne",
      "averageRating": 4.1,
      "numVotes": 389000,
      "rank": 1
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/worst_episodes?series=Game%20of%20Thrones&min_votes=1000&limit=10"
```

---

### GET `/search_series`

Advanced search for TV series with multiple filters.

**Query Parameters**
- `query` (optional) - Search query for title
- `genre` (optional) - Genre filter (e.g., "Drama", "Comedy")
- `start_year` (optional) - Minimum start year
- `min_rating` (optional) - Minimum average rating
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "query": {
    "text": "crime",
    "genre": "Drama",
    "start_year": 2000,
    "min_rating": 8.5
  },
  "total_results": 15,
  "series": [
    {
      "tconst": "tt0306414",
      "title": "The Wire",
      "startYear": 2002,
      "endYear": 2008,
      "genres": "Crime,Drama,Thriller",
      "averageRating": 9.3,
      "numVotes": 389000
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/search_series?genre=Drama&start_year=2000&min_rating=8.5"
```

---

### GET `/compare_series`

Compare multiple TV series side-by-side.

**Query Parameters**
- `series_names` (required) - Comma-separated list of series names

**Response 200**
```json
{
  "comparison": [
    {
      "title": "Breaking Bad",
      "tconst": "tt0903747",
      "startYear": 2008,
      "endYear": 2013,
      "genres": "Crime,Drama,Thriller",
      "averageRating": 9.5,
      "numVotes": 2000000,
      "totalEpisodes": 62,
      "totalSeasons": 5,
      "bestEpisode": {
        "title": "Ozymandias",
        "season": 5,
        "episode": 14,
        "rating": 10.0
      },
      "worstEpisode": {
        "title": "Fly",
        "season": 3,
        "episode": 10,
        "rating": 7.9
      }
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/compare_series?series_names=Breaking%20Bad,The%20Wire,The%20Sopranos"
```

---

### GET `/series_analytics`

Get comprehensive analytics for a TV series.

**Query Parameters**
- `series` (required) - Series name

**Response 200**
```json
{
  "series": "Game of Thrones",
  "tconst": "tt0944947",
  "overall": {
    "averageRating": 8.74,
    "totalEpisodes": 73,
    "totalSeasons": 8,
    "consistencyScore": 0.82,
    "trend": "declining"
  },
  "by_season": [
    {
      "season": 1,
      "episodes": 10,
      "avgRating": 8.95,
      "minRating": 8.3,
      "maxRating": 9.5
    },
    ...
  ],
  "rating_distribution": {
    "9.0-10.0": 15,
    "8.0-9.0": 40,
    "7.0-8.0": 15,
    "6.0-7.0": 3
  },
  "season_finales": [
    {
      "season": 1,
      "episodeTitle": "Fire and Blood",
      "rating": 9.1
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/series_analytics?series=Game%20of%20Thrones"
```

---

### GET `/series_episode_graph`

Get structured data for plotting episode ratings over time.

**Query Parameters**
- `series` (required) - Series name
- `scale` (optional, default: "auto") - Scale type ("auto", "fixed", "relative")

**Response 200**
```json
{
  "series": "Breaking Bad",
  "tconst": "tt0903747",
  "data": [
    {
      "season": 1,
      "episode": 1,
      "globalEpisode": 1,
      "title": "Pilot",
      "rating": 8.9,
      "votes": 45000
    },
    ...
  ],
  "scale": "auto",
  "yAxis": {
    "min": 7.5,
    "max": 10.0
  }
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/series_episode_graph?series=Breaking%20Bad&scale=auto"
```

---

## Movie Endpoints

### GET `/search_movies`

Search for movies with multiple filters.

**Query Parameters**
- `query` (optional) - Search query for title
- `genre` (optional) - Genre filter
- `start_year` (optional) - Minimum year
- `end_year` (optional) - Maximum year
- `min_rating` (optional) - Minimum rating
- `min_votes` (optional, default: 10000) - Minimum votes
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "query": {
    "text": "godfather",
    "genre": "Drama",
    "min_rating": 8.0
  },
  "total_results": 3,
  "movies": [
    {
      "tconst": "tt0068646",
      "title": "The Godfather",
      "year": 1972,
      "genres": "Crime,Drama",
      "averageRating": 9.2,
      "numVotes": 1800000
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/search_movies?query=godfather&min_rating=8.0"
```

---

### GET `/movie_details`

Get detailed information for a specific movie.

**Query Parameters**
- `title` (required) - Movie title

**Response 200**
```json
{
  "tconst": "tt0111161",
  "title": "The Shawshank Redemption",
  "year": 1994,
  "genres": "Drama",
  "averageRating": 9.3,
  "numVotes": 2500000,
  "runtimeMinutes": 142
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/movie_details?title=The%20Shawshank%20Redemption"
```

---

### GET `/compare_movies`

Compare multiple movies side-by-side.

**Query Parameters**
- `movie_titles` (required) - Comma-separated list of movie titles

**Response 200**
```json
{
  "comparison": [
    {
      "title": "The Godfather",
      "tconst": "tt0068646",
      "year": 1972,
      "genres": "Crime,Drama",
      "averageRating": 9.2,
      "numVotes": 1800000
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/compare_movies?movie_titles=The%20Godfather,The%20Shawshank%20Redemption"
```

---

### GET `/top_movies`

Get top-rated movies with filters.

**Query Parameters**
- `genre` (optional) - Genre filter
- `start_year` (optional) - Minimum year
- `end_year` (optional) - Maximum year
- `min_votes` (optional, default: 10000) - Minimum votes
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "filters": {
    "genre": "Drama",
    "start_year": 1990,
    "min_votes": 10000
  },
  "total_results": 20,
  "movies": [
    {
      "tconst": "tt0111161",
      "title": "The Shawshank Redemption",
      "year": 1994,
      "genres": "Drama",
      "averageRating": 9.3,
      "numVotes": 2500000,
      "rank": 1
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/top_movies?genre=Drama&start_year=1990&limit=20"
```

---

## Analysis Endpoints

### GET `/genre_analysis`

Analyze ratings by genre.

**Query Parameters**
- `title_type` (optional, default: "movie") - Type: "movie" or "tvSeries"
- `min_votes` (optional, default: 1000) - Minimum votes threshold

**Response 200**
```json
{
  "title_type": "movie",
  "min_votes": 1000,
  "genres": [
    {
      "genre": "Drama",
      "count": 45000,
      "avgRating": 6.8,
      "medianRating": 6.9,
      "topTitles": [...]
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/genre_analysis?title_type=movie&min_votes=1000"
```

---

### GET `/decade_analysis`

Analyze ratings by decade.

**Query Parameters**
- `title_type` (optional, default: "movie") - Type: "movie" or "tvSeries"
- `min_votes` (optional, default: 1000) - Minimum votes threshold

**Response 200**
```json
{
  "title_type": "movie",
  "decades": [
    {
      "decade": "1990s",
      "count": 15000,
      "avgRating": 6.5,
      "topRated": [...]
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/decade_analysis?title_type=movie"
```

---

## Browse Endpoints

### GET `/browse_tv`

Browse TV series with filters.

**Query Parameters**
- `genre` (optional) - Genre filter
- `start_year` (optional) - Minimum start year
- `min_rating` (optional) - Minimum rating
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "filters": {
    "genre": "Sci-Fi",
    "start_year": 2010,
    "min_rating": 8.0
  },
  "total_results": 20,
  "series": [...]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/browse_tv?genre=Sci-Fi&start_year=2010&min_rating=8.0"
```

---

### GET `/browse_movies`

Browse movies with filters.

**Query Parameters**
- `genre` (optional) - Genre filter
- `start_year` (optional) - Minimum year
- `min_rating` (optional) - Minimum rating
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "filters": {
    "genre": "Action",
    "min_rating": 7.5
  },
  "total_results": 20,
  "movies": [...]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/browse_movies?genre=Action&min_rating=7.5"
```

---

### GET `/ranked_tv`

Get top-ranked TV series.

**Query Parameters**
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "total_results": 20,
  "series": [
    {
      "rank": 1,
      "title": "Breaking Bad",
      "tconst": "tt0903747",
      "averageRating": 9.5,
      "numVotes": 2000000,
      "startYear": 2008,
      "endYear": 2013
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/ranked_tv?limit=20"
```

---

### GET `/ranked_movies`

Get top-ranked movies.

**Query Parameters**
- `limit` (optional, default: 20) - Number of results

**Response 200**
```json
{
  "total_results": 20,
  "movies": [
    {
      "rank": 1,
      "title": "The Shawshank Redemption",
      "tconst": "tt0111161",
      "averageRating": 9.3,
      "numVotes": 2500000,
      "year": 1994
    },
    ...
  ]
}
```

**Example**
```bash
curl "http://127.0.0.1:8000/ranked_movies?limit=20"
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid parameter: min_rating must be between 0 and 10"
}
```

### 404 Not Found
```json
{
  "detail": "Series not found: Unknown Series"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Database query failed: [error message]"
}
```

### 503 Service Unavailable
```json
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

---

## Rate Limiting

Currently, there are no rate limits enforced. For production deployments, consider implementing rate limiting at the infrastructure level (e.g., using Fly.io's rate limiting features or a reverse proxy like Nginx).

## Authentication

The API currently does not require authentication. All endpoints are publicly accessible.

## CORS

The API supports CORS with the following default origins:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `https://*.vercel.app`
- Custom origins via `CORS_ORIGIN` environment variable

## Data Freshness

The API uses data from IMDb's publicly available datasets. To update the data:
1. Download the latest datasets from https://datasets.imdbws.com/
2. Rebuild the database using `python 01_build_imdb_duckdb.py`
3. Restart the API server

IMDb updates their datasets daily.

## Performance Tips

1. **Use min_votes parameter**: Filter out titles with few votes for more reliable results
2. **Limit result sets**: Use the `limit` parameter to control response size
3. **Cache responses**: Consider caching frequently accessed data on the client side
4. **Specific queries**: More specific queries (exact name matches) perform better than broad searches

## Support

For issues, feature requests, or questions:
- GitHub Issues: [repository URL]
- Documentation: See README.md and CONTRIBUTING.md
- Interactive API Docs: `http://127.0.0.1:8000/docs` (Swagger UI)

## License

This API uses IMDb's non-commercial datasets. Data is for **personal and non-commercial use only**. Always attribute IMDb when using this data.

