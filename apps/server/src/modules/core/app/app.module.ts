import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WorkspaceUserPreferencesModule } from '../workspace-user-preferences/workspace-user-preferences.module';
import { WorkspacePreferencesModule } from '../workspace-preferences/workspace-preferences.module';
import { NotificationsModule } from '../../global/notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { ExecutionsModule } from '../executions/executions.module';
import { VariablesModule } from '../variables/variables.module';
import { ProjectInvitationsModule } from '../project-invitations/project-invitations.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { S3ManagerModule } from '../../global/s3/s3.module';
import { UsersModule } from '../users/users.module';
import { WorkspaceUsersModule } from '../workspace-users/workspace-users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ConnectionsModule } from '../connections/connections.module';
import { HealthModule } from '../health/health.module';
import { WorkflowAppsModule } from '../workflow-apps/workflow-apps.module';
import { WorkflowRunnerModule } from '../workflow-runner/workflow-runner.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhookModule } from '../webhook/webhook.module';
import { RawBodyMiddleware } from '../../../middleware/raw-body.middleware';
import { RouteInfo } from '@nestjs/common/interfaces';
import { JsonBodyMiddleware } from '../../../middleware/json-body.middleware';
import { JsonUrlEncodedMiddleware } from '../../../middleware/json-url-encoded.middleware';
import { AgentsModule } from '../agents/agents.module';
import { TasksModule } from '../tasks/tasks.module';
import { BillingModule } from '../../commercial/billing/billing.module';
import { PollerModule } from '../poller/poller.module';
import { PollerModule as AppPollerModule } from '../poller/poller.module';
import { PineconeModule } from '../../global/pinecone/pinecone.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { OperationsModule } from '../../global/operations/operations.module';
import { WorkflowTemplatesModule } from '../workflow-templates/workflow-templates.module';
import { FileHandlerModule } from '../../global/file/file-handler.module';
import { HttpModule } from '../../global/http/http.module';
import { PrismaModule } from '../../global/prisma/prisma.module';
import { MailModule } from '../../global/mail/mail.module';
import { CryptoModule } from '../../global/crypto/crypto.module';
import { DiscoveryModule } from '../discovery/discovery.module';
import { CreditsModule } from '../../global/credits/credits.module';
import { AiProviderModule } from '../../global/ai-provider/ai-provider.module';
import { DevModule } from '../dev/dev.module';
import { WorkspaceInvitationsModule } from '@/modules/commercial/workspace-invitations/workspace-invitations.module';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import { RolesGuard } from '@/guards/roles.guard';
import { BelongsToGuard } from '@/guards/belongs-to.guard';
import { CommercialKeyGuard } from '@/guards/commercial.guard';

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
          ttl: 60,
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
