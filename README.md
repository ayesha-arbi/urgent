# Zameendar.ai - Land Suitability Analysis

AI-powered land suitability scoring for Agriculture, Housing, Industry, and Renewables.

## Features

- **Interactive World Map** - Click any location or select demo pins
- **Real-Time Environmental Data** - Weather, air quality, elevation, population density
- **AI Suitability Scoring** - Google Gemini analyzes conditions and scores 0-100
- **Dashboard** - View recent analyses, statistics, and category trends
- **Actionable Insights** - Get practical recommendations for each land use

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Multi-agent system using Groq (Llama 3.3 70B) - fast, free tier
- **Maps**: Google Maps via @react-google-maps/api
- **Data Sources**:
  - Open-Meteo (weather, air quality) - free, no API key
  - Nominatim/OSM (geocoding) - free, no API key
  - Open-Elevation (elevation) - free, no API key

## Multi-Agent AI System

The `/api/analyze` endpoint runs 4 specialized AI agents in parallel:

| Agent | Role |
|-------|------|
| **Scoring Agent** | Assigns 0-100 scores to each category with extreme temperature handling |
| **Explanation Agent** | Generates one-sentence reasons for each score |
| **Recommendation Agent** | Provides 3 practical, actionable recommendations |
| **Summary Agent** | Creates a 2-sentence overview of land conditions |

**Critical Logic**: The system enforces strict scoring rules for extreme conditions:
- Antarctica-like temps (< -30°C): All scores capped at 5-10
- Extreme cold/heat (< -10°C or > 45°C): All scores capped at 25
- This prevents unrealistic recommendations for uninhabitable regions

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local`:

```bash
# AI - Groq (Llama 3.3 70B for multi-agent analysis)
# Get free API key: https://console.groq.com/keys
GROQ_API_KEY=

# Google Maps for interactive map
# Get API key: https://console.cloud.google.com/apis/credentials
# Enable: Maps JavaScript API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `GROQ_API_KEY` - from https://console.groq.com/keys
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - from Google Cloud Console
4. Deploy

**Note**: Groq is recommended over Gemini because it's faster and has a generous free tier.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/weather` | GET | Weather data (temp, precipitation, wind, humidity, UV, clouds) |
| `/api/airquality` | GET | Air quality (AQI, PM2.5, PM10, NO2) |
| `/api/geo` | GET | Elevation, population density, reverse geocoding |
| `/api/analyze` | POST | Run full AI analysis |
| `/api/sessions` | GET/POST | Analysis history |

## Project Structure

```
urgent/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main app (dashboard/analyze/about)
├── components/
│   ├── analyze/       # Results panel
│   ├── layout/        # Sidebar
│   ├── map/           # WorldMap (Leaflet)
│   └── shared/        # UI components
├── lib/
│   └── services/      # Weather, Geo, AI services
├── types/             # Shared TypeScript types
└── public/            # Static assets
```

## License

MIT
