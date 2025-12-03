// File: backend/prisma.config.ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  // กำหนดคำสั่ง Seed โดยใช้ tsx แทน ts-node
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
});