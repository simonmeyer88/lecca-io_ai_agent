import { IsBoolean, IsOptional } from 'class-validator';

export class WorkflowExpansionDto {
  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsBoolean()
  description?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;

  @IsOptional()
  @IsBoolean()
  nodes?: boolean;

  @IsOptional()
  @IsBoolean()
  edges?: boolean;

  @IsOptional()
  @IsBoolean()
  triggerNode?: boolean;

  @IsOptional()
  @IsBoolean()
  triggerAndActionIds?: boolean;

  @IsOptional()
  @IsBoolean()
  subWorkflowIds?: boolean;

  @IsOptional()
  @IsBoolean()
  agentIds?: boolean;

  @IsOptional()
  @IsBoolean()
  connectionIds?: boolean;

  @IsOptional()
  @IsBoolean()
  knowledgeIds?: boolean;

  @IsOptional()
  @IsBoolean()
  variableIds?: boolean;

  @IsOptional()
  @IsBoolean()
  pollStorage?: boolean;

  @IsOptional()
  @IsBoolean()
  nextScheduledExecution?: boolean;

  @IsOptional()
  @IsBoolean()
  orientation?: boolean;
}
