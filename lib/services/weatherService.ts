// ============================================================
// Weather Service - Fetches from Open-Meteo (free, no API key)
// ============================================================

import type { WeatherData, AirQualityData } from '@/types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const OPEN_METEO_AQ = 'https://air-quality-api.open-meteo.com/v1';
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,uv_index,cloud_cover',
    timezone: 'auto',
  });

  try {
    const data = await fetchWithTimeout(`${OPEN_METEO_BASE}/forecast?${params}`);
    const c = data.current ?? {};
    return {
      temperature: c.temperature_2m ?? 25,
      precipitation: c.precipitation ?? 1.0,
      windSpeed: c.wind_speed_10m ?? 12,
      humidity: c.relative_humidity_2m ?? 55,
      uvIndex: c.uv_index ?? 5,
      cloudCover: c.cloud_cover ?? 30,
    };
  } catch {
    return weatherFallback(lat, lng);
  }
}

export async function fetchAirQuality(lat: number, lng: number): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'pm2_5,pm10,nitrogen_dioxide,european_aqi',
  });

  try {
    const data = await fetchWithTimeout(`${OPEN_METEO_AQ}/air-quality?${params}`);
    const c = data.current ?? {};
    return {
      aqi: c.european_aqi ?? 50,
      pm25: c.pm2_5 ?? 12,
      pm10: c.pm10 ?? 25,
      no2: c.nitrogen_dioxide ?? 10,
    };
  } catch {
    return { aqi: 50, pm25: 12, pm10: 25, no2: 10 };
  }
}

function weatherFallback(lat: number, lng: number): WeatherData {
  const absLat = Math.abs(lat);
  if (absLat < 23.5) return { temperature: 30, precipitation: 4.0, windSpeed: 10, humidity: 80, uvIndex: 9, cloudCover: 45 };
  if (absLat < 35 && lng > 60 && lng < 80) return { temperature: 36, precipitation: 1.5, windSpeed: 14, humidity: 42, uvIndex: 9, cloudCover: 15 };
  if (absLat < 35) return { temperature: 32, precipitation: 0.5, windSpeed: 12, humidity: 30, uvIndex: 10, cloudCover: 8 };
  if (absLat < 60) return { temperature: 18, precipitation: 2.5, windSpeed: 20, humidity: 65, uvIndex: 5, cloudCover: 40 };
  return { temperature: -5, precipitation: 0.5, windSpeed: 25, humidity: 75, uvIndex: 2, cloudCover: 60 };
}
