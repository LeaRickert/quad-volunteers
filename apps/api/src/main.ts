import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validate every request body against its DTO class:
  // whitelist strips unknown props, forbidNonWhitelisted rejects them with 400,
  // transform turns plain JSON into DTO instances (and route params into declared types).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Allow the Next.js dev server to call this API from the browser.
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' });
  // 3001 so it doesn't collide with Next.js on 3000.
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
