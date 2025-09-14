import { Injectable, OnModuleInit } from '@nestjs/common';
import IORedis, * as IoRedis from 'ioredis';
import { useAdapter } from './adapter';

/*
This enum just makes it easy to set cache ttls. Type cacheable uses
seconds.
*/
export enum CacheTtlSeconds {
  TEN_SECONDS = 10,
  ONE_MINUTE = 60,
  FIVE_MINUTES = 5 * 60,
  ONE_HOUR = 60 * 60,
  ONE_DAY = 60 * 60 * 24,
  ONE_WEEK = 7 * 24 * 60 * 60,
}
/*
  This is just a generic exception we can throw and easily detect later in our app,
   in logs or other systems.
  */
export class NotCacheableException extends Error {
  public constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class RedisCacheConfigurationMapper {
  public static map(): IoRedis.RedisOptions {
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      connectTimeout: 10000,
      enableOfflineQueue: true,
      keyPrefix: process.env.REDIS_PREFIX,
      tls: process.env.REDIS_USETLS === 'true' ? {} : undefined,
    };
  }
}

/*
  This is where we setup the typecacheable store. We use Nest's OnModuleInit
  interface to have the setup run immediately.
  This allows us to stop application start if there is a problem
  configuring our redis instance.
  */
@Injectable()
export class RedisCacheService implements OnModuleInit {
  private redisInstance: IoRedis.Redis | undefined;

  public async onModuleInit(): Promise<void> {
    try {
      if (this.isAlreadyConfigured()) {
        return;
      }

      this.redisInstance = new IORedis(RedisCacheConfigurationMapper.map());
      // we set up error events. Note that we don't want to
      // stop the application on connection errors. We don't want the lack
      // of a working cache to break our application. You need to think
      // about if this is the correct approach for your application.
      this.redisInstance.on('error', (e: Error) => {
        this.handleError(e);
      });
      // This is where we configure type cachable to use this redis instance
      useAdapter(this.redisInstance);
      // and finally we open the connection
    } catch (e) {
      console.log(e);
      this.handleError(e as Error);
    }
  }

  private handleError(e: Error): void {
    console.error('Could not connect to Redis cache instance', e);
  }

  private isAlreadyConfigured(): boolean {
    return this.redisInstance !== undefined;
  }

  public clearCacheByPattern(pattern) {
    // Create a readable stream (object mode)
    return new Promise((resolve) => {
      const stream = this.redisInstance.scanStream({
        match: pattern,
      });
      stream.on('data', (keys) => {
        // `keys` is an array of strings representing key names
        if (keys.length) {
          const pipeline = this.redisInstance.pipeline();
          keys.forEach(function (key) {
            pipeline.del(key);
          });
          pipeline.exec();
        }
      });
      stream.on('end', function () {
        resolve(null);
      });
    });
  }

  public async clearCacheByTopic(key: string) {
    if (key === 'all') {
      try {
        this.redisInstance.flushdb();
      } catch (e) {
        this.clearCacheByPattern('*');
      }
      return true;
    }

    return this.redisInstance.del(key);
  }

  public async clearCacheByKey(key: string) {
    return this.redisInstance.del(key);
  }

  public async getValue(key: string) {
    return this.redisInstance.get(key);
  }

  public async setValue(key: string, value: any, time = -1) {
    if (time > 0) {
      return this.redisInstance.set(key, value, 'EX', time);
    }
    return this.redisInstance.set(key, value);
  }

  public async lock(key: string, value: string, ttl: number = 300) {
    return this.redisInstance.set(key, value, 'EX', ttl, 'NX');
  }

  public async unlock(key: string) {
    return this.redisInstance.del(key);
  }
}
