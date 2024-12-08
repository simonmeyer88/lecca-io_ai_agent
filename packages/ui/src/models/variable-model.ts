import { z } from 'zod';

export const variableSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  type: z.enum(['system', 'workspace', 'project']),
  dataType: z.enum(['string', 'number', 'boolean', 'date', 'json']),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  value: z.union([
    z.string().min(1, { message: 'Value is required' }),
    z.number(),
    z.boolean(),
    z.date(),
  ]),
  project: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
});
export type Variable = z.infer<typeof variableSchema>;

export const createVariableSchema = variableSchema
  .pick({
    name: true,
    type: true,
    dataType: true,
    description: true,
    value: true,
  })
  .extend({
    projectId: z.string().uuid().optional(),
  });

export type CreateVariableType = z.infer<typeof createVariableSchema>;

export const updateVariableSchema = variableSchema
  .pick({
    name: true,
    type: true,
    dataType: true,
    description: true,
    value: true,
  })
  .extend({
    projectId: z.string().uuid().optional(),
  })
  .partial();

export type UpdateVariableType = z.infer<typeof updateVariableSchema>;
