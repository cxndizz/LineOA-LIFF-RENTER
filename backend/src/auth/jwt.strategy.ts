// File: src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // รับ Token จาก Header: Authorization Bearer ...
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey', // ควรย้ายไป .env ภายหลัง
    });
  }

  // ฟังก์ชันนี้จะทำงานอัตโนมัติเมื่อ Token ถูกต้อง
  async validate(payload: any) {
    // payload.sub คือ userId ที่เราฝังไว้ตอน Login
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    // ถ้าหาไม่เจอ หรือ User ถูกปิดใช้งาน (isActive = false)
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // return user object เพื่อไปแปะไว้ใน req.user
    return { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      branchId: user.branchId 
    }; 
  }
}