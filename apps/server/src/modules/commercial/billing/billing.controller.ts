import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ServerConfig } from '@/config/server.config';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { StripeService } from '../stripe/stripe.service';

import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller('billing')
@ApiTags('Billing')
@ApiBearerAuth()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('checkout-session')
  @Roles(['MAINTAINER'])
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @User() user: JwtUser,
  ) {
    return await this.stripeService.createCheckoutSessionForWorkspace({
      cancelUrl: `${ServerConfig.CLIENT_URL}/workspace-billing`,
      successUrl: `${ServerConfig.CLIENT_URL}/successful-payment`,
      priceId: body.priceId,
      workspaceId: user.workspaceId,
    });
  }

  @Get('products')
  @Roles(['MAINTAINER'])
  async getSubscriptionProducts() {
    return await this.stripeService.getProducts();
  }

  @Get('customer-portal')
  @Roles(['MAINTAINER'])
  async getCustomerPortal(@User() user: JwtUser) {
    return await this.stripeService.createBillingPortalSessionForWorkspace({
      returnUrl: `${ServerConfig.CLIENT_URL}/workspace-billing`,
      workspaceId: user.workspaceId,
    });
  }
}
