import { z } from 'zod';

export const projectInvitationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  roles: z.array(z.enum(['OWNER', 'MAINTAINER'])),
  project: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  workspaceUser: z.object({
    id: z.string().uuid(),
    user: z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
    }),
  }),
});

export type ProjectInvitation = z.infer<typeof projectInvitationSchema>;

export const createProjectInvitationSchema = z.object({
  projectId: z.string().uuid(),
  workspaceUserId: z.string().uuid(),
});

export type CreateProjectInvitationType = z.infer<
  typeof createProjectInvitationSchema
>;
