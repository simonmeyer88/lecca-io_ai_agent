import { IsBoolean, IsOptional } from 'class-validator';

export class ExecutionIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;

  @IsOptional()
  @IsBoolean()
  internal?: boolean;
}
