import { IsBoolean, IsOptional } from 'class-validator';

export class TaskIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
