// File: src/payments/payments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, slipFile: Express.Multer.File) {
    const { rentalOrderId, amount, bankName, transferDate } = createPaymentDto;

    // 1. หา Order ที่จะจ่าย
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: rentalOrderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Order status is not pending payment');
    }

    // 2. บันทึก Payment + รูปสลิป
    const payment = await this.prisma.payment.create({
      data: {
        rentalOrderId,
        amount,
        bankName,
        transferDate: new Date(transferDate),
        slipUrl: `/uploads/${slipFile.filename}`, // เก็บ Path รูป
      },
    });

    // 3. อัปเดตสถานะ Order -> WAITING_CONFIRMATION
    await this.prisma.rentalOrder.update({
      where: { id: rentalOrderId },
      data: {
        status: 'WAITING_CONFIRMATION',
        // บันทึก Log การเปลี่ยนสถานะ
        statusHistory: {
          create: {
            status: 'WAITING_CONFIRMATION',
            note: 'Customer uploaded payment slip',
            changedBy: 'Customer',
          },
        },
      },
    });

    return payment;
  }
}