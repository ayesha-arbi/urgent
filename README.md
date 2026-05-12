# 🌍 Zameendar.ai — AI-Powered Land Suitability Analysis

**Zameendar.ai** is an intelligent decision-support platform that evaluates the suitability of any location on Earth for four primary land-use categories: **Agriculture**, **Housing**, **Industry**, and **Renewables**. 

By synthesizing real-time environmental data with advanced AI analysis, Zameendar.ai provides instant, data-driven scores and actionable insights to help users make informed land-use decisions.

![Demo Placeholder](https://via.placeholder.com/800x400?text=Zameendar.ai+Dashboard+Preview)

## ✨ Key Features

- 🗺️ **Interactive Global Exploration**: A seamless world map interface allowing users to click anywhere on Earth to trigger a deep-dive analysis.
- 🌡️ **Real-Time Environmental Intelligence**: Integrates live data for weather, air quality, elevation, and population density.
- 🤖 **Multi-Agent AI Scoring**: Uses a specialized AI pipeline to generate nuanced suitability scores (0-100) based on strict environmental constraints.
- 📈 **Analytical Dashboard**: Track analysis history, view category averages, and identify the most suitable land uses across multiple sessions.
- 💡 **Actionable Recommendations**: Beyond just scores, the platform provides practical "Next Steps" tailored to the specific conditions of the selected site.
- 🛡️ **Environmental Safety Guardrails**: Built-in logic to handle extreme environments (e.g., Antarctica, Sahara), ensuring scores reflect real-world habitability.

## 🛠️ Tech Stack

### Frontend & Framework
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS Variables with a custom dark-themed design system
- **Visualization**: [Recharts](https://recharts.org/) for data trends, [Lucide React](https://lucide.dev/) for iconography

### AI & Data Intelligence
- **Orchestration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Model**: [Google Gemini 2.0 Flash](https://aistudio.google.com/) (via `@ai-sdk/google`)
- **Search/Research**: [Tavily AI](https://tavily.com/) integration for enhanced context

### Geospatial & Environmental Data
- **Maps**: [Google Maps API](https://developers.google.com/maps) / [Leaflet](https://leafletjs.com/)
- **Weather & Air Quality**: [Open-Meteo API](https://open-meteo.com/)
- **Geocoding**: [Nominatim (OpenStreetMap)](https://nominatim.org/)
- **Elevation**: [Open-Elevation API](https://open-elevation.com/)

## 🏗️ Architecture: The AI Pipeline

The core of Zameendar.ai is a specialized analysis pipeline that transforms raw environmental telemetry into strategic insights:

1. **Data Acquisition**: Fetches current weather, AQI, and geospatial data based on coordinates.
2. **Contextual Synthesis**: Combines telemetry into a structured `EnvPayload`.
3. **Expert AI Analysis**: The AI agent acts as a land suitability expert, applying a rigorous scoring matrix:
   - **Temperature Extremes**: Severe penalties for freezing (<0°C) or extreme heat (>45°C).
   - **Category Logic**: Agriculture requires precipitation; Housing requires livability; Industry requires infrastructure proximity; Renewables focus on UV index and wind speed.
4. **Insight Generation**: Produces an `overallInsight`, a `topUse` recommendation, and specific `actions` for each category.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Google AI Studio API Key (for Gemini)
- A Google Maps JavaScript API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zameendar-ai.git
   cd zameendar-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   # Google Gemini API Key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here
   
   # Google Maps API Key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/weather` | `GET` | Fetches real-time weather, humidity, UV, and cloud cover |
| `/api/airquality` | `GET` | Fetches AQI, PM2.5, and PM10 data |
| `/api/geo` | `GET` | Provides elevation, population density, and reverse geocoding |
| `/api/analyze` | `POST` | Orchestrates the full AI analysis pipeline for a coordinate |
| `/api/sessions` | `GET/POST`| Manages the history of analyzed locations |

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
