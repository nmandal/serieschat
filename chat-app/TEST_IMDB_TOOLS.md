# Testing IMDb Tools

## ✅ API Server Status: WORKING

All 8 API endpoints are operational:
- ✅ `/health` - Working
- ✅ `/resolve_series` - Working
- ✅ `/episodes` - Working  
- ✅ `/top_episodes` - Working
- ✅ `/search_series` - Working ⭐ NEW
- ✅ `/compare_series` - Working ⭐ NEW
- ✅ `/series_analytics` - Working ⭐ NEW
- ✅ `/worst_episodes` - Working ⭐ NEW

## 🔧 How to Fix "Not Working" Issues

### Step 1: Restart Everything

The tools won't work until you restart the dev server to pick up the new code:

```bash
# Kill any existing processes
pkill -f "next dev"
pkill -f "03_serve_api"

# Start fresh from chat-app directory
cd /Users/nick/code/hackathon/chat-app
pnpm dev
```

This will start both:
- Next.js dev server (chat app)
- FastAPI server (IMDb API)

### Step 2: Verify API is Running

Open another terminal and test:

```bash
curl http://127.0.0.1:8000/health
# Should return: {"status":"healthy","database":"imdb.duckdb","titles_count":12015202}

curl "http://127.0.0.1:8000/search_series?genre=Drama&limit=1"
# Should return series data
```

### Step 3: Test in Chat

Once both servers are running, try these queries in the chat:

**Test Basic Tools:**
1. "What are the best episodes of Breaking Bad?"
2. "Show me all Game of Thrones episodes"
3. "Is the IMDb database working?"

**Test New Advanced Tools:**
1. "Find crime dramas from the 2000s with ratings above 8.5"
2. "Compare Breaking Bad, The Wire, and The Sopranos"
3. "Analyze the quality trends of Game of Thrones"
4. "What are the worst episodes of The Walking Dead?"

## 🐛 Troubleshooting

### Problem: "Failed to connect to IMDb API"

**Solution:**
```bash
# Make sure API is running
curl http://127.0.0.1:8000/health

# If not running, start it:
cd /Users/nick/code/hackathon/serieschat-api
source .venv/bin/activate
python 03_serve_api.py
```

### Problem: Tools don't appear in chat

**Solution:**
1. Hard refresh browser (Cmd+Shift+R on Mac)
2. Check browser console for errors (F12 → Console tab)
3. Verify Next.js dev server is running on port 3000
4. Check terminal for any TypeScript errors

### Problem: "Series not found"

**Solution:**
- Check spelling (e.g., "The Wire" not "Wire")
- Try exact titles from IMDb
- Some series may not have episode data in the database

### Problem: Visualizations don't show

**Solution:**
1. Clear browser cache
2. Check if tool call completed (should show "Completed" badge)
3. Look for error messages in the tool output
4. Open browser DevTools to check for React errors

## ✅ Verification Checklist

Run through this list to confirm everything works:

- [ ] API health endpoint responds: `curl http://127.0.0.1:8000/health`
- [ ] Chat app loads at http://localhost:3000
- [ ] Can ask: "What are the best episodes of Breaking Bad?"
- [ ] Can ask: "Find crime dramas with high ratings"
- [ ] Can ask: "Compare Breaking Bad and The Wire"
- [ ] Can ask: "Analyze Game of Thrones"
- [ ] Can ask: "Show worst episodes of any series"
- [ ] Tool results show beautiful visualizations
- [ ] Can hover over episodes to see details
- [ ] Can expand/collapse sections

## 📝 Example Commands to Copy/Paste

```bash
# OPTION 1: Use pnpm dev (runs both servers)
cd /Users/nick/code/hackathon/chat-app
pnpm dev

# OPTION 2: Run separately (2 terminals)
# Terminal 1:
cd /Users/nick/code/hackathon/chat-app
pnpm dev:chat

# Terminal 2:
cd /Users/nick/code/hackathon/serieschat-api
source .venv/bin/activate
uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000 --reload
```

## 🎯 Quick Test Queries

Copy and paste these into your chat:

### Search
"Find sci-fi series that started after 2015 with ratings above 8"

### Compare  
"Compare Breaking Bad, Better Call Saul, The Sopranos, and The Wire"

### Analytics
"Give me detailed analytics for Breaking Bad including season trends"

### Worst Episodes
"What are the 5 worst episodes of Game of Thrones?"

## ✨ Expected Results

When working correctly, you should see:
- **Tool call badge** showing "Running" → "Completed"
- **Collapsible sections** with tool parameters
- **Beautiful visualizations** with:
  - Color-coded cards (purple, blue, amber, etc.)
  - Star ratings with fill
  - Progress bars
  - Hover effects
  - Trophy badges for winners
  - Expandable season details

If you see all of this, everything is working! 🎉

