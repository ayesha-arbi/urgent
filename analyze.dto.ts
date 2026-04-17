// ============================================================
// backend/src/common/dto/analyze.dto.ts
// Validated request body for POST /api/analyze
// ============================================================

import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnalyzeDto {
  @ApiProperty({ example: 31.5497, description: 'Latitude (-90 to 90)' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: 74.3436, description: 'Longitude (-180 to 180)' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng: number;

  @ApiPropertyOptional({ example: 'Lahore', description: 'Optional location name hint' })
  @IsOptional()
  @IsString()
  locationName?: string;
}
