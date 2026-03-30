import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function server() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('[FATAL] JWT_SECRET is not set');
      process.exit(1);
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableCors();

    const PORT = process.env.PORT ?? 3000;
    await app.listen(PORT, '0.0.0.0'); // 0.0.0.0 binds to both IPv4 and IPv6

    const url = await app.getUrl();
    console.log('Server running at:', url);
  } catch (error) {
    console.log('[ERROR]-', error);
  }
}

server();
