// File: backend/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv'; // ✅ Import dotenv

// ✅ โหลด Environment Variables เอง
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Hash Password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('admin1234', salt);

  // 2. สร้าง Admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@rental.com' },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@rental.com',
        password: hashedPassword,
        fullName: 'Super Admin',
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });
    console.log(`✅ Created Super Admin: ${admin.email}`);
  } else {
    console.log('ℹ️ Super Admin already exists.');
  }

  // 3. สร้างสาขา HQ
  const existingBranch = await prisma.branch.findFirst();
  if (!existingBranch) {
    await prisma.branch.create({
      data: {
        name: 'Headquarters (HQ)',
        address: 'Bangkok, Thailand',
        phone: '02-123-4567',
        isActive: true,
      },
    });
    console.log('✅ Created Default Branch: HQ');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });