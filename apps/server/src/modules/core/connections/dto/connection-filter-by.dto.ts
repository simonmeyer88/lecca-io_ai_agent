import { IsOptional, IsString } from 'class-validator';

export class ConnectionFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  projectAccessId?: string;

  @IsOptional()
  @IsString()
  workflowAppId?: string;
}
