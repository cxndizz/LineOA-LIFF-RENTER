// File: src/rentals/rentals.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';
import dayjs from 'dayjs';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(createRentalDto: CreateRentalDto) {
    const {
      productId,
      startDate,
      endDate,
      lineUserId,
      displayName,
      pictureUrl,
      firstName,
      lastName,
      phoneNumber,
    } = createRentalDto;

    // 1. ตรวจสอบสินค้า
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'AVAILABLE') throw new BadRequestException('Product is not available');

    // 2. คำนวณจำนวนวันและราคา
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffDays = end.diff(start, 'day') + 1; // นับวันแรกด้วย เลย +1

    if (diffDays < 1) throw new BadRequestException('Invalid date range');

    const totalPrice = Number(product.pricePerDay) * diffDays;

    // 3. จัดการข้อมูลลูกค้า (Upsert: ถ้ามีให้อัปเดต ถ้าไม่มีให้สร้างใหม่)
    const customer = await this.prisma.customer.upsert({
      where: { lineUserId },
      update: {
        displayName,
        pictureUrl,
        firstName,
        lastName,
        phoneNumber,
      },
      create: {
        lineUserId,
        displayName,
        pictureUrl,
        firstName,
        lastName,
        phoneNumber,
      },
    });

    // 4. สร้าง Order Ref (รหัสจอง)
    const rentalRef = `ORD-${dayjs().format('YYYYMMDD')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. บันทึก Order ลง DB
    return this.prisma.rentalOrder.create({
      data: {
        rentalRef,
        startDate: start.toDate(),
        endDate: end.toDate(),
        totalPrice,
        depositAmount: product.deposit,
        status: 'PENDING_PAYMENT',
        customer: { connect: { id: customer.id } },
        product: { connect: { id: product.id } },
        branch: { connect: { id: product.branchId } },
      },
    });
  }

  // ดึงรายการจองทั้งหมด (สำหรับ Admin)
  findAll() {
    return this.prisma.rentalOrder.findMany({
      include: {
        customer: true,
        product: { include: { images: true } },
        branch: true,
        payment: true, // ✅ เพิ่มบรรทัดนี้
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ดึงรายการจองตาม ID
  findOne(id: number) {
    return this.prisma.rentalOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        product: { include: { images: true } },
        branch: true,
      },
    });
  }

  async updateStatus(id: number, updateDto: UpdateRentalStatusDto, adminId: number) {
    const { status, note } = updateDto;

    // อัปเดตสถานะ + บันทึก Log
    return this.prisma.rentalOrder.update({
      where: { id },
      data: {
        status: status as any, // Cast type ให้ตรงกับ Enum ใน Prisma
        statusHistory: {
          create: {
            status: status as any,
            note,
            changedBy: `Admin ID: ${adminId}`,
          },
        },
      },
      include: { customer: true }, // ดึงข้อมูลลูกค้ามาด้วย (เตรียมไว้ส่ง LINE Noti ใน Phase หน้า)
    });
  }
}