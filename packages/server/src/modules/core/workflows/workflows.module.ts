import { Module } from '@nestjs/common';

import { ConnectionsService } from '../connections/connections.service';
import { ExecutionsService } from '../executions/executions.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { TasksService } from '../tasks/tasks.service';
import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';

import {
  ProjectWorkflowsController,
  WorkflowsController,
} from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({
  imports: [],
  exports: [WorkflowsService],
  controllers: [WorkflowsController, ProjectWorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowAppsService,
    TasksService, //For workflow apps service
    ConnectionsService, //For workflow apps service
    ExecutionsService, //For workflow apps service
    KnowledgeService, //Because TaskService uses it
  ],
})
export class WorkflowsModule {}
