// ============================================================
// AI Service - Land suitability scoring via Vercel AI SDK
// Uses Google Gemini (free tier)
// ============================================================

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { SuitabilityResult, SuitabilityCategory, EnvPayload } from '@/types';

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
Analyze land suitability for these environmental conditions:

WEATHER:
- Temperature: ${weather.temperature}°C
- Precipitation: ${weather.precipitation}mm/day
- Wind Speed: ${weather.windSpeed}km/h
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uvIndex}
- Cloud Cover: ${weather.cloudCover}%

AIR QUALITY:
- AQI: ${airQuality.aqi}
- PM2.5: ${airQuality.pm25} μg/m³
- PM10: ${airQuality.pm10} μg/m³
- NO2: ${airQuality.no2} μg/m³

GEOGRAPHIC:
- Elevation: ${geo.elevation}m
- Population Density: ${geo.populationDensity} people/km²
- Urban Proximity: ${geo.urbanProximity}/100

Score 0-100 for each: Agriculture, Housing, Industry, Renewables.
Consider: water needs, infrastructure, solar/wind potential, livability.
Return practical actions and key factors for each.
  `.trim();

  try {
    const result = await generateObject({
      model: google('gemini-3-flash-preview', { structuredOutputs: true }),
      schema: suitabilitySchema,
      prompt,
      temperature: 0.3,
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

  // Simple rule-based scoring as fallback
  const agricultureScore = Math.min(100, Math.round(
    (100 - Math.abs(weather.temperature - 25)) * 0.3 +
    (weather.precipitation > 2 ? 80 : weather.precipitation * 40) * 0.3 +
    (airQuality.aqi < 50 ? 80 : 40) * 0.2 +
    (geo.populationDensity < 100 ? 70 : 30) * 0.2
  ));

  const housingScore = Math.min(100, Math.round(
    (weather.temperature > 15 && weather.temperature < 30 ? 80 : 50) * 0.25 +
    (airQuality.aqi < 50 ? 90 : airQuality.aqi < 100 ? 60 : 30) * 0.25 +
    (geo.urbanProximity > 50 ? 80 : 40) * 0.25 +
    (geo.elevation < 500 ? 70 : 50) * 0.25
  ));

  const industryScore = Math.min(100, Math.round(
    (geo.populationDensity > 50 ? 70 : 40) * 0.3 +
    (geo.urbanProximity > 30 ? 75 : 50) * 0.3 +
    (weather.windSpeed > 10 ? 60 : 50) * 0.2 +
    (airQuality.aqi > 30 ? 70 : 50) * 0.2
  ));

  const renewablesScore = Math.min(100, Math.round(
    (weather.uvIndex > 6 ? 90 : weather.uvIndex * 15) * 0.4 +
    (weather.windSpeed > 15 ? 85 : weather.windSpeed * 5) * 0.3 +
    (geo.populationDensity < 50 ? 80 : 40) * 0.2 +
    (weather.cloudCover < 30 ? 80 : 50) * 0.1
  ));

  const scores = [
    { score: agricultureScore, label: 'Agriculture' as SuitabilityCategory, color: '#4ade80' },
    { score: housingScore, label: 'Housing' as SuitabilityCategory, color: '#60a5fa' },
    { score: industryScore, label: 'Industry' as SuitabilityCategory, color: '#fb923c' },
    { score: renewablesScore, label: 'Renewables' as SuitabilityCategory, color: '#fbbf24' },
  ].map(s => ({
    ...s,
    summary: `${s.label} suitability: ${s.score}/100`,
    explanation: `Based on local conditions including ${weather.temperature}°C temp, ${airQuality.aqi} AQI, and ${geo.elevation}m elevation.`,
    actions: [
      s.label === 'Agriculture' ? 'Consider drought-resistant crops' :
      s.label === 'Housing' ? 'Assess local building codes' :
      s.label === 'Industry' ? 'Check zoning regulations' :
      'Evaluate grid connection options',
      'Conduct detailed site survey',
      'Review environmental impact requirements',
    ],
    keyFactors: [
      `Temperature: ${weather.temperature}°C`,
      `Air Quality Index: ${airQuality.aqi}`,
      `Population density: ${geo.populationDensity}/km²`,
    ],
  }));

  const topUse = scores.reduce((a, b) => a.score > b.score ? a : b).label;

  return {
    scores,
    overallInsight: `Best suited for ${topUse.toLowerCase()} with a score of ${scores.find(s => s.label === topUse)?.score}/100. Conditions ${scores.find(s => s.label === topUse)?.score! > 70 ? 'favor' : 'may limit'} this use case.`,
    topUse,
    disclaimer: 'AI-assisted insights only. Not a substitute for professional surveys or local regulations.',
  };
}
