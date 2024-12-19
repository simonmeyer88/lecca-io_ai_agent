import { Module } from '@nestjs/common';

import { ConnectionsService } from '../connections/connections.service';
import { ExecutionsService } from '../executions/executions.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';

import { AgentTasksController, TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [],
  controllers: [TasksController, AgentTasksController],
  exports: [TasksService],
  providers: [
    TasksService,
    WorkflowAppsService,
    ConnectionsService, //For workflow apps service
    ExecutionsService, //For workflow apps service
    KnowledgeService,
  ],
})
export class TasksModule {}
