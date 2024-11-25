import { WorkflowOrientation } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @IsArray()
  nodes: any;

  @IsArray()
  edges: any;

  @IsEnum(WorkflowOrientation)
  @IsOptional()
  workflowOrientation?: WorkflowOrientation;
}
