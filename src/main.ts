import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/interceptors/exception.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());

  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '1mb' });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [/^https:\/\/(www\.)?your-domain\.com$/],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id', 'X-Api-Key'],
  });

  setupSwagger(app);
  const port = process.env.PORT;
  const mainUrl = `http://localhost:${port}`;

  await app.listen(port);

  console.table({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    SWAGGER: process.env.ACTIVE_SWAGGER,
    URL: mainUrl,
    SWAGGER_URL: `${mainUrl}/docs`,
  });
  console.log(new Date().toString());
}

bootstrap();

function setupSwagger(app) {
  if (['1', 'true'].includes(process.env.ACTIVE_SWAGGER)) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description for the project')
      .setVersion('1.0')
      .addTag('template-nestjs-api')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
    SwaggerModule.setup('docs', app, document, customOptions);
  }
}
