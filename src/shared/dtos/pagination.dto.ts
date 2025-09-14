import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, MaxLength, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 0,
    description: 'Page number (zero-based)',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  page: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pageSize: number;

  @ApiPropertyOptional({
    example: '-createdAt',
    description: 'Sort order (prefix with - for descending)',
  })
  @MaxLength(60)
  @IsOptional()
  sort?: string;
}
