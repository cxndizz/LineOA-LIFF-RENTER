// File: src/rentals/dto/create-rental.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateRentalDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsDateString() // รับค่าเป็น ISO String (YYYY-MM-DD)
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  // --- ข้อมูลลูกค้า (จาก LIFF + ฟอร์ม) ---
  @IsString()
  @IsNotEmpty()
  lineUserId: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  pictureUrl?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address?: string; // ที่อยู่ผู้เช่า (ถ้ามี)
}