import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WabaService } from './waba.service';

@Module({
  imports: [ConfigModule],
  providers: [WabaService],
  exports: [WabaService],
})
export class WabaModule {}
