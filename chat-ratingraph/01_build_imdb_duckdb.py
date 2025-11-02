#!/usr/bin/env python3
"""
Build IMDb DuckDB database from TSV files.

Loads title.basics.tsv, title.ratings.tsv, and title.episode.tsv
into a DuckDB database with optimized indexes and views.
"""

import os
import sys
import duckdb
from pathlib import Path


def main():
    # Get the directory containing TSV files (current directory by default)
    imdb_dir = os.getenv("IMDB_DIR", ".")
    imdb_path = Path(imdb_dir).expanduser().resolve()
    
    print(f"📂 Loading IMDb data from: {imdb_path}")
    
    # Check for required TSV files
    required_files = [
        "title.basics.tsv",
        "title.ratings.tsv",
        "title.episode.tsv"
    ]
    
    for filename in required_files:
        filepath = imdb_path / filename
        if not filepath.exists():
            print(f"❌ Missing required file: {filepath}")
            print(f"   Please ensure all TSV files are in {imdb_path}")
            sys.exit(1)
    
    # Connect to DuckDB (creates file if it doesn't exist)
    db_path = "imdb.duckdb"
    print(f"\n🦆 Creating DuckDB database: {db_path}")
    con = duckdb.connect(db_path)
    
    try:
        # Load title.basics
        print("\n📥 Loading title.basics.tsv...")
        basics_path = imdb_path / "title.basics.tsv"
        con.execute(f"""
            CREATE OR REPLACE TABLE title_basics AS
            SELECT
                tconst,
                titleType,
                primaryTitle,
                originalTitle,
                TRY_CAST(isAdult AS INTEGER) as isAdult,
                TRY_CAST(startYear AS INTEGER) as startYear,
                TRY_CAST(endYear AS INTEGER) as endYear,
                TRY_CAST(runtimeMinutes AS INTEGER) as runtimeMinutes,
                genres
            FROM read_csv_auto(
                '{basics_path}',
                delim='\t',
                header=true,
                nullstr='\\N',
                quote='',
                escape=''
            )
        """)
        
        count = con.execute("SELECT COUNT(*) FROM title_basics").fetchone()[0]
        print(f"   ✅ Loaded {count:,} titles")
        
        # Load title.ratings
        print("\n📥 Loading title.ratings.tsv...")
        ratings_path = imdb_path / "title.ratings.tsv"
        con.execute(f"""
            CREATE OR REPLACE TABLE title_ratings AS
            SELECT
                tconst,
                CAST(averageRating AS DOUBLE) as averageRating,
                CAST(numVotes AS INTEGER) as numVotes
            FROM read_csv_auto(
                '{ratings_path}',
                delim='\t',
                header=true,
                nullstr='\\N',
                quote='',
                escape=''
            )
        """)
        
        count = con.execute("SELECT COUNT(*) FROM title_ratings").fetchone()[0]
        print(f"   ✅ Loaded {count:,} ratings")
        
        # Load title.episode
        print("\n📥 Loading title.episode.tsv...")
        episode_path = imdb_path / "title.episode.tsv"
        con.execute(f"""
            CREATE OR REPLACE TABLE title_episode AS
            SELECT
                tconst,
                parentTconst,
                TRY_CAST(seasonNumber AS INTEGER) as seasonNumber,
                TRY_CAST(episodeNumber AS INTEGER) as episodeNumber
            FROM read_csv_auto(
                '{episode_path}',
                delim='\t',
                header=true,
                nullstr='\\N',
                quote='',
                escape=''
            )
        """)
        
        count = con.execute("SELECT COUNT(*) FROM title_episode").fetchone()[0]
        print(f"   ✅ Loaded {count:,} episodes")
        
        # Create indexes for performance
        print("\n🔍 Creating indexes...")
        con.execute("CREATE INDEX IF NOT EXISTS idx_basics_tconst ON title_basics(tconst)")
        con.execute("CREATE INDEX IF NOT EXISTS idx_basics_type ON title_basics(titleType)")
        con.execute("CREATE INDEX IF NOT EXISTS idx_ratings_tconst ON title_ratings(tconst)")
        con.execute("CREATE INDEX IF NOT EXISTS idx_episode_tconst ON title_episode(tconst)")
        con.execute("CREATE INDEX IF NOT EXISTS idx_episode_parent ON title_episode(parentTconst)")
        print("   ✅ Indexes created")
        
        # Create episode_panel view for easy querying
        print("\n🔗 Creating episode_panel view...")
        con.execute("""
            CREATE OR REPLACE VIEW episode_panel AS
            SELECT
                e.tconst as episode_tconst,
                e.parentTconst as series_tconst,
                e.seasonNumber,
                e.episodeNumber,
                eb.primaryTitle as episode_title,
                sb.primaryTitle as series_title,
                r.averageRating,
                r.numVotes
            FROM title_episode e
            LEFT JOIN title_basics eb ON e.tconst = eb.tconst
            LEFT JOIN title_basics sb ON e.parentTconst = sb.tconst
            LEFT JOIN title_ratings r ON e.tconst = r.tconst
            WHERE e.seasonNumber IS NOT NULL
                AND e.episodeNumber IS NOT NULL
                AND r.averageRating IS NOT NULL
                AND r.numVotes IS NOT NULL
        """)
        
        count = con.execute("SELECT COUNT(*) FROM episode_panel").fetchone()[0]
        print(f"   ✅ Episode panel created with {count:,} episodes")
        
        # Show some stats
        print("\n📊 Database Statistics:")
        
        series_count = con.execute("""
            SELECT COUNT(DISTINCT parentTconst) 
            FROM title_episode 
            WHERE seasonNumber IS NOT NULL
        """).fetchone()[0]
        print(f"   • TV Series with episodes: {series_count:,}")
        
        top_series = con.execute("""
            SELECT series_title, COUNT(*) as episode_count
            FROM episode_panel
            GROUP BY series_title
            ORDER BY episode_count DESC
            LIMIT 5
        """).fetchall()
        
        print("\n   Top 5 series by episode count:")
        for title, count in top_series:
            print(f"      - {title}: {count} episodes")
        
        print(f"\n✅ Database successfully created: {db_path}")
        print(f"   Ready to query! Try: python 02_chart_series.py \"<series name>\"")
        
    except Exception as e:
        print(f"\n❌ Error creating database: {e}")
        sys.exit(1)
    finally:
        con.close()


if __name__ == "__main__":
    main()

