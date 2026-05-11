// ============================================================
// Shared types for Zameendar.ai
// Used by both Next.js API routes and frontend components
// ============================================================

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationData {
  latLng: LatLng;
  placeName: string;
  country: string;
  region: string;
  isWater?: boolean;
}

export interface WeatherData {
  temperature: number;   // °C
  precipitation: number; // mm/day
  windSpeed: number;     // km/h
  humidity: number;      // %
  uvIndex: number;       // 0–11
  cloudCover: number;    // %
}

export interface AirQualityData {
  aqi: number;   // European AQI
  pm25: number;  // μg/m³
  pm10: number;  // μg/m³
  no2: number;   // μg/m³
}

export interface GeoData {
  populationDensity: number; // people/km²
  elevation: number;         // metres ASL
  urbanProximity: number;    // 0–100 proxy
}

export interface EnvPayload {
  location: LocationData;
  weather: WeatherData;
  airQuality: AirQualityData;
  geo: GeoData;
}

export type SuitabilityCategory = 'Agriculture' | 'Housing' | 'Industry' | 'Renewables';

export interface CategoryScore {
  score: number;
  label: SuitabilityCategory;
  color: string;
  summary: string;
  explanation: string;
}

export interface SuitabilityResult {
  location: LocationData;
  scores: CategoryScore[];
  overallFactors: string[];
  overallActions: string[];
  overallInsight: string;
  topUse: SuitabilityCategory;
  disclaimer: string;
  generatedAt: string;
}

export interface AnalysisSession {
  id: string;
  location: LocationData;
  result: SuitabilityResult;
  /**
   * Snapshot of the env data the model scored against.
   * Stored so handleSessionClick can restore real values
   * instead of hardcoded fallbacks.
   */
  envPayload: EnvPayload;
  timestamp: string;
}

// API request/response shapes
export interface AnalyzeRequest {
  lat: number;
  lng: number;
  locationName?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data: SuitabilityResult & {
    /**
     * The exact env data used by the model during scoring.
     * page.tsx must read this for envPayload — never call
     * /api/weather or /api/airquality separately after /api/analyze.
     */
    env: EnvPayload;
  };
  meta: {
    durationMs: number;
    dataSource: 'live' | 'fallback';
    webSearch?: string;
    scoreDiversity?: { spread: number; corrected: boolean };
    models?: { agent1: string; agent2: string; agent3: string };
  };
}

export interface SessionsResponse {
  sessions: AnalysisSession[];
  total: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
}

// Frontend state
export type Page = 'landing' |'dashboard' | 'analyze' | 'about' | 'role-select';
export type AnalyzePhase = 'idle' | 'loading_data' | 'loading_ai' | 'success' | 'error';

export interface AppState {
  currentPage: Page;
  analyzePhase: AnalyzePhase;
  selectedLocation: { latLng: LatLng; placeName: string; country: string; region: string } | null;
  envPayload: EnvPayload | null;
  currentResult: SuitabilityResult | null;
  expandedCategory: SuitabilityCategory | null;
  sessions: AnalysisSession[];
  error: string | null;
}