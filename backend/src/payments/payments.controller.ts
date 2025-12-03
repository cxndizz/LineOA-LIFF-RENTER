// File: src/payments/payments.controller.ts
import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../utils/multer.config'; // ใช้ Config เดิมที่เคยทำไว้

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('slip', multerConfig)) // รับไฟล์ชื่อ 'slip'
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.paymentsService.create(createPaymentDto, file);
  }
}