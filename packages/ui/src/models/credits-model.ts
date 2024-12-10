import { z } from 'zod';

import { newDateOrUndefined } from '../utils/dates';

export const creditSchema = z.object({
  id: z.string().uuid(),
  updatedAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val)),
  creditsUsed: z.number().optional(),
  details: z.record(z.unknown()).optional(),
  project: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
  workflow: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
  agent: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
  task: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
  execution: z
    .object({
      id: z.string().uuid(),
      executionNumber: z.number(),
    })
    .optional(),
  knowledge: z
    .object({
      id: z.string().uuid(),
      name: z.number(),
    })
    .optional(),
});

export type Credit = z.infer<typeof creditSchema>;
