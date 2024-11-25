import { WorkspaceUserRole } from '@prisma/client';
import { ArrayUnique, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateWorkspaceInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(WorkspaceUserRole, { each: true })
  @ArrayUnique()
  roles?: WorkspaceUserRole[];
}
