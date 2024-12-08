import { IsBoolean, IsOptional } from 'class-validator';

export class ExecutionExpansionDto {
  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  startedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  stoppedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  executionNumber?: boolean;

  @IsOptional()
  @IsBoolean()
  nodes?: boolean;

  @IsOptional()
  @IsBoolean()
  edges?: boolean;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  statusMessage?: boolean;

  @IsOptional()
  @IsBoolean()
  continueExecutionAt?: boolean;

  @IsOptional()
  @IsBoolean()
  workflow?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;

  @IsOptional()
  @IsBoolean()
  workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  output?: boolean;

  @IsOptional()
  @IsBoolean()
  orientation?: boolean;
}
