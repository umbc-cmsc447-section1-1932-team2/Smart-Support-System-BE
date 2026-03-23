import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function server() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableCors();

    const PORT = process.env.PORT ?? 3000;
    await app.listen(PORT);

    const url = await app.getUrl();
    console.log('Server running at:', url);
  } catch (error) {
    console.log('[ERROR]-', error);
  }
}

server();
