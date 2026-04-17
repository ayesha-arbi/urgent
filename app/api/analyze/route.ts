// POST /api/analyze
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, fetchAirQuality } from '@/lib/services/weatherService';
import { fetchGeoData, reverseGeocode } from '@/lib/services/geoService';
import { generateSuitabilityAnalysis } from '@/lib/services/aiService';
import type { AnalyzeRequest, AnalyzeResponse, EnvPayload } from '@/types';

const sessions: Array<{ id: string; location: any; result: any; timestamp: string }> = [];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AnalyzeRequest = await request.json();
    const { lat, lng, locationName } = body;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180' },
        { status: 400 }
      );
    }

    // Fetch all environmental data in parallel
    const [weather, airQuality, geo, location] = await Promise.all([
      fetchWeather(lat, lng),
      fetchAirQuality(lat, lng),
      fetchGeoData(lat, lng),
      reverseGeocode(lat, lng),
    ]);

    const envPayload: EnvPayload = {
      location: {
        latLng: { lat, lng },
        placeName: locationName || location.placeName,
        country: location.country,
        region: location.region,
      },
      weather,
      airQuality,
      geo,
    };

    // Generate AI analysis
    const aiResult = await generateSuitabilityAnalysis(envPayload);

    const result = {
      location: envPayload.location,
      ...aiResult,
      generatedAt: new Date().toISOString(),
    };

    // Store session
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      location: envPayload.location,
      result,
      timestamp: new Date().toISOString(),
    };
    sessions.unshift(session);
    if (sessions.length > 50) sessions.pop(); // Keep last 50

    const response: AnalyzeResponse = {
      success: true,
      data: result,
      meta: {
        durationMs: Date.now() - startTime,
        dataSource: 'live',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/analyze - retrieve sessions
export async function GET() {
  return NextResponse.json({
    sessions,
    total: sessions.length,
  });
}
