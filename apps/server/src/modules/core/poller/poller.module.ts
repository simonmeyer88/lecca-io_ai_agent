import { Module } from '@nestjs/common';
import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { PollerService } from './poller.service';
import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { TasksService } from '@/modules/core/tasks/tasks.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';

@Module({
  exports: [PollerService],
  providers: [
    PollerService,
    WorkflowAppsService,
    TasksService, //For workflow apps serviceyy
    ConnectionsService, //workflow apps
    ExecutionsService, //workflow apps
    KnowledgeService, //Because TaskService uses it
  ],
})
export class PollerModule {}
