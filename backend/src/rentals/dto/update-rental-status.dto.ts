// File: src/rentals/dto/update-rental-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum RentalStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  APPROVED = 'APPROVED',
  WAITING_DELIVERY = 'WAITING_DELIVERY',
  IN_USE = 'IN_USE',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export class UpdateRentalStatusDto {
  @IsEnum(RentalStatus)
  status: RentalStatus;

  @IsString()
  @IsOptional()
  note?: string; // เหตุผล (เช่น สลิปไม่ชัด)
}