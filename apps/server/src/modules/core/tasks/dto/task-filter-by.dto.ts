import { IsOptional, IsString } from 'class-validator';

export class TaskFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;
}
