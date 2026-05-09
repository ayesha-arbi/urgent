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

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or empty messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt =
      role && ROLE_CONFIG[role]
        ? ROLE_CONFIG[role].systemPrompt
        : DEFAULT_SYSTEM_PROMPT;

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