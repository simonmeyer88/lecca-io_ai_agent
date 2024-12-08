import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  workflowAppId: string;

  @IsString()
  connectionId: string;

  @IsString()
  FK_workspaceId: string;

  @IsOptional()
  @IsString()
  FK_projectId?: string;

  //CREDENTIALS

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  privateKey?: string;

  @IsOptional()
  @IsString()
  publicKey?: string;

  //METADATA
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
