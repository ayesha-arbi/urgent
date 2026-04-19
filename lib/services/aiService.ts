// ============================================================
// AI Service - Land suitability scoring via Vercel AI SDK
// Uses Google Gemini (free tier)
// ============================================================

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { SuitabilityResult, SuitabilityCategory, EnvPayload } from '@/types';

function aqiLabel(aqi: number): string {
  if (aqi <= 50) return '(good)';
  if (aqi <= 100) return '(moderate)';
  if (aqi <= 150) return '(unhealthy for sensitive)';
  return '(unhealthy)';
}

const CATEGORY_COLORS: Record<SuitabilityCategory, string> = {
  Agriculture: '#4ade80',
  Housing: '#60a5fa',
  Industry: '#fb923c',
  Renewables: '#fbbf24',
};

const suitabilitySchema = z.object({
  scores: z.array(z.object({
    score: z.number().min(0).max(100),
    label: z.enum(['Agriculture', 'Housing', 'Industry', 'Renewables']),
    summary: z.string(),
    explanation: z.string(),
    actions: z.array(z.string()),
    keyFactors: z.array(z.string()),
  })),
  overallInsight: z.string(),
  topUse: z.enum(['Agriculture', 'Housing', 'Industry', 'Renewables']),
  disclaimer: z.string(),
});

export async function generateSuitabilityAnalysis(envData: EnvPayload): Promise<Omit<SuitabilityResult, 'location' | 'generatedAt'>> {
  const { weather, airQuality, geo } = envData;

  const prompt = `
You are a land suitability analysis expert. Score each category 0-100 based on the environmental data provided.

CRITICAL SCORING RULES - FOLLOW THESE STRICTLY:
1. TEMPERATURE EXTREMES: If temperature < 0°C (freezing) or > 45°C (extreme heat), ALL categories must score below 30
2. ANTARCTIC/ARCTIC: If temperature < -10°C, ALL scores must be below 15 - these locations are unsuitable for any development
3. HOUSING: Requires livable temperature (10-35°C ideal). Score near 0 for extreme cold/heat regardless of air quality
4. AGRICULTURE: Requires moderate temp (5-40°C), adequate precipitation (>0.5mm), reasonable humidity. Frozen ground = near 0
5. INDUSTRY: Most tolerant but still needs worker survivability. Below -20°C = score under 20
6. RENEWABLES: Solar needs UV index and low cloud cover; wind needs high wind speed. Cold alone doesn't disqualify

ENVIRONMENTAL DATA:
- Temperature: ${weather.temperature}°C (extreme cold <0°C or extreme heat >45°C severely limits ALL uses)
- Precipitation: ${weather.precipitation}mm/day
- Wind Speed: ${weather.windSpeed}km/h
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uvIndex} (0-11 scale)
- Cloud Cover: ${weather.cloudCover}%

- AQI: ${airQuality.aqi} (lower is better)
- PM2.5: ${airQuality.pm25} μg/m³
- PM10: ${airQuality.pm10} μg/m³

- Elevation: ${geo.elevation}m
- Population Density: ${geo.populationDensity} people/km²
- Urban Proximity: ${geo.urbanProximity}/100

Return scores 0-100 for each category with summary, explanation, 3 key factors, and 3 practical actions.
The scores MUST reflect real-world habitability - Antarctica, Arctic, Sahara core, etc. should score very low across all categories.
  `.trim();

  try {
    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: suitabilitySchema,
      prompt,
      temperature: 0.1, // Lower temperature = more deterministic, less creative
    });

    const scores = result.object.scores.map(s => ({
      ...s,
      color: CATEGORY_COLORS[s.label],
    }));

    return {
      scores,
      overallInsight: result.object.overallInsight,
      topUse: result.object.topUse,
      disclaimer: result.object.disclaimer || 'AI-assisted insights only. Not a substitute for professional surveys or local regulations.',
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return generateFallbackAnalysis(envData);
  }
}

function generateFallbackAnalysis(envData: EnvPayload): Omit<SuitabilityResult, 'location' | 'generatedAt'> {
  const { weather, airQuality, geo } = envData;
  const temp = weather.temperature;

  // EXTREME TEMPERATURE PENALTY - Critical for Antarctica-like conditions
  // If temp is below -10°C or above 50°C, all scores should be very low
  const extremeColdPenalty = temp < -10 ? (100 - Math.max(0, 50 + temp * 2)) : 0; // -43°C → penalty ~100
  const extremeHeatPenalty = temp > 45 ? (100 - Math.max(0, 100 - temp * 2)) : 0;
  const tempPenalty = Math.max(extremeColdPenalty, extremeHeatPenalty);

  // Agriculture: needs moderate temp (5-40°C ideal), water, decent air
  let agricultureScore = Math.min(100, Math.round(
    Math.max(0, (40 - Math.abs(temp - 22)) * 2.5) + // Peak at 22°C
    (weather.precipitation > 2 ? 25 : Math.max(0, weather.precipitation * 12)) +
    (airQuality.aqi < 50 ? 20 : Math.max(0, 20 - airQuality.aqi / 5)) +
    (geo.populationDensity < 200 ? 15 : 5)
  ));
  agricultureScore = Math.max(0, agricultureScore - tempPenalty);

  // Housing: needs livable temp (15-30°C ideal), good air, low elevation
  let housingScore = Math.min(100, Math.round(
    Math.max(0, (30 - Math.abs(temp - 22)) * 3) + // Peak at 22°C
    (airQuality.aqi < 50 ? 25 : Math.max(0, 25 - airQuality.aqi / 4)) +
    (geo.urbanProximity > 50 ? 20 : geo.urbanProximity * 0.4) +
    (geo.elevation < 500 ? 15 : Math.max(0, 15 - geo.elevation / 100))
  ));
  housingScore = Math.max(0, housingScore - tempPenalty);

  // Industry: tolerant but needs worker access and survivability
  let industryScore = Math.min(100, Math.round(
    (geo.populationDensity > 50 ? 25 : geo.populationDensity * 0.5) +
    (geo.urbanProximity > 30 ? 25 : geo.urbanProximity * 0.8) +
    Math.max(0, 20 - Math.abs(temp - 20)) + // Peak at 20°C
    (weather.windSpeed > 8 ? 15 : weather.windSpeed * 1.5) +
    (airQuality.aqi > 20 ? 15 : airQuality.aqi * 0.5) // Some pollution OK for industry
  ));
  industryScore = Math.max(0, industryScore - (tempPenalty * 0.7)); // Industry slightly more tolerant

  // Renewables: solar needs UV + low clouds, wind needs speed, temp irrelevant
  const solarPotential = weather.uvIndex > 5 && weather.cloudCover < 40 ? 40 : weather.uvIndex * 6 + (100 - weather.cloudCover) * 0.3;
  const windPotential = weather.windSpeed > 15 ? 35 : weather.windSpeed * 2;
  const spaceAvailable = geo.populationDensity < 30 ? 25 : Math.max(0, 25 - geo.populationDensity / 20);
  let renewablesScore = Math.min(100, Math.round(solarPotential + windPotential + spaceAvailable));
  // Renewables can work in cold (solar panels work fine, wind too)
  if (temp < -20) renewablesScore = Math.min(renewablesScore, 35); // Extreme cold reduces but doesn't eliminate

  // Final sanity check: Antarctica should NOT score high anywhere
  if (temp < -30) {
    agricultureScore = Math.min(agricultureScore, 5);
    housingScore = Math.min(housingScore, 8);
    industryScore = Math.min(industryScore, 12);
  }
  if (temp > 50) {
    agricultureScore = Math.min(agricultureScore, 10);
    housingScore = Math.min(housingScore, 10);
  }

  // Generate context-aware actions based on conditions
  const getActions = (label: string, score: number) => {
    const isExtreme = temp < -10 || temp > 45;
    if (isExtreme && score < 20) {
      return [
        'Location has extreme environmental conditions',
        'Specialized infrastructure required for survival',
        'Not recommended for standard development',
      ];
    }
    if (label === 'Agriculture') {
      return [
        weather.precipitation < 1 ? 'Implement irrigation systems' : 'Utilize natural rainfall',
        temp > 35 ? 'Select heat-tolerant crop varieties' : temp < 10 ? 'Use cold-resistant crops or greenhouses' : 'Optimize crop rotation',
        'Conduct soil testing for nutrient analysis',
      ];
    }
    if (label === 'Housing') {
      return [
        temp < 0 ? 'Design for extreme cold insulation' : temp > 40 ? 'Implement passive cooling systems' : 'Standard residential construction',
        geo.elevation > 1000 ? 'Account for altitude in building codes' : 'Standard foundation requirements',
        'Assess local infrastructure access',
      ];
    }
    if (label === 'Industry') {
      return [
        'Review zoning and environmental regulations',
        geo.populationDensity > 100 ? 'Consider workforce availability' : 'Plan worker transportation',
        'Evaluate supply chain logistics',
      ];
    }
    return [
      weather.uvIndex > 7 ? 'High solar potential - consider PV installation' : 'Supplement with wind or other sources',
      weather.windSpeed > 15 ? 'Wind farm feasibility study recommended' : 'Solar-primary renewable strategy',
      'Assess grid connection feasibility',
    ];
  };

  const scores = [
    { score: agricultureScore, label: 'Agriculture' as SuitabilityCategory, color: '#4ade80' },
    { score: housingScore, label: 'Housing' as SuitabilityCategory, color: '#60a5fa' },
    { score: industryScore, label: 'Industry' as SuitabilityCategory, color: '#fb923c' },
    { score: renewablesScore, label: 'Renewables' as SuitabilityCategory, color: '#fbbf24' },
  ].map(s => ({
    ...s,
    summary: `${s.label} suitability: ${s.score}/100`,
    explanation: `${s.label === 'Agriculture' ? 'Based on temperature, precipitation, air quality, and land availability. ' : ''}${s.label === 'Housing' ? 'Based on livability factors including temperature, air quality, elevation, and urban access. ' : ''}${s.label === 'Industry' ? 'Based on workforce access, infrastructure proximity, and operational conditions. ' : ''}${s.label === 'Renewables' ? 'Based on solar (UV/clouds) and wind potential plus available space. ' : ''}Current: ${weather.temperature}°C, AQI ${airQuality.aqi}, ${geo.elevation}m elevation.`,
    actions: getActions(s.label, s.score),
    keyFactors: [
      `Temperature: ${weather.temperature}°C ${temp < 0 ? '(freezing)' : temp > 40 ? '(extreme heat)' : ''}`,
      `Air Quality Index: ${airQuality.aqi} ${aqiLabel(airQuality.aqi)}`,
      `Population density: ${geo.populationDensity}/km²`,
      s.label === 'Renewables' ? `UV Index: ${weather.uvIndex}, Wind: ${weather.windSpeed}km/h` : `Elevation: ${geo.elevation}m`,
    ].filter(Boolean),
  }));

  const topUse = scores.reduce((a, b) => a.score > b.score ? a : b).label;

  return {
    scores,
    overallInsight: `Best suited for ${topUse.toLowerCase()} with a score of ${scores.find(s => s.label === topUse)?.score}/100. Conditions ${scores.find(s => s.label === topUse)?.score! > 70 ? 'favor' : 'may limit'} this use case.`,
    topUse,
    disclaimer: 'AI-assisted insights only. Not a substitute for professional surveys or local regulations.',
  };
}
