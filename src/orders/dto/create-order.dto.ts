import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @IsNotEmpty()
  customer_phone: string;

  @ApiProperty({ example: '123 Main St, Lagos' })
  @IsString()
  @IsNotEmpty()
  delivery_address: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @IsNotEmpty()
  price_total: number;
}
