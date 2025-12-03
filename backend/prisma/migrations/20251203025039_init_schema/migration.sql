-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING_PAYMENT', 'WAITING_CONFIRMATION', 'APPROVED', 'WAITING_DELIVERY', 'IN_USE', 'RETURNED', 'CANCELLED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BRANCH_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "displayName" TEXT,
    "pictureUrl" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrder" (
    "id" SERIAL NOT NULL,
    "rentalRef" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "pickupLocationType" TEXT,
    "customPickupAddress" TEXT,
    "customLat" DOUBLE PRECISION,
    "customLng" DOUBLE PRECISION,
    "customerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "slipUrl" TEXT,
    "transferDate" TIMESTAMP(3),
    "bankName" TEXT,
    "rentalOrderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalStatusHistory" (
    "id" SERIAL NOT NULL,
    "status" "RentalStatus" NOT NULL,
    "note" TEXT,
    "changedBy" TEXT,
    "rentalOrderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_lineUserId_key" ON "Customer"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalOrder_rentalRef_key" ON "RentalOrder"("rentalRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_rentalOrderId_key" ON "Payment"("rentalOrderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalStatusHistory" ADD CONSTRAINT "RentalStatusHistory_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
