# SeriesChat - Deployment Guide

Complete guide for deploying **SeriesChat** to Vercel.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy](#quick-deploy)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Push your code to GitHub
3. **Database** - Vercel Postgres or compatible PostgreSQL database
4. **SeriesChat API** - FastAPI backend deployed (see [serieschat-api deployment](https://github.com/USERNAME/serieschat-api))
5. **AI Provider API Keys** - For xAI, OpenAI, or other models

---

## Quick Deploy

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/USERNAME/serieschat)

1. Click the button above
2. Connect your GitHub account
3. Configure environment variables (see below)
4. Click **Deploy**

---

## Manual Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

From your project directory:

```bash
cd /path/to/chat-app
vercel link
```

Follow the prompts:
- Set up and deploy: **Yes**
- Scope: Select your account/team
- Link to existing project: **No** (first time)
- Project name: Enter a name or press Enter
- Directory: Press Enter (current directory)

### Step 4: Set Environment Variables

```bash
# Set each required environment variable
vercel env add POSTGRES_URL production
vercel env add AUTH_SECRET production
vercel env add IMDB_API_URL production

# For AI Gateway (optional)
vercel env add AI_GATEWAY_API_KEY production
```

Or use the Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable

### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth.js secret (generate with `openssl rand -base64 32`) | `your-secret-key-here` |
| `IMDB_API_URL` | URL of deployed FastAPI backend | `https://chat-ratingraph.fly.dev` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key | Auto-generated on Vercel |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | Auto-detected |
| `NODE_ENV` | Environment mode | `production` |

### Setting Environment Variables

#### Via Vercel CLI

```bash
# Production
vercel env add POSTGRES_URL production
vercel env add AUTH_SECRET production
vercel env add IMDB_API_URL production

# Preview (optional)
vercel env add POSTGRES_URL preview

# Development (optional)
vercel env add POSTGRES_URL development
```

#### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter key and value
6. Select environments (Production, Preview, Development)
7. Click **Save**

#### Pull Environment Variables Locally

```bash
vercel env pull .env.local
```

This downloads environment variables from Vercel to your local `.env.local` file.

---

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. **Go to your project** on Vercel Dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name your database
6. Click **Create**
7. Copy the connection string
8. Add to environment variables as `POSTGRES_URL`

### Option 2: External PostgreSQL

You can use any PostgreSQL provider:
- **Neon** - https://neon.tech (recommended for serverless)
- **Supabase** - https://supabase.com
- **Railway** - https://railway.app
- **AWS RDS**
- **DigitalOcean**

Connection string format:
```
postgres://username:password@host:port/database?sslmode=require
```

### Run Migrations

After setting up the database:

```bash
# Install dependencies
pnpm install

# Run migrations
pnpm db:migrate
```

Or use Drizzle Kit:

```bash
npx drizzle-kit push
```

### Verify Database

```bash
# Open Drizzle Studio
pnpm db:studio
```

Check that tables are created:
- `users`
- `chats`
- `messages`

---

## Domain Configuration

### Add Custom Domain

1. Go to your project settings
2. Navigate to **Domains**
3. Click **Add**
4. Enter your domain (e.g., `chat.yourdomain.com`)
5. Follow DNS configuration instructions
6. Wait for DNS propagation (can take up to 48 hours)

### DNS Configuration

Add these records to your DNS provider:

**For subdomain (chat.yourdomain.com)**:
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
```

**For root domain (yourdomain.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

### SSL Certificate

Vercel automatically provisions SSL certificates for all domains. No additional configuration needed.

---

## Production Checklist

Before going live, ensure:

### Backend

- [ ] IMDb API deployed and accessible
- [ ] Health endpoint responding: `https://your-api.fly.dev/health`
- [ ] Database contains IMDb data
- [ ] CORS configured for your Vercel domain
- [ ] API performance tested

### Frontend

- [ ] All environment variables set
- [ ] Database migrations run successfully
- [ ] Authentication working (login/register)
- [ ] IMDb tools functioning correctly
- [ ] No console errors
- [ ] Build succeeds without warnings
- [ ] Responsive design tested
- [ ] Dark mode working
- [ ] Accessibility checked

### Security

- [ ] AUTH_SECRET is cryptographically secure
- [ ] Database credentials secure
- [ ] No API keys in client-side code
- [ ] CORS properly configured
- [ ] Rate limiting considered
- [ ] CSP headers configured (optional)

### Performance

- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Bundle size acceptable
- [ ] Core Web Vitals passing
- [ ] API response times acceptable

### Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Database monitoring active
- [ ] Logs accessible

---

## Build Configuration

### Framework

Vercel auto-detects Next.js projects. If needed, configure in `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Build Settings in Dashboard

1. Go to Project Settings → **General**
2. **Framework Preset**: Next.js
3. **Build Command**: `pnpm build`
4. **Install Command**: `pnpm install`
5. **Output Directory**: Leave blank (auto-detected)
6. **Node.js Version**: 18.x

---

## Deployment Strategies

### Preview Deployments

Every push to a branch creates a preview deployment:

```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
```

Vercel automatically deploys to:
```
https://chat-app-[branch]-[username].vercel.app
```

### Production Deployments

Push to `main` branch for production deployment:

```bash
git checkout main
git merge feature/new-feature
git push origin main
```

Or manually deploy:

```bash
vercel --prod
```

### Rollback

If something goes wrong:

1. Go to project **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

---

## CI/CD Integration

### GitHub Integration

Vercel automatically deploys when:
- Push to any branch (preview deployment)
- Push to main/master (production deployment)
- Pull request opened (preview comment added)

### Disable Auto-Deployments

In project settings → **Git**:
- Uncheck "Production Branch"
- Uncheck "Preview Branches"

### Custom GitHub Actions

`.github/workflows/vercel.yml`:
```yaml
name: Vercel Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g vercel
      - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Monitoring & Analytics

### Vercel Analytics

Enable in project settings:
1. Go to **Analytics** tab
2. Click **Enable**
3. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Countries

### Real User Monitoring

Already integrated via `@vercel/analytics` package.

View metrics:
- Core Web Vitals (LCP, FID, CLS)
- Route performance
- API endpoint performance

### Error Tracking

Consider integrating:
- **Sentry** - https://sentry.io
- **LogRocket** - https://logrocket.com
- **Datadog** - https://www.datadoghq.com

---

## Troubleshooting

### Build Failures

**Error: Build exceeded maximum duration**
- Solution: Optimize build process, reduce dependencies

**Error: Out of memory**
- Solution: Use `NODE_OPTIONS=--max_old_space_size=4096` in build command

**Error: Module not found**
- Solution: Clear cache, redeploy
- Run: `vercel --force`

### Runtime Errors

**Error: Database connection failed**
- Check `POSTGRES_URL` is set correctly
- Verify database is accessible from Vercel
- Check SSL mode: add `?sslmode=require`

**Error: IMDb API not responding**
- Verify `IMDB_API_URL` is correct
- Check FastAPI backend is running
- Test health endpoint: `curl https://your-api.fly.dev/health`

**Error: Authentication not working**
- Verify `AUTH_SECRET` is set
- Clear browser cookies
- Check database has `users` table

### Performance Issues

**Slow page loads**
- Enable Edge Functions for API routes
- Optimize images with Next.js Image
- Check database query performance
- Review bundle size

**High memory usage**
- Check for memory leaks
- Optimize React components
- Use React.memo for expensive renders

### CORS Errors

Update FastAPI backend CORS settings:

```python
# 03_serve_api.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "https://your-custom-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

---

## Scaling

### Serverless Functions

Vercel automatically scales serverless functions. Configure limits:

```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### Edge Functions

For global low-latency, use Edge Runtime:

```typescript
// app/api/chat/route.ts
export const runtime = 'edge';
```

### Database Connection Pooling

For high traffic, use connection pooling:
- Vercel Postgres includes built-in pooling
- Or use Prisma Data Proxy
- Or use pg-bouncer

---

## Cost Optimization

### Free Tier

Vercel Free tier includes:
- Unlimited deployments
- 100GB bandwidth
- Serverless function executions
- Preview deployments

### Pro Tier ($20/month)

Consider upgrading for:
- Commercial use
- More bandwidth (1TB)
- Advanced analytics
- Password protection
- Custom domains

### Database Costs

- Vercel Postgres: Pay as you go
- Neon: Free tier available
- Consider database usage patterns

---

## Support

### Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions

### Getting Help

1. Check logs: `vercel logs [deployment-url]`
2. Review build output in dashboard
3. Check GitHub Issues
4. Contact Vercel support (Pro plan)

---

## Next Steps

After deployment:

1. **Test thoroughly** - Run through all features
2. **Monitor performance** - Check analytics daily
3. **Set up alerts** - For errors and downtime
4. **Document** - Keep deployment notes
5. **Backup database** - Regular backups of PostgreSQL
6. **Update dependencies** - Keep packages current

---

## Related Documentation

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines
- [IMDB_SETUP.md](IMDB_SETUP.md) - IMDb API setup
- [Backend Deployment](https://github.com/USERNAME/serieschat-api/blob/main/DEPLOYMENT.md)

---

Made with ❤️ for seamless deployments

