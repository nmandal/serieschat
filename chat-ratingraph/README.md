# SeriesChat API 📺

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.11+-brightgreen.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![DuckDB](https://img.shields.io/badge/DuckDB-1.4+-yellow.svg)](https://duckdb.org/)

> **Lightning-fast IMDb data API powering SeriesChat**
> 
> High-performance REST API for querying and analyzing 12M+ IMDb titles with DuckDB and FastAPI.

**Live API**: [https://chat-ratingraph.fly.dev](https://chat-ratingraph.fly.dev)  
**Frontend App**: [SeriesChat](https://github.com/USERNAME/serieschat)

---

## ✨ Features

- **🚀 Fast Queries** - DuckDB provides lightning-fast analytical queries on 12M+ titles
- **📊 Rich Analytics** - Comprehensive TV series analytics including trends, consistency scores, and season comparisons
- **🎯 Weighted Rankings** - IMDb-style weighted rating formula for fair episode rankings
- **🔍 Advanced Search** - Multi-filter search for TV series and movies (genre, year, rating)
- **📈 Data Visualization** - Episode rating graphs and ratingraph-style visualizations
- **🎬 Movie Support** - Search, compare, and analyze movies alongside TV series
- **🌐 RESTful API** - Clean, well-documented REST API with 19 endpoints
- **🐳 Docker Ready** - Containerized for easy deployment to any platform
- **☁️ Cloud Native** - Optimized for deployment on Fly.io with persistent storage

---

## 🎯 Quick Start

### Prerequisites

- Python 3.11 or higher
- 11GB free disk space (for IMDb datasets)
- pip and virtualenv

### Installation

```bash
# Clone the repository
git clone https://github.com/USERNAME/serieschat-api.git
cd serieschat-api

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Build the database (downloads and processes IMDb datasets)
python 01_build_imdb_duckdb.py

# Start the API server
uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at `http://127.0.0.1:8000`

### Quick Test

```bash
# Health check
curl http://127.0.0.1:8000/health

# Search for a series
curl "http://127.0.0.1:8000/resolve_series?name=Breaking%20Bad"

# Get top episodes
curl "http://127.0.0.1:8000/top_episodes?series=Breaking%20Bad&limit=5"
```

---

## 📖 API Documentation

### Core Endpoints

**TV Series**
- `GET /resolve_series` - Find series by name
- `GET /episodes` - Get all episodes with ratings
- `GET /top_episodes` - Top-ranked episodes (weighted rating)
- `GET /worst_episodes` - Lowest-rated episodes
- `GET /search_series` - Advanced series search
- `GET /compare_series` - Compare multiple series
- `GET /series_analytics` - Comprehensive analytics
- `GET /series_episode_graph` - Episode rating graph data

**Movies**
- `GET /search_movies` - Search movies with filters
- `GET /movie_details` - Get movie information
- `GET /compare_movies` - Compare multiple movies
- `GET /top_movies` - Top-rated movies

**Analysis**
- `GET /genre_analysis` - Rating analysis by genre
- `GET /decade_analysis` - Rating analysis by decade

**Browse**
- `GET /browse_tv` - Browse TV series
- `GET /browse_movies` - Browse movies
- `GET /ranked_tv` - Top-ranked TV series
- `GET /ranked_movies` - Top-ranked movies

**System**
- `GET /health` - Health check
- `GET /` - API information

For complete documentation, see [API_REFERENCE.md](API_REFERENCE.md)

### Interactive API Docs

Visit `http://127.0.0.1:8000/docs` for Swagger UI interactive documentation.

---

## 📊 Example Queries

### Get Top Episodes of Breaking Bad

```bash
curl "http://127.0.0.1:8000/top_episodes?series=Breaking%20Bad&min_votes=1000&limit=10"
```

**Response:**
```json
{
  "series": "Breaking Bad",
  "tconst": "tt0903747",
  "mean_rating": 8.95,
  "top_episodes": [
    {
      "title": "Ozymandias",
      "season": 5,
      "episode": 14,
      "averageRating": 10.0,
      "numVotes": 267735,
      "weightedRating": 9.998,
      "rank": 1
    },
    ...
  ]
}
```

### Compare Multiple Series

```bash
curl "http://127.0.0.1:8000/compare_series?series_names=Breaking%20Bad,The%20Wire,The%20Sopranos"
```

### Series Analytics

```bash
curl "http://127.0.0.1:8000/series_analytics?series=Game%20of%20Thrones"
```

### Search for Crime Dramas

```bash
curl "http://127.0.0.1:8000/search_series?genre=Drama&start_year=2000&min_rating=8.5"
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   FastAPI App   │  ← REST API (uvicorn)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   DuckDB File   │  ← imdb.duckdb (~1.8GB)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  IMDb Datasets  │  ← TSV files (~9GB)
└─────────────────┘
```

### Technology Stack

- **FastAPI** - Modern, high-performance web framework
- **DuckDB** - Embedded analytical database (like SQLite for analytics)
- **Uvicorn** - Lightning-fast ASGI server
- **Matplotlib** - Chart generation (optional)
- **Pandas** - Data processing

---

## 🗄️ Database Schema

The DuckDB database contains 3 main tables:

### `title_basics`
- `tconst` - Unique title identifier
- `titleType` - Type (movie, tvSeries, tvEpisode, etc.)
- `primaryTitle` - Main title
- `startYear` / `endYear` - Release years
- `genres` - Comma-separated genres

### `title_ratings`
- `tconst` - Title identifier
- `averageRating` - Weighted average of user ratings (0-10)
- `numVotes` - Number of votes

### `title_episode`
- `tconst` - Episode identifier
- `parentTconst` - Parent series identifier
- `seasonNumber` - Season number
- `episodeNumber` - Episode number within season

### `episode_panel` (View)
Pre-joined view combining episodes with ratings and series info for fast queries.

---

## 📈 Weighted Rating Formula

The API uses IMDb's Bayesian average formula for fair rankings:

```
WR = (v/(v+m)) * R + (m/(v+m)) * C
```

Where:
- `v` = number of votes for the episode
- `m` = minimum votes threshold (default: 1000)
- `R` = average rating for the episode
- `C` = mean rating across all episodes in the series

This prevents episodes with few votes from dominating rankings.

---

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build the image
docker build -t imdb-tv-api .

# Run the container
docker run -p 8000:8000 \
  -v $(pwd)/imdb.duckdb:/data/imdb.duckdb:ro \
  imdb-tv-api
```

### Using Docker Compose

```bash
docker-compose up
```

---

## ☁️ Deploy to Fly.io

The API is optimized for deployment on Fly.io with persistent volume storage.

```bash
# Install Fly CLI
brew install flyctl

# Authenticate
flyctl auth login

# Launch (first time)
flyctl launch --no-deploy

# Create persistent volume
flyctl volumes create imdb_data --size 3 --region ord

# Deploy
flyctl deploy

# Check status
flyctl status

# View logs
flyctl logs
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

**Production URL**: Your app will be at `https://your-app-name.fly.dev`

---

## 📦 Data Setup

The IMDb datasets are **not included** in this repository due to their size (~9GB uncompressed).

### Automatic Download

```bash
python 01_build_imdb_duckdb.py
```

The script automatically downloads, extracts, and builds the database.

### Manual Download

Download from [IMDb Datasets](https://datasets.imdbws.com/):
- `title.basics.tsv.gz` - Title information
- `title.ratings.tsv.gz` - Ratings
- `title.episode.tsv.gz` - TV episodes

For complete setup instructions, see [DATA_SETUP.md](DATA_SETUP.md)

---

## 🧪 Testing

```bash
# Install dev dependencies
pip install pytest pytest-cov httpx

# Run tests
pytest

# With coverage
pytest --cov=. --cov-report=html
```

---

## 🛠️ Development

### Project Structure

```
serieschat-api/
├── 01_build_imdb_duckdb.py   # Database builder
├── 02_chart_series.py         # Chart generation
├── 03_serve_api.py            # FastAPI application
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container config
├── docker-compose.yml         # Local development
├── fly.toml                   # Fly.io config
├── .env.example               # Environment template
├── DATA_SETUP.md             # Data download guide
├── API_REFERENCE.md          # Complete API docs
└── CONTRIBUTING.md           # Contribution guidelines
```

### Environment Variables

Create a `.env` file (see `.env.example`):

```bash
DB_PATH=./imdb.duckdb
CORS_ORIGIN=http://localhost:3000
ENVIRONMENT=development
LOG_LEVEL=info
```

### Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint
flake8 .
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### IMDb Data License

This project uses IMDb's publicly available datasets, which are for **personal and non-commercial use only**. You must attribute IMDb when using this data.

- IMDb Datasets: https://datasets.imdbws.com/
- IMDb Data Usage: https://developer.imdb.com/non-commercial-datasets/

---

## 🙏 Acknowledgments

- **IMDb** for providing public datasets
- **DuckDB** for the amazing embedded database
- **FastAPI** for the excellent web framework
- **Vercel** for the AI SDK and hosting

---

## 📊 Statistics

- **12M+ titles** in the database
- **1.6M+ rated titles**
- **817K+ rated TV episodes**
- **202K+ TV series**
- **19 API endpoints**
- **Sub-second query response times**

---

## 🔗 Related Projects

- [SeriesChat](https://github.com/USERNAME/serieschat) - Next.js chat interface using this API
- [Ratingraph](https://ratingraph.com/) - Inspiration for episode rating visualizations

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/USERNAME/serieschat-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/USERNAME/serieschat-api/discussions)
- **Documentation**: See [API_REFERENCE.md](API_REFERENCE.md) and [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🗺️ Roadmap

- [ ] Add authentication and rate limiting
- [ ] Implement caching layer (Redis)
- [ ] Add more analytical endpoints
- [ ] Support for actor/crew search
- [ ] GraphQL API
- [ ] WebSocket support for real-time updates
- [ ] Multi-language support
- [ ] Recommendation engine

---

Made with ❤️ for TV and movie enthusiasts
