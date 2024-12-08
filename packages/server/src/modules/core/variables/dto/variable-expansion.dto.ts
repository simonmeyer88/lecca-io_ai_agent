import { IsBoolean, IsOptional } from 'class-validator';

export class VariableExpansionDto {
  @IsOptional()
  @IsBoolean()
  description?: boolean;

  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  value?: boolean;

  @IsOptional()
  @IsBoolean()
  workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;
}
