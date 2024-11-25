import { Module } from '@nestjs/common';
import { WorkspaceUserPreferencesService } from './workspace-user-preferences.service';
import { WorkspaceUserPreferencesController } from './workspace-user-preferences.controller';

@Module({
  controllers: [WorkspaceUserPreferencesController],
  providers: [WorkspaceUserPreferencesService],
})
export class WorkspaceUserPreferencesModule {}
