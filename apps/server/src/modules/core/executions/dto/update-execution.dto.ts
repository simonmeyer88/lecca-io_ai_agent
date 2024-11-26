import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { ExecutionStatus } from '../enums/execution-status.enum';

export class UpdateExecutionDto {
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsDateString()
  stoppedAt?: Date;

  @IsOptional()
  @IsString()
  statusMessage?: string;

  @IsOptional()
  @IsString()
  continueExecutionAt?: string;
}
