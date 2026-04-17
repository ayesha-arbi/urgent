// ============================================================
// shared/types.ts
// Types shared between NestJS backend and Next.js frontend.
// In a monorepo, both apps would import from this file.
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
  actions: string[];
  keyFactors: string[];
}

export interface SuitabilityResult {
  location: LocationData;
  scores: CategoryScore[];
  overallInsight: string;
  topUse: SuitabilityCategory;
  disclaimer: string;
  generatedAt: string;
}

export interface AnalysisSession {
  id: string;
  location: LocationData;
  result: SuitabilityResult;
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
  data: SuitabilityResult;
  meta: {
    durationMs: number;
    dataSource: 'live' | 'fallback';
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
