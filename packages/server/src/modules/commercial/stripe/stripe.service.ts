import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BillingPlanType } from '@prisma/client';
import { Request } from 'express';
import Stripe from 'stripe';

import { ServerConfig } from '../../../config/server.config';
import { CreditsService } from '../../global/credits/credits.service';
import { PrismaService } from '../../global/prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly credits: CreditsService,
  ) {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-11-20.acacia',
      });
    } else {
      //Stripe isn't configured
    }
  }

  getProducts = async () => {
    const prices = await this.stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return prices.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.default_price,
      image: product.images?.[0],
    }));
  };

  createBillingPortalSessionForWorkspace = async ({
    workspaceId,
    returnUrl,
  }: {
    workspaceId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> => {
    const customerId = await this.getCustomerIdByWorkspaceId({ workspaceId });

    if (!customerId) {
      throw new NotFoundException(
        'Stripe Customer ID for workspace was not able to be created to create billing portal session.',
      );
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  };

  createCheckoutSessionForWorkspace = async ({
    workspaceId,
    priceId,
    successUrl,
    cancelUrl,
  }: {
    workspaceId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> => {
    const customerId = await this.getCustomerIdByWorkspaceId({ workspaceId });

    if (!customerId) {
      throw new NotFoundException(
        'Stripe Customer ID was not able to be created to start the checkout session.',
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
    });

    return session;
  };

  verifySignatureAndReturnEvent = (req: Request): Stripe.Event => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new ForbiddenException('Invalid webhook request');
    }

    let event: Stripe.Event | undefined;

    try {
      const rawBody = (req as any)['parsedRawBody']?.toString();
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error('Error handling stripe event:', err.message);
      throw new ForbiddenException('Invalid webhook request');
    }

    return event;
  };

  getEntitlementsForWorkspace = async ({
    workspaceId,
  }: {
    workspaceId: string;
  }) => {
    const customerIdFromWorkspace = await this.getCustomerIdByWorkspaceId({
      workspaceId,
    });

    if (!customerIdFromWorkspace) {
      throw new NotFoundException(
        'Stripe Customer ID could not be created to get workspace entitlements',
      );
    }

    const activeEntitlements =
      await this.stripe.entitlements.activeEntitlements.list({
        customer: customerIdFromWorkspace,
      });

    return activeEntitlements;
  };

  getCustomerIdByWorkspaceId = async ({
    workspaceId,
  }: {
    workspaceId: string;
  }) => {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        billing: {
          select: {
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found to create a Stripe Customer ID',
      );
    } else if (!workspace.billing?.stripeCustomerId) {
      return await this.createCustomerIdForWorkspace({ workspaceId });
    } else {
      return workspace.billing.stripeCustomerId;
    }
  };

  getWorkspaceIdByCustomerId = async ({
    customerId,
  }: {
    customerId: string;
  }) => {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        billing: {
          stripeCustomerId: customerId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found to retrieve Stripe Customer ID',
      );
    } else {
      return workspace.id;
    }
  };

  createCustomerIdForWorkspace = async ({
    workspaceId,
  }: {
    workspaceId: string;
  }) => {
    const workspaceWithDetails = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        name: true,
        workspaceUsers: {
          where: {
            roles: {
              has: 'OWNER',
            },
          },
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    const customer = await this.stripe.customers.create({
      name: workspaceWithDetails.name,
      email: workspaceWithDetails.workspaceUsers[0]?.user?.email,
      metadata: {
        workspaceId,
      },
    });

    await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        billing: {
          create: {
            stripeCustomerId: customer.id,
          },
        },
      },
    });

    return customer.id;
  };

  getPlanTypeByPriceId = async ({
    priceId,
  }: {
    priceId: string;
  }): Promise<BillingPlanType | null> => {
    const priceWithProduct = await this.stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    if (!(priceWithProduct.product as Stripe.Product)?.metadata) {
      throw new NotFoundException('Product mdetadata not found');
    }

    const planType = (priceWithProduct.product as Stripe.Product).metadata[
      'plan-type'
    ] as BillingPlanType | undefined;

    if (!planType) {
      console.error('Plan type not on product metadata', priceId);
      return null;
    }

    if (
      planType !== 'free' &&
      planType !== 'business' &&
      planType !== 'professional' &&
      planType !== 'custom' &&
      planType !== 'team'
    ) {
      console.error('Invalid plan type', planType);
      return null;
    }

    return planType;
  };

  handleStripeEvent = async (event: Stripe.Event) => {
    switch (event.type) {
      case 'checkout.session.completed':
        return await this.#handleCheckoutSessionCompleted(event);
      case 'customer.subscription.deleted':
        return await this.#handleCustomerSubscriptionDeleted(event);
      case 'customer.subscription.updated':
        return await this.#handleCustomerSubscriptionUpdated(event);
      case 'customer.subscription.created':
        return await this.#handleCustomerSubscriptionCreated(event);
      default:
        return await this.#handleUnknownEvent(event);
    }
  };

  #handleCheckoutSessionCompleted = async (event: Stripe.Event) => {
    // Payment is successful and the subscription is created.
    // You should provision the subscription and save the customer ID to your database
    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = session.customer as string;
    const workspaceId = await this.getWorkspaceIdByCustomerId({ customerId });
    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const planType = await this.getPlanTypeByPriceId({
      priceId: subscription.items.data[0].price.id as string,
    });

    if (!planType) {
      throw new NotFoundException('Plan type not found');
    }

    await this.#provisionWorkspaceByPlanType({ workspaceId, planType });

    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        billing: {
          update: {
            stripeSubscriptionId: subscription.id as string,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            stripePriceId: subscription.items.data[0].price.id as string,
            status: 'active',
            planType,
          },
        },
      },
      select: {
        id: true,
      },
    });
  };

  #handleCustomerSubscriptionDeleted = async (event: Stripe.Event) => {
    // When a subscription is canceled immediately, a customer.subscription.deleted
    // event is sent. At this point, you should consider the subscription canceled.
    const subscription = event.data.object as Stripe.Subscription;

    const customerId = subscription.customer as string;
    const workspaceId = await this.getWorkspaceIdByCustomerId({ customerId });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        billing: {
          update: {
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
            stripePriceId: null,
            status: 'canceled',
            planType: 'free',
          },
        },
      },
      select: {
        id: true,
      },
    });
  };

  #handleCustomerSubscriptionUpdated = async (event: Stripe.Event) => {
    // Handle subscription changes
    const subscription = event.data.object as Stripe.Subscription;

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const customerId = subscription.customer as string;
    const workspaceId = await this.getWorkspaceIdByCustomerId({ customerId });

    const planType = await this.getPlanTypeByPriceId({
      priceId: subscription.items.data[0].price.id as string,
    });

    if (!planType) {
      throw new NotFoundException('Plan type not found');
    }

    const workspaceBeingUpdated = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        billing: {
          select: {
            planType: true,
          },
        },
      },
    });

    const originalPlanType = workspaceBeingUpdated.billing?.planType;
    if (originalPlanType !== planType) {
      //Only provision if the plan type has changed
      await this.#provisionWorkspaceByPlanType({
        workspaceId,
        planType,
      });
    }

    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        billing: {
          update: {
            stripeSubscriptionId: subscription.id as string,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            stripePriceId: subscription.items.data[0].price.id as string,
            status: 'active',
            planType,
          },
        },
      },
      select: {
        id: true,
      },
    });
  };

  #handleCustomerSubscriptionCreated = async (event: Stripe.Event) => {
    // Handle subscription changes
    const subscription = event.data.object as Stripe.Subscription;

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const customerId = subscription.customer as string;
    const workspaceId = await this.getWorkspaceIdByCustomerId({ customerId });

    const planType = await this.getPlanTypeByPriceId({
      priceId: subscription.items.data[0].price.id as string,
    });

    if (!planType) {
      throw new NotFoundException('Plan type not found');
    }

    const workspaceBeingUpdated = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        billing: {
          select: {
            planType: true,
          },
        },
      },
    });

    const originalPlanType = workspaceBeingUpdated.billing?.planType;
    if (originalPlanType !== planType) {
      //Only provision if the plan type has changed
      await this.#provisionWorkspaceByPlanType({
        workspaceId,
        planType,
      });
    }

    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        billing: {
          update: {
            stripeSubscriptionId: subscription.id as string,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            stripePriceId: subscription.items.data[0].price.id as string,
            status: 'active',
            planType,
          },
        },
      },
      select: {
        id: true,
      },
    });
  };

  #handleUnknownEvent = async (event: Stripe.Event) => {
    //Just for development purposes
    if (ServerConfig.ENVIRONMENT !== 'production') console.info(event.type);
  };

  #provisionWorkspaceByPlanType = async ({
    workspaceId,
    planType,
  }: {
    workspaceId: string;
    planType: BillingPlanType;
  }) => {
    const DEFAULT = this.credits.getMonthlyProatedCreditAllotment({
      plan: 'free',
    });
    let amountToAllot = DEFAULT;

    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        defaultCreatedWorkspace: true,
      },
    });

    if (planType) {
      switch (planType) {
        case 'free':
          if (!workspace.defaultCreatedWorkspace) {
            //Only the first default workspace qualifies for free tokens
            amountToAllot = 0;
          }
          break;
        case 'professional':
          amountToAllot = this.credits.getMonthlyProatedCreditAllotment({
            plan: 'professional',
          });
          break;
        case 'team':
          amountToAllot = this.credits.getMonthlyProatedCreditAllotment({
            plan: 'team',
          });
          break;
        case 'business':
          amountToAllot = this.credits.getMonthlyProatedCreditAllotment({
            plan: 'business',
          });
          break;
        default:
          amountToAllot = DEFAULT;
          break;
      }
    }

    await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        usage: {
          upsert: {
            create: {
              allottedCredits: amountToAllot,
              refreshedAt: new Date().toISOString(),
            },
            update: {
              allottedCredits: amountToAllot,
              refreshedAt: new Date().toISOString(),
            },
          },
        },
      },
    });
  };
}
