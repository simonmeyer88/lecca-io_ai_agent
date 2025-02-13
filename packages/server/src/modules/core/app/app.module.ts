import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { BelongsToGuard } from '../../../guards/belongs-to.guard';
import { CommercialKeyGuard } from '../../../guards/commercial.guard';
import { JwtAuthGuard } from '../../../guards/jwt.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { JsonBodyMiddleware } from '../../../middleware/json-body.middleware';
import { JsonUrlEncodedMiddleware } from '../../../middleware/json-url-encoded.middleware';
import { RawBodyMiddleware } from '../../../middleware/raw-body.middleware';
import { BillingModule } from '../../commercial/billing/billing.module';
import { WorkspaceInvitationsModule } from '../../commercial/workspace-invitations/workspace-invitations.module';
import { AiProviderModule } from '../../global/ai-provider/ai-provider.module';
import { CreditsModule } from '../../global/credits/credits.module';
import { CryptoModule } from '../../global/crypto/crypto.module';
import { FileHandlerModule } from '../../global/file/file-handler.module';
import { HttpModule } from '../../global/http/http.module';
import { MailModule } from '../../global/mail/mail.module';
import { NotificationsModule } from '../../global/notifications/notifications.module';
import { OperationsModule } from '../../global/operations/operations.module';
import { PineconeModule } from '../../global/pinecone/pinecone.module';
import { PrismaModule } from '../../global/prisma/prisma.module';
import { S3ManagerModule } from '../../global/s3/s3.module';
import { AgentsModule } from '../agents/agents.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectionsModule } from '../connections/connections.module';
import { DevModule } from '../dev/dev.module';
import { DiscoveryModule } from '../discovery/discovery.module';
import { ExecutionsModule } from '../executions/executions.module';
import { HealthModule } from '../health/health.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { PollerModule } from '../poller/poller.module';
import { PollerModule as AppPollerModule } from '../poller/poller.module';
import { ProjectInvitationsModule } from '../project-invitations/project-invitations.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { VariablesModule } from '../variables/variables.module';
import { WebhookModule } from '../webhook/webhook.module';
import { WorkflowAppsModule } from '../workflow-apps/workflow-apps.module';
import { WorkflowRunnerModule } from '../workflow-runner/workflow-runner.module';
import { WorkflowTemplatesModule } from '../workflow-templates/workflow-templates.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { WorkspacePreferencesModule } from '../workspace-preferences/workspace-preferences.module';
import { WorkspaceUserPreferencesModule } from '../workspace-user-preferences/workspace-user-preferences.module';
import { WorkspaceUsersModule } from '../workspace-users/workspace-users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const rawBodyParsingRoutes: Array<RouteInfo> = [
  {
    path: '/webhooks/*',
    method: RequestMethod.ALL,
  },
];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 120,
          ttl: 60 * 1000,
        },
      ],
    }),
    OperationsModule,
    AuthModule,
    WorkspacesModule,
    UsersModule,
    WorkspaceUsersModule,
    EventEmitterModule.forRoot(),
    WorkspaceUserPreferencesModule,
    WorkspacePreferencesModule,
    NotificationsModule,
    DiscoveryModule,
    ProjectsModule,
    WorkflowsModule,
    ExecutionsModule,
    WorkflowAppsModule,
    WorkflowRunnerModule,
    PollerModule,
    AppPollerModule,
    VariablesModule,
    S3ManagerModule,
    ProjectInvitationsModule,
    ConnectionsModule,
    HealthModule,
    FileHandlerModule,
    WebhookModule,
    ScheduleModule.forRoot(),
    AgentsModule,
    TasksModule,
    BillingModule,
    PineconeModule,
    KnowledgeModule,
    WorkflowTemplatesModule,
    HttpModule,
    PrismaModule,
    MailModule,
    CryptoModule,
    CreditsModule,
    AiProviderModule,
    DevModule,
    WorkspaceInvitationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CommercialKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BelongsToGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      //For webhook raw body verification
      .apply(RawBodyMiddleware)
      .forRoutes(...rawBodyParsingRoutes)
      //For json body parsing (used in most routes)
      .apply(JsonBodyMiddleware)
      .exclude(...rawBodyParsingRoutes)
      .forRoutes('*')
      //Needed for google login
      .apply(JsonUrlEncodedMiddleware)
      .exclude(...rawBodyParsingRoutes)
      .forRoutes('*');
  }
}
