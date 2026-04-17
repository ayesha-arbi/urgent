// ============================================================
// backend/src/config/app.config.ts
// Central config — reads from .env / environment variables
// ============================================================

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // ── AI Provider ──────────────────────────────────────────
  // [CONFIGURE] Set AI_PROVIDER to 'anthropic' | 'openai' | 'google' | 'mock'
  // [CONFIGURE] Set the corresponding API key in .env
  aiProvider: process.env.AI_PROVIDER || 'mock',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',

  // ── External APIs (all free, no key required) ────────────
  openMeteoBaseUrl: 'https://api.open-meteo.com/v1',
  openMeteoAqUrl: 'https://air-quality-api.open-meteo.com/v1',
  openElevationUrl: 'https://api.open-elevation.com/api/v1',
  nominatimUrl: 'https://nominatim.openstreetmap.org',

  // ── Sessions ─────────────────────────────────────────────
  maxSessionsInMemory: 50,

  // ── Timeouts ─────────────────────────────────────────────
  httpTimeoutMs: 8000,
}));
