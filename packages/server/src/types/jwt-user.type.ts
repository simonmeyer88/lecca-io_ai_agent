import { WorkspaceUserRole } from '@prisma/client';

export interface JwtUser {
  email: string;
  userId: string;
  workspaceUserId?: string;
  workspaceId?: string;
  roles?: (keyof typeof WorkspaceUserRole)[];
}
