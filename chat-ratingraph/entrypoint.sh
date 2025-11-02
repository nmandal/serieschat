#!/bin/bash
set -e

echo "🔍 Checking for database at /data/imdb.duckdb..."

# Check source database size
SOURCE_SIZE=$(stat -c %s /app/imdb.duckdb 2>/dev/null || stat -f %z /app/imdb.duckdb)
echo "📊 Source database size: $(du -h /app/imdb.duckdb | cut -f1)"

# Copy database from image to volume if it doesn't exist or is corrupted
if [ ! -f "/data/imdb.duckdb" ]; then
    echo "📦 Database not found on volume. Copying from /app/imdb.duckdb..."
    cp -v /app/imdb.duckdb /data/imdb.duckdb
    sync
    echo "✅ Database copied successfully!"
    ls -lh /data/imdb.duckdb
elif [ $(stat -c %s /data/imdb.duckdb 2>/dev/null || stat -f %z /data/imdb.duckdb) -lt $SOURCE_SIZE ]; then
    echo "⚠️  Database on volume is smaller than source (corrupted). Removing and recopying..."
    rm -f /data/imdb.duckdb
    echo "📦 Copying fresh database from /app/imdb.duckdb..."
    cp -v /app/imdb.duckdb /data/imdb.duckdb
    sync
    echo "✅ Database copied successfully!"
    ls -lh /data/imdb.duckdb
else
    echo "✅ Database already exists on volume with correct size"
    ls -lh /data/imdb.duckdb
fi

# Verify the copy
TARGET_SIZE=$(stat -c %s /data/imdb.duckdb 2>/dev/null || stat -f %z /data/imdb.duckdb)
if [ $TARGET_SIZE -eq $SOURCE_SIZE ]; then
    echo "✅ Database verification passed: sizes match"
else
    echo "❌ Database verification failed: size mismatch (source: $SOURCE_SIZE, target: $TARGET_SIZE)"
    exit 1
fi

echo "🚀 Starting uvicorn server..."
exec python -m uvicorn 03_serve_api:app --host 0.0.0.0 --port 8000

