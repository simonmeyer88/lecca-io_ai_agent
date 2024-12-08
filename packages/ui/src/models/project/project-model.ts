import { z } from 'zod';

import { workflowSchema } from '../workflow/workflow-model';

export const projectSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  workflows: z.array(workflowSchema).optional(),
  createdByWorkspaceUser: z
    .object({
      id: z.string().uuid(),
      user: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        name: z.string(),
      }),
    })
    .optional(),
  _count: z
    .object({
      agents: z.number().optional(),
      connections: z.number().optional(),
      knowledge: z.number().optional(),
      variables: z.number().optional(),
      workflows: z.number().optional(),
    })
    .optional(),
});
export type Project = z.infer<typeof projectSchema>;

export const createProjectSchema = projectSchema.pick({
  name: true,
  description: true,
});

export type CreateProjectType = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectSchema
  .pick({
    name: true,
    description: true,
  })
  .partial();

export type UpdateProjectType = z.infer<typeof updateProjectSchema>;
