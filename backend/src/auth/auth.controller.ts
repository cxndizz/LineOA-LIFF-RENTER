// File: src/auth/auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    // รับ email, password จาก body แล้วส่งให้ service
    return this.authService.login(body);
  }

  // ========== User Management Endpoints (Protected) ==========

  // 🔒 Get all users
  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  // 🔒 Get user by ID
  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.authService.getUserById(+id);
  }

  // 🔒 Create new user
  @UseGuards(JwtAuthGuard)
  @Post('users')
  createUser(@Body() body: any) {
    return this.authService.createUser(body);
  }

  // 🔒 Update user
  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateUser(+id, body);
  }

  // 🔒 Delete user
  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(+id);
  }
}