import { IsBoolean, IsOptional } from 'class-validator';

export class WorkflowTemplateIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
