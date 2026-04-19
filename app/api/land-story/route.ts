// ============================================================
// Land Story Generator API
// Creates shareable visual report with narrative and insights
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import type { SuitabilityResult, LandStory } from '@/types';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const groqModel = groq('llama-3.3-70b-versatile');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { result }: { result: SuitabilityResult } = body;

    if (!result || !result.scores) {
      return NextResponse.json(
        { error: 'Invalid analysis data' },
        { status: 400 }
      );
    }

    // Calculate sustainability impact score (weighted average)
    const weights = { Agriculture: 0.3, Housing: 0.2, Industry: 0.2, Renewables: 0.3 };
    const sustainabilityScore = Math.round(
      result.scores.reduce((acc, s) => {
        const weight = weights[s.label as keyof typeof weights] || 0.25;
        return acc + s.score * weight;
      }, 0)
    );

    // Build context for AI narrative generation
    const context = `
Location: ${result.location.placeName}, ${result.location.country || 'Unknown Region'}
Coordinates: ${result.location.latLng.lat.toFixed(4)}, ${result.location.lng.toFixed(4)}

SUITABILITY SCORES:
${result.scores.map(s => `- ${s.label}: ${s.score}/100`).join('\n')}

TOP USE: ${result.topUse} (${result.scores.find(s => s.label === result.topUse)?.score || 0}/100)

KEY FACTORS:
${result.overallFactors?.map(f => `- ${f}`).join('\n') || 'No factors provided'}

AI INSIGHT: ${result.overallInsight}
`;

    // Generate narrative and global insights
    const [narrativeResult, insightsResult] = await Promise.all([
      generateText({
        model: groqModel,
        prompt: `You are a land development storyteller. Write a compelling 2-3 sentence narrative about this location's potential.

${context}

Make it vivid and memorable. Connect the land's characteristics to human needs and opportunities.
Avoid generic phrases. Be specific about what makes this location unique.

Return ONLY the narrative text, no quotes or markdown.`,
      }),

      generateText({
        model: groqModel,
        prompt: `You are a sustainability analyst. Given this land analysis:

${context}

Identify 3-4 key insights that connect this location to GLOBAL CHALLENGES:
- Food security and agricultural resilience
- Climate change adaptation/mitigation
- Sustainable urban development
- Renewable energy transition
- Water resource management
- Biodiversity and ecosystem protection

For each insight, explain HOW this location's characteristics relate to the global challenge.
Be specific and actionable, not generic.

Return ONLY valid JSON, no markdown:
{"insights":["insight1","insight2","insight3","insight4"]}`,
      }),
    ]);

    // Extract insights from JSON
    let globalInsights: string[] = [];
    try {
      const parsed = JSON.parse(insightsResult.text.replace(/```(?:json)?\n?/g, '').trim());
      globalInsights = Array.isArray(parsed.insights) ? parsed.insights : [];
    } catch (e) {
      console.error('Insights parse error:', e);
      globalInsights = [
        'Potential contribution to regional food security',
        'Climate-resilient land use considerations',
        'Sustainable development opportunities',
      ];
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/analyze?lat=${result.location.latLng.lat.toFixed(4)}&lng=${result.location.lng.toFixed(4)}&name=${encodeURIComponent(result.location.placeName)}`;

    const landStory: LandStory = {
      location: result.location,
      sustainabilityScore,
      scores: result.scores,
      narrative: narrativeResult.text.trim(),
      globalInsights: globalInsights.slice(0, 4),
      recommendations: result.overallActions?.slice(0, 3) || [],
      generatedAt: new Date().toISOString(),
      shareUrl,
    };

    return NextResponse.json({
      success: true,
      data: landStory,
    });
  } catch (error) {
    console.error('Land Story API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate land story' },
      { status: 500 }
    );
  }
}
