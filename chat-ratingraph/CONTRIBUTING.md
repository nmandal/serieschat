# Contributing to IMDb TV API

Thank you for your interest in contributing to the IMDb TV API! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/imdb-tv-api.git
   cd imdb-tv-api
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/imdb-tv-api.git
   ```

## Development Setup

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- 11GB free disk space for IMDb datasets
- Virtual environment tool (venv or virtualenv)

### Installation

1. **Create a virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up the database** (see [DATA_SETUP.md](DATA_SETUP.md)):
   ```bash
   python 01_build_imdb_duckdb.py
   ```

4. **Run the development server**:
   ```bash
   uvicorn 03_serve_api:app --host 127.0.0.1 --port 8000 --reload
   ```

5. **Test the API**:
   ```bash
   curl http://127.0.0.1:8000/health
   ```

## Making Changes

### Branch Naming

Create a descriptive branch name:
- `feature/add-new-endpoint` - for new features
- `fix/resolve-cors-issue` - for bug fixes
- `docs/update-readme` - for documentation
- `refactor/optimize-queries` - for code improvements

```bash
git checkout -b feature/your-feature-name
```

### Commit Messages

Write clear, descriptive commit messages:
```
Add endpoint for genre-based series filtering

- Implement /filter_by_genre endpoint
- Add genre validation
- Update API documentation
- Add tests for new endpoint
```

Follow the conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Submitting Pull Requests

1. **Update your fork** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues
   - Screenshots (if UI changes)
   - Test results

4. **Address review feedback** promptly

## Coding Standards

### Python Style Guide

Follow PEP 8 guidelines:

```python
# Good
def get_series_episodes(series_name: str, min_votes: int = 1000) -> list:
    """
    Retrieve all episodes for a given series.
    
    Args:
        series_name: Name of the TV series
        min_votes: Minimum number of votes required
        
    Returns:
        List of episode dictionaries
    """
    pass

# Bad
def getSeriesEpisodes(seriesName,minVotes=1000):
    pass
```

### Code Quality Tools

We recommend using:
- **black** - Code formatter
- **isort** - Import sorter
- **flake8** - Linter
- **mypy** - Type checker (future)

```bash
# Format code
black .

# Sort imports
isort .

# Check linting
flake8 .
```

### API Design Principles

1. **RESTful endpoints**: Use clear, noun-based URLs
2. **Consistent response format**: Always return JSON
3. **Error handling**: Use appropriate HTTP status codes
4. **Query parameters**: Use descriptive parameter names
5. **Documentation**: Document all endpoints with docstrings

### Database Queries

- Use parameterized queries to prevent SQL injection
- Optimize queries with proper indexes
- Test query performance with large datasets
- Add EXPLAIN ANALYZE for complex queries

Example:
```python
# Good - parameterized query
query = "SELECT * FROM titles WHERE tconst = ?"
result = con.execute(query, [title_id]).fetchall()

# Bad - string concatenation
query = f"SELECT * FROM titles WHERE tconst = '{title_id}'"
```

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_endpoints.py
```

### Writing Tests

Create tests for:
1. All new endpoints
2. Bug fixes
3. Edge cases
4. Error handling

Example test structure:
```python
def test_resolve_series_found():
    """Test that resolve_series returns correct data for existing series."""
    response = client.get("/resolve_series?name=Breaking Bad")
    assert response.status_code == 200
    data = response.json()
    assert data["primaryTitle"] == "Breaking Bad"
    assert "tconst" in data

def test_resolve_series_not_found():
    """Test that resolve_series returns 404 for non-existent series."""
    response = client.get("/resolve_series?name=NonExistentSeries123")
    assert response.status_code == 404
```

## Documentation

### API Documentation

- Update `API_REFERENCE.md` for new endpoints
- Include examples with curl commands
- Document all query parameters
- Show example responses

### Code Documentation

Use clear docstrings:
```python
def weighted_rating(votes: int, rating: float, min_votes: int, mean_rating: float) -> float:
    """
    Calculate IMDb weighted rating (Bayesian average).
    
    Formula: WR = (v/(v+m)) * R + (m/(v+m)) * C
    
    Args:
        votes: Number of votes for the item
        rating: Average rating for the item
        min_votes: Minimum votes threshold
        mean_rating: Mean rating across all items
        
    Returns:
        Weighted rating as a float
        
    Example:
        >>> weighted_rating(5000, 9.0, 1000, 7.5)
        8.833...
    """
    return (votes / (votes + min_votes)) * rating + (min_votes / (votes + min_votes)) * mean_rating
```

## Project Structure

```
imdb-tv-api/
├── 01_build_imdb_duckdb.py   # Database building script
├── 02_chart_series.py         # Chart generation
├── 03_serve_api.py            # FastAPI server
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container configuration
├── docker-compose.yml         # Local development setup
├── fly.toml                   # Fly.io deployment config
├── DATA_SETUP.md             # Dataset setup guide
├── API_REFERENCE.md          # Complete API documentation
└── tests/                    # Test files (future)
```

## Common Tasks

### Adding a New Endpoint

1. Add the endpoint function in `03_serve_api.py`
2. Include proper type hints and docstring
3. Test the endpoint locally
4. Update `API_REFERENCE.md`
5. Add tests
6. Submit PR

### Optimizing Database Queries

1. Use `EXPLAIN ANALYZE` to check query performance
2. Add indexes if needed
3. Test with large datasets
4. Document optimizations in commit message

### Updating Dependencies

1. Update `requirements.txt`
2. Test all functionality
3. Update documentation if API changes
4. Note breaking changes in PR description

## Questions or Issues?

- **Bug reports**: Open an issue with the bug template
- **Feature requests**: Open an issue with the feature template
- **Questions**: Use GitHub Discussions
- **Security issues**: Email security@yourdomain.com (do not open public issue)

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

## Recognition

Contributors will be recognized in the project README. Thank you for helping improve the IMDb TV API!

