import { WorkflowOrientation } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { WorkspaceUserPreferencesLocale } from '../enums/workspace-user-preferences-locale.enum';
import { WorkspaceUserPreferencesThemes } from '../enums/workspace-user-preferences-themes.enum';

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
