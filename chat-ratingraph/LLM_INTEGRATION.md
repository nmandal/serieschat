# LLM Integration Guide: IMDb Data Tools

This guide explains how to integrate the IMDb API with Large Language Models (LLMs) using function/tool calling to create interactive, conversational experiences with IMDb data.

## Table of Contents

1. [Overview](#overview)
2. [Tool Definitions](#tool-definitions)
3. [Example Conversations](#example-conversations)
4. [Implementation Examples](#implementation-examples)
5. [Best Practices](#best-practices)
6. [Advanced Use Cases](#advanced-use-cases)

---

## Overview

### What is LLM Tool Calling?

Modern LLMs (like GPT-4, Claude, Gemini) support **function/tool calling**, which allows them to:
- Recognize when they need external data
- Format requests to specific APIs
- Process responses and present them naturally to users
- Chain multiple API calls together for complex queries

### Architecture

```
User Query → LLM → Tool Call Decision → API Request → Database → Response → LLM → Natural Language
```

### Available Tools

Your IMDb API provides 4 primary tools:

1. **resolve_series** - Find TV series by name
2. **get_episodes** - Retrieve all episodes for a series
3. **get_top_episodes** - Get ranked episodes using weighted ratings
4. **health_check** - Verify system status

---

## Tool Definitions

### Tool Schemas for LLM Integration

Here are the tool definitions in OpenAI function calling format (adaptable to other LLM providers):

#### 1. Resolve Series Tool

```json
{
  "name": "resolve_series",
  "description": "Find a TV series in the IMDb database by name. Returns series metadata including title, ID (tconst), years, and genres. Use this first when a user asks about any TV show.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the TV series to search for (e.g., 'Breaking Bad', 'Game of Thrones')"
      }
    },
    "required": ["name"]
  },
  "implementation": {
    "method": "GET",
    "url": "http://127.0.0.1:8000/resolve_series",
    "params": ["name"]
  }
}
```

**Example Response:**
```json
{
  "tconst": "tt0903747",
  "title": "Breaking Bad",
  "startYear": 2008,
  "endYear": 2013,
  "genres": "Crime,Drama,Thriller"
}
```

#### 2. Get Episodes Tool

```json
{
  "name": "get_episodes",
  "description": "Retrieve all episodes with ratings for a TV series. Returns season numbers, episode numbers, titles, ratings, and vote counts. Use this to analyze episode data, find patterns, or answer questions about specific episodes.",
  "parameters": {
    "type": "object",
    "properties": {
      "series": {
        "type": "string",
        "description": "The name of the TV series (e.g., 'Breaking Bad')"
      }
    },
    "required": ["series"]
  },
  "implementation": {
    "method": "GET",
    "url": "http://127.0.0.1:8000/episodes",
    "params": ["series"]
  }
}
```

**Example Response:**
```json
{
  "series": "Breaking Bad",
  "tconst": "tt0903747",
  "episode_count": 62,
  "episodes": [
    {
      "season": 1,
      "episode": 1,
      "title": "Pilot",
      "rating": 8.9,
      "votes": 53421,
      "tconst": "tt0959621"
    }
  ]
}
```

#### 3. Get Top Episodes Tool

```json
{
  "name": "get_top_episodes",
  "description": "Get the highest-rated episodes for a TV series using IMDb's weighted rating formula. This prevents episodes with few votes from dominating rankings. Use this when users ask for 'best episodes', 'top rated', or 'must-watch episodes'.",
  "parameters": {
    "type": "object",
    "properties": {
      "series": {
        "type": "string",
        "description": "The name of the TV series"
      },
      "min_votes": {
        "type": "integer",
        "description": "Minimum number of votes required for an episode to be included (default: 1000). Higher values ensure more reliable ratings.",
        "default": 1000
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of episodes to return (default: 10)",
        "default": 10
      },
      "m": {
        "type": "integer",
        "description": "Weight parameter for the ranking formula (default: 1000). Higher values give more weight to the series average.",
        "default": 1000
      }
    },
    "required": ["series"]
  },
  "implementation": {
    "method": "GET",
    "url": "http://127.0.0.1:8000/top_episodes",
    "params": ["series", "min_votes", "limit", "m"]
  }
}
```

**Example Response:**
```json
{
  "series": "Breaking Bad",
  "tconst": "tt0903747",
  "mean_rating": 8.96,
  "min_votes": 1000,
  "weight_parameter": 1000,
  "episodes": [
    {
      "rank": 1,
      "season": 5,
      "episode": 14,
      "title": "Ozymandias",
      "rating": 10.0,
      "votes": 267735,
      "tconst": "tt2301451",
      "weighted_rating": 9.996
    }
  ]
}
```

#### 4. Health Check Tool

```json
{
  "name": "check_imdb_health",
  "description": "Check if the IMDb database and API are available and functioning. Returns database statistics. Use this to verify system status before making other queries.",
  "parameters": {
    "type": "object",
    "properties": {}
  },
  "implementation": {
    "method": "GET",
    "url": "http://127.0.0.1:8000/health"
  }
}
```

---

## Example Conversations

### Example 1: Simple Query

**User:** "What are the best episodes of Breaking Bad?"

**LLM Internal Process:**
1. Recognizes need for TV data
2. Calls `get_top_episodes` tool

**Tool Call:**
```json
{
  "tool": "get_top_episodes",
  "arguments": {
    "series": "Breaking Bad",
    "min_votes": 5000,
    "limit": 5
  }
}
```

**LLM Response:**
> "The best episodes of Breaking Bad according to IMDb ratings are:
> 
> 1. **Ozymandias** (S5E14) - 10.0/10 with 267,735 votes
> 2. **Felina** (S5E16) - 9.9/10 with 170,331 votes
> 3. **Face Off** (S4E13) - 9.9/10 with 92,699 votes
> 4. **To'hajiilee** (S5E13) - 9.8/10 with 68,970 votes
> 5. **Granite State** (S5E15) - 9.7/10 with 67,441 votes
>
> The series finale and Season 5 episodes dominate the top spots!"

---

### Example 2: Multi-Step Query

**User:** "How does Breaking Bad compare to The Wire? Which has higher-rated episodes?"

**LLM Internal Process:**
1. Needs data for both series
2. Calls `get_episodes` for Breaking Bad
3. Calls `get_episodes` for The Wire
4. Analyzes and compares data

**Tool Calls:**
```json
[
  {
    "tool": "get_episodes",
    "arguments": {"series": "Breaking Bad"}
  },
  {
    "tool": "get_episodes",
    "arguments": {"series": "The Wire"}
  }
]
```

**LLM Response:**
> "Based on IMDb ratings:
> 
> **Breaking Bad:**
> - Average rating: 8.96/10
> - 62 episodes across 5 seasons
> - Highest: 10.0/10 (Ozymandias)
> - Most consistent quality throughout
> 
> **The Wire:**
> - Average rating: 9.08/10
> - 60 episodes across 5 seasons
> - Highest: 9.7/10 (multiple episodes)
> - Slightly higher average overall
> 
> The Wire has a marginally higher average rating, but Breaking Bad has the single highest-rated episode. Both are critically acclaimed masterpieces!"

---

### Example 3: Analytical Query

**User:** "Did Game of Thrones get worse over time? Show me season-by-season ratings."

**LLM Internal Process:**
1. Calls `get_episodes` for Game of Thrones
2. Analyzes by season
3. Calculates trends

**Tool Call:**
```json
{
  "tool": "get_episodes",
  "arguments": {"series": "Game of Thrones"}
}
```

**LLM Response:**
> "Here's the season-by-season analysis for Game of Thrones:
> 
> - **Season 1:** 9.08 average (strong start)
> - **Season 2:** 9.02 average (maintained quality)
> - **Season 3:** 9.27 average (peak season)
> - **Season 4:** 9.35 average (highest rated)
> - **Season 5:** 8.85 average (slight dip)
> - **Season 6:** 9.12 average (recovery)
> - **Season 7:** 9.05 average (solid)
> - **Season 8:** 6.23 average (significant decline)
> 
> Yes, the data shows a dramatic drop in Season 8, with the finale 'The Iron Throne' rated just 4.0/10 - the lowest in the entire series. Seasons 3-4 were the critical peak."

---

### Example 4: Discovery Query

**User:** "I want to watch a crime drama. What are some highly-rated options?"

**LLM Internal Process:**
1. User wants recommendations
2. Can search multiple series
3. Compares ratings and genres

**Tool Calls:**
```json
[
  {
    "tool": "resolve_series",
    "arguments": {"series": "Breaking Bad"}
  },
  {
    "tool": "get_episodes",
    "arguments": {"series": "Breaking Bad"}
  },
  {
    "tool": "resolve_series",
    "arguments": {"series": "The Sopranos"}
  },
  {
    "tool": "get_episodes",
    "arguments": {"series": "The Sopranos"}
  }
]
```

**LLM Response:**
> "Based on the database, here are exceptional crime dramas:
> 
> **Breaking Bad** (2008-2013)
> - Genres: Crime, Drama, Thriller
> - Average rating: 8.96/10
> - 62 episodes of intense character-driven storytelling
> - Best for: Tight plotting, character transformation
> 
> **The Sopranos** (1999-2007)
> - Genres: Crime, Drama
> - Average rating: 9.2/10
> - 86 episodes of psychological depth
> - Best for: Complex characters, family dynamics
> 
> Both are considered among the greatest TV series ever made!"

---

### Example 5: Comparison Query

**User:** "What's the worst-rated episode of Breaking Bad and why might it be controversial?"

**LLM Internal Process:**
1. Gets all episodes
2. Finds minimum rating
3. Provides context

**Tool Call:**
```json
{
  "tool": "get_episodes",
  "arguments": {"series": "Breaking Bad"}
}
```

**LLM Response:**
> "The lowest-rated Breaking Bad episode is **'Fly'** (S3E10) with 8.0/10 - though that's still a strong rating!
> 
> This episode is controversial because:
> - It's a 'bottle episode' (single location, minimal cast)
> - Very dialogue-heavy and contemplative
> - Little plot advancement
> - Some viewers found it slow
> - Others consider it an artistic character study
> 
> Interestingly, even Breaking Bad's 'worst' episode rates 8.0/10, showing the series' consistent quality. The episode divides fans between those who appreciate its introspective nature and those who prefer the show's typical intensity."

---

## Implementation Examples

### OpenAI Integration (Python)

```python
import openai
import requests

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_top_episodes",
            "description": "Get the highest-rated episodes for a TV series using weighted ratings",
            "parameters": {
                "type": "object",
                "properties": {
                    "series": {"type": "string", "description": "TV series name"},
                    "min_votes": {"type": "integer", "description": "Minimum votes", "default": 1000},
                    "limit": {"type": "integer", "description": "Number of results", "default": 10}
                },
                "required": ["series"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_episodes",
            "description": "Get all episodes with ratings for a TV series",
            "parameters": {
                "type": "object",
                "properties": {
                    "series": {"type": "string", "description": "TV series name"}
                },
                "required": ["series"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "resolve_series",
            "description": "Find a TV series by name and get metadata",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Series name to search"}
                },
                "required": ["name"]
            }
        }
    }
]

# Tool execution functions
def execute_tool(tool_name, arguments):
    """Execute API calls based on tool name"""
    base_url = "http://127.0.0.1:8000"
    
    if tool_name == "get_top_episodes":
        response = requests.get(
            f"{base_url}/top_episodes",
            params={
                "series": arguments["series"],
                "min_votes": arguments.get("min_votes", 1000),
                "limit": arguments.get("limit", 10)
            }
        )
    elif tool_name == "get_episodes":
        response = requests.get(
            f"{base_url}/episodes",
            params={"series": arguments["series"]}
        )
    elif tool_name == "resolve_series":
        response = requests.get(
            f"{base_url}/resolve_series",
            params={"name": arguments["name"]}
        )
    
    return response.json()

# Chat with tool calling
def chat_with_imdb(user_message):
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant with access to IMDb TV series data. Use the available tools to answer questions about TV shows, episodes, and ratings."
        },
        {"role": "user", "content": user_message}
    ]
    
    # Initial LLM call
    response = openai.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )
    
    # Handle tool calls
    while response.choices[0].message.tool_calls:
        messages.append(response.choices[0].message)
        
        for tool_call in response.choices[0].message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            
            # Execute the tool
            function_response = execute_tool(function_name, function_args)
            
            # Add tool response to messages
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(function_response)
            })
        
        # Get final response
        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
    
    return response.choices[0].message.content

# Example usage
print(chat_with_imdb("What are the top 5 episodes of Breaking Bad?"))
```

---

### Claude Integration (Python + Anthropic SDK)

```python
import anthropic
import requests
import json

client = anthropic.Anthropic(api_key="your-api-key")

tools = [
    {
        "name": "get_top_episodes",
        "description": "Get the highest-rated episodes for a TV series using IMDb's weighted rating formula",
        "input_schema": {
            "type": "object",
            "properties": {
                "series": {"type": "string", "description": "TV series name"},
                "min_votes": {"type": "integer", "description": "Minimum votes threshold"},
                "limit": {"type": "integer", "description": "Number of results"}
            },
            "required": ["series"]
        }
    },
    {
        "name": "get_episodes",
        "description": "Retrieve all episodes with ratings for a TV series",
        "input_schema": {
            "type": "object",
            "properties": {
                "series": {"type": "string", "description": "TV series name"}
            },
            "required": ["series"]
        }
    }
]

def process_tool_call(tool_name, tool_input):
    """Execute tool calls"""
    base_url = "http://127.0.0.1:8000"
    
    if tool_name == "get_top_episodes":
        response = requests.get(
            f"{base_url}/top_episodes",
            params={
                "series": tool_input["series"],
                "min_votes": tool_input.get("min_votes", 1000),
                "limit": tool_input.get("limit", 10)
            }
        )
    elif tool_name == "get_episodes":
        response = requests.get(
            f"{base_url}/episodes",
            params={"series": tool_input["series"]}
        )
    
    return response.json()

def chat_with_claude(user_message):
    messages = [{"role": "user", "content": user_message}]
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        tools=tools,
        messages=messages
    )
    
    # Handle tool use
    while response.stop_reason == "tool_use":
        tool_use = next(block for block in response.content if block.type == "tool_use")
        
        # Execute tool
        tool_result = process_tool_call(tool_use.name, tool_use.input)
        
        # Continue conversation
        messages = [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": response.content},
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": json.dumps(tool_result)
                    }
                ]
            }
        ]
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )
    
    return response.content[0].text

# Example usage
print(chat_with_claude("Compare the ratings of Breaking Bad and Better Call Saul"))
```

---

### LangChain Integration

```python
from langchain.tools import Tool
from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatOpenAI
import requests

def get_top_episodes_func(query: str) -> str:
    """Get top episodes for a series"""
    # Parse query (simple approach - could be more sophisticated)
    series = query.replace("top episodes of ", "").replace("best ", "")
    
    response = requests.get(
        "http://127.0.0.1:8000/top_episodes",
        params={"series": series, "limit": 5}
    )
    return response.json()

def get_all_episodes_func(series: str) -> str:
    """Get all episodes for a series"""
    response = requests.get(
        "http://127.0.0.1:8000/episodes",
        params={"series": series}
    )
    return response.json()

# Define tools
tools = [
    Tool(
        name="GetTopEpisodes",
        func=get_top_episodes_func,
        description="Get the top-rated episodes of a TV series. Input should be the series name."
    ),
    Tool(
        name="GetAllEpisodes",
        func=get_all_episodes_func,
        description="Get all episodes and ratings for a TV series. Input should be the series name."
    )
]

# Initialize agent
llm = ChatOpenAI(temperature=0, model="gpt-4-turbo-preview")
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)

# Use agent
result = agent.run("What are the best episodes of The Sopranos?")
print(result)
```

---

## Best Practices

### 1. Tool Selection Strategy

**For the LLM to choose the right tool:**

- **Use `resolve_series` when:**
  - User mentions a show but you need metadata
  - Need to verify a series exists
  - Want genre information

- **Use `get_episodes` when:**
  - User asks about all episodes
  - Need to calculate statistics (averages, trends)
  - Comparing multiple aspects of a series
  - Analyzing season-by-season patterns

- **Use `get_top_episodes` when:**
  - User explicitly asks for "best" or "top" episodes
  - Need ranked results
  - User wants recommendations for what to watch
  - Comparing highest-rated content

### 2. Error Handling

Always handle cases where:
- Series name might be misspelled
- Series doesn't exist in database
- API is unavailable
- No episodes have sufficient votes

Example prompt instruction:
```
If a series is not found, try common variations:
- "GOT" → "Game of Thrones"
- "BB" → "Breaking Bad"
- Check for "The" prefix variations

If still not found, ask the user to clarify or suggest similar shows.
```

### 3. Data Interpretation

**Teach the LLM to:**

- **Contextualize ratings:** An 8.0 episode in Breaking Bad is still excellent
- **Note vote counts:** Higher votes = more reliable ratings
- **Explain weighted ratings:** Why they prevent outliers
- **Identify patterns:** Season finales often rated higher
- **Consider recency bias:** Newer shows may have inflated ratings

### 4. Response Formatting

**Guide the LLM to:**

- Format episode references consistently: "S05E14" or "Season 5, Episode 14"
- Include vote counts for context
- Use markdown for readability
- Provide both quantitative data and qualitative insights
- Cite specific episodes when making claims

### 5. Multi-Tool Workflows

**Common patterns:**

```
Query: "Should I watch Breaking Bad or Better Call Saul?"
Tools: 
  1. get_episodes("Breaking Bad")
  2. get_episodes("Better Call Saul")
  3. Analyze and compare

Query: "What's the best episode of Breaking Bad and why?"
Tools:
  1. get_top_episodes("Breaking Bad", limit=1)
  2. Provide context about why it's highly rated

Query: "Has The Walking Dead gotten better or worse?"
Tools:
  1. get_episodes("The Walking Dead")
  2. Calculate season averages
  3. Identify trends
```

---

## Advanced Use Cases

### 1. Trend Analysis

**User Query:** "Which shows have the most consistent quality?"

**Approach:**
1. Get episodes for multiple series
2. Calculate standard deviation of ratings
3. Rank by consistency

### 2. Season Comparison

**User Query:** "What's the best season of Game of Thrones?"

**Approach:**
1. Get all episodes
2. Group by season
3. Calculate season averages
4. Consider episode count and vote weights

### 3. Episode Recommendations

**User Query:** "I'm starting The Wire - which episodes are must-watch?"

**Approach:**
1. Get top episodes with high vote threshold
2. Filter by different seasons for variety
3. Explain why each is significant

### 4. Data Visualization Descriptions

**User Query:** "Describe the rating progression of Breaking Bad"

**Approach:**
1. Get all episodes
2. Describe arc: "Starts strong at 8.9, maintains high 8s, peaks in Season 5"
3. Note standout episodes
4. Mention any dips

### 5. Cross-Series Analytics

**User Query:** "Do finales typically have higher ratings?"

**Approach:**
1. Query multiple series
2. Compare finale ratings to season averages
3. Provide statistical summary

---

## System Prompt Template

Here's a comprehensive system prompt for LLM integration:

```
You are an AI assistant with access to a comprehensive IMDb TV series database. You can query episode ratings, rankings, and metadata through specialized tools.

AVAILABLE TOOLS:
1. resolve_series - Find series metadata by name
2. get_episodes - Get all episodes and ratings for a series
3. get_top_episodes - Get ranked episodes using weighted ratings

GUIDELINES:
- Always use tools to get accurate, current data
- Contextualize ratings (8.0+ is excellent for most shows)
- Note vote counts for reliability
- Format episodes as "S##E## Title" (e.g., "S05E14 Ozymandias")
- Provide both data and insights
- If a series isn't found, try variations or ask for clarification
- When comparing shows, consider different factors: average ratings, consistency, peak episodes
- Explain weighted ratings when relevant
- Be conversational and enthusiastic about great television

WEIGHTED RATING FORMULA:
WR = (v/(v+m)) * R + (m/(v+m)) * C
- v = votes for episode
- m = minimum votes threshold
- R = episode rating
- C = series mean rating
This prevents episodes with few votes from dominating rankings.

When users ask about TV shows, use your tools to provide data-driven, insightful responses that help them discover and appreciate great television.
```

---

## Testing Your Integration

### Test Cases

1. **Simple query:** "Best episodes of Breaking Bad"
2. **Comparison:** "Breaking Bad vs Better Call Saul ratings"
3. **Analysis:** "Did Game of Thrones decline in quality?"
4. **Discovery:** "What should I watch next?"
5. **Specific:** "Tell me about Breaking Bad S05E14"
6. **Trend:** "How consistent is The Wire's quality?"

### Debugging

Check that your LLM:
- ✅ Calls tools with correct parameters
- ✅ Handles series name variations
- ✅ Interprets ratings appropriately
- ✅ Formats responses clearly
- ✅ Provides context, not just raw data
- ✅ Handles errors gracefully

---

## API Rate Limiting & Performance

**Current Setup:**
- Local API (no rate limits)
- DuckDB queries are fast (<100ms typically)
- Can handle concurrent requests

**For Production:**
- Consider adding caching for popular series
- Implement rate limiting if exposing publicly
- Monitor query performance
- Add request logging

---

## Extending the System

### Future Tool Ideas

1. **search_series_by_genre** - Find series by genre
2. **compare_series** - Direct comparison endpoint
3. **get_episode_details** - Deep dive on single episode
4. **get_series_timeline** - Chronological analysis
5. **get_similar_shows** - Recommendation engine

### Adding New Tools

When adding tools:
1. Create API endpoint in `03_serve_api.py`
2. Document tool schema
3. Add to LLM tool definitions
4. Update this guide with examples

---

## Support & Resources

- **API Documentation:** http://127.0.0.1:8000/docs
- **Database:** 12M+ titles, 817K+ rated episodes, 202K+ series
- **Source Code:** See `03_serve_api.py` for endpoint implementations
- **Data Updates:** Re-run `01_build_imdb_duckdb.py` to refresh data

---

## Example: Full Conversation Flow

**User:** "I loved Breaking Bad. What should I watch next that's similar?"

**LLM Internal:**
1. Get Breaking Bad data for comparison
2. Suggest similar crime dramas
3. Query their ratings

**Tool Calls:**
```json
[
  {"tool": "resolve_series", "arguments": {"name": "Breaking Bad"}},
  {"tool": "get_episodes", "arguments": {"series": "Breaking Bad"}},
  {"tool": "get_episodes", "arguments": {"series": "Better Call Saul"}},
  {"tool": "get_episodes", "arguments": {"series": "The Sopranos"}},
  {"tool": "get_episodes", "arguments": {"series": "The Wire"}}
]
```

**LLM Response:**
> "Since you loved Breaking Bad (Crime/Drama/Thriller, 8.96/10), here are similar highly-rated series:
> 
> **Better Call Saul** (2015-2022)
> - Same universe as Breaking Bad
> - Average: 9.0/10
> - More slow-burn character study
> - Perfect if you loved the storytelling style
> 
> **The Sopranos** (1999-2007)
> - Crime/Drama
> - Average: 9.2/10
> - Character-driven like Breaking Bad
> - Pioneering prestige TV drama
> 
> **The Wire** (2002-2008)
> - Crime/Drama
> - Average: 9.3/10
> - More ensemble, systemic focus
> - Incredibly layered storytelling
> 
> I'd start with Better Call Saul if you want to stay in the Breaking Bad world, or The Sopranos for a similar character-focused crime drama!"

---

## Conclusion

This integration allows LLMs to provide intelligent, data-driven insights about TV series by:
- Querying real IMDb data
- Analyzing trends and patterns
- Making informed recommendations
- Providing contextual understanding

The tools enable natural conversations about television while maintaining accuracy through direct database access.

Happy building! 🎬📺

