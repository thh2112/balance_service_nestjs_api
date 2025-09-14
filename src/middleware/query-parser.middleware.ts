import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as qs from 'qs';

@Injectable()
export class QueryParserMiddleware implements NestMiddleware {
  protected logger = new Logger(QueryParserMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.substring(queryIndex + 1) : '';

    if (queryString) {
      try {
        const parsedQuery = qs.parse(queryString, {
          depth: 15,
          arrayLimit: 200,
          parseArrays: true,
          allowDots: true,
          strictNullHandling: false,
          allowEmptyArrays: true,
        });

        req.query = parsedQuery as any;

        this.logger.log('Query parsed by middleware:', JSON.stringify(parsedQuery, null, 2));
      } catch (error) {
        this.logger.error('Error parsing query string:', error);
        req.query = {};
      }
    }

    next();
  }
}
