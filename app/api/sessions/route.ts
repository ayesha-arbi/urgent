// GET/POST /api/sessions - Analysis history
import { NextRequest, NextResponse } from 'next/server';

// In-memory session store (max 50)
const sessions: Array<{
  id: string;
  location: { latLng: { lat: number; lng: number }; placeName: string; country: string; region: string };
  result: any;
  timestamp: string;
}> = [];

export async function GET() {
  return NextResponse.json({
    sessions: sessions.slice(0, 50),
    total: sessions.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, result } = body;

    if (!location || !result) {
      return NextResponse.json({ error: 'Missing location or result' }, { status: 400 });
    }

    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      location,
      result,
      timestamp: new Date().toISOString(),
    };

    sessions.unshift(session);
    if (sessions.length > 50) sessions.pop();

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) sessions.splice(index, 1);
  }
  return NextResponse.json({ success: true });
}
