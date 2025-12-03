// File: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ เพิ่มบรรทัดนี้: เปิดให้ ValidationPipe แปลงค่าอัตโนมัติ (เช่น "1" -> 1)
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true, // ตัด field ส่วนเกินที่ไม่ได้อยู่ใน DTO ทิ้ง (เพื่อความปลอดภัย)
  }));

  // เปิด CORS ให้ Frontend (LIFF/Admin) เรียก API ได้
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();