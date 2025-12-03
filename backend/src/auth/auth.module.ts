// File: src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
// PrismaModule เป็น Global อยู่แล้ว ไม่ต้อง import ซ้ำก็ได้ แต่ import เพื่อความชัดเจนได้
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey', // Key สำหรับเข้ารหัส Token
      signOptions: { expiresIn: '1d' }, // Token หมดอายุใน 1 วัน
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}