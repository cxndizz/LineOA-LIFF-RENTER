// File: src/payments/dto/create-payment.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  rentalOrderId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  bankName: string; // ธนาคารที่โอนเข้า (เช่น KBANK, SCB)

  @IsString()
  @IsNotEmpty()
  transferDate: string; // วันเวลาที่โอน (ISO String)
}