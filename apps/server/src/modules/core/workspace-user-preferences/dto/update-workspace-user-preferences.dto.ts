import { IsEnum, IsOptional } from 'class-validator';
import { WorkspaceUserPreferencesThemes } from '../enums/workspace-user-preferences-themes.enum';
import { WorkspaceUserPreferencesLocale } from '../enums/workspace-user-preferences-locale.enum';
import { WorkflowOrientation } from '@prisma/client';

export class UpdateWorkspaceUserPreferencesDto {
  @IsEnum(WorkspaceUserPreferencesThemes)
  @IsOptional()
  theme?: WorkspaceUserPreferencesThemes;

  @IsEnum(WorkspaceUserPreferencesLocale)
  @IsOptional()
  locale?: WorkspaceUserPreferencesLocale;

  @IsEnum(WorkflowOrientation)
  @IsOptional()
  workflowOrientation?: WorkflowOrientation;
}
