import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        branch: true,
      },
    });

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        branch: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    // If email is being updated, check if it's already taken
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        branch: true,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    // Check if user exists
    await this.findOne(id);

    // Hash new password
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async toggleStatus(id: number) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      include: {
        branch: true,
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: number) {
    // Check if user exists
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
