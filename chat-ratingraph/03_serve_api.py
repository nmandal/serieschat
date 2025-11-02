#!/usr/bin/env python3
"""
FastAPI server for querying IMDb data.

Endpoints:
    - GET /health - Health check
    - GET /resolve_series?name={name} - Find series by name
    - GET /episodes?series={name} - Get all episodes for a series
    - GET /top_episodes?series={name}&min_votes={n}&limit={k} - Ranked episodes
"""

import os
import math
import duckdb
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="IMDb Episode API",
    description="Query and analyze IMDb TV series data",
    version="2.0.0"
)

# CORS middleware for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        os.getenv("CORS_ORIGIN", "*"),
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Database connection (persistent)
DB_PATH = os.getenv("DB_PATH", "imdb.duckdb")
con = None


def get_connection():
    """Get or create database connection."""
    global con
    if con is None:
        if not Path(DB_PATH).exists():
            raise RuntimeError(f"Database not found: {DB_PATH}. Run: python 01_build_imdb_duckdb.py")
        con = duckdb.connect(DB_PATH, read_only=True)
    return con


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    try:
        get_connection()
        print(f"✅ Connected to {DB_PATH}")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    global con
    if con:
        con.close()
        print("🔌 Database connection closed")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "IMDb Movies & TV Series API",
        "version": "2.0.0",
        "description": "Comprehensive IMDb data analysis for movies and TV series",
        "tv_endpoints": {
            "resolve_series": "/resolve_series?name={series_name}",
            "episodes": "/episodes?series={series_name}",
            "top_episodes": "/top_episodes?series={series_name}&min_votes=1000&limit=10",
            "worst_episodes": "/worst_episodes?series={series_name}&min_votes=1000&limit=10",
            "search_series": "/search_series?query={q}&genre={g}&start_year={y}&min_rating={r}",
            "compare_series": "/compare_series?series_names={comma_separated}",
            "series_analytics": "/series_analytics?series={series_name}"
        },
        "movie_endpoints": {
            "search_movies": "/search_movies?query={q}&genre={g}&start_year={y}&min_rating={r}&min_votes={v}",
            "movie_details": "/movie_details?title={movie_title}",
            "compare_movies": "/compare_movies?movie_titles={comma_separated}",
            "top_movies": "/top_movies?genre={g}&start_year={y}&end_year={y}&min_votes=10000&limit=20"
        },
        "analysis_endpoints": {
            "genre_analysis": "/genre_analysis?title_type=movie&min_votes=1000",
            "decade_analysis": "/decade_analysis?title_type=movie&min_votes=1000"
        },
        "browse_endpoints": {
            "browse_tv": "/browse_tv?genre={g}&start_year={y}&min_rating={r}&limit=20",
            "browse_movies": "/browse_movies?genre={g}&start_year={y}&min_rating={r}&limit=20",
            "ranked_tv": "/ranked_tv?limit=20",
            "ranked_movies": "/ranked_movies?limit=20",
            "series_episode_graph": "/series_episode_graph?series={series_name}&scale=auto"
        },
        "system_endpoints": {
            "health": "/health"
        },
        "total_endpoints": 19
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    try:
        con = get_connection()
        count = con.execute("SELECT COUNT(*) FROM title_basics").fetchone()[0]
        return {
            "status": "healthy",
            "database": DB_PATH,
            "titles_count": count
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )


@app.get("/resolve_series")
async def resolve_series(name: str = Query(..., description="Series name to search for")):
    """
    Find series by name and return metadata.
    
    Returns series tconst, title, and year information.
    """
    try:
        con = get_connection()
        result = con.execute("""
            SELECT tconst, primaryTitle, startYear, endYear, genres
            FROM title_basics
            WHERE titleType = 'tvSeries'
                AND LOWER(primaryTitle) = LOWER(?)
            LIMIT 1
        """, [name]).fetchone()
        
        if not result:
            # Try partial match
            result = con.execute("""
                SELECT tconst, primaryTitle, startYear, endYear, genres
                FROM title_basics
                WHERE titleType = 'tvSeries'
                    AND LOWER(primaryTitle) LIKE LOWER(?)
                ORDER BY startYear DESC
                LIMIT 1
            """, [f"%{name}%"]).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Series not found: {name}")
        
        return {
            "tconst": result[0],
            "title": result[1],
            "startYear": result[2],
            "endYear": result[3],
            "genres": result[4]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/episodes")
async def get_episodes(series: str = Query(..., description="Series name")):
    """
    Get all episodes with ratings for a series.
    
    Returns episode metadata including season, episode number, title, and rating.
    """
    try:
        con = get_connection()
        
        # First resolve the series
        series_result = con.execute("""
            SELECT tconst, primaryTitle
            FROM title_basics
            WHERE titleType = 'tvSeries'
                AND LOWER(primaryTitle) = LOWER(?)
            LIMIT 1
        """, [series]).fetchone()
        
        if not series_result:
            raise HTTPException(status_code=404, detail=f"Series not found: {series}")
        
        series_tconst, series_title = series_result
        
        # Get episodes
        episodes = con.execute("""
            SELECT
                seasonNumber,
                episodeNumber,
                episode_title,
                averageRating,
                numVotes,
                episode_tconst
            FROM episode_panel
            WHERE series_tconst = ?
            ORDER BY seasonNumber, episodeNumber
        """, [series_tconst]).fetchall()
        
        if not episodes:
            raise HTTPException(status_code=404, detail=f"No episodes found for: {series_title}")
        
        return {
            "series": series_title,
            "tconst": series_tconst,
            "episode_count": len(episodes),
            "episodes": [
                {
                    "season": row[0],
                    "episode": row[1],
                    "title": row[2],
                    "rating": row[3],
                    "votes": row[4],
                    "tconst": row[5]
                }
                for row in episodes
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/top_episodes")
async def get_top_episodes(
    series: str = Query(..., description="Series name"),
    min_votes: int = Query(1000, description="Minimum votes threshold"),
    limit: int = Query(10, description="Number of results to return"),
    m: int = Query(1000, description="Weight parameter for ranking formula")
):
    """
    Get top episodes using weighted rating formula.
    
    Uses IMDb's weighted rating formula:
        WR = (v/(v+m)) * R + (m/(v+m)) * C
    
    Where:
        v = number of votes for the episode
        m = minimum votes required (parameter)
        R = average rating for the episode
        C = mean rating across all episodes
    """
    try:
        con = get_connection()
        
        # First resolve the series
        series_result = con.execute("""
            SELECT tconst, primaryTitle
            FROM title_basics
            WHERE titleType = 'tvSeries'
                AND LOWER(primaryTitle) = LOWER(?)
            LIMIT 1
        """, [series]).fetchone()
        
        if not series_result:
            raise HTTPException(status_code=404, detail=f"Series not found: {series}")
        
        series_tconst, series_title = series_result
        
        # Get mean rating for the series
        mean_rating = con.execute("""
            SELECT AVG(averageRating)
            FROM episode_panel
            WHERE series_tconst = ?
                AND numVotes >= ?
        """, [series_tconst, min_votes]).fetchone()[0]
        
        if mean_rating is None:
            raise HTTPException(
                status_code=404,
                detail=f"No episodes found with at least {min_votes} votes"
            )
        
        # Calculate weighted ratings and rank episodes
        episodes = con.execute("""
            SELECT
                seasonNumber,
                episodeNumber,
                episode_title,
                averageRating,
                numVotes,
                episode_tconst,
                (CAST(numVotes AS DOUBLE) / (numVotes + ?)) * averageRating +
                (CAST(? AS DOUBLE) / (numVotes + ?)) * ? as weighted_rating
            FROM episode_panel
            WHERE series_tconst = ?
                AND numVotes >= ?
            ORDER BY weighted_rating DESC
            LIMIT ?
        """, [m, m, m, mean_rating, series_tconst, min_votes, limit]).fetchall()
        
        if not episodes:
            raise HTTPException(
                status_code=404,
                detail=f"No episodes found meeting criteria"
            )
        
        return {
            "series": series_title,
            "tconst": series_tconst,
            "mean_rating": round(mean_rating, 2),
            "min_votes": min_votes,
            "weight_parameter": m,
            "episodes": [
                {
                    "rank": idx + 1,
                    "season": row[0],
                    "episode": row[1],
                    "title": row[2],
                    "rating": row[3],
                    "votes": row[4],
                    "tconst": row[5],
                    "weighted_rating": round(row[6], 3)
                }
                for idx, row in enumerate(episodes)
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search_series")
async def search_series(
    query: Optional[str] = Query(None, description="Search query for series name"),
    genre: Optional[str] = Query(None, description="Filter by genre (e.g., 'Drama', 'Comedy')"),
    start_year: Optional[int] = Query(None, description="Minimum start year"),
    end_year: Optional[int] = Query(None, description="Maximum start year"),
    min_rating: Optional[float] = Query(None, description="Minimum average rating"),
    limit: int = Query(20, description="Number of results to return")
):
    """
    Advanced search for TV series with multiple filters.
    """
    try:
        con = get_connection()
        
        conditions = ["titleType = 'tvSeries'"]
        params = []
        
        if query:
            conditions.append("LOWER(primaryTitle) LIKE LOWER(?)")
            params.append(f"%{query}%")
        
        if genre:
            conditions.append("LOWER(genres) LIKE LOWER(?)")
            params.append(f"%{genre}%")
        
        if start_year:
            conditions.append("startYear >= ?")
            params.append(start_year)
        
        if end_year:
            conditions.append("startYear <= ?")
            params.append(end_year)
        
        where_clause = " AND ".join(conditions)
        
        results = con.execute(f"""
            SELECT 
                tb.tconst, 
                tb.primaryTitle, 
                tb.startYear, 
                tb.endYear, 
                tb.genres,
                AVG(tr.averageRating) as avg_rating,
                COUNT(DISTINCT te.tconst) as episode_count
            FROM title_basics tb
            LEFT JOIN title_episode te ON tb.tconst = te.parentTconst
            LEFT JOIN title_ratings tr ON te.tconst = tr.tconst
            WHERE {where_clause}
            GROUP BY tb.tconst, tb.primaryTitle, tb.startYear, tb.endYear, tb.genres
            HAVING episode_count > 0 {' AND avg_rating >= ?' if min_rating else ''}
            ORDER BY avg_rating DESC NULLS LAST
            LIMIT ?
        """, params + ([min_rating] if min_rating else []) + [limit]).fetchall()
        
        return {
            "query": query,
            "filters": {
                "genre": genre,
                "start_year": start_year,
                "end_year": end_year,
                "min_rating": min_rating
            },
            "result_count": len(results),
            "series": [
                {
                    "tconst": row[0],
                    "title": row[1],
                    "startYear": row[2],
                    "endYear": row[3],
                    "genres": row[4],
                    "avgRating": round(row[5], 2) if row[5] else None,
                    "episodeCount": row[6]
                }
                for row in results
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/compare_series")
async def compare_series(
    series_names: str = Query(..., description="Comma-separated list of series names (e.g., 'Breaking Bad,The Wire,The Sopranos')")
):
    """
    Compare multiple TV series side by side with detailed statistics.
    """
    try:
        con = get_connection()
        series_list = [s.strip() for s in series_names.split(",")]
        
        if len(series_list) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 series can be compared at once")
        
        comparisons = []
        
        for series_name in series_list:
            # Resolve series
            series_result = con.execute("""
                SELECT tconst, primaryTitle, startYear, endYear, genres
                FROM title_basics
                WHERE titleType = 'tvSeries'
                    AND LOWER(primaryTitle) = LOWER(?)
                LIMIT 1
            """, [series_name]).fetchone()
            
            if not series_result:
                comparisons.append({
                    "name": series_name,
                    "found": False,
                    "error": f"Series not found: {series_name}"
                })
                continue
            
            tconst, title, start_year, end_year, genres = series_result
            
            # Get episode statistics
            stats = con.execute("""
                SELECT
                    COUNT(*) as total_episodes,
                    AVG(averageRating) as avg_rating,
                    MAX(averageRating) as max_rating,
                    MIN(averageRating) as min_rating,
                    MAX(seasonNumber) as total_seasons,
                    SUM(numVotes) as total_votes
                FROM episode_panel
                WHERE series_tconst = ?
            """, [tconst]).fetchone()
            
            # Get best episode
            best_episode = con.execute("""
                SELECT episode_title, seasonNumber, episodeNumber, averageRating, numVotes
                FROM episode_panel
                WHERE series_tconst = ?
                ORDER BY averageRating DESC, numVotes DESC
                LIMIT 1
            """, [tconst]).fetchone()
            
            # Get worst episode
            worst_episode = con.execute("""
                SELECT episode_title, seasonNumber, episodeNumber, averageRating, numVotes
                FROM episode_panel
                WHERE series_tconst = ?
                ORDER BY averageRating ASC, numVotes DESC
                LIMIT 1
            """, [tconst]).fetchone()
            
            comparisons.append({
                "name": title,
                "found": True,
                "tconst": tconst,
                "years": f"{start_year}-{end_year if end_year else 'Present'}",
                "genres": genres,
                "statistics": {
                    "total_episodes": stats[0],
                    "avg_rating": round(stats[1], 2) if stats[1] else None,
                    "max_rating": round(stats[2], 2) if stats[2] else None,
                    "min_rating": round(stats[3], 2) if stats[3] else None,
                    "total_seasons": stats[4],
                    "total_votes": stats[5],
                    "rating_range": round(stats[2] - stats[3], 2) if (stats[2] and stats[3]) else None
                },
                "best_episode": {
                    "title": best_episode[0],
                    "season": best_episode[1],
                    "episode": best_episode[2],
                    "rating": best_episode[3],
                    "votes": best_episode[4]
                } if best_episode else None,
                "worst_episode": {
                    "title": worst_episode[0],
                    "season": worst_episode[1],
                    "episode": worst_episode[2],
                    "rating": worst_episode[3],
                    "votes": worst_episode[4]
                } if worst_episode else None
            })
        
        return {
            "comparison_count": len(series_list),
            "series": comparisons
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/series_analytics")
async def series_analytics(
    series: str = Query(..., description="Series name")
):
    """
    Get detailed analytics and insights for a TV series.
    """
    try:
        con = get_connection()
        
        # Resolve series
        series_result = con.execute("""
            SELECT tconst, primaryTitle
            FROM title_basics
            WHERE titleType = 'tvSeries'
                AND LOWER(primaryTitle) = LOWER(?)
            LIMIT 1
        """, [series]).fetchone()
        
        if not series_result:
            raise HTTPException(status_code=404, detail=f"Series not found: {series}")
        
        tconst, title = series_result
        
        # Overall statistics
        overall_stats = con.execute("""
            SELECT
                COUNT(*) as total_episodes,
                AVG(averageRating) as avg_rating,
                STDDEV(averageRating) as rating_stddev,
                MAX(averageRating) as max_rating,
                MIN(averageRating) as min_rating,
                AVG(numVotes) as avg_votes,
                MAX(seasonNumber) as total_seasons
            FROM episode_panel
            WHERE series_tconst = ?
        """, [tconst]).fetchone()
        
        # Season-by-season trend
        season_trends = con.execute("""
            SELECT
                seasonNumber,
                COUNT(*) as episode_count,
                AVG(averageRating) as avg_rating,
                MAX(averageRating) as best_rating,
                MIN(averageRating) as worst_rating
            FROM episode_panel
            WHERE series_tconst = ?
            GROUP BY seasonNumber
            ORDER BY seasonNumber
        """, [tconst]).fetchall()
        
        # Rating distribution
        rating_distribution = con.execute("""
            SELECT
                FLOOR(averageRating) as rating_bracket,
                COUNT(*) as episode_count
            FROM episode_panel
            WHERE series_tconst = ?
            GROUP BY FLOOR(averageRating)
            ORDER BY rating_bracket DESC
        """, [tconst]).fetchall()
        
        # Finale analysis
        finales = con.execute("""
            SELECT
                seasonNumber,
                episodeNumber,
                episode_title,
                averageRating,
                numVotes
            FROM episode_panel
            WHERE series_tconst = ?
                AND episodeNumber = (
                    SELECT MAX(episodeNumber)
                    FROM episode_panel ep2
                    WHERE ep2.series_tconst = episode_panel.series_tconst
                        AND ep2.seasonNumber = episode_panel.seasonNumber
                )
            ORDER BY seasonNumber
        """, [tconst]).fetchall()
        
        return {
            "series": title,
            "tconst": tconst,
            "overall_statistics": {
                "total_episodes": overall_stats[0],
                "average_rating": round(overall_stats[1], 2) if overall_stats[1] else None,
                "rating_consistency": round(overall_stats[2], 2) if overall_stats[2] else None,
                "max_rating": round(overall_stats[3], 2) if overall_stats[3] else None,
                "min_rating": round(overall_stats[4], 2) if overall_stats[4] else None,
                "rating_range": round(overall_stats[3] - overall_stats[4], 2) if (overall_stats[3] and overall_stats[4]) else None,
                "average_votes": round(overall_stats[5], 0) if overall_stats[5] else None,
                "total_seasons": overall_stats[6]
            },
            "season_trends": [
                {
                    "season": row[0],
                    "episode_count": row[1],
                    "avg_rating": round(row[2], 2) if row[2] else None,
                    "best_rating": round(row[3], 2) if row[3] else None,
                    "worst_rating": round(row[4], 2) if row[4] else None
                }
                for row in season_trends
            ],
            "rating_distribution": [
                {
                    "rating_bracket": f"{int(row[0])}-{int(row[0])+1}",
                    "episode_count": row[1]
                }
                for row in rating_distribution
            ],
            "season_finales": [
                {
                    "season": row[0],
                    "episode": row[1],
                    "title": row[2],
                    "rating": row[3],
                    "votes": row[4]
                }
                for row in finales
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/worst_episodes")
async def get_worst_episodes(
    series: str = Query(..., description="Series name"),
    min_votes: int = Query(1000, description="Minimum votes threshold"),
    limit: int = Query(10, description="Number of results to return")
):
    """
    Get the worst-rated episodes for a TV series (opposite of top episodes).
    """
    try:
        con = get_connection()
        
        # Resolve series
        series_result = con.execute("""
            SELECT tconst, primaryTitle
            FROM title_basics
            WHERE titleType = 'tvSeries'
                AND LOWER(primaryTitle) = LOWER(?)
            LIMIT 1
        """, [series]).fetchone()
        
        if not series_result:
            raise HTTPException(status_code=404, detail=f"Series not found: {series}")
        
        tconst, title = series_result
        
        episodes = con.execute("""
            SELECT
                seasonNumber,
                episodeNumber,
                episode_title,
                averageRating,
                numVotes,
                episode_tconst
            FROM episode_panel
            WHERE series_tconst = ?
                AND numVotes >= ?
            ORDER BY averageRating ASC, numVotes DESC
            LIMIT ?
        """, [tconst, min_votes, limit]).fetchall()
        
        if not episodes:
            raise HTTPException(
                status_code=404,
                detail=f"No episodes found with at least {min_votes} votes"
            )
        
        return {
            "series": title,
            "tconst": tconst,
            "min_votes": min_votes,
            "episodes": [
                {
                    "rank": idx + 1,
                    "season": row[0],
                    "episode": row[1],
                    "title": row[2],
                    "rating": row[3],
                    "votes": row[4],
                    "tconst": row[5]
                }
                for idx, row in enumerate(episodes)
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search_movies")
async def search_movies(
    query: Optional[str] = Query(None, description="Search query for movie title"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    start_year: Optional[int] = Query(None, description="Minimum release year"),
    end_year: Optional[int] = Query(None, description="Maximum release year"),
    min_rating: Optional[float] = Query(None, description="Minimum average rating"),
    min_votes: Optional[int] = Query(None, description="Minimum number of votes"),
    limit: int = Query(20, description="Number of results")
):
    """Search for movies with multiple filters."""
    try:
        con = get_connection()
        
        conditions = ["titleType = 'movie'"]
        params = []
        
        if query:
            conditions.append("LOWER(primaryTitle) LIKE LOWER(?)")
            params.append(f"%{query}%")
        
        if genre:
            conditions.append("LOWER(genres) LIKE LOWER(?)")
            params.append(f"%{genre}%")
        
        if start_year:
            conditions.append("startYear >= ?")
            params.append(start_year)
        
        if end_year:
            conditions.append("startYear <= ?")
            params.append(end_year)
        
        where_clause = " AND ".join(conditions)
        
        # Get movies with ratings
        results = con.execute(f"""
            SELECT 
                tb.tconst,
                tb.primaryTitle,
                tb.startYear,
                tb.genres,
                tr.averageRating,
                tr.numVotes
            FROM title_basics tb
            LEFT JOIN title_ratings tr ON tb.tconst = tr.tconst
            WHERE {where_clause}
                {"AND tr.averageRating >= ?" if min_rating else ""}
                {"AND tr.numVotes >= ?" if min_votes else ""}
            ORDER BY tr.averageRating DESC NULLS LAST, tr.numVotes DESC
            LIMIT ?
        """, params + ([min_rating] if min_rating else []) + ([min_votes] if min_votes else []) + [limit]).fetchall()
        
        return {
            "query": query,
            "filters": {
                "genre": genre,
                "start_year": start_year,
                "end_year": end_year,
                "min_rating": min_rating,
                "min_votes": min_votes
            },
            "result_count": len(results),
            "movies": [
                {
                    "tconst": row[0],
                    "title": row[1],
                    "year": row[2],
                    "genres": row[3],
                    "rating": round(row[4], 1) if row[4] else None,
                    "votes": row[5]
                }
                for row in results
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/movie_details")
async def movie_details(
    title: Optional[str] = Query(None, description="Movie title"),
    tconst: Optional[str] = Query(None, description="IMDb ID (tconst)")
):
    """Get detailed information about a specific movie."""
    try:
        con = get_connection()
        
        if not title and not tconst:
            raise HTTPException(status_code=400, detail="Must provide either title or tconst")
        
        # Find movie
        if tconst:
            movie_query = "SELECT tconst, primaryTitle, startYear, genres FROM title_basics WHERE tconst = ? AND titleType = 'movie'"
            movie_result = con.execute(movie_query, [tconst]).fetchone()
        else:
            movie_query = "SELECT tconst, primaryTitle, startYear, genres FROM title_basics WHERE LOWER(primaryTitle) = LOWER(?) AND titleType = 'movie' LIMIT 1"
            movie_result = con.execute(movie_query, [title]).fetchone()
        
        if not movie_result:
            raise HTTPException(status_code=404, detail=f"Movie not found: {title or tconst}")
        
        movie_tconst, movie_title, year, genres = movie_result
        
        # Get rating
        rating_result = con.execute("""
            SELECT averageRating, numVotes
            FROM title_ratings
            WHERE tconst = ?
        """, [movie_tconst]).fetchone()
        
        return {
            "tconst": movie_tconst,
            "title": movie_title,
            "year": year,
            "genres": genres,
            "rating": rating_result[0] if rating_result else None,
            "votes": rating_result[1] if rating_result else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/compare_movies")
async def compare_movies(
    movie_titles: str = Query(..., description="Comma-separated list of movie titles")
):
    """Compare multiple movies side by side."""
    try:
        con = get_connection()
        movies_list = [m.strip() for m in movie_titles.split(",")]
        
        if len(movies_list) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 movies can be compared")
        
        comparisons = []
        
        for movie_title in movies_list:
            # Find movie
            movie_result = con.execute("""
                SELECT tconst, primaryTitle, startYear, genres
                FROM title_basics
                WHERE titleType = 'movie' AND LOWER(primaryTitle) = LOWER(?)
                LIMIT 1
            """, [movie_title]).fetchone()
            
            if not movie_result:
                comparisons.append({
                    "title": movie_title,
                    "found": False,
                    "error": f"Movie not found: {movie_title}"
                })
                continue
            
            tconst, title, year, genres = movie_result
            
            # Get rating
            rating_result = con.execute("""
                SELECT averageRating, numVotes
                FROM title_ratings
                WHERE tconst = ?
            """, [tconst]).fetchone()
            
            comparisons.append({
                "title": title,
                "found": True,
                "tconst": tconst,
                "year": year,
                "genres": genres,
                "rating": round(rating_result[0], 2) if rating_result and rating_result[0] else None,
                "votes": rating_result[1] if rating_result else None
            })
        
        return {
            "comparison_count": len(movies_list),
            "movies": comparisons
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/top_movies")
async def top_movies(
    genre: Optional[str] = Query(None, description="Filter by genre"),
    start_year: Optional[int] = Query(None, description="Start year"),
    end_year: Optional[int] = Query(None, description="End year"),
    min_votes: int = Query(10000, description="Minimum votes threshold"),
    limit: int = Query(20, description="Number of results")
):
    """Get top-rated movies with optional filters."""
    try:
        con = get_connection()
        
        conditions = ["tb.titleType = 'movie'", "tr.numVotes >= ?"]
        params = [min_votes]
        
        if genre:
            conditions.append("LOWER(tb.genres) LIKE LOWER(?)")
            params.append(f"%{genre}%")
        
        if start_year:
            conditions.append("tb.startYear >= ?")
            params.append(start_year)
        
        if end_year:
            conditions.append("tb.startYear <= ?")
            params.append(end_year)
        
        where_clause = " AND ".join(conditions)
        
        results = con.execute(f"""
            SELECT 
                tb.tconst,
                tb.primaryTitle,
                tb.startYear,
                tb.genres,
                tr.averageRating,
                tr.numVotes
            FROM title_basics tb
            JOIN title_ratings tr ON tb.tconst = tr.tconst
            WHERE {where_clause}
            ORDER BY tr.averageRating DESC, tr.numVotes DESC
            LIMIT ?
        """, params + [limit]).fetchall()
        
        return {
            "filters": {
                "genre": genre,
                "start_year": start_year,
                "end_year": end_year,
                "min_votes": min_votes
            },
            "result_count": len(results),
            "movies": [
                {
                    "rank": idx + 1,
                    "tconst": row[0],
                    "title": row[1],
                    "year": row[2],
                    "genres": row[3],
                    "rating": round(row[4], 2),
                    "votes": row[5]
                }
                for idx, row in enumerate(results)
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/genre_analysis")
async def genre_analysis(
    title_type: str = Query("movie", description="'movie' or 'tvSeries'"),
    min_votes: int = Query(1000, description="Minimum votes threshold")
):
    """Analyze ratings by genre."""
    try:
        con = get_connection()
        
        # Get average ratings by genre
        results = con.execute("""
            SELECT 
                tb.genres,
                COUNT(*) as title_count,
                AVG(tr.averageRating) as avg_rating,
                MAX(tr.averageRating) as max_rating,
                MIN(tr.averageRating) as min_rating,
                SUM(tr.numVotes) as total_votes
            FROM title_basics tb
            JOIN title_ratings tr ON tb.tconst = tr.tconst
            WHERE tb.titleType = ?
                AND tr.numVotes >= ?
                AND tb.genres IS NOT NULL
                AND tb.genres != ''
            GROUP BY tb.genres
            ORDER BY avg_rating DESC
            LIMIT 50
        """, [title_type, min_votes]).fetchall()
        
        return {
            "title_type": title_type,
            "min_votes": min_votes,
            "genre_count": len(results),
            "genres": [
                {
                    "genres": row[0],
                    "title_count": row[1],
                    "avg_rating": round(row[2], 2) if row[2] else None,
                    "max_rating": round(row[3], 2) if row[3] else None,
                    "min_rating": round(row[4], 2) if row[4] else None,
                    "total_votes": row[5]
                }
                for row in results
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/decade_analysis")
async def decade_analysis(
    title_type: str = Query("movie", description="'movie' or 'tvSeries'"),
    min_votes: int = Query(1000, description="Minimum votes threshold")
):
    """Analyze rating trends by decade."""
    try:
        con = get_connection()
        
        results = con.execute("""
            SELECT 
                (tb.startYear / 10) * 10 as decade,
                COUNT(*) as title_count,
                AVG(tr.averageRating) as avg_rating,
                MAX(tr.averageRating) as max_rating,
                SUM(tr.numVotes) as total_votes
            FROM title_basics tb
            JOIN title_ratings tr ON tb.tconst = tr.tconst
            WHERE tb.titleType = ?
                AND tr.numVotes >= ?
                AND tb.startYear IS NOT NULL
                AND tb.startYear >= 1920
            GROUP BY decade
            ORDER BY decade DESC
        """, [title_type, min_votes]).fetchall()
        
        return {
            "title_type": title_type,
            "min_votes": min_votes,
            "decades": [
                {
                    "decade": f"{int(row[0])}s",
                    "decade_start": int(row[0]),
                    "title_count": row[1],
                    "avg_rating": round(row[2], 2) if row[2] else None,
                    "max_rating": round(row[3], 2) if row[3] else None,
                    "total_votes": row[4]
                }
                for row in results
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/browse_tv")
async def browse_tv(
    genre: Optional[str] = Query(None, description="Filter by genre"),
    start_year: Optional[int] = Query(None, description="Minimum start year"),
    end_year: Optional[int] = Query(None, description="Maximum start year"),
    min_rating: Optional[float] = Query(None, description="Minimum average rating"),
    max_rating: Optional[float] = Query(None, description="Maximum average rating"),
    min_votes: Optional[int] = Query(None, description="Minimum votes per episode"),
    min_seasons: Optional[int] = Query(None, description="Minimum number of seasons"),
    max_seasons: Optional[int] = Query(None, description="Maximum number of seasons"),
    offset: int = Query(0, description="Pagination offset"),
    limit: int = Query(20, description="Number of results", le=100)
):
    """Browse TV series ranked by quality score: ln(1 + avg_votes_per_episode) * avg_rating"""
    try:
        con = get_connection()
        
        conditions = ["tb.titleType = 'tvSeries'"]
        params = []
        
        if genre:
            conditions.append("LOWER(tb.genres) LIKE LOWER(?)")
            params.append(f"%{genre}%")
        
        if start_year:
            conditions.append("tb.startYear >= ?")
            params.append(start_year)
        
        if end_year:
            conditions.append("tb.startYear <= ?")
            params.append(end_year)
        
        where_clause = " AND ".join(conditions)
        
        # Build the main query with ranking
        query = f"""
            WITH series_stats AS (
                SELECT
                    tb.tconst,
                    tb.primaryTitle,
                    tb.startYear,
                    tb.endYear,
                    tb.genres,
                    COUNT(DISTINCT ep.episode_tconst) as total_episodes,
                    MAX(ep.seasonNumber) as total_seasons,
                    AVG(ep.averageRating) as avg_rating,
                    AVG(ep.numVotes) as avg_votes_per_episode
                FROM title_basics tb
                LEFT JOIN episode_panel ep ON tb.tconst = ep.series_tconst
                WHERE {where_clause}
                    AND ep.episode_tconst IS NOT NULL
                GROUP BY tb.tconst, tb.primaryTitle, tb.startYear, tb.endYear, tb.genres
                HAVING total_episodes > 0
        """
        
        having_conditions = []
        if min_rating:
            having_conditions.append("avg_rating >= ?")
            params.append(min_rating)
        if max_rating:
            having_conditions.append("avg_rating <= ?")
            params.append(max_rating)
        if min_votes:
            having_conditions.append("avg_votes_per_episode >= ?")
            params.append(min_votes)
        if min_seasons:
            having_conditions.append("total_seasons >= ?")
            params.append(min_seasons)
        if max_seasons:
            having_conditions.append("total_seasons <= ?")
            params.append(max_seasons)
        
        if having_conditions:
            query += " AND " + " AND ".join(having_conditions)
        
        query += """
            )
            SELECT 
                tconst,
                primaryTitle,
                startYear,
                endYear,
                genres,
                total_episodes,
                total_seasons,
                avg_rating,
                avg_votes_per_episode,
                LN(1 + avg_votes_per_episode) * avg_rating as rank_score
            FROM series_stats
            ORDER BY rank_score DESC
            LIMIT ? OFFSET ?
        """
        
        params.extend([limit, offset])
        results = con.execute(query, params).fetchall()
        
        # Get total count
        count_query = f"""
            WITH series_stats AS (
                SELECT
                    tb.tconst,
                    COUNT(DISTINCT ep.episode_tconst) as total_episodes,
                    MAX(ep.seasonNumber) as total_seasons,
                    AVG(ep.averageRating) as avg_rating,
                    AVG(ep.numVotes) as avg_votes_per_episode
                FROM title_basics tb
                LEFT JOIN episode_panel ep ON tb.tconst = ep.series_tconst
                WHERE {where_clause}
                    AND ep.episode_tconst IS NOT NULL
                GROUP BY tb.tconst
                HAVING total_episodes > 0
        """
        
        # Build count params - only WHERE clause params, not HAVING clause
        count_params = []
        if genre:
            count_params.append(f"%{genre}%")
        if start_year:
            count_params.append(start_year)
        if end_year:
            count_params.append(end_year)
        
        # Add having conditions
        count_having = []
        if min_rating:
            count_having.append("avg_rating >= ?")
            count_params.append(min_rating)
        if max_rating:
            count_having.append("avg_rating <= ?")
            count_params.append(max_rating)
        if min_votes:
            count_having.append("avg_votes_per_episode >= ?")
            count_params.append(min_votes)
        if min_seasons:
            count_having.append("total_seasons >= ?")
            count_params.append(min_seasons)
        if max_seasons:
            count_having.append("total_seasons <= ?")
            count_params.append(max_seasons)
        
        if count_having:
            count_query += " AND " + " AND ".join(count_having)
        
        count_query += ") SELECT COUNT(*) FROM series_stats"
        
        total_count = con.execute(count_query, count_params).fetchone()[0]
        
        return {
            "filters": {
                "genre": genre,
                "start_year": start_year,
                "end_year": end_year,
                "min_rating": min_rating,
                "max_rating": max_rating,
                "min_votes": min_votes,
                "min_seasons": min_seasons,
                "max_seasons": max_seasons
            },
            "total_count": total_count,
            "result_count": len(results),
            "offset": offset,
            "limit": limit,
            "series": [
                {
                    "rank": offset + idx + 1,
                    "rank_score": round(row[9], 2),
                    "tconst": row[0],
                    "title": row[1],
                    "years": f"{row[2]}-{row[3] if row[3] else 'Present'}",
                    "genres": row[4],
                    "avg_rating": round(row[7], 2),
                    "total_episodes": row[5],
                    "total_seasons": row[6],
                    "avg_votes_per_episode": int(row[8])
                }
                for idx, row in enumerate(results)
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/browse_movies")
async def browse_movies(
    genre: Optional[str] = Query(None, description="Filter by genre"),
    start_year: Optional[int] = Query(None, description="Minimum release year"),
    end_year: Optional[int] = Query(None, description="Maximum release year"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    max_rating: Optional[float] = Query(None, description="Maximum rating"),
    min_votes: Optional[int] = Query(None, description="Minimum number of votes"),
    offset: int = Query(0, description="Pagination offset"),
    limit: int = Query(20, description="Number of results", le=100)
):
    """Browse movies ranked by quality score: ln(1 + total_votes) * rating"""
    try:
        con = get_connection()
        
        conditions = ["tb.titleType = 'movie'", "tr.averageRating IS NOT NULL", "tr.numVotes IS NOT NULL"]
        params = []
        
        if genre:
            conditions.append("LOWER(tb.genres) LIKE LOWER(?)")
            params.append(f"%{genre}%")
        
        if start_year:
            conditions.append("tb.startYear >= ?")
            params.append(start_year)
        
        if end_year:
            conditions.append("tb.startYear <= ?")
            params.append(end_year)
        
        if min_rating:
            conditions.append("tr.averageRating >= ?")
            params.append(min_rating)
        
        if max_rating:
            conditions.append("tr.averageRating <= ?")
            params.append(max_rating)
        
        if min_votes:
            conditions.append("tr.numVotes >= ?")
            params.append(min_votes)
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
            SELECT 
                tb.tconst,
                tb.primaryTitle,
                tb.startYear,
                tb.genres,
                tr.averageRating,
                tr.numVotes,
                LN(1 + CAST(tr.numVotes AS DOUBLE)) * tr.averageRating as rank_score
            FROM title_basics tb
            JOIN title_ratings tr ON tb.tconst = tr.tconst
            WHERE {where_clause}
            ORDER BY rank_score DESC
            LIMIT ? OFFSET ?
        """
        
        params.extend([limit, offset])
        results = con.execute(query, params).fetchall()
        
        # Get total count
        count_params = params[:-2]  # Remove limit and offset
        count_query = f"""
            SELECT COUNT(*)
            FROM title_basics tb
            JOIN title_ratings tr ON tb.tconst = tr.tconst
            WHERE {where_clause}
        """
        total_count = con.execute(count_query, count_params).fetchone()[0]
        
        return {
            "filters": {
                "genre": genre,
                "start_year": start_year,
                "end_year": end_year,
                "min_rating": min_rating,
                "max_rating": max_rating,
                "min_votes": min_votes
            },
            "total_count": total_count,
            "result_count": len(results),
            "offset": offset,
            "limit": limit,
            "movies": [
                {
                    "rank": offset + idx + 1,
                    "rank_score": round(row[6], 2),
                    "tconst": row[0],
                    "title": row[1],
                    "year": row[2],
                    "genres": row[3],
                    "rating": round(row[4], 2),
                    "votes": row[5]
                }
                for idx, row in enumerate(results)
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ranked_tv")
async def ranked_tv(
    limit: int = Query(20, description="Number of results", le=100)
):
    """Get top-ranked TV series by quality score"""
    return await browse_tv(
        genre=None,
        start_year=None,
        end_year=None,
        min_rating=None,
        max_rating=None,
        min_votes=None,
        min_seasons=None,
        max_seasons=None,
        offset=0,
        limit=limit
    )


@app.get("/ranked_movies")
async def ranked_movies(
    limit: int = Query(20, description="Number of results", le=100)
):
    """Get top-ranked movies by quality score"""
    return await browse_movies(
        genre=None,
        start_year=None,
        end_year=None,
        min_rating=None,
        max_rating=None,
        min_votes=None,
        offset=0,
        limit=limit
    )


@app.get("/series_episode_graph")
async def series_episode_graph(
    series: str = Query(..., description="Series name"),
    scale: str = Query("auto", description="Scale mode: auto, 0-10, or autoscale")
):
    """Get episode data optimized for graphing with trendlines and season statistics"""
    try:
        con = get_connection()
        
        # Resolve series
        series_result = con.execute("""
            SELECT tconst, primaryTitle
            FROM title_basics
            WHERE titleType = 'tvSeries'
                AND LOWER(primaryTitle) = LOWER(?)
            LIMIT 1
        """, [series]).fetchone()
        
        if not series_result:
            raise HTTPException(status_code=404, detail=f"Series not found: {series}")
        
        tconst, title = series_result
        
        # Get all episodes
        episodes_data = con.execute("""
            SELECT
                seasonNumber,
                episodeNumber,
                episode_title,
                averageRating,
                numVotes,
                episode_tconst
            FROM episode_panel
            WHERE series_tconst = ?
            ORDER BY seasonNumber, episodeNumber
        """, [tconst]).fetchall()
        
        if not episodes_data:
            raise HTTPException(status_code=404, detail=f"No episodes found for: {title}")
        
        # Build episodes list with indices
        episodes = []
        episode_index = 0
        for row in episodes_data:
            episodes.append({
                "season": row[0],
                "episode": row[1],
                "title": row[2],
                "rating": row[3],
                "votes": row[4],
                "tconst": row[5],
                "episode_index": episode_index
            })
            episode_index += 1
        
        # Calculate per-season statistics and trendlines
        seasons_data = {}
        for ep in episodes:
            season_num = ep["season"]
            if season_num not in seasons_data:
                seasons_data[season_num] = []
            seasons_data[season_num].append(ep)
        
        seasons = []
        min_rating = float('inf')
        max_rating = float('-inf')
        
        # Collect all ratings for overall trendline
        all_indices = []
        all_ratings = []
        
        for season_num in sorted(seasons_data.keys()):
            season_eps = seasons_data[season_num]
            ratings = [ep["rating"] for ep in season_eps]
            indices = [ep["episode_index"] for ep in season_eps]
            
            all_indices.extend(indices)
            all_ratings.extend(ratings)
            
            avg_rating = sum(ratings) / len(ratings)
            min_rating = min(min_rating, min(ratings))
            max_rating = max(max_rating, max(ratings))
            
            # Calculate linear trendline for season: y = mx + b
            n = len(indices)
            if n > 1:
                mean_x = sum(indices) / n
                mean_y = sum(ratings) / n
                
                numerator = sum((indices[i] - mean_x) * (ratings[i] - mean_y) for i in range(n))
                denominator = sum((indices[i] - mean_x) ** 2 for i in range(n))
                
                if denominator != 0:
                    slope = numerator / denominator
                    intercept = mean_y - slope * mean_x
                else:
                    slope = 0
                    intercept = mean_y
            else:
                slope = 0
                intercept = ratings[0]
            
            seasons.append({
                "season": season_num,
                "episode_count": len(season_eps),
                "avg_rating": round(avg_rating, 2),
                "start_index": season_eps[0]["episode_index"],
                "end_index": season_eps[-1]["episode_index"],
                "trendline": {
                    "slope": round(slope, 4),
                    "intercept": round(intercept, 2)
                }
            })
        
        # Calculate overall trendline
        n = len(all_indices)
        if n > 1:
            mean_x = sum(all_indices) / n
            mean_y = sum(all_ratings) / n
            
            numerator = sum((all_indices[i] - mean_x) * (all_ratings[i] - mean_y) for i in range(n))
            denominator = sum((all_indices[i] - mean_x) ** 2 for i in range(n))
            
            if denominator != 0:
                overall_slope = numerator / denominator
                overall_intercept = mean_y - overall_slope * mean_x
            else:
                overall_slope = 0
                overall_intercept = mean_y
        else:
            overall_slope = 0
            overall_intercept = all_ratings[0] if all_ratings else 0
        
        return {
            "series": title,
            "tconst": tconst,
            "scale": scale,
            "episodes": episodes,
            "seasons": seasons,
            "overall_trendline": {
                "slope": round(overall_slope, 4),
                "intercept": round(overall_intercept, 2)
            },
            "rating_range": {
                "min": round(min_rating, 1),
                "max": round(max_rating, 1)
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, log_level="info")

