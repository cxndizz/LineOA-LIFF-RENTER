// File: src/app.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { ProductsModule } from './products/products.module';
import { RentalsModule } from './rentals/rentals.module';
import { PaymentsModule } from './payments/payments.module';
// (เดี๋ยว ProductsModule จะถูกเพิ่มเข้ามาอัตโนมัติในขั้นตอนถัดไป)

@Module({
  imports: [
    // เปิดให้เข้าถึงไฟล์ใน folder 'uploads' ผ่าน URL /uploads/...
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    BranchesModule,
    ProductsModule,
    RentalsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}