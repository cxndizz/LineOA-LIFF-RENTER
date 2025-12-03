// File: src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ทำให้เรียกใช้ได้ทั้งโปรเจกต์โดยไม่ต้อง import ซ้ำ
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}