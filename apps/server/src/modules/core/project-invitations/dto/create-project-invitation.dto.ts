import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectInvitationDto {
  @IsString()
  @IsNotEmpty()
  workspaceUserId!: string;
}
