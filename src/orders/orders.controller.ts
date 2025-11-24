import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CsatDto } from './dto/csat.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // req.user should be populated by SupabaseStrategy
    // Assuming req.user.sub is the user ID (sme_id)
    return this.ordersService.create(req.user.sub, createOrderDto);
  }

  @Get('orders')
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.sub);
  }

  @Patch('orders/:id/status')
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Get('public/orders/:token')
  findOneByToken(@Param('token') token: string) {
    return this.ordersService.findOneByToken(token);
  }

  @Post('public/orders/:token/csat')
  submitCsat(@Param('token') token: string, @Body() csatDto: CsatDto) {
    return this.ordersService.submitCsat(token, csatDto);
  }
}
