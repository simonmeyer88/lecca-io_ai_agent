import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController, ProjectAgentsController } from './agents.controller';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';
import { TasksService } from '../tasks/tasks.service';
import { ConnectionsService } from '../connections/connections.service';
import { ExecutionsService } from '../executions/executions.service';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Module({
  controllers: [AgentsController, ProjectAgentsController],
  exports: [AgentsService],
  providers: [
    AgentsService,
    WorkflowsService,
    WorkflowAppsService,
    ConnectionsService, //For workflow apps service
    ExecutionsService, //For workflow apps service
    TasksService, //For workflow apps service
    KnowledgeService, //Because TaskService uses it
  ],
})
export class AgentsModule {}
