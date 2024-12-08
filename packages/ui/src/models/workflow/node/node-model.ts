import { z } from 'zod';

const baseNodeSchema = z.object({
  id: z.string().uuid(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const savedPlaceholderNodeSchema = baseNodeSchema.merge(
  z.object({
    nodeType: z.literal('placeholder'),
  }),
);
export type SavedPlaceholderNode = z.infer<typeof savedPlaceholderNodeSchema>;

export const savedActionNodeSchema = baseNodeSchema.merge(
  z.object({
    appId: z.string(),
    connectionId: z.string(),
    nodeType: z.literal('action'),
    actionId: z.string(),
    description: z.string(),
    name: z.string(),
    value: z.any(),
    raw: z.any(),
    output: z.any().optional(),
    references: z.record(z.record(z.any())).optional(),
    variables: z.record(z.record(z.any())).optional(),

    //Execution properties
    executionStatus: z
      .enum(['RUNNING', 'SUCCESS', 'FAILED', 'NEEDS_INPUT', 'SCHEDULED'])
      .optional(),
    executionStatusMessage: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
);
export type SavedActionNode = z.infer<typeof savedActionNodeSchema>;

export const savedTriggerNodeSchema = baseNodeSchema.merge(
  z.object({
    appId: z.string(),
    connectionId: z.string(),
    nodeType: z.literal('trigger'),
    triggerId: z.string(),
    description: z.string(),
    name: z.string(),
    value: z.any(),
    raw: z.any(),
    output: z.any().optional(),
    variables: z.record(z.record(z.any())).optional(),

    //Execution properties
    executionStatus: z
      .enum(['RUNNING', 'SUCCESS', 'FAILED', 'NEEDS_INPUT', 'SCHEDULED'])
      .optional(),
    executionStatusMessage: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
);
export type SavedTriggerNode = z.infer<typeof savedTriggerNodeSchema>;

/**
 * This is not what a node looks like in the ui workflow. This is only when saving to the database and loading it.
 */
export const savedWorkflowNodeSchema = z.union([
  savedPlaceholderNodeSchema,
  savedTriggerNodeSchema,
  savedActionNodeSchema,
]);

export type SavedWorkflowNode = z.infer<typeof savedWorkflowNodeSchema>;
