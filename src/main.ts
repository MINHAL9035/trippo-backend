import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/logger.config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        if (req.url.startsWith('/payment/webhook')) {
          req.rawBody = buf;
        }
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
