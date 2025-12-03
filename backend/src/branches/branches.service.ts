// File: src/branches/branches.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  create(createBranchDto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: createBranchDto,
    });
  }

  findAll() {
    return this.prisma.branch.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, users: true } }, // นับจำนวนสินค้าและ user ในสาขานี้แถมไปด้วย
      },
    });
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  remove(id: number) {
    // ในทางปฏิบัติ เราอาจแค่ปิด isActive = false แทนการลบจริง
    // แต่ถ้าจะลบจริง ต้องระวังเรื่อง Foreign Key (Prisma จะฟ้องถ้ามีสินค้าผูกอยู่)
    return this.prisma.branch.delete({
      where: { id },
    });
  }
}