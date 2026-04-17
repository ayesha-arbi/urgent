// ============================================================
// backend/src/modules/weather/weather.module.ts
// ============================================================

import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';

@Module({
  providers: [WeatherService],
  controllers: [WeatherController],
  exports: [WeatherService],
})
export class WeatherModule {}
