import { z } from 'zod';

import { newDateOrUndefined } from '../../utils/dates';

export const savedTaskUserMessageSchema = z.object({
  id: z.string().uuid(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  role: z.literal('user'),
  content: z.string(),
  data: z.object({
    workspaceUserId: z.string().uuid(),
    agentId: z.string().uuid(),
    workflowId: z.string().uuid(),
  }),
});
export type SavedTaskUserMessage = z.infer<typeof savedTaskUserMessageSchema>;

export const savedTaskAssistantMessageSchema = z.object({
  id: z.string().uuid(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  role: z.literal('assistant'),
  content: z.array(
    z.union([
      z.object({
        type: z.literal('text'),
        text: z.string(),
      }),
      z.object({
        type: z.literal('tool-call'),
        toolName: z.string(),
        toolCallId: z.string(),
        args: z.any(),
      }),
    ]),
  ),
  data: z.object({
    agentId: z.string().uuid(),
  }),
});
export type SavedTaskAssistantMessage = z.infer<
  typeof savedTaskAssistantMessageSchema
>;

export const savedTaskToolMessageSchema = z.object({
  id: z.string().uuid(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  role: z.literal('tool'),
  content: z.array(
    z.object({
      toolName: z.string(),
      toolCallId: z.string(),
      result: z.any(),
      type: z.literal('tool-result'),
      data: z.object({
        appId: z.string(),
        actionId: z.string(),
      }),
    }),
  ),
  data: z.object({
    agentId: z.string().uuid().nullable().optional(),
  }),
});
export type SavedTaskToolMessage = z.infer<typeof savedTaskToolMessageSchema>;

export const savedTaskMessageSchema = z.union([
  savedTaskUserMessageSchema,
  savedTaskAssistantMessageSchema,
  savedTaskToolMessageSchema,
]);
export type SavedTaskMessage = z.infer<typeof savedTaskMessageSchema>;
