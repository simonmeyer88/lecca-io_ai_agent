import { z } from 'zod';

import { newDateOrUndefined } from '../../utils/dates';
import { WORKFLOW_ORIENTATIONS } from '../workspace-user-preferences-model';

import { placeholderEdgeSchema } from './edge/placeholder-edge-model';
import { workflowEdgeSchema } from './edge/workflow-edge-model';
import { savedWorkflowNodeSchema } from './node/node-model';

// import { projectSchema } from '../project/project-model';

export const unionEdgeSchema = z.union([
  placeholderEdgeSchema,
  workflowEdgeSchema,
]);
export type UnionEdgeType = z.infer<typeof unionEdgeSchema>;

export const workflowSchema = z.object({
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
  isActive: z.boolean(),
  isInternal: z.boolean().optional(),
  description: z.string().optional(),
  triggerAndActionIds: z.array(z.string()).optional(),
  workflowOrientation: z.enum(WORKFLOW_ORIENTATIONS),
  nodes: z.array(savedWorkflowNodeSchema),
  edges: z.union([z.array(unionEdgeSchema), z.array(placeholderEdgeSchema)]),
  output: z.any().optional(),
  project: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});
export type Workflow = z.infer<typeof workflowSchema>;

export const createWorkflowSchema = workflowSchema.pick({
  name: true,
  nodes: true,
  edges: true,
  isActive: true,
  workflowOrientation: true,
});

export type CreateWorkflowType = z.infer<typeof createWorkflowSchema>;

export const updateWorkflowSchema = workflowSchema
  .pick({
    nodes: true,
    edges: true,
    name: true,
    isActive: true,
    description: true,
    workflowOrientation: true,
  })
  .partial();

export type UpdateWorkflowType = z.infer<typeof updateWorkflowSchema>;
