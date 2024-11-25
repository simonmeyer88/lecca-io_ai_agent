import { IsBoolean, IsOptional } from 'class-validator';

export class WorkspaceExpansionDto {
  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  onboarded?: boolean;

  @IsOptional()
  @IsBoolean()
  description?: boolean;

  @IsOptional()
  @IsBoolean()
  workspaceUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  workspaceUserRoles?: boolean;

  @IsOptional()
  @IsBoolean()
  logoUrl?: boolean;
}
