import { Module } from '@nestjs/common';

import { WorkspacePreferencesController } from './workspace-preferences.controller';
import { WorkspacePreferencesService } from './workspace-preferences.service';

@Module({
  controllers: [WorkspacePreferencesController],
  providers: [WorkspacePreferencesService],
})
export class WorkspacePreferencesModule {}
