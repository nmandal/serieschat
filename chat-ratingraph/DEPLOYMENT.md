# Deployment Guide - IMDb API on Fly.io

This guide walks you through deploying the FastAPI IMDb API to Fly.io with persistent storage.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io/app/sign-up
2. **Fly CLI**: Install the Fly CLI tool
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

3. **DuckDB Database**: Ensure `imdb.duckdb` exists in the chat-ratingraph directory
   ```bash
   ls -lh imdb.duckdb
   # Should show ~1.8GB file
   ```

## Deployment Steps

### 1. Authenticate with Fly.io

```bash
cd /Users/nick/code/hackathon/chat-ratingraph
flyctl auth login
```

This will open your browser for authentication.

### 2. Launch the Application

```bash
flyctl launch --no-deploy
```

When prompted:
- **App name**: Press Enter to use `imdb-api` (or choose your own)
- **Organization**: Select your organization
- **Region**: Choose closest to your users (default: `iad` - US East)
- **Set up PostgreSQL**: No
- **Set up Redis**: No
- **Deploy now**: No (we'll create the volume first)

### 3. Create Persistent Volume for Database

```bash
flyctl volumes create imdb_data --size 3 --region iad
```

Replace `iad` with your chosen region. This creates a 3GB persistent volume.

### 4. Copy Database to Volume (First Deploy)

For the first deployment, we need to get the database onto the volume. We'll use a temporary approach:

```bash
# Deploy the app with the database in the Docker image
flyctl deploy

# Wait for deployment to complete
flyctl status

# SSH into the machine and copy the database to the volume
flyctl ssh console

# Inside the container:
cp /app/imdb.duckdb /data/imdb.duckdb
exit
```

### 5. Verify Deployment

```bash
# Check app status
flyctl status

# View logs
flyctl logs

# Test the health endpoint
curl https://imdb-api.fly.dev/health
```

### 6. Get Your Production URL

```bash
flyctl info
```

Look for the `Hostname` field. It will be something like:
```
Hostname: imdb-api.fly.dev
```

Your API is now live at `https://imdb-api.fly.dev`!

## Configuration

### Environment Variables

Set environment variables using:

```bash
# Set custom database path (already configured in fly.toml)
flyctl secrets set DB_PATH=/data/imdb.duckdb

# Set custom CORS origin (optional)
flyctl secrets set CORS_ORIGIN=https://your-chat-app.vercel.app
```

### Scaling

Adjust resources in `fly.toml`:

```toml
[[vm]]
  memory = "512mb"  # Increase to 1024mb for better performance
  cpu_kind = "shared"
  cpus = 1
```

Then redeploy:
```bash
flyctl deploy
```

### Auto-scaling

The default configuration uses auto-start/auto-stop:
- Machines start automatically when receiving requests
- Machines stop after idle period (saves costs)
- Set `min_machines_running = 1` for always-on (costs more)

## Monitoring

### View Logs

```bash
# Stream live logs
flyctl logs

# View last 100 lines
flyctl logs --limit 100
```

### Check Metrics

```bash
# View app metrics
flyctl dashboard
```

Or visit: https://fly.io/apps/imdb-api/monitoring

### Health Checks

The app includes a health check endpoint at `/health`:
```bash
curl https://imdb-api.fly.dev/health
```

## Updating the Deployment

### Update Application Code

1. Make changes to `03_serve_api.py`
2. Deploy:
   ```bash
   flyctl deploy
   ```

### Update Database

If you need to update the DuckDB database:

```bash
# Option 1: SSH and replace
flyctl ssh console
# Upload new database or rebuild

# Option 2: Rebuild and redeploy
# (Database is copied from local during build)
flyctl deploy --no-cache
```

## Cost Optimization

### Current Configuration
- **Compute**: ~$5/month (shared-cpu-1x, 512MB)
- **Volume**: ~$0.30/month (3GB storage)
- **Bandwidth**: Free tier includes 100GB/month
- **Total**: ~$5-6/month

### Cost Reduction Tips
1. Use auto-start/auto-stop (enabled by default)
2. Set `min_machines_running = 0` for maximum savings
3. Use smaller memory allocation if possible
4. Monitor bandwidth usage

### Cost Increase for Performance
1. Increase memory: `memory = "1024mb"`
2. Always-on: `min_machines_running = 1`
3. Multiple regions: Deploy to multiple regions

## Troubleshooting

### App Won't Start

Check logs:
```bash
flyctl logs
```

Common issues:
- Database file missing: Ensure database is copied to `/data/`
- Port mismatch: App must listen on port 8000
- Memory issues: Increase VM memory in fly.toml

### Database Connection Errors

1. Verify volume is mounted:
   ```bash
   flyctl ssh console
   ls -lh /data/
   ```

2. Check database path:
   ```bash
   flyctl secrets list
   # Should show DB_PATH=/data/imdb.duckdb
   ```

3. Verify file permissions:
   ```bash
   flyctl ssh console
   chmod 644 /data/imdb.duckdb
   ```

### CORS Issues

If the chat-app can't connect:

1. Add your domain to CORS origins:
   ```bash
   flyctl secrets set CORS_ORIGIN=https://your-app.vercel.app
   ```

2. Or update `03_serve_api.py` and redeploy

### Slow Performance

1. Check current resources:
   ```bash
   flyctl status
   ```

2. Increase memory:
   ```toml
   [[vm]]
     memory = "1024mb"
   ```

3. Keep machine always running:
   ```toml
   [http_service]
     min_machines_running = 1
   ```

### SSL Certificate Issues

Fly.io automatically provisions SSL certificates. If you see SSL errors:

```bash
flyctl certs list
flyctl certs check imdb-api.fly.dev
```

## Advanced Configuration

### Custom Domain

1. Add your domain:
   ```bash
   flyctl certs add your-domain.com
   ```

2. Add DNS records (shown in output)

3. Verify:
   ```bash
   flyctl certs show your-domain.com
   ```

### Multiple Regions

Deploy to multiple regions for lower latency:

```bash
# Add regions
flyctl regions add sjc lhr syd

# Deploy will automatically replicate
flyctl deploy
```

### Database Backups

Backup the database periodically:

```bash
# Create backup script
flyctl ssh console

# Inside container:
cp /data/imdb.duckdb /data/imdb.duckdb.backup
```

Or use Fly.io volumes snapshots:
```bash
flyctl volumes snapshots list imdb_data
flyctl volumes snapshots create imdb_data
```

## Rolling Back

If something goes wrong:

```bash
# List deployments
flyctl releases

# Rollback to previous version
flyctl releases rollback
```

## Destroying the App

To completely remove the app:

```bash
# Delete the app (includes volumes)
flyctl apps destroy imdb-api

# Or just stop it (keep data)
flyctl scale count 0
```

## Support

- Fly.io Docs: https://fly.io/docs/
- Community Forum: https://community.fly.io/
- Status Page: https://status.flyio.net/

## Next Steps

After deployment:
1. Test all API endpoints
2. Update chat-app configuration with production URL
3. Monitor logs and metrics
4. Set up alerts (optional)
5. Configure custom domain (optional)

