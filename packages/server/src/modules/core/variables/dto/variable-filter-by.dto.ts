import { IsOptional, IsString } from 'class-validator';

export class VariableFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  projectAccessId?: string;
}
