import { IsOptional, IsString } from 'class-validator';

export class WorkflowTemplateFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  projectAccessId?: string;
}
