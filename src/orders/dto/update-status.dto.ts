import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  DISPATCHED = 'DISPATCHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({ example: '+2348098765432', required: false, description: 'Required when status is READY' })
  @IsString()
  @IsOptional()
  rider_phone?: string;
}
