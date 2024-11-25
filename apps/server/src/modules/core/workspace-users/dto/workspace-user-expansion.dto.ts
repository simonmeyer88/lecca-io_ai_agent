import { IsBoolean, IsOptional } from 'class-validator';

export class WorkspaceUserExpansionDto {
  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  deletedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  profileImageUrl?: boolean;

  @IsOptional()
  @IsBoolean()
  roles?: boolean;

  @IsOptional()
  @IsBoolean()
  workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  user?: boolean;
}
