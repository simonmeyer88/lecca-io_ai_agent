import { z } from 'zod';

import { workflowAppActionSchema } from './workflow-app-action-model';
import { workflowAppConnectionSchema } from './workflow-app-connection-model';
import { workflowAppTriggerSchema } from './workflow-app-trigger-model';

export const workflowAppSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name is too long' }),
  logoUrl: z.string().min(1),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .max(255, { message: 'Description is too long' }),
  connections: z.array(workflowAppConnectionSchema),
  triggers: z.array(workflowAppTriggerSchema),
  actions: z.array(workflowAppActionSchema),
  isPublished: z.boolean(),
  needsConnection: z.boolean(),
  availableForAgent: z.boolean(),
});

export type WorkflowApp = z.infer<typeof workflowAppSchema>;

export const createWorkflowAppSchema = workflowAppSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    logoUrl: z.string().optional(),
  });

export type CreateWorkflowAppType = z.infer<typeof createWorkflowAppSchema>;

export const updateWorkflowAppSchema = workflowAppSchema
  .pick({
    name: true,
    logoUrl: true,
    description: true,
    connections: true,
    triggers: true,
    actions: true,
  })
  .partial();

export type UpdateWorkflowAppType = z.infer<typeof updateWorkflowAppSchema>;

/**
 * This is used to map the workflow apps by their id.
 */
export type MappedWorkflowApps = {
  [key: string]: z.infer<typeof workflowAppSchema>;
};
