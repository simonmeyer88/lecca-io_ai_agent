import { IsOptional, IsString } from 'class-validator';

export class ExecutionFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  workflowId?: string;
}
