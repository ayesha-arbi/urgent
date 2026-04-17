// ============================================================
// backend/src/app.module.ts
// Root NestJS module — wires all feature modules together
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { WeatherModule } from './modules/weather/weather.module';
import { GeoModule } from './modules/geo/geo.module';
import { AiModule } from './modules/ai/ai.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { HealthModule } from './modules/health/health.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // ── Rate limiting ──────────────────────────────────────
    // 60 requests per minute per IP across all endpoints
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 60 },
      { name: 'analyze', ttl: 60000, limit: 10 }, // stricter for AI route
    ]),

    // ── Feature modules ────────────────────────────────────
    WeatherModule,
    GeoModule,
    AiModule,
    SessionsModule,
    AnalysisModule,
    HealthModule,
  ],
  providers: [
    // Apply throttle guard globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
