import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

import * as dayjs from 'dayjs';
import { HttpResponse, MessageKey } from '../interfaces';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode: status,
        message: 'common.server_error',
      };
    }

    const messageCode = errorResponse?.message || 'common.server_error';

    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? 'en';

    const responseKey: MessageKey = i18n.translate(messageCode, { lang });

    const httpResponse: HttpResponse = {
      success: false,
      data: null,
      code: responseKey.code || status,
      message: responseKey.message || 'Oops, server internal error. Please try again later.',
    };

    this.logger.error(`HTTP Exception: ${status} - ${httpResponse.message}`, {
      path: request.url,
      method: request.method,
      statusCode: status,
      timestamp: dayjs().toISOString(),
      error: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json(httpResponse);
  }
}
