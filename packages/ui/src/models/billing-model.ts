import { z } from 'zod';

export const billingPlanTypeSchema = z.enum([
  'free',
  'team',
  'professional',
  'business',
  'custom',
]);

export const billingStatus = z.enum(['active', 'canceled', 'unpaid']);

export const billingSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  planType: billingPlanTypeSchema,
  status: billingStatus,
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
});

export const billingProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z
    .object({
      id: z.string(),
      active: z.boolean(),
      currency: z.string(),
      recurring: z.object({
        interval: z.literal('month'),
        interval_count: z.number(),
        unit_amount: z.number(),
      }),
      unit_amount: z.number(),
      created: z.number(),
    })
    .nullable(),
  image: z.string().url().optional(),
});
export type BillingProduct = z.infer<typeof billingProductSchema>;
