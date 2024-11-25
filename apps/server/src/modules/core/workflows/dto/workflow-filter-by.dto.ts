import { IsOptional, IsString } from 'class-validator';

export class WorkflowFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  agentCanTrigger?: string;
}
