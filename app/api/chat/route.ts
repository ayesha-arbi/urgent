// ============================================================
// Chat API Route — plain text streaming
//
// ChatBot.tsx now reads the stream directly with fetch + ReadableStream,
// so we don't need any AI SDK stream protocol format.
// toTextStreamResponse() emits raw text chunks — exactly what we read.
// ============================================================

import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { ROLE_CONFIG, UserRole } from '@/lib/role-context';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const MODEL_ID = 'gemini-2.5-flash';

const DEFAULT_SYSTEM_PROMPT =
  'You are ZameendarAI, a general land intelligence assistant. ' +
  'Provide helpful, accurate, and concise information about land suitability, ' +
  'geography, climate, agriculture, and sustainable development.';

// Simple message shape sent by ChatBot.tsx
interface SimpleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: SimpleMessage[] = body.messages ?? [];
    const role = body.role as UserRole | undefined;
    const context = body.context;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or empty messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt =
      role && ROLE_CONFIG[role]
        ? ROLE_CONFIG[role].systemPrompt
        : DEFAULT_SYSTEM_PROMPT;

    // Inject Analysis Context if available
    if (context) {
      const contextString = `
SITUATION CONTEXT:
The user is currently analyzing a location: ${context.location?.placeName || 'Unknown'} (${context.location?.country || 'Unknown'}).
Suitability Scores:
- Agriculture: ${context.scores?.[0]?.score || 'N/A'}/100
- Housing: ${context.scores?.[1]?.score || 'N/A'}/100
- Industry: ${context.scores?.[2]?.score || 'N/A'}/100
- Renewables: ${context.scores?.[3]?.score || 'N/A'}/100

Key Factors:
${(context.overallFactors || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

Environmental Data:
- Temp: ${context.env?.weather?.temperature}°C
- Precipitation: ${context.env?.weather?.precipitation} mm/day
- Population Density: ${context.env?.geo?.populationDensity} people/km²
- Urban Proximity: ${context.env?.geo?.urbanProximity}/100
      `.trim();

      systemPrompt += `\n\nCURRENT ANALYSIS CONTEXT:\n${contextString}\n\nUse this specific data to answer questions about "this location", "the current spot", or "these scores". If the user asks about a different location, ignore this context.`;
    }

    console.log(`[Chat] role=${role ?? 'none'} msgs=${messages.length} model=${MODEL_ID}`);

    // streamText accepts plain {role, content} messages directly
    const result = streamText({
      model : google(MODEL_ID),
      system: systemPrompt,
      messages: messages.map(m => ({
        role   : m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      temperature    : 0.7,
      maxOutputTokens: 1024,
    });

    // toTextStreamResponse() returns raw streamed text — no protocol wrapping.
    // ChatBot.tsx reads chunks directly and accumulates them into the message.
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('[Chat API] Error:', error);

    if (error?.status === 429 || error?.message?.includes('429')) {
      return new Response(
        JSON.stringify({ error: 'AI is currently busy. Please wait a few seconds.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Chat failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}