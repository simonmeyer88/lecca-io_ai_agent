import { z } from 'zod';

import { newDateOrUndefined } from '../utils/dates';

import { userSchema } from './user-model';

export const workspaceUserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val))
    .optional(),
  updatedAt: z
    .string()
    .optional()
    .transform((val) => newDateOrUndefined(val))
    .optional(),
  profileImageUrl: z.string().url().optional().nullable(),
  roles: z.array(z.enum(['OWNER', 'MAINTAINER', 'MEMBER'])),
  user: userSchema.optional(),
});
export type WorkspaceUser = z.infer<typeof workspaceUserSchema>;

export const updateWorkspaceUserSchema = workspaceUserSchema.pick({
  profileImageUrl: true,
});
export type UpdateWorkspaceUserType = z.infer<typeof updateWorkspaceUserSchema>;
