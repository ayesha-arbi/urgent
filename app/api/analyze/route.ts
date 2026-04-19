// ============================================================
// Multi-Agent Land Analysis API
// Uses Groq (Llama 3.3 70B) for fast, intelligent scoring
// ============================================================

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, fetchAirQuality } from '@/lib/services/weatherService';
import { fetchGeoData, reverseGeocode } from '@/lib/services/geoService';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const groqModel = groq('llama-3.3-70b-versatile');

// In-memory session store
const sessions: any[] = [];

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { lat, lng, locationName } = body;

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180' },
        { status: 400 }
      );
    }

    // Fetch all environmental data
    const [weather, airQuality, geo, location] = await Promise.all([
      fetchWeather(lat, lng),
      fetchAirQuality(lat, lng),
      fetchGeoData(lat, lng),
      reverseGeocode(lat, lng),
    ]);

    const temperature = weather.temperature;
    const isExtremeCold = temperature < -10;
    const isExtremeHeat = temperature > 45;
    const isVeryExtreme = temperature < -30 || temperature > 50;

    // Build rich context for agents
    const context = `
Location: ${locationName || location.placeName} (${lat.toFixed(4)}, ${lng.toFixed(4)})
Country: ${location.country || 'Unknown'}

ENVIRONMENTAL CONDITIONS:
- Temperature: ${weather.temperature}°C ${isVeryExtreme ? '(EXTREME - life-threatening)' : isExtremeCold ? '(very cold)' : isExtremeHeat ? '(very hot)' : '(moderate)'}
- Precipitation: ${weather.precipitation}mm/day ${weather.precipitation < 0.5 ? '(very dry)' : weather.precipitation > 5 ? '(wet)' : ''}
- Wind Speed: ${weather.windSpeed}km/h ${weather.windSpeed > 20 ? '(windy)' : ''}
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uvIndex}/11 ${weather.uvIndex > 8 ? '(very high)' : ''}
- Cloud Cover: ${weather.cloudCover}%

AIR QUALITY:
- AQI: ${airQuality.aqi} ${airQuality.aqi > 100 ? '(unhealthy for sensitive groups)' : airQuality.aqi > 150 ? '(unhealthy)' : '(good)'}
- PM2.5: ${airQuality.pm25} μg/m³
- PM10: ${airQuality.pm10} μg/m³

GEOGRAPHIC:
- Elevation: ${geo.elevation}m ${geo.elevation > 2000 ? '(high altitude)' : ''}
- Population Density: ${geo.populationDensity} people/km² ${geo.populationDensity < 10 ? '(very remote)' : geo.populationDensity > 500 ? '(dense)' : ''}
- Urban Proximity: ${geo.urbanProximity}/100
`;

    // CRITICAL: System prompt with scoring rules
    const systemPrompt = `You are an expert land suitability analyst. Score 0-100 for each category.

CRITICAL SCORING RULES:
1. EXTREME TEMPERATURES: If temp < -10°C or > 45°C, ALL scores must be below 25
2. VERY EXTREME: If temp < -30°C (Antarctica) or > 50°C (Death Valley), ALL scores below 15
3. Antarctica-like conditions (-40°C or colder) = all scores must be 5 or less
4. Housing requires survivable conditions - score near 0 for extreme cold/heat
5. Agriculture needs moderate temp (5-40°C), water, decent soil
6. Industry is more tolerant but needs worker access
7. Renewables can work in harsh conditions if UV/wind are good

Return ONLY valid JSON. No markdown, no explanation.`;

    // Run 4 specialized agents in parallel
    const [scoreResult, whyResult, recResult, summaryResult] = await Promise.all([
      generateText({
        model: groqModel,
        system: systemPrompt,
        prompt: `Given the land conditions above, return ONLY valid JSON:
{"agriculture":NUMBER,"housing":NUMBER,"industry":NUMBER,"renewables":NUMBER}
Each score 0-100. Consider temperature extremes critically.`,
      }),

      generateText({
        model: groqModel,
        system: 'You explain land scores in one short sentence each.',
        prompt: `Given the conditions, write ONE short reason (max 12 words) for each category's score:
{"agriculture":"reason","housing":"reason","industry":"reason","renewables":"reason"}`,
      }),

      generateText({
        model: groqModel,
        system: 'You give practical land development recommendations.',
        prompt: `Given the conditions${isVeryExtreme ? ' (EXTREME - likely uninhabitable)' : ''}, give exactly 3 short, practical recommendations.
Return: {"recommendations":["rec1","rec2","rec3"]}`,
      }),

      generateText({
        model: groqModel,
        system: 'You summarize land data clearly.',
        prompt: `Summarize these land factors in 2 clear sentences: ${context}`,
      }),
    ]);

    // Parse scores with validation
    let rawScores = { agriculture: 50, housing: 50, industry: 50, renewables: 50 };
    try {
      const parsed = JSON.parse(scoreResult.text.replace(/```json|```/g, '').trim());
      rawScores = { ...rawScores, ...parsed };
    } catch (e) {
      console.error('Score parse error:', e);
    }

    // Enforce extreme temperature constraints (belt-and-suspenders)
    if (isVeryExtreme) {
      rawScores.agriculture = Math.min(rawScores.agriculture, 10);
      rawScores.housing = Math.min(rawScores.housing, 10);
      rawScores.industry = Math.min(rawScores.industry, 15);
      if (temperature < -30) {
        rawScores.agriculture = Math.min(rawScores.agriculture, 5);
        rawScores.housing = Math.min(rawScores.housing, 5);
        rawScores.industry = Math.min(rawScores.industry, 8);
      }
    } else if (isExtremeCold || isExtremeHeat) {
      rawScores.agriculture = Math.min(rawScores.agriculture, 25);
      rawScores.housing = Math.min(rawScores.housing, 25);
    }

    // Parse explanations
    let explanations = { agriculture: '', housing: '', industry: '', renewables: '' };
    try {
      explanations = JSON.parse(whyResult.text.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('Explanation parse error:', e);
    }

    // Parse recommendations
    let recommendations: string[] = ['Conduct detailed site survey', 'Consult local experts', 'Review regulatory requirements'];
    try {
      const parsed = JSON.parse(recResult.text.replace(/```json|```/g, '').trim());
      recommendations = parsed.recommendations || recommendations;
    } catch (e) {
      console.error('Recommendation parse error:', e);
    }

    // Build result in frontend's expected format
    const CATEGORY_COLORS = {
      Agriculture: '#4ade80',
      Housing: '#60a5fa',
      Industry: '#fb923c',
      Renewables: '#fbbf24',
    };

    const scores = (['agriculture', 'housing', 'industry', 'renewables'] as const).map(cat => ({
      score: Math.round(rawScores[cat]),
      label: cat.charAt(0).toUpperCase() + cat.slice(1) as 'Agriculture' | 'Housing' | 'Industry' | 'Renewables',
      color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS],
      summary: `${cat.charAt(0).toUpperCase() + cat.slice(1)} suitability: ${Math.round(rawScores[cat])}/100`,
      explanation: explanations[cat] || `Score based on temperature ${weather.temperature}°C, AQI ${airQuality.aqi}, and local conditions.`,
      actions: recommendations.slice(0, 2),
      keyFactors: [
        `Temperature: ${weather.temperature}°C`,
        `Air Quality: ${airQuality.aqi} AQI`,
        cat === 'renewables' ? `UV: ${weather.uvIndex}, Wind: ${weather.windSpeed}km/h` : `Elevation: ${geo.elevation}m`,
      ],
    }));

    const topScore = scores.reduce((a, b) => a.score > b.score ? a : b);

    const result = {
      location: {
        latLng: { lat, lng },
        placeName: locationName || location.placeName || 'Selected Location',
        country: location.country || '',
        region: location.region || '',
      },
      scores,
      overallInsight: isVeryExtreme
        ? `This location has extreme environmental conditions (${weather.temperature}°C). All development would require specialized infrastructure and significant investment. Not recommended for standard use.`
        : `Best suited for ${topScore.label.toLowerCase()} with a score of ${topScore.score}/100. ${scores.find(s => s.label === topScore.label)?.explanation || ''}`,
      topUse: topScore.label as 'Agriculture' | 'Housing' | 'Industry' | 'Renewables',
      disclaimer: 'AI-assisted insights only. Not a substitute for professional surveys or local regulations.',
      generatedAt: new Date().toISOString(),
    };

    // Store session
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      location: result.location,
      result,
      timestamp: new Date().toISOString(),
    };
    sessions.unshift(session);
    if (sessions.length > 50) sessions.pop();

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        durationMs: Date.now() - startTime,
        dataSource: 'live',
        model:  'llama-3.3-70b-versatile',
      },
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.', success: false },
      { status: 500 }
    );
  }
}

// GET - retrieve sessions
export async function GET() {
  return NextResponse.json({ sessions, total: sessions.length });
}
