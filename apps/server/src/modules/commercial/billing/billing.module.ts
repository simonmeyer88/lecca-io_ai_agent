import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeService } from '../stripe/stripe.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, StripeService],
})
export class BillingModule {}
