import { z } from 'zod';

import { newDateOrUndefined } from '../utils/dates';

import { workflowEdgeSchema } from './workflow/edge/workflow-edge-model';
import { savedWorkflowNodeSchema } from './workflow/node/node-model';
import { WORKFLOW_ORIENTATIONS } from './workspace-user-preferences-model';

export const executionSchema = z.object({
  id: z.string().uuid(),
  updatedAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  startedAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  stoppedAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  status: z.enum(['RUNNING', 'SUCCESS', 'FAILED', 'NEEDS_INPUT', 'SCHEDULED']),
  statusMessage: z.string().optional(),
  nodes: z.array(savedWorkflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  output: z.any().optional(),
  continueExecutionAt: z.string().optional(),
  workflowOrientation: z.enum(WORKFLOW_ORIENTATIONS),
  workflow: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      project: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
        })
        .optional(),
    })
    .optional(),
  executionNumber: z.number(),
});

export type Execution = z.infer<typeof executionSchema>;
