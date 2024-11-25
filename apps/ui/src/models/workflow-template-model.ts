import { z } from 'zod';

import { newDateOrUndefined } from '@/utils/dates';

import { placeholderEdgeSchema } from './workflow/edge/placeholder-edge-model';
import { savedWorkflowNodeSchema } from './workflow/node/node-model';
import { unionEdgeSchema } from './workflow/workflow-model';

export const workflowTemplateSchema = z.object({
  id: z.string().uuid(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  updatedAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  name: z.string(),
  description: z.string().optional(),
  triggerAndActionIds: z.array(z.string()).optional(),
  nodes: z.array(savedWorkflowNodeSchema),
  edges: z.union([z.array(unionEdgeSchema), z.array(placeholderEdgeSchema)]),
  output: z.any().optional(),
  sharedTo: z.enum(['project', 'workspace', 'global']).optional(),
  project: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
});
export type WorkflowTemplate = z.infer<typeof workflowTemplateSchema>;

export const createWorkflowTemplateSchema = workflowTemplateSchema.pick({
  name: true,
  nodes: true,
  edges: true,
});

export type CreateWorkflowTemplateType = z.infer<
  typeof createWorkflowTemplateSchema
>;

export const updateWorkflowTemplateSchema = workflowTemplateSchema
  .pick({
    edges: true,
    nodes: true,
    name: true,
    description: true,
  })
  .partial();

export type UpdateWorkflowTemplateType = z.infer<
  typeof updateWorkflowTemplateSchema
>;
