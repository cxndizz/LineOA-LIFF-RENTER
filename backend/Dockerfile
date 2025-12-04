# File: backend/Dockerfile
FROM node:20.19.0-alpine

WORKDIR /app

# คัดลอก package files
COPY package*.json ./
COPY prisma ./prisma/

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# สร้าง Prisma Client
RUN npx prisma generate

# Build โปรเจกต์
RUN npm run build

# เปิด Port 3000
EXPOSE 3000

# รันคำสั่งเริ่มเซิร์ฟเวอร์
CMD ["npm", "run", "start:prod"]