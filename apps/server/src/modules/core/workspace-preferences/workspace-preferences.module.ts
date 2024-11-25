import { Module } from '@nestjs/common';
import { WorkspacePreferencesService } from './workspace-preferences.service';
import { WorkspacePreferencesController } from './workspace-preferences.controller';

@Module({
  controllers: [WorkspacePreferencesController],
  providers: [WorkspacePreferencesService],
})
export class WorkspacePreferencesModule {}
