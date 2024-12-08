import { IsOptional, IsString } from 'class-validator';

export class CreateWorkflowTemplateDto {
  @IsString()
  workflowId: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}
