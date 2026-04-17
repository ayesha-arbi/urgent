// ============================================================
// backend/src/main.ts
// NestJS application bootstrap
// ============================================================

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // ── CORS ──────────────────────────────────────────────────
  // [CONFIGURE] Update origin for your deployed frontend URL
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Next.js dev server
      'http://localhost:3001',
      process.env.FRONTEND_URL || 'https://zameendar.vercel.app',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validation ────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global exception filter ───────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global response interceptor ───────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Swagger / OpenAPI ─────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Zameendar.ai API')
    .setDescription('Land suitability analysis powered by real-time environmental data and AI')
    .setVersion('1.0')
    .addTag('analysis', 'Land suitability analysis endpoints')
    .addTag('weather', 'Environmental weather data')
    .addTag('geo', 'Geolocation and elevation data')
    .addTag('sessions', 'Analysis session history')
    .addTag('health', 'Service health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Zameendar.ai API Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Listen ────────────────────────────────────────────────
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🌍 Zameendar.ai backend running on http://localhost:${port}`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
