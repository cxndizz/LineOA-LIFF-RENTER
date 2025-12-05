// File: src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, imageFiles: Array<Express.Multer.File>) {
    const { branchId, ...productData } = createProductDto;

    // เตรียมข้อมูลรูปภาพสำหรับ Prisma (CreateMany nested)
    const imagesData = imageFiles.map((file, index) => ({
      url: `/uploads/${file.filename}`, // เก็บ path ที่จะเรียกผ่าน URL
      isMain: index === 0, // ให้รูปแรกเป็นรูปหลัก
    }));

    // สร้าง Product พร้อม Images ใน Transaction เดียว
    return this.prisma.product.create({
      data: {
        ...productData,
        branch: { connect: { id: branchId } }, // ผูกกับ Branch
        images: {
          create: imagesData,
        },
      },
      include: { images: true, branch: true },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { images: true, branch: true }, // ดึงรูปและสาขามาด้วย
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, branch: true },
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    // Note: การอัปเดตแยกส่วนรูปภาพจะซับซ้อนกว่า (ต้องเลือกว่าจะลบรูปเก่าไหม)
    // เบื้องต้นให้แก้ไขข้อมูล Text ก่อน
    const { branchId, ...data } = updateProductDto;
    
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(branchId && { branch: { connect: { id: branchId } } }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  /**
   * Get product availability (booked date ranges)
   * Returns array of { startDate, endDate } for dates that are NOT available
   */
  async getAvailability(productId: number) {
    // First check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    // Get all active rental orders for this product
    // Exclude CANCELLED and REJECTED orders
    const bookedRentals = await this.prisma.rentalOrder.findMany({
      where: {
        productId,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
      select: {
        id: true,
        rentalRef: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return {
      productId,
      productName: product.name,
      status: product.status,
      bookedDates: bookedRentals.map(rental => ({
        rentalId: rental.id,
        rentalRef: rental.rentalRef,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
      })),
      totalBookings: bookedRentals.length,
    };
  }
}