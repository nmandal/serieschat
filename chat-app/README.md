# SeriesChat 🎬

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000)](https://vercel.com)

> **Chat with IMDb. Visualize quality. Discover greatness.**
> 
> AI-powered TV & movie discovery with 12M+ titles, episode rating graphs, and intelligent insights.

**Live Demo**: [https://serieschat.vercel.app](https://serieschat.vercel.app)  
**API Backend**: [SeriesChat API](https://github.com/USERNAME/serieschat-api)

---

## ✨ Features

### 🤖 AI-Powered Chat
- **Multiple AI Models** - xAI (Grok), OpenAI (GPT-4), and more via Vercel AI Gateway
- **Streaming Responses** - Real-time token streaming for instant feedback
- **Context Awareness** - Maintains conversation history and context
- **Tool Calling** - Automatically invokes IMDb tools based on user queries

### 🎬 IMDb Integration (12 Tools)
- **TV Series Analysis** - Episode rankings, trends, and comparisons
- **Movie Search** - Advanced filtering by genre, year, and rating
- **Data Visualization** - Interactive charts and graphs
- **Comparative Analysis** - Compare multiple series or movies side-by-side
- **Comprehensive Analytics** - Deep dives into series quality and trends

### 🎨 Modern UI/UX
- **Beautiful Design** - Clean, modern interface with shadcn/ui components
- **Dark Mode** - Full dark mode support
- **Responsive** - Works seamlessly on mobile, tablet, and desktop
- **Accessible** - WCAG compliant with keyboard navigation
- **Rich Visualizations** - Charts, graphs, and interactive elements

### 🔐 Authentication & Persistence
- **User Accounts** - Secure authentication with Auth.js
- **Chat History** - Save and resume conversations
- **Privacy Controls** - Public/private chat visibility settings

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Vercel Postgres recommended)
- SeriesChat API backend running ([setup guide](https://github.com/USERNAME/serieschat-api))

### Installation

```bash
# Clone the repository
git clone https://github.com/USERNAME/serieschat.git
cd serieschat

# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Database (Required)
POSTGRES_URL=postgres://user:pass@host:5432/db

# Authentication (Required)
AUTH_SECRET=your-secret-key-here

# IMDb API (Required)
IMDB_API_URL=http://127.0.0.1:8000

# AI Gateway (Optional - auto-generated on Vercel)
AI_GATEWAY_API_KEY=your-gateway-key
```

### Database Setup

Using Vercel Postgres:

```bash
# Pull environment variables from Vercel
vercel env pull

# Run migrations
pnpm db:migrate

# View database in Drizzle Studio
pnpm db:studio
```

---

## 📖 Usage

### Basic Chat

Ask anything and the AI will respond:
```
You: What are the best episodes of Breaking Bad?
AI: [Calls getTopEpisodes tool and displays results]
```

### IMDb Tools

The chatbot has access to 12 specialized IMDb tools:

**TV Series**
- `getTopEpisodes` - Top-ranked episodes with weighted ratings
- `getWorstEpisodes` - Lowest-rated episodes
- `searchSeries` - Advanced series search
- `compareSeries` - Compare multiple series
- `seriesAnalytics` - Comprehensive analytics
- `resolveSeries` - Find series by name
- `getEpisodes` - All episodes with ratings

**Movies**
- `searchMovies` - Advanced movie search
- `movieDetails` - Get movie information
- `compareMovies` - Compare multiple movies
- `topMovies` - Top-rated movies

**System**
- `imdbHealth` - Check API health

### Example Queries

```
"What are the best episodes of Breaking Bad?"
"Compare Game of Thrones with The Wire and The Sopranos"
"Show me crime dramas from the 2000s with ratings above 8.5"
"Analyze the quality trends of Game of Thrones"
"Which episodes of The Walking Dead are considered worst?"
"Find the top sci-fi movies from 2010-2020"
```

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.6
- **AI**: Vercel AI SDK 5.0
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Deployment**: Vercel
- **Testing**: Playwright

### Project Structure

```
serieschat/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   └── (chat)/            # Chat interface
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── imdb-*.tsx       # IMDb tool components
│   └── chat.tsx         # Main chat component
├── lib/                   # Core utilities
│   ├── ai/              # AI SDK integration
│   │   ├── tools.ts    # Tool definitions
│   │   └── models.ts   # Model configurations
│   ├── db/              # Database schema
│   └── utils.ts         # Helpers
├── artifacts/            # Artifact generation
├── hooks/                # React hooks
└── tests/                # E2E tests
```

### Data Flow

```
User Input → AI SDK → LLM → Tool Call → IMDb API → DuckDB → Response → UI
```

For detailed architecture, see [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (both chat + API)
pnpm dev:chat         # Start chat app only
pnpm dev:api          # Start IMDb API only

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Check for issues
pnpm format           # Auto-fix issues

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:push          # Push schema changes

# Testing
pnpm test             # Run E2E tests
```

### Code Quality

This project uses **Ultracite** (Biome-based) for linting and formatting:

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm format
```

### Adding New Tools

1. Define tool in `lib/ai/tools.ts`:
```typescript
export const myNewTool = tool({
  description: "What the tool does",
  parameters: z.object({
    param: z.string(),
  }),
  execute: async ({ param }) => {
    // Tool implementation
  },
});
```

2. Create result component in `components/`:
```typescript
export const MyNewToolResult = ({ result }) => {
  return <div>{/* Render result */}</div>;
};
```

3. Register in `components/elements/tool.tsx`

4. Add tests in `tests/`

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/USERNAME/serieschat)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Setup

Required environment variables on Vercel:
- `POSTGRES_URL` - Database connection string
- `AUTH_SECRET` - NextAuth secret
- `IMDB_API_URL` - FastAPI backend URL

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test tests/e2e/chat.test.ts

# Run with UI
pnpm test --ui
```

### Writing Tests

```typescript
import { test, expect } from "@playwright/test";

test("should display IMDb results", async ({ page }) => {
  await page.goto("/");
  await page.fill("[data-testid='chat-input']", "Top Breaking Bad episodes");
  await page.click("[data-testid='submit']");
  await expect(page.locator("[data-testid='tool-result']")).toBeVisible();
});
```

---

## 📚 Documentation

- [README.md](README.md) - This file
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Code of conduct
- [IMDB_SETUP.md](IMDB_SETUP.md) - IMDb API setup
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Usage examples
- [FULL_CAPABILITIES.md](FULL_CAPABILITIES.md) - Complete feature list

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

This project uses IMDb's public datasets, which are for **personal and non-commercial use only**. Attribution to IMDb is required.

---

## 🙏 Acknowledgments

- **Vercel** for the AI SDK and hosting platform
- **IMDb** for providing public datasets
- **shadcn** for the beautiful UI components
- **Next.js** team for the amazing framework
- **Auth.js** for authentication
- **Drizzle** for the ORM

---

## 🗺️ Roadmap

- [x] Basic chat interface
- [x] IMDb tools integration
- [x] Authentication
- [x] Chat history
- [x] Dark mode
- [x] Responsive design
- [ ] Voice input
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Recommendation engine
- [ ] Real-time collaboration
- [ ] Export/share functionality
- [ ] Mobile app (React Native)

---

## 📊 Statistics

- **19 IMDb API endpoints** available
- **12 specialized tools** for TV and movie analysis
- **12M+ titles** in database
- **Sub-second response times**
- **100% TypeScript** codebase
- **90%+ test coverage** (goal)

---

## 🔗 Related Projects

- [SeriesChat API](https://github.com/USERNAME/serieschat-api) - FastAPI backend
- [Ratingraph](https://ratingraph.com/) - Inspiration for visualizations
- [Vercel AI SDK](https://ai-sdk.dev/) - AI SDK used
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/USERNAME/serieschat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/USERNAME/serieschat/discussions)
- **Documentation**: See docs folder

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

Made with ❤️ by developers, for TV and movie enthusiasts
