import { IsBoolean, IsOptional } from 'class-validator';

export class VariableIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
