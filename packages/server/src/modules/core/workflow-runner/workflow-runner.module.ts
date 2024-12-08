import { Module } from '@nestjs/common';

import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';
import { TasksService } from '@/modules/core/tasks/tasks.service';

import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';

import { WorkflowRunnerService } from './workflow-runner.service';

@Module({
  exports: [WorkflowRunnerService],
  providers: [
    WorkflowAppsService,
    TasksService, //For workflow apps service
    ConnectionsService, //For workflow apps service
    ExecutionsService, //For workflow apps service
    WorkflowRunnerService,
    KnowledgeService, //Because TaskService uses it
  ],
})
export class WorkflowRunnerModule {}
