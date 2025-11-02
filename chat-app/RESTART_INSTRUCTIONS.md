# 🔧 RESTART TO FIX - Complete Instructions

## ✅ API Server is WORKING

I just tested all endpoints - they work perfectly:
- ✅ search_series - Working
- ✅ compare_series - Working (Breaking Bad: 8.96, The Wire: 8.57)
- ✅ series_analytics - Working (The Wire: 8.57 avg, 0.44 consistency)
- ✅ worst_episodes - Working (GoT S8E6 "The Iron Throne": 4.0/10)

## ❌ Why Chat App Shows Errors

The chat app is using OLD cached code. You need to restart it.

## 🚀 SOLUTION - Restart Both Servers

### Step 1: Stop Everything

```bash
# Kill all related processes
pkill -f "next dev"
pkill -f "uvicorn"
pkill -f "03_serve_api"
```

### Step 2: Start Fresh

**Option A - Use pnpm dev (Easiest)**
```bash
cd /Users/nick/code/hackathon/chat-app
pnpm dev
```

This runs both servers automatically.

**Option B - Run Separately (if Option A doesn't work)**

Terminal 1 - API Server:
```bash
cd /Users/nick/code/hackathon/serieschat-api
source .venv/bin/activate
python -m uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2 - Chat App:
```bash
cd /Users/nick/code/hackathon/chat-app  
pnpm dev:chat
```

### Step 3: Hard Refresh Browser

After servers restart:
1. Go to http://localhost:3000
2. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Or open in incognito/private window

### Step 4: Test With These Queries

1. "Find crime dramas with ratings above 8.5"
2. "Compare Breaking Bad and The Wire"
3. "Analyze Game of Thrones"
4. "What are the worst episodes of The Walking Dead?"

## 🎯 Expected Results

You should see:
- **searchSeries**: Grid of series with genre tags and ratings
- **compareSeries**: Side-by-side comparison cards with trophy for winner
- **seriesAnalytics**: Dashboard with trends, distribution, and finale analysis
- **worstEpisodes**: Red-themed cards showing lowest-rated episodes

## 🐛 Still Not Working?

### Check API is Running on Port 8000

```bash
curl http://127.0.0.1:8000/
```

Should show 8 endpoints including the new ones.

### Check Chat App is Running on Port 3000

Open http://localhost:3000 in browser

### Check Browser Console

Press F12 → Console tab
Look for errors like:
- "Failed to fetch"
- CORS errors
- Network errors

### Verify Tool Files Exist

```bash
ls -la /Users/nick/code/hackathon/chat-app/lib/ai/tools/*.ts
```

Should show:
- search-series.ts (NOT .tsx!)
- compare-series.ts
- series-analytics.ts
- worst-episodes.ts

## 📝 Quick Verification Script

Run this to verify everything:

```bash
echo "=== Checking API ==="
curl -s http://127.0.0.1:8000/ | grep -o "search_series\|compare_series" || echo "❌ API not updated"

echo "=== Checking Next.js ==="
curl -s http://localhost:3000 | grep -o "next" && echo "✅ Next.js running" || echo "❌ Next.js not running"

echo "=== Checking Tool Files ==="
ls /Users/nick/code/hackathon/chat-app/lib/ai/tools/search-series.ts && echo "✅ search-series.ts exists" || echo "❌ Missing"
ls /Users/nick/code/hackathon/chat-app/lib/ai/tools/compare-series.ts && echo "✅ compare-series.ts exists" || echo "❌ Missing"
ls /Users/nick/code/hackathon/chat-app/lib/ai/tools/series-analytics.ts && echo "✅ series-analytics.ts exists" || echo "❌ Missing"
ls /Users/nick/code/hackathon/chat-app/lib/ai/tools/worst-episodes.ts && echo "✅ worst-episodes.ts exists" || echo "❌ Missing"
```

## 💡 Pro Tip

If `pnpm dev` doesn't work properly, use Option B (two separate terminals). This gives you more control and lets you see errors in each server separately.

