import { IsBoolean, IsOptional } from 'class-validator';

export class ProjectIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
