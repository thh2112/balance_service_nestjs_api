import { Controller, Get } from '@nestjs/common';
import { HttpResponse } from './shared/interfaces';
import { ResponseInfo } from './shared/decorators/response.decorator';

@Controller({})
export class AppController {
  @Get('test')
  @ResponseInfo('common.successfully')
  public async test(): Promise<HttpResponse> {
    return {
      success: true,
    };
  }
}
