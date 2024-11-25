import { Module } from '@nestjs/common';
import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TasksService } from '@/modules/core/tasks/tasks.service';
import { StripeService } from '@/modules/commercial/stripe/stripe.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';

@Module({
  exports: [WebhookService],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    StripeService,
    WorkflowAppsService,
    TasksService, //workflow apps
    ConnectionsService, //workflow apps
    ExecutionsService, //workflow apps
    KnowledgeService, //Because TaskService uses it
  ],
})
export class WebhookModule {}
