import { z } from 'zod';

import {
  savedTaskAssistantMessageSchema,
  savedTaskUserMessageSchema,
} from './saved-task-message-model';
import {
  streamedTaskAssistantMessageSchema,
  streamedTaskUserMessageSchema,
} from './streamed-task-message-model';

export const formattedTaskUserMessageSchema =
  streamedTaskUserMessageSchema.extend({
    data: savedTaskUserMessageSchema.shape.data.nullable().optional(),
  });
export type FormattedTaskUserMessage = z.infer<
  typeof formattedTaskUserMessageSchema
>;

export const formattedTaskAssistantMessageSchema =
  streamedTaskAssistantMessageSchema.extend({
    data: savedTaskAssistantMessageSchema.shape.data.nullable().optional(),
  });
export type FormattedTaskAssistantMessage = z.infer<
  typeof formattedTaskAssistantMessageSchema
>;

export const formattedTaskSystemMessageSchema = z.object({
  role: z.literal('system'),
  content: z.string(),
  createdAt: z.date(),
  parts: streamedTaskUserMessageSchema.shape.parts,
  data: z.any(),
});

export type FormattedTaskSystemMessage = z.infer<
  typeof formattedTaskSystemMessageSchema
>;

export const formattedTaskMessageSchema = z.union([
  formattedTaskUserMessageSchema,
  formattedTaskAssistantMessageSchema,
  formattedTaskSystemMessageSchema,
]);
export type FormattedTaskMessage = z.infer<typeof formattedTaskMessageSchema>;
