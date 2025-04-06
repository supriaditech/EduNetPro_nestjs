import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('uploads', { prefix: '/uploads' });
  app.enableCors({
    origin: '*', // Mengizinkan semua origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'tokken_lpppu_usu', 'Authorization'],
    exposedHeaders: ['tokken_lpppu_usu'],
    credentials: true,
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Aktifkan transformasi otomatis
    }),
  );
  app.enable('trust proxy');

  app.use('/uploads', express.static('uploads'));
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());

  await app.listen(3002);
}
bootstrap();
