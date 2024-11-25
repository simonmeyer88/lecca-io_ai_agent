import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateWorkspacePreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disabledFeatures?: string[];
}
