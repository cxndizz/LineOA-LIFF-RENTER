// File: src/rentals/rentals.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  // 🔓 เปิด Public ให้ LIFF ยิงมาจองได้ (ในอนาคตอาจต้อง Secure ด้วย LIFF ID Token)
  @Post()
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto);
  }

  // 🔒 Admin เท่านั้นที่ดูรายการจองทั้งหมดได้
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(+id);
  }
}