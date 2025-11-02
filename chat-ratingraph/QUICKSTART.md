# Quick Start Guide

## ✅ Setup Complete!

Your IMDb data pipeline is now fully operational.

### Database Status
- **Database**: `imdb.duckdb` (created)
- **Titles**: 12,015,202
- **Ratings**: 1,630,284
- **Episodes with ratings**: 817,600
- **TV Series**: 202,937

### API Server
Currently running at: http://127.0.0.1:8000

#### Try These Endpoints:

**Health Check:**
```bash
curl http://127.0.0.1:8000/health
```

**Find a Series:**
```bash
curl "http://127.0.0.1:8000/resolve_series?name=Breaking%20Bad"
```

**Get All Episodes:**
```bash
curl "http://127.0.0.1:8000/episodes?series=Breaking%20Bad" | jq
```

**Top Episodes (Weighted Rankings):**
```bash
curl "http://127.0.0.1:8000/top_episodes?series=Breaking%20Bad&min_votes=5000&limit=10" | jq
```

### Generate Charts

```bash
# Activate virtual environment
source .venv/bin/activate

# Generate charts for any series
python3 02_chart_series.py "Breaking Bad"
python3 02_chart_series.py "Game of Thrones"
python3 02_chart_series.py "The Wire"
python3 02_chart_series.py "Stranger Things"
```

Charts are saved to: `charts/`

### Example Results

**Breaking Bad:**
- 62 episodes across 5 seasons
- Average rating: 8.96/10
- Highest: S05E14 "Ozymandias" (10.0/10)
- Lowest: S03E10 "Fly" (8.0/10)

**Game of Thrones:**
- 73 episodes across 8 seasons
- Average rating: 8.74/10
- Highest: S03E09 "The Rains of Castamere" (9.9/10)
- Lowest: S08E06 "The Iron Throne" (4.0/10)

### Restart API Server

If you need to restart the API server:

```bash
cd /Users/nick/code/chat-ratingraph
source .venv/bin/activate
uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000 --reload
```

### Next Steps

1. **Explore the API**: Visit http://127.0.0.1:8000/docs for interactive API documentation
2. **Generate more charts**: Try different series names
3. **Query the database**: Use DuckDB CLI or Python to run custom queries
4. **Expand**: Add semantic search (see README.md for future enhancements)

### Access DuckDB Directly

```bash
source .venv/bin/activate
python3 -c "import duckdb; con = duckdb.connect('imdb.duckdb'); print(con.execute('SELECT * FROM episode_panel LIMIT 5').df())"
```

### Troubleshooting

**Rebuild database:**
```bash
python3 01_build_imdb_duckdb.py
```

**Check API logs:**
The server will display logs in the terminal where it's running.

---

🎉 Everything is ready to use!

