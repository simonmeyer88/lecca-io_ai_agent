import { z } from 'zod';

export const workspaceInvitationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  workspace: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  email: z.string().email(),
  roles: z.array(z.enum(['OWNER', 'MAINTAINER', 'MEMBER'])),
});

export type WorkspaceInvitation = z.infer<typeof workspaceInvitationSchema>;

export const createWorkspaceInvitationSchema = workspaceInvitationSchema.pick({
  email: true,
  roles: true,
});

export type CreateWorkspaceInvitationType = z.infer<
  typeof createWorkspaceInvitationSchema
>;

export const updateWorkspaceInvitationSchema =
  createWorkspaceInvitationSchema.pick({
    roles: true,
  });

export type UpdateWorkspaceInvitationType = z.infer<
  typeof updateWorkspaceInvitationSchema
>;
