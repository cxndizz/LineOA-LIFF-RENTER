// File: src/rentals/rentals.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';
import { LineApiService } from '../line-api/line-api.service'; // ✅ Import
import dayjs from 'dayjs';

@Injectable()
export class RentalsService {
  constructor(
    private prisma: PrismaService,
    private lineApiService: LineApiService
  ) {}

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
        payment: true, // ✅ เพิ่ม payment
        statusHistory: { orderBy: { createdAt: 'desc' } }, // ✅ เพิ่ม status history
      },
    });
  }

  /**
   * Get customer rental history by LINE User ID
   */
  async getCustomerHistory(lineUserId: string) {
    // Find customer by LINE User ID
    const customer = await this.prisma.customer.findUnique({
      where: { lineUserId },
    });

    if (!customer) {
      return {
        customer: null,
        rentals: [],
        totalRentals: 0,
        totalSpent: 0,
      };
    }

    // Get all rentals for this customer
    const rentals = await this.prisma.rentalOrder.findMany({
      where: { customerId: customer.id },
      include: {
        product: {
          select: {
            name: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
        payment: {
          select: {
            amount: true,
            slipUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total spent (only completed rentals)
    const totalSpent = await this.prisma.rentalOrder.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        customerId: customer.id,
        status: 'RETURNED',
      },
    });

    return {
      customer: {
        id: customer.id,
        lineUserId: customer.lineUserId,
        displayName: customer.displayName,
        firstName: customer.firstName,
        lastName: customer.lastName,
        pictureUrl: customer.pictureUrl,
      },
      rentals: rentals.map((rental) => ({
        id: rental.id,
        rentalRef: rental.rentalRef,
        productName: rental.product.name,
        productImage: rental.product.images[0]?.url || null,
        branchName: rental.branch.name,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalPrice: Number(rental.totalPrice),
        depositAmount: Number(rental.depositAmount),
        status: rental.status,
        createdAt: rental.createdAt,
        hasPayment: !!rental.payment,
      })),
      totalRentals: rentals.length,
      totalSpent: Number(totalSpent._sum.totalPrice || 0),
    };
  }

  async updateStatus(id: number, updateDto: UpdateRentalStatusDto, adminId: number) {
    const { status, note } = updateDto;

    // 1. อัปเดตสถานะ (โค้ดเดิม)
    const order = await this.prisma.rentalOrder.update({
      where: { id },
      data: {
        status: status as any,
        statusHistory: {
          create: {
            status: status as any,
            note,
            changedBy: `Admin ID: ${adminId}`,
          },
        },
      },
      include: { customer: true, product: true }, // ✅ ดึงข้อมูลสินค้าและลูกค้ามาด้วย
    });

    // 2. ส่ง LINE Notification ตามสถานะ
    let message = '';
    const productName = order.product.name;
    const ref = order.rentalRef;

    switch (status) {
      case 'APPROVED':
        message = `✅ ออร์เดอร์ ${ref} ได้รับการอนุมัติแล้ว!\nสินค้า: ${productName}\nกรุณารอรับของตามวันนัดหมายครับ`;
        break;
      case 'REJECTED':
        message = `❌ ออร์เดอร์ ${ref} ไม่ผ่านการอนุมัติ\nเหตุผล: ${note || 'เอกสารไม่ถูกต้อง'}\nกรุณาติดต่อแอดมิน`;
        break;
      case 'WAITING_DELIVERY':
        message = `🚚 สินค้า ${productName} กำลังเตรียมจัดส่ง/พร้อมรับแล้วครับ`;
        break;
      case 'RETURNED':
        message = `🙏 ขอบคุณที่ใช้บริการครับ หวังว่าจะได้ให้บริการอีกครั้งนะครับ`;
        break;
    }

    if (message && order.customer?.lineUserId) {
      await this.lineApiService.pushMessage(order.customer.lineUserId, message);
    }

    return order;
  }
}