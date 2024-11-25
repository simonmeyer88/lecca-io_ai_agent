import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveWorkspaceUserFromWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  workspaceUserId!: string;
}
