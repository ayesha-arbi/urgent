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
- **AI**: Vercel AI SDK with Google Gemini (free tier)
- **Maps**: React-Leaflet + OpenStreetMap
- **Data Sources**:
  - Open-Meteo (weather, air quality)
  - Nominatim/OSM (geocoding)
  - Open-Elevation (elevation)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and add your API key:

```bash
# Get free key from https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `GOOGLE_GENERATIVE_AI_API_KEY` to Environment Variables
4. Deploy

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
