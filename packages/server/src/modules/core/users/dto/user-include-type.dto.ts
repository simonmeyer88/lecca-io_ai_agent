import { IsBoolean, IsOptional } from 'class-validator';

export class UserIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  activeWorkspace?: boolean;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
