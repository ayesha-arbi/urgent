// ============================================================
// backend/src/modules/weather/weather.service.ts
// Fetches weather + air quality from Open-Meteo (free, no key)
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WeatherData, AirQualityData } from '../../../../shared/types';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly config: ConfigService) {}

  private get timeout() {
    return this.config.get<number>('app.httpTimeoutMs') || 8000;
  }

  private async fetchWithTimeout(url: string): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Weather (Open-Meteo Forecast API) ─────────────────────
  async fetchWeather(lat: number, lng: number): Promise<WeatherData> {
    const base = this.config.get<string>('app.openMeteoBaseUrl');
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,uv_index,cloud_cover',
      timezone: 'auto',
    });

    try {
      const data = await this.fetchWithTimeout(`${base}/forecast?${params}`);
      const c = data.current ?? {};
      return {
        temperature:   c.temperature_2m           ?? 25,
        precipitation: c.precipitation             ?? 1.0,
        windSpeed:     c.wind_speed_10m            ?? 12,
        humidity:      c.relative_humidity_2m      ?? 55,
        uvIndex:       c.uv_index                  ?? 5,
        cloudCover:    c.cloud_cover               ?? 30,
      };
    } catch (err) {
      this.logger.warn(`Weather fetch failed for (${lat},${lng}): ${err.message}`);
      return this.weatherFallback(lat, lng);
    }
  }

  // ── Air Quality (Open-Meteo Air Quality API) ──────────────
  async fetchAirQuality(lat: number, lng: number): Promise<AirQualityData> {
    const base = this.config.get<string>('app.openMeteoAqUrl');
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'pm2_5,pm10,nitrogen_dioxide,european_aqi',
    });

    try {
      const data = await this.fetchWithTimeout(`${base}/air-quality?${params}`);
      const c = data.current ?? {};
      return {
        aqi:  c.european_aqi       ?? 50,
        pm25: c.pm2_5              ?? 12,
        pm10: c.pm10               ?? 25,
        no2:  c.nitrogen_dioxide   ?? 10,
      };
    } catch (err) {
      this.logger.warn(`AQ fetch failed for (${lat},${lng}): ${err.message}`);
      return { aqi: 50, pm25: 12, pm10: 25, no2: 10 };
    }
  }

  // ── Fallback weather based on rough climate zones ─────────
  private weatherFallback(lat: number, lng: number): WeatherData {
    const absLat = Math.abs(lat);
    // Tropical
    if (absLat < 23.5) return { temperature: 30, precipitation: 4.0, windSpeed: 10, humidity: 80, uvIndex: 9, cloudCover: 45 };
    // Subtropical / South Asia
    if (absLat < 35 && lng > 60 && lng < 80) return { temperature: 36, precipitation: 1.5, windSpeed: 14, humidity: 42, uvIndex: 9, cloudCover: 15 };
    // Mediterranean / North Africa / Middle East
    if (absLat < 35) return { temperature: 32, precipitation: 0.5, windSpeed: 12, humidity: 30, uvIndex: 10, cloudCover: 8 };
    // Temperate
    if (absLat < 60) return { temperature: 18, precipitation: 2.5, windSpeed: 20, humidity: 65, uvIndex: 5, cloudCover: 40 };
    // Polar
    return { temperature: -5, precipitation: 0.5, windSpeed: 25, humidity: 75, uvIndex: 2, cloudCover: 60 };
  }
}
