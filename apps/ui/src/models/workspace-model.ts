import { z } from 'zod';

import { billingPlanTypeSchema, billingStatus } from './billing-model';

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  inBeta: z.boolean(), //This is temporary while we're in beta. If a workspace is not inBeta they cannot access to app
  onboarded: z.boolean(),
  defaultCreatedWorkspace: z.boolean().optional(),
  subscription: z
    .object({
      id: z.string().uuid(),
      type: z.enum(['free', 'starter', 'pro', 'enterprise']),
    })
    .optional(),
  billing: z
    .object({
      planType: billingPlanTypeSchema,
      status: billingStatus,
    })
    .nullable()
    .optional(),
  usage: z
    .object({
      allottedCredits: z.number(),
      purchasedCredits: z.number(),
    })
    .nullable()
    .optional(),
  createdByWorkspaceUser: z
    .object({
      id: z.string().uuid(),
      user: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        name: z.string(),
      }),
    })
    .optional(),
});
export type Workspace = z.infer<typeof workspaceSchema>;

export const createWorkspaceSchema = workspaceSchema.pick({
  name: true,
  description: true,
});
export type CreateWorkspaceType = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = workspaceSchema
  .pick({
    name: true,
    description: true,
    onboarded: true,
    logoUrl: true,
  })
  .partial();

export type UpdateWorkspaceType = z.infer<typeof updateWorkspaceSchema>;
