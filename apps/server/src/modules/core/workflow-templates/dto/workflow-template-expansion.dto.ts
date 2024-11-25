import { IsBoolean, IsOptional } from 'class-validator';

export class WorkflowTemplateExpansionDto {
  @IsOptional()
  @IsBoolean()
  description?: boolean;

  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

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
  triggerAndActionIds?: boolean;

  @IsOptional()
  @IsBoolean()
  sharedTo?: boolean;
}
