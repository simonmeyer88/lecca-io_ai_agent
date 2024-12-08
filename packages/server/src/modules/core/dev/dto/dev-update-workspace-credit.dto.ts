import { IsInt, IsOptional, IsString } from 'class-validator';

export class DevUpdateWorkspaceCreditDto {
  @IsInt()
  credits: number;

  @IsString()
  workspaceId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
