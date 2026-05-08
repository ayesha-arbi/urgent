<<<<<<< HEAD
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic'; // or openai — swap as needed
import { ROLE_CONFIG } from '@/lib/role-context';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, role } = await req.json();

  const config = role && ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];

  const systemPrompt = config
    ? config.systemPrompt
    : `You are ZameendarAI, a land intelligence assistant for Pakistan and South Asia. 
Help users understand land suitability, soil quality, energy potential, and urban planning insights.`;

  const result = await streamText({
    model: anthropic('claude-3-5-haiku-20241022'), // fast & cheap for chat
    system: systemPrompt,
    messages,
    maxTokens: 600,
  });

  return result.toDataStreamResponse();
}
=======
>>>>>>> 5a64f18529755056cdca269a9ccd855181254a2e
