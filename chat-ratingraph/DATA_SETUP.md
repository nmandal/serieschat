# IMDb Dataset Setup Guide

This guide explains how to download and prepare the IMDb datasets for use with the IMDb TV API.

## Overview

The IMDb TV API uses a local DuckDB database built from IMDb's public datasets. These datasets are large (approximately 9GB total) and are **not included** in this repository. You need to download them separately.

## Quick Start

```bash
# 1. Download the IMDb datasets (they will be downloaded automatically by the build script)
python 01_build_imdb_duckdb.py

# This script will:
# - Download all required TSV files from IMDb
# - Build the DuckDB database (imdb.duckdb)
# - Create optimized indexes
# - Takes ~15-30 minutes depending on your connection
```

## Manual Download (Optional)

If you prefer to download the datasets manually or the automated download fails:

### Required Dataset Files

Download these files from [IMDb Datasets](https://datasets.imdbws.com/):

| File | Size | Description |
|------|------|-------------|
| `title.basics.tsv.gz` | ~991MB | Basic title information |
| `title.ratings.tsv.gz` | ~27MB | IMDb ratings and vote counts |
| `title.episode.tsv.gz` | ~231MB | TV episode information |
| `title.akas.tsv.gz` | ~2.5GB | Alternative titles (optional) |
| `title.crew.tsv.gz` | ~378MB | Director and writer info (optional) |
| `title.principals.tsv.gz` | ~4.0GB | Cast and crew (optional) |
| `name.basics.tsv.gz` | ~868MB | Names/people (optional) |

### Download Commands

```bash
# Download required files
curl -O https://datasets.imdbws.com/title.basics.tsv.gz
curl -O https://datasets.imdbws.com/title.ratings.tsv.gz
curl -O https://datasets.imdbws.com/title.episode.tsv.gz

# Optional files for extended functionality
curl -O https://datasets.imdbws.com/title.akas.tsv.gz
curl -O https://datasets.imdbws.com/title.crew.tsv.gz
curl -O https://datasets.imdbws.com/title.principals.tsv.gz
curl -O https://datasets.imdbws.com/name.basics.tsv.gz

# Extract the files
gunzip *.tsv.gz
```

## Building the Database

Once you have the TSV files (either from manual or automatic download):

```bash
# Activate your virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Build the database
python 01_build_imdb_duckdb.py
```

The script will:
1. Read all TSV files
2. Create the `imdb.duckdb` database (~1.8GB)
3. Build optimized indexes for fast queries
4. Create aggregated views for episode analytics

### What Gets Created

After the build completes, you'll have:
- `imdb.duckdb` - Main database file (~1.8GB)
- Indexed tables for fast lookups
- `episode_panel` view joining episodes with ratings and series info

## Database Statistics

The resulting database contains:
- **12M+ titles** (movies, TV series, episodes, etc.)
- **1.6M+ rated titles**
- **817K+ rated TV episodes**
- **202K+ TV series**

## Storage Requirements

- **Source TSV files**: ~9GB uncompressed
- **DuckDB database**: ~1.8GB
- **Total disk space needed**: ~11GB (can delete TSVs after build)

## Data Freshness

IMDb updates their datasets daily. To get the latest data:

```bash
# Remove old files
rm *.tsv imdb.duckdb

# Re-download and rebuild
python 01_build_imdb_duckdb.py
```

## Troubleshooting

### Download Fails

If automatic download fails, use manual download with `curl` commands above.

### Out of Memory

The build process requires ~2-4GB of RAM. If you encounter memory errors:
- Close other applications
- Increase available RAM
- Use a machine with more memory

### Slow Performance

Building the database is I/O intensive:
- Use an SSD if possible
- Expect 15-30 minutes for full build
- Progress is logged to console

### Missing TSV Files

If you get a "file not found" error:
1. Ensure TSV files are in the same directory as the script
2. Check file names match exactly (e.g., `title.basics.tsv`)
3. Files must be uncompressed (not `.gz`)

## Docker Build

When building the Docker image, the database should be pre-built:

```bash
# Build database locally first
python 01_build_imdb_duckdb.py

# Then build Docker image (copies database into image)
docker build -t imdb-tv-api .
```

For production deployment on Fly.io, the database is copied to a persistent volume during initial deployment.

## Dataset Documentation

Full documentation of IMDb datasets: https://developer.imdb.com/non-commercial-datasets/

### Important Notes

1. **License**: IMDb datasets are for **personal and non-commercial use only**
2. **Attribution**: Attribute IMDb when using this data
3. **Updates**: Datasets are refreshed daily by IMDb
4. **Format**: TSV files use `\N` for NULL values (handled automatically)

## Advanced: Custom Builds

To customize which data gets loaded, edit `01_build_imdb_duckdb.py`:

```python
# Example: Load only movies and series (skip episodes)
# Comment out the episode loading section
```

## Next Steps

After setting up the data:
1. Start the API server: `uvicorn 03_serve_api:app --reload`
2. Test the API: `curl http://127.0.0.1:8000/health`
3. See `README.md` for API usage examples
4. See `API_REFERENCE.md` for complete endpoint documentation

## Support

If you encounter issues:
- Check that TSV files are valid (not corrupted)
- Verify you have sufficient disk space
- Review logs during build process
- Try manual download if automatic fails

