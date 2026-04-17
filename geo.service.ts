// ============================================================
// backend/src/modules/geo/geo.service.ts
// Reverse geocoding (Nominatim) + elevation (Open-Elevation)
// + population density (stub — replace with WorldPop JSON)
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LocationData, GeoData } from '../../../../shared/types';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(private readonly config: ConfigService) {}

  private get timeout() {
    return this.config.get<number>('app.httpTimeoutMs') || 8000;
  }

  private async safeFetch(url: string, init?: RequestInit): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Reverse geocode (Nominatim OSM) ───────────────────────
  async reverseGeocode(lat: number, lng: number): Promise<Pick<LocationData, 'placeName' | 'country' | 'region'>> {
    const base = this.config.get<string>('app.nominatimUrl');
    try {
      const data = await this.safeFetch(
        `${base}/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'Zameendar.ai/1.0 (hackathon)' } },
      );
      const a = data.address ?? {};
      return {
        placeName: a.city || a.town || a.village || a.county || a.state || 'Selected Location',
        country:   a.country ?? '',
        region:    a.state   ?? a.county ?? '',
      };
    } catch (err) {
      this.logger.warn(`Geocode failed for (${lat},${lng}): ${err.message}`);
      return { placeName: 'Selected Location', country: '', region: '' };
    }
  }

  // ── Elevation (Open-Elevation) ────────────────────────────
  async fetchElevation(lat: number, lng: number): Promise<number> {
    const base = this.config.get<string>('app.openElevationUrl');
    try {
      const data = await this.safeFetch(`${base}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: [{ latitude: lat, longitude: lng }] }),
      });
      return data?.results?.[0]?.elevation ?? 200;
    } catch (err) {
      this.logger.warn(`Elevation fetch failed: ${err.message}`);
      return this.elevationEstimate(lat, lng);
    }
  }

  // ── Population density (stub) ─────────────────────────────
  // [INTEGRATE] Load /data/population_density.json (WorldPop-derived)
  // Grid lookup: key = `${Math.round(lat * 2) / 2}_${Math.round(lng * 2) / 2}`
  async fetchPopulationDensity(lat: number, lng: number): Promise<number> {
    // TODO: load and look up from WorldPop JSON
    return this.popDensityEstimate(lat, lng);
  }

  // ── Compile full GeoData ──────────────────────────────────
  async fetchGeoData(lat: number, lng: number): Promise<GeoData> {
    const [elevation, populationDensity] = await Promise.all([
      this.fetchElevation(lat, lng),
      this.fetchPopulationDensity(lat, lng),
    ]);
    return {
      elevation,
      populationDensity,
      urbanProximity: Math.min(100, Math.round(populationDensity / 65)),
    };
  }

  // ── Rough elevation estimate from latitude ────────────────
  private elevationEstimate(lat: number, lng: number): number {
    // Very rough: Himalayan belt
    if (lat > 27 && lat < 38 && lng > 70 && lng < 90) return 1500;
    // Andes
    if (lng > -80 && lng < -65 && lat > -40 && lat < 10) return 800;
    // Sahara/desert
    if (lat > 15 && lat < 35 && lng > -5 && lng < 40) return 400;
    return 200;
  }

  // ── Rough population density estimate ────────────────────
  private popDensityEstimate(lat: number, lng: number): number {
    // Dense South/East Asia
    if (lat > 5 && lat < 40 && lng > 65 && lng < 130) return 800;
    // Europe
    if (lat > 45 && lat < 60 && lng > -5 && lng < 30) return 120;
    // USA
    if (lat > 25 && lat < 50 && lng > -125 && lng < -65) return 35;
    // Sub-Saharan Africa
    if (lat > -35 && lat < 15 && lng > -20 && lng < 55) return 60;
    // Remote / desert / polar
    return 5;
  }
}
