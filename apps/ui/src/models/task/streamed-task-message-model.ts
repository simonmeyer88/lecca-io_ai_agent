import { z } from 'zod';

import { newDateOrUndefined } from '@/utils/dates';

export const streamedTaskUserMessageSchema = z.object({
  id: z.string(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  role: z.literal('user'),
  content: z.union([
    z.string(),
    z.array(
      z.union([
        z.object({
          type: z.literal('text'),
          text: z.string(),
        }),
        z.object({
          type: z.literal('image'),
          image: z.string(),
        }),
      ]),
    ),
  ]),
});
export type StreamedTaskUserMessage = z.infer<
  typeof streamedTaskUserMessageSchema
>;

export const streamedTaskAssistantMessageToolInvocationSchema = z.object({
  state: z.enum(['partial-call', 'call', 'result']),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.any(),
  result: z.any().nullable().optional(),
  /**
   * this isn't streamed, but it might be there (it's there if it's converted from saved to
   * streamed message data. But I'm too lazy to make a formattedTaskAssistantMessageToolInvocationSchema, so we'll put it here for now.)
   */
  data: z
    .object({
      appId: z.string().nullable().optional(),
      actionId: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});
export type StreamedTaskAssistantMessageToolInvocation = z.infer<
  typeof streamedTaskAssistantMessageToolInvocationSchema
>;

export const streamedTaskAssistantMessageSchema = z.object({
  id: z.string(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  role: z.literal('assistant'),
  content: z.string(),
  toolInvocations: z
    .array(streamedTaskAssistantMessageToolInvocationSchema)
    .nullable()
    .optional(),
});
export type StreamedTaskAssistantMessage = z.infer<
  typeof streamedTaskAssistantMessageSchema
>;

export const streamedTaskMessageSchema = z.union([
  streamedTaskUserMessageSchema,
  streamedTaskAssistantMessageSchema,
]);
export type StreamedTaskMessage = z.infer<typeof streamedTaskMessageSchema>;
