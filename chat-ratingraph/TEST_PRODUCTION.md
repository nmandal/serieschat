# Production Testing Guide

After deploying to Fly.io, use this guide to test all API endpoints and verify the chat-app integration.

## Set Your API URL

Replace `YOUR_APP_URL` with your actual Fly.io hostname (e.g., `imdb-api.fly.dev`):

```bash
export API_URL="https://YOUR_APP_URL"
```

Or for quick testing, use this in each command:
```bash
API_URL="https://your-app-name.fly.dev"
```

## 1. Health Check

Test the basic health endpoint:

```bash
curl "$API_URL/health"
```

Expected output:
```json
{
  "status": "healthy",
  "database": "/data/imdb.duckdb",
  "titles_count": 10489018
}
```

## 2. Root Endpoint

Get API information and all available endpoints:

```bash
curl "$API_URL/" | python3 -m json.tool
```

## 3. TV Series Endpoints

### Resolve Series

```bash
curl "$API_URL/resolve_series?name=Breaking%20Bad"
```

### Get Episodes

```bash
curl "$API_URL/episodes?series=Breaking%20Bad" | python3 -m json.tool | head -50
```

### Top Episodes

```bash
curl "$API_URL/top_episodes?series=Breaking%20Bad&min_votes=1000&limit=5"
```

### Worst Episodes

```bash
curl "$API_URL/worst_episodes?series=Game%20of%20Thrones&min_votes=1000&limit=5"
```

### Search Series

```bash
# Search by name
curl "$API_URL/search_series?query=Breaking&limit=5"

# Search by genre
curl "$API_URL/search_series?genre=Drama&min_rating=8.0&limit=10"

# Search by year
curl "$API_URL/search_series?start_year=2010&end_year=2020&limit=10"
```

### Compare Series

```bash
curl "$API_URL/compare_series?series_names=Breaking%20Bad,The%20Wire,The%20Sopranos"
```

### Series Analytics

```bash
curl "$API_URL/series_analytics?series=Breaking%20Bad" | python3 -m json.tool
```

## 4. Movie Endpoints

### Search Movies

```bash
# Search by title
curl "$API_URL/search_movies?query=Inception&limit=5"

# Search by genre and year
curl "$API_URL/search_movies?genre=Action&start_year=2010&min_rating=7.0&limit=10"

# Search with vote filter
curl "$API_URL/search_movies?min_rating=8.0&min_votes=100000&limit=20"
```

### Movie Details

```bash
# By title
curl "$API_URL/movie_details?title=The%20Shawshank%20Redemption"

# By IMDb ID (tconst)
curl "$API_URL/movie_details?tconst=tt0111161"
```

### Compare Movies

```bash
curl "$API_URL/compare_movies?movie_titles=The%20Shawshank%20Redemption,The%20Godfather,The%20Dark%20Knight"
```

### Top Movies

```bash
# Top rated overall
curl "$API_URL/top_movies?min_votes=10000&limit=20"

# Top rated by genre
curl "$API_URL/top_movies?genre=Drama&min_votes=10000&limit=10"

# Top rated by decade
curl "$API_URL/top_movies?start_year=1990&end_year=1999&min_votes=10000&limit=10"
```

## 5. Analysis Endpoints

### Genre Analysis

```bash
# Movie genres
curl "$API_URL/genre_analysis?title_type=movie&min_votes=1000" | python3 -m json.tool

# TV series genres
curl "$API_URL/genre_analysis?title_type=tvSeries&min_votes=1000" | python3 -m json.tool
```

### Decade Analysis

```bash
# Movie trends by decade
curl "$API_URL/decade_analysis?title_type=movie&min_votes=1000" | python3 -m json.tool

# TV series trends by decade
curl "$API_URL/decade_analysis?title_type=tvSeries&min_votes=1000" | python3 -m json.tool
```

## 6. Performance Testing

Test response times:

```bash
# Test health endpoint latency
time curl -s "$API_URL/health" > /dev/null

# Test complex query latency
time curl -s "$API_URL/search_movies?genre=Drama&start_year=2000&min_rating=7.0&limit=50" > /dev/null

# Test series analytics latency
time curl -s "$API_URL/series_analytics?series=Breaking%20Bad" > /dev/null
```

## 7. Load Testing (Optional)

Simple load test with `ab` (Apache Bench):

```bash
# Install ab if needed (macOS)
# brew install httpd

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 "$API_URL/health"

# Test search endpoint
ab -n 50 -c 5 "$API_URL/search_movies?query=action&limit=10"
```

## 8. Chat-App Integration Testing

### Update Environment Variable

1. Set the production API URL in your chat-app:

```bash
cd /Users/nick/code/hackathon/chat-app
echo "IMDB_API_URL=$API_URL" >> .env.local
```

2. Restart the dev server:

```bash
npm run dev
```

### Test Chat Queries

Visit http://localhost:3000 and test these queries:

1. **Health Check**:
   - "Is the IMDb database working?"

2. **Movie Searches**:
   - "Find the best action movies from the 2010s"
   - "What are the top rated movies of all time?"
   - "Show me sci-fi movies with at least 8.0 rating"

3. **TV Series**:
   - "Tell me about Breaking Bad"
   - "What are the best episodes of Breaking Bad?"
   - "Compare Breaking Bad and The Wire"

4. **Analysis**:
   - "Show me genre analysis for movies"
   - "How have movie ratings changed by decade?"
   - "What's the trend in TV series ratings over time?"

5. **Comparisons**:
   - "Compare The Godfather and The Shawshank Redemption"
   - "Which is better: Breaking Bad or The Sopranos?"

### Verify Responses

Check that:
- [ ] Responses include real data (not errors)
- [ ] Response times are acceptable (< 3 seconds)
- [ ] Data is accurate and matches expectations
- [ ] No CORS errors in browser console
- [ ] All tool calls succeed

## 9. Error Testing

Test error handling:

```bash
# Non-existent series
curl "$API_URL/resolve_series?name=ThisSeriesDoesNotExist12345"

# Invalid parameters
curl "$API_URL/top_episodes?series=BreakingBad&min_votes=-1"

# Missing parameters
curl "$API_URL/compare_series"
```

All should return appropriate error messages, not crash.

## 10. Monitoring

### View Real-time Logs

```bash
flyctl logs
```

### Check Application Metrics

```bash
flyctl status
flyctl dashboard
```

### Monitor Resource Usage

```bash
# Check memory and CPU
flyctl status -a your-app-name

# View metrics
flyctl metrics
```

## Checklist

After testing, verify:

- [ ] Health endpoint responds correctly
- [ ] All TV series endpoints work
- [ ] All movie endpoints work
- [ ] Analysis endpoints return data
- [ ] Search functionality works
- [ ] Comparison features work
- [ ] Response times are acceptable
- [ ] Errors are handled gracefully
- [ ] Chat-app integration works
- [ ] No CORS errors
- [ ] Logs show no critical errors
- [ ] Database queries complete successfully

## Troubleshooting

### Slow Responses

If responses are slow:
1. Check current machine size: `flyctl status`
2. Consider increasing memory in `fly.toml`
3. Set `min_machines_running = 1` to avoid cold starts

### CORS Errors

If you get CORS errors from the chat-app:
```bash
flyctl secrets set CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Connection Timeouts

If requests timeout:
1. Check if machine is running: `flyctl status`
2. Check logs for errors: `flyctl logs`
3. Verify database is accessible: `flyctl ssh console -C "ls -lh /data/"`

### Database Errors

If you get database-related errors:
```bash
# Verify database exists and is accessible
flyctl ssh console
ls -lh /data/
file /data/imdb.duckdb
exit
```

## Success Criteria

Your deployment is successful if:

1. ✅ Health endpoint returns "healthy" status
2. ✅ All test queries return valid data
3. ✅ Response times are < 3 seconds for most queries
4. ✅ Chat-app successfully calls all endpoints
5. ✅ No errors in Fly.io logs
6. ✅ CORS works correctly from your frontend
7. ✅ Database queries execute without errors

## Next Steps

Once testing is complete:

1. Deploy your frontend to Vercel (see PRODUCTION_DEPLOYMENT.md)
2. Set up monitoring/alerting
3. Configure custom domain (optional)
4. Set up automated backups
5. Document any performance tuning needed

## Getting Help

If you encounter issues:

1. Check logs: `flyctl logs`
2. Review Fly.io status: https://status.flyio.net/
3. Check deployment guide: see DEPLOYMENT.md
4. Fly.io community: https://community.fly.io/

