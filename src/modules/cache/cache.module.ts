import { Global, Module } from '@nestjs/common';
import { CacheController } from './cache.controller';
import { RedisCacheService } from './cache.service';

@Global()
@Module({
  imports: [],
  controllers: [CacheController],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class CacheModule {}
