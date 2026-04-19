// ============================================================
// Multi-Agent Land Analysis API
// Uses Groq (Llama 3.3 70B) for fast, intelligent scoring
// ============================================================

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, fetchAirQuality } from '@/lib/services/weatherService';
import { fetchGeoData, reverseGeocode } from '@/lib/services/geoService';
import type { GeoData } from '@/types';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const groqModel = groq('llama-3.3-70b-versatile');

// In-memory session store
const sessions: any[] = [];

// Robust JSON extraction from AI responses
function extractJson(text: string): string {
  let cleaned = text.replace(/```(?:json|[a-z]*)?\n?/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0].trim() : cleaned.trim();
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { lat, lng, locationName } = body;

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

    // Water body detection - reject ocean/sea locations
    if (location.isWater) {
      return NextResponse.json(
        { error: 'Cannot analyze water locations. Please select land coordinates.', success: false },
        { status: 400 }
      );
    }

    const isUnderwater = geo.elevation < 0;
    const isNoMansLand = geo.populationDensity < 1 && !location.country;

    if (isUnderwater && isNoMansLand) {
      return NextResponse.json(
        { error: 'Cannot analyze water locations. Please select land coordinates.', success: false },
        { status: 400 }
      );
    }

    const temperature = weather.temperature;
    const isExtremeCold = temperature < -10;
    const isExtremeHeat = temperature > 45;
    const isVeryExtreme = temperature < -30 || temperature > 50;

    // Build rich context - THIS IS THE DATA ALL AGENTS NEED
    const context = `
Location: ${locationName || location.placeName} (${lat.toFixed(4)}, ${lng.toFixed(4)})
Country: ${location.country || 'Unknown'}

ENVIRONMENTAL CONDITIONS:
- Temperature: ${weather.temperature}°C ${isVeryExtreme ? '(EXTREME - life-threatening)' : isExtremeCold ? '(very cold)' : isExtremeHeat ? '(very hot)' : ''}
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

    // Run 5 specialized agents in parallel - ALL receive the context
    const [scoreResult, whyResult, recResult, summaryResult, factorsResult] = await Promise.all([

      // Agent 1: Scoring
      generateText({
        model: groqModel,
        prompt: `You are an expert land suitability analyst. Analyze these conditions and score each category 0-100.

${context}

SCORING GUIDELINES:
- Agriculture: Needs moderate temp (10-35°C ideal), adequate rain (>1mm), good humidity (40-80%). Hot dry areas can still score 40-60 for heat-tolerant crops. Cold/frozen = low.
- Housing: Needs livable temp (15-30°C ideal), good air quality (AQI <100), access to population centers. Extreme cold/heat = low.
- Industry: Most tolerant. Needs workforce access (population density >50), infrastructure proximity. Can score 50-70 in moderate conditions even with suboptimal weather.
- Renewables: Solar needs high UV (>6) + low clouds (<40%). Wind needs speed >15km/h. Can score high even in harsh climates if sun/wind are good.
- Normal moderate climates (20-30°C, some rain, AQI <80) should score Agriculture 60-80, Housing 60-75, Industry 50-65, Renewables 40-70 depending on sun/wind.

CRITICAL: If temp < -10°C or > 45°C, cap ALL scores at 25. If temp < -30°C, cap at 10.

Return ONLY valid JSON, no markdown:
{"agriculture":NUMBER,"housing":NUMBER,"industry":NUMBER,"renewables":NUMBER}`,
      }),

      // Agent 2: Explanations
      generateText({
        model: groqModel,
        prompt: `You explain land suitability scores. Given these conditions:

${context}

Write ONE short reason (max 12 words) for each category's suitability at this location.
Return ONLY valid JSON, no markdown:
{"agriculture":"reason","housing":"reason","industry":"reason","renewables":"reason"}`,
      }),

      // Agent 3: Recommendations
      generateText({
        model: groqModel,
        prompt: `You give practical land development recommendations. Given these conditions:

${context}

${isVeryExtreme ? 'NOTE: This location has EXTREME conditions. Recommend specialized approaches.' : ''}

Give exactly 3 short, practical action recommendations for this land.
Return ONLY valid JSON, no markdown:
{"recommendations":["rec1","rec2","rec3"]}`,
      }),

      // Agent 4: Summary
      generateText({
        model: groqModel,
        prompt: `Summarize these land factors in 2 clear sentences:

${context}`,
      }),

      // Agent 5: Overall Factors & Actions
      generateText({
        model: groqModel,
        prompt: `You are a land development strategist. Analyze these conditions and provide comprehensive factors and actionable recommendations.

${context}

KEY FACTORS: Identify 5-6 critical environmental and geographic factors that impact land development. Consider:
- Climate conditions (temperature extremes, precipitation patterns)
- Environmental hazards (air quality, UV exposure, extreme weather risk)
- Geographic constraints (elevation, remoteness, population access)
- Resource availability (solar potential, wind potential, water access)
- Agricultural potential (growing conditions, soil implications)
- Infrastructure challenges (access to services, construction feasibility)

RECOMMENDED ACTIONS: Provide 4-5 practical, actionable recommendations tied to global challenges:
- Climate change resilience (adaptation strategies, sustainable practices)
- Food security (agricultural optimization, crop selection, water management)
- Sustainable development (renewable energy, eco-friendly construction)
- Risk mitigation (disaster preparedness, environmental protection)
- Economic viability (cost-effective approaches, resource maximization)

Make actions specific, practical, and globally relevant - not generic advice.

Return ONLY valid JSON, no markdown:
{"factors":["factor1","factor2","factor3","factor4","factor5"],"actions":["action1","action2","action3","action4","action5"]}`,
      }),
    ]);

    // Parse scores
    let rawScores = { agriculture: 50, housing: 50, industry: 50, renewables: 50 };
    try {
      const parsed = JSON.parse(extractJson(scoreResult.text));
      rawScores = { ...rawScores, ...parsed };
      // Clamp all scores to 0-100
      for (const key of Object.keys(rawScores) as (keyof typeof rawScores)[]) {
        rawScores[key] = Math.max(0, Math.min(100, Math.round(rawScores[key])));
      }
    } catch (e) {
      console.error('Score parse error:', e, 'Raw:', scoreResult.text);
    }

    // Enforce extreme temperature constraints
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
    let explanations: Record<string, string> = { agriculture: '', housing: '', industry: '', renewables: '' };
    try {
      explanations = JSON.parse(extractJson(whyResult.text));
    } catch (e) {
      console.error('Explanation parse error:', e, 'Raw:', whyResult.text);
    }

    // Parse recommendations
    let recommendations: string[] = ['Conduct detailed site survey', 'Consult local experts', 'Review regulatory requirements'];
    try {
      const parsed = JSON.parse(extractJson(recResult.text));
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        recommendations = parsed.recommendations;
      }
    } catch (e) {
      console.error('Recommendation parse error:', e, 'Raw:', recResult.text);
    }

    // Parse overall factors and actions
    let overallFactors: string[] = [];
    let overallActions: string[] = [];
    try {
      const parsed = JSON.parse(extractJson(factorsResult.text));
      if (Array.isArray(parsed.factors)) overallFactors = parsed.factors;
      if (Array.isArray(parsed.actions)) overallActions = parsed.actions;
    } catch (e) {
      console.error('Factors parse error:', e, 'Raw:', factorsResult.text);
    }

    // Build result in frontend's expected format
    const CATEGORY_COLORS: Record<string, string> = {
      agriculture: '#4ade80',
      housing: '#60a5fa',
      industry: '#fb923c',
      renewables: '#fbbf24',
    };

    const scores = (['agriculture', 'housing', 'industry', 'renewables'] as const).map(cat => ({
      score: rawScores[cat],
      label: (cat.charAt(0).toUpperCase() + cat.slice(1)) as 'Agriculture' | 'Housing' | 'Industry' | 'Renewables',
      color: CATEGORY_COLORS[cat],
      summary: `${cat.charAt(0).toUpperCase() + cat.slice(1)} suitability: ${rawScores[cat]}/100`,
      explanation: explanations[cat] || `Score based on ${weather.temperature}°C temp, ${airQuality.aqi} AQI, ${geo.elevation}m elevation.`,
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
      overallFactors: overallFactors.length > 0 ? overallFactors : [
        `Temperature: ${weather.temperature}°C`,
        `Air Quality: ${airQuality.aqi} AQI`,
        `Elevation: ${geo.elevation}m`,
      ],
      overallActions: overallActions.length > 0 ? overallActions : recommendations.slice(0, 3),
      overallInsight: isVeryExtreme
        ? `This location has extreme conditions (${weather.temperature}°C). All development requires specialized infrastructure. Not recommended for standard use.`
        : `Best suited for ${topScore.label.toLowerCase()} with a score of ${topScore.score}/100. ${explanations[topScore.label.toLowerCase()] || ''}`,
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
        model: 'llama-3.3-70b-versatile',
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
