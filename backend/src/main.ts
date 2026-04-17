import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép gọi API từ frontend (CORS)
  app.enableCors();

  // Lấy PORT từ môi trường (Render sẽ set), fallback = 3000 khi chạy local
  const port = process.env.PORT || 3000;

  // Listen trên 0.0.0.0 để Render detect được port
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
