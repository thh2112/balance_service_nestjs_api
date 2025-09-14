import { Controller, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';

import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RedisCacheService } from './cache.service';

enum CacheKey {
  all = 'all',
}

class ClearCacheDto {
  @ApiPropertyOptional({ enum: CacheKey })
  @IsString()
  key: CacheKey;
}

@ApiTags('cache')
@Controller({
  path: 'cache',
  version: '1',
})
export class CacheController {
  constructor(protected cacheService: RedisCacheService) {}

  @Delete('/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cache by topic',
  })
  async clearCache(@Query() query: ClearCacheDto) {
    return await this.cacheService.clearCacheByTopic(query.key);
  }
}
