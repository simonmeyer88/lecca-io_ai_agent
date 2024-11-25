import { Module } from '@nestjs/common';
import { WorkflowAppsService } from './workflow-apps.service';
import { WorkflowAppsController } from './workflow-apps.controller';
import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { JwtModule } from '@nestjs/jwt';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { TasksService } from '@/modules/core/tasks/tasks.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';
import { ServerConfig } from '@/config/server.config';

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
