import { z } from 'zod';

import { inputConfigSchema } from './input-config-model';
import { viewOptionsSchema } from './workflow-app-trigger-model';

export const workflowAppActionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  iconUrl: z.string().min(1).optional(),
  group: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .nullable()
    .optional(),
  needsConnection: z.boolean(),
  availableForAgent: z.boolean().optional(),
  inputConfig: inputConfigSchema,
  viewOptions: viewOptionsSchema.optional(),
});

export type WorkflowAppActionType = z.infer<typeof workflowAppActionSchema>;

export const createWorkflowAppActionSchema = workflowAppActionSchema.pick({
  name: true,
  description: true,
});

export type CreateWorkflowAppActionType = z.infer<
  typeof createWorkflowAppActionSchema
>;

export const updateWorkflowAppActionSchema = workflowAppActionSchema.pick({
  name: true,
  description: true,
});

export type UpdateWorkflowAppActionType = z.infer<
  typeof updateWorkflowAppActionSchema
>;
