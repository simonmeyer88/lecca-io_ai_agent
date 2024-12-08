import { z } from 'zod';

import { newDateOrUndefined } from '@/utils/dates';

import { savedTaskMessageSchema } from './saved-task-message-model';

export const taskSchema = z.object({
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
  messages: z.array(savedTaskMessageSchema),
  agent: z
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
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = taskSchema
  .pick({
    name: true,
  })
  .extend({
    description: z.string().optional(),
  });

export type CreateTaskType = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = taskSchema
  .pick({
    name: true,
    description: true,
  })
  .partial();

export type UpdateTaskType = z.infer<typeof updateTaskSchema>;

export const messageTaskSchema = z.object({
  message: z.string().min(1),
});

export type MessageTaskType = z.infer<typeof messageTaskSchema>;
