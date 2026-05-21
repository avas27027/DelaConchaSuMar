import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean);

  app.enableCors({
    origin: corsOrigin?.length ? corsOrigin : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://0.0.0.0:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // si usas cookies o auth
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
