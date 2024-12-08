import { WorkspaceUserRole } from '@prisma/client';
import { ArrayUnique, IsEnum } from 'class-validator';

export class UpdateWorkspaceUserRolesDto {
  @IsEnum(WorkspaceUserRole, { each: true })
  @ArrayUnique()
  roles: WorkspaceUserRole[];
}
