import { WorkspaceUserRole } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkspaceUserDto {
  @IsString()
  @IsNotEmpty()
  profileImageUrl?: string;

  roles?: WorkspaceUserRole[];

  @IsString()
  @IsNotEmpty()
  FK_userId: string;

  @IsString()
  @IsNotEmpty()
  FK_workspaceId: string;
}
