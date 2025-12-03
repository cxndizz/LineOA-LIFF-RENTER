// File: src/line-api/line-api.module.ts
import { Global, Module } from '@nestjs/common';
import { LineApiService } from './line-api.service';

@Global() // ✅ ทำให้เรียกใช้ได้ทั้งโปรเจกต์
@Module({
  providers: [LineApiService],
  exports: [LineApiService],
})
export class LineApiModule {}