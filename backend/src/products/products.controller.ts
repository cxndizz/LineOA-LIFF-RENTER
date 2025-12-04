// File: src/products/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../utils/multer.config';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 🔒 สร้างสินค้า + อัปโหลดรูป (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig)) // รับไฟล์สูงสุด 5 รูป จาก field 'images'
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.productsService.create(createProductDto, files || []);
  }

  // 🔓 ดูสินค้าทั้งหมด
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // 🔓 ดูรายละเอียดสินค้า
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // 🔓 เช็คว่าสินค้าว่างในช่วงเวลาที่เลือก
  @Get(':id/availability')
  checkAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productsService.checkAvailability(+id, startDate, endDate);
  }

  // 🔒 แก้ไข (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  // 🔒 ลบ (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}