// GET /api/weather?lat=&lng=
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/services/weatherService';

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '0');
  const lng = parseFloat(request.nextUrl.searchParams.get('lng') || '0');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const weather = await fetchWeather(lat, lng);
    return NextResponse.json(weather);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
