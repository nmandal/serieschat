# IMDb Tools Integration Setup

This chat app now includes powerful tools for querying IMDb TV series data through a local DuckDB database and FastAPI backend.

## Prerequisites

Before using the IMDb tools, you need to set up the FastAPI backend:

### 1. Python Environment

The FastAPI server is located in `../serieschat-api`. Make sure it's set up:

```bash
cd ../serieschat-api

# Create and activate virtual environment (if not already done)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Build the DuckDB Database

If you haven't already built the IMDb database:

```bash
cd ../serieschat-api
source .venv/bin/activate
python 01_build_imdb_duckdb.py
```

This will create `imdb.duckdb` with:
- 12M+ titles
- 1.6M+ ratings
- 817K+ rated episodes
- 202K+ TV series

**Note:** This process downloads IMDb datasets (~9GB) and may take some time.

### 3. Verify the API

Test that the FastAPI server works:

```bash
cd ../serieschat-api
source .venv/bin/activate
uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000

# In another terminal, test the health endpoint:
curl http://127.0.0.1:8000/health
```

## Running the Chat App with IMDb Tools

### Start Both Servers

From the `chat-app` directory, run:

```bash
pnpm install  # Install concurrently if you haven't already
pnpm dev
```

This will start both:
- Next.js chat app on `http://localhost:3000`
- FastAPI IMDb server on `http://127.0.0.1:8000`

### Run Servers Separately (Optional)

If you prefer to run servers separately:

```bash
# Terminal 1 - Chat app only
pnpm dev:chat

# Terminal 2 - API server only
pnpm dev:api
```

## Available IMDb Tools

The chat app now has access to **12 powerful IMDb tools** for comprehensive TV analysis:

### Basic Tools

#### 1. Resolve Series
Find TV series by name and get metadata.

**Example queries:**
- "Find information about Breaking Bad"
- "What years did The Wire air?"
- "Tell me about Game of Thrones"

#### 2. Get Episodes
Retrieve all episodes with ratings for a series.

**Example queries:**
- "Show me all Breaking Bad episodes and their ratings"
- "What are the ratings for each season of The Sopranos?"
- "Give me episode data for Stranger Things"

#### 3. Get Top Episodes
Get ranked episodes using IMDb's weighted rating formula.

**Example queries:**
- "What are the best episodes of Breaking Bad?"
- "Show me the top 5 episodes of Game of Thrones"
- "Which The Wire episodes are most highly rated?"

#### 4. Check IMDb Health
Verify the database and API are functioning.

**Example queries:**
- "Is the IMDb database working?"
- "Check IMDb status"

### Advanced Tools

#### 5. Search Series
Advanced search with multiple filters (name, genre, year, rating).

**Example queries:**
- "Find crime dramas from the 2000s with ratings above 8.5"
- "Search for sci-fi series that started after 2010"
- "Show me comedy series"
- "Find thriller shows with high ratings"

#### 6. Compare Series
Compare multiple TV series side-by-side with detailed statistics.

**Example queries:**
- "Compare Breaking Bad, The Wire, and The Sopranos"
- "Which is better: Game of Thrones or House of the Dragon?"
- "Compare all Star Trek series"
- "How does Better Call Saul compare to Breaking Bad?"

#### 7. Series Analytics
Get comprehensive analytics: trends, distribution, consistency, finales.

**Example queries:**
- "Give me detailed analytics for Breaking Bad"
- "Analyze the quality trends of Game of Thrones"
- "Show me rating distribution for The Office"
- "How consistent is The Wire's quality?"

#### 8. Worst Episodes
Find the lowest-rated episodes (useful for understanding quality dips).

**Example queries:**
- "What are the worst episodes of Game of Thrones?"
- "Show me the lowest-rated Walking Dead episodes"
- "Which Breaking Bad episodes are considered worst?"
- "Find the most criticized episodes of Dexter"

## Example Conversations

### Basic Query
```
You: What are the best episodes of Breaking Bad?

AI: [Calls getTopEpisodes tool]
The top episodes of Breaking Bad are:
1. S05E14 "Ozymandias" - 10.0/10 (267,735 votes)
2. S05E16 "Felina" - 9.9/10 (170,331 votes)
3. S04E13 "Face Off" - 9.9/10 (92,699 votes)
[Shows interactive visualization with hover effects]
```

### Advanced Search
```
You: Find me crime dramas from the 2000s with ratings above 8.5

AI: [Calls searchSeries tool]
Found 15 highly-rated crime dramas from 2000-2009:
- The Wire (2002-2008) - 9.3/10 ★
- Breaking Bad (2008-2013) - 8.9/10 ★
- The Sopranos (1999-2007) - 9.2/10 ★
[Shows grid of results with genres and stats]
```

### Series Comparison
```
You: Compare Breaking Bad, The Wire, and The Sopranos

AI: [Calls compareSeries tool]
[Shows beautiful comparison dashboard with:]
- Side-by-side ratings, episodes, seasons
- Best & worst episodes for each
- Rating ranges and consistency
- Visual winner badge for highest-rated
```

### Deep Analytics
```
You: Analyze the quality trends of Game of Thrones

AI: [Calls seriesAnalytics tool]
[Shows comprehensive analytics dashboard:]
- Overall: 8.74/10 avg, 0.82 consistency score
- Season trends graph showing S4 peak (9.35) and S8 drop (6.23)
- Rating distribution histogram
- Season finale analysis
```

### Quality Investigation
```
You: What are the worst episodes of The Walking Dead and why?

AI: [Calls worstEpisodes tool]
The lowest-rated episodes reveal patterns:
1. S08E06 "The King, the Widow..." - 4.9/10
2. S07E01 "The Day Will Come..." - 5.4/10
[Shows detailed breakdown with vote counts]
These episodes share common issues: pacing problems and controversial plot choices.
```

## Troubleshooting

### "Failed to connect to IMDb API"

The FastAPI server isn't running. Make sure:
1. The API server is started: `pnpm dev:api` or `pnpm dev`
2. It's running on port 8000: `http://127.0.0.1:8000/health`

### "Series not found"

- Check the spelling of the series name
- Try variations (e.g., "GOT" vs "Game of Thrones")
- The series must be in the IMDb database (major TV series are included)

### "Database not found"

Run the database build script:
```bash
cd ../serieschat-api
source .venv/bin/activate
python 01_build_imdb_duckdb.py
```

### Python Virtual Environment Issues

Make sure you're in the virtual environment:
```bash
cd ../serieschat-api
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
which python  # Should show path to .venv/bin/python
```

## Technical Details

### API Endpoints

The FastAPI server exposes these endpoints:

**Basic Endpoints:**
- `GET /health` - Health check
- `GET /resolve_series?name={name}` - Find series
- `GET /episodes?series={name}` - Get all episodes
- `GET /top_episodes?series={name}&min_votes={n}&limit={k}` - Top episodes

**Advanced Endpoints:**
- `GET /search_series?query={q}&genre={g}&start_year={y}&min_rating={r}` - Advanced search
- `GET /compare_series?series_names={comma_separated}` - Compare multiple series
- `GET /series_analytics?series={name}` - Comprehensive analytics
- `GET /worst_episodes?series={name}&min_votes={n}&limit={k}` - Worst episodes

### Weighted Rating Formula

The `getTopEpisodes` tool uses IMDb's weighted rating formula:

```
WR = (v/(v+m)) * R + (m/(v+m)) * C
```

Where:
- `v` = number of votes for the episode
- `m` = minimum votes threshold (default: 1000)
- `R` = average rating for the episode
- `C` = mean rating across all episodes in the series

This prevents episodes with few votes from dominating rankings.

### Data Freshness

The IMDb data is downloaded from https://datasets.imdbws.com/. To update:

```bash
cd ../serieschat-api
source .venv/bin/activate
rm imdb.duckdb  # Remove old database
python 01_build_imdb_duckdb.py  # Rebuild with fresh data
```

## Further Reading

- See `../serieschat-api/README.md` for API documentation
- See `../serieschat-api/LLM_INTEGRATION.md` for detailed tool examples
- See `../serieschat-api/QUICKSTART.md` for API quickstart guide

## Advanced Features Summary

### What You Can Do Now

**Discovery & Search:**
- Find series by genre, year, or rating
- Search for shows matching specific criteria
- Discover highly-rated series in any category

**Analysis & Insights:**
- Deep-dive analytics on any series
- Rating trends and consistency metrics
- Season-by-season quality analysis
- Finale performance tracking

**Comparisons:**
- Side-by-side series comparisons
- Best/worst episode identification
- Rating ranges and vote counts
- Genre and year span analysis

**Quality Investigation:**
- Find both best AND worst episodes
- Understand quality dips in series
- Identify controversial episodes
- Analyze voting patterns

### Visualization Features

All tools include beautiful, interactive visualizations:
- **Hover effects** revealing detailed stats
- **Progress bars** showing ratings visually
- **Color coding** for trends (green=improved, red=declined)
- **Trophy badges** for highest-rated content
- **Expandable sections** for episode lists
- **Dark mode support** throughout

## Support

If you encounter issues:
1. Check the FastAPI server logs in the terminal
2. Verify the database exists: `ls -lh ../serieschat-api/imdb.duckdb`
3. Test the API directly: `curl http://127.0.0.1:8000/health`
4. Check Python dependencies: `pip list` (should include fastapi, duckdb, uvicorn)
5. Try the interactive API docs: `http://127.0.0.1:8000/docs`

