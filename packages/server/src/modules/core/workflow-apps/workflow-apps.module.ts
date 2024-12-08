import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ServerConfig } from '@/config/server.config';
import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';
import { TasksService } from '@/modules/core/tasks/tasks.service';

import { WorkflowAppsController } from './workflow-apps.controller';
import { WorkflowAppsService } from './workflow-apps.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: ServerConfig.APP_OAUTH_CALLBACK_STATE_SECRET,
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  exports: [WorkflowAppsService],
  controllers: [WorkflowAppsController],
  providers: [
    WorkflowAppsService,
    ConnectionsService,
    TasksService,
    ExecutionsService,
    TasksService,
    KnowledgeService, //Because TaskService uses it
  ],
})
export class WorkflowAppsModule {}
