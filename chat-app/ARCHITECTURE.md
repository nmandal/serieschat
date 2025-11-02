# SeriesChat - Architecture Overview

This document provides a comprehensive overview of the **SeriesChat** application architecture.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [API Integration](#api-integration)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)

---

## System Overview

The application consists of two main components:

1. **Next.js Frontend** - React-based chat interface with AI SDK integration
2. **FastAPI Backend** - IMDb data API powered by DuckDB

These components work together to provide an AI-powered chatbot that can query and analyze IMDb data.

---

## Technology Stack

### Frontend (Next.js Chat App)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 | React framework with App Router |
| **Language** | TypeScript | Type-safe JavaScript |
| **UI Library** | React 19 RC | Component-based UI |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Component Library** | shadcn/ui | Accessible component primitives |
| **AI SDK** | Vercel AI SDK 5 | LLM integration and streaming |
| **Database** | PostgreSQL (Vercel Postgres) | User data and chat history |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Authentication** | Auth.js (NextAuth v5) | User authentication |
| **Deployment** | Vercel | Serverless hosting |
| **Linting** | Ultracite (Biome) | Fast linting and formatting |
| **Testing** | Playwright | End-to-end testing |

### Backend (FastAPI IMDb API)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | FastAPI | Modern Python web framework |
| **Database** | DuckDB | Embedded analytical database |
| **Server** | Uvicorn | ASGI server |
| **Data Source** | IMDb Datasets | Public IMDb data (TSV files) |
| **Deployment** | Fly.io | Container hosting |
| **Containerization** | Docker | Application containerization |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL (Next.js App)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 App Router                                    │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Chat Interface (React Components)                  │  │   │
│  │  │  - MultimodalInput                                  │  │   │
│  │  │  - Messages                                         │  │   │
│  │  │  - IMDb Tool Result Components                     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           │                               │   │
│  │                           ↓                               │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Vercel AI SDK                                      │  │   │
│  │  │  - streamText() API                                 │  │   │
│  │  │  - Tool calling system                              │  │   │
│  │  │  - Model providers (xAI, OpenAI)                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │              │                       │                    │   │
│  │              ↓                       ↓                    │   │
│  │  ┌─────────────────┐    ┌───────────────────────────┐   │   │
│  │  │  IMDb Tools     │    │  Server Actions           │   │   │
│  │  │  (HTTP calls)   │    │  - saveChat               │   │   │
│  │  │  - getTopEpisodes │  │  - deleteChat            │   │   │
│  │  │  - searchSeries  │   │  - updateUser            │   │   │
│  │  │  - compareSeries │   └────────┬──────────────────┘   │   │
│  │  └────────┬────────┘             │                       │   │
│  └───────────┼──────────────────────┼───────────────────────┘   │
│              │                       │                           │
│              │                       ↓                           │
│              │          ┌────────────────────────────────┐       │
│              │          │  Vercel Postgres (Neon)        │       │
│              │          │  - users table                 │       │
│              │          │  - chats table                 │       │
│              │          │  - messages table              │       │
│              │          └────────────────────────────────┘       │
└──────────────┼───────────────────────────────────────────────────┘
               │
               │ HTTPS
               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FLY.IO (FastAPI Backend)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FastAPI Application (03_serve_api.py)                    │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  REST API Endpoints (19 endpoints)                 │  │   │
│  │  │  - /resolve_series                                 │  │   │
│  │  │  - /top_episodes                                   │  │   │
│  │  │  - /search_series                                  │  │   │
│  │  │  - /compare_series                                 │  │   │
│  │  │  - /series_analytics                               │  │   │
│  │  │  - ... and 14 more                                 │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           │                               │   │
│  │                           ↓                               │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  DuckDB Connection                                  │  │   │
│  │  │  - SQL query execution                             │  │   │
│  │  │  - Read-only connection                            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           │                               │   │
│  │                           ↓                               │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  DuckDB Database (imdb.duckdb - 1.8GB)             │  │   │
│  │  │  Tables:                                            │  │   │
│  │  │  - title_basics (12M+ titles)                      │  │   │
│  │  │  - title_ratings (1.6M+ ratings)                   │  │   │
│  │  │  - title_episode (817K+ episodes)                  │  │   │
│  │  │  View:                                              │  │   │
│  │  │  - episode_panel (optimized query view)            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Fly.io Volume (Persistent Storage)                       │   │
│  │  Mount: /data                                             │   │
│  │  Size: 3GB                                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Components

### Frontend Components

#### Core Chat Components

**`components/chat.tsx`**
- Main chat interface
- Manages message state
- Handles user input
- Coordinates AI streaming responses

**`components/multimodal-input.tsx`**
- User input component
- Supports text and file uploads
- Real-time character count
- Attachment handling

**`components/messages.tsx`**
- Displays chat message history
- Renders user and assistant messages
- Tool result visualization
- Markdown rendering

#### Tool Result Components

**IMDb-specific components** (render tool execution results):
- `imdb-top-episodes.tsx` - Top episode rankings
- `imdb-series-info.tsx` - Series metadata
- `imdb-comparison.tsx` - Multi-series comparison
- `imdb-analytics.tsx` - Comprehensive analytics
- `imdb-search-results.tsx` - Search results display
- `imdb-worst-episodes.tsx` - Worst episode rankings
- `imdb-episode-graph.tsx` - Rating visualizations
- And 10+ more specialized components

#### UI Components (shadcn/ui)

Located in `components/ui/`:
- `button.tsx` - Button component
- `input.tsx` - Input fields
- `card.tsx` - Card containers
- `tooltip.tsx` - Tooltips
- And 20+ more components

### Backend Components

**`03_serve_api.py`**
- FastAPI application
- 19 REST endpoints
- Database connection management
- CORS configuration
- Health checks

**`01_build_imdb_duckdb.py`**
- Database builder script
- Downloads IMDb datasets
- Loads data into DuckDB
- Creates indexes and views

**`02_chart_series.py`**
- Chart generation utility
- Creates ratingraph visualizations
- Saves to PNG files

---

## Data Flow

### Chat Message Flow

```
1. User types message
   ↓
2. MultimodalInput captures input
   ↓
3. submitMessage() called
   ↓
4. POST /api/chat (Next.js API route)
   ↓
5. Vercel AI SDK streamText()
   ↓
6. LLM processes prompt + available tools
   ↓
7. LLM decides to call tool (e.g., getTopEpisodes)
   ↓
8. Tool execute() function runs
   ↓
9. HTTP request to FastAPI backend
   ↓
10. FastAPI queries DuckDB
    ↓
11. Results returned to tool
    ↓
12. LLM generates natural language response
    ↓
13. Response streamed back to client
    ↓
14. Messages component updates with results
    ↓
15. Tool result component renders data
```

### Tool Execution Flow

```typescript
// 1. Tool is defined in lib/ai/tools.ts
export const getTopEpisodes = tool({
  description: "Get top-ranked episodes for a TV series",
  parameters: z.object({
    series: z.string(),
    limit: z.number().optional(),
  }),
  execute: async ({ series, limit = 10 }) => {
    // 2. Tool makes HTTP request to FastAPI
    const response = await fetch(
      `${IMDB_API_URL}/top_episodes?series=${series}&limit=${limit}`
    );
    
    // 3. Parse and return results
    return await response.json();
  },
});

// 4. Tool is registered in lib/ai/index.ts
export const allTools = {
  getTopEpisodes,
  searchSeries,
  compareSeries,
  // ... more tools
};

// 5. LLM automatically calls tools based on user query
const result = await streamText({
  model: xai("grok-2-vision-1212"),
  tools: allTools,
  prompt: userMessage,
});
```

---

## API Integration

### IMDb API Tools

The frontend defines **12 IMDb tools** that call the FastAPI backend:

| Tool | Endpoint | Purpose |
|------|----------|---------|
| `imdbHealth` | `/health` | Check API health |
| `resolveSeries` | `/resolve_series` | Find series by name |
| `getEpisodes` | `/episodes` | Get all episodes |
| `getTopEpisodes` | `/top_episodes` | Top-ranked episodes |
| `getWorstEpisodes` | `/worst_episodes` | Worst-ranked episodes |
| `searchSeries` | `/search_series` | Advanced series search |
| `compareSeries` | `/compare_series` | Compare multiple series |
| `seriesAnalytics` | `/series_analytics` | Comprehensive analytics |
| `searchMovies` | `/search_movies` | Search for movies |
| `movieDetails` | `/movie_details` | Get movie details |
| `compareMovies` | `/compare_movies` | Compare movies |
| `topMovies` | `/top_movies` | Top-rated movies |

### Tool Registration

**Location**: `lib/ai/tools.ts`

```typescript
import { z } from "zod";
import { tool } from "ai";

const IMDB_API_URL = process.env.IMDB_API_URL || "http://127.0.0.1:8000";

export const getTopEpisodes = tool({
  description: "Get top-ranked episodes using weighted rating formula...",
  parameters: z.object({
    series: z.string().describe("Name of the TV series"),
    minVotes: z.number().optional().describe("Minimum votes threshold"),
    limit: z.number().optional().describe("Number of results"),
  }),
  execute: async ({ series, minVotes = 1000, limit = 10 }) => {
    const url = `${IMDB_API_URL}/top_episodes?series=${encodeURIComponent(series)}&min_votes=${minVotes}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return await response.json();
  },
});
```

---

## Database Schema

### Frontend Database (PostgreSQL)

**Location**: `lib/db/schema.ts`

```typescript
// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chats table
export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("private"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### Backend Database (DuckDB)

**Tables**:
- `title_basics` - All titles (movies, series, episodes)
- `title_ratings` - IMDb ratings and vote counts
- `title_episode` - TV episode information

**View**:
- `episode_panel` - Pre-joined view for fast queries

---

## Authentication

### Auth.js Configuration

**Location**: `app/(auth)/auth.config.ts`

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        // Verify credentials against database
        const user = await getUserByEmail(credentials.email);
        if (!user || !verifyPassword(credentials.password, user.password)) {
          return null;
        }
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

### Protected Routes

**Location**: `middleware.ts`

```typescript
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register");
  
  if (!isLoggedIn && !isAuthPage && req.nextUrl.pathname !== "/") {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});
```

---

## Deployment

### Frontend Deployment (Vercel)

```bash
# Build command
pnpm build

# Environment variables required
POSTGRES_URL=           # Database connection string
AUTH_SECRET=            # NextAuth secret
IMDB_API_URL=          # FastAPI backend URL
AI_GATEWAY_API_KEY=    # Vercel AI Gateway key (optional)
```

**Vercel Configuration**:
- Framework: Next.js
- Node version: 18.x
- Build command: `pnpm build`
- Output directory: `.next`
- Install command: `pnpm install`

### Backend Deployment (Fly.io)

**fly.toml**:
```toml
app = "serieschat-api"
primary_region = "ord"

[build]

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0

[env]
  DB_PATH = "/data/imdb.duckdb"

[mounts]
  source = "imdb_data"
  destination = "/data"
  initial_size = "3gb"

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
```

**Deployment Steps**:
1. Build database locally
2. Deploy to Fly.io
3. Copy database to volume
4. Verify health endpoint

---

## Performance Considerations

### Frontend Optimization

- **React Server Components**: Reduce client bundle size
- **Streaming**: Real-time AI response streaming
- **Code Splitting**: Lazy load tool result components
- **Image Optimization**: Next.js Image component
- **Caching**: SWR for data fetching

### Backend Optimization

- **DuckDB**: Fast analytical queries
- **Indexes**: Optimized for common queries
- **Read-only**: Prevent accidental writes
- **Connection Pooling**: Single persistent connection
- **CORS**: Configured for specific origins

---

## Security

- **Authentication**: Secure password hashing (bcrypt)
- **CORS**: Restricted origins
- **Environment Variables**: Secrets not in code
- **SQL Injection**: Parameterized queries
- **Rate Limiting**: Consider adding for production
- **HTTPS**: Enforced on both services

---

## Monitoring

### Frontend (Vercel)

- Vercel Analytics
- Real User Monitoring (RUM)
- Function logs
- Error tracking

### Backend (Fly.io)

- Health check endpoint: `/health`
- Fly.io metrics dashboard
- Application logs: `flyctl logs`
- Volume status: `flyctl volumes list`

---

## Development Workflow

```bash
# 1. Start backend API
cd serieschat-api
source .venv/bin/activate
uvicorn 03_serve_api:app --reload

# 2. Start frontend (in another terminal)
cd chat-app
pnpm dev

# 3. Or start both together
cd chat-app
pnpm dev  # Uses concurrently to start both
```

---

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Redis caching layer
- [ ] GraphQL API alternative
- [ ] Enhanced analytics dashboard
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Recommendation engine
- [ ] Actor/crew search tools

---

For more information, see:
- [README.md](README.md) - Project overview
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [IMDB_SETUP.md](IMDB_SETUP.md) - IMDb API setup
- [API_REFERENCE.md](../serieschat-api/API_REFERENCE.md) - Complete API documentation

