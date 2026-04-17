// GET /api/geo?lat=&lng=
import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoData, reverseGeocode } from '@/lib/services/geoService';
import type { LocationData } from '@/types';

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '0');
  const lng = parseFloat(request.nextUrl.searchParams.get('lng') || '0');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const [geoData, location] = await Promise.all([
      fetchGeoData(lat, lng),
      reverseGeocode(lat, lng),
    ]);

    const response: LocationData & typeof geoData = {
      latLng: { lat, lng },
      ...location,
      ...geoData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Geo API error:', error);
    return NextResponse.json({ error: 'Failed to fetch geo data' }, { status: 500 });
  }
}
