import { Module } from '@nestjs/common';

import { WorkspaceUserPreferencesController } from './workspace-user-preferences.controller';
import { WorkspaceUserPreferencesService } from './workspace-user-preferences.service';

@Module({
  controllers: [WorkspaceUserPreferencesController],
  providers: [WorkspaceUserPreferencesService],
})
export class WorkspaceUserPreferencesModule {}
