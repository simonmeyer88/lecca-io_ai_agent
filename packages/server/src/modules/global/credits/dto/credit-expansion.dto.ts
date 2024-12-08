import { IsBoolean, IsOptional } from 'class-validator';

export class CreditExpansionDto {
  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  creditsUsed?: boolean;

  @IsOptional()
  @IsBoolean()
  details?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;

  @IsOptional()
  @IsBoolean()
  workflow?: boolean;

  @IsOptional()
  @IsBoolean()
  execution?: boolean;

  @IsOptional()
  @IsBoolean()
  agent?: boolean;

  @IsOptional()
  @IsBoolean()
  task?: boolean;

  @IsOptional()
  @IsBoolean()
  knowledge?: boolean;
}
