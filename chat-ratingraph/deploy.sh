#!/bin/bash
# Deployment script for IMDb API to Fly.io

set -e

echo "🚀 IMDb API Deployment Script"
echo "=============================="
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl is not installed"
    echo "Install it with: brew install flyctl (macOS) or visit https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if database exists
if [ ! -f "imdb.duckdb" ]; then
    echo "❌ Error: imdb.duckdb not found"
    echo "Please ensure the database file exists in this directory"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Check if already logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Please login to Fly.io..."
    flyctl auth login
else
    echo "✅ Already authenticated with Fly.io"
fi

echo ""
echo "📦 Deploying application..."
echo ""

# Check if app exists
if flyctl status &> /dev/null; then
    echo "♻️  App already exists, deploying update..."
    flyctl deploy
else
    echo "🆕 Creating new app..."
    echo "Follow the prompts to configure your app"
    echo ""
    
    # Launch without deploying first
    flyctl launch --no-deploy
    
    echo ""
    echo "📁 Creating persistent volume for database..."
    
    # Get the app name from fly.toml
    APP_NAME=$(grep "^app = " fly.toml | cut -d'"' -f2)
    REGION=$(grep "^primary_region = " fly.toml | cut -d'"' -f2)
    
    echo "Creating 3GB volume in region: $REGION"
    flyctl volumes create imdb_data --size 3 --region "$REGION" --yes
    
    echo ""
    echo "🚢 Deploying application..."
    flyctl deploy
    
    echo ""
    echo "📤 Copying database to persistent volume..."
    echo "This is a one-time setup step..."
    
    # Wait for app to be ready
    sleep 10
    
    # Copy database to volume
    flyctl ssh console -C "cp /app/imdb.duckdb /data/imdb.duckdb && echo 'Database copied successfully'"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Getting app information..."
flyctl info

echo ""
echo "📊 Testing health endpoint..."
APP_URL=$(flyctl info --json | grep -o '"Hostname":"[^"]*' | cut -d'"' -f4)

if [ -n "$APP_URL" ]; then
    echo "Testing: https://$APP_URL/health"
    sleep 5
    curl -s "https://$APP_URL/health" | python3 -m json.tool || echo "Health check pending..."
    
    echo ""
    echo "✨ Your API is live at: https://$APP_URL"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your chat-app environment variables with: https://$APP_URL"
    echo "2. Test the API endpoints"
    echo "3. Monitor logs with: flyctl logs"
else
    echo "⚠️  Could not determine app URL. Run 'flyctl info' to get it."
fi

echo ""
echo "Done! 🎉"

