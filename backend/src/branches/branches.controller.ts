// File: src/branches/branches.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  // 🔒 สร้างสาขา (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  // 🔓 ดูรายชื่อสาขา (เปิด Public เผื่อให้ LIFF ดึงไปโชว์ตอนเลือกสาขา)
  // แต่ถ้าอยากปิดก็ใส่ @UseGuards ได้ครับ
  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  // 🔓 ดูรายละเอียดสาขา
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(+id);
  }

  // 🔒 แก้ไข (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchesService.update(+id, updateBranchDto);
  }

  // 🔒 ลบ (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(+id);
  }
}