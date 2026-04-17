// ============================================================
// backend/src/modules/weather/weather.controller.ts
// GET /api/weather  GET /api/airquality
// ============================================================

import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller()
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('weather')
  @ApiOperation({ summary: 'Get weather data for a coordinate' })
  @ApiQuery({ name: 'lat', type: Number, example: 31.5497 })
  @ApiQuery({ name: 'lng', type: Number, example: 74.3436 })
  async getWeather(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return this.weatherService.fetchWeather(lat, lng);
  }

  @Get('airquality')
  @ApiOperation({ summary: 'Get air quality data for a coordinate' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  async getAirQuality(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return this.weatherService.fetchAirQuality(lat, lng);
  }
}
