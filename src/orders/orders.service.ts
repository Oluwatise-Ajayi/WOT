import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto, OrderStatus } from './dto/update-status.dto';
import { CsatDto } from './dto/csat.dto';
import { WabaService } from '../waba/waba.service';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private wabaService: WabaService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_KEY') ?? '',
    );
  }

  async create(smeId: string, createOrderDto: CreateOrderDto) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        sme_id: smeId,
        ...createOrderDto,
        status: OrderStatus.NEW,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async findAll(smeId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('sme_id', smeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    const { status, rider_phone } = updateStatusDto;
    const updates: any = { status, updated_at: new Date() };

    // State Machine Logic
    if (status === OrderStatus.READY) {
      if (!rider_phone) {
        throw new BadRequestException('Rider phone is required for READY status');
      }
      updates.rider_phone = rider_phone;
      updates.rider_token = crypto.randomBytes(8).toString('hex');
    } else if (status === OrderStatus.DISPATCHED) {
      updates.customer_token = crypto.randomBytes(8).toString('hex');
    }

    // Update DB
    const { data, error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Side Effects
    if (status === OrderStatus.READY) {
      await this.wabaService.sendRiderAssignment(
        data.rider_phone,
        'Restaurant Address', // TODO: Fetch actual address if needed or hardcode for MVP
        `Order #${data.readable_id} for ${data.customer_name}`
      );
    } else if (status === OrderStatus.DISPATCHED) {
      await this.wabaService.sendCustomerDispatch(
        data.customer_phone,
        data.readable_id,
        `https://app.wot.ng/track/${data.customer_token}`
      );
    } else if (status === OrderStatus.COMPLETED) {
      await this.wabaService.sendDeliveryComplete(
        data.customer_phone,
        `https://app.wot.ng/csat/${data.customer_token}` // Assuming token is used for CSAT too or just link to CSAT page
      );
    }

    return data;
  }

  async findOneByToken(token: string) {
    // Try rider token
    let { data, error } = await this.supabase
      .from('orders')
      .select('readable_id, customer_name, customer_phone, delivery_address, price_total, status, created_at, rider_phone') // Select specific fields to sanitize
      .eq('rider_token', token)
      .single();

    if (!data) {
      // Try customer token
      const result = await this.supabase
        .from('orders')
        .select('readable_id, delivery_address, status, rider_phone') // Less info for customer
        .eq('customer_token', token)
        .single();
      
      // Explicitly cast or handle the different shape
      data = result.data as any;
      error = result.error;
    }

    if (error || !data) {
      throw new NotFoundException('Order not found');
    }

    return data;
  }

  async submitCsat(token: string, csatDto: CsatDto) {
    // Find order by customer_token (CSAT is usually for customer)
    // The prompt says /public/orders/:token/csat, usually implies customer token.
    
    const { data: order } = await this.supabase
        .from('orders')
        .select('id')
        .eq('customer_token', token)
        .single();

    if (!order) {
         throw new NotFoundException('Order not found');
    }

    const { data, error } = await this.supabase
      .from('orders')
      .update({
        csat_score: csatDto.csat_score,
        csat_comment: csatDto.csat_comment,
      })
      .eq('id', order.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }
}
