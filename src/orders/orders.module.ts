import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { WabaModule } from '../waba/waba.module';

@Module({
  imports: [ConfigModule, WabaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
