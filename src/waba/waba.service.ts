import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WabaService {
  private readonly logger = new Logger(WabaService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendRiderAssignment(riderPhone: string, pickupAddress: string, details: string) {
    this.logger.log(`Sending Rider Assignment to ${riderPhone}: Pickup at ${pickupAddress}. Details: ${details}`);
    // TODO: Implement actual Meta API call
    // Template: rider_assignment
  }

  async sendCustomerDispatch(customerPhone: string, orderId: string, trackingLink: string) {
    this.logger.log(`Sending Customer Dispatch to ${customerPhone}: Order ${orderId} is on the way! Track here: ${trackingLink}`);
    // TODO: Implement actual Meta API call
    // Template: customer_dispatch
  }

  async sendDeliveryComplete(customerPhone: string, csatLink: string) {
    this.logger.log(`Sending Delivery Complete to ${customerPhone}: How did we do? ${csatLink}`);
    // TODO: Implement actual Meta API call
    // Template: delivery_complete
  }
}
