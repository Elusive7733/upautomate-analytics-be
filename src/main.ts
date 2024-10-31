import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true
  });
  
  // Configure CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
