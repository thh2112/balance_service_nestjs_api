import { Observable, map } from 'rxjs';

import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { HttpResponse, MessageKey } from '../interfaces';
import { ResponseMessageKey } from '../decorators/response.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}

  public intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = ctx.switchToHttp().getRequest();
    const lang = request.headers['accept-language'] || 'en';
    const i18n = I18nContext.current();

    return next.handle().pipe(
      map(async (response: HttpResponse) => {
        if (response?.httpCode) {
          if (response.message) {
            const responseKey: MessageKey = await i18n.translate(response.message, {
              lang,
            });
            response.message = responseKey.message;
            response.code = responseKey.code;
          }
          return response;
        }

        if (response?.success === false) {
          const responseKey: MessageKey = await i18n.translate(response.message || 'common.server_error', {
            lang,
          });

          return {
            success: false,
            code: responseKey.code,
            httpCode: response.httpCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: responseKey.message,
          };
        }

        const payload = response?.data ?? null;
        const handler = ctx.getHandler();
        const messageCode: string = (Reflect.getMetadata(ResponseMessageKey, handler) as string)?.toLowerCase?.() ?? '';
        const responseKey: MessageKey = await i18n.translate(messageCode || 'common.successfully', {
          lang,
        });

        return {
          success: true,
          data: payload,
          message: responseKey.message,
          code: responseKey.code,
        };
      }),
    );
  }
}
