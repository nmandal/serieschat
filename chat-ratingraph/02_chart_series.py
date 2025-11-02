#!/usr/bin/env python3
"""
Generate Ratingraph-style episode rating charts for TV series.

Usage:
    python 02_chart_series.py "Game of Thrones"
    python 02_chart_series.py "Breaking Bad"
"""

import sys
import duckdb
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from pathlib import Path


def resolve_series(con, series_name):
    """Find series tconst by name."""
    result = con.execute("""
        SELECT tconst, primaryTitle, startYear, endYear
        FROM title_basics
        WHERE titleType = 'tvSeries'
            AND LOWER(primaryTitle) = LOWER(?)
        LIMIT 1
    """, [series_name]).fetchone()
    
    if result:
        return {
            'tconst': result[0],
            'title': result[1],
            'startYear': result[2],
            'endYear': result[3]
        }
    return None


def get_episodes(con, series_tconst):
    """Get all episodes with ratings for a series."""
    episodes = con.execute("""
        SELECT
            seasonNumber,
            episodeNumber,
            episode_title,
            averageRating,
            numVotes
        FROM episode_panel
        WHERE series_tconst = ?
        ORDER BY seasonNumber, episodeNumber
    """, [series_tconst]).fetchall()
    
    return [
        {
            'season': row[0],
            'episode': row[1],
            'title': row[2],
            'rating': row[3],
            'votes': row[4]
        }
        for row in episodes
    ]


def plot_series_ratings(series_info, episodes, output_path):
    """Create a Ratingraph-style chart."""
    if not episodes:
        print("❌ No episodes found with ratings")
        return
    
    # Organize by season
    seasons = {}
    for ep in episodes:
        season = ep['season']
        if season not in seasons:
            seasons[season] = []
        seasons[season].append(ep)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(14, 7))
    
    # Color palette for seasons
    colors = plt.cm.tab20.colors
    
    # Plot each season
    x_offset = 0
    legend_handles = []
    
    for season_num in sorted(seasons.keys()):
        season_episodes = seasons[season_num]
        color = colors[season_num % len(colors)]
        
        # Plot points
        x_positions = [x_offset + i for i in range(len(season_episodes))]
        ratings = [ep['rating'] for ep in season_episodes]
        
        ax.plot(x_positions, ratings, 'o-', color=color, 
                linewidth=2, markersize=8, alpha=0.8)
        
        # Add season to legend
        patch = mpatches.Patch(color=color, label=f'Season {season_num}')
        legend_handles.append(patch)
        
        x_offset += len(season_episodes)
    
    # Styling
    title = series_info['title']
    year_range = f"{series_info['startYear']}"
    if series_info['endYear']:
        year_range += f"-{series_info['endYear']}"
    
    ax.set_title(f"{title} ({year_range}) - Episode Ratings", 
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel('Episode (Sequential)', fontsize=12)
    ax.set_ylabel('IMDb Rating', fontsize=12)
    ax.set_ylim(0, 10)
    ax.grid(True, alpha=0.3, linestyle='--')
    ax.legend(handles=legend_handles, loc='best', ncol=3, fontsize=9)
    
    # Add average line
    avg_rating = sum(ep['rating'] for ep in episodes) / len(episodes)
    ax.axhline(y=avg_rating, color='red', linestyle='--', 
               alpha=0.5, linewidth=1.5, label=f'Average: {avg_rating:.2f}')
    
    plt.tight_layout()
    
    # Save chart
    output_path.parent.mkdir(exist_ok=True)
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"✅ Chart saved: {output_path}")
    
    # Show stats
    print(f"\n📊 Statistics:")
    print(f"   • Total episodes: {len(episodes)}")
    print(f"   • Seasons: {len(seasons)}")
    print(f"   • Average rating: {avg_rating:.2f}")
    
    best_ep = max(episodes, key=lambda e: e['rating'])
    print(f"   • Highest rated: S{best_ep['season']:02d}E{best_ep['episode']:02d} "
          f"\"{best_ep['title']}\" ({best_ep['rating']}/10)")
    
    worst_ep = min(episodes, key=lambda e: e['rating'])
    print(f"   • Lowest rated: S{worst_ep['season']:02d}E{worst_ep['episode']:02d} "
          f"\"{worst_ep['title']}\" ({worst_ep['rating']}/10)")


def main():
    if len(sys.argv) < 2:
        print("Usage: python 02_chart_series.py \"<series name>\"")
        print("\nExamples:")
        print("  python 02_chart_series.py \"Game of Thrones\"")
        print("  python 02_chart_series.py \"Breaking Bad\"")
        sys.exit(1)
    
    series_name = sys.argv[1]
    db_path = "imdb.duckdb"
    
    if not Path(db_path).exists():
        print(f"❌ Database not found: {db_path}")
        print("   Run: python 01_build_imdb_duckdb.py")
        sys.exit(1)
    
    print(f"🔍 Searching for: {series_name}")
    
    con = duckdb.connect(db_path, read_only=True)
    
    try:
        # Resolve series
        series_info = resolve_series(con, series_name)
        if not series_info:
            print(f"❌ Series not found: {series_name}")
            print("\n💡 Try searching in the database:")
            print(f"   SELECT primaryTitle FROM title_basics")
            print(f"   WHERE titleType = 'tvSeries'")
            print(f"   AND primaryTitle LIKE '%{series_name}%'")
            sys.exit(1)
        
        print(f"✅ Found: {series_info['title']} ({series_info['startYear']})")
        
        # Get episodes
        print(f"📺 Loading episodes...")
        episodes = get_episodes(con, series_info['tconst'])
        
        if not episodes:
            print(f"❌ No rated episodes found for {series_info['title']}")
            sys.exit(1)
        
        # Generate chart
        safe_name = series_info['title'].replace('/', '_').replace(' ', '_')
        output_path = Path('charts') / f"series_ratings_{safe_name}.png"
        plot_series_ratings(series_info, episodes, output_path)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        con.close()


if __name__ == "__main__":
    main()

