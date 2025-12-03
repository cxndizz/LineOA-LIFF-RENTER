// File: src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(body: any) {
    const { email, password } = body;

    // 1. ค้นหา User จาก Email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. ถ้าไม่เจอ User
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. ตรวจสอบสถานะ Active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // 4. เปรียบเทียบรหัสผ่าน (Hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 5. สร้าง JWT Token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
      },
    };
  }
}