// File: src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
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

  // ========== User Management Methods ==========

  /**
   * Get all users with their branch info
   */
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        branch: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        branch: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
    });
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        branch: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    branchId?: number;
    isActive?: boolean;
  }) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role as any,
        branchId: data.branchId,
        isActive: data.isActive ?? true,
      },
      include: {
        branch: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        branch: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(
    id: number,
    data: {
      email?: string;
      password?: string;
      fullName?: string;
      role?: string;
      branchId?: number;
      isActive?: boolean;
    },
  ) {
    // Check if user exists
    await this.getUserById(id);

    // If email is being updated, check if it's already taken
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        branch: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        branch: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id: number) {
    // Check if user exists
    await this.getUserById(id);

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}