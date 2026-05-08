// ============================================================
// Multi-Agent Land Analysis API — v3 (native @google/genai)
//
// Architecture:
//   Phase 1 (parallel)  — 4 data APIs + 3 Tavily web searches
//   Phase 2             — Agent 1: Score + Explain (gemini-2.5-flash)
//   Phase 3             — Agent 2: Key Factors    (gemini-2.5-flash)
//   Phase 4             — Agent 3: Recommendations(gemini-2.5-flash)
//
// Web search fills gaps the APIs don't cover:
//   soil type, land use, flood/disaster risk,
//   infrastructure, zoning, agricultural history
// ============================================================

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, fetchAirQuality } from '@/lib/services/weatherService';
import { fetchGeoData, reverseGeocode } from '@/lib/services/geoService';

// ── Gemini client ─────────────────────────────────────────────
const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

// ── Model identifiers ─────────────────────────────────────────
// All three agents use gemini-2.5-flash for highest quality output
// and to avoid free-tier quota exhaustion on gemini-2.0-flash.
const AGENT1_MODEL = 'gemini-2.5-flash';
const AGENT2_MODEL = 'gemini-2.5-flash';
const AGENT3_MODEL = 'gemini-2.5-flash';

// ── Score diversity threshold ─────────────────────────────────
// If the spread between max and min score is below this value,
// the model gave a generic answer and we apply signal-based nudges.
const MIN_SCORE_SPREAD = 15;

// ── In-memory session store (max 50) ─────────────────────────
const sessions: any[] = [];

// ── Helpers ───────────────────────────────────────────────────

/** Strip markdown fences and extract first JSON object from LLM output */
function extractJson(text: string): string {
  const cleaned = text.replace(/```(?:json|[a-z]*)?\n?/g, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  return match ? match[0].trim() : cleaned.trim();
}

/** Trim a string to approximately maxChars, cutting at a word boundary */
function trimContent(content: string, maxChars = 500): string {
  if (content.length <= maxChars) return content;
  const cut = content.lastIndexOf(' ', maxChars);
  return content.slice(0, cut > 0 ? cut : maxChars) + '…';
}

/**
 * Call a Gemini model and return the text response.
 * Uses 4096 output tokens to prevent JSON truncation on verbose responses.
 */
async function callGemini(model: string, prompt: string): Promise<string> {
  const response = await genai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.1,      // low = deterministic, consistent JSON output
      maxOutputTokens: 4096, // high enough to never truncate full JSON
    },
  });
  return response.text ?? '';
}

// ── Tavily search ─────────────────────────────────────────────

interface TavilyResult {
  title: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

/**
 * Run a single Tavily search and return the top-3 result contents
 * trimmed to maxCharsEach characters each.
 * Returns empty string gracefully if API key is missing or call fails.
 */
async function tavilySearch(
  query: string,
  maxCharsEach = 600
): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('[Tavily] TAVILY_API_KEY not set — skipping search');
    return '';
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic', // 'basic' = 1 credit, faster; 'advanced' = 2 credits, deeper
        max_results: 3,        // increased from 2 for richer context
        include_answer: false,
        include_raw_content: false,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[Tavily] HTTP ${res.status} for query: "${query}"`);
      return '';
    }

    const data: TavilyResponse = await res.json();
    return data.results
      .map(r => `[${r.title}]\n${trimContent(r.content, maxCharsEach)}`)
      .join('\n\n');
  } catch (err) {
    console.error('[Tavily] Search failed:', err);
    return '';
  }
}

// ── Main POST handler ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { lat, lng, locationName } = body;

    // ── Coordinate validation ──
    if (
      typeof lat !== 'number' || typeof lng !== 'number' ||
      isNaN(lat) || isNaN(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180' },
        { status: 400 }
      );
    }

    // ══════════════════════════════════════════════════════════
    // PHASE 1 — Parallel: 4 data APIs + 3 Tavily searches
    // ══════════════════════════════════════════════════════════

    const locationLabel = locationName ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    const [
      weather,
      airQuality,
      geo,
      location,
      webSoil,
      webRisk,
      webInfra,
    ] = await Promise.all([
      // ── Data APIs ──
      fetchWeather(lat, lng),
      fetchAirQuality(lat, lng),
      fetchGeoData(lat, lng),
      reverseGeocode(lat, lng),

      // ── Tavily: gap 1 — soil type + agricultural history ──
      tavilySearch(
        `${locationLabel} soil type agriculture crop suitability farmland`
      ),

      // ── Tavily: gap 2 — flood/disaster risk + land use + zoning ──
      tavilySearch(
        `${locationLabel} flood risk natural disaster land use zoning protected area`
      ),

      // ── Tavily: gap 3 — infrastructure (roads, power, water) ──
      tavilySearch(
        `${locationLabel} infrastructure roads electricity water supply development`
      ),
    ]);

    // ── Water / invalid location guard ──
    if (location.isWater || (geo.elevation < 0 && !location.country)) {
      return NextResponse.json(
        {
          error: 'Cannot analyse water locations. Please select land coordinates.',
          success: false,
        },
        { status: 400 }
      );
    }

    const resolvedName = locationName ?? location.placeName ?? 'Selected Location';
    const countryName  = location.country || 'Unknown';

    // ── Temperature flags ──
    const temp          = weather.temperature;
    const isExtremeCold = temp < -10;
    const isExtremeHeat = temp > 45;
    const isVeryExtreme = temp < -30 || temp > 50;

    // ── Climate descriptors derived from live data (no hardcoded strings) ──
    const tempLabel = isVeryExtreme
      ? ` ⚠ LIFE-THREATENING EXTREME`
      : isExtremeCold ? ` (very cold)`
      : isExtremeHeat ? ` (very hot)`
      : '';

    const precipLabel = weather.precipitation < 0.5
      ? ' (very dry — high drought risk)'
      : weather.precipitation > 5
      ? ' (very wet — flood risk possible)'
      : ' (moderate)';

    const windLabel  = weather.windSpeed > 20 ? ' (strong — wind energy viable)' : '';
    const uvLabel    = weather.uvIndex > 8 ? ' (very high — strong solar potential)' : '';
    const aqiLabel   = airQuality.aqi > 150 ? ' ⚠ UNHEALTHY'
                     : airQuality.aqi > 100  ? ' (sensitive groups)'
                     : ' (acceptable)';
    const elevLabel  = geo.elevation > 2000 ? ' (high altitude — construction difficult)' : '';
    const densLabel  = geo.populationDensity < 10  ? ' (very remote — limited workforce)'
                     : geo.populationDensity > 500 ? ' (dense urban)'
                     : '';

    // ── Shared environmental context (all agents receive this) ──
    const envContext = `
LOCATION : ${resolvedName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)
COUNTRY  : ${countryName}
REGION   : ${location.region || 'Unknown'}

WEATHER:
- Temperature        : ${temp}°C${tempLabel}
- Precipitation      : ${weather.precipitation} mm/day${precipLabel}
- Wind Speed         : ${weather.windSpeed} km/h${windLabel}
- Humidity           : ${weather.humidity}%
- UV Index           : ${weather.uvIndex}/11${uvLabel}
- Cloud Cover        : ${weather.cloudCover}%

AIR QUALITY:
- AQI (European)     : ${airQuality.aqi}${aqiLabel}
- PM2.5              : ${airQuality.pm25} μg/m³
- PM10               : ${airQuality.pm10} μg/m³
- NO₂                : ${airQuality.no2} μg/m³

GEOGRAPHY:
- Elevation          : ${geo.elevation} m${elevLabel}
- Population Density : ${geo.populationDensity} people/km²${densLabel}
- Urban Proximity    : ${geo.urbanProximity}/100
    `.trim();

    // ── Web search context ──
    const hasWebData   = !!(webSoil || webRisk || webInfra);
    const tavilyStatus = process.env.TAVILY_API_KEY ? 'enabled' : 'disabled (TAVILY_API_KEY not set)';

    const webContext = hasWebData
      ? `
WEB RESEARCH (fills gaps not covered by sensor APIs):

[SOIL TYPE & AGRICULTURAL HISTORY]
${webSoil || 'No data retrieved.'}

[FLOOD RISK, LAND USE & ZONING]
${webRisk || 'No data retrieved.'}

[INFRASTRUCTURE: ROADS, POWER & WATER]
${webInfra || 'No data retrieved.'}
      `.trim()
      : `WEB RESEARCH: Unavailable (${tavilyStatus}). Base scoring on sensor data only.`;

    // ══════════════════════════════════════════════════════════
    // PHASE 2 — Agent 1: Score + Explain  (gemini-2.5-flash)
    //
    // Input  : full env data + web search context
    // Output : { score, explanation } per category
    // ══════════════════════════════════════════════════════════

    const agent1Prompt = `
You are an expert land suitability analyst. Assign a score (0–100) to each land-use category and write a 2–3 sentence explanation referencing SPECIFIC data values from the input.

${envContext}

${webContext}

SCORING GUIDELINES:
- Agriculture  : Ideal temp 10–35°C, precipitation >1 mm/day, humidity 40–80%, good soil. 0 mm/day precipitation = severe drought constraint regardless of temperature. Use web research for soil quality and crop history if available.
- Housing      : Ideal temp 15–30°C, AQI <100, urban proximity >40, disaster-safe. Remoteness (density <10/km²) significantly reduces viability. Infrastructure access matters.
- Industry     : Climate-tolerant but requires workforce (density >50/km²) AND infrastructure. Very remote locations (density <10, urban proximity <20) score low regardless of climate.
- Renewables   : Solar: UV >6 AND cloud cover <40% = strong. Wind: speed >15 km/h = viable. Score reflects BEST available renewable source for the location. Grid access affects deployment cost.

SCORE DIVERSITY RULE — mandatory, violations will be rejected:
- Every category MUST have a different score — no two scores may be equal.
- The spread between the highest and lowest score MUST be at least 20 points.
- Each category is evaluated independently on its own merits.
- Think contrastively: e.g. 0 mm/day precipitation → Agriculture far lower than Renewables; very remote → Industry far lower than Agriculture; strong UV → Renewables clearly higher than Housing.

HARD CAPS — enforce regardless of other factors:
- temp < −30°C or temp > 50°C : agriculture ≤ 5,  housing ≤ 5,  industry ≤ 8,  renewables ≤ 35
- temp < −10°C or temp > 45°C : agriculture ≤ 25, housing ≤ 25
- precipitation = 0 mm/day    : agriculture ≤ 25 (drought makes farming non-viable without irrigation)
- population density < 10/km² : industry ≤ 35 (no workforce), housing ≤ 40 (too remote)
- Moderate climate (20–30°C, some rain, AQI <80, density >50): Agriculture 60–80, Housing 55–75, Industry 45–65, Renewables 40–70

Return ONLY valid JSON — no markdown fences, no preamble, no text outside the braces:
{
  "agriculture": { "score": <0-100>, "explanation": "<2-3 sentences citing specific data values>" },
  "housing"    : { "score": <0-100>, "explanation": "<2-3 sentences citing specific data values>" },
  "industry"   : { "score": <0-100>, "explanation": "<2-3 sentences citing specific data values>" },
  "renewables" : { "score": <0-100>, "explanation": "<2-3 sentences citing specific data values>" }
}
    `.trim();

    const agent1Raw = await callGemini(AGENT1_MODEL, agent1Prompt);

    // ── Parse Agent 1 output ──
    type CategoryKey = 'agriculture' | 'housing' | 'industry' | 'renewables';
    type Agent1Output = Record<CategoryKey, { score: number; explanation: string }>;

    // Sensor-derived fallback explanations — no hardcoded values
    const agent1Data: Agent1Output = {
      agriculture: {
        score: 50,
        explanation: `Temperature of ${temp}°C and precipitation of ${weather.precipitation} mm/day suggest ${weather.precipitation < 0.5 ? 'significant drought constraints requiring irrigation investment' : 'moderate growing conditions'}. Humidity at ${weather.humidity}% ${weather.humidity < 40 || weather.humidity > 80 ? 'falls outside the ideal 40–80% band' : 'is within the ideal range for most crops'}.`,
      },
      housing: {
        score: 50,
        explanation: `Air quality index of ${airQuality.aqi} is ${airQuality.aqi < 100 ? 'acceptable for residential development' : 'above safe thresholds for permanent habitation'}. Population density of ${geo.populationDensity}/km² and urban proximity of ${geo.urbanProximity}/100 indicate ${geo.populationDensity < 10 ? 'a very remote location with limited services and amenities' : 'reasonable access to urban services'}.`,
      },
      industry: {
        score: 50,
        explanation: `Population density of ${geo.populationDensity}/km² ${geo.populationDensity < 50 ? 'is below the 50/km² threshold for viable industrial workforce availability' : 'supports industrial workforce demand'}. Urban proximity score of ${geo.urbanProximity}/100 ${geo.urbanProximity < 30 ? 'signals poor infrastructure connectivity, raising logistics and supply-chain costs' : 'indicates adequate infrastructure access'}.`,
      },
      renewables: {
        score: 50,
        explanation: `UV index of ${weather.uvIndex}/11 with ${weather.cloudCover}% cloud cover ${weather.uvIndex > 6 && weather.cloudCover < 50 ? 'creates strong solar generation conditions' : 'limits solar viability as a primary source'}. Wind speed of ${weather.windSpeed} km/h ${weather.windSpeed > 15 ? 'exceeds the 15 km/h threshold for viable wind energy generation' : 'is below the threshold for commercial wind energy'}.`,
      },
    };

    try {
      const parsed = JSON.parse(extractJson(agent1Raw));
      for (const key of Object.keys(agent1Data) as CategoryKey[]) {
        if (parsed[key]) {
          agent1Data[key] = {
            score      : Math.max(0, Math.min(100, Math.round(Number(parsed[key].score)))),
            explanation: String(parsed[key].explanation ?? agent1Data[key].explanation),
          };
        }
      }
    } catch (e) {
      console.error('[Agent 1] JSON parse error:', e, '\nRaw:', agent1Raw);
      // sensor-derived fallback defaults already set above — continue with them
    }

    // ── Hard environment caps (server-side, non-negotiable) ──
    if (isVeryExtreme) {
      agent1Data.agriculture.score = Math.min(agent1Data.agriculture.score, temp < -30 ? 5  : 10);
      agent1Data.housing.score     = Math.min(agent1Data.housing.score,     temp < -30 ? 5  : 10);
      agent1Data.industry.score    = Math.min(agent1Data.industry.score,    temp < -30 ? 8  : 15);
      agent1Data.renewables.score  = Math.min(agent1Data.renewables.score,  35);
    } else if (isExtremeCold || isExtremeHeat) {
      agent1Data.agriculture.score = Math.min(agent1Data.agriculture.score, 25);
      agent1Data.housing.score     = Math.min(agent1Data.housing.score,     25);
    }

    // Drought cap: near-zero precipitation severely limits agriculture
    if (weather.precipitation < 0.1) {
      agent1Data.agriculture.score = Math.min(agent1Data.agriculture.score, 25);
    }

    // Remoteness caps: very low density constrains industry and housing
    if (geo.populationDensity < 10) {
      agent1Data.industry.score = Math.min(agent1Data.industry.score, 35);
      agent1Data.housing.score  = Math.min(agent1Data.housing.score,  40);
    }

    // ── Score diversity enforcement ──────────────────────────
    // If all scores are within MIN_SCORE_SPREAD points of each other,
    // the model returned a generic flat answer. Nudge scores apart using
    // real environmental signals — no hardcoded offsets anywhere.
    const allScores     = (Object.keys(agent1Data) as CategoryKey[]).map(k => agent1Data[k].score);
    const currentSpread = Math.max(...allScores) - Math.min(...allScores);
    let   diversityCorrected = false;

    if (currentSpread < MIN_SCORE_SPREAD) {
      console.warn(
        `[Agent 1] Spread ${currentSpread} < ${MIN_SCORE_SPREAD} — applying signal-based diversity correction`
      );
      diversityCorrected = true;

      // Signal booleans from live sensor data
      const strongSolar  = weather.uvIndex > 6 && weather.cloudCover < 50;
      const strongWind   = weather.windSpeed > 15;
      const goodAgri     = temp >= 10 && temp <= 35
                           && weather.precipitation >= 1
                           && weather.humidity >= 40
                           && weather.humidity <= 80;
      const goodHousing  = temp >= 15 && temp <= 32
                           && airQuality.aqi < 100
                           && geo.urbanProximity > 40;
      const goodIndustry = geo.populationDensity > 50
                           && geo.urbanProximity > 30;

      // Per-category delta derived proportionally from live values — no magic constants
      const renewableBonus =
        (strongSolar ? Math.round((weather.uvIndex - 6) * 3)      : -Math.round((6 - weather.uvIndex) * 2)) +
        (strongWind  ? Math.round((weather.windSpeed - 15) * 0.5) : 0);

      const agriDelta = goodAgri
        ? Math.round(weather.precipitation * 4)
        : -Math.round(
            (temp < 10  ? (10  - temp) * 1.2  : temp > 35 ? (temp - 35) * 1.2  : 0) +
            (weather.precipitation < 1 ? (1 - weather.precipitation) * 12 : 0)
          );

      const housingDelta = goodHousing
        ? Math.round(geo.urbanProximity * 0.2)
        : -Math.round(
            (airQuality.aqi > 100 ? (airQuality.aqi - 100) * 0.15 : 0) +
            (geo.urbanProximity   < 40 ? (40 - geo.urbanProximity) * 0.3 : 0)
          );

      const industryDelta = goodIndustry
        ? Math.round(geo.urbanProximity * 0.15)
        : -Math.round(
            (geo.populationDensity < 50 ? (50 - geo.populationDensity) * 0.2 : 0) +
            (geo.urbanProximity    < 30 ? (30 - geo.urbanProximity)    * 0.3 : 0)
          );

      // Anchor on the mean of the current flat scores
      const anchor = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

      agent1Data.renewables.score  = Math.max(0, Math.min(100, anchor + renewableBonus));
      agent1Data.agriculture.score = Math.max(0, Math.min(100, anchor + agriDelta));
      agent1Data.housing.score     = Math.max(0, Math.min(100, anchor + housingDelta));
      agent1Data.industry.score    = Math.max(0, Math.min(100, anchor + industryDelta));

      // Re-apply all hard caps after nudging
      if (isVeryExtreme) {
        agent1Data.agriculture.score = Math.min(agent1Data.agriculture.score, temp < -30 ? 5  : 10);
        agent1Data.housing.score     = Math.min(agent1Data.housing.score,     temp < -30 ? 5  : 10);
        agent1Data.industry.score    = Math.min(agent1Data.industry.score,    temp < -30 ? 8  : 15);
        agent1Data.renewables.score  = Math.min(agent1Data.renewables.score,  35);
      } else if (isExtremeCold || isExtremeHeat) {
        agent1Data.agriculture.score = Math.min(agent1Data.agriculture.score, 25);
        agent1Data.housing.score     = Math.min(agent1Data.housing.score,     25);
      }
      if (weather.precipitation < 0.1) {
        agent1Data.agriculture.score = Math.min(agent1Data.agriculture.score, 25);
      }
      if (geo.populationDensity < 10) {
        agent1Data.industry.score = Math.min(agent1Data.industry.score, 35);
        agent1Data.housing.score  = Math.min(agent1Data.housing.score,  40);
      }

      const correctedScores = (Object.keys(agent1Data) as CategoryKey[]).map(k => agent1Data[k].score);
      console.log('[Agent 1] Corrected scores:', {
        agriculture: agent1Data.agriculture.score,
        housing    : agent1Data.housing.score,
        industry   : agent1Data.industry.score,
        renewables : agent1Data.renewables.score,
        spread     : Math.max(...correctedScores) - Math.min(...correctedScores),
      });
    }

    // ══════════════════════════════════════════════════════════
    // PHASE 3 — Agent 2: Key Factors  (gemini-2.5-flash)
    //
    // Input  : env data + web context + Agent 1 scores
    // Output : 5–6 critical factors driving the scores
    // ══════════════════════════════════════════════════════════

    const agent2Prompt = `
You are a land analysis specialist. Given the full environmental data, web research, and suitability scores below, identify the 5–6 most critical factors driving these specific scores. Include both positive enablers and negative constraints.

${envContext}

${webContext}

SUITABILITY SCORES FROM ANALYSIS:
- Agriculture : ${agent1Data.agriculture.score}/100
- Housing     : ${agent1Data.housing.score}/100
- Industry    : ${agent1Data.industry.score}/100
- Renewables  : ${agent1Data.renewables.score}/100

INSTRUCTIONS:
- Each factor must cite an actual numeric data value (e.g. "Precipitation of 0 mm/day creates severe drought conditions that make rain-fed agriculture non-viable")
- Cover a diverse mix: climate constraints, air quality, geographic isolation, soil/land conditions, renewable potential, infrastructure gaps
- Each factor must be 1–2 complete informative sentences — not fragments
- Factors must directly explain WHY the scores above are at those levels
- Do NOT restate the scores; explain the underlying data that drove them
- Order factors from most impactful to least impactful

Return ONLY valid JSON — no markdown fences, no preamble:
{ "factors": ["factor1", "factor2", "factor3", "factor4", "factor5"] }
    `.trim();

    const agent2Raw = await callGemini(AGENT2_MODEL, agent2Prompt);

    let factors: string[] = [];
    try {
      const parsed = JSON.parse(extractJson(agent2Raw));
      if (Array.isArray(parsed.factors) && parsed.factors.length > 0) {
        factors = parsed.factors.slice(0, 6).map(String);
      }
    } catch (e) {
      console.error('[Agent 2] JSON parse error:', e, '\nRaw:', agent2Raw);
    }

    // ── Sensor-derived fallback factors — all values from live data ──
    if (factors.length === 0) {
      factors = [
        `Precipitation of ${weather.precipitation} mm/day ${weather.precipitation < 0.5
          ? `indicates near-total absence of rainfall, creating severe drought conditions that make rain-fed agriculture non-viable and significantly raise the cost of water supply for housing and industry`
          : weather.precipitation > 5
          ? `indicates very high rainfall which improves agricultural water availability but raises flood risk for housing and industrial infrastructure`
          : `provides moderate water availability, broadly supporting agriculture and reducing water supply costs for development`}.`,

        `Population density of ${geo.populationDensity} people/km² with an urban proximity score of ${geo.urbanProximity}/100 ${geo.populationDensity < 10
          ? `classifies this as a very remote location, severely limiting industrial workforce availability, housing service access, and grid connectivity for renewable energy deployment`
          : geo.populationDensity > 200
          ? `indicates a dense urban environment with strong workforce and infrastructure access, supporting housing and industrial development`
          : `suggests a moderately accessible location with some workforce availability and partial infrastructure coverage`}.`,

        `UV index of ${weather.uvIndex}/11 combined with ${weather.cloudCover}% cloud cover ${weather.uvIndex > 6 && weather.cloudCover < 50
          ? `creates strong solar irradiance conditions that support large-scale photovoltaic deployment, making renewables the most viable land use for this location`
          : `limits solar energy potential as a primary power source, though wind speed of ${weather.windSpeed} km/h ${weather.windSpeed > 15 ? 'partially compensates with viable wind generation' : 'also falls below commercial wind thresholds'}`}.`,

        `Temperature of ${temp}°C ${isVeryExtreme
          ? `represents a life-threatening extreme that makes this location unsuitable for conventional agriculture, habitation, and most industrial activities without heavily specialised infrastructure`
          : isExtremeCold
          ? `is severely below the 10°C minimum for most crops, restricts year-round habitation, and increases construction and heating costs substantially`
          : isExtremeHeat
          ? `exceeds 45°C, creating dangerous heat stress for workers and crops, and demanding energy-intensive cooling for any built environment`
          : `falls within a broadly acceptable range for most land uses, though its interaction with precipitation and humidity determines agricultural ceiling`}.`,

        `Air quality index of ${airQuality.aqi} (PM2.5: ${airQuality.pm25} μg/m³, NO₂: ${airQuality.no2} μg/m³) ${airQuality.aqi > 150
          ? `is classified as unhealthy, posing serious respiratory risks that make this location unsuitable for residential development without significant pollution mitigation`
          : airQuality.aqi > 100
          ? `is elevated above safe thresholds for sensitive populations, moderately reducing housing suitability and long-term habitability`
          : `is within acceptable limits and does not constrain any land use category on air quality grounds alone`}.`,

        `Elevation of ${geo.elevation}m ${geo.elevation > 3000
          ? `represents a high-altitude environment where reduced oxygen, extreme cold, and difficult construction access combine to severely restrict all land uses`
          : geo.elevation > 2000
          ? `creates moderate altitude constraints including cooler temperatures, thinner air, and higher construction costs that reduce scores for housing and industry`
          : `presents no significant altitude barrier to development, keeping terrain-related construction costs within normal ranges`}.`,
      ];
    }

    // ══════════════════════════════════════════════════════════
    // PHASE 4 — Agent 3: Recommendations  (gemini-2.5-flash)
    //
    // Input  : location + Agent 1 scores+explanations + Agent 2 factors
    // Output : 4–5 actionable recommendations tied to global challenges
    // ══════════════════════════════════════════════════════════

    const topCategory = (
      Object.entries(agent1Data) as [CategoryKey, { score: number }][]
    ).reduce((a, b) => (a[1].score > b[1].score ? a : b))[0];

    const agent3Prompt = `
You are a sustainable land development strategist. Based on the complete land analysis below, provide 4–5 specific actionable recommendations that connect this location's real conditions to GLOBAL CHALLENGES.

LOCATION: ${resolvedName}, ${countryName}

SUITABILITY SCORES AND EXPLANATIONS:
- Agriculture : ${agent1Data.agriculture.score}/100 — ${agent1Data.agriculture.explanation}
- Housing     : ${agent1Data.housing.score}/100 — ${agent1Data.housing.explanation}
- Industry    : ${agent1Data.industry.score}/100 — ${agent1Data.industry.explanation}
- Renewables  : ${agent1Data.renewables.score}/100 — ${agent1Data.renewables.explanation}

TOP USE CASE: ${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} (${agent1Data[topCategory].score}/100)

KEY ENVIRONMENTAL & GEOGRAPHIC FACTORS:
${factors.map((f, i) => `${i + 1}. ${f}`).join('\n')}

INSTRUCTIONS:
- Each recommendation must be 2–3 sentences, SPECIFIC to this location's actual numeric scores and factor data
- Connect each recommendation to a real global challenge: food security, climate change adaptation, renewable energy transition, water scarcity management, sustainable urbanisation, economic resilience, biodiversity
- Cite actual data values within each recommendation (e.g. "With UV index of ${weather.uvIndex} and only ${weather.cloudCover}% cloud cover...")
- Do NOT give generic advice such as "conduct a survey", "consult local experts", or "consider renewable energy"
- Prioritise the top use case but also address how to mitigate the main constraints in lower-scoring categories
- Each recommendation should be actionable at a policy, infrastructure, or investment level
${isVeryExtreme ? '- NOTE: Extreme temperature conditions — focus exclusively on resilience infrastructure, specialised engineering solutions, and risk mitigation' : ''}

Return ONLY valid JSON — no markdown fences, no preamble:
{ "actions": ["action1", "action2", "action3", "action4"] }
    `.trim();

    const agent3Raw = await callGemini(AGENT3_MODEL, agent3Prompt);

    let actions: string[] = [];
    try {
      const parsed = JSON.parse(extractJson(agent3Raw));
      if (Array.isArray(parsed.actions) && parsed.actions.length > 0) {
        actions = parsed.actions.slice(0, 5).map(String);
      }
    } catch (e) {
      console.error('[Agent 3] JSON parse error:', e, '\nRaw:', agent3Raw);
    }

    // ── Sensor-derived fallback actions — all values from live data ──
    if (actions.length === 0) {
      const topLabel = topCategory.charAt(0).toUpperCase() + topCategory.slice(1);
      actions = [
        `${topLabel} scores highest at ${agent1Data[topCategory].score}/100 for this location. ${topLabel === 'Renewables'
          ? `With UV index ${weather.uvIndex}/11 and ${weather.cloudCover}% cloud cover, invest in utility-scale solar photovoltaic infrastructure to address the global renewable energy transition. Remote deployment (population density: ${geo.populationDensity}/km²) is viable using off-grid microgrids that also power future economic activity in the area.`
          : topLabel === 'Agriculture'
          ? `Develop drought-resilient drip irrigation systems to offset the ${weather.precipitation} mm/day precipitation deficit, directly addressing food security challenges. Precision agriculture technologies can optimise water use and maximise yields under the recorded temperature of ${temp}°C.`
          : topLabel === 'Housing'
          ? `Focus residential planning on climate-adaptive buildings designed for ${temp}°C, using passive cooling and high-insulation materials to reduce energy demand and improve long-term habitability. Compact community design can overcome the urban proximity constraint of ${geo.urbanProximity}/100 by co-locating services.`
          : `Develop light manufacturing and logistics infrastructure scaled to the available workforce of ${geo.populationDensity}/km². Target industries tolerant of remote locations when supported by renewable energy (UV: ${weather.uvIndex}/11), such as mineral processing or data centre operations.`}`,

        `Water scarcity is a critical constraint with precipitation at ${weather.precipitation} mm/day. ${weather.precipitation < 0.5
          ? `Invest in solar-powered desalination or deep aquifer extraction to unlock this location's development potential across all use cases. Pairing water infrastructure with the available renewable energy potential (UV: ${weather.uvIndex}/11) directly addresses UN SDG 6 (Clean Water) and SDG 7 (Clean Energy) simultaneously.`
          : `Implement integrated water resource management including seasonal storage reservoirs and greywater recycling to climate-proof development against projected precipitation variability under long-term climate change scenarios.`}`,

        `Renewable energy infrastructure investment is justified by ${weather.uvIndex > 6 ? `a strong UV index of ${weather.uvIndex}/11 with only ${weather.cloudCover}% cloud cover` : `UV index of ${weather.uvIndex}/11`}${weather.windSpeed > 15 ? ` and wind speed of ${weather.windSpeed} km/h exceeding the commercial wind threshold` : ''}. ${geo.urbanProximity < 30
          ? `Given urban proximity of only ${geo.urbanProximity}/100, prioritise off-grid microgrid solutions that reduce fossil fuel dependency and lower the cost threshold for any future industrial or residential development at this remote site.`
          : `Connect renewable installations to the existing grid via the urban proximity corridor (${geo.urbanProximity}/100) to maximise energy export revenue and accelerate the regional clean energy transition.`}`,

        `Air quality of AQI ${airQuality.aqi} (PM2.5: ${airQuality.pm25} μg/m³, PM10: ${airQuality.pm10} μg/m³) ${airQuality.aqi < 80
          ? `represents a clean-air comparative advantage that should be leveraged to attract climate-sensitive industries such as pharmaceutical manufacturing or precision agriculture, which require low-particulate environments and align with global health and food-safety standards.`
          : `requires active mitigation before residential or food-production development proceeds. Establish particulate monitoring networks and green buffer zones, linking air quality improvement milestones to industrial permitting to prevent cumulative pollution as development scales.`}`,
      ];
    }

    // ══════════════════════════════════════════════════════════
    // RESULT ASSEMBLY
    // ══════════════════════════════════════════════════════════

    const CATEGORY_COLORS: Record<CategoryKey, string> = {
      agriculture : '#4ade80',
      housing     : '#60a5fa',
      industry    : '#fb923c',
      renewables  : '#fbbf24',
    };

    const CATEGORY_LABELS: Record<CategoryKey, 'Agriculture' | 'Housing' | 'Industry' | 'Renewables'> = {
      agriculture : 'Agriculture',
      housing     : 'Housing',
      industry    : 'Industry',
      renewables  : 'Renewables',
    };

    const scores = (Object.keys(agent1Data) as CategoryKey[]).map(cat => ({
      score      : agent1Data[cat].score,
      label      : CATEGORY_LABELS[cat],
      color      : CATEGORY_COLORS[cat],
      summary    : `${CATEGORY_LABELS[cat]} suitability: ${agent1Data[cat].score}/100`,
      explanation: agent1Data[cat].explanation,
    }));

    const topScore    = scores.reduce((a, b) => (a.score > b.score ? a : b));
    const finalScores = scores.map(s => s.score);
    const finalSpread = Math.max(...finalScores) - Math.min(...finalScores);

    const overallInsight = isVeryExtreme
      ? `Extreme conditions (${temp}°C) make this location unsuitable for standard development. Specialised infrastructure and strict risk mitigation are required across all use cases.`
      : `Best suited for ${topScore.label.toLowerCase()} with a score of ${topScore.score}/100. ${agent1Data[topCategory].explanation}`;

    const result = {
      location: {
        latLng   : { lat, lng },
        placeName: resolvedName,
        country  : location.country  ?? '',
        region   : location.region   ?? '',
      },
      scores,
      overallFactors : factors,
      overallActions : actions,
      overallInsight,
      topUse         : topScore.label,
      disclaimer     : 'AI-assisted insights only. Not a substitute for professional surveys or local regulations.',
      generatedAt    : new Date().toISOString(),
    };

    // ── Store session ──
    sessions.unshift({
      id       : `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      location : result.location,
      result,
      timestamp: new Date().toISOString(),
    });
    if (sessions.length > 50) sessions.pop();

    return NextResponse.json({
      success: true,
      data   : result,
      meta   : {
        durationMs     : Date.now() - startTime,
        dataSource     : 'live',
        webSearch      : hasWebData ? 'enabled' : `disabled (${tavilyStatus})`,
        scoreDiversity : { spread: finalSpread, corrected: diversityCorrected },
        models         : { agent1: AGENT1_MODEL, agent2: AGENT2_MODEL, agent3: AGENT3_MODEL },
      },
    });

  } catch (error) {
    console.error('[Analyze] Route error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.', success: false },
      { status: 500 }
    );
  }
}

// ── GET — retrieve sessions ───────────────────────────────────
export async function GET() {
  return NextResponse.json({ sessions, total: sessions.length });
}