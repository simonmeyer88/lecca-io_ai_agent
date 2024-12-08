import { Module } from '@nestjs/common';

import { StripeService } from '../stripe/stripe.service';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, StripeService],
})
export class BillingModule {}
