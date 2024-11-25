import { IsOptional, IsString } from 'class-validator';

export class WorkspaceUserFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
