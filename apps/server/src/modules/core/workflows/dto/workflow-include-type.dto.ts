import { IsBoolean, IsOptional } from 'class-validator';

export class WorkflowIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;

  @IsOptional()
  @IsBoolean()
  internal?: boolean;
}
