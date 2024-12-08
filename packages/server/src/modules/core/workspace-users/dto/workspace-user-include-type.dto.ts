import { IsBoolean, IsOptional } from 'class-validator';

export class WorkspaceUserIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
