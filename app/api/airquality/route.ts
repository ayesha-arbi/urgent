// GET /api/airquality?lat=&lng=
import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQuality } from '@/lib/services/weatherService';

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '0');
  const lng = parseFloat(request.nextUrl.searchParams.get('lng') || '0');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const airQuality = await fetchAirQuality(lat, lng);
    return NextResponse.json(airQuality);
  } catch (error) {
    console.error('Air quality API error:', error);
    return NextResponse.json({ error: 'Failed to fetch air quality' }, { status: 500 });
  }
}
