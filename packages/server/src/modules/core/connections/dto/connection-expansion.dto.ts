import { IsBoolean, IsOptional } from 'class-validator';

export class ConnectionExpansionDto {
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
  connectionId?: boolean;

  @IsOptional()
  @IsBoolean()
  workflowAppId?: boolean;

  //We don't want to expose this to the client
  //So we remove it on the expansion guard.
  @IsOptional()
  @IsBoolean()
  credentials?: boolean;

  //We don't want to expose this to the client
  //So we remove it on the expansion guard.
  @IsOptional()
  @IsBoolean()
  metadata?: boolean;

  @IsOptional()
  @IsBoolean()
  workflowApp?: boolean;

  @IsOptional()
  @IsBoolean()
  workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;
}
