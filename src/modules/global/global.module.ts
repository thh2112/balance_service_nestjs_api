import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@src/shared/services/prisma.service';
import { CacheModule } from '../cache/cache.module';

@Global()
@Module({
  imports: [CacheModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class GlobalModule {}
