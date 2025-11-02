# Contributing to AI Chatbot with IMDb Integration

Thank you for your interest in contributing! This document provides guidelines for contributing to the AI Chatbot project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Documentation](#documentation)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/serieschat.git
   cd serieschat
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/serieschat.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Neon/Vercel Postgres)
- SeriesChat API backend running (see [serieschat-api](https://github.com/USERNAME/serieschat-api))
- API keys for AI providers (xAI, OpenAI, etc.)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up the database**:
   ```bash
   pnpm db:migrate
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

   This starts both the Next.js app (port 3000) and the IMDb API server (port 8000).

5. **Visit** http://localhost:3000

### Database Setup

The app uses Vercel Postgres (or any PostgreSQL database):

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# View database in Drizzle Studio
pnpm db:studio
```

## Project Structure

```
serieschat/
├── app/                      # Next.js 15 app directory
│   ├── (auth)/              # Authentication routes
│   ├── (chat)/              # Main chat interface
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── imdb-*.tsx          # IMDb tool result components
│   ├── chat.tsx            # Main chat component
│   └── ...
├── lib/                     # Utility libraries
│   ├── ai/                  # AI SDK integration
│   │   ├── models.ts       # AI model configurations
│   │   ├── tools.ts        # Tool definitions
│   │   └── providers.ts    # AI providers setup
│   ├── db/                  # Database schema and migrations
│   └── utils.ts             # Utility functions
├── artifacts/               # Artifact generation (code, text, etc.)
├── hooks/                   # React hooks
├── tests/                   # E2E and unit tests
└── public/                  # Static assets
```

## Making Changes

### Branch Naming

Create descriptive branch names:
- `feature/add-new-tool` - New features
- `fix/resolve-auth-issue` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/optimize-chat` - Code improvements
- `ui/improve-design` - UI/UX changes

```bash
git checkout -b feature/your-feature-name
```

### Commit Messages

Follow conventional commits format:

```
feat: add movie comparison tool

- Implement compareMovies tool
- Add movie-comparison component
- Update tool registry
- Add tests
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ui:` - UI/UX improvements

## Coding Standards

### TypeScript

This project uses **Ultracite** for linting and formatting (based on Biome).

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm format
```

Follow these principles:
- Use TypeScript for type safety
- Avoid `any` type
- Use descriptive variable names
- Export types separately (`export type`)
- Use const assertions for readonly data

```typescript
// Good
export type Episode = {
  title: string;
  season: number;
  rating: number;
};

const ratings = [9.0, 9.5, 10.0] as const;

// Bad
const data: any = {...};
let x = "value";
```

### React Components

Follow React best practices:

```typescript
// Good - Arrow function component with proper typing
export const EpisodeCard = ({ episode }: { episode: Episode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="episode-card">
      <h3>{episode.title}</h3>
      <p>Rating: {episode.rating}</p>
    </div>
  );
};

// Bad - Missing types, function declaration
export function EpisodeCard(props) {
  return <div>{props.episode.title}</div>;
}
```

### Styling

Use Tailwind CSS classes:
- Follow utility-first approach
- Use design tokens from `imdb-design-tokens.ts` for consistency
- Responsive design with mobile-first approach
- Dark mode support with `dark:` prefix

```tsx
// Good
<div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
    {title}
  </h2>
</div>

// Bad
<div style={{ padding: "16px", backgroundColor: "white" }}>
  <h2 style={{ fontSize: "18px" }}>{title}</h2>
</div>
```

### Adding New IMDb Tools

1. **Define the tool** in `lib/ai/tools.ts`:
```typescript
export const newTool = tool({
  description: "Description of what the tool does",
  parameters: z.object({
    param1: z.string().describe("Parameter description"),
  }),
  execute: async ({ param1 }) => {
    // Implement tool logic
    const response = await fetch(`${IMDB_API_URL}/new-endpoint?param=${param1}`);
    return response.json();
  },
});
```

2. **Create result component** in `components/`:
```typescript
// components/imdb-new-tool.tsx
export const NewToolResult = ({ result }: { result: ToolResult }) => {
  return (
    <div className="new-tool-result">
      {/* Render the result */}
    </div>
  );
};
```

3. **Register in tool renderer**:
```typescript
// components/elements/tool.tsx
case "newTool":
  return <NewToolResult result={result} />;
```

4. **Add tests**:
```typescript
// tests/tools/new-tool.test.ts
describe("New Tool", () => {
  it("should fetch and return data", async () => {
    // Test implementation
  });
});
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/e2e/chat.test.ts

# Run tests in UI mode
pnpm test --ui
```

### Writing Tests

Use Playwright for E2E tests:

```typescript
import { test, expect } from "@playwright/test";

test("should display IMDb tool results", async ({ page }) => {
  await page.goto("/");
  
  // Type a query
  await page.fill('[data-testid="chat-input"]', "What are the best episodes of Breaking Bad?");
  await page.click('[data-testid="submit-button"]');
  
  // Wait for response
  await page.waitForSelector('[data-testid="top-episodes-result"]');
  
  // Verify results
  const episodes = await page.locator('[data-testid="episode-card"]').count();
  expect(episodes).toBeGreaterThan(0);
});
```

### Test Coverage

Aim for:
- Critical paths: 100%
- Tool integrations: 90%+
- UI components: 70%+
- Utility functions: 80%+

## Submitting Pull Requests

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:
   ```bash
   pnpm lint
   pnpm format
   pnpm test
   ```

3. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** with:
   - Clear, descriptive title
   - Detailed description of changes
   - Screenshots (for UI changes)
   - Related issue links
   - Test results

5. **Address review feedback** promptly

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Lint checks pass
- [ ] Documentation updated (if needed)
- [ ] Screenshots added (for UI changes)
- [ ] No console errors or warnings
- [ ] Tested in both light and dark modes
- [ ] Mobile-responsive (for UI changes)

## Documentation

### Code Documentation

Use JSDoc for complex functions:

```typescript
/**
 * Fetches top episodes from the IMDb API.
 * 
 * @param series - Name of the TV series
 * @param options - Query options
 * @param options.minVotes - Minimum votes threshold
 * @param options.limit - Maximum number of episodes
 * @returns Promise resolving to episode data
 * 
 * @example
 * const episodes = await getTopEpisodes("Breaking Bad", { limit: 10 });
 */
export async function getTopEpisodes(
  series: string,
  options?: { minVotes?: number; limit?: number }
): Promise<Episode[]> {
  // Implementation
}
```

### Component Documentation

Document complex components:

```typescript
/**
 * Displays a comparison of multiple TV series.
 * 
 * Features:
 * - Side-by-side comparison
 * - Best/worst episode highlights
 * - Rating trends
 * 
 * @param comparison - Array of series data
 */
export const SeriesComparison = ({ comparison }: Props) => {
  // Component implementation
};
```

### README Updates

Update README.md when adding:
- New features
- New tools
- Configuration options
- Breaking changes

## Common Tasks

### Adding a New AI Model

1. Update `lib/ai/models.ts`:
```typescript
export const newModel = {
  id: "new-provider/model-name",
  name: "Model Name",
  provider: "new-provider",
};
```

2. Update model selector component
3. Test with various prompts

### Adding New Environment Variables

1. Add to `.env.example`
2. Document in README.md
3. Update Vercel environment variables
4. Add TypeScript types if needed

### Database Schema Changes

1. Update schema in `lib/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Test migration locally: `pnpm db:migrate`
4. Document changes in ARCHITECTURE.md

## Performance Guidelines

- Optimize images (use Next.js Image component)
- Lazy load heavy components
- Minimize bundle size
- Use React.memo for expensive components
- Debounce user inputs
- Cache API responses when appropriate

## Accessibility

- Use semantic HTML elements
- Include ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain sufficient color contrast
- Follow Ultracite accessibility rules

## Questions?

- **Bug reports**: Open an issue with bug template
- **Feature requests**: Open an issue with feature template
- **Questions**: Use GitHub Discussions
- **Security issues**: Email security@yourdomain.com

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

## Recognition

Contributors will be listed in the README. Thank you for improving the AI Chatbot!

