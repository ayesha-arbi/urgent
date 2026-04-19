// ============================================================
// Geo Service - Reverse geocoding, elevation, population
// ============================================================

import type { GeoData } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OPEN_ELEVATION_URL = 'https://api.open-elevation.com/api/v1';
const TIMEOUT_MS = 8000;

async function safeFetch(url: string, init?: RequestInit): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ placeName: string; country: string; region: string; isWater: boolean }> {
  try {
    const data = await safeFetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'Zameendar.ai/1.0' } }
    );
    const a = data.address ?? {};
    const waterIndicators = ['ocean', 'sea', 'bay', 'strait', 'gulf', 'water', 'lagoon', 'channel', 'bight'];
    const placeName = a.city || a.town || a.village || a.county || a.state || data.name || 'Selected Location';
    const placeLower = placeName.toLowerCase();
    const isWater = waterIndicators.some(w => placeLower.includes(w)) ||
                    a.water || a.ocean || a.sea || a.bay || !a.country;
    return {
      placeName,
      country: a.country ?? '',
      region: a.state ?? a.county ?? '',
      isWater,
    };
  } catch {
    return { placeName: 'Selected Location', country: '', region: '', isWater: false };
  }
}

export async function fetchElevation(lat: number, lng: number): Promise<number> {
  try {
    const data = await safeFetch(OPEN_ELEVATION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations: [{ latitude: lat, longitude: lng }] }),
    });
    return data?.results?.[0]?.elevation ?? 200;
  } catch {
    return elevationEstimate(lat, lng);
  }
}

export async function fetchPopulationDensity(lat: number, lng: number): Promise<number> {
  // TODO: Load from /data/population_density.json (WorldPop-derived)
  return popDensityEstimate(lat, lng);
}

export async function fetchGeoData(lat: number, lng: number): Promise<GeoData> {
  const [elevation, populationDensity] = await Promise.all([
    fetchElevation(lat, lng),
    fetchPopulationDensity(lat, lng),
  ]);
  return {
    elevation,
    populationDensity,
    urbanProximity: Math.min(100, Math.round(populationDensity / 65)),
  };
}

function elevationEstimate(lat: number, lng: number): number {
  if (lat > 27 && lat < 38 && lng > 70 && lng < 90) return 1500; // Himalayas
  if (lng > -80 && lng < -65 && lat > -40 && lat < 10) return 800; // Andes
  if (lat > 15 && lat < 35 && lng > -5 && lng < 40) return 400; // Sahara
  return 200;
}

function popDensityEstimate(lat: number, lng: number): number {
  if (lat > 5 && lat < 40 && lng > 65 && lng < 130) return 800; // S/E Asia
  if (lat > 45 && lat < 60 && lng > -5 && lng < 30) return 120; // Europe
  if (lat > 25 && lat < 50 && lng > -125 && lng < -65) return 35; // USA
  if (lat > -35 && lat < 15 && lng > -20 && lng < 55) return 60; // Sub-Saharan Africa
  return 5; // Remote/desert/polar
}
