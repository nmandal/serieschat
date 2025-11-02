# SeriesChat 🎬 🤖

> An intelligent AI chatbot with comprehensive IMDb integration for TV series and movie analysis

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-brightgreen.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

**Live Demos:**
- **Chat Interface**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/nmandal/serieschat)
- **IMDb API**: https://chat-ratingraph.fly.dev

---

## 🎯 What is SeriesChat?

SeriesChat combines a powerful AI chatbot with a specialized IMDb data API to deliver intelligent, data-driven conversations about TV series and movies. Ask natural language questions and get instant insights powered by 12+ million IMDb titles.

### ✨ Key Features

- **🤖 AI-Powered Chat** - Natural language queries powered by advanced LLMs (xAI Grok, OpenAI GPT-4)
- **📊 Rich Analytics** - Episode rankings, quality trends, season comparisons
- **🎬 Movie Analysis** - Advanced search, filtering, and recommendations
- **📈 Beautiful Visualizations** - Interactive charts and rating graphs
- **⚡ Lightning Fast** - DuckDB analytical queries on 12M+ titles
- **🌙 Modern UI** - Responsive design with dark mode
- **🔐 Secure** - User authentication and private chat history

---

## 🏗️ Architecture

This monorepo contains two main applications:

```
serieschat/
├── chat-ratingraph/     # FastAPI + DuckDB Backend
│   ├── 03_serve_api.py # 19 REST API endpoints
│   ├── imdb.duckdb     # 1.8GB analytical database
│   └── ...
│
└── chat-app/            # Next.js Frontend
    ├── app/             # Next.js 15 App Router
    ├── components/      # React components
    ├── lib/ai/          # AI SDK + IMDb tools
    └── ...
```

### Technology Stack

**Backend (chat-ratingraph)**
- FastAPI - Modern Python web framework
- DuckDB - Embedded analytical database
- Uvicorn - ASGI server
- Docker - Containerization
- Fly.io - Deployment

**Frontend (chat-app)**
- Next.js 15 - React framework with App Router
- Vercel AI SDK - LLM integration
- TypeScript - Type safety
- Tailwind CSS - Styling
- PostgreSQL - User data
- Vercel - Deployment

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm
- 11GB disk space (for IMDb datasets)
- PostgreSQL (for frontend)

### 1. Clone the Repository

```bash
git clone https://github.com/nmandal/serieschat.git
cd serieschat
```

### 2. Start the Backend (FastAPI)

```bash
cd chat-ratingraph

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download and build IMDb database (~15-30 minutes)
python 01_build_imdb_duckdb.py

# Start API server
uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000 --reload
```

API will be available at http://127.0.0.1:8000

### 3. Start the Frontend (Next.js)

```bash
cd chat-app

# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev:chat
```

Chat app will be available at http://localhost:3000

### 4. Or Start Both Together

```bash
cd chat-app
pnpm dev  # Starts both chat app and API server
```

---

## 📖 Documentation

### Backend (chat-ratingraph)
- [README](chat-ratingraph/README.md) - Setup and features
- [API Reference](chat-ratingraph/API_REFERENCE.md) - Complete endpoint documentation
- [Data Setup](chat-ratingraph/DATA_SETUP.md) - IMDb dataset guide
- [Deployment](chat-ratingraph/DEPLOYMENT.md) - Fly.io deployment guide
- [Contributing](chat-ratingraph/CONTRIBUTING.md) - Development guidelines

### Frontend (chat-app)
- [README](chat-app/README.md) - Setup and features
- [Architecture](chat-app/ARCHITECTURE.md) - System design
- [Deployment](chat-app/DEPLOYMENT.md) - Vercel deployment guide
- [IMDb Setup](chat-app/IMDB_SETUP.md) - IMDb tool integration
- [Contributing](chat-app/CONTRIBUTING.md) - Development guidelines

---

## 🎬 Example Queries

Try asking SeriesChat:

```
"What are the best episodes of Breaking Bad?"
"Compare Game of Thrones with The Wire"
"Show me crime dramas from the 2000s with ratings above 8.5"
"Analyze the quality trends of Game of Thrones by season"
"Find the top sci-fi movies from 2010-2020"
"Which episodes of The Walking Dead are considered worst?"
```

---

## 🛠️ Development

### Backend Development

```bash
cd chat-ratingraph

# Activate virtual environment
source .venv/bin/activate

# Start with auto-reload
uvicorn 03_serve_api:app --reload

# View API docs
open http://127.0.0.1:8000/docs
```

### Frontend Development

```bash
cd chat-app

# Start dev server
pnpm dev:chat

# Run linting
pnpm lint

# Auto-fix issues
pnpm format

# Run tests
pnpm test
```

---

## 🚢 Deployment

### Backend → Fly.io

```bash
cd chat-ratingraph

# Install Fly CLI
brew install flyctl

# Login and deploy
flyctl auth login
flyctl launch --no-deploy
flyctl volumes create imdb_data --size 3
flyctl deploy
```

**Production API**: https://chat-ratingraph.fly.dev

### Frontend → Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nmandal/serieschat)

Or use Vercel CLI:
```bash
cd chat-app
vercel --prod
```

**Required Environment Variables:**
- `POSTGRES_URL` - Database connection string
- `AUTH_SECRET` - NextAuth secret
- `IMDB_API_URL` - Backend API URL (https://chat-ratingraph.fly.dev)

---

## 📊 IMDb API Endpoints

The backend provides 19 REST endpoints:

**TV Series**
- `/resolve_series` - Find series by name
- `/episodes` - Get all episodes with ratings
- `/top_episodes` - Top-ranked episodes (weighted)
- `/worst_episodes` - Lowest-rated episodes
- `/search_series` - Advanced search
- `/compare_series` - Compare multiple series
- `/series_analytics` - Comprehensive analytics
- `/series_episode_graph` - Rating visualizations

**Movies**
- `/search_movies` - Advanced movie search
- `/movie_details` - Movie information
- `/compare_movies` - Compare multiple movies
- `/top_movies` - Top-rated movies

**Browse & Analysis**
- `/browse_tv` - Browse TV series
- `/browse_movies` - Browse movies
- `/ranked_tv` - Top-ranked series
- `/ranked_movies` - Top-ranked movies
- `/genre_analysis` - Analysis by genre
- `/decade_analysis` - Analysis by decade

**System**
- `/health` - Health check

---

## 🎨 Features Showcase

### Intelligent Tool Calling

The AI automatically selects the right tools based on your query:

```typescript
// User: "Compare Breaking Bad with The Wire"
// → Calls compareSeries tool
// → Displays side-by-side comparison
// → Shows best/worst episodes for each
// → Visualizes rating ranges
```

### Rich Visualizations

- Episode rating graphs with season markers
- Rating distribution histograms
- Quality trend analysis
- Season-by-season comparisons
- Interactive charts with hover details

### Smart Analytics

- Weighted rating formulas (IMDb-style)
- Consistency scores
- Trend detection (improving/declining)
- Season finale analysis
- Vote-weighted rankings

---

## 📈 Statistics

### Database
- **12,015,202** total titles
- **1,600,000+** rated titles
- **817,000+** rated TV episodes
- **202,000+** TV series

### Performance
- **Sub-second** API response times
- **19** specialized endpoints
- **12** AI tools
- **50+** React components

---

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines for each project:

- [Backend Contributing Guide](chat-ratingraph/CONTRIBUTING.md)
- [Frontend Contributing Guide](chat-app/CONTRIBUTING.md)

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### IMDb Data License

This project uses IMDb's publicly available datasets, which are for **personal and non-commercial use only**. Attribution to IMDb is required when using this data.

- IMDb Datasets: https://datasets.imdbws.com/
- License: https://developer.imdb.com/non-commercial-datasets/

---

## 🙏 Acknowledgments

- **IMDb** for providing comprehensive public datasets
- **Vercel** for the AI SDK and hosting platform
- **Fly.io** for reliable container hosting
- **FastAPI** for the excellent web framework
- **DuckDB** for the powerful embedded database
- **Next.js** team for the amazing React framework

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/nmandal/serieschat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nmandal/serieschat/discussions)
- **Backend Docs**: [chat-ratingraph/README.md](chat-ratingraph/README.md)
- **Frontend Docs**: [chat-app/README.md](chat-app/README.md)

---

## 🗺️ Roadmap

- [x] FastAPI backend with DuckDB
- [x] 19 REST API endpoints
- [x] Next.js frontend with AI SDK
- [x] 12 specialized IMDb tools
- [x] Beautiful UI with dark mode
- [x] Production deployment (Fly.io + Vercel)
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Advanced recommendation engine
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Actor/crew search tools
- [ ] GraphQL API alternative

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! Your support helps others discover SeriesChat.

---

## 🔗 Links

- **Live API**: https://chat-ratingraph.fly.dev
- **API Documentation**: https://chat-ratingraph.fly.dev/docs
- **IMDb Datasets**: https://datasets.imdbws.com/
- **Vercel AI SDK**: https://ai-sdk.dev/
- **DuckDB**: https://duckdb.org/

---

**Made with ❤️ for TV and movie enthusiasts**

*Chat smarter about your favorite series and movies with AI-powered insights.*

