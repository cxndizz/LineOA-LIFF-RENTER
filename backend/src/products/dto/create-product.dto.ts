// File: src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number) // ✅ ต้องมีบรรทัดนี้
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @Type(() => Number) // ✅ ต้องมีบรรทัดนี้
  @IsNumber()
  @Min(0)
  deposit: number;

  @Type(() => Number) // ✅ ต้องมีบรรทัดนี้
  @IsNumber()
  branchId: number;
}